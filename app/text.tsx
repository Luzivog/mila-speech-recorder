import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import 'react-native-get-random-values';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';
import { ActionButtons } from '../components/screens/text/ActionButtons';
import { LanguageInput } from '../components/screens/text/LanguageInput';
import { ParseInfo } from '../components/screens/text/ParseInfo';
import { PreviewSection } from '../components/screens/text/PreviewSection';
import { SaveButton } from '../components/screens/text/SaveButton';
import { SpeakerInput } from '../components/screens/text/SpeakerInput';
import { TextHeader } from '../components/screens/text/TextHeader';
import { TextInputSection } from '../components/screens/text/TextInputSection';
import { useApp } from '../contexts/AppContext';

export default function TextScreen() {
  const { appState, updateSpeaker, updateSession } = useApp();
  const [rawText, setRawText] = useState(appState?.session?.rawText || '');
  const [speakerName, setSpeakerName] = useState(appState?.speaker?.displayName || '');
  const [language, setLanguage] = useState(appState?.session?.language || '');
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const parseText = (text: string) => {
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((text, index) => ({
        id: uuidv4(),
        index,
        text,
      }));

    return {
      lines,
      totalLines: lines.length,
      emptyLinesSkipped: text.split('\n').length - lines.length,
    };
  };

  const parsed = parseText(rawText);

  const handlePaste = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      setRawText(clipboardContent);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error pasting from clipboard:', error);
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
  };

  const handleClear = () => {
    setRawText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };


  const handleSaveAndParse = async () => {
    if (!appState) return;
    const trimmed = rawText.trim();
    const lang = language.trim();

    if (!trimmed) {
      if (appState.session) {
        await updateSession(null); // clears session so Record screen shows empty state
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Session cleared', 'The current parsed text & lines have been removed.');
      } else {
        // Nothing to clear; optional gentle feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setRawText('');
      return;
    }

    // If user entered text but parsing yielded zero lines, block as before
    if (parsed.lines.length === 0) {
      Alert.alert('Error', 'No valid lines found in the text');
      return;
    }

    // Language is required
    if (!lang) {
      Alert.alert('Missing language', 'Please enter the language before saving and parsing.');
      return;
    };

    try {
      // Update speaker if changed
      if (speakerName !== appState.speaker.displayName) {
        await updateSpeaker({
          ...appState.speaker,
          displayName: speakerName,
          updatedAt: Date.now(),
        });
      }

      // Create new session
      const newSession = {
        rawText,
        lines: parsed.lines,
        currentIndex: 0,
        recordings: {}, // Clear previous recordings for new session
        lastVisitedAt: Date.now(),
        language: lang,
        parseMeta: {
          totalLines: parsed.totalLines,
          emptyLinesSkipped: parsed.emptyLinesSkipped,
        },
      };

      await updateSession(newSession);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', `Parsed ${parsed.lines.length} lines. Ready to record!`);

    } catch (error) {
      console.error('Error saving session:', error);
      Alert.alert('Error', 'Failed to save session');
    }
  };

  return (
      <ScrollView style={[styles.container, { backgroundColor: dark ? '#0f172a' : '#f8fafc' }]}>
        <View style={styles.bgDecoOne} />
        <View style={styles.bgDecoTwo} />
        <SafeAreaView style={styles.content}>
          <TextHeader hasText={!!rawText.trim()} lineCount={parsed.lines.length} />

          <SpeakerInput
            value={speakerName}
            onChangeText={setSpeakerName}
          />

          <LanguageInput
            value={language}
            onChangeText={setLanguage}
          />

          <TextInputSection
            value={rawText}
            onChangeText={setRawText}
          />

          <ActionButtons
            onPaste={handlePaste}
            onClear={handleClear}
          />

          {rawText.trim() && (
            <ParseInfo
              lineCount={parsed.lines.length}
              emptyLinesSkipped={parsed.emptyLinesSkipped}
            />
          )}

          {(() => {
            // Enable save when empty (to clear) OR when we have ≥1 parsed line.
            const trimmed = rawText.trim();
            const disableSave = (!!trimmed && parsed.lines.length === 0) || !language.trim(); // disabled if no valid lines or missing language
            return (
              <SaveButton
                onPress={handleSaveAndParse}
                disabled={disableSave}
              />
            );
          })()}

          <PreviewSection lines={parsed.lines} />
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
    position: 'relative',
  },
  bgDecoOne: {
    position: 'absolute',
    top: -120,
    right: -160,
    width: 380,
    height: 380,
    borderRadius: 380,
    backgroundColor: 'rgba(59,130,246,0.10)',
  },
  bgDecoTwo: {
    position: 'absolute',
    top: 240,
    left: -120,
    width: 300,
    height: 300,
    borderRadius: 300,
    backgroundColor: 'rgba(14,165,233,0.08)',
  },
});