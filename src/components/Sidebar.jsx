import React from 'react';

export default function Sidebar({ activePage, setActivePage, collapsed, setCollapsed, user, onLogout }) {
    const navItems = [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'notes', icon: '📘', label: 'Generate Notes' },
        { id: 'quiz', icon: '📝', label: 'Quiz' },
        { id: 'flashcards', icon: '🃏', label: 'Flashcards' },

        { id: 'cases', icon: '🏥', label: 'Clinical Cases' },

        { id: 'cdss', icon: '🩺', label: 'Clinical Sim' },
        { id: 'ddx', icon: '🔍', label: 'Differential Dx' },
        { id: 'compare', icon: '⚖️', label: 'Disease Compare' },
        { id: 'tree', icon: '🌳', label: 'Decision Tree' },
        { id: 'anatomy', icon: '🧠', label: 'Anatomy Explorer' },
        { id: 'analytics', icon: '📊', label: 'Analytics' },
        { id: 'history', icon: '📚', label: 'History' },
    ];

    return (
        <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
            <div className="sidebar-header">
                <span style={{ fontSize: '1.6rem' }}>🧬</span>
                <span className="logo-text">MEDGENIUS</span>
                <button className="sidebar-toggle" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'}>
                    {collapsed ? '▶' : '◀'}
                </button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <div
                        key={item.id}
                        className={`nav-item${activePage === item.id ? ' active' : ''}`}
                        onClick={() => setActivePage(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                <div className="sidebar-footer-info">
                    <div className="user-name">{user?.name || 'User'}</div>
                    <div className="user-role">{user?.course || 'Medical Student'}</div>
                </div>
                <button
                    className="sidebar-toggle"
                    onClick={onLogout}
                    title="Logout"
                    style={{ marginLeft: 'auto' }}
                >
                    ⏻
                </button>
            </div>
        </aside>
    );
}
