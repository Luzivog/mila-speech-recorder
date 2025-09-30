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
  updateSpeaker: (speaker: SpeakerProfile) => Promise<void>;
  updateSession: (session: ActiveSession | null) => Promise<void>;
  clearSession: () => Promise<void>;
}

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
        const parsedState: AppState = JSON.parse(stored);

        // Ensure device exists, create if not
        if (!parsedState.device) {
          parsedState.device = {
            deviceId: uuidv4(),
            createdAt: Date.now(),
          };
        }

        // Ensure speaker exists
        if (!parsedState.speaker) {
          parsedState.speaker = {
            id: uuidv4(),
            displayName: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        }

        // Do not coerce language to empty string; keep as-is so UI can enforce required value
        setAppState(parsedState);
      } else {
        // Create initial state
        const initialState: AppState = {
          device: {
            deviceId: uuidv4(),
            createdAt: Date.now(),
          },
          speaker: {
            id: uuidv4(),
            displayName: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
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
        speaker: {
          id: uuidv4(),
          displayName: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
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

  const updateSpeaker = async (speaker: SpeakerProfile) => {
    if (!appState) return;
    const newState = { ...appState, speaker };
    setAppState(newState);
    await saveAppState(newState);
  };

  const updateSession = async (session: ActiveSession | null) => {
    if (!appState) return;
    const newState = { ...appState, session };
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
    updateSpeaker,
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