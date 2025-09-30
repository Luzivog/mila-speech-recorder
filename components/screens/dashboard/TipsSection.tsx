import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function TipsSection() {
  return (
    <View style={styles.tipsSection}>
      <Text style={styles.tipsTitle}>💡 Tips</Text>
      <Text style={styles.tipsText}>
        • Speak clearly and at a natural pace{'\n'}
        • Record in a quiet environment{'\n'}
        • Take breaks to maintain quality{'\n'}
        • Review recordings in the History tab
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tipsSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  tipsTitle: {
    color: '#212529',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tipsText: {
    color: '#6c757d',
    fontSize: 14,
    lineHeight: 20,
  },
});