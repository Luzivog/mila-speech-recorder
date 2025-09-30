import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { ActiveSession, AppState, DeviceProfile, SpeakerProfile } from '../types';

const APP_STATE_KEY = '@mila_speech_recorder_app_state';

interface AppContextType {
  appState: AppState | null;
  isLoading: boolean;
  updateDevice: (device: DeviceProfile) => Promise<void>;
  updateSession: (session: ActiveSession | null) => Promise<void>;
  clearSession: () => Promise<void>;
}

const ensureSpeaker = (speaker?: Partial<SpeakerProfile> | null): SpeakerProfile => {
  const now = Date.now();
  return {
    id: speaker?.id ?? uuidv4(),
    displayName: speaker?.displayName ?? '',
    localeHint: speaker?.localeHint,
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
  return {
    ...session,
    speaker: ensureSpeaker(speakerSource),
  };
};

const AppContext = createContext<AppContextType | undefined>(undefined);

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
        const parsedState = JSON.parse(stored) as AppState & { speaker?: SpeakerProfile | null };

        // Ensure device exists, create if not
        if (!parsedState.device) {
          parsedState.device = {
            deviceId: uuidv4(),
            createdAt: Date.now(),
          };
        }

        const normalizedSession = ensureSession(parsedState.session, parsedState.speaker);
        const nextState: AppState = {
          device: parsedState.device,
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
    const newState = { ...appState, device };
    setAppState(newState);
    await saveAppState(newState);
  };

  const updateSession = async (session: ActiveSession | null) => {
    if (!appState) return;
    const normalizedSession = ensureSession(session, appState.session?.speaker);
    const newState = { ...appState, session: normalizedSession };
    setAppState(newState);
    await saveAppState(newState);
  };

  const clearSession = async () => {
    if (!appState) return;
    const newState = { ...appState, session: null };
    setAppState(newState);
    await saveAppState(newState);
  };

  const value: AppContextType = {
    appState,
    isLoading,
    updateDevice,
    updateSession,
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