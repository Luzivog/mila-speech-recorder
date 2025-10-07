import { useRouter } from 'expo-router';
import { Clock3, Mic } from 'lucide-react-native';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardEmptyState } from '../components/screens/dashboard/DashboardEmptyState';
import { DashboardHeader } from '../components/screens/dashboard/DashboardHeader';
import { QuickActions } from '../components/screens/dashboard/QuickActions';
import { StatCard } from '../components/screens/dashboard/StatCard';
import { TipsSection } from '../components/screens/dashboard/TipsSection';
import { useApp } from '../contexts/AppContext';
import { AppStats } from '../types';

export default function DashboardScreen() {
  const { appState } = useApp();
  const router = useRouter();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  // For backward compatibility with existing types, we'll still shape an AppStats object,
  // but treat validatedCount as recordedCount and totalDurationValidatedSec as totalRecordedDuration.
  const calculateStats = (): AppStats => {
    if (!appState?.session) {
      return { validatedCount: 0, totalDurationValidatedSec: 0, progressPercent: 0 };
    }
    const recordings = appState.session.recordings;
    let recordedCount = 0;
    let totalDurationSec = 0;
    Object.values(recordings).forEach(r => {
      if (r.status === 'recorded' || r.status === 'validated') { // treat both as recorded
        recordedCount++;
        totalDurationSec += r.durationSec;
      }
    });
    const totalLines = appState.session.lines.length;
    const progressPercent = totalLines > 0 ? (recordedCount / totalLines) * 100 : 0;
    return { validatedCount: recordedCount, totalDurationValidatedSec: totalDurationSec, progressPercent };
  };

  const stats = calculateStats();
  const session = appState?.session;

  // Empty state if no session
  if (!session) {
    return (
      <View style={[styles.emptyWrap, { backgroundColor: dark ? '#0f172a' : '#f8fafc' }]}> 
        <DashboardEmptyState
          onAddText={() => router.push('/text')}
          onRecord={() => router.push('/record')}
        />
      </View>
    );
  }

  const recordedCount = Object.values(session.recordings).filter(r => r.status === 'recorded' || r.status === 'validated').length;

  return (
    <ScrollView style={[styles.container, { backgroundColor: dark ? '#0f172a' : '#f8fafc' }]}>
      <SafeAreaView style={styles.content}>
  <DashboardHeader speakerName={session.speaker.displayName} />

        <QuickActions
          onGoRecord={() => router.push('/record')}
          onGoText={() => router.push('/text')}
          onGoHistory={() => router.push('/history')}
        />

        <View style={styles.statsRow}> 
          <StatCard
            title="Recorded"
            value={recordedCount.toString()}
            subtitle="clips"
            IconComponent={Mic}
            accent={dark ? '#3b82f6' : '#2563eb'}
          />
          <StatCard
            title="Duration"
            value={Math.round(stats.totalDurationValidatedSec / 60).toString() + 'm'}
            subtitle="total"
            IconComponent={Clock3}
            accent={dark ? '#10b981' : '#16a34a'}
          />
        </View>

        <TipsSection />
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 28,
  },
  emptyWrap: {
    flex: 1,
  },
});