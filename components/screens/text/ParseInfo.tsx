import { useApp } from '@/contexts/AppContext';
import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

interface ParseInfoProps {
  lineCount: number;
  emptyLinesSkipped: number;
}

export function ParseInfo({ lineCount, emptyLinesSkipped }: ParseInfoProps) {
  const { appState } = useApp();
  const language = appState?.profile?.language ?? null;
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  
  if (!language) {
    return (
      <View style={[styles.parseInfo, styles.warningContainer, { backgroundColor: 'rgba(220, 38, 38, 0.1)', borderColor: '#dc2626' }]}> 
        <Text style={[styles.parseText, styles.warningText, { color: '#dc2626' }]}> 
          Please go to the Profile tab to set your speaker information before starting.
        </Text>
      </View>
    );
  }
  
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
  warningContainer: {
    borderWidth: 2,
  },
  warningText: {
    fontWeight: '600',
  },
});