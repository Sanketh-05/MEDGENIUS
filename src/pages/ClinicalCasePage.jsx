// ═══════════════════════════════════════════════════════════════
// Clinical Case Simulation — Built-in Library + AI Topic Search
// Users can search any topic to get AI-generated case-based MCQs
// with an AI Assistant for deeper understanding
// ═══════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { getClinicalCases, getCaseCategories } from '../data/clinicalCases';
import { chatCompletion } from '../utils/aiService';
import { useProgress } from '../context/StudentProgressContext';

const STEP_ICONS = {
    history: '📋',
    examination: '🩺',
    investigation: '🔬',
    diagnosis: '🎯',
    management: '💊',
};

// ── AI Quiz Parser ────────────────────────────────────────────
function parseAiQuiz(text, topic) {
    if (!text) return null;
    const t = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const questions = [];
    for (let i = 1; i <= 5; i++) {
        const qM = t.match(new RegExp(`Q${i}[_\\s]?QUESTION:\\s*(.+)`, 'i'));
        const aM = t.match(new RegExp(`Q${i}[_\\s]?A:\\s*(.+)`, 'i'));
        const bM = t.match(new RegExp(`Q${i}[_\\s]?B:\\s*(.+)`, 'i'));
        const cM = t.match(new RegExp(`Q${i}[_\\s]?C:\\s*(.+)`, 'i'));
        const dM = t.match(new RegExp(`Q${i}[_\\s]?D:\\s*(.+)`, 'i'));
        const expM = t.match(new RegExp(`Q${i}[_\\s]?EXPLANATION:\\s*([\\s\\S]*?)(?=\\nQ${i + 1}|$)`, 'i'));
        if (!qM || !aM || !bM) continue;
        const rawOpts = [aM[1], bM[1], cM?.[1], dM?.[1]].filter(Boolean).map(o => o.trim());
        let correctIdx = rawOpts.findIndex(o => /\[CORRECT\]/i.test(o));
        if (correctIdx === -1) correctIdx = 0;
        const options = rawOpts.map(o => o.replace(/\s*\[CORRECT\]/gi, '').replace(/\[.*?\]/g, '').trim());
        questions.push({
            question: qM[1].replace(/\[.*?\]/g, '').trim(),
            options,
            correct: correctIdx,
            explanation: expM ? expM[1].replace(/\[.*?\]/g, '').trim().split('\n')[0] : 'Refer to clinical guidelines.',
        });
    }
    return questions.length > 0 ? { topic, questions } : null;
}

