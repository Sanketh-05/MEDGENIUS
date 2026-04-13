// ═══════════════════════════════════════════════════════════════
// Firebase Configuration — MedGenius Medical AI App
// Services: Authentication, Firestore Database, Storage
// ═══════════════════════════════════════════════════════════════
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserSessionPersistence, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyA-2THAHNireP598MgIOJTB1kKiMd3uNTA",
    authDomain: "medgenius-web.firebaseapp.com",
    projectId: "medgenius-web",
    storageBucket: "medgenius-web.firebasestorage.app",
    messagingSenderId: "56210237575",
    appId: "1:56210237575:web:ec9724a8665ce3e527b022",
    measurementId: "G-S93STY8WLT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ── Auth ──────────────────────────────────────────────────────
export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence).catch(err => {
    console.warn('[Firebase] Session persistence setup failed:', err);
});
export const googleProvider = new GoogleAuthProvider();
export { sendPasswordResetEmail };

// ── Firestore Database ────────────────────────────────────────
// Stores per-user: profile, progress, saved notes, upload records
export const db = getFirestore(app);

// ── Firebase Storage ──────────────────────────────────────────
// Stores: uploaded PDFs/images, profile photos
export const storage = getStorage(app);
