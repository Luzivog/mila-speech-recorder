import { Users } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';

interface GenderSelectProps {
  value: string;
  onChange: (next: string) => void;
}

const GENDER_OPTIONS = [
  'Female',
  'Male',
  'Non-binary',
  'Transgender',
  'Genderqueer',
  'Genderfluid',
  'Agender',
  'Two-Spirit',
  'Intersex',
  'Questioning',
  'Prefer not to say',
];

export function GenderSelect({ value, onChange }: GenderSelectProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const normalizedValue = value.trim();

  const selectedOption = useMemo(() => {
    const lower = normalizedValue.toLowerCase();
    return GENDER_OPTIONS.find((option) => option.toLowerCase() === lower) ?? null;
  }, [normalizedValue]);

  const [customValue, setCustomValue] = useState(() => (selectedOption ? '' : normalizedValue));

  useEffect(() => {
    if (selectedOption) {
      setCustomValue('');
    } else {
      setCustomValue(normalizedValue);
    }
  }, [normalizedValue, selectedOption]);

  const handleChipPress = (option: string) => {
    onChange(option);
  };

  const handleCustomChange = (text: string) => {
    setCustomValue(text);
    onChange(text);
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: dark ? '#e2e8f0' : '#212529' }]}>Gender</Text>
      <Text style={[styles.helper, { color: dark ? '#94a3b8' : '#64748b' }]}>Select the identity that fits you best or self-describe below.</Text>
      <View style={styles.optionsContainer}>
        {GENDER_OPTIONS.map((option) => {
          const isActive = option === selectedOption;
          return (
            <TouchableOpacity
              key={option}
              onPress={() => handleChipPress(option)}
              style={[
                styles.optionChip,
                {
                  backgroundColor: isActive ? (dark ? '#334155' : '#e0ecff') : dark ? '#1e293b' : '#ffffff',
                  borderColor: isActive ? (dark ? '#60a5fa' : '#2563eb') : dark ? '#334155' : '#dee2e6',
                },
              ]}
              activeOpacity={0.8}
            >
              <Text style={{ color: isActive ? (dark ? '#e2e8f0' : '#1d4ed8') : dark ? '#e2e8f0' : '#475569', fontWeight: isActive ? '600' : '500' }}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View
        style={[
          styles.customInputWrapper,
          {
            backgroundColor: dark ? '#1e293b' : '#ffffff',
            borderColor: !selectedOption && customValue ? (dark ? '#60a5fa' : '#2563eb') : dark ? '#334155' : '#dee2e6',
          },
        ]}
      >
        <Users size={22} color={dark ? '#64748b' : '#6c757d'} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.customInput, { color: dark ? '#f1f5f9' : '#212529' }]}
          value={customValue}
          onChangeText={handleCustomChange}
          placeholder="Self-described gender"
          placeholderTextColor={dark ? '#64748b' : '#666'}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
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
  helper: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    marginHorizontal: -4,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  customInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  customInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
});
