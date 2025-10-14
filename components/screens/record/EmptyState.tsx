import { useApp } from '@/contexts/AppContext';
import * as Haptics from 'expo-haptics';
import { FileText, Mic } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

interface EmptyStateProps {
  onPressGoToText: () => void;
}

// A modern elegant empty state encouraging users to add text before recording
export function EmptyState({ onPressGoToText }: EmptyStateProps) {
  const { appState } = useApp();
  const language = appState?.profile?.language ?? null;
  const pulse = useRef(new Animated.Value(0)).current;
  const scheme = useColorScheme();

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPressGoToText();
  };

  const dark = scheme === 'dark';

  return (
    <View style={[styles.wrapper, { backgroundColor: dark ? '#0f172a' : '#f8fafc' }]}>
      {/* Decorative background */}
      <View style={[styles.bgCircleLarge, { backgroundColor: dark ? '#1e293b' : '#e0f2fe' }]} />
      <View style={[styles.bgCircleSmall, { backgroundColor: dark ? '#334155' : '#f1f5f9' }]} />

      <View style={styles.contentContainer}>
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale }], opacity, backgroundColor: dark ? '#1e293b' : '#f1f5f9' }]}>
          <Mic size={64} color={dark ? '#93c5fd' : '#1d3557'} />
        </Animated.View>
        <Text style={[styles.title, { color: dark ? '#f1f5f9' : '#1d3557' }]}>Ready to start recording?</Text>
        <Text style={[styles.subtitle, { color: dark ? '#cbd5e1' : '#475569' }]}>
          Add your text first. We’ll split it into lines so you can record each one with clarity.
        </Text>

        <View style={styles.stepsContainer}>
          {language ? (
            <>
              <Step index={1} text="Go to the Text tab" dark={dark} />
              <Step index={2} text="Paste or type your text" dark={dark} />
              <Step index={3} text="Save & Parse to create lines" dark={dark} />
              <Step index={4} text="Return here to record" dark={dark} />
            </>
          ) : (
            <>
              <Step index={1} text="Go to the Profile tab" dark={dark} />
              <Step index={2} text="Set speaker information" dark={dark} />
              <Step index={3} text="Go to the Text tab" dark={dark} />
              <Step index={4} text="Paste or type your text" dark={dark} />
              <Step index={5} text="Save & Parse to create lines" dark={dark} />
              <Step index={6} text="Return here to record" dark={dark} />
            </>
          )}
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go to Text tab to add content"
          style={[styles.ctaButton, { backgroundColor: dark ? '#3b82f6' : '#2563eb', shadowColor: dark ? '#1d4ed8' : '#2563eb' }]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <FileText size={22} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.ctaText}>Add Text to Begin</Text>
        </TouchableOpacity>
        <Text style={[styles.helperNote, { color: dark ? '#64748b' : '#64748b' }]}>Need inspiration? Paste song lyrics, proverbs, or any clean text.</Text>
      </View>
    </View>
  );
}

function Step({ index, text, dark }: { index: number; text: string; dark?: boolean }) {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepBadge, { backgroundColor: dark ? '#334155' : '#1d3557' }]}>
        <Text style={styles.stepBadgeText}>{index}</Text>
      </View>
      <Text style={[styles.stepText, { color: dark ? '#e2e8f0' : '#334155' }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    overflow: 'hidden',
  },
  bgCircleLarge: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 520,
    backgroundColor: '#e0f2fe', // light blue
    top: -140,
    right: -180,
  },
  bgCircleSmall: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: '#f1f5f9',
    bottom: -120,
    left: -140,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 120,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1d3557',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 26,
    backdropFilter: 'blur(6px)' as any, // ignored on native, fine on web
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1d3557',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    color: '#334155',
    fontSize: 15,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 32,
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginBottom: 18,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  helperNote: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});
