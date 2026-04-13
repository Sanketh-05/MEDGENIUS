import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Map Firebase error codes to user-friendly messages
const firebaseErrorMap = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
};

function getErrorMessage(error) {
    return firebaseErrorMap[error.code] || error.message || 'An error occurred. Please try again.';
}

export default function AuthPage() {
    const { login, signup, loginWithGoogle, resetPassword } = useAuth();
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '', course: 'MBBS' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'signup') {
                if (!form.name.trim()) throw new Error('Please enter your name');
                if (!form.email.trim()) throw new Error('Please enter your email');
                if (form.password.length < 6) throw new Error('Password must be at least 6 characters');
                await signup(form.name.trim(), form.email.trim().toLowerCase(), form.password, form.course);
            } else {
                if (!form.email.trim()) throw new Error('Please enter your email');
                if (!form.password) throw new Error('Please enter your password');
                await login(form.email.trim().toLowerCase(), form.password);
            }
        } catch (err) {
            setError(getErrorMessage(err));
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            setError(getErrorMessage(err));
        }
        setLoading(false);
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setResetMessage('');
        setError('');
        setResetLoading(true);
        try {
            await resetPassword(resetEmail);
            setResetMessage('✅ Password reset email sent! Check your inbox. Click the link to reset your password.');
            setResetEmail('');
            setTimeout(() => {
                setShowForgotPassword(false);
                setResetMessage('');
            }, 5000);
        } catch (err) {
            setError(getErrorMessage(err));
        }
        setResetLoading(false);
    };

    const courses = ['MBBS', 'BDS', 'Nursing', 'Allied Health Sciences', 'Other'];

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo">
                    <span className="logo-icon">🧬</span>
                    <h1>MEDGENIUS</h1>
                    <p>Learn Smart. Think Clinically.</p>
                </div>

                <div className="auth-card">
                    <div className="auth-tabs">
                        <button
                            className={`auth-tab${mode === 'login' ? ' active' : ''}`}
                            onClick={() => { setMode('login'); setError(''); }}
                        >
                            Login
                        </button>
                        <button
                            className={`auth-tab${mode === 'signup' ? ' active' : ''}`}
                            onClick={() => { setMode('signup'); setError(''); }}
                        >
                            Sign Up
                        </button>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {mode === 'signup' && (
                            <div className="input-group">
                                <label>Full Name</label>
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="Dr. John Smith"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                />
                            </div>
                        )}

                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                className="input-field"
                                type="email"
                                placeholder="you@medical.edu"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            />
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <input
                                className="input-field"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            />
                            {mode === 'login' && (
                                <div style={{ marginTop: '8px', textAlign: 'right' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotPassword(true)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--accent-primary)',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            textDecoration: 'underline',
                                            padding: '4px 0',
                                        }}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}
                        </div>

                        {mode === 'signup' && (
                            <div className="input-group">
                                <label>Course</label>
                                <select
                                    className="input-field"
                                    value={form.course}
                                    onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                                >
                                    {courses.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                            {loading ? '⏳ Please wait...' : (mode === 'login' ? '🔑 Login' : '🚀 Create Account')}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        margin: '18px 0',
                    }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>or</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                    </div>

                    {/* Google Sign-In Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px 20px',
                            borderRadius: 'var(--radius-md, 10px)',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-input, #1a2332)',
                            color: 'var(--text-primary, #e0e0e0)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.2s ease',
                            opacity: loading ? 0.6 : 1,
                        }}
                        onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.background = 'rgba(0, 230, 180, 0.08)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-input, #1a2332)'; }}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <span
                            style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
                            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                        >
                            {mode === 'login' ? 'Sign up' : 'Login'}
                        </span>
                    </div>
                </div>

                {/* Forgot Password Modal */}
                {showForgotPassword && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.65)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}>
                        <div style={{
                            background: 'var(--bg-secondary)',
                            padding: '32px',
                            borderRadius: '12px',
                            maxWidth: '420px',
                            width: '90%',
                            border: '1px solid var(--border-color)',
                        }}>
                            <h2 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>🔑 Reset Password</h2>
                            <p style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Enter your email address and we'll send you a link to reset your password.
                            </p>

                            {resetMessage && (
                                <div style={{
                                    padding: '12px',
                                    marginBottom: '16px',
                                    background: 'rgba(52, 168, 83, 0.1)',
                                    border: '1px solid #34a853',
                                    borderRadius: '8px',
                                    color: '#34a853',
                                    fontSize: '0.85rem',
                                }}>
                                    {resetMessage}
                                </div>
                            )}

                            {error && <div className="auth-error" style={{ marginBottom: '16px' }}>{error}</div>}

                            <form onSubmit={handleForgotPassword}>
                                <div className="input-group" style={{ marginBottom: '20px' }}>
                                    <label>Email Address</label>
                                    <input
                                        className="input-field"
                                        type="email"
                                        placeholder="you@medical.edu"
                                        value={resetEmail}
                                        onChange={e => setResetEmail(e.target.value)}
                                        disabled={resetLoading}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        style={{ flex: 1 }}
                                        disabled={resetLoading}
                                    >
                                        {resetLoading ? '⏳ Sending...' : '📧 Send Reset Link'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowForgotPassword(false); setResetEmail(''); setError(''); setResetMessage(''); }}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-input)',
                                            color: 'var(--text-primary)',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
