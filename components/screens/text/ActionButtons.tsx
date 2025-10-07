import { Clipboard, Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

interface ActionButtonsProps {
  onPaste: () => void;
  onClear: () => void;
}

export function ActionButtons({ onPaste, onClear }: ActionButtonsProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return (
    <View style={styles.buttonRow}>
      <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: dark ? '#334155' : '#6c757d' }]} onPress={onPaste}>
  <Clipboard size={16} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.secondaryButtonText}>Paste</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: dark ? '#475569' : '#6c757d' }]} onPress={onClear}>
  <Trash2 size={16} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.secondaryButtonText}>Clear</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 28,
    flex: 1,
    marginHorizontal: 5,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  // removed tertiary button (sample feature not needed)
});