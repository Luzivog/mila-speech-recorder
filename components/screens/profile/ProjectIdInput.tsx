import { FolderKanban } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';

interface ProjectIdInputProps {
  value: string;
  onChangeText: (text: string) => void;
  isValid: boolean;
  isValidating: boolean;
}

export function ProjectIdInput({ value, onChangeText, isValid, isValidating }: ProjectIdInputProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const [focused, setFocused] = useState(false);

  const showError = value.trim().length > 0 && !isValid && !isValidating;

  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: dark ? '#e2e8f0' : '#212529' }]}>Project ID</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: dark ? '#1e293b' : '#ffffff',
            borderColor: showError
              ? '#ef4444'
              : focused
                ? (dark ? '#3b82f6' : '#2563eb')
                : (dark ? '#334155' : '#dee2e6'),
          },
        ]}
      >
        <FolderKanban size={22} color={dark ? '#64748b' : '#6c757d'} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.input, { color: dark ? '#f1f5f9' : '#212529' }]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter project ID"
          placeholderTextColor={dark ? '#64748b' : '#666'}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {isValidating && (
          <Text style={[styles.statusText, { color: dark ? '#94a3b8' : '#6c757d' }]}>...</Text>
        )}
        {!isValidating && value.trim().length > 0 && isValid && (
          <Text style={[styles.statusText, { color: '#22c55e' }]}>✓</Text>
        )}
      </View>
      {showError && (
        <Text style={styles.errorText}>Invalid project ID</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  label: {
    color: '#212529',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
});

