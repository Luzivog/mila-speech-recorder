import * as Haptics from 'expo-haptics';
import { Clock3, Mic } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { AgeInput } from '../components/screens/profile/AgeInput';
import { GenderSelect } from '../components/screens/profile/GenderSelect';
import { ProjectIdInput } from '../components/screens/profile/ProjectIdInput';
import { LanguageInput } from '../components/screens/text/LanguageInput';
import { SpeakerInput } from '../components/screens/text/SpeakerInput';
import { useApp } from '../contexts/AppContext';
import { SupabaseService } from '../services/SupabaseService';
import { AppStats, SpeakerProfile, UserProfile } from '../types';

export default function ProfileScreen() {
    const { appState, updateProfile } = useApp();
    const scheme = useColorScheme();
    const dark = scheme === 'dark';
    const session = appState?.session ?? null;
    const profile = appState?.profile ?? null;
    const anim = useRef(new Animated.Value(0)).current;

    const initialSpeaker = profile?.speaker ?? session?.speaker ?? null;
    const [speakerName, setSpeakerName] = useState(
        initialSpeaker?.displayName ?? ''
    );
    const [age, setAge] = useState(
        initialSpeaker?.age && initialSpeaker.age > 0 ? String(initialSpeaker.age) : ''
    );
    const [gender, setGender] = useState(initialSpeaker?.gender ?? '');
    const [language, setLanguage] = useState(profile?.language ?? session?.language ?? '');
    const [projectId, setProjectId] = useState(initialSpeaker?.projectId ?? '');
    const [validProjectIds, setValidProjectIds] = useState<string[]>([]);
    const [isValidatingProjectId, setIsValidatingProjectId] = useState(false);

    useEffect(() => {
        const nextSpeakerName = profile?.speaker.displayName ?? session?.speaker.displayName ?? '';
        setSpeakerName(prev => (prev === nextSpeakerName ? prev : nextSpeakerName));
    }, [profile?.speaker.displayName, session?.speaker.displayName]);

    useEffect(() => {
        const nextAge = profile?.speaker.age ?? session?.speaker.age ?? 0;
        const normalized = nextAge > 0 ? String(nextAge) : '';
        setAge(prev => (prev === normalized ? prev : normalized));
    }, [profile?.speaker.age, session?.speaker.age]);

    useEffect(() => {
        const nextGender = profile?.speaker.gender ?? session?.speaker.gender ?? '';
        const normalized = nextGender.trim();
        setGender(prev => (prev === normalized ? prev : normalized));
    }, [profile?.speaker.gender, session?.speaker.gender]);

    useEffect(() => {
        const nextLanguage = profile?.language ?? session?.language ?? '';
        setLanguage(prev => (prev === nextLanguage ? prev : nextLanguage));
    }, [profile?.language, session?.language]);

    useEffect(() => {
        const nextProjectId = profile?.speaker.projectId ?? session?.speaker.projectId ?? '';
        setProjectId(prev => (prev === nextProjectId ? prev : nextProjectId));
    }, [profile?.speaker.projectId, session?.speaker.projectId]);

    // Fetch valid project IDs on mount
    useEffect(() => {
        let cancelled = false;
        const fetchProjects = async () => {
            setIsValidatingProjectId(true);
            try {
                const ids = await SupabaseService.fetchProjectIds();
                if (!cancelled) {
                    setValidProjectIds(ids);
                }
            } catch (error) {
                console.error('Failed to fetch project IDs:', error);
            } finally {
                if (!cancelled) {
                    setIsValidatingProjectId(false);
                }
            }
        };
        fetchProjects();
        return () => { cancelled = true; };
    }, []);

    const isProjectIdValid = useMemo(() => {
        const trimmed = projectId.trim().toLowerCase();
        return trimmed.length > 0 && validProjectIds.map(id => id.toLowerCase()).includes(trimmed);
    }, [projectId, validProjectIds]);

    const handleProjectIdChange = useCallback((text: string) => {
        setProjectId(text.toLowerCase());
    }, []);

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
            if (recording.status === 'recorded' || recording.status === 'saved' || recording.status === 'uploaded') {
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
        const trimmedGender = gender.trim();
        const parsedAge = parseInt(age.trim(), 10);
        if (!trimmedLanguage) {
            Alert.alert('Missing language', 'Please enter the language you will be recording.');
            return;
        }

        if (!age.trim()) {
            Alert.alert('Missing age', 'Please provide the speaker age.');
            return;
        }

        if (Number.isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 120) {
            Alert.alert('Invalid age', 'Please enter a valid age between 1 and 120.');
            return;
        }

        if (!trimmedGender) {
            Alert.alert('Missing gender', 'Please select or enter a gender.');
            return;
        }

        const trimmedProjectId = projectId.trim().toLowerCase();
        if (!trimmedProjectId) {
            Alert.alert('Missing project ID', 'Please enter a project ID.');
            return;
        }

        if (!isProjectIdValid) {
            Alert.alert('Invalid project ID', 'The project ID you entered is not valid. Please enter a valid project ID.');
            return;
        }

        try {
            const now = Date.now();
            const sourceSpeaker = profile?.speaker ?? session?.speaker ?? null;

            const updatedSpeaker: SpeakerProfile = {
                id: sourceSpeaker?.id ?? uuidv4(),
                displayName: speakerName.trim(),
                localeHint: sourceSpeaker?.localeHint,
                age: parsedAge,
                gender: trimmedGender,
                projectId: trimmedProjectId,
                createdAt: sourceSpeaker?.createdAt ?? now,
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
        const originalAge = profile?.speaker.age ?? session?.speaker.age ?? 0;
        const originalGender = profile?.speaker.gender ?? session?.speaker.gender ?? '';
        const originalProjectId = profile?.speaker.projectId ?? session?.speaker.projectId ?? '';

        const currentName = speakerName.trim();
        const currentLanguage = language.trim();
        const currentAge = age.trim();
        const currentGender = gender.trim();
        const currentProjectId = projectId.trim();

        const originalAgeString = originalAge > 0 ? String(originalAge) : '';
        const originalGenderTrimmed = originalGender.trim();

        return (
            originalName.trim() !== currentName ||
            originalLanguage.trim() !== currentLanguage ||
            originalAgeString !== currentAge ||
            originalGenderTrimmed !== currentGender ||
            originalProjectId.trim() !== currentProjectId
        );
    }, [age, gender, language, projectId, profile?.language, profile?.speaker.age, profile?.speaker.displayName, profile?.speaker.gender, profile?.speaker.projectId, session?.language, session?.speaker.age, session?.speaker.displayName, session?.speaker.gender, session?.speaker.projectId, speakerName]);

    const disableSave = !language.trim() || !age.trim() || !gender.trim() || !projectId.trim() || !isProjectIdValid || !hasChanges;
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
                        <Text style={[styles.sectionSubtitle, { color: dark ? '#94a3b8' : '#64748b' }]}>Update your speaker identity, age, gender, and preferred language.</Text>

                        <SpeakerInput value={speakerName} onChangeText={setSpeakerName} />

                        <AgeInput value={age} onChangeText={setAge} />

                        <GenderSelect value={gender} onChange={setGender} />

                        <LanguageInput value={language} onChangeText={setLanguage} />

                        <ProjectIdInput
                            value={projectId}
                            onChangeText={handleProjectIdChange}
                            isValid={isProjectIdValid}
                            isValidating={isValidatingProjectId}
                        />

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
