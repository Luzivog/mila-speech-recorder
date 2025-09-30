// hooks/usePlayback.ts
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useMemo, useRef } from 'react';

export function usePlayback(uri: string | null) {
  // Pass { uri } for file:// sources; pass the raw string for remote URLs
  const source = useMemo(() => {
    if (!uri) return null;
    return uri.startsWith('file://') ? { uri } : uri;
  }, [uri]);

  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);

  // If play() is called before the player finishes loading the new source,
  // we remember that intent and auto-play as soon as it's ready.
  const wantPlayRef = useRef(false);

  // When the source changes, clear any stale play intent (optional).
  const lastUriRef = useRef<string | null>(null);
  useEffect(() => {
    if (uri !== lastUriRef.current) {
      lastUriRef.current = uri;
      // don't forcibly clear wantPlayRef here; if play() was just called,
      // we *do* want to keep the intent and auto-play once loaded.
    }
  }, [uri]);

  // Auto-play once loaded if there was a pending play request.
  useEffect(() => {
    if (!uri) return;
    if (wantPlayRef.current && status.isLoaded) {
      wantPlayRef.current = false;
      // If we're at the end, rewind to 0
      const atEnd =
        status.duration &&
        Math.abs((status.currentTime ?? 0) - status.duration) < 0.05;
      if (atEnd) {
        player.seekTo(0);
      }
      player.play();
    }
  }, [uri, status.isLoaded, status.duration, status.currentTime, player]);

  async function play(): Promise<boolean> {
    if (!uri) return false;
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

    // If already loaded, play right now; otherwise request autoplay.
    if (player.isLoaded) {
      const atEnd =
        player.duration && Math.abs(player.currentTime - player.duration) < 0.05;
      if (atEnd) {
        await player.seekTo(0);
      }
      player.play();
    } else {
      wantPlayRef.current = true;
    }
    return true;
  }

  function pause(): boolean {
    player.pause();
    return true;
  }

  function stop(): boolean {
    player.pause();
    player.seekTo(0);
    return true;
  }

  return {
    isPlaying: status.playing,
    durationSec: status.duration ?? 0,
    currentTimeSec: status.currentTime ?? 0,
    play,
    pause,
    stop,
  };
}
