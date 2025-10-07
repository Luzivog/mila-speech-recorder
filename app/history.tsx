import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HistoryEmptyState } from '../components/screens/history/HistoryEmptyState';
import { HistoryItem } from '../components/screens/history/HistoryItem';
import { useApp } from '../contexts/AppContext';
import { usePlayback } from '../hooks/usePlayback';
import { SupabaseService } from '../services/SupabaseService';

export default function HistoryScreen() {
  const { appState, updateSession } = useApp();
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const [autoplayId, setAutoplayId] = useState<string | null>(null); // request to start after URI loads
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const router = useRouter();

  const session = appState?.session ?? null;
  const recordings = useMemo(() => session?.recordings ?? {}, [session?.recordings]);

  // Build list of lines that have recordings
  const historyItems =
    session?.lines?.filter((line) => recordings[line.id])?.map((line) => ({
      line,
      recording: recordings[line.id],
      language: session?.language || '',
    }))?.reverse() ?? [];

  // Derive the URI we want to play
  const playingUri = useMemo(
    () => (playingItemId ? recordings[playingItemId]?.fileUri ?? null : null),
    [playingItemId, recordings]
  );

  // usePlayback with the currently selected URI
  const { isPlaying, durationSec, currentTimeSec, play, pause, stop } = usePlayback(playingUri);

  // Autoplay once the new URI is in place
  useEffect(() => {
    if (!autoplayId) return;
    if (!playingItemId) return;
    if (autoplayId !== playingItemId) return;
    if (!playingUri) return;

    (async () => {
      await play();
      setAutoplayId(null);
    })();
  }, [autoplayId, playingItemId, playingUri, play]);

  const handlePlaybackToggle = async (lineId: string) => {
    if (playingItemId === lineId) {
      // Pause current
      await pause();
      setPlayingItemId(null);
    } else {
      // Stop any previously playing item
      if (playingItemId) {
        await stop();
      }
      // Select new item; effect above will call play() once URI is ready
      setPlayingItemId(lineId);
      setAutoplayId(lineId);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDelete = async (lineId: string) => {
    if (!session) return;

    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (playingItemId === lineId) {
                await stop();
                setPlayingItemId(null);
                setAutoplayId(null);
              }

              const rec = session.recordings[lineId];
              if (rec?.remote?.recordingId && rec?.remote?.utteranceId && rec?.remote?.speakerId) {
                try {
                  await SupabaseService.deleteRecording({
                    recordingId: rec.remote.recordingId,
                    utteranceId: rec.remote.utteranceId,
                    speakerId: rec.remote.speakerId,
                  });
                } catch (e) {
                  console.warn('Remote delete failed, proceeding with local cleanup:', e);
                }
              }

              const updatedRecordings = { ...session.recordings };
              delete updatedRecordings[lineId];

              const updatedSession = {
                ...session,
                recordings: updatedRecordings,
                lastVisitedAt: Date.now(),
              };

              await updateSession(updatedSession);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (err) {
              console.error('Delete error:', err);
              Alert.alert('Delete failed', 'Unable to delete this recording right now. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (!appState || !session) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: dark ? '#0f172a' : '#f8fafc', padding: 0 }]}>
        <HistoryEmptyState
          hasSession={false}
          onGoRecord={() => router.push('/record')}
          onGoText={() => router.push('/text')}
        />
      </SafeAreaView>
    );
  }

  if (historyItems.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: dark ? '#0f172a' : '#f8fafc', padding: 0 }]}>
        <HistoryEmptyState
          hasSession={true}
          onGoRecord={() => router.push('/record')}
          onGoText={() => router.push('/text')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dark ? '#0f172a' : '#f8f9fa' }]}>
      <Text style={[styles.title, { color: dark ? '#f1f5f9' : '#212529' }]}>Recording History</Text>

      <FlatList
        data={historyItems}
        keyExtractor={(item) => item.line.id}
        renderItem={({ item }) => (
          <HistoryItem
            lineText={item.line.text}
            recording={item.recording}
            language={item.language.charAt(0).toUpperCase() + item.language.slice(1)}
            onDelete={() => handleDelete(item.line.id)}
            onPlaybackToggle={() => handlePlaybackToggle(item.line.id)}
            isPlaying={playingItemId === item.line.id && isPlaying}
            currentTime={currentTimeSec}
            duration={durationSec}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    color: '#212529',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: { paddingBottom: 20 },
  noData: {
    color: '#212529',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
