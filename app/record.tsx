import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/screens/record/EmptyState';
import { LineDisplay } from '../components/screens/record/LineDisplay';
import { ProgressDisplay } from '../components/screens/record/ProgressDisplay';
import { RecordingControls } from '../components/screens/record/RecordingControls';
import { useRecordScreenLogic } from '../hooks/useRecordScreen';

// RecordScreen now delegates most state & side-effect logic to the custom
// hook `useRecordScreenLogic` (in `hooks/useRecordScreen.ts`) to keep this
// component focused on layout & composition.
export default function RecordScreen() {
  const router = useRouter();
  const {
    appState,
    session,
    currentLine,
    progressText,
    step,
    buttonText,
    buttonColor,
    isUploading,
    handleRecordPress,
    handleCancel,
    handleValidate,
    handleTogglePlayback,
    isPlaying,
    dark,
  } = useRecordScreenLogic();

  if (!appState || !session) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: dark ? '#0f172a' : '#f8fafc' }]}> 
        <EmptyState onPressGoToText={() => router.push('/text')} />
      </View>
    );
  }

  return (
    <View style={[styles.fullScreen, { backgroundColor: dark ? '#0f172a' : '#f1f5f9' }]}> 
      {/* Decorative gradient layers (simple fallback using absolute views) */}
      <View pointerEvents="none" style={styles.decorLayer} />
      <View pointerEvents="none" style={[styles.decorBlob, styles.blobA, { backgroundColor: dark ? '#1e3a8a' : '#93c5fd' }]} />
      <View pointerEvents="none" style={[styles.decorBlob, styles.blobB, { backgroundColor: dark ? '#0f766e' : '#6ee7b7' }]} />
    
      <SafeAreaView style={styles.contentWrap}>
        <View style={styles.topSection}>
          <ProgressDisplay
            progressText={progressText}
            speakerName={session.speaker.displayName}
          />
        </View>

        <LineDisplay text={currentLine?.text || 'No line available'} />

        <View style={styles.controlsSection}>
          <RecordingControls
            step={step}
            buttonText={buttonText}
            buttonColor={buttonColor}
            isUploading={isUploading}
            onRecordPress={handleRecordPress}
            onCancel={handleCancel}
            onValidate={handleValidate}
            onTogglePlayback={handleTogglePlayback}
            isPlaying={isPlaying}
          />
          <Text style={[styles.helperTip, { color: dark ? '#64748b' : '#475569' }]}>Speak clearly. Keep a steady pace. Tap Validate when satisfied.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topSection: {
    marginBottom: 16,
  },
  controlsSection: {
    marginTop: 24,
  },
  helperTip: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 14,
    letterSpacing: 0.3,
  },
  decorLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorBlob: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 320,
    opacity: 0.25,
  },
  blobA: {
    top: -80,
    right: -100,
  },
  blobB: {
    bottom: -60,
    left: -80,
  },
});