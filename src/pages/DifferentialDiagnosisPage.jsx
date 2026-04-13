// ═══════════════════════════════════════════════════════════════
// Differential Diagnosis Assistant
// ═══════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { chatCompletion } from '../utils/aiService';

export default function DifferentialDiagnosisPage() {
    const [symptoms, setSymptoms] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Male');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [results, setResults] = useState(null);

    const handleGenerate = async () => {
        if (!symptoms.trim()) return;
        setLoading(true);
        setErrorMsg('');
        setResults(null);

        const systemPrompt = `You are an expert physician. Generate a differential diagnosis based on the provided symptoms, age, and gender.
Return your response EXACTLY in this JSON format:
{
  "summary": "Brief 1-sentence summary of the presentation",
  "mustNotMiss": [
    { "condition": "Name", "reason": "Why it's life-threatening or urgent" }
  ],
  "differentials": [
    { "condition": "Name", "likelihood": "High/Medium/Low", "reasoning": "Why it fits", "nextSteps": "Key labs/imaging" }
  ]
}
Do not include any text outside the JSON block.`;

        const userPrompt = `Patient Profile:
Age: ${age || 'Unknown'}
Gender: ${gender}
Symptoms/Signs: ${symptoms}

Generate the differential diagnosis in JSON.`;

        try {
            const raw = await chatCompletion(systemPrompt, userPrompt, { maxTokens: 1500, temperature: 0.3 });
            // Extract JSON from potential markdown wrapping
            const jsonStrMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonStrMatch) {
                const parsed = JSON.parse(jsonStrMatch[0]);
                setResults(parsed);
            } else {
                throw new Error("Invalid output format");
            }
        } catch (err) {
            console.error('[DDX Error]', err);
            setErrorMsg('Failed to generate differential diagnosis. Please try again or check your AI service connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
            <div className="page-header">
                <h1>🔍 Differential Diagnosis Assistant</h1>
                <p>Enter patient signs and symptoms to generate a prioritized list of possible conditions.</p>
            </div>

            <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 1fr) minmax(100px, 1fr) 3fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Age</label>
                        <input
                            type="number"
                            className="input-field"
                            placeholder="e.g. 45"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Gender</label>
                        <select className="input-field" value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Symptoms & Presentation</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Sudden onset tearing chest pain radiating to the back"
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button className="btn btn-primary" onClick={handleGenerate} disabled={loading || !symptoms.trim()}>
                        {loading ? '⏳ Analyzing...' : '⚡ Generate DDx'}
                    </button>
                    {errorMsg && (
                        <span style={{ color: 'var(--accent-danger)', fontSize: '0.9rem' }}>⚠️ {errorMsg}</span>
                    )}
                </div>
            </div>

            {results && (
                <div className="animate-fade-in">
                    <div style={{ padding: '16px 20px', background: 'rgba(114,137,255,0.08)', borderRadius: '12px', borderLeft: '3px solid var(--accent-secondary)', marginBottom: '24px' }}>
                        <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                            <strong>Presentation:</strong> {results.summary}
                        </p>
                    </div>

                    {results.mustNotMiss && results.mustNotMiss.length > 0 && (
                        <div style={{ marginBottom: '28px' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-danger)', marginBottom: '12px' }}>
                                🚨 Must Not Miss (Red Flags)
                            </h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {results.mustNotMiss.map((item, i) => (
                                    <div key={i} className="glass-card" style={{ padding: '16px', borderLeft: '3px solid var(--accent-danger)' }}>
                                        <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: 'var(--accent-danger)' }}>{item.condition}</h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>📋 Likely Differentials</h3>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {results.differentials?.map((item, i) => {
                                const likelyBadge = item.likelihood?.toLowerCase().includes('high') ? 'badge-primary'
                                    : item.likelihood?.toLowerCase().includes('medium') ? 'badge-warning'
                                    : 'badge-secondary';

                                return (
                                    <div key={i} className="glass-card" style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{item.condition}</h4>
                                            <span className={`badge ${likelyBadge}`}>{item.likelihood}</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', fontSize: '0.9rem' }}>
                                            <div style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px' }}>
                                                <strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '4px' }}>Clinical Reasoning:</strong>
                                                <span style={{ color: 'var(--text-secondary)' }}>{item.reasoning}</span>
                                            </div>
                                            <div style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px' }}>
                                                <strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '4px' }}>Next Best Steps (Labs/Imaging):</strong>
                                                <span style={{ color: 'var(--text-secondary)' }}>{item.nextSteps}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
