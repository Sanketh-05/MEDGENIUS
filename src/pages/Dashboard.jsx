import React from 'react';
import { getAvailableTopics } from '../data/medicalData';

export default function Dashboard({ user, setActivePage, setSelectedTopic }) {
    const stats = user?.stats || {};
    const history = user?.history || [];
    const availableTopics = getAvailableTopics();

    const quickStart = (topicTitle) => {
        setSelectedTopic(topicTitle);
        setActivePage('notes');
    };

    return (
        <div className="animate-fade-in">
            {/* Educational Disclaimer */}
            <div style={{
                background: 'rgba(255, 183, 77, 0.08)',
                border: '1px solid rgba(255, 183, 77, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.82rem',
                color: 'var(--accent-tertiary)',
            }}>
                <span>⚠️</span>
                <span>For academic learning purposes only. Not for clinical decision making.</span>
            </div>

            {/* Hero Section */}
            <div className="glass-card" style={{ marginBottom: '32px', background: 'var(--gradient-hero)' }}>
                <div style={{ padding: '12px 0' }}>
                    <h1 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '2.2rem',
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '8px'
                    }}>
                        Welcome back, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px' }}>
                        Learn Smart. Think Clinically. — Generate notes, simulate cases, explore anatomy, and master medicine.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📖</div>
                    <div className="stat-value">{stats.topicsStudied || 0}</div>
                    <div className="stat-label">Topics Studied</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-value">{stats.quizzesTaken || 0}</div>
                    <div className="stat-label">Quizzes Completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🃏</div>
                    <div className="stat-value">{stats.flashcardsReviewed || 0}</div>
                    <div className="stat-label">Flashcards Reviewed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-value">{history.length}</div>
                    <div className="stat-label">Study Sessions</div>
                </div>
            </div>

            {/* Available Topics */}
            <div className="section">
                <h2 className="section-title"><span className="icon">🎯</span> Quick Start — Available Topics</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                    {availableTopics.map((topic, i) => (
                        <div
                            key={i}
                            className="glass-card"
                            style={{ cursor: 'pointer', padding: '20px' }}
                            onClick={() => quickStart(topic.title)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <span className="badge badge-primary">{topic.category}</span>
                            </div>
                            <h3 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>{topic.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Click to generate lecture notes →</p>
                        </div>
                    ))}

                    {/* Custom Topic Card */}
                    <div
                        className="glass-card"
                        style={{
                            cursor: 'pointer',
                            padding: '20px',
                            borderStyle: 'dashed',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            minHeight: '120px'
                        }}
                        onClick={() => setActivePage('notes')}
                    >
                        <span style={{ fontSize: '2rem', marginBottom: '8px' }}>➕</span>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Enter Custom Topic</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Type any medical topic</p>
                    </div>
                </div>
            </div>

            {/* Recent History */}
            {history.length > 0 && (
                <div className="section">
                    <h2 className="section-title"><span className="icon">📚</span> Recent Study Sessions</h2>
                    <div className="history-list">
                        {history.slice(0, 5).map((item, i) => (
                            <div
                                key={item.id || i}
                                className="history-item"
                                onClick={() => quickStart(item.topic)}
                            >
                                <div>
                                    <div className="history-topic">{item.topic}</div>
                                    <div className="history-date">{new Date(item.date).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}</div>
                                </div>
                                <button className="btn btn-sm btn-outline">Resume →</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
