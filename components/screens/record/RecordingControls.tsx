import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RecordButton } from './RecordButton';
import { StoppedControls } from './StoppedControls';
import { UploadingIndicator } from './UploadingIndicator';

type RecordingStep = 'ready' | 'recording' | 'stopped' | 'uploading';

interface RecordingControlsProps {
  step: RecordingStep;
  buttonText: string;
  buttonColor: string;
  isUploading: boolean;
  onRecordPress: () => void;
  onCancel: () => void;
  onValidate: () => void;
  onTogglePlayback: () => void;
  isPlaying: boolean;
}

export function RecordingControls({
  step,
  buttonText,
  buttonColor,
  isUploading,
  onRecordPress,
  onCancel,
  onValidate,
  onTogglePlayback,
  isPlaying,
}: RecordingControlsProps) {
  return (
    <View style={styles.wrapper}>
      {(step === 'ready' || step === 'recording') && (
        <RecordButton
          text={buttonText}
          backgroundColor={buttonColor}
          onPress={onRecordPress}
          isRecording={step === 'recording'}
        />
      )}
      {step === 'stopped' && (
        <View style={styles.stoppedWrap}>
          <StoppedControls
            onCancel={onCancel}
            onTogglePlayback={onTogglePlayback}
            onValidate={onValidate}
            isUploading={isUploading}
            isPlaying={isPlaying}
          />
        </View>
      )}
      {step === 'uploading' && (
        <View style={{ marginTop: 16 }}>
          <UploadingIndicator />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stoppedWrap: {
    width: '100%',
  },
});