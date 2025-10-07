import { FileText } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

interface TextHeaderProps {
  hasText: boolean;
  lineCount: number;
}

export function TextHeader({ hasText, lineCount }: TextHeaderProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return (
    <View style={[styles.wrapper, { backgroundColor: dark ? '#0f172a' : '#f1f5f9' }]}> 
      <View style={[styles.iconBadge, { backgroundColor: dark ? '#1e293b' : '#e2e8f0' }]}> 
  <FileText size={32} color={dark ? '#93c5fd' : '#1d3557'} />
      </View>
      <Text style={[styles.title, { color: dark ? '#f1f5f9' : '#1d3557' }]}>Text Input</Text>
      <Text style={[styles.subtitle, { color: dark ? '#94a3b8' : '#475569' }]}> 
        {hasText
          ? `Great! ${lineCount} line${lineCount !== 1 ? 's' : ''} detected. You can still edit before saving.`
          : 'Paste or type sentences. We will split them into recordable lines.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 28,
    marginBottom: 24,
    overflow: 'hidden',
  },
  iconBadge: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
