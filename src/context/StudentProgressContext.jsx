// ═══════════════════════════════════════════════════════════════
// Student Progress Context
// Tracks all student interactions for analytics dashboard
// Primary: Firestore (cross-device sync)
// Cache: localStorage (fast, offline-resilient)
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { saveProgress, loadProgress } from '../utils/firestoreService';

const ProgressContext = createContext(null);

const EMPTY_PROGRESS = {
    quizResults: [],       // { date, topic, score, total, timeSpent }
    flashcardSessions: [], // { date, topic, cardsReviewed, timeSpent }
    notesGenerated: [],    // { date, topic, source: 'file'|'ai'|'builtin' }
    videoSessions: [],     // { date, title, durationWatched }
    clinicalCases: [],     // { date, caseTitle, score, total, timeSpent }
    dailyActivity: {},     // { 'YYYY-MM-DD': { notes, quizzes, flashcards, videos, cases } }
    topicAccuracy: {},     // { 'topicName': { correct, total } }
    totalTimeSpent: 0,
    weeklyStreak: 0,
    lastActiveDate: null,
};

export function StudentProgressProvider({ children }) {
    const { user } = useAuth();
    const [progress, setProgress] = useState(EMPTY_PROGRESS);
    const saveTimerRef = useRef(null);

    // ── Load on login (Firestore first, localStorage fallback) ──
    useEffect(() => {
        if (!user?.id) {
            setProgress(EMPTY_PROGRESS);
            return;
        }

        const lsKey = `medgenius_progress_${user.id}`;

        // Show localStorage immediately (fast), then merge Firestore
        const cached = localStorage.getItem(lsKey);
        if (cached) {
            try { setProgress(JSON.parse(cached)); } catch { /* ignore */ }
        }

        // Load from Firestore and deep-merge
        loadProgress(user.id).then(fsData => {
            if (fsData) {
                setProgress(prev => mergeProgress(prev, fsData));
                // Update localStorage cache
                localStorage.setItem(lsKey, JSON.stringify(fsData));
            }
        }).catch(() => {/* offline — use localStorage version */});
    }, [user?.id]);

    // ── Merge two progress objects (take longer arrays, sum numbers) ─
    function mergeProgress(local, remote) {
        if (!remote) return local;
        return {
            ...remote,
            quizResults: takeLonger(local.quizResults, remote.quizResults),
            flashcardSessions: takeLonger(local.flashcardSessions, remote.flashcardSessions),
            notesGenerated: takeLonger(local.notesGenerated, remote.notesGenerated),
            videoSessions: takeLonger(local.videoSessions, remote.videoSessions),
            clinicalCases: takeLonger(local.clinicalCases, remote.clinicalCases),
            dailyActivity: { ...local.dailyActivity, ...remote.dailyActivity },
            topicAccuracy: mergeAccuracy(local.topicAccuracy, remote.topicAccuracy),
            totalTimeSpent: Math.max(local.totalTimeSpent || 0, remote.totalTimeSpent || 0),
            weeklyStreak: Math.max(local.weeklyStreak || 0, remote.weeklyStreak || 0),
        };
    }

    function takeLonger(a = [], b = []) {
        return (a.length >= b.length ? a : b).slice(-100);
    }

    function mergeAccuracy(a = {}, b = {}) {
        const merged = { ...a };
        Object.entries(b).forEach(([topic, { correct, total }]) => {
            if (merged[topic]) {
                merged[topic] = {
                    correct: Math.max(merged[topic].correct, correct),
                    total: Math.max(merged[topic].total, total),
                };
            } else {
                merged[topic] = { correct, total };
            }
        });
        return merged;
    }

    // ── Debounced Firestore save (2s after last event) ───────────
    const persistProgress = useCallback((data) => {
        if (!user?.id) return;

        // Always save to localStorage immediately (offline safety)
        localStorage.setItem(`medgenius_progress_${user.id}`, JSON.stringify(data));

        // Debounce Firestore writes so rapid events batch into one write
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            saveProgress(user.id, data).catch(() => {/* Firestore write failed — localStorage already saved */});
        }, 2000);
    }, [user?.id]);

    const todayKey = () => new Date().toISOString().split('T')[0];

    const updateDailyActivity = (prevProgress, type) => {
        const key = todayKey();
        const daily = { ...(prevProgress.dailyActivity || {}) };
        if (!daily[key]) daily[key] = { notes: 0, quizzes: 0, flashcards: 0, videos: 0, cases: 0 };
        daily[key][type] = (daily[key][type] || 0) + 1;
        return daily;
    };

    // ── Track Events ─────────────────────────────────────────────

    const trackQuiz = useCallback((topic, score, total, timeSpent = 0) => {
        setProgress(prev => {
            const updated = {
                ...prev,
                quizResults: [...(prev.quizResults || []), { date: new Date().toISOString(), topic, score, total, timeSpent }].slice(-100),
                dailyActivity: updateDailyActivity(prev, 'quizzes'),
                topicAccuracy: {
                    ...(prev.topicAccuracy || {}),
                    [topic]: {
                        correct: ((prev.topicAccuracy || {})[topic]?.correct || 0) + score,
                        total: ((prev.topicAccuracy || {})[topic]?.total || 0) + total,
                    }
                },
                totalTimeSpent: (prev.totalTimeSpent || 0) + timeSpent,
                lastActiveDate: todayKey(),
            };
            persistProgress(updated);
            return updated;
        });
    }, [persistProgress]);

    const trackFlashcards = useCallback((topic, cardsReviewed, timeSpent = 0) => {
        setProgress(prev => {
            const updated = {
                ...prev,
                flashcardSessions: [...(prev.flashcardSessions || []), { date: new Date().toISOString(), topic, cardsReviewed, timeSpent }].slice(-100),
                dailyActivity: updateDailyActivity(prev, 'flashcards'),
                totalTimeSpent: (prev.totalTimeSpent || 0) + timeSpent,
                lastActiveDate: todayKey(),
            };
            persistProgress(updated);
            return updated;
        });
    }, [persistProgress]);

    const trackNotes = useCallback((topic, source = 'builtin') => {
        setProgress(prev => {
            const updated = {
                ...prev,
                notesGenerated: [...(prev.notesGenerated || []), { date: new Date().toISOString(), topic, source }].slice(-100),
                dailyActivity: updateDailyActivity(prev, 'notes'),
                lastActiveDate: todayKey(),
            };
            persistProgress(updated);
            return updated;
        });
    }, [persistProgress]);

    const trackVideo = useCallback((title, durationWatched = 0) => {
        setProgress(prev => {
            const updated = {
                ...prev,
                videoSessions: [...(prev.videoSessions || []), { date: new Date().toISOString(), title, durationWatched }].slice(-100),
                dailyActivity: updateDailyActivity(prev, 'videos'),
                totalTimeSpent: (prev.totalTimeSpent || 0) + durationWatched,
                lastActiveDate: todayKey(),
            };
            persistProgress(updated);
            return updated;
        });
    }, [persistProgress]);

    const trackClinicalCase = useCallback((caseTitle, score, total, timeSpent = 0) => {
        setProgress(prev => {
            const updated = {
                ...prev,
                clinicalCases: [...(prev.clinicalCases || []), { date: new Date().toISOString(), caseTitle, score, total, timeSpent }].slice(-100),
                dailyActivity: updateDailyActivity(prev, 'cases'),
                topicAccuracy: {
                    ...(prev.topicAccuracy || {}),
                    [`Case: ${caseTitle}`]: {
                        correct: ((prev.topicAccuracy || {})[`Case: ${caseTitle}`]?.correct || 0) + score,
                        total: ((prev.topicAccuracy || {})[`Case: ${caseTitle}`]?.total || 0) + total,
                    }
                },
                totalTimeSpent: (prev.totalTimeSpent || 0) + timeSpent,
                lastActiveDate: todayKey(),
            };
            persistProgress(updated);
            return updated;
        });
    }, [persistProgress]);

    // ── Computed Stats ────────────────────────────────────────────

    const getWeakAreas = useCallback(() => {
        const acc = progress.topicAccuracy || {};
        return Object.entries(acc)
            .map(([topic, { correct, total }]) => ({ topic, accuracy: total > 0 ? Math.round((correct / total) * 100) : 0, total }))
            .filter(a => a.total >= 2 && a.accuracy < 60)
            .sort((a, b) => a.accuracy - b.accuracy);
    }, [progress.topicAccuracy]);

    const getLast30DaysActivity = useCallback(() => {
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const activity = (progress.dailyActivity || {})[key] || { notes: 0, quizzes: 0, flashcards: 0, videos: 0, cases: 0 };
            days.push({ date: key, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), ...activity });
        }
        return days;
    }, [progress.dailyActivity]);

    const getTopicAccuracyList = useCallback(() => {
        const acc = progress.topicAccuracy || {};
        return Object.entries(acc)
            .map(([topic, { correct, total }]) => ({
                topic: topic.length > 25 ? topic.substring(0, 22) + '...' : topic,
                accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
                correct, total,
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 12);
    }, [progress.topicAccuracy]);

    const getFeatureTimeBreakdown = useCallback(() => {
        const quiz = (progress.quizResults || []).reduce((sum, r) => sum + (r.timeSpent || 0), 0);
        const flashcard = (progress.flashcardSessions || []).reduce((sum, r) => sum + (r.timeSpent || 0), 0);
        const video = (progress.videoSessions || []).reduce((sum, r) => sum + (r.durationWatched || 0), 0);
        const cases = (progress.clinicalCases || []).reduce((sum, r) => sum + (r.timeSpent || 0), 0);
        const notes = Math.max(0, (progress.totalTimeSpent || 0) - quiz - flashcard - video - cases);
        return { notes, quiz, flashcard, video, cases };
    }, [progress]);

    return (
        <ProgressContext.Provider value={{
            progress,
            trackQuiz, trackFlashcards, trackNotes, trackVideo, trackClinicalCase,
            getWeakAreas, getLast30DaysActivity, getTopicAccuracyList, getFeatureTimeBreakdown,
        }}>
            {children}
        </ProgressContext.Provider>
    );
}

export function useProgress() {
    const ctx = useContext(ProgressContext);
    if (!ctx) throw new Error('useProgress must be used within StudentProgressProvider');
    return ctx;
}
