import { Pause, Play, Trash2, UploadCloud } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

interface StoppedControlsProps {
  onCancel: () => void;
  onTogglePlayback: () => void;
  onValidate: () => void;
  isUploading: boolean;
  isPlaying: boolean;
}

export function StoppedControls({ onCancel, onTogglePlayback, onValidate, isUploading, isPlaying }: StoppedControlsProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Cancel recording"
        style={[styles.smallButton, { backgroundColor: dark ? '#991b1b' : '#fee2e2' }]}
        onPress={onCancel}
        activeOpacity={0.85}
      >
  <Trash2 size={18} color={dark ? '#fecaca' : '#b91c1c'} style={{ marginRight: 6 }} />
        <Text style={[styles.smallButtonText, { color: dark ? '#fecaca' : '#b91c1c' }]}>Cancel</Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause playback' : 'Play recorded audio'}
        style={[styles.mainButton, { backgroundColor: dark ? '#3b82f6' : '#2563eb' }]}
        onPress={onTogglePlayback}
        activeOpacity={0.85}
      >
        {isPlaying ? (
          <Pause size={20} color="#fff" style={{ marginRight: 8 }} />
        ) : (
          <Play size={20} color="#fff" style={{ marginRight: 8 }} />
        )}
        <Text style={styles.mainButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Validate and upload recording"
        style={[styles.validateButton, { backgroundColor: dark ? '#10b981' : '#16a34a' }, isUploading && { opacity: 0.6 } ]}
        onPress={onValidate}
        disabled={isUploading}
        activeOpacity={0.85}
      >
  <UploadCloud size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.validateButtonText}>{isUploading ? 'Uploading...' : 'Validate'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    width: '100%',
  },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  smallButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  mainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    marginHorizontal: 4,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 28,
  },
  validateButtonText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
    fontSize: 15,
  },
});