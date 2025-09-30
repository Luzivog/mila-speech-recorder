import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, useColorScheme } from 'react-native';

export function UploadingIndicator() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  return (
    <View style={styles.uploadingContainer}>
      <ActivityIndicator size="large" color={dark ? '#3b82f6' : '#2563eb'} />
      <Text style={[styles.uploadingText, { color: dark ? '#cbd5e1' : '#334155' }]}>Uploading recording...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  uploadingContainer: {
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
});