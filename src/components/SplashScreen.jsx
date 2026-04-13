import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onComplete }) {
    const [phase, setPhase] = useState(0); // 0=logo, 1=text, 2=progress, 3=fadeout
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Phase 1: Logo appears (after mount)
        const t1 = setTimeout(() => setPhase(1), 400);
        // Phase 2: Progress bar
        const t2 = setTimeout(() => setPhase(2), 1200);
        // Phase 3: Fade out
        const t3 = setTimeout(() => setPhase(3), 3200);
        // Complete
        const t4 = setTimeout(() => onComplete(), 3800);

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }, [onComplete]);

    // Progress bar animation
    useEffect(() => {
        if (phase < 2) return;
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) { clearInterval(interval); return 100; }
                return p + 2;
            });
        }, 30);
        return () => clearInterval(interval);
    }, [phase]);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at center, #0a1628 0%, #06101e 60%, #020810 100%)',
            opacity: phase === 3 ? 0 : 1,
            transition: 'opacity 0.6s ease-out',
            overflow: 'hidden',
        }}>
            {/* Animated Background Particles */}
            <div className="splash-particles" />

            {/* Glow Ring Behind Logo */}
            <div style={{
                position: 'absolute',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,191,166,0.12) 0%, transparent 70%)',
                filter: 'blur(40px)',
                opacity: phase >= 1 ? 1 : 0,
                transform: phase >= 1 ? 'scale(1)' : 'scale(0.3)',
                transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }} />

            {/* DNA Helix Animation */}
            <div style={{
                position: 'relative',
                width: '120px',
                height: '120px',
                opacity: phase >= 0 ? 1 : 0,
                transform: phase >= 0 ? 'scale(1) rotate(0deg)' : 'scale(0.3) rotate(-180deg)',
                transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
                <svg viewBox="0 0 120 120" width="120" height="120" style={{ filter: 'drop-shadow(0 0 20px rgba(0,191,166,0.5))' }}>
                    {/* Outer ring */}
                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(0,191,166,0.15)" strokeWidth="1.5" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke="url(#splashGrad)" strokeWidth="2"
                        strokeDasharray="340" strokeDashoffset={phase >= 1 ? '0' : '340'}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    />
                    {/* DNA Helix */}
                    <g style={{ animation: 'splashRotate 8s linear infinite' }}>
                        {[0, 1, 2, 3, 4, 5].map(i => {
                            const angle = (i * 60) * (Math.PI / 180);
                            const r1 = 28, r2 = 18;
                            const x1 = 60 + r1 * Math.cos(angle);
                            const y1 = 60 + r1 * Math.sin(angle);
                            const x2 = 60 + r2 * Math.cos(angle + Math.PI);
                            const y2 = 60 + r2 * Math.sin(angle + Math.PI);
                            return (
                                <g key={i}>
                                    <line x1={x1} y1={y1} x2={x2} y2={y2}
                                        stroke="rgba(0,191,166,0.3)" strokeWidth="1.5" />
                                    <circle cx={x1} cy={y1} r="4" fill="url(#splashGrad)" opacity="0.9">
                                        <animate attributeName="r" values="3;5;3" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
                                    </circle>
                                    <circle cx={x2} cy={y2} r="3" fill="#7c4dff" opacity="0.7">
                                        <animate attributeName="r" values="2;4;2" dur={`${1.8 + i * 0.15}s`} repeatCount="indefinite" />
                                    </circle>
                                </g>
                            );
                        })}
                    </g>
                    {/* Center icon */}
                    <text x="60" y="68" textAnchor="middle" fontSize="32" fill="url(#splashGrad)"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(0,230,180,0.6))' }}>
                        🧬
                    </text>
                    <defs>
                        <linearGradient id="splashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00bfa6" />
                            <stop offset="50%" stopColor="#0288d1" />
                            <stop offset="100%" stopColor="#7c4dff" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* App Name */}
            <h1 style={{
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                fontSize: '2.8rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #00bfa6 0%, #0288d1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginTop: '24px',
                marginBottom: '8px',
                letterSpacing: '-0.5px',
                opacity: phase >= 1 ? 1 : 0,
                transform: phase >= 1 ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
            }}>
                MEDGENIUS
            </h1>

            {/* Tagline */}
            <p style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '1rem',
                fontWeight: 400,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginBottom: '40px',
                opacity: phase >= 1 ? 1 : 0,
                transform: phase >= 1 ? 'translateY(0)' : 'translateY(15px)',
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
            }}>
                Learn Smart. Think Clinically.
            </p>

            {/* Progress Bar */}
            <div style={{
                width: '220px',
                height: '3px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '4px',
                overflow: 'hidden',
                opacity: phase >= 2 ? 1 : 0,
                transition: 'opacity 0.4s ease',
            }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #00bfa6, #0288d1)',
                    borderRadius: '4px',
                    transition: 'width 0.05s linear',
                    boxShadow: '0 0 12px rgba(0,191,166,0.5)',
                }} />
            </div>

            {/* Loading Text */}
            <p style={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: '0.75rem',
                marginTop: '16px',
                letterSpacing: '1px',
                opacity: phase >= 2 ? 1 : 0,
                transition: 'opacity 0.4s ease 0.2s',
            }}>
                {progress < 30 ? 'Initializing...' : progress < 60 ? 'Loading knowledge base...' : progress < 90 ? 'Preparing your workspace...' : 'Ready!'}
            </p>

            {/* Floating orbs decoration */}
            {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    width: `${8 + i * 4}px`,
                    height: `${8 + i * 4}px`,
                    borderRadius: '50%',
                    background: i % 2 === 0
                        ? 'radial-gradient(circle, rgba(0,191,166,0.3), transparent)'
                        : 'radial-gradient(circle, rgba(124,77,255,0.3), transparent)',
                    left: `${10 + i * 15}%`,
                    top: `${15 + (i * 13) % 70}%`,
                    animation: `splashFloat ${3 + i * 0.5}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.3}s`,
                    filter: 'blur(1px)',
                }} />
            ))}

            <style>{`
                @keyframes splashRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes splashFloat {
                    0% { transform: translateY(0px) scale(1); opacity: 0.4; }
                    100% { transform: translateY(-30px) scale(1.3); opacity: 0.8; }
                }
                .splash-particles {
                    position: absolute;
                    inset: 0;
                    background-image:
                        radial-gradient(1px 1px at 20% 30%, rgba(0,191,166,0.3) 0%, transparent 100%),
                        radial-gradient(1px 1px at 40% 70%, rgba(124,77,255,0.25) 0%, transparent 100%),
                        radial-gradient(1px 1px at 80% 20%, rgba(0,191,166,0.2) 0%, transparent 100%),
                        radial-gradient(1.5px 1.5px at 60% 50%, rgba(255,255,255,0.15) 0%, transparent 100%),
                        radial-gradient(1px 1px at 10% 80%, rgba(0,191,166,0.2) 0%, transparent 100%),
                        radial-gradient(1px 1px at 70% 90%, rgba(124,77,255,0.2) 0%, transparent 100%),
                        radial-gradient(1.5px 1.5px at 50% 10%, rgba(255,255,255,0.1) 0%, transparent 100%),
                        radial-gradient(1px 1px at 90% 60%, rgba(0,191,166,0.15) 0%, transparent 100%);
                    animation: splashParticlesDrift 15s linear infinite;
                }
                @keyframes splashParticlesDrift {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-20px); }
                }
            `}</style>
        </div>
    );
}
