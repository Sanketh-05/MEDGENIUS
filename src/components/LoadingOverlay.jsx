import React from 'react';

/**
 * LoadingOverlay — Reusable animated loader with contextual status messages.
 * Props:
 *   - visible (bool): whether to show the overlay
 *   - statusText (string): current status message
 *   - fullScreen (bool): if true, fixed overlay; otherwise inline flex container
 */
export default function LoadingOverlay({ visible = true, statusText = 'Processing...', fullScreen = true }) {
    if (!visible) return null;

    const containerStyle = fullScreen ? {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10, 22, 40, 0.88)',
        backdropFilter: 'blur(8px)',
    } : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        gap: '20px',
    };

    return (
        <div style={containerStyle}>
            {/* DNA Helix Spinner */}
            <div style={{ position: 'relative', width: '72px', height: '72px' }}>
                <svg viewBox="0 0 72 72" width="72" height="72" style={{ animation: 'spin 2.5s linear infinite' }}>
                    <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(0,191,166,0.15)" strokeWidth="2" />
                    <circle cx="36" cy="36" r="30" fill="none" stroke="url(#loaderGrad)" strokeWidth="2.5"
                        strokeDasharray="188" strokeDashoffset="60" strokeLinecap="round" />
                    {/* Orbiting dots */}
                    {[0, 1, 2].map(i => {
                        const angle = (i * 120) * (Math.PI / 180);
                        const cx = 36 + 30 * Math.cos(angle);
                        const cy = 36 + 30 * Math.sin(angle);
                        return (
                            <circle key={i} cx={cx} cy={cy} r="3" fill="#00bfa6" opacity="0.9">
                                <animate attributeName="r" values="2;4;2" dur={`${1.2 + i * 0.3}s`} repeatCount="indefinite" />
                            </circle>
                        );
                    })}
                    <defs>
                        <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00bfa6" />
                            <stop offset="100%" stopColor="#0288d1" />
                        </linearGradient>
                    </defs>
                </svg>
                {/* Center pulse */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #00bfa6, transparent)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                }} />
            </div>

            {/* Status Text */}
            <p style={{
                color: 'var(--text-secondary, #8da4c2)',
                fontSize: '0.95rem',
                fontWeight: 500,
                letterSpacing: '0.5px',
                textAlign: 'center',
                animation: 'fadeIn 0.5s ease',
                maxWidth: '300px',
            }}>
                {statusText}
            </p>

            {/* Shimmer bar */}
            <div style={{
                width: '180px',
                height: '3px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '4px',
                overflow: 'hidden',
            }}>
                <div style={{
                    width: '40%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, #00bfa6, transparent)',
                    borderRadius: '4px',
                    animation: 'shimmer 1.5s infinite',
                }} />
            </div>
        </div>
    );
}
