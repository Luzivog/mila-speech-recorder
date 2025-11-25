import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { ActiveSession, AppState, DeviceProfile, RecordingItem, SpeakerProfile, UserProfile } from '../types';

const APP_STATE_KEY = '@mila_speech_recorder_app_state';

interface AppContextType {
  appState: AppState | null;
  isLoading: boolean;
  updateDevice: (device: DeviceProfile) => Promise<void>;
  updateSession: (session: ActiveSession | null) => Promise<void>;
  updateProfile: (profile: UserProfile | null) => Promise<void>;
  clearSession: () => Promise<void>;
}

const ensureSpeaker = (speaker?: Partial<SpeakerProfile> | null): SpeakerProfile => {
  const now = Date.now();
  const parseAge = (value: unknown): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      const bounded = Math.max(0, Math.trunc(value));
      return Math.min(120, bounded);
    }
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      if (Number.isFinite(parsed)) {
        const bounded = Math.max(0, parsed);
        return Math.min(120, bounded);
      }
    }
    return 0;
  };

  const genderValue = typeof speaker?.gender === 'string' ? speaker.gender.trim() : '';
  const projectIdValue = typeof speaker?.projectId === 'string' ? speaker.projectId.trim() : '';

  return {
    id: speaker?.id ?? uuidv4(),
    displayName: speaker?.displayName ?? '',
    localeHint: speaker?.localeHint,
    age: parseAge(speaker?.age),
    gender: genderValue,
    projectId: projectIdValue,
    createdAt: speaker?.createdAt ?? now,
    updatedAt: speaker?.updatedAt ?? now,
  };
};

const ensureSession = (
  session: ActiveSession | null | undefined,
  fallbackSpeaker?: SpeakerProfile | null
): ActiveSession | null => {
  if (!session) return null;
  const speakerSource = session.speaker ?? fallbackSpeaker ?? null;
  const normalizedRecordings: Record<string, RecordingItem> = Object.fromEntries(
    Object.entries(session.recordings ?? {}).map(([key, value]) => {
      const ext = value?.ext?.startsWith('.') ? value.ext : value?.ext ? `.${value.ext}` : '.m4a';
      const filename = value?.filename && value.filename.trim().length > 0
        ? value.filename
        : `rec-${value?.lineId ?? key}${ext}`;
      const mime = value?.mime && value.mime.trim().length > 0
        ? value.mime
        : ext === '.webm'
          ? 'audio/webm'
          : 'audio/mp4';

      const normalized: RecordingItem = {
        ...value,
        ext,
        filename,
        mime,
        uploadError: value?.uploadError ?? null,
        lastUploadAttempt: value?.lastUploadAttempt ?? null,
      } as RecordingItem;

      return [key, normalized];
    })
  );
  return {
    ...session,
    speaker: ensureSpeaker(speakerSource),
    recordings: normalizedRecordings,
  };
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const ensureProfile = (
  profile: UserProfile | null | undefined,
  fallbackSpeaker?: SpeakerProfile | null,
  fallbackLanguage?: string | null
): UserProfile | null => {
  const speakerSource = profile?.speaker ?? fallbackSpeaker ?? null;
  const language = profile?.language ?? fallbackLanguage ?? '';
  if (!speakerSource && !language) {
    return null;
  }
  return {
    speaker: ensureSpeaker(speakerSource),
    language,
  };
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveAppState = async (state: AppState) => {
    try {
      await AsyncStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving app state:', error);
    }
  };

  const loadAppState = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(APP_STATE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored) as Partial<AppState> & {
          speaker?: SpeakerProfile | null;
          language?: string | null;
        };

        // Ensure device exists, create if not
        if (!parsedState.device) {
          parsedState.device = {
            deviceId: uuidv4(),
            createdAt: Date.now(),
          };
        }

        const normalizedProfile = ensureProfile(
          parsedState.profile ?? null,
          parsedState.session?.speaker ?? parsedState.speaker ?? null,
          parsedState.profile?.language ?? parsedState.session?.language ?? parsedState.language ?? ''
        );

        const normalizedSession = ensureSession(
          parsedState.session ?? null,
          normalizedProfile?.speaker ?? parsedState.speaker ?? null
        );

        const nextState: AppState = {
          device: parsedState.device,
          profile: normalizedProfile,
          session: normalizedSession,
        };

        setAppState(nextState);
        await saveAppState(nextState);
      } else {
        // Create initial state
        const initialState: AppState = {
          device: {
            deviceId: uuidv4(),
            createdAt: Date.now(),
          },
          profile: null,
          session: null,
        };
        setAppState(initialState);
        await saveAppState(initialState);
      }
    } catch (error) {
      console.error('Error loading app state:', error);
      // Create default state on error
      const defaultState: AppState = {
        device: {
          deviceId: uuidv4(),
          createdAt: Date.now(),
        },
        profile: null,
        session: null,
      };
      setAppState(defaultState);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    loadAppState();
  }, [loadAppState]);

  const updateDevice = async (device: DeviceProfile) => {
    if (!appState) return;
    const newState: AppState = { ...appState, device };
    setAppState(newState);
    await saveAppState(newState);
  };

  const updateSession = async (session: ActiveSession | null) => {
    if (!appState) return;
    const normalizedSession = ensureSession(
      session,
      session?.speaker ?? appState.profile?.speaker ?? appState.session?.speaker ?? null
    );

    const nextProfile = normalizedSession
      ? ensureProfile(
          { speaker: normalizedSession.speaker, language: normalizedSession.language },
          normalizedSession.speaker,
          normalizedSession.language
        )
      : appState.profile;

    const newState: AppState = { ...appState, session: normalizedSession, profile: nextProfile };
    setAppState(newState);
    await saveAppState(newState);
  };

  const updateProfile = async (profile: UserProfile | null) => {
    if (!appState) return;

    const normalizedProfile = ensureProfile(
      profile,
      profile?.speaker ?? appState.profile?.speaker ?? appState.session?.speaker ?? null,
      profile?.language ?? appState.profile?.language ?? appState.session?.language ?? ''
    );

    let session = appState.session;
    if (normalizedProfile && session) {
      session = ensureSession(
        {
          ...session,
          speaker: normalizedProfile.speaker,
          language: normalizedProfile.language,
        },
        normalizedProfile.speaker
      );
    }

    const newState: AppState = {
      ...appState,
      profile: normalizedProfile,
      session,
    };

    setAppState(newState);
    await saveAppState(newState);
  };

  const clearSession = async () => {
    if (!appState) return;
    const newState: AppState = { ...appState, session: null };
    setAppState(newState);
    await saveAppState(newState);
  };

  const value: AppContextType = {
    appState,
    isLoading,
    updateDevice,
    updateSession,
    updateProfile,
    clearSession,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}