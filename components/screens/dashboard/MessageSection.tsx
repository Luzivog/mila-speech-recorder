import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MessageSectionProps {
  message: string;
}

export function MessageSection({ message }: MessageSectionProps) {
  return (
    <View style={styles.messageSection}>
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  messageSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  messageText: {
    color: '#212529',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});