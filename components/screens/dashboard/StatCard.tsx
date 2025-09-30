import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: string; // optional override color
}

export function StatCard({ title, value, subtitle, icon = 'stats-chart', accent }: StatCardProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const baseAccent = accent || (dark ? '#3b82f6' : '#2563eb');
  const bg = dark ? '#1e293b' : '#ffffff';
  return (
    <View style={[styles.card, { backgroundColor: bg, shadowColor: baseAccent }]}> 
      <View style={[styles.iconBadge, { backgroundColor: `${baseAccent}1A` }]}> 
        <Ionicons name={icon} size={22} color={baseAccent} />
      </View>
      <Text style={[styles.title, { color: dark ? '#94a3b8' : '#64748b' }]}>{title}</Text>
      <Text style={[styles.value, { color: dark ? '#f1f5f9' : '#1d3557' }]}>{value}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: dark ? '#64748b' : '#94a3a8' }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  iconBadge: {
    padding: 10,
    borderRadius: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
});