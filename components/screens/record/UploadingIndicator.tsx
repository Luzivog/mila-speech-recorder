import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View, useColorScheme } from 'react-native';

export function UploadingIndicator() {
  const fade = useRef(new Animated.Value(0)).current;
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fade, { toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(fade, { toValue: 0.3, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [fade]);

  return (
    <View style={styles.uploadingContainer}>
      <Animated.View style={[styles.pill, { opacity: fade, backgroundColor: dark ? '#1e293b' : '#e2e8f0' }]} />
      <ActivityIndicator size="large" color={dark ? '#3b82f6' : '#2563eb'} />
      <Text style={[styles.uploadingText, { color: dark ? '#cbd5e1' : '#334155' }]}>Uploading recording...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  uploadingContainer: {
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  pill: {
    position: 'absolute',
    top: -8,
    width: 160,
    height: 12,
    borderRadius: 8,
  },
});