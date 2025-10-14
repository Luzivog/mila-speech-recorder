import * as Haptics from 'expo-haptics';
import { Clock3, Mic } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';
import 'react-native-get-random-values';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';
import { DashboardHeader } from '../components/screens/dashboard/DashboardHeader';
import { StatCard } from '../components/screens/dashboard/StatCard';
import { LanguageInput } from '../components/screens/text/LanguageInput';
import { SpeakerInput } from '../components/screens/text/SpeakerInput';
import { useApp } from '../contexts/AppContext';
import { AppStats, SpeakerProfile, UserProfile } from '../types';

export default function ProfileScreen() {
    const { appState, updateProfile } = useApp();
    const scheme = useColorScheme();
    const dark = scheme === 'dark';
    const session = appState?.session ?? null;
    const profile = appState?.profile ?? null;
    const anim = useRef(new Animated.Value(0)).current;

    const [speakerName, setSpeakerName] = useState(
        profile?.speaker.displayName ?? session?.speaker.displayName ?? ''
    );
    const [language, setLanguage] = useState(profile?.language ?? session?.language ?? '');

    useEffect(() => {
        const nextSpeakerName = profile?.speaker.displayName ?? session?.speaker.displayName ?? '';
        setSpeakerName(prev => (prev === nextSpeakerName ? prev : nextSpeakerName));
    }, [profile?.speaker.displayName, session?.speaker.displayName]);

    useEffect(() => {
        const nextLanguage = profile?.language ?? session?.language ?? '';
        setLanguage(prev => (prev === nextLanguage ? prev : nextLanguage));
    }, [profile?.language, session?.language]);

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 2600,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(anim, {
                    toValue: 0,
                    duration: 2600,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [anim]);

    const stats = useMemo((): AppStats => {
        if (!session) {
            return { savedCount: 0, totalDurationSavedSec: 0, progressPercent: 0 };
        }
        const recordings = session.recordings;
        let recordedCount = 0;
        let totalDurationSec = 0;
        Object.values(recordings).forEach(recording => {
            if (recording.status === 'recorded' || recording.status === 'saved') {
                recordedCount++;
                totalDurationSec += recording.durationSec;
            }
        });
        const totalLines = session.lines.length;
        const progressPercent = totalLines > 0 ? (recordedCount / totalLines) * 100 : 0;
        return { savedCount: recordedCount, totalDurationSavedSec: totalDurationSec, progressPercent };
    }, [session]);

    const recordedCount = stats.savedCount;

    const handleSaveProfile = async () => {
        const trimmedLanguage = language.trim();
        if (!trimmedLanguage) {
            Alert.alert('Missing language', 'Please enter the language you will be recording.');
            return;
        }

        try {
            const now = Date.now();
            const baseSpeaker: SpeakerProfile = profile?.speaker
                ? { ...profile.speaker }
                : session?.speaker
                    ? { ...session.speaker }
                    : {
                        id: uuidv4(),
                        displayName: '',
                        createdAt: now,
                        updatedAt: now,
                    };

            const updatedSpeaker: SpeakerProfile = {
                ...baseSpeaker,
                displayName: speakerName.trim(),
                updatedAt: now,
            };

            const nextProfile: UserProfile = {
                speaker: updatedSpeaker,
                language: trimmedLanguage,
            };

            await updateProfile(nextProfile);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Profile saved', 'Your speaker details and language will be used for new recordings.');
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'Failed to save profile. Please try again.');
        }
    };

    const hasChanges = useMemo(() => {
        const originalName = profile?.speaker.displayName ?? session?.speaker.displayName ?? '';
        const originalLanguage = profile?.language ?? session?.language ?? '';
        return (
            originalName.trim() !== speakerName.trim() || originalLanguage.trim() !== language.trim()
        );
    }, [language, profile?.language, profile?.speaker.displayName, session?.language, session?.speaker.displayName, speakerName]);

    const disableSave = !language.trim() || !hasChanges;
    const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
    const glowOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.65] });
    const screenBackground = dark ? '#0f172a' : '#f8fafc';
    const blobOneColor = 'rgba(59,130,246,0.10)';
    const blobTwoColor = dark ? 'rgba(14,165,233,0.12)' : 'rgba(14,165,233,0.14)';
    const glowColor = dark ? '#1e3a8a' : '#2563eb';

    return (
        <View style={[styles.screen, { backgroundColor: screenBackground }]}>
            <View pointerEvents="none" style={styles.backgroundLayer}>
                <View style={[styles.blobOne, { backgroundColor: blobOneColor }]} />
                <View style={[styles.blobTwo, { backgroundColor: blobTwoColor }]} />
                <Animated.View
                    style={[
                        styles.glow,
                        {
                            opacity: glowOpacity,
                            transform: [{ scale }],
                            backgroundColor: glowColor,
                        },
                    ]}
                />
            </View>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <SafeAreaView style={styles.content}>
                    <DashboardHeader speakerName={session?.speaker.displayName} />
                    <View style={[styles.profileCard, { backgroundColor: dark ? '#1e293b' : '#ffffff' }]}>
                        <Text style={[styles.sectionTitle, { color: dark ? '#f1f5f9' : '#1d3557' }]}>Profile</Text>
                        <Text style={[styles.sectionSubtitle, { color: dark ? '#94a3b8' : '#64748b' }]}>Update your speaker identity and preferred language.</Text>

                        <SpeakerInput value={speakerName} onChangeText={setSpeakerName} />

                        <LanguageInput value={language} onChangeText={setLanguage} />

                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                {
                                    backgroundColor: disableSave
                                        ? dark
                                            ? '#334155'
                                            : '#cbd5e1'
                                        : dark
                                            ? '#3b82f6'
                                            : '#2563eb',
                                    shadowColor: dark ? '#1e3a8a' : '#2563eb',
                                    opacity: disableSave ? 0.7 : 1,
                                },
                            ]}
                            onPress={handleSaveProfile}
                            disabled={disableSave}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.saveButtonText}>Save Profile</Text>
                        </TouchableOpacity>
                    </View>

                    {profile && (
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
                                value={`${Math.round(stats.totalDurationSavedSec / 60)}m`}
                                subtitle="total"
                                IconComponent={Clock3}
                                accent={dark ? '#10b981' : '#16a34a'}
                            />
                        </View>
                    )}
                </SafeAreaView>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    container: {
        flex: 1
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    profileCard: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 28,
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 13,
        marginBottom: 18,
    },
    saveButton: {
        marginTop: 8,
        paddingVertical: 16,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: 28,
    },
    emptyWrap: {
        flex: 1,
    },
    backgroundLayer: {
        ...StyleSheet.absoluteFillObject,
    },
    blobOne: {
        position: 'absolute',
        top: -140,
        right: -160,
        width: 420,
        height: 420,
        borderRadius: 420,
    },
    blobTwo: {
        position: 'absolute',
        bottom: -160,
        left: -200,
        width: 480,
        height: 480,
        borderRadius: 480,
    },
    glow: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 200,
        filter: 'blur(50px)',
    },
});
