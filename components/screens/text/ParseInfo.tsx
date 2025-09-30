import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

interface ParseInfoProps {
  lineCount: number;
  emptyLinesSkipped: number;
}

export function ParseInfo({ lineCount, emptyLinesSkipped }: ParseInfoProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return (
    <View style={[styles.parseInfo, { backgroundColor: dark ? 'rgba(30,41,59,0.7)' : 'rgba(241,245,249,0.7)', borderColor: dark ? '#334155' : '#dfe3e6' }]}> 
      <Text style={[styles.parseText, { color: dark ? '#cbd5e1' : '#495057' }]}> 
        Will create {lineCount} recording{lineCount !== 1 ? 's' : ''}
        {emptyLinesSkipped > 0 && ` (${emptyLinesSkipped} empty lines skipped)`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  parseInfo: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  parseText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});