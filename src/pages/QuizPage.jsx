import React, { useState, useEffect, useRef } from 'react';
import { findTopic, getAvailableTopics } from '../data/medicalData';
import { translateText, LANGUAGE_NAMES } from '../utils/translationService';
import { useProgress } from '../context/StudentProgressContext';
import { chatCompletion } from '../utils/aiService';

export default function QuizPage({ selectedTopic, onQuizComplete, customTopicData }) {
    const [topic, setTopic] = useState(selectedTopic || '');
    const [topicData, setTopicData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState({});
    const [difficulty, setDifficulty] = useState('all');
    const [score, setScore] = useState(0);
    const [totalAnswered, setTotalAnswered] = useState(0);
    const [quizComplete, setQuizComplete] = useState(false);
    const startTimeRef = useRef(Date.now());
    const { trackQuiz } = useProgress();

    // AI Explanation per question: { [qIdx]: { loading, text } }
    const [aiExplanations, setAiExplanations] = useState({});

    const getAIExplanation = async (qIdx) => {
        const q = questions[qIdx];
        if (!q) return;
        setAiExplanations(prev => ({ ...prev, [qIdx]: { loading: true, text: '' } }));
        try {
            const result = await chatCompletion(
                'You are a senior medical professor providing exam-oriented explanations. Be concise, accurate, and clinically relevant.',
                `Question: "${q.question}"\nCorrect Answer: "${q.options[q.correct]}"\nWrong options: ${q.options.filter((_, i) => i !== q.correct).map(o => `"${o}"`).join(', ')}\n\nProvide a 4-5 sentence expert clinical explanation: (1) Why the correct answer is right with mechanism/guideline, (2) Why each wrong option is wrong, (3) One key high-yield exam pearl.`,
                { maxTokens: 400, temperature: 0.2 }
            );
            setAiExplanations(prev => ({ ...prev, [qIdx]: { loading: false, text: result || 'No explanation available.' } }));
        } catch {
            setAiExplanations(prev => ({ ...prev, [qIdx]: { loading: false, text: 'AI explanation unavailable. Please check your API key.' } }));
        }
    };

    // Translation states
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [translating, setTranslating] = useState(false);
    const [translatedQuestions, setTranslatedQuestions] = useState({}); // cache translated questions

    const availableTopics = getAvailableTopics();

    useEffect(() => {
        if (selectedTopic) {
            loadTopic(selectedTopic);
        }
    }, [selectedTopic]);

    const loadTopic = (topicName) => {
        const found = findTopic(topicName);
        // Use built-in topic if found, otherwise fall back to custom data from file upload
        const data = (found && found.quiz) ? found : (customTopicData && customTopicData.quiz ? customTopicData : null);
        if (data && data.quiz) {
            setTopicData(data);
            setTopic(data.title);
            const filtered = difficulty === 'all'
                ? data.quiz
                : data.quiz.filter(q => q.difficulty === difficulty);
            setQuestions(filtered.length > 0 ? filtered : data.quiz);
            setAnswers({});
            setSubmitted({});
            setScore(0);
            setTotalAnswered(0);
            setQuizComplete(false);
        }
    };

    useEffect(() => {
        if (topicData?.quiz) {
            const filtered = difficulty === 'all'
                ? topicData.quiz
                : topicData.quiz.filter(q => q.difficulty === difficulty);
            setQuestions(filtered.length > 0 ? filtered : topicData.quiz);
            setAnswers({});
            setSubmitted({});
            setScore(0);
            setTotalAnswered(0);
            setQuizComplete(false);
        }
    }, [difficulty, topicData]);

    const handleLanguageChange = async (lang) => {
        setSelectedLanguage(lang);
        if (lang === 'en' || !questions.length) return;

        setTranslating(true);
        const newTranslations = { ...translatedQuestions };

        try {
            // Translate current questions sequentially to avoid rate limits
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (!newTranslations[i]) newTranslations[i] = {};
                // Translate question text
                if (!newTranslations[i].question) {
                    newTranslations[i].question = await translateText(q.question, lang);
                }
                // Translate options (optimistic limited translation for UI speed)
                if (!newTranslations[i].options) {
                    newTranslations[i].options = [];
                    for (let j = 0; j < q.options.length; j++) {
                        newTranslations[i].options.push(await translateText(q.options[j], lang));
                    }
                }
                setTranslatedQuestions({ ...newTranslations });
                // Delay between strings
                await new Promise(r => setTimeout(r, 200));
            }
        } catch (e) {
            console.error("Quiz translation failed", e);
        } finally {
            setTranslating(false);
        }
    };

    // Re-run translation if questions change and language is not English
    useEffect(() => {
        if (selectedLanguage !== 'en' && questions.length > 0) {
            handleLanguageChange(selectedLanguage);
        }
    }, [questions]);

    const selectAnswer = (qIdx, optIdx) => {
        if (submitted[qIdx] !== undefined) return;
        setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    };

    const submitAnswer = (qIdx) => {
        if (answers[qIdx] === undefined) return;
        const isCorrect = answers[qIdx] === questions[qIdx].correct;
        const updatedSubmitted = { ...submitted, [qIdx]: isCorrect };
        setSubmitted(updatedSubmitted);
        setTotalAnswered(prev => prev + 1);
        const newScore = (isCorrect ? score + 1 : score);
        if (isCorrect) setScore(newScore);

        // Check if all answered
        if (Object.keys(updatedSubmitted).length === questions.length) {
            setQuizComplete(true);
            onQuizComplete?.();
            // Track in analytics
            const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
            trackQuiz(topic || 'Unknown Topic', newScore, questions.length, timeSpent);
        }
    };

    const getOptionClass = (qIdx, optIdx) => {
        if (submitted[qIdx] === undefined) {
            return answers[qIdx] === optIdx ? 'quiz-option selected' : 'quiz-option';
        }
        if (optIdx === questions[qIdx].correct) return 'quiz-option correct';
        if (answers[qIdx] === optIdx) return 'quiz-option incorrect';
        return 'quiz-option';
    };

    const getGrade = () => {
        const pct = (score / questions.length) * 100;
        if (pct >= 90) return { label: '🏆 Outstanding!', color: 'var(--accent-primary)' };
        if (pct >= 75) return { label: '🌟 Excellent!', color: 'var(--accent-secondary)' };
        if (pct >= 60) return { label: '👍 Good Job!', color: 'var(--accent-tertiary)' };
        if (pct >= 40) return { label: '📖 Needs Improvement', color: 'var(--accent-danger)' };
        return { label: '💪 Keep Studying!', color: 'var(--accent-danger)' };
    };

    const resetQuiz = () => {
        setAnswers({});
        setSubmitted({});
        setScore(0);
        setTotalAnswered(0);
        setQuizComplete(false);
        startTimeRef.current = Date.now();
    };

    // Topic selection screen
    if (!topicData) {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1>📝 Self-Assessment Quiz</h1>
                    <p>Test your knowledge with exam-style MCQs</p>
                </div>
                <div className="section">
                    <h2 className="section-title">Select a Topic</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                        {availableTopics.map((t, i) => (
                            <div key={i} className="glass-card" style={{ cursor: 'pointer', padding: '24px' }} onClick={() => loadTopic(t.title)}>
                                <span className="badge badge-primary">{t.category}</span>
                                <h3 style={{ marginTop: '12px', fontSize: '1.1rem' }}>{t.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>Click to start quiz →</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>📝 Quiz: {topic}</h1>
                <p>Answer all questions and check your understanding</p>
            </div>

            {/* Progress & Difficulty */}
            <div className="glass-card" style={{ marginBottom: '24px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Score: </span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1.1rem', marginRight: '16px' }}>{score}/{questions.length}</span>

                        {/* Language Selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🌐</span>
                            <select
                                className="input-field"
                                style={{ padding: '4px 8px', fontSize: '0.85rem', width: 'auto', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                                value={selectedLanguage}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                disabled={translating}
                            >
                                <option value="en">English</option>
                                {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                                    <option key={code} value={code}>{name}</option>
                                ))}
                            </select>
                            {translating && <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>Translating...</span>}
                        </div>
                    </div>
                    <div className="difficulty-selector">
                        {['all', 'easy', 'moderate', 'clinical', 'hard'].map(d => (
                            <button
                                key={d}
                                className={`difficulty-btn${difficulty === d ? ' active' : ''}`}
                                onClick={() => setDifficulty(d)}
                            >
                                {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${(totalAnswered / questions.length) * 100}%` }} />
                </div>
            </div>

            {/* Score Card (when complete) */}
            {quizComplete && (
                <div className="score-card">
                    <div className="score-value">{Math.round((score / questions.length) * 100)}%</div>
                    <div className="score-label">{score} out of {questions.length} correct</div>
                    <div className="score-grade" style={{ color: getGrade().color }}>{getGrade().label}</div>
                    <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={resetQuiz}>🔄 Retake Quiz</button>
                </div>
            )}

            {/* Questions */}
            {questions.map((q, qIdx) => {
                const displayQ = (selectedLanguage !== 'en' && translatedQuestions[qIdx]?.question) ? translatedQuestions[qIdx].question : q.question;
                const displayOpts = (selectedLanguage !== 'en' && translatedQuestions[qIdx]?.options) ? translatedQuestions[qIdx].options : q.options;

                return (
                    <div key={qIdx} className="quiz-question" style={{ animationDelay: `${qIdx * 0.1}s` }}>
                        <div className="question-number">
                            Question {qIdx + 1} of {questions.length}
                            <span className="badge badge-secondary" style={{ marginLeft: '10px' }}>
                                {q.difficulty}
                            </span>
                            {q.source === 'ai' && (
                                <span className="badge badge-purple" style={{ marginLeft: '6px', fontSize: '0.72rem' }}>✨ AI</span>
                            )}
                        </div>
                        <div className="question-text">{displayQ}</div>

                        {displayOpts.map((opt, optIdx) => (
                            <div
                                key={optIdx}
                                className={getOptionClass(qIdx, optIdx)}
                                onClick={() => selectAnswer(qIdx, optIdx)}
                            >
                                <div className="radio-circle">
                                    {submitted[qIdx] !== undefined && optIdx === q.correct && '✓'}
                                    {submitted[qIdx] !== undefined && answers[qIdx] === optIdx && optIdx !== q.correct && '✗'}
                                </div>
                                <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            </div>
                        ))}

                        {/* Submit button */}
                        {submitted[qIdx] === undefined && (
                            <button
                                className="btn btn-sm btn-primary"
                                style={{ marginTop: '12px' }}
                                onClick={() => submitAnswer(qIdx)}
                                disabled={answers[qIdx] === undefined}
                            >
                                Check Answer
                            </button>
                        )}

                        {/* Static Explanation */}
                        {submitted[qIdx] !== undefined && (
                            <div className={`quiz-explanation ${submitted[qIdx] ? 'correct-explanation' : 'incorrect-explanation'}`}>
                                {submitted[qIdx] ? (
                                    <>
                                        <strong>✅ Correct!</strong>
                                        <p style={{ marginTop: '6px' }}>{q.explanations.correct}</p>
                                    </>
                                ) : (
                                    <>
                                        <strong>❌ Incorrect</strong>
                                        {q.explanations?.wrong?.[answers[qIdx]] && (
                                            <p style={{ marginTop: '6px', color: 'var(--accent-danger)' }}>
                                                <strong>Why your answer is wrong:</strong> {q.explanations.wrong[answers[qIdx]]}
                                            </p>
                                        )}
                                        <p style={{ marginTop: '8px', color: 'var(--accent-primary)' }}>
                                            <strong>Correct answer ({String.fromCharCode(65 + q.correct)}):</strong> {q.explanations?.correct || 'Review the notes for this topic.'}
                                        </p>
                                    </>
                                )}

                                {/* AI Deep Explanation Button */}
                                {!aiExplanations[qIdx] && (
                                    <button
                                        className="btn btn-sm btn-outline"
                                        style={{ marginTop: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        onClick={() => getAIExplanation(qIdx)}
                                    >
                                        🤖 AI Deep Explanation
                                    </button>
                                )}
                                {aiExplanations[qIdx]?.loading && (
                                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontSize: '0.82rem' }}>
                                        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span> AI is generating clinical explanation…
                                    </div>
                                )}
                                {aiExplanations[qIdx]?.text && (
                                    <div style={{ marginTop: '12px', padding: '14px 16px', background: 'rgba(114,137,255,0.07)', borderRadius: '10px', borderLeft: '3px solid var(--accent-secondary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '1rem' }}>🤖</span>
                                            <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Clinical Explanation</strong>
                                        </div>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7, margin: 0 }}>{aiExplanations[qIdx].text}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Reset button */}
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <button className="btn btn-secondary" onClick={() => { setTopicData(null); setTopic(''); }}>
                    ← Choose Different Topic
                </button>
            </div>
        </div>
    );
}
