import React, { useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════
// Animated Medical Concept Diagrams
// Interactive CSS/SVG animations for visual learning
// ═══════════════════════════════════════════════════════════════

const ANIMATIONS = {
    'myocardial infarction': HeartAnimation,
    'mi': HeartAnimation,
    'pneumonia': LungsAnimation,
    'diabetes mellitus': DiabetesAnimation,
    'diabetes': DiabetesAnimation,
};

export default function ConceptAnimation({ topicTitle }) {
    const key = topicTitle?.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
    const AnimComponent = ANIMATIONS[key];

    if (!AnimComponent) return null;

    return (
        <div className="glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
            <h2 style={{
                color: 'var(--accent-primary)',
                fontSize: '1.2rem',
                marginBottom: '16px',
                display: 'flex', alignItems: 'center', gap: '8px'
            }}>
                🎬 Concept Animation — {topicTitle}
            </h2>
            <AnimComponent />
        </div>
    );
}

// ─── Heart / MI Animation ───────────────────────────────────
function HeartAnimation() {
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(true);
    const steps = [
        { label: 'Normal coronary blood flow', desc: 'Oxygen-rich blood flows through patent coronary arteries to myocardium.' },
        { label: 'Atherosclerotic plaque buildup', desc: 'Cholesterol deposits narrow the coronary lumen over years (risk factors: smoking, HTN, DM, dyslipidemia).' },
        { label: 'Plaque rupture & thrombus', desc: 'Unstable plaque ruptures → platelet aggregation → thrombus formation → acute vessel occlusion.' },
        { label: 'Myocardial ischemia', desc: 'Blocked blood flow causes ischemia within minutes. Reversible if flow restored within 20 min.' },
        { label: 'Infarction & necrosis', desc: 'Prolonged ischemia (>20 min) → irreversible myocardial necrosis. Troponin I/T released into blood.' },
        { label: 'Clinical presentation', desc: 'Crushing substernal chest pain, radiation to left arm/jaw, diaphoresis, nausea. ECG: ST elevation (STEMI).' },
    ];

    useEffect(() => {
        if (!playing) return;
        const timer = setInterval(() => setStep(s => (s + 1) % steps.length), 3000);
        return () => clearInterval(timer);
    }, [playing]);

    const progress = ((step + 1) / steps.length) * 100;
    const clotSize = step >= 2 ? Math.min((step - 1) * 8, 20) : 0;
    const heartColor = step >= 4 ? '#ff4444' : step >= 3 ? '#ffaa00' : 'var(--accent-primary)';
    const heartScale = playing ? 'scale(1)' : 'scale(1)';

    return (
        <div>
            {/* SVG Heart Diagram */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <svg viewBox="0 0 300 260" width="300" height="260" style={{ filter: 'drop-shadow(0 4px 20px rgba(0,255,255,0.15))' }}>
                    {/* Heart body */}
                    <path d="M150,230 C80,180 20,140 20,90 C20,50 50,20 90,20 C110,20 130,30 150,55 C170,30 190,20 210,20 C250,20 280,50 280,90 C280,140 220,180 150,230Z"
                        fill="none" stroke={heartColor} strokeWidth="2.5"
                        style={{ transition: 'stroke 0.8s ease', animation: playing ? 'heartPulse 1.2s ease-in-out infinite' : 'none' }}
                    />
                    {/* Coronary artery */}
                    <path d="M150,60 C140,90 120,120 110,150 C100,175 95,195 100,210"
                        fill="none" stroke="#ff6b6b" strokeWidth="3" strokeLinecap="round" opacity="0.7"
                    />
                    <path d="M150,60 C160,90 180,120 190,150 C200,175 205,195 200,210"
                        fill="none" stroke="#ff6b6b" strokeWidth="3" strokeLinecap="round" opacity="0.7"
                    />
                    {/* Blood flow particles */}
                    {step < 2 && (
                        <>
                            <circle r="3" fill="#ff6b6b" opacity="0.8">
                                <animateMotion dur="2s" repeatCount="indefinite" path="M150,60 C140,90 120,120 110,150 C100,175 95,195 100,210" />
                            </circle>
                            <circle r="3" fill="#ff6b6b" opacity="0.8">
                                <animateMotion dur="2.5s" repeatCount="indefinite" path="M150,60 C160,90 180,120 190,150 C200,175 205,195 200,210" />
                            </circle>
                        </>
                    )}
                    {/* Plaque / Clot */}
                    {step >= 1 && (
                        <circle cx="125" cy="130" r={4 + clotSize / 2} fill="#ff9800"
                            opacity={Math.min(0.4 + step * 0.15, 0.95)}
                            style={{ transition: 'all 0.8s ease' }}
                        />
                    )}
                    {step >= 2 && (
                        <circle cx="125" cy="130" r={clotSize / 2 + 2} fill="#d32f2f"
                            opacity="0.9" style={{ transition: 'all 0.8s ease' }}
                        />
                    )}
                    {/* Ischemic zone */}
                    {step >= 3 && (
                        <path d="M100,150 C95,175 100,200 115,215 C130,225 145,228 150,230 C140,220 120,200 110,175 Z"
                            fill={step >= 4 ? '#ff4444' : '#ffaa00'}
                            opacity={step >= 4 ? 0.5 : 0.3}
                            style={{ transition: 'all 1s ease', animation: step >= 3 ? 'pulse 2s ease-in-out infinite' : 'none' }}
                        />
                    )}
                    {/* X mark for occlusion */}
                    {step >= 2 && (
                        <text x="120" y="135" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">✕</text>
                    )}
                </svg>
            </div>

            {/* Step info */}
            <div style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '16px',
                border: '1px solid var(--border-color)',
                minHeight: '90px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ background: 'var(--accent-primary)', color: '#000', fontWeight: 700, fontSize: '0.75rem', padding: '2px 10px', borderRadius: '12px' }}>
                        Step {step + 1}/{steps.length}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{steps[step].label}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                    {steps[step].desc}
                </p>
            </div>

            {/* Progress & Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="btn btn-sm btn-secondary" onClick={() => setPlaying(p => !p)} style={{ minWidth: '80px' }}>
                    {playing ? '⏸ Pause' : '▶ Play'}
                </button>
                <button className="btn btn-sm btn-outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
                    ← Prev
                </button>
                <button className="btn btn-sm btn-outline" onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1}>
                    Next →
                </button>
                <div className="progress-bar-track" style={{ flex: 1 }}>
                    <div className="progress-bar-fill" style={{ width: `${progress}%`, transition: 'width 0.5s ease' }} />
                </div>
            </div>
        </div>
    );
}

// ─── Lungs / Pneumonia Animation ─────────────────────────────
function LungsAnimation() {
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(true);
    const steps = [
        { label: 'Normal lung architecture', desc: 'Healthy alveoli with thin walls allow efficient gas exchange. O₂ diffuses into capillaries, CO₂ is exhaled.' },
        { label: 'Pathogen entry', desc: 'Bacteria (S. pneumoniae most common), viruses, or fungi enter the lower respiratory tract via aspiration/inhalation.' },
        { label: 'Inflammatory response', desc: 'Alveolar macrophages activate → neutrophil recruitment → cytokine release (IL-1, TNF-α) → inflammation.' },
        { label: 'Consolidation', desc: 'Alveoli fill with inflammatory exudate (pus, fluid, cellular debris). This is "consolidation" — dull percussion, bronchial breath sounds.' },
        { label: 'Clinical presentation', desc: 'Productive cough, fever, pleuritic chest pain, dyspnea, crackles on auscultation. CXR: lobar/patchy opacity.' },
    ];

    useEffect(() => {
        if (!playing) return;
        const timer = setInterval(() => setStep(s => (s + 1) % steps.length), 3500);
        return () => clearInterval(timer);
    }, [playing]);

    const consolidation = step >= 3;
    const progress = ((step + 1) / steps.length) * 100;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <svg viewBox="0 0 300 240" width="300" height="240" style={{ filter: 'drop-shadow(0 4px 20px rgba(0,255,255,0.15))' }}>
                    {/* Trachea */}
                    <rect x="140" y="10" width="20" height="50" rx="5" fill="none" stroke="var(--accent-primary)" strokeWidth="2" />
                    {/* Bronchi */}
                    <line x1="150" y1="60" x2="100" y2="100" stroke="var(--accent-primary)" strokeWidth="2" />
                    <line x1="150" y1="60" x2="200" y2="100" stroke="var(--accent-primary)" strokeWidth="2" />

                    {/* Left lung */}
                    <ellipse cx="90" cy="150" rx="65" ry="80" fill="none" stroke="var(--accent-primary)" strokeWidth="2" opacity="0.8" />
                    {/* Alveoli - left */}
                    {[0, 1, 2, 3, 4, 5].map(i => (
                        <circle key={`l${i}`}
                            cx={60 + (i % 3) * 30} cy={120 + Math.floor(i / 3) * 40}
                            r="12" fill="none" stroke="rgba(0,255,200,0.4)" strokeWidth="1"
                        />
                    ))}

                    {/* Right lung */}
                    <ellipse cx="210" cy="150" rx="65" ry="80" fill="none"
                        stroke={consolidation ? '#ff6b6b' : 'var(--accent-primary)'}
                        strokeWidth="2" opacity="0.8"
                        style={{ transition: 'stroke 0.8s' }}
                    />
                    {/* Alveoli - right (affected) */}
                    {[0, 1, 2, 3, 4, 5].map(i => (
                        <circle key={`r${i}`}
                            cx={180 + (i % 3) * 30} cy={120 + Math.floor(i / 3) * 40}
                            r="12"
                            fill={step >= 2 ? (consolidation ? 'rgba(255,100,100,0.4)' : 'rgba(255,180,0,0.2)') : 'none'}
                            stroke={step >= 2 ? '#ff9800' : 'rgba(0,255,200,0.4)'}
                            strokeWidth="1"
                            style={{ transition: 'all 0.8s ease' }}
                        />
                    ))}

                    {/* Bacteria */}
                    {step >= 1 && (
                        <>
                            <circle cx="200" cy="130" r="4" fill="#ff9800" opacity="0.8">
                                {playing && <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />}
                            </circle>
                            <circle cx="220" cy="145" r="3" fill="#ff9800" opacity="0.7">
                                {playing && <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2s" repeatCount="indefinite" />}
                            </circle>
                            <circle cx="215" cy="160" r="3.5" fill="#ff9800" opacity="0.6">
                                {playing && <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.8s" repeatCount="indefinite" />}
                            </circle>
                        </>
                    )}

                    {/* Fluid in alveoli */}
                    {consolidation && (
                        <ellipse cx="210" cy="160" rx="40" ry="25" fill="rgba(255,100,100,0.2)"
                            style={{ animation: 'pulse 2s ease-in-out infinite' }}
                        />
                    )}
                </svg>
            </div>

            <div style={{
                background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
                padding: '16px', marginBottom: '16px', border: '1px solid var(--border-color)', minHeight: '90px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ background: 'var(--accent-primary)', color: '#000', fontWeight: 700, fontSize: '0.75rem', padding: '2px 10px', borderRadius: '12px' }}>
                        Step {step + 1}/{steps.length}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{steps[step].label}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                    {steps[step].desc}
                </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="btn btn-sm btn-secondary" onClick={() => setPlaying(p => !p)} style={{ minWidth: '80px' }}>
                    {playing ? '⏸ Pause' : '▶ Play'}
                </button>
                <button className="btn btn-sm btn-outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Prev</button>
                <button className="btn btn-sm btn-outline" onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1}>Next →</button>
                <div className="progress-bar-track" style={{ flex: 1 }}>
                    <div className="progress-bar-fill" style={{ width: `${progress}%`, transition: 'width 0.5s ease' }} />
                </div>
            </div>
        </div>
    );
}

// ─── Diabetes Animation ──────────────────────────────────────
function DiabetesAnimation() {
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(true);
    const steps = [
        { label: 'Normal glucose metabolism', desc: 'Pancreatic beta cells sense blood glucose → release insulin → insulin binds cell receptors → GLUT4 channels open → glucose enters cells.' },
        { label: 'Type 1: Autoimmune destruction', desc: 'T-cells attack pancreatic beta cells → absolute insulin deficiency. Usually presents in childhood/adolescence with DKA.' },
        { label: 'Type 2: Insulin resistance', desc: 'Peripheral cells become resistant to insulin → compensatory hyperinsulinemia → eventual beta cell exhaustion → hyperglycemia.' },
        { label: 'Hyperglycemia & complications', desc: 'Chronic high glucose → non-enzymatic glycosylation → microvascular (retinopathy, nephropathy, neuropathy) & macrovascular complications.' },
        { label: 'Diagnosis & monitoring', desc: 'FBS ≥126 mg/dL, PPBS ≥200, HbA1c ≥6.5%. HbA1c reflects 3-month average glucose control.' },
    ];

    useEffect(() => {
        if (!playing) return;
        const timer = setInterval(() => setStep(s => (s + 1) % steps.length), 3500);
        return () => clearInterval(timer);
    }, [playing]);

    const progress = ((step + 1) / steps.length) * 100;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <svg viewBox="0 0 320 220" width="320" height="220" style={{ filter: 'drop-shadow(0 4px 20px rgba(0,255,255,0.15))' }}>
                    {/* Pancreas */}
                    <ellipse cx="80" cy="100" rx="55" ry="30" fill="none" stroke="var(--accent-primary)" strokeWidth="2" />
                    <text x="80" y="95" textAnchor="middle" fill="var(--accent-primary)" fontSize="10" fontWeight="600">Pancreas</text>
                    <text x="80" y="110" textAnchor="middle" fill="var(--text-muted)" fontSize="8">β cells</text>

                    {/* Insulin molecules */}
                    {step === 0 && (
                        <>
                            <circle cx="140" cy="85" r="5" fill="var(--accent-secondary)" opacity="0.8">
                                <animate attributeName="cx" values="135;180;220" dur="2s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="140" cy="105" r="5" fill="var(--accent-secondary)" opacity="0.8">
                                <animate attributeName="cx" values="135;180;220" dur="2.5s" repeatCount="indefinite" />
                            </circle>
                            <text x="160" y="70" fill="var(--accent-secondary)" fontSize="8">insulin →</text>
                        </>
                    )}

                    {/* Reduced/no insulin for Type 1 */}
                    {step === 1 && (
                        <>
                            <line x1="55" y1="80" x2="105" y2="120" stroke="#ff4444" strokeWidth="2" opacity="0.8" />
                            <line x1="105" y1="80" x2="55" y2="120" stroke="#ff4444" strokeWidth="2" opacity="0.8" />
                            <text x="80" y="145" textAnchor="middle" fill="#ff6b6b" fontSize="9">T-cell attack!</text>
                        </>
                    )}

                    {/* Cell */}
                    <rect x="230" y="70" width="70" height="60" rx="10" fill="none"
                        stroke={step >= 2 ? '#ff9800' : 'var(--accent-primary)'}
                        strokeWidth="2" style={{ transition: 'stroke 0.5s' }}
                    />
                    <text x="265" y="95" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">Body Cell</text>
                    <text x="265" y="110" textAnchor="middle" fill="var(--text-muted)" fontSize="8">GLUT4</text>

                    {/* Receptor (door) */}
                    <rect x="225" y="90" width="5" height="15" rx="1"
                        fill={step === 0 ? 'var(--accent-primary)' : (step >= 2 ? '#ff9800' : '#888')}
                        style={{ transition: 'fill 0.5s' }}
                    />

                    {/* Glucose molecules (scattered when can't enter) */}
                    {[0, 1, 2, 3].map(i => (
                        <circle key={`g${i}`}
                            cx={step >= 2 ? 190 + i * 12 : 250 + (i % 2) * 15}
                            cy={step >= 2 ? 80 + i * 10 : 85 + i * 8}
                            r="4" fill="#ffeb3b" opacity="0.7"
                            style={{ transition: 'all 1s ease' }}
                        >
                            {step >= 3 && playing && (
                                <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.5s" repeatCount="indefinite" />
                            )}
                        </circle>
                    ))}

                    {/* Glucose label */}
                    <text x={step >= 2 ? 195 : 260} y={step >= 2 ? 65 : 75} fill="#ffeb3b" fontSize="8" textAnchor="middle" style={{ transition: 'all 1s' }}>
                        {step >= 2 ? '🔴 glucose stuck!' : 'glucose'}
                    </text>

                    {/* Complications arrows */}
                    {step >= 3 && (
                        <>
                            <text x="160" y="175" textAnchor="middle" fill="#ff6b6b" fontSize="9">⚠️ Retinopathy</text>
                            <text x="160" y="195" textAnchor="middle" fill="#ff6b6b" fontSize="9">⚠️ Nephropathy</text>
                            <text x="160" y="215" textAnchor="middle" fill="#ff6b6b" fontSize="9">⚠️ Neuropathy</text>
                        </>
                    )}
                </svg>
            </div>

            <div style={{
                background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
                padding: '16px', marginBottom: '16px', border: '1px solid var(--border-color)', minHeight: '90px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ background: 'var(--accent-primary)', color: '#000', fontWeight: 700, fontSize: '0.75rem', padding: '2px 10px', borderRadius: '12px' }}>
                        Step {step + 1}/{steps.length}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{steps[step].label}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                    {steps[step].desc}
                </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="btn btn-sm btn-secondary" onClick={() => setPlaying(p => !p)} style={{ minWidth: '80px' }}>
                    {playing ? '⏸ Pause' : '▶ Play'}
                </button>
                <button className="btn btn-sm btn-outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Prev</button>
                <button className="btn btn-sm btn-outline" onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1}>Next →</button>
                <div className="progress-bar-track" style={{ flex: 1 }}>
                    <div className="progress-bar-fill" style={{ width: `${progress}%`, transition: 'width 0.5s ease' }} />
                </div>
            </div>
        </div>
    );
}
