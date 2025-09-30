// useRecordScreenLogic.ts
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, useColorScheme } from 'react-native';
import { useApp } from '../contexts/AppContext';
import { SupabaseService } from '../services/SupabaseService';
import { RecordingStatus } from '../types';
import { usePlayback } from './usePlayback'; // NEW hook shape
import { useRecording } from './useRecording'; // NEW hook shape

export type RecordingStep = 'ready' | 'recording' | 'stopped' | 'uploading';

interface UseRecordScreenLogicReturn {
  step: RecordingStep;
  isUploading: boolean;
  progressText: string;
  currentLine: { id: string; text: string } | undefined;
  buttonText: string;
  buttonColor: string;
  handleRecordPress: () => Promise<void>;
  handleCancel: () => Promise<void>;
  handleValidate: () => Promise<void>;
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
  const [isUploading, setIsUploading] = useState(false);
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

        const updatedRecordings = {
          ...session.recordings,
          [currentLine.id]: {
            lineId: currentLine.id,
            fileUri: result.uri,
            durationSec: result.durationSec,
            status: 'recorded' as RecordingStatus,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ext: result.ext, // platform-correct extension
          },
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
    async (validatedStatusUpdate: Partial<{ remote: any }>) => {
      if (!session?.lines?.length || !currentLine) return;

      const updatedRecordings = {
        ...session.recordings,
        [currentLine.id]: {
          ...session.recordings[currentLine.id],
          status: 'validated' as RecordingStatus,
          updatedAt: Date.now(),
          ...validatedStatusUpdate,
        },
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

  const handleValidateLocally = useCallback(async () => {
    await advanceToNextLine({});
  }, [advanceToNextLine]);

  const handleValidate = useCallback(async () => {
    if (!session || !currentLine || !lastRecording?.uri || !appState) return;

    setIsUploading(true);
    setStep('uploading');
    try {
      // Build a cross-platform file part for FormData
      let file: File | { uri: string; name: string; type: string };
      if (Platform.OS === 'web') {
        const response = await fetch(lastRecording.uri);
        const blob = await response.blob();
        file = new File([blob], lastRecording.filename, { type: lastRecording.mime });
      } else {
        // React Native expects a descriptor with a file URI
        file = {
          uri: lastRecording.uri,
          name: lastRecording.filename,
          type: lastRecording.mime,
        };
      }

      const uploadResponse = await SupabaseService.uploadRecording({
        file,
        deviceId: appState.device.deviceId,
        speakerName: appState.speaker.displayName,
        lineId: currentLine.id,
        lineIndex: session.currentIndex,
        lineText: currentLine.text,
        durationSec: lastRecording.durationSec,
        status: 'validated',
        language: session.language,
      });

      await advanceToNextLine({
        remote: {
          storageKey: uploadResponse.storageKey,
          publicUrl: uploadResponse.publicUrl,
          speakerId: uploadResponse.speakerId,
          utteranceId: uploadResponse.utteranceId,
          recordingId: uploadResponse.recordingId,
        },
      });
    } catch (error) {
      console.error('Error validating recording:', error);
      Alert.alert(
        'Upload Failed',
        'Failed to upload recording to server. You can try again or continue with local storage only.',
        [
          { text: 'Try Again', onPress: () => handleValidate() },
          { text: 'Continue Locally', onPress: handleValidateLocally },
        ]
      );
      setStep('stopped');
    } finally {
      setIsUploading(false);
    }
  }, [session, currentLine, lastRecording, appState, advanceToNextLine, handleValidateLocally]);

  const buttonText = useMemo(() => {
    switch (step) {
      case 'ready':
        return 'Start Recording';
      case 'recording':
        return `Recording... ${durationSec.toFixed(1)}s`;
      case 'stopped':
        return 'Re-record';
      case 'uploading':
        return 'Uploading...';
      default:
        return 'Start Recording';
    }
  }, [step, durationSec]);

  const buttonColor = useMemo(() => {
    switch (step) {
      case 'recording':
        return '#ff4444';
      case 'uploading':
        return '#666';
      default:
        return '#007aff';
    }
  }, [step]);

  return {
    step,
    isUploading,
    progressText,
    currentLine,
    buttonText,
    buttonColor,
    handleRecordPress,
    handleCancel,
    handleValidate,
    handleTogglePlayback,
    isPlaying,
    dark,
    appState,
    session,
  };
}
