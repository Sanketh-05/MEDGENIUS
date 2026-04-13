// ═══════════════════════════════════════════════════════════════
// Firestore Service — MedGenius
// All per-user Firestore reads/writes in one place.
//
// Data structure:
//   users/{uid}/profile      → { name, email, course, photoURL, createdAt, updatedAt }
//   users/{uid}/progress     → { quizResults[], flashcardSessions[], notesGenerated[], ... }
//   users/{uid}/notes/{id}   → { title, topic, content, quiz[], flashcards[], createdAt, source }
//   users/{uid}/uploads/{id} → { name, url, storagePath, size, type, uploadedAt }
// ═══════════════════════════════════════════════════════════════

import { db } from '../firebase';
import {
    doc, setDoc, getDoc, updateDoc,
    collection, addDoc, getDocs, deleteDoc,
    serverTimestamp, query, orderBy, limit,
} from 'firebase/firestore';

// ── Helpers ────────────────────────────────────────────────────
const userDoc = (uid) => doc(db, 'users', uid);
const profileDoc = (uid) => doc(db, 'users', uid, 'data', 'profile');
const progressDoc = (uid) => doc(db, 'users', uid, 'data', 'progress');
const notesCol = (uid) => collection(db, 'users', uid, 'notes');
const noteDoc = (uid, noteId) => doc(db, 'users', uid, 'notes', noteId);
const uploadsCol = (uid) => collection(db, 'users', uid, 'uploads');
const uploadDoc = (uid, fileId) => doc(db, 'users', uid, 'uploads', fileId);

// Strip undefined values (Firestore doesn't accept undefined)
function clean(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj));
}

// ── User Profile ───────────────────────────────────────────────

/**
 * Save/update user profile to Firestore.
 * @param {string} uid
 * @param {{ name, email, course, photoURL }} data
 */
export async function saveUserProfile(uid, data) {
    try {
        if (!uid) return;
        await setDoc(profileDoc(uid), {
            ...clean(data),
            updatedAt: serverTimestamp(),
        }, { merge: true });
    } catch (err) {
        console.warn('[Firestore] saveUserProfile failed:', err.message);
    }
}

/**
 * Load user profile from Firestore.
 * @param {string} uid
 * @returns {object|null}
 */
export async function loadUserProfile(uid) {
    try {
        if (!uid) return null;
        const snap = await getDoc(profileDoc(uid));
        return snap.exists() ? snap.data() : null;
    } catch (err) {
        console.warn('[Firestore] loadUserProfile failed:', err.message);
        return null;
    }
}

// ── Study Progress ─────────────────────────────────────────────

/**
 * Save the full progress object to Firestore (merge).
 * @param {string} uid
 * @param {object} progressData — full StudentProgressContext progress state
 */
export async function saveProgress(uid, progressData) {
    try {
        if (!uid || !progressData) return;
        await setDoc(progressDoc(uid), {
            ...clean(progressData),
            syncedAt: serverTimestamp(),
        }, { merge: true });
    } catch (err) {
        console.warn('[Firestore] saveProgress failed:', err.message);
    }
}

/**
 * Load progress from Firestore.
 * @param {string} uid
 * @returns {object|null}
 */
export async function loadProgress(uid) {
    try {
        if (!uid) return null;
        const snap = await getDoc(progressDoc(uid));
        return snap.exists() ? snap.data() : null;
    } catch (err) {
        console.warn('[Firestore] loadProgress failed:', err.message);
        return null;
    }
}

// ── Notes ──────────────────────────────────────────────────────

/**
 * Save a generated notes object to Firestore.
 * Returns the new note document ID.
 * @param {string} uid
 * @param {object} notesObj — { title, topic, content, quiz[], flashcards[], source }
 * @returns {string|null} noteId
 */
export async function saveNote(uid, notesObj) {
    try {
        if (!uid || !notesObj) return null;

        // Sanitize — strip circular refs, functions, etc.
        const noteData = clean({
            title: notesObj.title || notesObj.topic || 'Untitled Note',
            topic: notesObj.topic || '',
            source: notesObj.source || 'ai',
            content: notesObj.content || notesObj.sections || null,
            quizCount: Array.isArray(notesObj.quiz) ? notesObj.quiz.length : 0,
            flashcardCount: Array.isArray(notesObj.flashcards) ? notesObj.flashcards.length : 0,
            // Store full quiz and flashcards (capped for storage efficiency)
            quiz: Array.isArray(notesObj.quiz) ? notesObj.quiz.slice(0, 50) : [],
            flashcards: Array.isArray(notesObj.flashcards) ? notesObj.flashcards.slice(0, 100) : [],
            createdAt: serverTimestamp(),
        });

        const ref = await addDoc(notesCol(uid), noteData);
        return ref.id;
    } catch (err) {
        console.warn('[Firestore] saveNote failed:', err.message);
        return null;
    }
}

/**
 * Load all saved notes for a user (most recent first, max 50).
 * @param {string} uid
 * @returns {Array<{id, title, topic, quizCount, flashcardCount, createdAt}>}
 */
export async function loadNotes(uid) {
    try {
        if (!uid) return [];
        const q = query(notesCol(uid), orderBy('createdAt', 'desc'), limit(50));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.warn('[Firestore] loadNotes failed:', err.message);
        return [];
    }
}

/**
 * Load a single note by ID (includes full content, quiz, flashcards).
 * @param {string} uid
 * @param {string} noteId
 * @returns {object|null}
 */
export async function loadNote(uid, noteId) {
    try {
        if (!uid || !noteId) return null;
        const snap = await getDoc(noteDoc(uid, noteId));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (err) {
        console.warn('[Firestore] loadNote failed:', err.message);
        return null;
    }
}

/**
 * Delete a saved note.
 * @param {string} uid
 * @param {string} noteId
 */
export async function deleteNote(uid, noteId) {
    try {
        if (!uid || !noteId) return;
        await deleteDoc(noteDoc(uid, noteId));
    } catch (err) {
        console.warn('[Firestore] deleteNote failed:', err.message);
    }
}

// ── Uploaded Files ─────────────────────────────────────────────

/**
 * Save a file upload record to Firestore.
 * @param {string} uid
 * @param {{ name, url, storagePath, size, type }} fileData
 * @returns {string|null} fileId
 */
export async function saveUploadRecord(uid, fileData) {
    try {
        if (!uid || !fileData) return null;
        const ref = await addDoc(uploadsCol(uid), {
            ...clean(fileData),
            uploadedAt: serverTimestamp(),
        });
        return ref.id;
    } catch (err) {
        console.warn('[Firestore] saveUploadRecord failed:', err.message);
        return null;
    }
}

/**
 * Load all uploaded file records for a user.
 * @param {string} uid
 * @returns {Array}
 */
export async function loadUploads(uid) {
    try {
        if (!uid) return [];
        const q = query(uploadsCol(uid), orderBy('uploadedAt', 'desc'), limit(100));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.warn('[Firestore] loadUploads failed:', err.message);
        return [];
    }
}

/**
 * Delete an uploaded file record from Firestore.
 * @param {string} uid
 * @param {string} fileId
 */
export async function deleteUploadRecord(uid, fileId) {
    try {
        if (!uid || !fileId) return;
        await deleteDoc(uploadDoc(uid, fileId));
    } catch (err) {
        console.warn('[Firestore] deleteUploadRecord failed:', err.message);
    }
}
