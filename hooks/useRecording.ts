// useRecording.ts
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useCallback, useEffect } from 'react';
import { Alert, Platform } from 'react-native';

// Modern FileSystem API
import { Directory, File, Paths } from 'expo-file-system';

type StopResult = {
  uri: string;
  durationSec: number;
  filename: string;
  mime: string;
  ext: string;
};

function platformFormat() {
  // HIGH_QUALITY preset:
  // iOS/Android => .m4a (audio/mp4), Web => .webm (audio/webm)
  if (Platform.OS === 'web') return { ext: '.webm', mime: 'audio/webm' };
  return { ext: '.m4a', mime: 'audio/mp4' };
}

export function useRecording() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const rec = useAudioRecorderState(recorder, 100); // exposes isRecording, durationMillis, url

  // Ask mic permission + set audio mode once
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert(
          'Microphone Permission Required',
          'Enable microphone access in Settings to record audio.'
        );
      }
    })().catch(console.error);
  }, []);

  const start = useCallback(async () => {
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  }, [recorder]);

  const stop = useCallback(async (): Promise<StopResult | null> => {
    if (rec.isRecording) {
      await recorder.stop();
    }
    const tmpUri = recorder.uri;
    if (!tmpUri) return null;

    const { ext, mime } = platformFormat();
    const filename = `rec-${Date.now()}${ext}`;

    // On web, keep the blob URL; FileSystem modern API is native-only.
    if (Platform.OS === 'web') {
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      return {
        uri: tmpUri,
        durationSec: (rec.durationMillis ?? 0) / 1000,
        filename,
        mime,
        ext,
      };
    };

    const tmpFile = new File(tmpUri);
    const recordingsDir = new Directory(Paths.document, 'recordings');
    if (!recordingsDir.exists) recordingsDir.create();

    const dest = new File(recordingsDir, filename);
    tmpFile.move(dest); // rename + move atomically (updates tmpFile.uri to new location)

    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

    return {
      uri: dest.uri,
      durationSec: (rec.durationMillis ?? 0) / 1000,
      filename,
      mime,
      ext,
    };
  }, [rec.isRecording, rec.durationMillis, recorder]);

  const cancel = useCallback(async () => {
    try {
      if (rec.isRecording) await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      return true;
    } catch {
      return false;
    }
  }, [rec.isRecording, recorder]);

  return {
    isRecording: rec.isRecording,
    durationSec: (rec.durationMillis ?? 0) / 1000,
    start,
    stop,
    cancel,
  };
}
