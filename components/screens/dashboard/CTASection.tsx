import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CTASectionProps {
  progressPercent: number;
  hasSession: boolean;
  onContinueRecording: () => void;
  onAddText: () => void;
}

export function CTASection({ progressPercent, hasSession, onContinueRecording, onAddText }: CTASectionProps) {
  return (
    <View style={styles.ctaSection}>
      <TouchableOpacity style={styles.primaryButton} onPress={onContinueRecording}>
        <Text style={styles.primaryButtonText}>
          {progressPercent === 100 ? 'Start New Session' : 'Continue Recording'}
        </Text>
      </TouchableOpacity>

      {!hasSession && (
        <TouchableOpacity style={styles.secondaryButton} onPress={onAddText}>
          <Text style={styles.secondaryButtonText}>Add Text to Record</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ctaSection: {
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#007aff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});