import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function HistoryPage({ setActivePage, setSelectedTopic }) {
    const { user, clearHistory } = useAuth();
    const history = user?.history || [];

    const resumeTopic = (topicName) => {
        setSelectedTopic(topicName);
        setActivePage('notes');
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1>📚 Study History</h1>
                        <p>Resume learning from where you left off</p>
                    </div>
                    {history.length > 0 && (
                        <button className="btn btn-sm btn-danger" onClick={clearHistory}>
                            🗑️ Clear History
                        </button>
                    )}
                </div>
            </div>

            {history.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📖</div>
                    <h3 style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No study sessions yet</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '20px' }}>
                        Generate notes on a topic to start building your study history
                    </p>
                    <button className="btn btn-primary" onClick={() => setActivePage('notes')}>
                        📘 Generate Notes
                    </button>
                </div>
            ) : (
                <div className="history-list">
                    {history.map((item, i) => (
                        <div
                            key={item.id || i}
                            className="history-item"
                            style={{ animationDelay: `${i * 0.05}s` }}
                            onClick={() => resumeTopic(item.topic)}
                        >
                            <div>
                                <div className="history-topic">{item.topic}</div>
                                <div className="history-date">
                                    {new Date(item.date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                            <div className="history-actions">
                                <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); resumeTopic(item.topic); }}>
                                    📘 Notes
                                </button>
                                <button className="btn btn-sm btn-secondary" onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTopic(item.topic);
                                    setActivePage('quiz');
                                }}>
                                    📝 Quiz
                                </button>
                                <button className="btn btn-sm btn-secondary" onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTopic(item.topic);
                                    setActivePage('flashcards');
                                }}>
                                    🃏 Cards
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
