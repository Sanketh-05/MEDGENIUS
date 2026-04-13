// ═══════════════════════════════════════════════════════════════
// Clinical Simulation Mode — AI-Generated Rich Patient Cases
// Enter any medical topic → get full patient record (history, vitals,
// labs, imaging) → run interactive 5-step clinical simulation
// ═══════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import cdssScenarios from '../data/cdssScenarios';
import { chatCompletion } from '../utils/aiService';

export default function CDSSPage() {
    // ── Built-in scenario flow ──────────────────────────
    const [selectedCase, setSelectedCase] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [revealed, setRevealed] = useState(false);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [showSummary, setShowSummary] = useState(false);

    // ── AI search & rich patient record ────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [caseView, setCaseView] = useState(null); // rich patient record object

    // ── AI step explanations ────────────────────────────
    const [stepAiExp, setStepAiExp] = useState({});

    // ────────────────────────────────────────────────────
    //  AI Case Generation
    // ────────────────────────────────────────────────────
    const handleSearch = async () => {
        if (!searchQuery.trim() || searchLoading) return;
        setSearchLoading(true);
        setCaseView(null);
        setErrorMsg('');

        const systemPrompt = `You are a senior medical educator. Generate a rich, realistic patient case EXACTLY in the format below, with NO extra commentary. Produce clinically challenging MCQ options where wrong answers are plausible and similar to the correct answer.`;

        const userPrompt = `Generate a detailed clinical simulation case for: "${searchQuery}"

Respond EXACTLY in this format (use these exact field names):

PATIENT: [Age, gender, occupation]
CHIEF_COMPLAINT: [Patient's presenting complaint in their own words]
HPI: [2-3 sentences: onset, duration, character, severity, associated symptoms, aggravating/relieving factors]
PMH: [Past medical history, current medications, allergies]
SOCIAL: [Smoking, alcohol, occupation, relevant social history]
VITALS:
BP: [value]
HR: [value]
RR: [value]
Temp: [value]
SpO2: [value]
Weight: [value]
PHYSICAL_EXAM: [2-3 key positive and negative findings on examination]
LABS:
[Lab test 1]: [value with H/L flag]
[Lab test 2]: [value with H/L flag]
[Lab test 3]: [value with H/L flag]
[Lab test 4]: [value with H/L flag]
[Lab test 5]: [value with H/L flag]
IMAGING: [Key imaging findings relevant to the diagnosis]

STEP1_TITLE: History Taking
STEP1_QUESTION: [Specific clinical question about history — make it confusing]
STEP1_A: [Option A text] [CORRECT]
STEP1_B: [Plausible wrong option]
STEP1_C: [Plausible wrong option]
STEP1_D: [Plausible wrong option]
STEP1_EXPLANATION: [Why correct option is right in 2 sentences]

STEP2_TITLE: Physical Examination
STEP2_QUESTION: [Specific MCQ about examination findings]
STEP2_A: [Wrong but plausible]
STEP2_B: [Option B text] [CORRECT]
STEP2_C: [Wrong but plausible]
STEP2_D: [Wrong but plausible]
STEP2_EXPLANATION: [Explanation]

STEP3_TITLE: Investigations
STEP3_QUESTION: [MCQ about best investigation]
STEP3_A: [Wrong but plausible]
STEP3_B: [Wrong but plausible]
STEP3_C: [Option C text] [CORRECT]
STEP3_D: [Wrong but plausible]
STEP3_EXPLANATION: [Explanation]

STEP4_TITLE: Diagnosis
STEP4_QUESTION: [MCQ about most likely diagnosis]
STEP4_A: [Similar wrong diagnosis]
STEP4_B: [Option B text] [CORRECT]
STEP4_C: [Similar wrong diagnosis]
STEP4_D: [Unrelated distractor]
STEP4_EXPLANATION: [Explanation]

STEP5_TITLE: Management
STEP5_QUESTION: [MCQ about immediate definitive management]
STEP5_A: [Option A text] [CORRECT]
STEP5_B: [Wrong drug/dose]
STEP5_C: [Wrong approach]
STEP5_D: [Contraindicated option]
STEP5_EXPLANATION: [Explanation]`;

        try {
            const result = await chatCompletion(systemPrompt, userPrompt, { maxTokens: 2400, temperature: 0.4 });
            console.log('[ClinicalSim] Raw AI:', result?.substring(0, 200));
            const parsed = parseRichCase(result, searchQuery);
            console.log('[ClinicalSim] Parsed:', parsed ? `OK — ${parsed.steps.length} steps` : 'NULL');
            if (parsed && parsed.steps.length >= 1) {
                setCaseView(parsed);
            } else {
                setErrorMsg('Could not parse AI response. Try a more specific topic like "Diabetic Ketoacidosis".');
            }
        } catch (err) {
            console.error('[ClinicalSim]', err);
            setErrorMsg('AI unavailable. Ensure you have a working API key or a local Ollama server running.');
        }
        setSearchLoading(false);
    };

    // ────────────────────────────────────────────────────
    //  Robust Parser
    // ────────────────────────────────────────────────────
    const parseRichCase = (text, topic) => {
        if (!text) return null;
        const t = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        const g = (pattern) => {
            const m = t.match(pattern);
            return m ? m[1].replace(/\[.*?\]/g, '').trim() : '';
        };
        const gm = (label) => {
            const re = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z][A-Z0-9_]{2,}:|\\n\\n|$)`, 'i');
            const m = t.match(re);
            return m ? m[1].replace(/\[.*?\]/g, '').trim() : '';
        };
        const vg = (pattern) => { const m = t.match(pattern); return m ? m[1].trim() : 'N/A'; };

        const patient = g(/PATIENT:\s*(.+)/i);
        const chiefComplaint = g(/CHIEF_COMPLAINT:\s*(.+)/i) || g(/CHIEF COMPLAINT:\s*(.+)/i);
        const hpi = gm('HPI');
        const pmh = gm('PMH');
        const social = g(/SOCIAL:\s*(.+)/i);
        const physicalExam = gm('PHYSICAL_EXAM') || gm('PHYSICAL EXAM');
        const imaging = gm('IMAGING');

        const vitals = {
            bp: vg(/BP:\s*([^\n,|]+)/i),
            hr: vg(/HR:\s*([^\n,|]+)/i),
            rr: vg(/RR:\s*([^\n,|]+)/i),
            temp: vg(/Temp(?:erature)?:\s*([^\n,|]+)/i),
            spo2: vg(/SpO2?:\s*([^\n,|]+)/i),
            weight: vg(/Weight:\s*([^\n,|]+)/i),
        };

        const labsStart = t.indexOf('LABS:');
        let labLines = [];
        if (labsStart !== -1) {
            const labsText = t.slice(labsStart + 5);
            labLines = labsText.split('\n')
                .map(l => l.trim())
                .filter(l => l && !/^(STEP|IMAGING|PHYSICAL|HPI|PMH|SOCIAL|VITALS|PATIENT|CHIEF)/i.test(l))
                .slice(0, 6);
        }

        const steps = [];
        const stepTypes = ['history', 'examination', 'investigation', 'diagnosis', 'management'];
        for (let i = 1; i <= 5; i++) {
            const titleM = t.match(new RegExp(`STEP${i}[_\\s]TITLE:\\s*(.+)`, 'i'));
            const qM = t.match(new RegExp(`STEP${i}[_\\s]QUESTION:\\s*(.+)`, 'i'));
            const aM = t.match(new RegExp(`STEP${i}[_\\s]A:\\s*(.+)`, 'i'));
            const bM = t.match(new RegExp(`STEP${i}[_\\s]B:\\s*(.+)`, 'i'));
            const cM = t.match(new RegExp(`STEP${i}[_\\s]C:\\s*(.+)`, 'i'));
            const dM = t.match(new RegExp(`STEP${i}[_\\s]D:\\s*(.+)`, 'i'));
            const expM = t.match(new RegExp(`STEP${i}[_\\s]EXPLANATION:\\s*([\\s\\S]*?)(?=\\nSTEP${i + 1}|$)`, 'i'));
            if (!qM || !aM || !bM) continue;
            const rawOpts = [aM[1], bM[1], cM?.[1], dM?.[1]].filter(Boolean).map(o => o.trim());
            let correctIdx = rawOpts.findIndex(o => /\[CORRECT\]/i.test(o));
            if (correctIdx === -1) correctIdx = 0;
            const options = rawOpts.map(o => o.replace(/\s*\[CORRECT\]/gi, '').replace(/\[.*?\]/g, '').trim());
            steps.push({
                type: stepTypes[i - 1] || 'history',
                title: titleM ? titleM[1].trim() : `Step ${i}`,
                question: qM[1].replace(/\[.*?\]/g, '').trim(),
                options, correct: correctIdx,
                explanation: expM ? expM[1].replace(/\[.*?\]/g, '').trim().split('\n')[0] : 'Refer to clinical guidelines.',
            });
        }

        return {
            id: `ai-${Date.now()}`,
            title: `${topic} — Clinical Simulation`,
            category: 'AI Generated',
            difficulty: 'moderate',
            demographics: patient || `Patient with ${topic}`,
            chiefComplaint: chiefComplaint || `Presenting with symptoms of ${topic}.`,
            hpi, pmh, social, vitals, physicalExam, labLines, imaging,
            presentation: chiefComplaint || `Presenting with ${topic}.`,
            steps,
        };
    };

    // ────────────────────────────────────────────────────
    //  AI Step Reasoning & Explanation
    // ────────────────────────────────────────────────────
    const getStepAI = async (stepIdx, step) => {
        setStepAiExp(prev => ({ ...prev, [stepIdx]: { loading: true, text: '' } }));
        try {
            const systemMsg = 'You are an expert clinical teacher. Break down clinical reasoning for medical students into three specific sections using EXACTLY these headings: "REASONING:", "INCORRECT_ANALYSIS:", and "EXAM_PEARL:".';
            const userMsg = `Clinical simulation step: "${step.title}"
Question: "${step.question}"
Correct answer: "${step.options[step.correct]}"
Wrong options: ${step.options.filter((_, i) => i !== step.correct).map(o => `"${o}"`).join(', ')}

Explain the clinical reasoning. You MUST format your response exactly like this:
REASONING: [1-2 sentences explaining why the correct answer is the best choice]
INCORRECT_ANALYSIS: [1-2 sentences explaining why the other options are wrong or dangerous]
EXAM_PEARL: [One high-yield, memorable fact for medical exams related to this topic]`;

            const result = await chatCompletion(systemMsg, userMsg, { maxTokens: 500, temperature: 0.2 });

            // Parse the structured response
            const reasoningMatch = result?.match(/REASONING:\s*([\s\S]*?)(?=INCORRECT_ANALYSIS:|$)/i);
            const incorrectMatch = result?.match(/INCORRECT_ANALYSIS:\s*([\s\S]*?)(?=EXAM_PEARL:|$)/i);
            const pearlMatch = result?.match(/EXAM_PEARL:\s*([\s\S]*?)$/i);

            if (reasoningMatch || incorrectMatch || pearlMatch) {
                setStepAiExp(prev => ({
                    ...prev,
                    [stepIdx]: {
                        loading: false,
                        structured: true,
                        reasoning: (reasoningMatch?.[1] || '').trim(),
                        incorrect: (incorrectMatch?.[1] || '').trim(),
                        pearl: (pearlMatch?.[1] || '').trim()
                    }
                }));
            } else {
                // Fallback if AI didn't follow formatting
                setStepAiExp(prev => ({ ...prev, [stepIdx]: { loading: false, structured: false, text: result || 'No explanation available.' } }));
            }
        } catch {
            setStepAiExp(prev => ({ ...prev, [stepIdx]: { loading: false, structured: false, text: 'AI reasoning unavailable.' } }));
        }
    };

    // ────────────────────────────────────────────────────
    //  Simulation Controls (works for both AI & built-in)
    // ────────────────────────────────────────────────────
    const startCase = (scenario) => {
        setSelectedCase(scenario);
        setCurrentStep(0);
        setSelectedOption(null);
        setRevealed(false);
        setCompletedSteps([]);
        setScore({ correct: 0, total: 0 });
        setShowSummary(false);
        setCaseView(null);
        setStepAiExp({});
    };

    const handleSelectOption = (i) => { if (!revealed) setSelectedOption(i); };

    const handleSubmitAnswer = () => {
        if (selectedOption === null) return;
        const step = selectedCase.steps[currentStep];
        // AI cases: step.correct is a number (0-3)
        // Built-in CDSS cases: each option is an object with a .correct boolean
        const correctIdx = typeof step.correct === 'number'
            ? step.correct
            : (step.options?.findIndex(o => typeof o === 'object' && o.correct) ?? 0);
        const isCorrect = selectedOption === correctIdx;
        const correctOptionText = typeof step.options?.[correctIdx] === 'string'
            ? step.options[correctIdx]
            : step.options?.[correctIdx]?.text ?? '';
        setRevealed(true);
        setCompletedSteps(prev => [...prev, {
            phase: step.title || step.phase,
            selected: selectedOption,
            correctIdx,
            correct: isCorrect,
            explanation: step.explanation || correctOptionText,
        }]);
        setScore(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
    };

    const handleNext = () => {
        if (currentStep < selectedCase.steps.length - 1) {
            setCurrentStep(prev => prev + 1);
            setSelectedOption(null);
            setRevealed(false);
        } else {
            setShowSummary(true);
        }
    };

    const handleBackToList = () => {
        setSelectedCase(null);
        setShowSummary(false);
        setStepAiExp({});
    };

    // ────────────────────────────────────────────────────
    //  Views
    // ────────────────────────────────────────────────────

    // ── Case List ──────────────────────────────────────
    if (!selectedCase) {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1>🩺 Clinical Simulation Mode</h1>
                    <p>Enter any medical topic to get a full patient case with history, vitals, labs and imaging — then run the interactive 5-step simulation</p>
                </div>

                {/* ── AI Topic Generator ── */}
                <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
                    <h4 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
                        🤖 Generate AI Clinical Case
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '14px' }}>
                        Enter any medical topic — the AI generates a full patient record with chief complaint, HPI, vitals, labs, imaging and a 5-step interactive simulation.
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            className="input-field"
                            style={{ flex: 1, padding: '12px 16px', fontSize: '0.9rem' }}
                            placeholder="E.g., Diabetic Ketoacidosis, Pulmonary Embolism, Stroke…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <button className="btn btn-primary" onClick={handleSearch} disabled={searchLoading || !searchQuery.trim()}>
                            {searchLoading ? '⏳ Generating…' : '⚡ Generate Case'}
                        </button>
                    </div>

                    {searchLoading && (
                        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', fontSize: '0.9rem' }}>
                            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span>
                            AI is generating a full patient case with history, labs, imaging and MCQs…
                        </div>
                    )}
                    {errorMsg && (
                        <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(255,107,107,0.08)', borderLeft: '3px solid var(--accent-danger)', borderRadius: '0 8px 8px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                            ⚠️ {errorMsg}
                        </div>
                    )}
                </div>

                {/* ── Rich Patient Record (rendered OUTSIDE and BELOW the search card) ── */}
                {caseView && (
                    <div style={{ marginBottom: '32px', animation: 'fadeIn 0.35s ease' }}>
                        {/* Patient Header */}
                        <div style={{ padding: '20px 24px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(0,230,180,0.09), rgba(114,137,255,0.09))', border: '1px solid rgba(0,230,180,0.3)', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                            <div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🏥</span>
                                    <strong style={{ fontSize: '1.15rem', color: 'var(--accent-primary)' }}>{caseView.title}</strong>
                                    <span className="badge badge-secondary">AI Generated</span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0' }}>
                                    <strong>👤 Patient:</strong> {caseView.demographics}
                                </p>
                                <p style={{ fontSize: '0.95rem', margin: '6px 0' }}>
                                    <strong style={{ color: 'var(--accent-danger)' }}>🩺 Chief Complaint: </strong>
                                    <em style={{ color: 'var(--text-secondary)' }}>"{caseView.chiefComplaint}"</em>
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button className="btn btn-primary" style={{ fontSize: '0.95rem', padding: '12px 22px' }} onClick={() => startCase(caseView)}>
                                    ▶ Start Simulation ({caseView.steps.length} Steps)
                                </button>
                                <button className="btn btn-sm btn-outline" style={{ padding: '10px 14px' }} onClick={() => { setCaseView(null); setErrorMsg(''); }}>✕</button>
                            </div>
                        </div>

                        {/* Clinical Record Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '14px', marginBottom: '18px' }}>

                            {/* History */}
                            <div className="glass-card" style={{ padding: '18px', borderLeft: '3px solid var(--accent-secondary)' }}>
                                <h4 style={{ color: 'var(--accent-secondary)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
                                    📋 Patient History
                                </h4>
                                {caseView.hpi && (
                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>History of Present Illness</div>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.65, margin: 0 }}>{caseView.hpi}</p>
                                    </div>
                                )}
                                {caseView.pmh && (
                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>Past Medical History</div>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.65, margin: 0 }}>{caseView.pmh}</p>
                                    </div>
                                )}
                                {caseView.social && (
                                    <div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>Social History</div>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.65, margin: 0 }}>{caseView.social}</p>
                                    </div>
                                )}
                                {!caseView.hpi && !caseView.pmh && !caseView.social && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>History embedded in simulation steps.</p>
                                )}
                            </div>

                            {/* Vital Signs */}
                            <div className="glass-card" style={{ padding: '18px', borderLeft: '3px solid var(--accent-danger)' }}>
                                <h4 style={{ color: 'var(--accent-danger)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
                                    ❤️ Vital Signs
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {[
                                        { label: '🩸 Blood Pressure', val: caseView.vitals?.bp },
                                        { label: '💓 Heart Rate', val: caseView.vitals?.hr },
                                        { label: '🌬️ Resp Rate', val: caseView.vitals?.rr },
                                        { label: '🌡️ Temperature', val: caseView.vitals?.temp },
                                        { label: '🫁 SpO₂', val: caseView.vitals?.spo2 },
                                        { label: '⚖️ Weight', val: caseView.vitals?.weight },
                                    ].map((v, i) => (
                                        <div key={i} style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,107,107,0.05)', border: '1px solid rgba(255,107,107,0.1)' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '3px' }}>{v.label}</div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: v.val === 'N/A' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{v.val || 'N/A'}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Labs */}
                            <div className="glass-card" style={{ padding: '18px', borderLeft: '3px solid var(--accent-tertiary)' }}>
                                <h4 style={{ color: 'var(--accent-tertiary)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
                                    🧪 Laboratory Results
                                </h4>
                                {caseView.labLines && caseView.labLines.length > 0 ? (
                                    caseView.labLines.map((line, i) => (
                                        <div key={i} style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '5px 0', borderBottom: '1px solid rgba(138,148,184,0.1)', lineHeight: 1.5 }}>
                                            {line}
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>Labs discussed in simulation steps.</p>
                                )}
                            </div>

                            {/* Physical Exam */}
                            <div className="glass-card" style={{ padding: '18px', borderLeft: '3px solid var(--accent-primary)' }}>
                                <h4 style={{ color: 'var(--accent-primary)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
                                    🩺 Physical Examination
                                </h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.65, margin: 0 }}>
                                    {caseView.physicalExam || 'Examine the patient during the interactive simulation.'}
                                </p>
                            </div>

                            {/* Imaging */}
                            <div className="glass-card" style={{ padding: '18px', borderLeft: '3px solid #ffc107' }}>
                                <h4 style={{ color: '#ffc107', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
                                    🔬 Imaging &amp; Investigations
                                </h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.65, margin: 0 }}>
                                    {caseView.imaging || 'Imaging findings discussed in simulation steps.'}
                                </p>
                            </div>
                        </div>

                        {/* Bottom CTA */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', background: 'rgba(0,230,180,0.05)', borderRadius: '14px', border: '1px solid rgba(0,230,180,0.2)', flexWrap: 'wrap', gap: '14px' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Interactive simulation — {caseView.steps.length} steps:</div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {caseView.steps.map((s, i) => (
                                        <span key={i} style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: '12px', background: 'rgba(114,137,255,0.15)', color: 'var(--text-secondary)' }}>
                                            {s.title}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 28px' }} onClick={() => startCase(caseView)}>
                                🏥 Begin Clinical Simulation →
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Disclaimer ── */}
                <div style={{ background: 'rgba(255,183,77,0.08)', border: '1px solid rgba(255,183,77,0.25)', borderRadius: '10px', padding: '10px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--accent-tertiary)' }}>
                    <span>⚠️</span>
                    <span>For academic learning purposes only — not for clinical decision making.</span>
                </div>

                {/* ── Built-in Scenario Library ── */}
                <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
                    📚 Built-in Simulation Cases:
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                    {cdssScenarios.map(scenario => (
                        <div key={scenario.id} className="glass-card" style={{ cursor: 'pointer', padding: '24px' }} onClick={() => startCase(scenario)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                <span className="badge badge-primary">{scenario.category}</span>
                                <span className={`badge ${scenario.difficulty === 'Advanced' ? 'badge-danger' : 'badge-warning'}`}>{scenario.difficulty}</span>
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{scenario.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
                                {scenario.demographics.age}y {scenario.demographics.gender} — {scenario.chiefComplaint}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{scenario.steps.length} decision phases</span>
                                <span style={{ marginLeft: 'auto', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600 }}>Start Case →</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Summary View ──────────────────────────────────────
    if (showSummary) {
        const pct = Math.round((score.correct / score.total) * 100);
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1>📋 Case Summary — {selectedCase.title}</h1>
                </div>
                <div className="glass-card" style={{ marginBottom: '24px', textAlign: 'center', padding: '32px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
                        {pct >= 75 ? '🏆' : pct >= 50 ? '👍' : '📖'}
                    </div>
                    <h2 style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem', marginBottom: '8px' }}>
                        {score.correct} / {score.total} Correct ({pct}%)
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        {pct >= 75 ? 'Excellent clinical reasoning!' : pct >= 50 ? 'Good effort — review explanations below.' : 'Keep studying — review each phase carefully.'}
                    </p>
                </div>

                {completedSteps.map((step, i) => (
                    <div key={i} className="glass-card" style={{ marginBottom: '16px', padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>{step.correct ? '✅' : '❌'}</span>
                            <h3 style={{ fontSize: '1rem' }}>{step.phase}</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{step.explanation}</p>
                    </div>
                ))}

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button className="btn btn-primary" onClick={handleBackToList}>← All Cases</button>
                    <button className="btn btn-secondary" onClick={() => startCase(selectedCase)}>🔄 Retry This Case</button>
                </div>
            </div>
        );
    }

    // ── Active Simulation ─────────────────────────────────
    const step = selectedCase.steps[currentStep];
    // Support both AI cases (step.correct = index) and built-in CDSS (step.options[i].correct = bool)
    const isAiCase = typeof step.correct === 'number';

    const getCorrectIdx = () => {
        if (isAiCase) return step.correct;
        return step.options?.findIndex(o => o.correct) ?? 0;
    };
    const getOptionText = (opt) => typeof opt === 'string' ? opt : opt.text;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <button className="btn btn-sm btn-secondary" onClick={handleBackToList}>← Back</button>
                <div>
                    <h2 style={{ fontSize: '1.3rem' }}>{selectedCase.title}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {typeof selectedCase.demographics === 'object'
                            ? `${selectedCase.demographics.age}y ${selectedCase.demographics.gender}`
                            : selectedCase.demographics} • {selectedCase.category}
                    </p>
                </div>
            </div>

            {/* Phase Progress */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {selectedCase.steps.map((s, i) => (
                    <div key={i} style={{
                        flex: 1, height: '4px', borderRadius: '4px',
                        background: i < currentStep ? 'var(--accent-primary)' : i === currentStep ? 'var(--accent-secondary)' : 'var(--border-color)',
                        transition: 'all 0.3s ease',
                    }} />
                ))}
            </div>

            {/* Patient Info — shown only on step 0 */}
            {currentStep === 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    {selectedCase.chiefComplaint && (
                        <div className="glass-card" style={{ padding: '16px' }}>
                            <h4 style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>📋 Chief Complaint</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedCase.chiefComplaint}</p>
                        </div>
                    )}
                    {selectedCase.vitals && (
                        <div className="glass-card" style={{ padding: '16px' }}>
                            <h4 style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>💓 Vitals</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.82rem' }}>
                                {typeof selectedCase.vitals === 'object' && Object.entries(selectedCase.vitals).map(([k, v]) => (
                                    <div key={k}><span style={{ color: 'var(--text-muted)' }}>{k}: </span><strong>{v}</strong></div>
                                ))}
                            </div>
                        </div>
                    )}
                    {(selectedCase.history || selectedCase.hpi) && (
                        <div className="glass-card" style={{ padding: '16px', gridColumn: 'span 2' }}>
                            <h4 style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>📝 History</h4>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                {selectedCase.history ? (
                                    <>
                                        <p><strong style={{ color: 'var(--accent-tertiary)' }}>Presenting:</strong> {selectedCase.history.presenting}</p>
                                        <p style={{ marginTop: '8px' }}><strong style={{ color: 'var(--accent-tertiary)' }}>Past Medical:</strong> {selectedCase.history.past}</p>
                                        <p style={{ marginTop: '8px' }}><strong style={{ color: 'var(--accent-tertiary)' }}>Social:</strong> {selectedCase.history.social}</p>
                                    </>
                                ) : (
                                    <p>{selectedCase.hpi}</p>
                                )}
                            </div>
                        </div>
                    )}
                    {(selectedCase.labs || (selectedCase.labLines && selectedCase.labLines.length > 0)) && (
                        <div className="glass-card" style={{ padding: '16px' }}>
                            <h4 style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>🔬 Lab Results</h4>
                            <div style={{ fontSize: '0.82rem' }}>
                                {selectedCase.labs ? Object.entries(selectedCase.labs).map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--border-color)' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                                        <strong>{v}</strong>
                                    </div>
                                )) : selectedCase.labLines?.map((l, i) => (
                                    <div key={i} style={{ fontFamily: 'monospace', padding: '3px 0', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{l}</div>
                                ))}
                            </div>
                        </div>
                    )}
                    {selectedCase.imaging && (
                        <div className="glass-card" style={{ padding: '16px' }}>
                            <h4 style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>🩻 Imaging</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7 }}>{selectedCase.imaging}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Decision Phase Card */}
            <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <span className="badge badge-purple">Phase {currentStep + 1}</span>
                    <h3 style={{ fontSize: '1.1rem' }}>{step.title || step.phase}</h3>
                </div>
                <p style={{ fontSize: '1.02rem', color: 'var(--text-primary)', marginBottom: '20px', lineHeight: 1.6, fontWeight: 500 }}>
                    {step.question}
                </p>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(isAiCase ? step.options : step.options).map((opt, i) => {
                        const optText = getOptionText(opt);
                        const correctIdx = getCorrectIdx();
                        let borderColor = 'var(--border-color)';
                        let bg = 'var(--bg-input)';
                        if (revealed) {
                            if (i === correctIdx) { borderColor = 'var(--accent-primary)'; bg = 'rgba(0,230,180,0.08)'; }
                            else if (i === selectedOption && i !== correctIdx) { borderColor = 'var(--accent-danger)'; bg = 'rgba(255,107,107,0.06)'; }
                        } else if (i === selectedOption) {
                            borderColor = 'var(--accent-secondary)'; bg = 'rgba(114,137,255,0.1)';
                        }
                        return (
                            <div key={i} onClick={() => handleSelectOption(i)} style={{ padding: '14px 18px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: bg, cursor: revealed ? 'default' : 'pointer', transition: 'all 0.2s', fontSize: '0.93rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <span style={{ minWidth: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, background: i === selectedOption && revealed ? (i === correctIdx ? 'var(--accent-primary)' : 'var(--accent-danger)') : 'transparent', color: i === selectedOption ? '#fff' : 'var(--text-muted)' }}>
                                    {String.fromCharCode(65 + i)}
                                </span>
                                <span>{optText}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Explanation */}
                {revealed && (
                    <div style={{ marginTop: '20px', padding: '16px 20px', background: selectedOption === getCorrectIdx() ? 'rgba(0,191,166,0.06)' : 'rgba(239,83,80,0.06)', borderLeft: `3px solid ${selectedOption === getCorrectIdx() ? 'var(--accent-primary)' : 'var(--accent-danger)'}`, borderRadius: '0 8px 8px 0', animation: 'fadeIn 0.4s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '1.1rem' }}>{selectedOption === getCorrectIdx() ? '✅' : '❌'}</span>
                            <strong style={{ color: selectedOption === getCorrectIdx() ? 'var(--accent-primary)' : 'var(--accent-danger)', fontSize: '0.95rem' }}>
                                {selectedOption === getCorrectIdx() ? 'Correct!' : 'Incorrect'}
                            </strong>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                            {step.explanation || (isAiCase ? '' : step.options[getCorrectIdx()]?.explanation)}
                        </p>

                        {/* AI Reasoning Button */}
                        {!stepAiExp[currentStep] && (
                            <button className="btn btn-sm btn-outline" style={{ marginTop: '12px' }} onClick={() => getStepAI(currentStep, { ...step, correct: getCorrectIdx(), options: step.options.map(getOptionText) })}>
                                🤖 AI Reasoning & Explanation
                            </button>
                        )}
                        {stepAiExp[currentStep]?.loading && (
                            <div style={{ marginTop: '10px', color: 'var(--accent-primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span> Generating AI reasoning…
                            </div>
                        )}
                        {/* Display Structured AI Reasoning */}
                        {stepAiExp[currentStep]?.structured && (
                            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {stepAiExp[currentStep].reasoning && (
                                    <div style={{ padding: '12px 14px', background: 'rgba(0,230,180,0.04)', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)' }}>
                                        <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontSize: '0.85rem', marginBottom: '4px' }}>
                                            <span>💡</span> Correct Answer Reasoning
                                        </strong>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.88rem', margin: 0 }}>{stepAiExp[currentStep].reasoning}</p>
                                    </div>
                                )}
                                {stepAiExp[currentStep].incorrect && (
                                    <div style={{ padding: '12px 14px', background: 'rgba(255,107,107,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--accent-danger)' }}>
                                        <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-danger)', fontSize: '0.85rem', marginBottom: '4px' }}>
                                            <span>⚠️</span> Incorrect Options Analysis
                                        </strong>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.88rem', margin: 0 }}>{stepAiExp[currentStep].incorrect}</p>
                                    </div>
                                )}
                                {stepAiExp[currentStep].pearl && (
                                    <div style={{ padding: '12px 14px', background: 'linear-gradient(90deg, rgba(255,193,7,0.06), transparent)', borderRadius: '8px', borderLeft: '3px solid #ffc107' }}>
                                        <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffc107', fontSize: '0.85rem', marginBottom: '4px' }}>
                                            <span>🌟</span> High-Yield Exam Pearl
                                        </strong>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.88rem', margin: 0 }}>{stepAiExp[currentStep].pearl}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Fallback Display if unstructured */}
                        {!stepAiExp[currentStep]?.structured && stepAiExp[currentStep]?.text && (
                            <div style={{ marginTop: '12px', padding: '14px', background: 'rgba(0,230,180,0.04)', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)' }}>
                                <strong style={{ color: 'var(--accent-primary)', fontSize: '0.82rem' }}>🤖 AI Clinical Reasoning:</strong>
                                <p style={{ marginTop: '6px', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.88rem' }}>{stepAiExp[currentStep].text}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    {!revealed ? (
                        <button className="btn btn-primary" onClick={handleSubmitAnswer} disabled={selectedOption === null}>Submit Answer</button>
                    ) : (
                        <button className="btn btn-primary" onClick={handleNext}>
                            {currentStep < selectedCase.steps.length - 1 ? 'Next Phase →' : 'View Summary →'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
