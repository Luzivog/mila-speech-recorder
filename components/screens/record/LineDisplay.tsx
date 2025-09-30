import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

interface LineDisplayProps {
  text: string;
}

export function LineDisplay({ text }: LineDisplayProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: dark ? '#1e293b' : '#ffffff',
          borderColor: dark ? '#334155' : '#e2e8f0',
        },
      ]}
    >
      <Text style={[styles.text, { color: dark ? '#f1f5f9' : '#0f172a' }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  text: {
    fontSize: 28,
    lineHeight: 38,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.25,
  },
});