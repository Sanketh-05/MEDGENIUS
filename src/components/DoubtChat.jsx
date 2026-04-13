import React, { useState, useRef, useEffect } from 'react';
import { askMedicalDoubt, isGeminiAvailable, getProviderName } from '../utils/geminiService';
import { findKnowledge } from '../data/medicalKnowledge';

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '\ud83c\uddec\ud83c\udde7' },
    { code: 'hi', label: '\u0939\u093f\u0928\u094d\u0926\u0940', flag: '\ud83c\uddee\ud83c\uddf3' },
    { code: 'ta', label: '\u0ba4\u0bae\u0bbf\u0bb4\u0bcd', flag: '\ud83c\uddee\ud83c\uddf3' },
    { code: 'te', label: '\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41', flag: '\ud83c\uddee\ud83c\uddf3' },
    { code: 'bn', label: '\u09ac\u09be\u0982\u09b2\u09be', flag: '\ud83c\uddee\ud83c\uddf3' },
    { code: 'mr', label: '\u092e\u0930\u093e\u0920\u0940', flag: '\ud83c\uddee\ud83c\uddf3' },
];

export default function DoubtChat({ topicData }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [language, setLanguage] = useState('en');
    const [showLangPicker, setShowLangPicker] = useState(false);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    // Reset messages when topic changes
    useEffect(() => {
        if (topicData?.title) {
            setMessages([]);
        }
    }, [topicData?.title]);

    // Show welcome message when opened
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const topicName = topicData?.title;
            const aiPowered = isGeminiAvailable();
            setMessages([{
                type: 'ai',
                text: topicName
                    ? `I'm here to help you with **${topicName}**!\n\n${aiPowered ? '**AI-Powered Mode** \u2014 I can answer any question!\n\n' : ''}Ask me anything:\n\u2022 Doubts from notes or lectures\n\u2022 Beyond-syllabus concepts\n\u2022 Clinical scenario questions\n\u2022 Compare conditions\n\u2022 Explain mechanisms`
                    : `Hi! I'm your **MEDGENIUS AI Assistant**\n\n${aiPowered ? '**AI-Powered Mode** \u2014 Ask me about ANY medical topic!\n\n' : ''}You can ask me anything:\n\u2022 Medical concepts & definitions\n\u2022 Clinical scenarios & diagnosis\n\u2022 Drug mechanisms & side effects\n\u2022 Differential diagnosis\n\u2022 Compare conditions\n\u2022 Study tips & exam strategies\n\nUpload files for topic-specific help, or just ask away!`
            }]);
        }
        if (isOpen) {
            setHasNewMessage(false);
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [isOpen]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fallback response generator
    const generateFallbackResponse = (question) => {
        const q = question.toLowerCase();

        if (topicData?.doubtResponses) {
            for (const [key, response] of Object.entries(topicData.doubtResponses)) {
                if (key !== 'default' && q.includes(key)) {
                    return response;
                }
            }
        }

        // Greetings
        if (/^(hi|hello|hey|good\s*(morning|afternoon|evening))/i.test(q)) {
            return `Hello! I'm your study assistant. ${topicData?.title ? `We're currently studying **${topicData.title}**. ` : ''}How can I help you today?\n\nYou can ask me about:\n\u2022 Any medical topic or concept\n\u2022 Clinical scenarios\n\u2022 Drug classifications\n\u2022 Exam preparation tips`;
        }

        // Thank you
        if (/^(thanks|thank you|thx)/i.test(q)) {
            return `You're welcome! Keep studying, you're doing great! Feel free to ask more questions anytime.`;
        }

        // What is / Define
        if (/^(what is|define|explain|tell me about|describe)\s+/i.test(q)) {
            const subject = q.replace(/^(what is|define|explain|tell me about|describe)\s+/i, '').replace(/[?.]$/, '').trim();
            if (topicData?.sections) {
                for (const [key, content] of Object.entries(topicData.sections)) {
                    const sectionText = Array.isArray(content) ? content.join(' ') : content;
                    if (sectionText.toLowerCase().includes(subject)) {
                        return `Based on the current topic notes:\n\n${typeof content === 'string' ? content.substring(0, 400) : content.slice(0, 3).join('\n\u2022 ')}\n\n*Check the full notes section for more details.*`;
                    }
                }
            }
            const kb = findKnowledge(subject);
            if (kb) {
                return `**${subject.charAt(0).toUpperCase() + subject.slice(1)}**\n\n${kb.definition}\n\n**Key causes:** ${kb.etiology.substring(0, 200)}...\n\n**Clinical features:** ${kb.clinical.substring(0, 200)}...\n\nAsk me about its *diagnosis*, *treatment*, or *complications* for more details!`;
            }
            return `**${subject.charAt(0).toUpperCase() + subject.slice(1)}** \u2014 Great question!\n\nHere's a structured way to study this:\n\n1. **Definition**: What is it?\n2. **Etiology**: What causes it?\n3. **Pathophysiology**: How does it develop?\n4. **Clinical Features**: What are the symptoms & signs?\n5. **Diagnosis**: How is it identified?\n6. **Management**: How is it treated?\n\nFor comprehensive notes on this topic, type it in the Notes Generator!`;
        }

        // Complications
        if (q.includes('complication') || q.includes('side effect') || q.includes('adverse')) {
            if (topicData?.sections?.complications) {
                const content = topicData.sections.complications;
                return `**Complications of ${topicData.title}:**\n\n${Array.isArray(content) ? content.map(c => `\u2022 ${c}`).join('\n') : content.substring(0, 400)}\n\n**Exam tip:** Classify as *early* vs *late* complications!`;
            }
            const kb = findKnowledge(question);
            if (kb) return `**Complications of ${kb.topic.charAt(0).toUpperCase() + kb.topic.slice(1)}:**\n\n${kb.complications}\n\n**Exam tip:** Classify as *early* vs *late* and know the management of each!`;
            return `Great question about complications! Key approach:\n\n1. **Classify** complications as early vs late\n2. **Understand the mechanism** behind each\n3. **Know the management** of each complication\n4. **Risk factors** that predispose to complications\n\n**Exam tip:** "Most common complication" and "most dangerous complication" are frequently asked!`;
        }

        // Treatment / Management / Drug
        if (q.includes('treatment') || q.includes('management') || q.includes('drug') || q.includes('medicine') || q.includes('therapy')) {
            if (topicData?.sections?.management) {
                const content = topicData.sections.management;
                return `**Management of ${topicData.title}:**\n\n${Array.isArray(content) ? content.map(c => `\u2022 ${c}`).join('\n') : content.substring(0, 400)}\n\n**Remember:** Always structure as Supportive \u2192 Medical \u2192 Surgical`;
            }
            const kb = findKnowledge(question);
            if (kb) return `**Treatment of ${kb.topic.charAt(0).toUpperCase() + kb.topic.slice(1)}:**\n\n${kb.treatment}\n\n**Remember:** Structure answers as Supportive \u2192 Medical \u2192 Surgical`;
            return `For treatment and management:\n\n1. **Conservative/Supportive** measures first\n2. **Pharmacological** \u2014 know first-line drugs & MOA\n3. **Interventional/Surgical** \u2014 indications & contraindications\n4. **Follow-up** \u2014 monitoring parameters\n\n**Exam strategy:** Structure: Supportive \u2192 Medical \u2192 Surgical \u2192 Monitoring`;
        }

        // Diagnosis / Investigation
        if (q.includes('diagnosis') || q.includes('investigation') || q.includes('test') || q.includes('imaging') || q.includes('lab')) {
            if (topicData?.sections?.diagnosis) {
                const content = topicData.sections.diagnosis;
                return `**Diagnosis of ${topicData.title}:**\n\n${Array.isArray(content) ? content.map(c => `\u2022 ${c}`).join('\n') : content.substring(0, 400)}\n\n**Know:** Gold standard vs First-line investigation!`;
            }
            const kb = findKnowledge(question);
            if (kb) return `**Diagnosis of ${kb.topic.charAt(0).toUpperCase() + kb.topic.slice(1)}:**\n\n${kb.diagnosis}\n\n**Exam tip:** Always know the *gold standard* vs *first-line* investigation!`;
            return `For investigations and diagnosis:\n\n1. **Gold standard** \u2014 definitive investigation\n2. **First-line/Screening** \u2014 initial test ordered\n3. **Confirmatory test** \u2014 for definitive diagnosis\n4. **Supportive tests** \u2014 CBC, CRP, imaging, etc.\n\nOrganize as: Bedside \u2192 Lab \u2192 Imaging \u2192 Special tests`;
        }

        // Symptoms / Clinical Features
        if (q.includes('symptom') || q.includes('sign') || q.includes('clinical feature') || q.includes('presentation') || q.includes('manifest')) {
            if (topicData?.sections?.clinicalFeatures) {
                const content = topicData.sections.clinicalFeatures;
                return `**Clinical Features of ${topicData.title}:**\n\n${Array.isArray(content) ? content.map(c => `\u2022 ${c}`).join('\n') : content.substring(0, 400)}`;
            }
            const kb = findKnowledge(question);
            if (kb) return `**Clinical Features of ${kb.topic.charAt(0).toUpperCase() + kb.topic.slice(1)}:**\n\n${kb.clinical}\n\nOrganize as: **Symptoms** (subjective) \u2192 **Signs** (objective) \u2192 **Special tests**`;
            return `When studying clinical features:\n\n1. **Cardinal symptoms** \u2014 the most common presentation\n2. **Pathognomonic signs** \u2014 unique to this condition\n3. **Systemic features** \u2014 fever, weight loss, malaise\n4. **Red flags** \u2014 signs that indicate severity\n\nOrganize as: **Symptoms** (subjective) \u2192 **Signs** (objective) \u2192 **Special tests**`;
        }

        // Difference / Compare
        if (q.includes('difference') || q.includes('differentiate') || q.includes('compare') || q.includes('vs') || q.includes('versus')) {
            return `When comparing/differentiating:\n\n**Best approach for exams:**\n\n| Feature | Condition A | Condition B |\n|---------|-------------|-------------|\n| Etiology | ... | ... |\n| Pathology | ... | ... |\n| Clinical Features | ... | ... |\n| Investigations | ... | ... |\n| Management | ... | ... |\n\n**Pro tip:** Focus on the ONE feature that clearly separates them!`;
        }

        // Pathophysiology / Mechanism
        if (q.includes('pathophysiology') || q.includes('mechanism') || q.includes('how does') || q.includes('pathway')) {
            if (topicData?.sections?.pathophysiology) {
                const content = topicData.sections.pathophysiology;
                return `**Pathophysiology of ${topicData.title}:**\n\n${Array.isArray(content) ? content.map(c => `\u2022 ${c}`).join('\n') : content.substring(0, 400)}\n\n**Tip:** Draw flowcharts to remember pathways!`;
            }
            return `For understanding pathophysiology:\n\n1. **Trigger/Insult** \u2192 What starts the process?\n2. **Molecular mechanism** \u2192 What happens at cellular level?\n3. **Pathological changes** \u2192 What structural changes occur?\n4. **Clinical correlation** \u2192 How does this produce symptoms?\n\n**Study tip:** Draw flowcharts: Cause \u2192 Mechanism \u2192 Effect \u2192 Symptoms`;
        }

        // Etiology / Cause
        if (q.includes('cause') || q.includes('etiology') || q.includes('risk factor') || q.includes('why')) {
            if (topicData?.sections?.etiology) {
                const content = topicData.sections.etiology;
                return `**Etiology of ${topicData.title}:**\n\n${Array.isArray(content) ? content.map(c => `\u2022 ${c}`).join('\n') : content.substring(0, 400)}`;
            }
            return `For etiology and risk factors:\n\nClassify causes as:\n1. **Modifiable** \u2014 smoking, diet, lifestyle\n2. **Non-modifiable** \u2014 age, gender, genetics\n3. **Environmental** \u2014 occupational exposure, infections\n\n**Exam focus:** "Most common cause" and "most important risk factor" are high-yield!`;
        }

        // Prevention
        if (q.includes('prevent') || q.includes('prophylaxis') || q.includes('vaccine') || q.includes('screening')) {
            if (topicData?.sections?.prevention) {
                const content = topicData.sections.prevention;
                return `**Prevention of ${topicData.title}:**\n\n${Array.isArray(content) ? content.map(c => `\u2022 ${c}`).join('\n') : content.substring(0, 400)}`;
            }
            return `For prevention strategies:\n\n1. **Primary prevention** \u2014 before disease occurs\n2. **Secondary prevention** \u2014 early detection (screening)\n3. **Tertiary prevention** \u2014 preventing complications\n\nKey areas: Vaccination, Screening programs, Lifestyle modifications, Chemoprophylaxis`;
        }

        // Exam tips
        if (q.includes('exam') || q.includes('tip') || q.includes('how to study') || q.includes('prepare') || q.includes('remember')) {
            return `**Study & Exam Tips:**\n\n1. **Active recall** \u2014 test yourself, don't just re-read\n2. **Spaced repetition** \u2014 review at increasing intervals\n3. **Mnemonics** \u2014 create memory aids for lists\n4. **Flowcharts** \u2014 for pathophysiology and algorithms\n5. **Tables** \u2014 for differential diagnosis\n6. **Past papers** \u2014 practice exam-style questions\n\n**High-yield approach:**\n\u2022 Focus on "most common," "gold standard," "first line"\n\u2022 Know pathognomonic signs\n\u2022 Practice clinical scenario-based questions`;
        }

        // Default \u2014 try knowledge base
        const kb = findKnowledge(question);
        if (kb) {
            return `**${kb.topic.charAt(0).toUpperCase() + kb.topic.slice(1)}**\n\n${kb.definition}\n\n**Etiology:** ${kb.etiology.substring(0, 250)}...\n\n**Clinical Features:** ${kb.clinical.substring(0, 250)}...\n\n**Diagnosis:** ${kb.diagnosis.substring(0, 200)}...\n\n**Treatment:** ${kb.treatment.substring(0, 200)}...\n\nAsk me more \u2014 "complications of ${kb.topic}" or "diagnosis of ${kb.topic}"!`;
        }

        if (topicData?.title) {
            return `That's a thoughtful question about **${topicData.title}**!\n\nBased on the study material:\n\n1. **Check the relevant section** in your generated notes\n2. **Review the high-yield points** for key exam facts\n3. **Try the quiz** to test your understanding\n\nWant me to help with something specific? Try asking:\n\u2022 "What causes ${topicData.title}?"\n\u2022 "What are the complications?"\n\u2022 "How is it diagnosed?"\n\u2022 "What is the treatment?"`;
        }

        const subjectMatch = question.match(/(?:about|of|for|on|regarding|is|what's|whats)\s+(?:the\s+)?(.{3,50}?)(?:\?|$|\.)/i);
        const subject = subjectMatch?.[1]?.trim() || question.replace(/[?!.]/g, '').trim();

        if (subject && subject.length > 2 && subject.length < 60) {
            const S = subject.charAt(0).toUpperCase() + subject.slice(1);
            return [
                `**${S}**`,
                `Here's a structured medical overview:`,
                `**Definition:** ${S} is a medical condition/concept that should be studied systematically.`,
                `**Key study areas to cover:**`,
                `1. **Etiology** \u2014 What causes it?`,
                `2. **Pathophysiology** \u2014 How does it develop?`,
                `3. **Clinical Features** \u2014 Symptoms & signs`,
                `4. **Diagnosis** \u2014 Investigations (gold standard, first-line)`,
                `5. **Treatment** \u2014 Conservative \u2192 Medical \u2192 Surgical`,
                `6. **Complications** \u2014 Early vs late`,
                `Generate detailed notes in the **Notes Generator** for quizzes & flashcards!`,
                `Ask: "treatment of ${subject}" or "complications of ${subject}"`
            ].join('\n\n');
        }

        return [
            `Great question!`,
            `Here's how I can help:`,
            `\u2022 **Ask about any medical topic** \u2014 "What is tuberculosis?"`,
            `\u2022 **Upload study files** \u2014 I'll generate notes, quizzes & flashcards`,
            `\u2022 **Ask clinical questions** \u2014 "What causes hypertension?"`,
            `\u2022 **Specific sections** \u2014 "Complications of stroke"`,
            `**Topics I know:** TB, HTN, Asthma, Heart Failure, Stroke, COPD, Toxicology, CKD, Thyroid, Cirrhosis, Anemia, Epilepsy, Dengue, PUD`,
            `Try: "What is the gold standard for diagnosing TB?"`
        ].join('\n\n');
    };

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;
        const userMsg = { type: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        const question = input.trim();
        setInput('');

        // Try AI first, then fall back to hardcoded responses
        if (isGeminiAvailable()) {
            setIsTyping(true);
            try {
                const currentMessages = [...messages, userMsg];
                // Inject language preference into topic data
                const langLabel = LANGUAGES.find(l => l.code === language)?.label || 'English';
                const topicWithLang = {
                    ...topicData,
                    languagePreference: language !== 'en' ? `IMPORTANT: Respond entirely in ${langLabel} language.` : '',
                };
                const aiResponse = await askMedicalDoubt(question, topicWithLang, currentMessages);
                if (aiResponse) {
                    setMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
                    if (!isOpen) setHasNewMessage(true);
                    setIsTyping(false);
                    return;
                }
            } catch (err) {
                console.error('[MedGenius] AI response failed, using fallback:', err);
            }
            setIsTyping(false);
        }

        // Fallback to hardcoded responses
        setTimeout(() => {
            const response = generateFallbackResponse(question);
            setMessages(prev => [...prev, { type: 'ai', text: response }]);
            if (!isOpen) setHasNewMessage(true);
        }, 600);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setIsOpen(true);
    };

    return (
        <>
            {/* Floating Chat Bubble Button */}
            <div
                onClick={() => setIsOpen(o => !o)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0, 230, 180, 0.4)',
                    zIndex: 9999,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    transform: isOpen ? 'scale(0.9)' : 'scale(1)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 30px rgba(0, 230, 180, 0.6)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 230, 180, 0.4)'; }}
                title="MEDGENIUS AI Assistant"
            >
                <span style={{ fontSize: '1.5rem' }}>{isOpen ? '\u2715' : '\ud83e\ude7a'}</span>
                {!isOpen && <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '0.8rem' }}>{'\u2728'}</span>}
                {hasNewMessage && !isOpen && (
                    <div style={{
                        position: 'absolute', top: '-2px', right: '-2px',
                        width: '16px', height: '16px', borderRadius: '50%',
                        background: 'var(--accent-danger, #ff4444)',
                        border: '2px solid var(--bg-primary)',
                        animation: 'pulse 1.5s infinite'
                    }} />
                )}
            </div>

            {/* Chat Panel */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '96px',
                    right: '24px',
                    width: '400px',
                    maxWidth: 'calc(100vw - 48px)',
                    maxHeight: '520px',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg, 16px)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 9998,
                    animation: 'fadeIn 0.2s ease',
                    overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '14px 18px',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontFamily: "'Inter', 'Outfit', sans-serif",
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                            }}>
                                {'\ud83e\ude7a'}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Inter', 'Outfit', sans-serif" }}>
                                    MEDGENIUS AI
                                    {isGeminiAvailable() && (
                                        <span style={{
                                            fontSize: '0.6rem',
                                            background: 'rgba(255,255,255,0.25)',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontWeight: 500,
                                        }}>{getProviderName() || 'AI'}</span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>
                                    {topicData?.title ? `Studying: ${topicData.title}` : 'Ask me anything'}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {/* Language Selector */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowLangPicker(p => !p)}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)', border: 'none',
                                        color: '#fff', borderRadius: '8px', padding: '4px 8px',
                                        fontSize: '0.75rem', cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', gap: '4px',
                                    }}
                                    title="Change language"
                                >
                                    {LANGUAGES.find(l => l.code === language)?.flag} {'\ud83c\udf10'}
                                </button>
                                {showLangPicker && (
                                    <div style={{
                                        position: 'absolute', top: '110%', right: 0, zIndex: 10,
                                        background: 'var(--bg-card, #1a2332)', border: '1px solid var(--border-color)',
                                        borderRadius: '10px', padding: '6px', minWidth: '130px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                    }}>
                                        {LANGUAGES.map(lang => (
                                            <div
                                                key={lang.code}
                                                onClick={() => { setLanguage(lang.code); setShowLangPicker(false); }}
                                                style={{
                                                    padding: '6px 10px', borderRadius: '6px', cursor: 'pointer',
                                                    fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px',
                                                    background: language === lang.code ? 'rgba(0,230,180,0.15)' : 'transparent',
                                                    color: language === lang.code ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                                    fontWeight: language === lang.code ? 700 : 400,
                                                }}
                                            >
                                                {lang.flag} {lang.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={clearChat}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none', color: '#fff',
                                    borderRadius: '8px', padding: '4px 10px',
                                    fontSize: '0.75rem', cursor: 'pointer',
                                }}
                                title="Clear chat"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        minHeight: '250px',
                        maxHeight: '360px',
                    }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                padding: '10px 14px',
                                borderRadius: msg.type === 'user'
                                    ? '16px 16px 4px 16px'
                                    : '16px 16px 16px 4px',
                                background: msg.type === 'user'
                                    ? 'var(--accent-primary, #00e6b4)'
                                    : 'var(--bg-input, #1a2332)',
                                color: msg.type === 'user' ? '#000' : 'var(--text-secondary)',
                                fontSize: '0.85rem',
                                lineHeight: 1.6,
                                wordBreak: 'break-word',
                                fontFamily: "'Inter', 'Outfit', sans-serif",
                            }}>
                                <span dangerouslySetInnerHTML={{
                                    __html: msg.text
                                        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:' + (msg.type === 'user' ? '#000' : 'var(--accent-primary)') + '">$1</strong>')
                                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                        .replace(/\n/g, '<br/>')
                                }} />
                            </div>
                        ))}
                        {/* Typing indicator */}
                        {isTyping && (
                            <div style={{
                                alignSelf: 'flex-start',
                                maxWidth: '85%',
                                padding: '12px 18px',
                                borderRadius: '16px 16px 16px 4px',
                                background: 'var(--bg-input, #1a2332)',
                                display: 'flex',
                                gap: '5px',
                                alignItems: 'center',
                            }}>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Thinking</span>
                                <span className="typing-dots" style={{ display: 'flex', gap: '3px' }}>
                                    {[0, 1, 2].map(i => (
                                        <span key={i} style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: 'var(--accent-primary, #00e6b4)',
                                            animation: `typingBounce 1.2s infinite ${i * 0.2}s`,
                                            opacity: 0.6,
                                        }} />
                                    ))}
                                </span>
                                <style>{`
                                    @keyframes typingBounce {
                                        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                                        30% { transform: translateY(-6px); opacity: 1; }
                                    }
                                `}</style>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '12px 14px',
                        borderTop: '1px solid var(--border-color)',
                        display: 'flex',
                        gap: '8px',
                        background: 'var(--bg-primary)',
                    }}>
                        <input
                            ref={inputRef}
                            className="input-field"
                            type="text"
                            placeholder={isTyping ? "AI is thinking..." : "Ask anything... (e.g., 'What causes diabetes?')"}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isTyping}
                            style={{ flex: 1, fontSize: '0.85rem', padding: '10px 14px', fontFamily: "'Inter', 'Outfit', sans-serif" }}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            style={{ padding: '10px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                        >
                            {isTyping ? 'Wait...' : 'Send'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
