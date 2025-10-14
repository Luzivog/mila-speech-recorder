// Data models for Mila Speech Recorder

export interface DeviceProfile {
  deviceId: string; // UUID generated once and stored locally
  createdAt: number; // epoch ms
}

export interface SpeakerProfile {
  id: string; // local UUID (not a DB id)
  displayName: string; // may be empty; slug becomes 'default'
  localeHint?: string; // optional string such as 'yo' or 'yo-NG'
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

export interface UserProfile {
  speaker: SpeakerProfile;
  language: string;
}

export interface LineItem {
  id: string; // UUID (assign per parse; changes if the text is re-parsed)
  index: number; // 0-based integer position
  text: string; // non-empty trimmed string
}

export type RecordingStatus = 'none' | 'recorded' | 'saved';

export interface LocalRecording {
  lineId: string; // LineItem.id
  fileUri: string | null; // local file reference or null
  durationSec: number; // ≥ 0
  status: RecordingStatus;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
  ext: string; // fixed string 'm4a'
}

export interface RemoteRecordingRef {
  storageKey: string; // storage object key
  publicUrl: string; // publicly readable URL
  speakerId: string; // DB UUID
  utteranceId: string; // DB UUID; equals lineId
  recordingId: string; // DB UUID
}

export interface RecordingItem extends LocalRecording {
  remote?: RemoteRecordingRef; // optional remote reference
}

export interface ActiveSession {
  rawText: string;
  lines: LineItem[];
  currentIndex: number;
  recordings: Record<string, RecordingItem>; // map by lineId
  lastVisitedAt: number; // epoch ms
  language: string; // required user-provided language label or code
  speaker: SpeakerProfile;
  parseMeta: {
    totalLines: number;
    emptyLinesSkipped: number;
  };
}

export interface AppState {
  device: DeviceProfile;
  profile: UserProfile | null;
  session: ActiveSession | null;
}

// Derived stats (compute from state; do not persist)
export interface AppStats {
  savedCount: number;
  totalDurationSavedSec: number;
  progressPercent: number;
}

// Upload response from edge function
export interface UploadResponse {
  publicUrl: string;
  storageKey: string;
  speakerId: string;
  utteranceId: string;
  recordingId: string;
}

// Cross-platform file part for uploads
// - Web: File
// - Native (iOS/Android): { uri, name, type }
export type UploadFilePart = File | { uri: string; name: string; type: string };

// Upload request payload
export interface UploadRequest {
  file: UploadFilePart;
  deviceId: string;
  speakerName: string;
  lineId: string;
  lineIndex: number;
  lineText: string;
  durationSec: number;
  language: string; // required language label or code
}