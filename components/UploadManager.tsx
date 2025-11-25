import type { NetworkState } from 'expo-network';
import * as Network from 'expo-network';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useApp } from '../contexts/AppContext';
import { SupabaseService } from '../services/SupabaseService';
import { ActiveSession, RecordingItem } from '../types';

const RETRY_INTERVAL_MS = 60_000;

const useOnlineStatus = () => {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    let mounted = true;
    let subscription: ReturnType<typeof Network.addNetworkStateListener> | undefined;

    const resolveState = (state: NetworkState | null) => {
      if (!mounted || !state) {
        return;
      }
      const reachable = state.isInternetReachable;
      const connected = state.isConnected;
      setOnline(Boolean(connected && (reachable === null || reachable === undefined || reachable)));
    };

    (async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        resolveState(state);
      } catch (error) {
        console.warn('Network state check failed:', error);
        if (mounted) setOnline(false);
      }

      subscription = Network.addNetworkStateListener((state: NetworkState) => resolveState(state));
    })();

    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  return online;
};

const findNextPending = (session: ActiveSession): string | null => {
  const now = Date.now();
  for (const line of session.lines) {
    const recording = session.recordings[line.id];
    if (!recording) continue;
    if (recording.status !== 'saved') continue;
    if (!recording.fileUri) continue;
    if (recording.lastUploadAttempt && now - recording.lastUploadAttempt < RETRY_INTERVAL_MS) continue;
    return line.id;
  }
  return null;
};

export function UploadManager() {
  const { appState, updateSession } = useApp();
  const isOnline = useOnlineStatus();
  const [isProcessing, setIsProcessing] = useState(false);

  const sessionRef = useRef(appState?.session ?? null);
  const deviceIdRef = useRef(appState?.device.deviceId ?? '');

  sessionRef.current = appState?.session ?? null;
  deviceIdRef.current = appState?.device.deviceId ?? '';

  const updateRecording = useCallback(
    async (lineId: string, apply: (current: RecordingItem) => RecordingItem) => {
      const currentSession = sessionRef.current;
      if (!currentSession) return;
      const currentRecording = currentSession.recordings[lineId];
      if (!currentRecording) return;

      const nextRecording = apply(currentRecording);
      const nextSession: ActiveSession = {
        ...currentSession,
        recordings: {
          ...currentSession.recordings,
          [lineId]: nextRecording,
        },
        lastVisitedAt: Date.now(),
      };

      await updateSession(nextSession);
    },
    [updateSession]
  );

  const performUpload = useCallback(
    async (lineId: string) => {
      const session = sessionRef.current;
      if (!session) return;

      let recording = session.recordings[lineId];
      if (!recording) return;

      const line = session.lines.find((item) => item.id === lineId);
      if (!line) {
        await updateRecording(lineId, (current) => ({
          ...current,
          uploadError: 'Missing line metadata for upload.',
          lastUploadAttempt: Date.now(),
        }));
        return;
      }

      const attemptTime = Date.now();

      const fileUri = recording.fileUri;

      if (!fileUri) {
        await updateRecording(lineId, (current) => ({
          ...current,
          uploadError: 'Audio file missing on device.',
          lastUploadAttempt: attemptTime,
        }));
        return;
      }

      const age = session.speaker.age;
      const gender = (session.speaker.gender ?? '').trim();
      const projectId = (session.speaker.projectId ?? '').trim();

      if (!age || age <= 0 || !gender || !projectId) {
        await updateRecording(lineId, (current) => ({
          ...current,
          uploadError: 'Profile incomplete. Update age, gender, and project ID to sync.',
          lastUploadAttempt: attemptTime,
        }));
        return;
      }

      const filename = recording.filename || `recording-${line.index}${recording.ext || '.m4a'}`;
      const mime = recording.mime || 'audio/mp4';
      let filePart: File | { uri: string; name: string; type: string };

      if (
        recording.remote?.recordingId &&
        recording.remote?.utteranceId &&
        recording.remote?.speakerId
      ) {
        try {
          await SupabaseService.deleteRecording({
            recordingId: recording.remote.recordingId,
            utteranceId: recording.remote.utteranceId,
            speakerId: recording.remote.speakerId,
          });

          await updateRecording(lineId, (current) => ({
            ...current,
            remote: undefined,
            uploadError: null,
            lastUploadAttempt: attemptTime,
          }));

          recording = {
            ...recording,
            remote: undefined,
            uploadError: null,
            lastUploadAttempt: attemptTime,
          };
        } catch (error) {
          console.error('Failed to delete existing remote recording:', error);
          const message = error instanceof Error ? error.message : 'Unable to delete existing upload.';
          await updateRecording(lineId, (current) => ({
            ...current,
            uploadError: message,
            lastUploadAttempt: attemptTime,
          }));
          return;
        }
      }

      try {
        if (Platform.OS === 'web') {
          const response = await fetch(fileUri);
          if (!response.ok) {
            throw new Error(`Failed to read recording blob: ${response.status}`);
          }
          const blob = await response.blob();
          filePart = new File([blob], filename, { type: mime });
        } else {
          filePart = {
            uri: fileUri,
            name: filename,
            type: mime,
          };
        }
      } catch (error) {
        console.error('Local file fetch failed:', error);
        await updateRecording(lineId, (current) => ({
          ...current,
          uploadError: 'Unable to access audio file for upload.',
          lastUploadAttempt: attemptTime,
        }));
        return;
      }

      try {
        const uploadResponse = await SupabaseService.uploadRecording({
          file: filePart,
          deviceId: deviceIdRef.current || session.speaker.id,
          speakerName: session.speaker.displayName,
          speakerAge: age,
          speakerGender: gender,
          projectId: projectId,
          lineId: line.id,
          lineIndex: line.index,
          lineText: line.text,
          durationSec: recording.durationSec,
          language: session.language,
        });

        await updateRecording(lineId, (current) => ({
          ...current,
          status: 'uploaded',
          remote: uploadResponse,
          updatedAt: Date.now(),
          uploadError: null,
          lastUploadAttempt: attemptTime,
        }));
      } catch (error) {
        console.error('Background upload failed:', error);
        const message = error instanceof Error ? error.message : 'Unknown upload error.';
        await updateRecording(lineId, (current) => ({
          ...current,
          uploadError: message,
          lastUploadAttempt: attemptTime,
        }));
      }
    },
    [updateRecording]
  );

  useEffect(() => {
    if (!isOnline) return;
    if (isProcessing) return;

    const session = sessionRef.current;
    if (!session) return;

    const nextLineId = findNextPending(session);
    if (!nextLineId) return;

    let cancelled = false;

    const run = async () => {
      setIsProcessing(true);
      try {
        await performUpload(nextLineId);
      } finally {
        if (!cancelled) {
          setIsProcessing(false);
        }
      }
    };

    run().catch((error) => {
      console.error('Upload manager error:', error);
      setIsProcessing(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isOnline, isProcessing, performUpload, appState?.session]);

  return null;
}
