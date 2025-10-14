import { Clipboard, FileText, Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

interface ActionButtonsProps {
  onPaste: () => void;
  onUpload: () => void;
  onClear: () => void;
}

export function ActionButtons({ onPaste, onUpload, onClear }: ActionButtonsProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return (
    <View style={{ flex: 1, justifyContent: 'center', gap: 10, marginBottom: 20 }}>
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
      <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: dark ? '#3f4d63' : '#6c757d' }]} onPress={onUpload}>
        <FileText size={16} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.secondaryButtonText}>Upload File</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
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