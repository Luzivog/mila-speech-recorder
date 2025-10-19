# Mila Speech Recorder

Mila Speech Recorder is an Expo Router application for collecting scripted speech samples along with basic speaker demographics. Recordings are uploaded to Supabase Storage while metadata is written to Postgres tables via Supabase Edge Functions. This document explains how to get the project running, how Supabase fits into the architecture, and what developers should know before shipping changes.

## Tech Stack
- Expo (React Native) with Expo Router for navigation
- TypeScript throughout the app, edge functions, and Supabase migrations
- pnpm for dependency management
- Supabase (Postgres, Storage, Edge Functions)

## Prerequisites
- Node.js 20+ (install via [Node.js downloads](https://nodejs.org/) or use `nvm`/`fnm`)
- pnpm 9+ (`corepack enable` will install the version pinned in `package.json`)
- Expo CLI (`npx expo --help` works out of the box; install `expo` globally only if you prefer)
- Supabase CLI (optional but recommended for local development of database + functions)

## Quick Start
1. **Install dependencies**
	 ```powershell
	 pnpm install
	 ```
2. **Create your environment file** by copying `.env.example` (if present) or creating `.env` in the repository root. Populate the variables listed below.
3. **Run the app**
	 ```powershell
	 pnpm start
	 ```
	 Expo will prompt you to open a simulator, run on device, or launch the web build.
4. **Lint (optional)**
	 ```powershell
	 pnpm lint
	 ```

## Environment Configuration

The Expo client reads Supabase credentials from public env variables. Create a root-level `.env` file and provide:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ey...
```

These are safe to expose to the client because they use the anon key. The edge functions run with service role credentials (see below). Restart the Expo dev server after changing environment variables.

### Local Supabase CLI Credentials

When developing Supabase functions locally you will also need a `.env` inside `supabase/` with service-role values so the CLI can emulate production:

```dotenv
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ey...
```

Never commit service role keys. Use environment-specific `.env.local` files and rely on Supabase secrets in production.

## Running Supabase Locally

Supabase CLI lets you run the database, storage, and edge function environment locally.

```powershell
cd supabase
supabase start
supabase db reset    # applies migrations in supabase/migrations
```

- Use `supabase status` to check running containers.
- `supabase stop` tears everything down.
- To test an edge function locally run `supabase functions serve upload-recording` and point the app’s `EXPO_PUBLIC_SUPABASE_URL` to the local URL (printed by the CLI).

Deploying changes to the hosted Supabase project typically involves:

1. `supabase db push` to apply new migrations.
2. `supabase functions deploy upload-recording` (and `delete-recording` when needed).
3. Updating secrets via `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...`.

## Supabase Integration Overview

### Client-side Service
- `services/SupabaseService.ts` creates a Supabase client with the anon key and exposes:
	- `uploadRecording` – packages recorded audio + metadata into `FormData` and `POST`s to the `upload-recording` edge function.
	- `deleteRecording` – issues a JSON `POST` to the `delete-recording` edge function when removing previously uploaded clips.
- The upload payload includes:
	- `file` – the audio file (`File` on web or `{ uri, name, type }` on native).
	- `deviceId` – stable UUID generated per device.
	- Speaker metadata (`speakerName`, `speakerAge`, `speakerGender`).
	- Utterance metadata (`lineId`, `lineIndex`, `lineText`, `language`).
	- `durationSec` – clip duration in seconds.

### Edge Functions (`supabase/functions`) 
- **`upload-recording`**
	- Validates form data (file size, age range, gender, language, duration).
	- Uploads the audio file to the public `recordings` storage bucket at `recordings/speaker/<slug>/device/<deviceId>/line/<lineId>.<ext>`.
	- Upserts the speaker record (stores `device_id`, `display_name`, `age`, `gender`).
	- Upserts the utterance record with text, language, and ordering index.
	- Inserts a recording row tying speaker ↔ utterance ↔ storage object, then returns the storage key plus a signed public URL.

- **`delete-recording`**
	- Deletes the recording row, removes the storage object, and cleans up orphaned utterances or speakers when no other recordings reference them.

Both functions rely on the service-role key supplied via Supabase secrets. By default `verify_jwt=false` inside `supabase/config.toml`; tighten this before production deployment if you need authenticated calls.

## Database & Storage Schema

All migrations live in `supabase/migrations`. The resulting schema includes:

- **`speakers`** – device-bound speakers with `display_name`, `age`, `gender`, optional `locale_hint`, audit timestamps, and a uniqueness constraint on `(device_id, display_name)`.
- **`utterances`** – the lines a participant reads. Stores `text`, `language` (required), `idx` ordering, and links back to the speaker/device.
- **`recordings`** – uploaded audio clips containing `duration_sec`, `storage_key`, file `ext`, and foreign keys to `speakers` and `utterances`. A unique constraint ensures only one recording per speaker+utterance pair.
- **Storage bucket `recordings`** – configured as public-read to allow distributing clip URLs. Policies currently allow broad access; audit before production hardening.

Whenever `upload-recording` runs, you will see matching rows inserted across the three tables plus a file in the bucket. Developers can inspect Supabase Studio to verify that speaker demographics, utterance metadata, and storage keys stay in sync.

## Application Flow Overview
- Text entry and parsing occur in `app/text.tsx` with helper components inside `components/screens/text/`.
- Recording UI lives in `app/record.tsx` and `components/screens/record/`. The hook `hooks/useRecording.ts` manages audio capture and saves clips to the device filesystem.
- `hooks/useRecordScreen.ts` orchestrates session state, progress tracking, and invokes `SupabaseService.uploadRecording` when the user saves or retries uploads.
- Historical uploads and deletion logic reside in `app/history.tsx` with components under `components/screens/history/`.

Understanding these modules helps when adjusting the data sent to Supabase or introducing new metadata fields.

## Project Structure Highlights
- `app/` – Expo Router routes.
- `components/` – shared UI and screen-specific components.
- `contexts/AppContext.tsx` – global app state (device profile, session data, speaker profile).
- `hooks/` – audio recording, playback, and screen orchestration logic.
- `services/SupabaseService.ts` – Supabase client + upload/delete helpers.
- `supabase/` – migrations, edge functions, and local config handled by Supabase CLI.

## Developer Tips
- Keep new environment variables prefixed with `EXPO_PUBLIC_` if they must be readable by the client; otherwise, proxy via an edge function.
- When changing payload fields, update **both** the client (`SupabaseService`) and the edge function validators.
- Add database migrations rather than editing existing SQL to preserve deploy history.
- Use `pnpm dlx expo install <pkg>` for Expo-compatible versions of native modules.
- Recordings can be large; throttle retries in new code to avoid hammering the edge function.

## Troubleshooting
- **`Missing EXPO_PUBLIC_SUPABASE_URL` warning** – check your `.env` and restart Expo.
- **Uploads fail with 400** – inspect the Metro logs for validation errors returned by `upload-recording`; ensure all fields (age, gender, language) are provided.
- **`fetch failed` errors** – confirm the device can reach the Supabase endpoint. On emulators, using `pnpm start --tunnel` simplifies connectivity.

With these pieces in place you should be able to iterate on the recorder, adjust Supabase storage, and deploy edge-function changes confidently.
