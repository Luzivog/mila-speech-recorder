# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

### Recording Screen Architecture

The recording screen logic has been refactored for maintainability.

Key points:

- `app/record.tsx` is now a thin presentational component.
- Core state machine & side-effects live in `hooks/useRecordScreen.ts`.
- Steps handled: `ready`, `recording`, `stopped`, `uploading`.
- Hook exposes derived values: `progressText`, `buttonText`, `buttonColor`, and control handlers.
- Validation/upload pipeline updates session and optionally attaches remote metadata.

Modify behavior in the hook rather than the screen to keep UI simple.

### Language field (Required)

- The Text screen includes a required Language field (free text). Parsing is blocked until it’s provided.
- The value is stored in the active session and included in uploads.
- The edge function requires `language` and persists it to `utterances.language`.
- Migrations: add the `language` column and enforce NOT NULL:
   - `20250930120000_add_language_to_utterances.sql`
   - `20250930121500_require_language_not_null.sql`
- The History screen displays the language alongside each recorded line.
