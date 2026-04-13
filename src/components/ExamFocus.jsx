import React from 'react';

export default function ExamFocus({ examTips }) {
    if (!examTips) return null;

    return (
        <div className="section animate-fade-in" style={{ marginBottom: '24px' }}>
            <h2 className="section-title"><span className="icon">🎯</span> Exam Focus Section</h2>

            <div className="exam-focus-grid">
                {/* Important Topics */}
                {examTips.importantTopics && (
                    <div className="exam-focus-card">
                        <div className="card-emoji">🔥</div>
                        <h3>Most Important Topics</h3>
                        <ul>
                            {examTips.importantTopics.map((t, i) => (
                                <li key={i}>• {t}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Confused Concepts */}
                {examTips.confusedConcepts && (
                    <div className="exam-focus-card">
                        <div className="card-emoji">🧠</div>
                        <h3>Commonly Confused Concepts</h3>
                        <ul>
                            {examTips.confusedConcepts.map((c, i) => (
                                <li key={i}>• {c}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Answer Writing Tips */}
                {examTips.answerWritingTips && (
                    <div className="exam-focus-card" style={{ gridColumn: 'span 2' }}>
                        <div className="card-emoji">📝</div>
                        <h3>How to Write Exam Answers</h3>
                        <ul>
                            {Object.entries(examTips.answerWritingTips).map(([marks, tip]) => (
                                <li key={marks} style={{ padding: '10px 0' }}>
                                    <strong style={{ color: 'var(--accent-tertiary)' }}>{marks} answer: </strong>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
