import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RecordingItem } from '../../../types';

interface HistoryItemProps {
  lineText: string;
  recording: RecordingItem;
  language: string;
  onDelete: () => void;
  onPlaybackToggle: () => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

export function HistoryItem({
  lineText,
  recording,
  language,
  onDelete,
  onPlaybackToggle,
  isPlaying,
  currentTime,
  duration,
}: HistoryItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'saved':
        return '#28a745';
      case 'recorded':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.historyItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.lineText} numberOfLines={2}>
          {lineText}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(recording.status) }]}>
          <Text style={styles.statusText}>{recording.status}</Text>
        </View>
      </View>

      <View style={styles.itemDetails}>
        <Text style={styles.languageText}>
          Language: {language || '—'}
        </Text>
        <Text style={styles.durationText}>
          Duration: {formatDuration(recording.durationSec)}
        </Text>
      </View>

      <View style={styles.itemControls}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={onPlaybackToggle}
          disabled={!recording.fileUri}
        >
          <Text style={styles.playButtonText}>
            {isPlaying ? 'Pause' : 'Play'}
          </Text>
        </TouchableOpacity>

        {isPlaying && (
          <Text style={styles.timeText}>
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </Text>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#dc3545' }]}
            onPress={onDelete}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  lineText: {
    color: '#212529',
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDetails: {
    marginBottom: 10,
  },
  durationText: {
    color: '#6c757d',
    fontSize: 14,
  },
  languageText: {
    color: '#6c757d',
    fontSize: 13,
    marginBottom: 2,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timeText: {
    color: '#6c757d',
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});