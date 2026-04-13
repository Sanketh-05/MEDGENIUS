// ═══════════════════════════════════════════════════════════════
// Firebase Storage Service — MedGenius
// File uploads: study documents (PDF/DOCX/images), profile photos
// ═══════════════════════════════════════════════════════════════

import { storage } from '../firebase';
import {
    ref, uploadBytesResumable, getDownloadURL, deleteObject,
} from 'firebase/storage';

// ── Max sizes ──────────────────────────────────────────────────
const MAX_FILE_MB = 20;
const MAX_PHOTO_MB = 5;

function validateSize(file, maxMB) {
    const mb = file.size / (1024 * 1024);
    if (mb > maxMB) throw new Error(`File too large (${mb.toFixed(1)} MB). Maximum is ${maxMB} MB.`);
}

// ── Upload a study document ────────────────────────────────────

/**
 * Upload a study file (PDF, DOCX, image) to Firebase Storage.
 * @param {string} uid  — Firebase user ID
 * @param {File}   file — browser File object
 * @param {function} [onProgress] — optional (percent: number) => void callback
 * @returns {Promise<{ url: string, storagePath: string, name: string, size: number, type: string }>}
 */
export async function uploadFile(uid, file, onProgress) {
    if (!uid) throw new Error('User not authenticated');
    validateSize(file, MAX_FILE_MB);

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `users/${uid}/uploads/${timestamp}_${safeName}`;
    const storageRef = ref(storage, storagePath);

    return new Promise((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, file, {
            contentType: file.type || 'application/octet-stream',
        });

        task.on('state_changed',
            (snap) => {
                const percent = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                onProgress?.(percent);
            },
            (err) => {
                console.error('[Storage] Upload failed:', err);
                reject(new Error(err.message));
            },
            async () => {
                const url = await getDownloadURL(task.snapshot.ref);
                resolve({
                    url,
                    storagePath,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                });
            }
        );
    });
}

// ── Upload profile photo ───────────────────────────────────────

/**
 * Upload a profile photo to Firebase Storage.
 * @param {string} uid
 * @param {File}   file — image file
 * @param {function} [onProgress]
 * @returns {Promise<{ url: string, storagePath: string }>}
 */
export async function uploadProfilePhoto(uid, file, onProgress) {
    if (!uid) throw new Error('User not authenticated');
    validateSize(file, MAX_PHOTO_MB);

    if (!file.type.startsWith('image/')) throw new Error('Only image files are supported for profile photos.');

    const storagePath = `users/${uid}/profile/photo_${Date.now()}`;
    const storageRef = ref(storage, storagePath);

    return new Promise((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

        task.on('state_changed',
            (snap) => {
                const percent = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                onProgress?.(percent);
            },
            (err) => reject(new Error(err.message)),
            async () => {
                const url = await getDownloadURL(task.snapshot.ref);
                resolve({ url, storagePath });
            }
        );
    });
}

// ── Delete file from Storage ───────────────────────────────────

/**
 * Delete a file from Firebase Storage by its storage path.
 * @param {string} storagePath — e.g. "users/uid/uploads/1234_file.pdf"
 */
export async function deleteFile(storagePath) {
    try {
        if (!storagePath) return;
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
    } catch (err) {
        // Ignore "object not found" errors
        if (err.code !== 'storage/object-not-found') {
            console.warn('[Storage] deleteFile failed:', err.message);
        }
    }
}
