// ═══════════════════════════════════════════════════════════════
// Disease Comparison Tool
// ═══════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { chatCompletion } from '../utils/aiService';

export default function DiseaseComparisonPage() {
    const [diseasesInput, setDiseasesInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [results, setResults] = useState(null);

    const handleCompare = async () => {
        if (!diseasesInput.trim()) return;
        setLoading(true);
        setErrorMsg('');
        setResults(null);

        const systemPrompt = `You are an expert physician and educator. Provide a comprehensive side-by-side comparison of the requested diseases or conditions.
Return your response EXACTLY in this JSON format:
{
  "diseases": ["Name of Disease 1", "Name of Disease 2"],
  "comparison": [
    {
      "feature": "Etiology / Pathophysiology",
      "Disease 1": "details...",
      "Disease 2": "details..."
    },
    {
      "feature": "Clinical Presentation",
      "Disease 1": "details...",
      "Disease 2": "details..."
    },
    {
      "feature": "Diagnosis & Key Labs/Imaging",
      "Disease 1": "details...",
      "Disease 2": "details..."
    },
    {
      "feature": "Management & Treatment",
      "Disease 1": "details...",
      "Disease 2": "details..."
    },
    {
      "feature": "Complications",
      "Disease 1": "details...",
      "Disease 2": "details..."
    }
  ]
}
Ensure the keys in the "comparison" array EXACTLY match the names provided in the "diseases" array. Do not include any text outside the JSON block.`;

        const userPrompt = `Compare the following diseases/conditions: ${diseasesInput}`;

        try {
            const raw = await chatCompletion(systemPrompt, userPrompt, { maxTokens: 2000, temperature: 0.2 });
            const jsonStrMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonStrMatch) {
                const parsed = JSON.parse(jsonStrMatch[0]);
                setResults(parsed);
            } else {
                throw new Error("Invalid output format from AI");
            }
        } catch (err) {
            console.error('[Compare Error]', err);
            setErrorMsg('Failed to generate comparison. Please ensure you entered valid medical conditions and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
            <div className="page-header">
                <h1>⚖️ Disease Comparison Tool</h1>
                <p>Enter two or more diseases (e.g., "Crohn's Disease vs Ulcerative Colitis") to compare their presentation, diagnosis, and management side-by-side.</p>
            </div>

            <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Conditions to Compare</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Asthma vs COPD vs Bronchiectasis"
                            value={diseasesInput}
                            onChange={(e) => setDiseasesInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCompare()}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleCompare} disabled={loading || !diseasesInput.trim()} style={{ height: '42px' }}>
                        {loading ? '⏳ Analyzing...' : '⚖️ Compare Outcomes'}
                    </button>
                </div>
                {errorMsg && (
                    <div style={{ color: 'var(--accent-danger)', fontSize: '0.9rem', marginTop: '12px' }}>⚠️ {errorMsg}</div>
                )}
            </div>

            {results && results.diseases && results.comparison && (
                <div className="animate-fade-in" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '16px', background: 'rgba(114,137,255,0.15)', color: 'var(--accent-primary)', borderBottom: '2px solid rgba(114,137,255,0.3)', width: '15%', fontSize: '0.95rem' }}>
                                    Feature
                                </th>
                                {results.diseases.map((d, i) => (
                                    <th key={i} style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', borderBottom: '2px solid rgba(114,137,255,0.3)', fontSize: '1.05rem', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                                        {d}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {results.comparison.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
                                    <td style={{ padding: '16px', fontWeight: 600, color: 'var(--accent-secondary)', verticalAlign: 'top', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                                        {row.feature}
                                    </td>
                                    {results.diseases.map((d, j) => (
                                        <td key={j} style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, verticalAlign: 'top', borderRight: j < results.diseases.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                            {row[d] || 'N/A'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
