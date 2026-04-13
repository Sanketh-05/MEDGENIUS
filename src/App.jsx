import React, { useState, useCallback } from 'react';
import SplashScreen from './components/SplashScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentProgressProvider } from './context/StudentProgressContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import NotesGenerator from './pages/NotesGenerator';
import QuizPage from './pages/QuizPage';
import FlashcardsPage from './pages/FlashcardsPage';
import HistoryPage from './pages/HistoryPage';
import ClinicalCasePage from './pages/ClinicalCasePage';
import AnalyticsPage from './pages/AnalyticsPage';
import CDSSPage from './pages/CDSSPage';
import AnatomyExplorerPage from './pages/AnatomyExplorerPage';
import DifferentialDiagnosisPage from './pages/DifferentialDiagnosisPage';
import DiseaseComparisonPage from './pages/DiseaseComparisonPage';
import ClinicalDecisionTreePage from './pages/ClinicalDecisionTreePage';
import Sidebar from './components/Sidebar';
import DoubtChat from './components/DoubtChat';

function AppContent() {
    const { user, logout, updateStats, addToHistory } = useAuth();
    const [activePage, setActivePage] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState('');
    // Store custom topic data (from file uploads) so quiz/flashcard pages can access it
    const [customTopicData, setCustomTopicData] = useState(null);

    if (!user) return <AuthPage />;

    const handleTopicGenerated = (topicTitle) => {
        updateStats('topicsStudied');
        addToHistory(topicTitle);
    };

    const handleQuizComplete = () => {
        updateStats('quizzesTaken');
    };

    const handleFlashcardReview = () => {
        updateStats('flashcardsReviewed');
    };

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard':
                return (
                    <Dashboard
                        user={user}
                        setActivePage={setActivePage}
                        setSelectedTopic={setSelectedTopic}
                    />
                );
            case 'notes':
                return (
                    <NotesGenerator
                        selectedTopic={selectedTopic}
                        setSelectedTopic={setSelectedTopic}
                        onTopicGenerated={handleTopicGenerated}
                        setActivePage={setActivePage}
                        setCustomTopicData={setCustomTopicData}
                    />
                );
            case 'quiz':
                return (
                    <QuizPage
                        selectedTopic={selectedTopic}
                        onQuizComplete={handleQuizComplete}
                        customTopicData={customTopicData}
                    />
                );
            case 'flashcards':
                return (
                    <FlashcardsPage
                        selectedTopic={selectedTopic}
                        onFlashcardReview={handleFlashcardReview}
                        customTopicData={customTopicData}
                    />
                );
            case 'cases':
                return <ClinicalCasePage />;
            case 'analytics':
                return <AnalyticsPage />;
            case 'cdss':
                return <CDSSPage />;
            case 'anatomy':
                return <AnatomyExplorerPage />;
            case 'ddx':
                return <DifferentialDiagnosisPage />;
            case 'compare':
                return <DiseaseComparisonPage />;
            case 'tree':
                return <ClinicalDecisionTreePage />;
            case 'history':
                return (
                    <HistoryPage
                        setActivePage={setActivePage}
                        setSelectedTopic={setSelectedTopic}
                    />
                );
            default:
                return <Dashboard user={user} setActivePage={setActivePage} setSelectedTopic={setSelectedTopic} />;
        }
    };

    return (
        <div className="app-layout">
            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                user={user}
                onLogout={logout}
            />
            <main className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
                {renderPage()}
            </main>
            <DoubtChat topicData={customTopicData} />
        </div>
    );
}

export default function App() {
    const [showSplash, setShowSplash] = useState(true);
    const handleSplashComplete = useCallback(() => setShowSplash(false), []);

    return (
        <>
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
            <AuthProvider>
                <StudentProgressProvider>
                    <AppContent />
                </StudentProgressProvider>
            </AuthProvider>
        </>
    );
}
