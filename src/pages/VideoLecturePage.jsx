// ═══════════════════════════════════════════════════════════════
// Video Lecture Page — Full Pipeline Integration
// YouTube URL / MP4 Upload → FastAPI Backend → Whisper + Ollama
// Outputs: Transcript | Summary | Notes | Flashcards | Quiz
// ═══════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from 'react';
import { useProgress } from '../context/StudentProgressContext';

// Uses Vite proxy → forwarded to FastAPI at http://localhost:8000
const BACKEND = '/api/lecture';

const STAGES = [
    { key: 'downloading', label: 'Downloading lecture', icon: '⬇️' },
    { key: 'extracting', label: 'Extracting audio', icon: '🎵' },
    { key: 'transcribing', label: 'Generating transcript', icon: '📝' },
    { key: 'cleaning', label: 'Cleaning transcript', icon: '🧹' },
    { key: 'analysing', label: 'AI analysis (Ollama)', icon: '🤖' },
    { key: 'done', label: 'Complete!', icon: '✅' },
];

function stageIndex(status) {
    const map = { queued: 0, downloading: 0, extracting: 1, transcribing: 2, cleaning: 3, analysing: 4, done: 5 };
    return map[status] ?? 0;
}

export default function VideoLecturePage({ setActivePage, setSelectedTopic, setCustomTopicData }) {
    const [mode, setMode] = useState('input'); // 'input' | 'processing' | 'results'

    // Input
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);

    // Processing
    const [jobId, setJobId] = useState(null);
    const [jobStatus, setJobStatus] = useState({ status: 'queued', stage: '', progress: 0 });
    const [pollingRef, setPollingRef] = useState(null);

    // Results
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('transcript');

    // Quiz state
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState({});

    // Flashcard flip
    const [flipped, setFlipped] = useState({});

    const { trackVideo } = useProgress();

    // ── Clean up polling on unmount ───────────────────────────
    useEffect(() => {
        return () => { if (pollingRef) clearInterval(pollingRef); };
    }, [pollingRef]);

    // ── Poll job status ───────────────────────────────────────
    const startPolling = (id) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${BACKEND}/poll/${id}`);
                if (!res.ok) {
                    clearInterval(interval);
                    setJobStatus(s => ({ ...s, status: 'error', stage: 'Server error', error: `HTTP ${res.status}` }));
                    return;
                }
                const data = await res.json();
                setJobStatus(data);

                if (data.status === 'done') {
                    clearInterval(interval);
                    setResult(data.result);
                    setMode('results');
                    setActiveTab('transcript');
                    trackVideo?.();
                }
                if (data.status === 'error') {
                    clearInterval(interval);
                }
            } catch (err) {
                clearInterval(interval);
                setJobStatus(s => ({ ...s, status: 'error', stage: 'Cannot connect to backend', error: String(err) }));
            }
        }, 2000);
        setPollingRef(interval);
    };

    // ── Submit YouTube URL ────────────────────────────────────
    const handleYoutubeSubmit = async () => {
        const url = youtubeUrl.trim();
        if (!url) return;
        try {
            const res = await fetch(`${BACKEND}/youtube`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            if (!res.ok) {
                const err = await res.json();
                setJobStatus({ status: 'error', stage: 'Submission failed', error: err.detail || 'Unknown error', progress: 0 });
                setMode('processing');
                return;
            }
            const data = await res.json();
            setJobId(data.job_id);
            setJobStatus({ status: 'queued', stage: 'Queued…', progress: 0 });
            setMode('processing');
            startPolling(data.job_id);
        } catch (err) {
            setJobStatus({ status: 'error', stage: 'Cannot reach backend', error: 'Is the backend running? Start it with start.bat', progress: 0 });
            setMode('processing');
        }
    };

    // ── Submit file upload ────────────────────────────────────
    const handleFileUpload = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch(`${BACKEND}/upload`, {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) {
                const err = await res.json();
                setJobStatus({ status: 'error', stage: 'Upload failed', error: err.detail || 'Unknown error', progress: 0 });
                setMode('processing');
                return;
            }
            const data = await res.json();
            setJobId(data.job_id);
            setJobStatus({ status: 'queued', stage: 'Queued…', progress: 0 });
            setMode('processing');
            startPolling(data.job_id);
        } catch (err) {
            setJobStatus({ status: 'error', stage: 'Cannot reach backend', error: 'Is the backend running? Start it with start.bat', progress: 0 });
            setMode('processing');
        }
    };

    const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer?.files?.[0]); };

    const reset = () => {
        if (pollingRef) clearInterval(pollingRef);
        setMode('input'); setJobId(null); setResult(null);
        setJobStatus({ status: 'queued', stage: '', progress: 0 });
        setYoutubeUrl(''); setQuizAnswers({}); setQuizSubmitted({}); setFlipped({});
    };

    // ── Pass results to quiz/flashcard pages ──────────────────
    const useInApp = () => {
        if (!result) return;
        const topicData = {
            title: 'Video Lecture',
            content: result.transcript,
            quiz: result.quiz?.map(q => ({ question: q.question, options: q.options, correctIndex: q.correct, explanation: q.explanation })),
            flashcards: result.flashcards?.map(f => ({ front: f.front, back: f.back })),
            notes: result.notes,
        };
        setCustomTopicData?.(topicData);
        setSelectedTopic?.('Video Lecture');
    };

    // ════════════════════════════════════════════════════════════
    //  INPUT VIEW
    // ════════════════════════════════════════════════════════════
    if (mode === 'input') {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1>📺 Video Lecture Pipeline</h1>
                    <p>Upload an MP4 lecture or paste a YouTube link — get automatic transcript, high-yield notes, flashcards &amp; quiz</p>
                </div>

                {/* How It Works */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
                    {[
                        { icon: '⬇️', label: 'yt-dlp download' },
                        { icon: '🎵', label: 'FFmpeg audio' },
                        { icon: '🎙️', label: 'Whisper STT' },
                        { icon: '🤖', label: 'Ollama LLM' },
                        { icon: '📋', label: 'Notes + Quiz' },
                    ].map((s, i) => (
                        <div key={i} style={{ textAlign: 'center', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>{s.icon}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* YouTube Input */}
                <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '12px', color: 'var(--accent-primary)' }}>🔗 YouTube Lecture Link</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            className="input-field"
                            style={{ flex: 1, padding: '12px 16px' }}
                            placeholder="https://youtube.com/watch?v=..."
                            value={youtubeUrl}
                            onChange={e => setYoutubeUrl(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleYoutubeSubmit()}
                        />
                        <button className="btn btn-primary" onClick={handleYoutubeSubmit} disabled={!youtubeUrl.trim()}>
                            ⚡ Process
                        </button>
                    </div>
                </div>

                {/* File Upload */}
                <div
                    className="glass-card"
                    style={{ padding: '40px 24px', textAlign: 'center', marginBottom: '20px', border: `2px dashed ${dragOver ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', transition: 'all 0.2s' }}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                >
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📁</div>
                    <h4 style={{ color: 'var(--accent-primary)', marginBottom: '6px' }}>Drag &amp; Drop Video / Audio</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>MP4, MP3, WAV, M4A, WEBM, MKV — up to 500 MB</p>
                    <input ref={fileRef} type="file" accept="video/*,audio/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e.target.files?.[0])} />
                </div>

                {/* Backend setup note */}
                <div style={{ padding: '14px 18px', background: 'rgba(255,183,77,0.07)', borderRadius: '10px', border: '1px solid rgba(255,183,77,0.2)', fontSize: '0.83rem', color: 'var(--accent-tertiary)' }}>
                    <strong>⚙️ Backend Required:</strong> Run <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px' }}>medgenius-backend\start.bat</code> before processing.
                    Also ensure <strong>Ollama</strong> is running with <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px' }}>ollama pull mistral</code>.
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════
    //  PROCESSING VIEW
    // ════════════════════════════════════════════════════════════
    if (mode === 'processing') {
        const isError = jobStatus.status === 'error';
        const currentStage = stageIndex(jobStatus.status);
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1>⚙️ Processing Lecture…</h1>
                    <p>{isError ? 'An error occurred' : 'This may take a few minutes for long lectures'}</p>
                </div>
                <div className="glass-card" style={{ padding: '32px', maxWidth: '640px', margin: '0 auto' }}>
                    {/* Stage Steps */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                        {STAGES.map((s, i) => {
                            const done = i < currentStage;
                            const active = i === currentStage && !isError;
                            return (
                                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: (done || active) ? 1 : 0.35, transition: 'opacity 0.3s' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: `2px solid ${done ? 'var(--accent-primary)' : active ? 'var(--accent-secondary)' : 'var(--border-color)'}`, background: done ? 'rgba(0,230,180,0.15)' : active ? 'rgba(114,137,255,0.15)' : 'transparent', flexShrink: 0 }}>
                                        {done ? '✓' : s.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', color: active ? 'var(--accent-secondary)' : done ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: active || done ? 600 : 400 }}>{s.label}</div>
                                        {active && jobStatus.stage && (
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{jobStatus.stage}</div>
                                        )}
                                    </div>
                                    {active && <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: '1rem' }}>⚙️</span>}
                                </div>
                            );
                        })}
                    </div>

                    {/* Progress Bar */}
                    {!isError && (
                        <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '20px' }}>
                            <div style={{ height: '100%', borderRadius: '3px', background: 'var(--gradient-primary)', width: `${jobStatus.progress || 0}%`, transition: 'width 0.8s ease' }} />
                        </div>
                    )}

                    {isError && (
                        <div style={{ padding: '16px', background: 'rgba(255,107,107,0.08)', borderLeft: '3px solid var(--accent-danger)', borderRadius: '0 8px 8px 0', marginBottom: '20px' }}>
                            <strong style={{ color: 'var(--accent-danger)' }}>⚠️ {jobStatus.stage}</strong>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', marginTop: '6px' }}>{jobStatus.error}</p>
                        </div>
                    )}
                    <button className="btn btn-outline" onClick={reset}>← Start Over</button>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════
    //  RESULTS VIEW
    // ════════════════════════════════════════════════════════════
    const TABS = [
        { id: 'transcript', label: '📄 Transcript' },
        { id: 'summary', label: '📋 Summary' },
        { id: 'notes', label: '📚 Notes' },
        { id: 'flashcards', label: '🃏 Flashcards' },
        { id: 'quiz', label: '📝 Quiz' },
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>✅ Lecture Processed</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        {result?.transcript?.split(/\s+/).length || 0} words transcribed · {result?.notes?.length || 0} note sections · {result?.flashcards?.length || 0} flashcards · {result?.quiz?.length || 0} quiz questions
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary btn-sm" onClick={useInApp}>📤 Use in Quiz &amp; Flashcards</button>
                    <button className="btn btn-outline btn-sm" onClick={reset}>← New Lecture</button>
                </div>
            </div>

            {/* Tab Bar */}
            <div className="tabs" style={{ marginBottom: '24px' }}>
                {TABS.map(t => (
                    <button key={t.id} className={`tab${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Transcript Tab ── */}
            {activeTab === 'transcript' && (
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                        <h3 style={{ color: 'var(--accent-primary)' }}>📄 Full Transcript</h3>
                        <button className="btn btn-sm btn-outline" onClick={() => navigator.clipboard.writeText(result?.transcript || '')}>📋 Copy</button>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.75, maxHeight: '500px', overflowY: 'auto', padding: '4px' }}>
                        {result?.transcript || 'No transcript available.'}
                    </div>
                </div>
            )}

            {/* ── Summary Tab ── */}
            {activeTab === 'summary' && (
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ color: 'var(--accent-primary)', marginBottom: '16px' }}>📋 Lecture Summary</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                        {result?.summary || 'No summary generated.'}
                    </p>
                </div>
            )}

            {/* ── Notes Tab ── */}
            {activeTab === 'notes' && (
                <div>
                    {result?.notes?.length > 0 ? result.notes.map((section, i) => (
                        <div key={i} className="glass-card" style={{ padding: '22px', marginBottom: '14px', borderLeft: '4px solid var(--accent-primary)' }}>
                            <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '1.05rem' }}>{section.heading}</h3>
                            <ul style={{ paddingLeft: '18px', margin: 0 }}>
                                {(section.bullets || []).map((b, j) => (
                                    <li key={j} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '6px', lineHeight: 1.6 }}>{b}</li>
                                ))}
                            </ul>
                        </div>
                    )) : (
                        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No notes generated.</div>
                    )}
                </div>
            )}

            {/* ── Flashcards Tab ── */}
            {activeTab === 'flashcards' && (
                <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>Click any card to flip it</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {result?.flashcards?.length > 0 ? result.flashcards.map((card, i) => (
                            <div key={i} onClick={() => setFlipped(p => ({ ...p, [i]: !p[i] }))} style={{ cursor: 'pointer', minHeight: '160px', perspective: '1000px' }}>
                                <div style={{ position: 'relative', width: '100%', height: '160px', transformStyle: 'preserve-3d', transition: 'transform 0.5s', transform: flipped[i] ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                                    {/* Front */}
                                    <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', padding: '20px', borderRadius: '12px', background: 'rgba(114,137,255,0.08)', border: '1px solid rgba(114,137,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                        <div><div style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>Question</div>{card.front}</div>
                                    </div>
                                    {/* Back */}
                                    <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', padding: '20px', borderRadius: '12px', background: 'rgba(0,230,180,0.07)', border: '1px solid rgba(0,230,180,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <div><div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>Answer</div>{card.back}</div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>No flashcards generated.</div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Quiz Tab ── */}
            {activeTab === 'quiz' && (
                <div>
                    {result?.quiz?.length > 0 ? result.quiz.map((q, qIdx) => {
                        const isSubmitted = quizSubmitted[qIdx] !== undefined;
                        const isCorrect = quizSubmitted[qIdx];
                        return (
                            <div key={qIdx} className="glass-card" style={{ padding: '22px', marginBottom: '16px', borderLeft: isSubmitted ? `4px solid ${isCorrect ? 'var(--accent-primary)' : 'var(--accent-danger)'}` : '4px solid rgba(114,137,255,0.3)' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '14px' }}>
                                    <span style={{ minWidth: '26px', height: '26px', borderRadius: '50%', background: 'rgba(114,137,255,0.15)', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0, marginTop: '2px' }}>{qIdx + 1}</span>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>{q.question}</p>
                                    {isSubmitted && <span style={{ flexShrink: 0, fontSize: '1.3rem' }}>{isCorrect ? '✅' : '❌'}</span>}
                                </div>
                                <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
                                    {q.options.map((opt, optIdx) => {
                                        let border = '1px solid var(--border-color)';
                                        let bg = 'rgba(255,255,255,0.02)';
                                        if (isSubmitted) {
                                            if (optIdx === q.correct) { border = '1px solid var(--accent-primary)'; bg = 'rgba(0,230,180,0.08)'; }
                                            else if (optIdx === quizAnswers[qIdx] && optIdx !== q.correct) { border = '1px solid var(--accent-danger)'; bg = 'rgba(255,107,107,0.06)'; }
                                        } else if (quizAnswers[qIdx] === optIdx) {
                                            border = '1px solid var(--accent-secondary)'; bg = 'rgba(114,137,255,0.1)';
                                        }
                                        return (
                                            <div key={optIdx} onClick={() => { if (!isSubmitted) setQuizAnswers(p => ({ ...p, [qIdx]: optIdx })); }}
                                                style={{ padding: '11px 16px', borderRadius: '9px', border, background: bg, cursor: isSubmitted ? 'default' : 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.18s' }}>
                                                <span style={{ minWidth: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', background: quizAnswers[qIdx] === optIdx ? (isSubmitted ? (optIdx === q.correct ? 'var(--accent-primary)' : 'var(--accent-danger)') : 'var(--accent-secondary)') : 'rgba(255,255,255,0.05)', color: quizAnswers[qIdx] === optIdx ? '#fff' : 'var(--text-muted)' }}>
                                                    {String.fromCharCode(65 + optIdx)}
                                                </span>
                                                {opt}
                                            </div>
                                        );
                                    })}
                                </div>
                                {!isSubmitted ? (
                                    <button className="btn btn-primary" style={{ fontSize: '0.88rem' }} onClick={() => { if (quizAnswers[qIdx] !== undefined) setQuizSubmitted(p => ({ ...p, [qIdx]: quizAnswers[qIdx] === q.correct })); }} disabled={quizAnswers[qIdx] === undefined}>
                                        Submit Answer
                                    </button>
                                ) : (
                                    <div style={{ padding: '12px 16px', background: isCorrect ? 'rgba(0,230,180,0.05)' : 'rgba(255,107,107,0.05)', borderLeft: `3px solid ${isCorrect ? 'var(--accent-primary)' : 'var(--accent-danger)'}`, borderRadius: '0 8px 8px 0' }}>
                                        <strong style={{ color: isCorrect ? 'var(--accent-primary)' : 'var(--accent-danger)', fontSize: '0.9rem' }}>
                                            {isCorrect ? '✅ Correct!' : `❌ Incorrect — Correct: ${q.options[q.correct]}`}
                                        </strong>
                                        {q.explanation && <p style={{ marginTop: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{q.explanation}</p>}
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No quiz questions generated.</div>
                    )}
                </div>
            )}
        </div>
    );
}
