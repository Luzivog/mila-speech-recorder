import { Pencil } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';

interface TextInputSectionProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function TextInputSection({ value, onChangeText }: TextInputSectionProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: dark ? '#e2e8f0' : '#212529' }]}>Text</Text>
      <View style={[
        styles.textWrapper,
        {
          backgroundColor: dark ? '#1e293b' : '#ffffff',
          borderColor: focused ? (dark ? '#3b82f6' : '#2563eb') : (dark ? '#334155' : '#dee2e6'),
        },
      ]}>
        <Pencil
          size={22}
          color={dark ? '#64748b' : '#6c757d'}
          style={{ marginRight: 8, marginTop: 4 }}
        />
        <TextInput
          style={[styles.textInput, { color: dark ? '#f1f5f9' : '#212529' }]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Paste your text here..."
          placeholderTextColor={dark ? '#64748b' : '#666'}
          multiline
          textAlignVertical="top"
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
  textWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingTop: 10,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  textInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    minHeight: 220,
  },
});