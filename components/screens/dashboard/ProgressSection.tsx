import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, useColorScheme } from 'react-native';

interface ProgressSectionProps {
  progressPercent: number; // percent recorded relative to total lines
  totalLines: number;
  recordedCount: number; // explicit recorded count
  progressColor: string;
}

export function ProgressSection({ progressPercent, totalLines, recordedCount, progressColor }: ProgressSectionProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: Math.min(progressPercent, 100),
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [progressPercent, animatedWidth]);

  const barWidth = animatedWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  const recorded = recordedCount;
  const remaining = Math.max(totalLines - recorded, 0);

  return (
    <View style={[styles.card, { backgroundColor: dark ? '#1e293b' : '#ffffff' }]}> 
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: dark ? '#f1f5f9' : '#1d3557' }]}>Progress</Text>
        <View style={[styles.percentBadge, { backgroundColor: (dark ? '#3b82f6' : progressColor) + '1A' }]}> 
          <Ionicons name="trending-up" size={14} color={progressColor} style={{ marginRight: 4 }} />
          <Text style={[styles.percentText, { color: progressColor }]}>{progressPercent.toFixed(0)}%</Text>
        </View>
      </View>
      <View style={[styles.barTrack, { backgroundColor: dark ? '#334155' : '#e2e8f0' }]}> 
        <Animated.View style={[styles.barFill, { backgroundColor: progressColor, width: barWidth }]} />
      </View>
      <View style={styles.metricsRow}>
        <Metric label="Recorded" value={recorded} accent={progressColor} />
        <Metric label="Remaining" value={remaining} accent={dark ? '#10b981' : '#16a34a'} />
      </View>
      <Text style={[styles.footerText, { color: dark ? '#94a3b8' : '#64748b' }]}> 
        {recorded} recorded • {remaining} left
      </Text>
    </View>
  );
}

function Metric({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <View style={styles.metricItem}>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 28,
    shadowOpacity: 0.04,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  percentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  barTrack: {
    height: 12,
    borderRadius: 8,
    marginBottom: 14,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    letterSpacing: 0.3,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});