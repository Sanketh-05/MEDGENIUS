// ═══════════════════════════════════════════════════════════════
// Clinical Decision Tree Generator
// ═══════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { chatCompletion } from '../utils/aiService';

export default function ClinicalDecisionTreePage() {
    const [scenario, setScenario] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [results, setResults] = useState(null);

    const handleGenerate = async () => {
        if (!scenario.trim()) return;
        setLoading(true);
        setErrorMsg('');
        setResults(null);

        const systemPrompt = `You are an expert clinical guidelines author. Generate a step-by-step diagnostic or management algorithm (decision tree) for the requested clinical scenario.
Return your response EXACTLY in this JSON format:
{
  "title": "Algorithm for ...",
  "steps": [
    {
      "phase": "Step 1: Initial Assessment",
      "details": "What to assess or test...",
      "decisionPoint": "What is the key question or finding?",
      "branches": [
        { "condition": "If finding A", "action": "Do X" },
        { "condition": "If finding B", "action": "Do Y / Proceed to Step 2" }
      ]
    }
  ]
}
Make sure the flow is logical. You can include up to 6 steps. Do not include any text outside the JSON block.`;

        const userPrompt = `Create a clinical decision tree for: ${scenario}`;

        try {
            const raw = await chatCompletion(systemPrompt, userPrompt, { maxTokens: 1800, temperature: 0.2 });
            const jsonStrMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonStrMatch) {
                const parsed = JSON.parse(jsonStrMatch[0]);
                setResults(parsed);
            } else {
                throw new Error("Invalid output format");
            }
        } catch (err) {
            console.error('[Tree Error]', err);
            setErrorMsg('Failed to generate decision tree. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
            <div className="page-header">
                <h1>🌳 Clinical Decision Tree</h1>
                <p>Generate step-by-step algorithmic pathways for diagnosing or managing specific conditions.</p>
            </div>

            <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Clinical Scenario / Condition</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Management of Acute Exacerbation of COPD"
                            value={scenario}
                            onChange={(e) => setScenario(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleGenerate} disabled={loading || !scenario.trim()} style={{ height: '42px' }}>
                        {loading ? '⏳ Building Tree...' : '🌳 Generate Tree'}
                    </button>
                </div>
                {errorMsg && (
                    <div style={{ color: 'var(--accent-danger)', fontSize: '0.9rem', marginTop: '12px' }}>⚠️ {errorMsg}</div>
                )}
            </div>

            {results && results.steps && (
                <div className="animate-fade-in">
                    <h2 style={{ color: 'var(--accent-primary)', marginBottom: '24px', textAlign: 'center' }}>{results.title}</h2>
                    
                    <div style={{ position: 'relative', margin: '0 auto', maxWidth: '800px' }}>
                        {/* Vertical line connecting steps */}
                        <div style={{ position: 'absolute', top: '20px', bottom: '40px', left: '26px', width: '3px', background: 'rgba(114,137,255,0.2)', zIndex: 0 }}></div>
                        
                        {results.steps.map((step, i) => (
                            <div key={i} style={{ position: 'relative', paddingLeft: '60px', marginBottom: '32px', zIndex: 1 }}>
                                {/* Node dot */}
                                <div style={{ position: 'absolute', left: '16px', top: '16px', width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-primary)', border: '4px solid var(--bg-surface)', boxShadow: '0 0 0 2px rgba(114,137,255,0.4)', zIndex: 2 }}></div>
                                
                                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--accent-secondary)' }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', color: 'var(--text-primary)' }}>{step.phase}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px' }}>
                                        {step.details}
                                    </p>
                                    
                                    {step.decisionPoint && (
                                        <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '10px', padding: '16px', marginTop: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <span style={{ fontSize: '1.2rem' }}>🤔</span>
                                                <strong style={{ color: '#ffb74d', fontSize: '1rem' }}>{step.decisionPoint}</strong>
                                            </div>
                                            
                                            {step.branches && step.branches.length > 0 && (
                                                <div style={{ display: 'grid', gap: '10px' }}>
                                                    {step.branches.map((b, j) => (
                                                        <div key={j} style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
                                                            <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.85rem', width: '30%', minWidth: '100px', display: 'flex', alignItems: 'center' }}>
                                                                {b.condition}
                                                            </div>
                                                            <div style={{ padding: '8px 12px', color: 'var(--text-primary)', fontSize: '0.9rem', flex: 1, display: 'flex', alignItems: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                                                                {b.action}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
