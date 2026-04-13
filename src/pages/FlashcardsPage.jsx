// ═══════════════════════════════════════════════════════════════
// Flashcards Page — Enhanced with Groq AI Topic Generation
// Users enter any topic → AI generates accurate Q&A flashcards
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import { findTopic, getAvailableTopics } from '../data/medicalData';
import { chatCompletion } from '../utils/aiService';
import { useProgress } from '../context/StudentProgressContext';

export default function FlashcardsPage({ selectedTopic, onFlashcardReview, customTopicData }) {
    const [topicData, setTopicData] = useState(null);
    const [flashcards, setFlashcards] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [category, setCategory] = useState('all');
    const [aiTopicInput, setAiTopicInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const sessionStartRef = useRef(Date.now());
    const cardsViewedRef = useRef(new Set());
    const { trackFlashcards } = useProgress();

    // AI Explanations keyed by card index
    const [cardAiExplanations, setCardAiExplanations] = useState({});

    const getCardAIExplanation = async (idx, card) => {
        if (cardAiExplanations[idx] || !card) return;
        setCardAiExplanations(prev => ({ ...prev, [idx]: { loading: true, text: '' } }));
        try {
            const result = await chatCompletion(
                'You are a senior clinical professor creating exam-ready explanations for medical students.',
                `Flashcard concept:\nQuestion: "${card.front}"\nAnswer: "${card.back}"\n\nProvide an expanded 4-5 sentence clinical explanation: include underlying mechanism, clinical application, key exam pearl, and one common pitfall or mnemonics if applicable. Do not repeat the answer verbatim.`,
                { maxTokens: 350, temperature: 0.2 }
            );
            setCardAiExplanations(prev => ({ ...prev, [idx]: { loading: false, text: result || 'No explanation.' } }));
        } catch {
            setCardAiExplanations(prev => ({ ...prev, [idx]: { loading: false, text: 'AI explanation unavailable.' } }));
        }
    };

    const availableTopics = getAvailableTopics();
    const categories = [
        { id: 'all', label: 'All', icon: '📋' },
        { id: 'definitions', label: 'Definitions', icon: '📖' },
        { id: 'pathways', label: 'Pathways', icon: '🔄' },
        { id: 'drugs', label: 'Drugs & Uses', icon: '💊' },
        { id: 'clinical', label: 'Clinical', icon: '🩺' },
    ];

    useEffect(() => {
        if (selectedTopic) loadTopic(selectedTopic);
    }, [selectedTopic]);

    const loadTopic = (topicName) => {
        const found = findTopic(topicName);
        const data = (found && found.flashcards) ? found : (customTopicData && customTopicData.flashcards ? customTopicData : null);
        if (data?.flashcards) {
            setTopicData(data);
            setFlashcards(data.flashcards);
            setCurrentIdx(0);
            setFlipped(false);
            setCategory('all');
            onFlashcardReview?.();
            // Reset session tracking
            sessionStartRef.current = Date.now();
            cardsViewedRef.current = new Set();
        }
    };

    useEffect(() => {
        if (topicData?.flashcards) {
            const filtered = category === 'all'
                ? topicData.flashcards
                : topicData.flashcards.filter(f => f.category === category);
            setFlashcards(filtered.length > 0 ? filtered : topicData.flashcards);
            setCurrentIdx(0);
            setFlipped(false);
        }
    }, [category]);

    // ── AI Flashcard Generation via Groq ─────────────────────
    const generateAIFlashcards = async () => {
        if (!aiTopicInput.trim() || aiLoading) return;
        setAiLoading(true);
        setAiError('');

        const systemPrompt = `You are a medical education expert creating precise flashcards for MBBS/MD students. 
Generate accurate, high-yield Q&A pairs. Front = clear clinical question. Back = concise, correct answer with key facts. 
Output ONLY valid JSON, no extra text.`;

        const userPrompt = `Generate exactly 12 high-quality medical flashcards for the topic: "${aiTopicInput}"

Return ONLY this JSON (no markdown, no extra text):
{
  "cards": [
    {
      "front": "What is the gold standard investigation for [specific aspect of ${aiTopicInput}]?",
      "back": "The gold standard is [specific answer]. [Brief explanation why].",
      "category": "clinical"
    }
  ]
}

Categories to use: "definitions", "clinical", "pathways", "drugs"
Topics to cover: etiology, pathophysiology, clinical features, investigations, management, complications, prognosis.
Make questions SPECIFIC and answers ACCURATE. No vague or generic answers.`;

        try {
            const result = await chatCompletion(systemPrompt, userPrompt, { maxTokens: 2000, temperature: 0.3 });

            // Extract JSON from response
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in response');

            const parsed = JSON.parse(jsonMatch[0]);
            if (!parsed.cards || parsed.cards.length === 0) throw new Error('No cards in response');

            const aiTopicData = {
                title: aiTopicInput,
                category: 'AI Generated',
                fromAI: true,
                flashcards: parsed.cards.map((c, i) => ({
                    front: c.front || `Question ${i + 1} about ${aiTopicInput}`,
                    back: c.back || 'No answer provided.',
                    category: c.category || 'clinical',
                })),
            };

            setTopicData(aiTopicData);
            setFlashcards(aiTopicData.flashcards);
            setCurrentIdx(0);
            setFlipped(false);
            setCategory('all');
            onFlashcardReview?.();
        } catch (err) {
            console.error('AI flashcard generation failed:', err);
            setAiError('Could not generate flashcards. Check your API key or try a more specific topic.');
        }
        setAiLoading(false);
    };

    const goNext = () => {
        // Track this card as viewed
        cardsViewedRef.current.add(currentIdx);
        // Auto-track after every 3 cards to record activity
        if (cardsViewedRef.current.size % 3 === 0 && topicData) {
            const timeSpent = Math.round((Date.now() - sessionStartRef.current) / 1000);
            trackFlashcards(topicData.title || 'Flashcards', cardsViewedRef.current.size, timeSpent);
        }
        setFlipped(false);
        setTimeout(() => setCurrentIdx(i => Math.min(i + 1, flashcards.length - 1)), 200);
    };

    const goPrev = () => {
        cardsViewedRef.current.add(currentIdx);
        setFlipped(false);
        setTimeout(() => setCurrentIdx(i => Math.max(i - 1, 0)), 200);
    };

    // ── Topic selection screen ────────────────────────────────
    if (!topicData) {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1>🃏 Flashcards</h1>
                    <p>Review key concepts with interactive flip cards</p>
                </div>

                {/* AI Generator */}
                <div className="glass-card" style={{ padding: '24px', marginBottom: '28px', border: '1px solid rgba(0,230,180,0.2)' }}>
                    <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
                        🤖 AI Flashcard Generator
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '14px' }}>
                        Enter any medical topic — AI will generate 12 accurate, high-yield Q&A flashcards with correct clinical answers.
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            className="input-field"
                            style={{ flex: 1, padding: '12px 16px', fontSize: '0.9rem' }}
                            placeholder="E.g., Renal Failure, Diabetes Mellitus, Septic Shock..."
                            value={aiTopicInput}
                            onChange={e => setAiTopicInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && generateAIFlashcards()}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={generateAIFlashcards}
                            disabled={aiLoading || !aiTopicInput.trim()}
                        >
                            {aiLoading ? '⏳ Generating...' : '⚡ Generate Cards'}
                        </button>
                    </div>

                    {aiLoading && (
                        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', fontSize: '0.88rem' }}>
                            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span>
                            AI is generating accurate medical flashcards for "{aiTopicInput}"…
                        </div>
                    )}

                    {aiError && (
                        <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(255,107,107,0.08)', borderLeft: '3px solid var(--accent-danger)', borderRadius: '0 8px 8px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            ⚠️ {aiError}
                        </div>
                    )}
                </div>

                {/* Built-in Topics */}
                <h3 style={{ marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
                    📚 Built-in Topic Library:
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                    {availableTopics.map((t, i) => (
                        <div key={i} className="glass-card" style={{ cursor: 'pointer', padding: '24px' }} onClick={() => loadTopic(t.title)}>
                            <span className="badge badge-purple">{t.category}</span>
                            <h3 style={{ marginTop: '12px', fontSize: '1.1rem' }}>{t.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>Click to review flashcards →</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const card = flashcards[currentIdx];

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>🃏 {topicData.fromAI ? '🤖 AI ' : ''}Flashcards: {topicData.title}</h1>
                <p>Click the card to flip • Use arrows to navigate{topicData.fromAI ? ' • AI-generated with accurate medical answers' : ''}</p>
            </div>

            {/* Category Tabs */}
            <div className="tabs">
                {categories.map(cat => (
                    <button key={cat.id} className={`tab${category === cat.id ? ' active' : ''}`} onClick={() => setCategory(cat.id)}>
                        {cat.icon} {cat.label}
                    </button>
                ))}
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Card {currentIdx + 1} of {flashcards.length}
                    {topicData.fromAI && <span style={{ marginLeft: '10px', fontSize: '0.78rem', color: 'var(--accent-primary)' }}>⚡ AI Generated</span>}
                </span>
                <div className="progress-bar-track" style={{ flex: 1, maxWidth: '200px', marginLeft: '16px' }}>
                    <div className="progress-bar-fill" style={{ width: `${((currentIdx + 1) / flashcards.length) * 100}%` }} />
                </div>
            </div>

            {/* Flashcard */}
            {card && (
                <div className="flashcard-container" onClick={() => setFlipped(f => !f)}>
                    <div className={`flashcard-inner${flipped ? ' flipped' : ''}`}>
                        {/* Front */}
                        <div className="flashcard-face flashcard-front">
                            <div className="flashcard-label">Question</div>
                            <div className="flashcard-question">{card.front}</div>
                            <div className="flashcard-hint">🖱️ Click to reveal answer</div>
                        </div>
                        {/* Back */}
                        <div className="flashcard-face flashcard-back">
                            <div className="flashcard-label">Answer</div>
                            <div className="flashcard-answer" dangerouslySetInnerHTML={{
                                __html: card.back
                                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--accent-primary)">$1</strong>')
                                    .replace(/\n/g, '<br/>')
                            }} />
                            <div className="flashcard-hint">🖱️ Click to flip back</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
                <button className="btn btn-secondary" onClick={goPrev} disabled={currentIdx === 0}>← Previous</button>
                <button className="btn btn-primary" onClick={goNext} disabled={currentIdx === flashcards.length - 1}>Next →</button>
            </div>

            {/* AI Deeper Explanation — shows when card is flipped to answer side */}
            {flipped && card && (
                <div style={{ marginTop: '20px' }}>
                    {!cardAiExplanations[currentIdx] && (
                        <div style={{ textAlign: 'center' }}>
                            <button
                                className="btn btn-sm btn-outline"
                                style={{ fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                onClick={() => getCardAIExplanation(currentIdx, card)}
                            >
                                🤖 AI Deeper Explanation
                            </button>
                        </div>
                    )}
                    {cardAiExplanations[currentIdx]?.loading && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--accent-primary)', fontSize: '0.85rem', padding: '12px' }}>
                            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span>
                            Generating AI explanation…
                        </div>
                    )}
                    {cardAiExplanations[currentIdx]?.text && (
                        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '3px solid var(--accent-secondary)', background: 'rgba(114,137,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '1.1rem' }}>🤖</span>
                                <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.83rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Clinical Deep-Dive</strong>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.75, margin: 0 }}>{cardAiExplanations[currentIdx].text}</p>
                        </div>
                    )}
                </div>
            )}

            {/* All Cards Overview */}
            <div className="section" style={{ marginTop: '40px' }}>
                <h2 className="section-title"><span className="icon">📋</span> All Cards in This Set</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                    {flashcards.map((fc, i) => (
                        <div
                            key={i}
                            className="glass-card"
                            style={{
                                cursor: 'pointer', padding: '16px',
                                borderColor: i === currentIdx ? 'var(--accent-primary)' : undefined,
                                boxShadow: i === currentIdx ? 'var(--shadow-glow)' : undefined
                            }}
                            onClick={() => { setCurrentIdx(i); setFlipped(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        >
                            <span className="badge badge-secondary" style={{ marginBottom: '6px' }}>{fc.category}</span>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{fc.front}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Back button */}
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <button className="btn btn-secondary" onClick={() => { setTopicData(null); setAiTopicInput(''); }}>
                    ← Choose Different Topic
                </button>
            </div>
        </div>
    );
}
