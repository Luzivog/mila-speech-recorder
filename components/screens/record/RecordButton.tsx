import { Mic, Square } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

interface RecordButtonProps {
  text: string;
  backgroundColor: string;
  onPress: () => void;
  isRecording?: boolean;
  disabled?: boolean;
}

export function RecordButton({ text, backgroundColor, onPress, isRecording, disabled }: RecordButtonProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isRecording, pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] });

  return (
    <View style={styles.outerWrap}>
      <Animated.View
        style={[
          styles.pulseRing,
          isRecording && {
            transform: [{ scale }],
            backgroundColor: backgroundColor,
            opacity: 0.25,
          },
        ]}
        pointerEvents="none"
      />
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={text}
        activeOpacity={0.85}
        disabled={disabled}
        onPress={onPress}
        style={[styles.recordButton, { backgroundColor, shadowOpacity: isRecording ? 0.4 : 0.25 }, disabled && { opacity: 0.5 }]}
      >
        {isRecording ? (
          <Square size={28} color={dark ? '#f8fafc' : '#fff'} style={{ marginRight: 10 }} />
        ) : (
          <Mic size={28} color={dark ? '#f8fafc' : '#fff'} style={{ marginRight: 10 }} />
        )}
        <Text style={[styles.recordButtonText, { color: '#fff' }]}>{text}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 120,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 42,
    borderRadius: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 22,
    elevation: 6,
  },
  recordButtonText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});