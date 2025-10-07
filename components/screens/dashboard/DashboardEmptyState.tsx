import * as Haptics from 'expo-haptics';
import { FileText, Mic, Sparkles } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

interface DashboardEmptyStateProps {
  onAddText: () => void;
  onRecord: () => void;
}

export function DashboardEmptyState({ onAddText, onRecord }: DashboardEmptyStateProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const glowOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.65] });

  const press = (fn: () => void, style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => () => {
    Haptics.impactAsync(style);
    fn();
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: dark ? '#0f172a' : '#f8fafc' }]}> 
      <View style={[styles.blobOne, { backgroundColor: dark ? 'rgba(59,130,246,0.10)' : 'rgba(59,130,246,0.10)' }]} />
      <View style={[styles.blobTwo, { backgroundColor: dark ? 'rgba(14,165,233,0.12)' : 'rgba(14,165,233,0.14)' }]} />
      <Animated.View style={[styles.glow, { opacity: glowOpacity, transform: [{ scale }], backgroundColor: dark ? '#1e3a8a' : '#2563eb' }]} />
      <View style={[styles.iconBadge, { backgroundColor: dark ? '#1e293b' : '#ffffff', shadowColor: dark ? '#1e293b' : '#2563eb' }]}> 
        <Sparkles size={46} color={dark ? '#93c5fd' : '#2563eb'} />
      </View>
      <Text style={[styles.title, { color: dark ? '#f1f5f9' : '#1d3557' }]}>Welcome</Text>
  <Text style={[styles.subtitle, { color: dark ? '#94a3b8' : '#475569' }]}>Get started by adding text and begin recording high-quality speech data.</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: dark ? '#1e293b' : '#e2e8f0' }]} onPress={press(onAddText, Haptics.ImpactFeedbackStyle.Light)} activeOpacity={0.85}>
          <FileText size={18} color={dark ? '#93c5fd' : '#2563eb'} style={{ marginRight: 6 }} />
          <Text style={[styles.secondaryText, { color: dark ? '#93c5fd' : '#2563eb' }]}>Add Text</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: dark ? '#3b82f6' : '#2563eb', shadowColor: dark ? '#1e40af' : '#2563eb' }]} onPress={press(onRecord)} activeOpacity={0.85}>
          <Mic size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.primaryText}>Record</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.helper, { color: dark ? '#64748b' : '#64748b' }]}>Progress, stats, and insights will appear here after you start.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
    position: 'relative',
  },
  blobOne: {
    position: 'absolute',
    top: -140,
    right: -160,
    width: 420,
    height: 420,
    borderRadius: 420,
  },
  blobTwo: {
    position: 'absolute',
    bottom: -160,
    left: -200,
    width: 480,
    height: 480,
    borderRadius: 480,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 200,
    filter: 'blur(50px)',
  },
  iconBadge: {
    width: 120,
    height: 120,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 34,
    marginRight: 12,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 40,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  primaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  helper: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 300,
  },
});
