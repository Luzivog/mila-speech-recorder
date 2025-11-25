import { createClient } from '@supabase/supabase-js';
import { UploadRequest, UploadResponse } from '../types';

// Initialize Supabase client (read from Expo public env)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Helpful error in development
  console.warn(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Configure them in your .env file.'
  );
}

const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

export class SupabaseService {
  static async uploadRecording(request: UploadRequest): Promise<UploadResponse> {
    const {
      file,
      deviceId,
      speakerName,
      speakerAge,
      speakerGender,
      projectId,
      lineId,
      lineIndex,
      lineText,
      durationSec,
      language,
    } = request;

    if (!Number.isFinite(speakerAge) || speakerAge <= 0) {
      throw new Error('Invalid speaker age provided for upload.');
    }

    const normalizedGender = speakerGender.trim();
    if (!normalizedGender) {
      throw new Error('Missing speaker gender for upload.');
    }

    const normalizedProjectId = projectId.trim();
    if (!normalizedProjectId) {
      throw new Error('Missing project ID for upload.');
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    // React Native FormData requires { uri, name, type } for files.
    // Web can pass File directly.
    // @ts-ignore: React Native's global FormData types differ
    formData.append('file', file as any);
    formData.append('deviceId', deviceId);
    formData.append('speakerName', speakerName);
    formData.append('speakerAge', Math.trunc(speakerAge).toString());
    formData.append('speakerGender', normalizedGender);
    formData.append('projectId', normalizedProjectId);
    formData.append('lineId', lineId);
    formData.append('lineIndex', lineIndex.toString());
    formData.append('lineText', lineText);
    formData.append('durationSec', durationSec.toString());
    formData.append('language', language);

    // Call the edge function directly via fetch for reliable multipart support on native
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const endpoint = `${supabaseUrl}/functions/v1/upload-recording`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        // Do NOT set Content-Type manually; let fetch set multipart boundary
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
      body: formData as any,
    });

    if (!res.ok) {
      let errText = await res.text();
      try {
        const j = JSON.parse(errText);
        errText = j.error || errText;
  } catch {}
      throw new Error(`Upload failed: ${res.status} ${res.statusText} - ${errText}`);
    }

    const data = (await res.json()) as UploadResponse;
    return data;
  }

  static async deleteRecording(args: {
    recordingId: string;
    utteranceId: string;
    speakerId: string;
  }): Promise<{ ok: true }>
  {
    const { recordingId, utteranceId, speakerId } = args;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const endpoint = `${supabaseUrl}/functions/v1/delete-recording`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recordingId, utteranceId, speakerId }),
    });

    if (!res.ok) {
      let errText = await res.text();
      try {
        const j = JSON.parse(errText);
        errText = j.error || errText;
      } catch {}
      throw new Error(`Delete failed: ${res.status} ${res.statusText} - ${errText}`);
    }

    return { ok: true };
  }

  // Test function to check if the service is working
  static async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('speakers')
        .select('count')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }

  // Fetch all valid project IDs from the database
  static async fetchProjectIds(): Promise<string[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('id');

    if (error) {
      console.error('Failed to fetch project IDs:', error);
      throw new Error(`Failed to fetch project IDs: ${error.message}`);
    }

    return (data ?? []).map((row: { id: string }) => row.id);
  }
}