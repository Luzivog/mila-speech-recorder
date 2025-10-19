import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RecordButton } from './RecordButton';
import { StoppedControls } from './StoppedControls';

type RecordingStep = 'ready' | 'recording' | 'stopped';

interface RecordingControlsProps {
  step: RecordingStep;
  buttonText: string;
  buttonColor: string;
  isSaving: boolean;
  onRecordPress: () => void;
  onCancel: () => void;
  onSave: () => void;
  onTogglePlayback: () => void;
  isPlaying: boolean;
}

export function RecordingControls({
  step,
  buttonText,
  buttonColor,
  isSaving,
  onRecordPress,
  onCancel,
  onSave,
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
            onSave={onSave}
            isSaving={isSaving}
            isPlaying={isPlaying}
          />
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