export default function ClinicalCasePage() {
    const [selectedCase, setSelectedCase] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState({});
    const [score, setScore] = useState(0);
    const [caseComplete, setCaseComplete] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [startTime] = useState(Date.now());
    const [stepAiExplanations, setStepAiExplanations] = useState({});

    // AI Search quiz state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [aiQuiz, setAiQuiz] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState({});
    const [quizAiExp, setQuizAiExp] = useState({});

    const { trackClinicalCase } = useProgress();
    const cases = getClinicalCases();
    const categories = getCaseCategories();

    const filteredCases = categoryFilter === 'all' ? cases : cases.filter(c => c.category === categoryFilter);

    // ── Generate AI Quiz ──────────────────────────────────────
    const handleSearch = async () => {
        if (!searchQuery.trim() || searchLoading) return;
        setSearchLoading(true);
        setAiQuiz(null);
        setSearchError('');
        setQuizAnswers({});
        setQuizSubmitted({});
        setQuizAiExp({});

        const systemPrompt = `You are a senior medical educator creating challenging case-based MCQs for medical students. Generate exactly 5 questions in the EXACT format specified. Use clinically realistic scenarios and confusing distractors.`;

        const userPrompt = `Create 5 case-based MCQ questions about: "${searchQuery}"

Each question should be a SHORT clinical vignette (1-2 sentences) followed by a specific question. Make wrong options plausible and similar to the correct answer.

Use EXACTLY this format:

Q1_QUESTION: [Clinical vignette + question]
Q1_A: [Option A] [CORRECT]
Q1_B: [Plausible wrong option]
Q1_C: [Plausible wrong option]
Q1_D: [Plausible wrong option]
Q1_EXPLANATION: [Why the correct answer is right in 2 sentences]

Q2_QUESTION: [Clinical vignette + question]
Q2_A: [Plausible wrong option]
Q2_B: [Option B] [CORRECT]
Q2_C: [Plausible wrong option]
Q2_D: [Plausible wrong option]
Q2_EXPLANATION: [Explanation]

Q3_QUESTION: [Clinical vignette + question]
Q3_A: [Plausible wrong option]
Q3_B: [Plausible wrong option]
Q3_C: [Option C] [CORRECT]
Q3_D: [Plausible wrong option]
Q3_EXPLANATION: [Explanation]

Q4_QUESTION: [Clinical vignette + question]
Q4_A: [Plausible wrong option]
Q4_B: [Plausible wrong option]
Q4_C: [Plausible wrong option]
Q4_D: [Option D] [CORRECT]
Q4_EXPLANATION: [Explanation]

Q5_QUESTION: [Clinical vignette + question]
Q5_A: [Option A] [CORRECT]
Q5_B: [Plausible wrong option]
Q5_C: [Plausible wrong option]
Q5_D: [Plausible wrong option]
Q5_EXPLANATION: [Explanation]`;

        try {
            const result = await chatCompletion(systemPrompt, userPrompt, { maxTokens: 2000, temperature: 0.45 });
            const parsed = parseAiQuiz(result, searchQuery);
            if (parsed) {
                setAiQuiz(parsed);
            } else {
                setSearchError('Could not parse AI response. Try a more specific topic like "Acute MI" or "Pneumonia".');
            }
        } catch {
            setSearchError('AI unavailable. Please check your API key or connection.');
        }
        setSearchLoading(false);
    };

    // ── Quiz Interactions ─────────────────────────────────────
    const selectQuizAnswer = (qIdx, optIdx) => {
        if (quizSubmitted[qIdx] !== undefined) return;
        setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    };

    const submitQuiz = (qIdx) => {
        if (quizAnswers[qIdx] === undefined) return;
        const isCorrect = quizAnswers[qIdx] === aiQuiz.questions[qIdx].correct;
        setQuizSubmitted(prev => ({ ...prev, [qIdx]: isCorrect }));
    };

    const getQuizAI = async (qIdx, q) => {
        setQuizAiExp(prev => ({ ...prev, [qIdx]: { loading: true, text: '' } }));
        try {
            const systemMsg = 'You are an expert clinical teacher. Break down clinical reasoning for medical students into three specific sections using EXACTLY these headings: "REASONING:", "INCORRECT_ANALYSIS:", and "EXAM_PEARL:".';
            const userMsg = `Topic: "${aiQuiz.topic}"
Question: "${q.question}"
Correct answer: "${q.options[q.correct]}"
Wrong options: ${q.options.filter((_, i) => i !== q.correct).map(o => `"${o}"`).join(', ')}

Explain the clinical reasoning. You MUST format your response exactly like this:
REASONING: [1-2 sentences explaining why the correct answer is the best choice]
INCORRECT_ANALYSIS: [1-2 sentences explaining why the other options are wrong or dangerous]
EXAM_PEARL: [One high-yield, memorable fact for medical exams related to this topic]`;

            const result = await chatCompletion(systemMsg, userMsg, { maxTokens: 500, temperature: 0.2 });
            const reasoningMatch = result?.match(/REASONING:\s*([\s\S]*?)(?=INCORRECT_ANALYSIS:|$)/i);
            const incorrectMatch = result?.match(/INCORRECT_ANALYSIS:\s*([\s\S]*?)(?=EXAM_PEARL:|$)/i);
            const pearlMatch = result?.match(/EXAM_PEARL:\s*([\s\S]*?)$/i);

            if (reasoningMatch || incorrectMatch || pearlMatch) {
                setQuizAiExp(prev => ({
                    ...prev,
                    [qIdx]: {
                        loading: false, structured: true,
                        reasoning: (reasoningMatch?.[1] || '').trim(),
                        incorrect: (incorrectMatch?.[1] || '').trim(),
                        pearl: (pearlMatch?.[1] || '').trim()
                    }
                }));
            } else {
                setQuizAiExp(prev => ({ ...prev, [qIdx]: { loading: false, structured: false, text: result || 'No explanation available.' } }));
            }
        } catch {
            setQuizAiExp(prev => ({ ...prev, [qIdx]: { loading: false, structured: false, text: 'AI explanation unavailable.' } }));
        }
    };

    // ── AI Assistant Chat ─────────────────────────────────────
    const sendChat = async () => {
        const msg = chatInput.trim();
        if (!msg || chatLoading) return;
        const userMsg = { role: 'user', text: msg };
        setChatMsgs(prev => [...prev, userMsg]);
        setChatInput('');
        setChatLoading(true);
        const history = chatMsgs.slice(-6).map(m => `${m.role === 'user' ? 'Student' : 'AI'}: ${m.text}`).join('\n');
        try {
            const result = await chatCompletion(
                `You are an expert medical educator and AI assistant helping a medical student study "${aiQuiz?.topic || searchQuery}". Answer questions clearly, use clinical examples, and always relate back to exam relevance. Be conversational but precise.`,
                `${history}\nStudent: ${msg}`,
                { maxTokens: 500, temperature: 0.3 }
            );
            setChatMsgs(prev => [...prev, { role: 'assistant', text: result || 'I apologize, I could not generate a response.' }]);
        } catch {
            setChatMsgs(prev => [...prev, { role: 'assistant', text: 'AI unavailable — please check your connection.' }]);
        }
        setChatLoading(false);
    };

    // ── Step AI Explanation (for built-in cases) ──────────────
    const getStepAIExplanation = async (stepIdx, step) => {
        setStepAiExplanations(prev => ({ ...prev, [stepIdx]: { loading: true, text: '' } }));
        try {
            const systemMsg = 'You are an expert clinical teacher. Break down clinical reasoning for medical students into three specific sections using EXACTLY these headings: "REASONING:", "INCORRECT_ANALYSIS:", and "EXAM_PEARL:".';
            const userMsg = `Clinical Case Step: "${step.title}"
Question: "${step.question}"
Correct approach: "${step.options[step.correct]}"
Other options: ${step.options.filter((_, i) => i !== step.correct).map(o => `"${o}"`).join(', ')}

Explain the clinical reasoning. You MUST format your response exactly like this:
REASONING: [1-2 sentences explaining why the correct answer is the best choice]
INCORRECT_ANALYSIS: [1-2 sentences explaining why the other options are wrong or dangerous]
EXAM_PEARL: [One high-yield, memorable fact for medical exams related to this topic]`;

            const result = await chatCompletion(systemMsg, userMsg, { maxTokens: 500, temperature: 0.2 });
            const reasoningMatch = result?.match(/REASONING:\s*([\s\S]*?)(?=INCORRECT_ANALYSIS:|$)/i);
            const incorrectMatch = result?.match(/INCORRECT_ANALYSIS:\s*([\s\S]*?)(?=EXAM_PEARL:|$)/i);
            const pearlMatch = result?.match(/EXAM_PEARL:\s*([\s\S]*?)$/i);

            if (reasoningMatch || incorrectMatch || pearlMatch) {
                setStepAiExplanations(prev => ({
                    ...prev,
                    [stepIdx]: {
                        loading: false, structured: true,
                        reasoning: (reasoningMatch?.[1] || '').trim(),
                        incorrect: (incorrectMatch?.[1] || '').trim(),
                        pearl: (pearlMatch?.[1] || '').trim()
                    }
                }));
            } else {
                setStepAiExplanations(prev => ({ ...prev, [stepIdx]: { loading: false, structured: false, text: result || 'No explanation available.' } }));
            }
        } catch {
            setStepAiExplanations(prev => ({ ...prev, [stepIdx]: { loading: false, structured: false, text: 'AI explanation unavailable.' } }));
        }
    };

    // ── Library Case Controls ─────────────────────────────────
    const startCase = (caseData) => {
        setSelectedCase(caseData);
        setCurrentStep(0);
        setAnswers({});
        setSubmitted({});
        setScore(0);
        setCaseComplete(false);
        setStepAiExplanations({});
    };

    const selectAnswer = (stepIdx, optIdx) => {
        if (submitted[stepIdx] !== undefined) return;
        setAnswers(prev => ({ ...prev, [stepIdx]: optIdx }));
    };

    const submitStep = (stepIdx) => {
        if (answers[stepIdx] === undefined) return;
        const step = selectedCase.steps[stepIdx];
        const isCorrect = answers[stepIdx] === step.correct;
        setSubmitted(prev => ({ ...prev, [stepIdx]: isCorrect }));
        if (isCorrect) setScore(prev => prev + 1);
        if (stepIdx === selectedCase.steps.length - 1) {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            trackClinicalCase(selectedCase.title, score + (isCorrect ? 1 : 0), selectedCase.steps.length, timeSpent);
            setCaseComplete(true);
        }
    };

    const nextStep = () => { if (currentStep < selectedCase.steps.length - 1) setCurrentStep(p => p + 1); };
    const prevStep = () => { if (currentStep > 0) setCurrentStep(p => p - 1); };

    const quizScore = Object.values(quizSubmitted).filter(Boolean).length;
    const quizTotal = Object.keys(quizSubmitted).length;

    // ── Case Selection Screen ─────────────────────────────────
    if (!selectedCase) {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1>🏥 Clinical Case Simulation</h1>
                    <p>Search any medical topic for AI-generated case-based quizzes, or pick from the built-in interactive case library</p>
                </div>

                {/* ── AI Topic Search ── */}
                <div className="glass-card" style={{ padding: '24px', marginBottom: '28px', border: '1px solid rgba(0,230,180,0.2)' }}>
                    <h4 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
                        🔍 Study Any Topic — AI Case-Based Quiz
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '14px' }}>
                        Enter any medical topic and get 5 challenging clinical vignette MCQs with an AI assistant to answer all your questions.
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            className="input-field"
                            style={{ flex: 1, padding: '12px 16px', fontSize: '0.9rem' }}
                            placeholder="E.g., Acute MI, Diabetic Ketoacidosis, Pneumonia, Stroke…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <button className="btn btn-primary" onClick={handleSearch} disabled={searchLoading || !searchQuery.trim()}>
                            {searchLoading ? '⏳ Generating…' : '⚡ Generate Quiz'}
                        </button>
                    </div>
                    {searchLoading && (
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', fontSize: '0.88rem' }}>
                            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span>
                            Generating 5 case-based MCQs with clinical vignettes…
                        </div>
                    )}
                    {searchError && (
                        <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(255,107,107,0.08)', borderLeft: '3px solid var(--accent-danger)', borderRadius: '0 8px 8px 0', fontSize: '0.87rem', color: 'var(--text-secondary)' }}>
                            ⚠️ {searchError}
                        </div>
                    )}
                </div>

                {/* ── AI Quiz Questions ── */}
                {aiQuiz && (
                    <div style={{ marginBottom: '32px', animation: 'fadeIn 0.35s ease' }}>

                        {/* Quiz Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '4px' }}>
                                    📝 Case-Based Quiz: <span style={{ color: 'var(--text-primary)' }}>{aiQuiz.topic}</span>
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {aiQuiz.questions.length} questions · {quizTotal > 0 ? `${quizScore}/${quizTotal} answered` : 'Answer each question then submit'}
                                </p>
                            </div>
                            <button className="btn btn-sm btn-outline" onClick={() => { setAiQuiz(null); setSearchQuery(''); setQuizAnswers({}); setQuizSubmitted({}); setQuizAiExp({}); }}>
                                ✕ Clear Quiz
                            </button>
                        </div>

                        {/* Quiz Questions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {aiQuiz.questions.map((q, qIdx) => {
                                const isSubmitted = quizSubmitted[qIdx] !== undefined;
                                const isCorrect = quizSubmitted[qIdx];
                                return (
                                    <div key={qIdx} className="glass-card" style={{ padding: '22px', borderLeft: isSubmitted ? `4px solid ${isCorrect ? 'var(--accent-primary)' : 'var(--accent-danger)'}` : '4px solid rgba(114,137,255,0.3)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '10px' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                                <span style={{ minWidth: '26px', height: '26px', borderRadius: '50%', background: 'rgba(114,137,255,0.15)', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0, marginTop: '2px' }}>
                                                    {qIdx + 1}
                                                </span>
                                                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>{q.question}</p>
                                            </div>
                                            {isSubmitted && <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{isCorrect ? '✅' : '❌'}</span>}
                                        </div>

                                        {/* Options */}
                                        <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
                                            {q.options.map((opt, optIdx) => {
                                                let border = '1px solid var(--border-color)';
                                                let bg = 'rgba(255,255,255,0.02)';
                                                let textColor = 'var(--text-primary)';
                                                if (isSubmitted) {
                                                    if (optIdx === q.correct) { border = '1px solid var(--accent-primary)'; bg = 'rgba(0,230,180,0.08)'; textColor = 'var(--accent-primary)'; }
                                                    else if (optIdx === quizAnswers[qIdx] && optIdx !== q.correct) { border = '1px solid var(--accent-danger)'; bg = 'rgba(255,107,107,0.06)'; }
                                                } else if (quizAnswers[qIdx] === optIdx) {
                                                    border = '1px solid var(--accent-secondary)'; bg = 'rgba(114,137,255,0.1)';
                                                }
                                                return (
                                                    <div key={optIdx} onClick={() => selectQuizAnswer(qIdx, optIdx)} style={{ padding: '11px 16px', borderRadius: '9px', border, background: bg, cursor: isSubmitted ? 'default' : 'pointer', fontSize: '0.9rem', color: textColor, display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.18s' }}>
                                                        <span style={{ minWidth: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', background: quizAnswers[qIdx] === optIdx ? (isSubmitted ? (optIdx === q.correct ? 'var(--accent-primary)' : 'var(--accent-danger)') : 'var(--accent-secondary)') : 'rgba(255,255,255,0.05)', color: quizAnswers[qIdx] === optIdx ? '#fff' : 'var(--text-muted)' }}>
                                                            {String.fromCharCode(65 + optIdx)}
                                                        </span>
                                                        {opt}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Submit / Feedback */}
                                        {!isSubmitted ? (
                                            <button className="btn btn-primary" style={{ fontSize: '0.88rem' }} onClick={() => submitQuiz(qIdx)} disabled={quizAnswers[qIdx] === undefined}>
                                                Submit Answer
                                            </button>
                                        ) : (
                                            <div style={{ padding: '12px 16px', background: isCorrect ? 'rgba(0,230,180,0.05)' : 'rgba(255,107,107,0.05)', borderLeft: `3px solid ${isCorrect ? 'var(--accent-primary)' : 'var(--accent-danger)'}`, borderRadius: '0 8px 8px 0', animation: 'fadeIn 0.3s ease' }}>
                                                <strong style={{ color: isCorrect ? 'var(--accent-primary)' : 'var(--accent-danger)', fontSize: '0.9rem' }}>
                                                    {isCorrect ? '✅ Correct!' : `❌ Incorrect — Correct: ${q.options[q.correct]}`}
                                                </strong>
                                                {q.explanation && <p style={{ marginTop: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{q.explanation}</p>}

                                                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                                                    {!quizAiExp[qIdx] && (
                                                        <button className="btn btn-sm btn-outline" onClick={() => getQuizAI(qIdx, q)}>
                                                            🤖 AI Reasoning & Explanation
                                                        </button>
                                                    )}
                                                    <button className="btn btn-sm btn-outline" onClick={() => { setChatInput(`Explain question ${qIdx + 1}: "${q.question}" — why is "${q.options[q.correct]}" correct?`); setChatOpen(true); }}>
                                                        💬 Ask AI Assistant
                                                    </button>
                                                </div>
                                                {quizAiExp[qIdx]?.loading && (
                                                    <div style={{ marginTop: '8px', color: 'var(--accent-primary)', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span> Generating AI reasoning…
                                                    </div>
                                                )}
                                                {/* Display Structured AI Reasoning */}
                                                {quizAiExp[qIdx]?.structured && (
                                                    <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        {quizAiExp[qIdx].reasoning && (
                                                            <div style={{ padding: '12px 14px', background: 'rgba(0,230,180,0.04)', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)' }}>
                                                                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontSize: '0.85rem', marginBottom: '4px' }}>
                                                                    <span>💡</span> Correct Answer Reasoning
                                                                </strong>
                                                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.88rem', margin: 0 }}>{quizAiExp[qIdx].reasoning}</p>
                                                            </div>
                                                        )}
                                                        {quizAiExp[qIdx].incorrect && (
                                                            <div style={{ padding: '12px 14px', background: 'rgba(255,107,107,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--accent-danger)' }}>
                                                                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-danger)', fontSize: '0.85rem', marginBottom: '4px' }}>
                                                                    <span>⚠️</span> Incorrect Options Analysis
                                                                </strong>
                                                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.88rem', margin: 0 }}>{quizAiExp[qIdx].incorrect}</p>
                                                            </div>
                                                        )}
                                                        {quizAiExp[qIdx].pearl && (
                                                            <div style={{ padding: '12px 14px', background: 'linear-gradient(90deg, rgba(255,193,7,0.06), transparent)', borderRadius: '8px', borderLeft: '3px solid #ffc107' }}>
                                                                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffc107', fontSize: '0.85rem', marginBottom: '4px' }}>
                                                                    <span>🌟</span> High-Yield Exam Pearl
                                                                </strong>
                                                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.88rem', margin: 0 }}>{quizAiExp[qIdx].pearl}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {/* Fallback Display if unstructured */}
                                                {!quizAiExp[qIdx]?.structured && quizAiExp[qIdx]?.text && (
                                                    <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(0,230,180,0.04)', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)' }}>
                                                        <strong style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>🤖 AI Explanation:</strong>
                                                        <p style={{ marginTop: '5px', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.85rem' }}>{quizAiExp[qIdx].text}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Quiz Score Banner */}
                        {quizTotal === aiQuiz.questions.length && (
                            <div style={{ marginTop: '20px', padding: '18px 24px', background: 'rgba(0,230,180,0.06)', borderRadius: '14px', border: '1px solid rgba(0,230,180,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>
                                        {quizScore === quizTotal ? '🏆' : quizScore >= quizTotal * 0.7 ? '🌟' : '📖'}
                                    </div>
                                    <strong style={{ color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{quizScore}/{quizTotal} Correct</strong>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                                        {quizScore === quizTotal ? 'Perfect score!' : quizScore >= quizTotal * 0.7 ? 'Great understanding!' : 'Review the AI explanations above'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-primary" onClick={handleSearch} style={{ fontSize: '0.88rem' }}>🔄 New Questions</button>
                                    <button className="btn btn-outline btn-sm" onClick={() => { setChatInput(`I scored ${quizScore}/${quizTotal} on ${aiQuiz.topic}. What should I study more?`); setChatOpen(true); }}>💬 Get Study Tips</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Case Library ── */}
                <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>📚 Built-in Interactive Cases:</h3>
                </div>
                <div className="tabs" style={{ marginBottom: '20px' }}>
                    <button className={`tab${categoryFilter === 'all' ? ' active' : ''}`} onClick={() => setCategoryFilter('all')}>📋 All</button>
                    {categories.map(cat => (
                        <button key={cat} className={`tab${categoryFilter === cat ? ' active' : ''}`} onClick={() => setCategoryFilter(cat)}>{cat}</button>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {filteredCases.map((c) => (
                        <div key={c.id} className="glass-card clinical-case-card" style={{ cursor: 'pointer', padding: '24px' }} onClick={() => startCase(c)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span className="badge badge-primary">{c.category}</span>
                                <span className={`badge ${c.difficulty === 'easy' ? 'badge-green' : c.difficulty === 'moderate' ? 'badge-purple' : 'badge-danger'}`}>{c.difficulty}</span>
                            </div>
                            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{c.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '8px' }}>{c.demographics}</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                {c.presentation.substring(0, 120)}...
                            </p>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                                {c.steps.map((s, i) => (
                                    <span key={i} style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '10px', background: 'rgba(114,137,255,0.15)', color: 'var(--text-muted)' }}>
                                        {STEP_ICONS[s.type]} {s.type}
                                    </span>
                                ))}
                            </div>
                            <div style={{ marginTop: '14px', textAlign: 'right' }}>
                                <span style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600 }}>Start Case →</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Case Complete Screen ───────────────────────────────────
    if (caseComplete) {
        const pct = Math.round((score / selectedCase.steps.length) * 100);
        return (
            <div className="animate-fade-in">
                <div className="page-header"><h1>🏁 Case Complete</h1><p>{selectedCase.title}</p></div>
                <div className="glass-card" style={{ padding: '36px', textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>{pct >= 80 ? '🏆' : pct >= 60 ? '🌟' : '📖'}</div>
                    <h2 style={{ color: 'var(--accent-primary)', fontSize: '2rem', marginBottom: '8px' }}>
                        {score} / {selectedCase.steps.length} Correct ({pct}%)
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '24px' }}>
                        {pct >= 80 ? 'Excellent clinical reasoning!' : pct >= 60 ? 'Good effort — review explanations.' : 'Keep practising — review concepts.'}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={() => setSelectedCase(null)}>← Case Library</button>
                        <button className="btn btn-secondary" onClick={() => startCase(selectedCase)}>🔄 Retry</button>
                    </div>
                </div>
                {selectedCase.steps.map((step, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: '20px', marginBottom: '14px', borderLeft: `4px solid ${submitted[idx] ? 'var(--accent-primary)' : 'var(--accent-danger)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '0.95rem' }}>{STEP_ICONS[step.type]} {step.title}</h4>
                            <span style={{ fontSize: '1.2rem' }}>{submitted[idx] ? '✅' : '❌'}</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '6px' }}>{step.question}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--accent-primary)' }}>Correct:</strong> {step.options[step.correct]}
                        </p>
                        {step.explanation && <p style={{ marginTop: '8px', fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.explanation}</p>}
                    </div>
                ))}
            </div>
        );
    }

    // ── Active Simulation ─────────────────────────────────────
    const step = selectedCase.steps[currentStep];
    const isSubmitted = submitted[currentStep] !== undefined;
    const isCorrect = submitted[currentStep];

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>🏥 {selectedCase.title}</h1>
                <p>{selectedCase.demographics} — {selectedCase.presentation}</p>
            </div>

            {/* Progress */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Step {currentStep + 1} of {selectedCase.steps.length}</span>
                    <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600 }}>Score: {score}/{Object.keys(submitted).length}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {selectedCase.steps.map((s, i) => (
                        <div key={i} onClick={() => setCurrentStep(i)} style={{ flex: 1, height: '28px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', background: submitted[i] !== undefined ? (submitted[i] ? 'rgba(0,230,180,0.2)' : 'rgba(255,107,107,0.2)') : i === currentStep ? 'rgba(114,137,255,0.2)' : 'rgba(255,255,255,0.03)', border: i === currentStep ? '2px solid var(--accent-secondary)' : '1px solid transparent', transition: 'all 0.2s', color: submitted[i] !== undefined ? (submitted[i] ? 'var(--accent-primary)' : 'var(--accent-danger)') : 'var(--text-muted)' }}>
                            {STEP_ICONS[s.type]}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Card */}
            <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                    <span className="badge badge-purple">{STEP_ICONS[step.type]} {step.title}</span>
                </div>
                <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '24px', lineHeight: 1.6, fontWeight: 500 }}>{step.question}</p>

                <div style={{ display: 'grid', gap: '10px' }}>
                    {step.options.map((option, optIdx) => {
                        let style = { padding: '14px 18px', borderRadius: '10px', cursor: isSubmitted ? 'default' : 'pointer', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', fontSize: '0.93rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: '12px', transition: 'all 0.2s' };
                        if (isSubmitted) {
                            if (optIdx === step.correct) style = { ...style, border: '1px solid var(--accent-primary)', background: 'rgba(0,230,180,0.08)' };
                            else if (optIdx === answers[currentStep] && optIdx !== step.correct) style = { ...style, border: '1px solid var(--accent-danger)', background: 'rgba(255,107,107,0.06)' };
                        } else if (answers[currentStep] === optIdx) {
                            style = { ...style, border: '1px solid var(--accent-secondary)', background: 'rgba(114,137,255,0.1)' };
                        }
                        return (
                            <div key={optIdx} style={style} onClick={() => selectAnswer(currentStep, optIdx)}>
                                <span style={{ minWidth: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${isSubmitted && optIdx === step.correct ? 'var(--accent-primary)' : isSubmitted && optIdx === answers[currentStep] ? 'var(--accent-danger)' : answers[currentStep] === optIdx ? 'var(--accent-secondary)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, background: answers[currentStep] === optIdx ? (isSubmitted ? (optIdx === step.correct ? 'var(--accent-primary)' : 'var(--accent-danger)') : 'var(--accent-secondary)') : 'transparent', color: answers[currentStep] === optIdx ? '#fff' : 'var(--text-muted)' }}>
                                    {isSubmitted && optIdx === step.correct ? '✓' : isSubmitted && optIdx === answers[currentStep] ? '✗' : String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{option}</span>
                            </div>
                        );
                    })}
                </div>

                {isSubmitted && (
                    <div style={{ marginTop: '20px', padding: '16px 20px', background: isCorrect ? 'rgba(0,230,180,0.06)' : 'rgba(255,107,107,0.05)', borderLeft: `3px solid ${isCorrect ? 'var(--accent-primary)' : 'var(--accent-danger)'}`, borderRadius: '0 8px 8px 0', animation: 'fadeIn 0.3s ease' }}>
                        <strong style={{ color: isCorrect ? 'var(--accent-primary)' : 'var(--accent-danger)' }}>
                            {isCorrect ? '✅ Correct!' : `❌ Incorrect — Correct: ${step.options[step.correct]}`}
                        </strong>
                        {step.explanation && <p style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{step.explanation}</p>}
                        {!stepAiExplanations[currentStep] && (
                            <button className="btn btn-sm btn-outline" style={{ marginTop: '12px' }} onClick={() => getStepAIExplanation(currentStep, step)}>
                                🤖 AI Reasoning & Explanation
                            </button>
                        )}
                        {stepAiExplanations[currentStep]?.loading && (
                            <div style={{ marginTop: '10px', color: 'var(--accent-primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span> Generating AI reasoning…
                            </div>
                        )}
                        {/* Display Structured AI Reasoning */}
                        {stepAiExplanations[currentStep]?.structured && (
                            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {stepAiExplanations[currentStep].reasoning && (
                                    <div style={{ padding: '12px 14px', background: 'rgba(0,230,180,0.04)', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)' }}>
                                        <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontSize: '0.85rem', marginBottom: '4px' }}>
                                            <span>💡</span> Correct Answer Reasoning
                                        </strong>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.88rem', margin: 0 }}>{stepAiExplanations[currentStep].reasoning}</p>
                                    </div>
                                )}
                                {stepAiExplanations[currentStep].incorrect && (
                                    <div style={{ padding: '12px 14px', background: 'rgba(255,107,107,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--accent-danger)' }}>
                                        <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-danger)', fontSize: '0.85rem', marginBottom: '4px' }}>
                                            <span>⚠️</span> Incorrect Options Analysis
                                        </strong>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.88rem', margin: 0 }}>{stepAiExplanations[currentStep].incorrect}</p>
                                    </div>
                                )}
                                {stepAiExplanations[currentStep].pearl && (
                                    <div style={{ padding: '12px 14px', background: 'linear-gradient(90deg, rgba(255,193,7,0.06), transparent)', borderRadius: '8px', borderLeft: '3px solid #ffc107' }}>
                                        <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffc107', fontSize: '0.85rem', marginBottom: '4px' }}>
                                            <span>🌟</span> High-Yield Exam Pearl
                                        </strong>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.88rem', margin: 0 }}>{stepAiExplanations[currentStep].pearl}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Fallback Display if unstructured */}
                        {!stepAiExplanations[currentStep]?.structured && stepAiExplanations[currentStep]?.text && (
                            <div style={{ marginTop: '12px', padding: '14px', background: 'rgba(0,230,180,0.04)', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)' }}>
                                <strong style={{ color: 'var(--accent-primary)', fontSize: '0.82rem' }}>🤖 AI Clinical Reasoning:</strong>
                                <p style={{ marginTop: '6px', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.88rem' }}>{stepAiExplanations[currentStep].text}</p>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                    {!isSubmitted ? (
                        <button className="btn btn-primary" onClick={() => submitStep(currentStep)} disabled={answers[currentStep] === undefined}>Submit Answer</button>
                    ) : (
                        <>
                            {currentStep < selectedCase.steps.length - 1
                                ? <button className="btn btn-primary" onClick={nextStep}>Next Step →</button>
                                : <button className="btn btn-primary" onClick={() => setCaseComplete(true)}>View Results 🏁</button>
                            }
                        </>
                    )}
                    {currentStep > 0 && <button className="btn btn-secondary" onClick={prevStep}>← Previous</button>}
                    <button className="btn btn-sm btn-outline" onClick={() => setSelectedCase(null)} style={{ marginLeft: 'auto' }}>← Library</button>
                </div>
            </div>
        </div>
    );
}
