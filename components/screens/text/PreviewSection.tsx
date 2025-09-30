import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

interface Line {
  id: string;
  index: number;
  text: string;
}

interface PreviewSectionProps {
  lines: Line[];
}

export function PreviewSection({ lines }: PreviewSectionProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  if (lines.length === 0) return null;
  return (
    <View style={[styles.previewSection, { backgroundColor: dark ? 'rgba(30,41,59,0.6)' : 'rgba(255,255,255,0.6)', borderColor: dark ? '#334155' : '#e2e8f0' }]}> 
      <View style={styles.previewHeaderRow}>
        <Ionicons name="list" size={18} color={dark ? '#93c5fd' : '#2563eb'} style={{ marginRight: 6 }} />
        <Text style={[styles.previewTitle, { color: dark ? '#f1f5f9' : '#1d3557' }]}>Preview (first 3 lines)</Text>
      </View>
      {lines.slice(0, 3).map((line, index) => (
        <View key={line.id} style={styles.lineRow}> 
          <View style={[styles.indexBadge, { backgroundColor: dark ? '#1e293b' : '#2563eb' }]}> 
            <Text style={styles.indexBadgeText}>{index + 1}</Text>
          </View>
          <Text style={[styles.previewLine, { color: dark ? '#cbd5e1' : '#495057' }]}>{line.text}</Text>
        </View>
      ))}
      {lines.length > 3 && (
        <Text style={[styles.previewMore, { color: dark ? '#64748b' : '#6c757d' }]}>… and {lines.length - 3} more</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  previewSection: {
    padding: 18,
    borderRadius: 24,
    marginBottom: 40,
    borderWidth: 1,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  indexBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  indexBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  previewLine: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  previewMore: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
});