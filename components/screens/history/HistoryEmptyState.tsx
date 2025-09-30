import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

interface HistoryEmptyStateProps {
  hasSession: boolean;
  onGoRecord: () => void;
  onGoText: () => void;
}

export function HistoryEmptyState({ hasSession, onGoRecord, onGoText }: HistoryEmptyStateProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  const handlePressRecord = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onGoRecord();
  };
  const handlePressText = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onGoText();
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: dark ? '#0f172a' : '#f8fafc' }]}> 
      <View style={[styles.bgBlobOne, { backgroundColor: dark ? 'rgba(59,130,246,0.10)' : 'rgba(59,130,246,0.12)' }]} />
      <View style={[styles.bgBlobTwo, { backgroundColor: dark ? 'rgba(14,165,233,0.10)' : 'rgba(14,165,233,0.14)' }]} />

      <Animated.View style={[styles.iconHalo, { transform: [{ scale }] }]}> 
        <Animated.View style={[styles.haloRing, { opacity: ringOpacity, borderColor: dark ? '#3b82f6' : '#2563eb' }]} />
        <View style={[styles.iconBadge, { backgroundColor: dark ? '#1e293b' : '#ffffff', shadowColor: dark ? '#1e293b' : '#2563eb' }]}> 
          <Ionicons name="time" size={40} color={dark ? '#93c5fd' : '#1d3557'} />
        </View>
      </Animated.View>

      <Text style={[styles.title, { color: dark ? '#f1f5f9' : '#1d3557' }]}>No Recordings Yet</Text>
      <Text style={[styles.subtitle, { color: dark ? '#94a3b8' : '#475569' }]}> 
        {hasSession
          ? 'You have parsed lines, but none are recorded. Record a few lines to build your history.'
          : 'Start by adding text, then record each line. Your progress will appear here.'}
      </Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: dark ? '#1e293b' : '#e2e8f0' }]}
          onPress={handlePressText}
          activeOpacity={0.85}
        >
          <Ionicons name="document-text" size={18} color={dark ? '#93c5fd' : '#2563eb'} style={{ marginRight: 6 }} />
          <Text style={[styles.secondaryText, { color: dark ? '#93c5fd' : '#2563eb' }]}>Add Text</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: dark ? '#3b82f6' : '#2563eb', shadowColor: dark ? '#1e40af' : '#2563eb' }]}
          onPress={handlePressRecord}
          activeOpacity={0.85}
        >
          <Ionicons name="mic" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.primaryText}>Record Now</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.helperNote, { color: dark ? '#64748b' : '#64748b' }]}>Tip: Short, clear sentences produce better training data.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    position: 'relative',
  },
  bgBlobOne: {
    position: 'absolute',
    top: -140,
    right: -160,
    width: 420,
    height: 420,
    borderRadius: 420,
  },
  bgBlobTwo: {
    position: 'absolute',
    bottom: -160,
    left: -180,
    width: 460,
    height: 460,
    borderRadius: 460,
  },
  iconHalo: {
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 140,
    borderWidth: 3,
  },
  iconBadge: {
    width: 110,
    height: 110,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 30,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 32,
    marginRight: 12,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 36,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  primaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  helperNote: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 280,
  },
});
