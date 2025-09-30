import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SessionSectionProps {
  lineCount: number;
  recordingCount: number;
  speakerName?: string;
}

export function SessionSection({ lineCount, recordingCount, speakerName }: SessionSectionProps) {
  return (
    <View style={styles.sessionSection}>
      <Text style={styles.sessionTitle}>Current Session</Text>
      <View style={styles.sessionDetails}>
        <Text style={styles.sessionDetail}>
          Lines: {lineCount}
        </Text>
        <Text style={styles.sessionDetail}>
          Recordings: {recordingCount}
        </Text>
        <Text style={styles.sessionDetail}>
          Speaker: {speakerName || 'Not set'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sessionSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  sessionTitle: {
    color: '#212529',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionDetail: {
    color: '#6c757d',
    fontSize: 14,
    flex: 1,
  },
});