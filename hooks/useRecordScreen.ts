// useRecordScreenLogic.ts
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, useColorScheme } from 'react-native';
import { useApp } from '../contexts/AppContext';
import { RecordingItem } from '../types';
import { usePlayback } from './usePlayback'; // NEW hook shape
import { useRecording } from './useRecording'; // NEW hook shape

export type RecordingStep = 'ready' | 'recording' | 'stopped';

interface UseRecordScreenLogicReturn {
  step: RecordingStep;
  isSaving: boolean;
  progressText: string;
  currentLine: { id: string; text: string } | undefined;
  buttonText: string;
  buttonColor: string;
  handleRecordPress: () => Promise<void>;
  handleCancel: () => Promise<void>;
  handleSave: () => Promise<void>;
  handleTogglePlayback: () => Promise<void>;
  isPlaying: boolean;
  dark: boolean;
  appState: ReturnType<typeof useApp>['appState'];
  session: import('../types').ActiveSession | null | undefined;
}

type LastRecording = {
  uri: string;
  durationSec: number;
  filename: string;
  mime: string;
  ext: string;
} | null;

export function useRecordScreenLogic(): UseRecordScreenLogicReturn {
  const { appState, updateSession } = useApp();
  const session = appState?.session ?? null;

  // NEW hooks
  const { durationSec, start, stop, cancel } = useRecording();
  const [lastRecording, setLastRecording] = useState<LastRecording>(null);
  const { isPlaying, play, pause, stop: stopPlayback } = usePlayback(lastRecording?.uri ?? null);

  const [step, setStep] = useState<RecordingStep>('ready');
  const [isSaving, setIsSaving] = useState(false);
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  // Safely compute currentLine (session can be null or lines empty while booting)
  const currentLine = useMemo(() => {
    if (!session?.lines?.length) return undefined;
    const idx = Math.min(Math.max(session.currentIndex ?? 0, 0), session.lines.length - 1);
    return session.lines[idx];
  }, [session?.currentIndex, session?.lines]);

  const progressText = useMemo(() => {
    if (!session?.lines?.length) return 'No text loaded';
    return `Line ${(session.currentIndex ?? 0) + 1} of ${session.lines.length}`;
  }, [session?.currentIndex, session?.lines]);

  // Reset step when line changes
  useEffect(() => {
    setStep('ready');
  }, [session?.currentIndex]);

  const handleRecordPress = useCallback(async () => {
    // Treat 'stopped' like 'ready' so user can re-record
    if (step === 'ready' || step === 'stopped') {
      try {
        if (isPlaying) await stopPlayback();
        await start();
        setStep('recording');
        setIsSaving(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {
        console.error('Error starting recording:', e);
        Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
      }
      return;
    }

    if (step === 'recording') {
      try {
        const result = await stop();
        if (!result) return;

        // Keep a local ref for playback/upload
        setLastRecording(result);

        // If session or currentLine isn’t ready, stop here but don’t crash
        if (!session || !currentLine) {
          setStep('stopped');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          return;
        }

        const existingRecording = session.recordings[currentLine.id] as RecordingItem | undefined;

        const newRecording: RecordingItem = {
          ...existingRecording,
          lineId: currentLine.id,
          fileUri: result.uri,
          durationSec: result.durationSec,
          status: 'recorded',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ext: result.ext, // platform-correct extension
          filename: result.filename,
          mime: result.mime,
          uploadError: null,
          lastUploadAttempt: null,
        };

        const updatedRecordings = {
          ...session.recordings,
          [currentLine.id]: newRecording,
        };
        const updatedSession = {
          ...session,
          recordings: updatedRecordings,
          lastVisitedAt: Date.now(),
        };
        await updateSession(updatedSession);

        setStep('stopped');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        console.error('Error stopping recording:', e);
        Alert.alert('Recording Error', 'Failed to stop recording. Please try again.');
      }
    }
  }, [step, isPlaying, stopPlayback, start, stop, session, currentLine, updateSession]);

  const handleCancel = useCallback(async () => {
    await cancel();
    setLastRecording(null);
    setStep('ready');
    setIsSaving(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [cancel]);

  const handleTogglePlayback = useCallback(async () => {
    if (!lastRecording?.uri) return;
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [isPlaying, play, pause, lastRecording?.uri]);

  const advanceToNextLine = useCallback(
    async () => {
      if (!session?.lines?.length || !currentLine) return;

      const existing = session.recordings[currentLine.id] as RecordingItem | undefined;
      if (!existing) return;

      const nextRecording: RecordingItem = {
        ...existing,
        status: 'saved',
        updatedAt: Date.now(),
        uploadError: null,
        lastUploadAttempt: null,
      };

      const updatedRecordings = {
        ...session.recordings,
        [currentLine.id]: nextRecording,
      };

      let nextIndex = (session.currentIndex ?? 0) + 1;
      if (nextIndex >= session.lines.length) {
        // Stay on last line for now (future: navigate to completion screen)
        nextIndex = session.currentIndex ?? 0;
      }

      const updatedSession = {
        ...session,
        currentIndex: nextIndex,
        recordings: updatedRecordings,
        lastVisitedAt: Date.now(),
      };
      await updateSession(updatedSession);
      setStep('ready');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [session, currentLine, updateSession]
  );

  const handleSave = useCallback(async () => {
    if (!session || !currentLine || !lastRecording?.uri) return;

    setIsSaving(true);
    try {
      await advanceToNextLine();
    } catch (error) {
      console.error('Error saving recording locally:', error);
      Alert.alert('Save Failed', 'Unable to store this recording locally right now. Please try again.');
      setStep('stopped');
    } finally {
      setIsSaving(false);
    }
  }, [session, currentLine, lastRecording, advanceToNextLine]);

  const buttonText = useMemo(() => {
    switch (step) {
      case 'ready':
        return 'Start Recording';
      case 'recording':
        return `Recording... ${durationSec.toFixed(1)}s`;
      case 'stopped':
        return 'Re-record';
      default:
        return 'Start Recording';
    }
  }, [step, durationSec]);

  const buttonColor = useMemo(() => {
    switch (step) {
      case 'recording':
        return '#ff4444';
      default:
        return '#007aff';
    }
  }, [step]);

  return {
    step,
    isSaving,
    progressText,
    currentLine,
    buttonText,
    buttonColor,
    handleRecordPress,
    handleCancel,
    handleSave,
    handleTogglePlayback,
    isPlaying,
    dark,
    appState,
    session,
  };
}
