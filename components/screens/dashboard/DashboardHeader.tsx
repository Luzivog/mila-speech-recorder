import { Gauge } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useColorScheme } from 'react-native';

interface DashboardHeaderProps {
  speakerName?: string;
}

export function DashboardHeader({ speakerName }: DashboardHeaderProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.85] });

  return (
    <View style={styles.wrapper}> 
      <View style={styles.leftRow}>
        <View style={styles.iconStack}>
          <Animated.View style={[styles.pulseCircle, { opacity, transform: [{ scale }], backgroundColor: dark ? 'rgba(59,130,246,0.25)' : 'rgba(37,99,235,0.25)' }]} />
          <View style={[styles.iconBadge, { backgroundColor: dark ? '#1e293b' : '#ffffff', shadowColor: dark ? '#1e293b' : '#2563eb' }]}> 
            <Gauge size={30} color={dark ? '#93c5fd' : '#2563eb'} />
          </View>
        </View>
        <View style={styles.textCol}>
          <Text style={[styles.greeting, { color: dark ? '#f1f5f9' : '#1d3557' }]}>Hi{speakerName ? `, ${speakerName}` : ''}</Text>
          <Text style={[styles.subtitle, { color: dark ? '#94a3b8' : '#475569' }]}>Welcome back. Keep building your dataset.</Text>
        </View>
      </View>
      {/* Removed progress chip to eliminate duplication with ProgressSection */}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 28,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconStack: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  pulseCircle: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 70,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  textCol: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  }
});
