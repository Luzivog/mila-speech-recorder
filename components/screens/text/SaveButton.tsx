import { Save } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';

interface SaveButtonProps {
  onPress: () => void;
  disabled: boolean;
}

export function SaveButton({ onPress, disabled }: SaveButtonProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return (
    <TouchableOpacity
      style={[
        styles.primaryButton,
        {
          backgroundColor: disabled
            ? (dark ? '#1e293b' : '#cbd5e1')
            : (dark ? '#3b82f6' : '#2563eb'),
          shadowColor: dark ? '#1e3a8a' : '#2563eb',
          opacity: disabled ? 0.7 : 1,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
  <Save size={18} color="#fff" style={{ marginRight: 8 }} />
      <Text style={styles.primaryButtonText}>Save & Parse</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 34,
    borderRadius: 40,
    marginBottom: 28,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledButton: {},
});