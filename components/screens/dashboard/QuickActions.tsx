import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

interface QuickActionsProps {
  onGoRecord: () => void;
  onGoText: () => void;
  onGoHistory: () => void;
}

export function QuickActions({ onGoRecord, onGoText, onGoHistory }: QuickActionsProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const makePress = (fn: () => void, impact: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => () => {
    Haptics.impactAsync(impact);
    fn();
  };

  const bg = dark ? '#1e293b' : '#ffffff';

  return (
    <View style={styles.wrapper}>
      <ActionButton
        label="Record"
        icon="mic"
        onPress={makePress(onGoRecord, Haptics.ImpactFeedbackStyle.Medium)}
        accent={dark ? '#3b82f6' : '#2563eb'}
        background={bg}
      />
      <ActionButton
        label="Add Text"
        icon="document-text"
        onPress={makePress(onGoText)}
        accent={dark ? '#10b981' : '#16a34a'}
        background={bg}
      />
      <ActionButton
        label="History"
        icon="time"
        onPress={makePress(onGoHistory)}
        accent={dark ? '#f59e0b' : '#d97706'}
        background={bg}
      />
    </View>
  );
}

interface ActionButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accent: string;
  background: string;
}

function ActionButton({ label, icon, onPress, accent, background }: ActionButtonProps) {
  return (
    <TouchableOpacity style={[styles.actionButton, { backgroundColor: background, shadowColor: accent }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.iconBadge, { backgroundColor: accent + '1A' }]}> 
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <Text style={[styles.actionLabel, { color: accent }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconBadge: {
    padding: 10,
    borderRadius: 16,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
