import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

interface ProgressDisplayProps {
  progressText: string;
  speakerName?: string;
}

export function ProgressDisplay({ progressText, speakerName }: ProgressDisplayProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  // Extract numbers to compute percent if format matches
  let percent: number | undefined;
  const match = progressText.match(/Line\s+(\d+)\s+of\s+(\d+)/i);
  if (match) {
    const current = parseInt(match[1], 10);
    const total = parseInt(match[2], 10);
    if (total > 0) percent = (current / total) * 100;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        <Text style={[styles.progressText, { color: dark ? '#e2e8f0' : '#1e293b' }]}>{progressText}</Text>
        {speakerName && (
          <View style={[styles.speakerChip, { backgroundColor: dark ? '#1e293b' : '#e2e8f0' }]}> 
            <Text style={[styles.speakerText, { color: dark ? '#93c5fd' : '#334155' }]}>{speakerName}</Text>
          </View>
        )}
      </View>
      {percent !== undefined && (
        <View style={[styles.barTrack, { backgroundColor: dark ? '#1e293b' : '#e2e8f0' }]}> 
          <View
            style={[styles.barFill, { width: `${percent}%`, backgroundColor: dark ? '#3b82f6' : '#2563eb' }]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  speakerChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  speakerText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  barTrack: {
    height: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
});