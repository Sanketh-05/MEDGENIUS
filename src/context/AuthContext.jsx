import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, sendPasswordResetEmail } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth';
import { saveUserProfile, loadUserProfile } from '../utils/firestoreService';
import { uploadProfilePhoto } from '../utils/storageService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen to Firebase auth state — merge Firestore profile
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const base = buildUserData(firebaseUser);
                setUser(base); // Show immediately for fast UX

                // Merge from Firestore (source of truth)
                const fsProfile = await loadUserProfile(firebaseUser.uid);
                if (fsProfile) {
                    setUser(prev => ({ ...prev, ...fsProfile }));
                } else {
                    // First login — persist profile to Firestore
                    saveUserProfile(firebaseUser.uid, base).catch(() => {});
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const buildUserData = (firebaseUser) => ({
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL || null,
        course: 'MBBS',
        createdAt: firebaseUser.metadata?.creationTime || new Date().toISOString(),
        stats: { topicsStudied: 0, quizzesTaken: 0, flashcardsReviewed: 0 },
        history: [],
    });

    // ─── Email/Password Sign Up ──────────────────────────────
    const signup = async (name, email, password, course) => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });
        const userData = { ...buildUserData(credential.user), name, course };
        await saveUserProfile(credential.user.uid, { name, email, course, createdAt: userData.createdAt });
        setUser(userData);
        return userData;
    };

    // ─── Email/Password Login ────────────────────────────────
    const login = async (email, password) => {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const base = buildUserData(credential.user);
        const fsProfile = await loadUserProfile(credential.user.uid);
        const userData = fsProfile ? { ...base, ...fsProfile } : base;
        setUser(userData);
        return userData;
    };

    // ─── Google Sign-In ──────────────────────────────────────
    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        const base = buildUserData(result.user);
        const fsProfile = await loadUserProfile(result.user.uid);
        if (fsProfile) {
            setUser({ ...base, ...fsProfile });
        } else {
            await saveUserProfile(result.user.uid, {
                name: base.name, email: base.email,
                photoURL: base.photoURL, course: base.course,
                createdAt: base.createdAt,
            });
            setUser(base);
        }
        return fsProfile ? { ...base, ...fsProfile } : base;
    };

    // ─── Logout ──────────────────────────────────────────────
    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    // ─── Reset Password ──────────────────────────────────────
    const resetPassword = async (email) => {
        if (!email.trim()) throw new Error('Please enter your email');
        await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    };

    // ─── Update Stats ────────────────────────────────────────
    const updateStats = (key) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, stats: { ...prev.stats, [key]: (prev.stats[key] || 0) + 1 } };
            saveUserProfile(prev.id, { stats: updated.stats }).catch(() => {});
            return updated;
        });
    };

    // ─── Add to History ──────────────────────────────────────
    const addToHistory = (topic) => {
        setUser(prev => {
            if (!prev) return prev;
            const entry = { topic, date: new Date().toISOString(), id: Date.now().toString() };
            const updated = { ...prev, history: [entry, ...(prev.history || [])].slice(0, 50) };
            saveUserProfile(prev.id, { history: updated.history }).catch(() => {});
            return updated;
        });
    };

    // ─── Clear History ───────────────────────────────────────
    const clearHistory = () => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, history: [] };
            saveUserProfile(prev.id, { history: [] }).catch(() => {});
            return updated;
        });
    };

    // ─── Update Profile Photo ────────────────────────────────
    const updateUserProfilePhoto = async (file) => {
        if (!user?.id || !file) throw new Error('No user or file');
        const { url } = await uploadProfilePhoto(user.id, file);
        await updateProfile(auth.currentUser, { photoURL: url });
        await saveUserProfile(user.id, { photoURL: url });
        setUser(prev => ({ ...prev, photoURL: url }));
        return url;
    };

    // ─── Update Course Preference ────────────────────────────
    const updateCourse = async (course) => {
        if (!user?.id) return;
        await saveUserProfile(user.id, { course });
        setUser(prev => ({ ...prev, course }));
    };

    if (loading) {
        return (
            <div style={{
                height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-primary, #0a0f1a)', color: 'var(--accent-primary, #00e6b4)',
                fontSize: '1.2rem', gap: '12px',
            }}>
                <span style={{ fontSize: '2rem', animation: 'pulse 1.5s infinite' }}>🧬</span>
                Loading MEDGENIUS...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            user, signup, login, loginWithGoogle, logout, resetPassword,
            updateStats, addToHistory, clearHistory,
            updateUserProfilePhoto, updateCourse,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
