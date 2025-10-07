import { Languages } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';

interface LanguageInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function LanguageInput({ value, onChangeText }: LanguageInputProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: dark ? '#e2e8f0' : '#212529' }]}>Language</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: dark ? '#1e293b' : '#ffffff',
            borderColor: focused ? (dark ? '#3b82f6' : '#2563eb') : (dark ? '#334155' : '#dee2e6'),
          },
        ]}
      >
  <Languages size={22} color={dark ? '#64748b' : '#6c757d'} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.input, { color: dark ? '#f1f5f9' : '#212529' }]}
          value={value}
          onChangeText={onChangeText}
          placeholder="e.g., English, Yoruba, French, etc."
          placeholderTextColor={dark ? '#64748b' : '#666'}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
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
});
