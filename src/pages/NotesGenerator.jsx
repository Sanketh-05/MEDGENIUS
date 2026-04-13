import React, { useState, useRef, useCallback } from 'react';
import { findTopic } from '../data/medicalData';
import { parseFile, parseMultipleFiles, ACCEPTED_FILE_TYPES, getFileTypeLabel } from '../utils/fileParser';
import { generateQuizFromText, generateFlashcardsFromText } from '../utils/generateFromText';
import { buildSmartNotes, SECTION_META } from '../utils/smartNotesBuilder';
import { generateTopicNotes, isGeminiAvailable } from '../utils/geminiService';
import { findKnowledge } from '../data/medicalKnowledge';
import { generateKnowledgeQuiz, generateKnowledgeFlashcards } from '../data/medicalQuizBank';
import ExamFocus from '../components/ExamFocus';
import TopicImage, { hasPreloadedImage } from '../components/TopicImage';
import ConceptAnimation from '../components/ConceptAnimation';
import { translateNotes, LANGUAGE_NAMES } from '../utils/translationService';
import { generateAIQuizAndFlashcards, isAIQuizAvailable } from '../utils/aiQuizService';

export default function NotesGenerator({ selectedTopic, setSelectedTopic, onTopicGenerated, setActivePage, setCustomTopicData }) {
    const [topic, setTopic] = useState(selectedTopic || '');
    const [mode, setMode] = useState('detailed');
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [fileResults, setFileResults] = useState([]);
    const [extractedText, setExtractedText] = useState('');
    const [fileError, setFileError] = useState('');
    const [parsing, setParsing] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [translating, setTranslating] = useState(false);
    const [translateError, setTranslateError] = useState('');
    const [originalNotes, setOriginalNotes] = useState(null); // keep English original for re-translation
    // Per-file topic isolation
    const [perFileTopics, setPerFileTopics] = useState([]);
    const [activeFileIdx, setActiveFileIdx] = useState(0);
    // AI quiz+flashcard generation state
    const [aiQuizLoading, setAiQuizLoading] = useState(false);
    const [aiQuizDone, setAiQuizDone] = useState(false);
    const fileInputRef = useRef(null);
    const notesRef = useRef(null);

    // ── AI Quiz & Flashcard auto-generation ─────────
    const generateAIContent = useCallback(async (notesObj) => {
        if (!isAIQuizAvailable() || !notesObj) return;
        setAiQuizLoading(true);
        setAiQuizDone(false);
        try {
            const result = await generateAIQuizAndFlashcards(notesObj.title || '', notesObj);
            if (result) {
                const { quiz: aiQuiz, flashcards: aiFlash } = result;
                // Merge AI questions on top of existing ones, deduplicated by question text
                setNotes(prev => {
                    if (!prev) return prev;
                    const existingQKeys = new Set((prev.quiz || []).map(q => q.question.toLowerCase().substring(0, 50)));
                    const existingFKeys = new Set((prev.flashcards || []).map(f => f.front.toLowerCase().substring(0, 50)));
                    // AI quiz goes first (higher quality), then any non-overlapping existing ones
                    const mergedQuiz = [
                        ...aiQuiz,
                        ...(prev.quiz || []).filter(q => !aiQuiz.some(a => a.question.toLowerCase().substring(0, 50) === q.question.toLowerCase().substring(0, 50)))
                    ];
                    // AI flashcards go first, then non-overlapping existing ones
                    const mergedFlash = [
                        ...aiFlash,
                        ...(prev.flashcards || []).filter(f => !aiFlash.some(a => a.front.toLowerCase().substring(0, 50) === f.front.toLowerCase().substring(0, 50)))
                    ];
                    const updated = { ...prev, quiz: mergedQuiz, flashcards: mergedFlash };
                    setOriginalNotes(updated);
                    setCustomTopicData?.(updated);
                    return updated;
                });
                setAiQuizDone(true);
            }
        } catch (err) {
            console.warn('[NotesGenerator] AI quiz generation failed:', err.message);
        } finally {
            setAiQuizLoading(false);
        }
    }, [setCustomTopicData]);

    // ── Translate Notes ─────────
    const handleTranslate = async (lang) => {
        setSelectedLanguage(lang);
        setTranslateError('');
        if (lang === 'en') {
            // Restore original English notes
            if (originalNotes) {
                setNotes(originalNotes);
                setCustomTopicData?.(originalNotes);
            }
            return;
        }
        if (!notes) return;
        setTranslating(true);
        try {
            // Always translate from original English to avoid chained translations
            const source = originalNotes || notes;
            const translatedNotes = await translateNotes(source, lang);
            if (translatedNotes) {
                setNotes(translatedNotes);
                setCustomTopicData?.(translatedNotes);
            }
        } catch (error) {
            console.error('[MedGenius] Translation failed:', error);
            setTranslateError('Translation failed. Make sure Groq API key or Ollama is running.');
        } finally {
            setTranslating(false);
        }
    };

    // ── Auto-detect a short topic title from text ─────────
    const detectTitle = (text, filename) => {
        let firstLine = text.split('\n').find(l => l.trim().length > 3)?.trim() || filename.replace(/\.[^/.]+$/, '');
        if (firstLine.length > 60) {
            firstLine = firstLine.substring(0, 60).replace(/\s+\S*$/, '') + '…';
        }
        return firstLine;
    };

    // ── Multi-file upload: parse each file independently ──
    const handleMultiFileUpload = async (files) => {
        if (!files || files.length === 0) return;
        setFileError('');
        setExtractedText('');
        setParsing(true);
        setUploadedFiles(Array.from(files));
        setFileResults([]);
        setPerFileTopics([]);
        setActiveFileIdx(0);
        setNotes(null); // Clear previous notes when new files are uploaded
        setTopic(''); // Clear topic input

        console.log(`[MedGenius] Processing ${files.length} file(s) independently`);

        try {
            const fileArray = Array.from(files);
            const results = [];
            const topics = [];

            for (const file of fileArray) {
                try {
                    const text = await parseFile(file);
                    const chars = text?.trim().length || 0;
                    results.push({ name: file.name, status: 'success', chars });
                    if (chars > 0) {
                        // Derive a topic title from each file
                        let topicTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
                        const firstLine = text.trim().split('\n').find(l => l.trim().length > 3)?.trim();
                        if (firstLine && firstLine.length > 5 && firstLine.length < 80) {
                            topicTitle = firstLine;
                        }
                        if (topicTitle.length > 60) {
                            topicTitle = topicTitle.substring(0, 60).replace(/\s+\S*$/, '') + '…';
                        }
                        topics.push({ fileName: file.name, text: text.trim(), topicTitle });
                    }
                } catch (err) {
                    results.push({ name: file.name, status: 'error', chars: 0, error: err.message });
                }
            }

            setFileResults(results);
            setPerFileTopics(topics);

            console.log('[MedGenius] Files processed independently:', topics.length, 'topics extracted');

            if (topics.length > 0) {
                // Set extractedText to first file's text (for single-file backwards compat)
                setExtractedText(topics[0].text);
                setTopic(topics[0].topicTitle);
            } else {
                const failedFiles = results.filter(r => r.status === 'error').map(r => r.name).join(', ');
                setFileError(`No text could be extracted from uploaded file(s). ${failedFiles ? `Failed: ${failedFiles}` : 'Try different file formats.'}`);
            }
        } catch (err) {
            console.error('[MedGenius] Multi-file upload error:', err);
            setFileError(`Error processing files: ${err.message}`);
        } finally {
            setParsing(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = e.dataTransfer?.files;
        if (files?.length > 0) handleMultiFileUpload(files);
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files?.length > 0) handleMultiFileUpload(files);
        e.target.value = '';
    };

    // ── Generate from topic input (built-in or single file) ──
    const handleGenerate = async () => {
        if (!topic.trim() && !extractedText) return;
        setLoading(true);

        // Small delay for UI feedback
        await new Promise(r => setTimeout(r, 300));

        const found = findTopic(topic);
        if (found) {
            setNotes(found);
            setOriginalNotes(found);
            setCustomTopicData?.(null);
            setPerFileTopics([]);
            onTopicGenerated(found.title);
            setLoading(false);
            generateAIContent(found);
        } else if (perFileTopics.length > 0) {
            // ── Per-file independent processing ──
            const processedTopics = perFileTopics.map(ft => {
                const smart = buildSmartNotes(ft.text, ft.topicTitle);
                // Try knowledge base quiz first, then text-based
                const kbQuiz = generateKnowledgeQuiz(ft.topicTitle);
                const kbFlash = generateKnowledgeFlashcards(ft.topicTitle);
                const textQuiz = generateQuizFromText(ft.text, ft.topicTitle);
                const textFlash = generateFlashcardsFromText(ft.text, ft.topicTitle);
                // Combine: prefer KB questions, then add unique text-based ones
                const usedQ = new Set();
                const combinedQuiz = [];
                [...(kbQuiz || []), ...textQuiz].forEach(q => {
                    const key = q.question.toLowerCase().substring(0, 50);
                    if (!usedQ.has(key)) { usedQ.add(key); combinedQuiz.push(q); }
                });
                const usedF = new Set();
                const combinedFlash = [];
                [...(kbFlash || []), ...textFlash].forEach(f => {
                    const key = f.front.toLowerCase().substring(0, 50);
                    if (!usedF.has(key)) { usedF.add(key); combinedFlash.push(f); }
                });
                return {
                    fileName: ft.fileName,
                    title: ft.topicTitle,
                    category: 'From: ' + ft.fileName,
                    fromFile: true,
                    sourceFile: ft.fileName,
                    sections: smart.sections,
                    highYieldPoints: smart.highYieldPoints,
                    examFAQs: [],
                    examTips: null,
                    quiz: combinedQuiz.length > 0 ? combinedQuiz : textQuiz,
                    flashcards: combinedFlash.length > 0 ? combinedFlash : textFlash,
                };
            });

            setActiveFileIdx(0);
            setNotes(processedTopics[0]);
            setOriginalNotes(processedTopics[0]);
            setPerFileTopics(processedTopics);
            setCustomTopicData?.(processedTopics[0]);
            onTopicGenerated(processedTopics[0].title);
            setLoading(false);
            generateAIContent(processedTopics[0]);
        } else if (topic.trim()) {
            // No built-in match, no file — try Gemini AI for comprehensive notes
            let aiNotes = null;
            if (isGeminiAvailable()) {
                try {
                    console.log('[MedGenius] Generating AI notes for:', topic);
                    aiNotes = await generateTopicNotes(topic);
                } catch (err) {
                    console.error('[MedGenius] AI notes generation failed:', err);
                }
            }

            if (aiNotes) {
                // AI-generated comprehensive notes
                const generatedQuiz = generateQuizFromText(
                    Object.values(aiNotes.sections).map(s => Array.isArray(s) ? s.join('. ') : s).join('. '),
                    aiNotes.title
                );
                const generatedFlashcards = generateFlashcardsFromText(
                    Object.values(aiNotes.sections).map(s => Array.isArray(s) ? s.join('. ') : s).join('. '),
                    aiNotes.title
                );
                aiNotes.quiz = generatedQuiz;
                aiNotes.flashcards = generatedFlashcards;
                setNotes(aiNotes);
                setOriginalNotes(aiNotes);
                setCustomTopicData?.(aiNotes);
                onTopicGenerated(aiNotes.title);
                generateAIContent(aiNotes);
            } else {
                // Try local knowledge base before stub
                const kb = findKnowledge(topic);
                if (kb) {
                    const kbText = `${kb.definition} ${kb.etiology} ${kb.clinical} ${kb.diagnosis} ${kb.treatment} ${kb.complications}`;
                    // Use dedicated KB quiz generators for best quality + no repeats
                    const kbQuiz = generateKnowledgeQuiz(kb.topic);
                    const kbFlash = generateKnowledgeFlashcards(kb.topic);
                    const textQuiz = generateQuizFromText(kbText, kb.topic);
                    const textFlash = generateFlashcardsFromText(kbText, kb.topic);
                    // Combine both taking unique questions only
                    const usedQ = new Set();
                    const combinedQuiz = [];
                    [...(kbQuiz || []), ...textQuiz].forEach(q => {
                        const key = q.question.toLowerCase().substring(0, 50);
                        if (!usedQ.has(key)) { usedQ.add(key); combinedQuiz.push(q); }
                    });
                    const usedF = new Set();
                    const combinedFlash = [];
                    [...(kbFlash || []), ...textFlash].forEach(f => {
                        const key = f.front.toLowerCase().substring(0, 50);
                        if (!usedF.has(key)) { usedF.add(key); combinedFlash.push(f); }
                    });
                    const customData = {
                        title: kb.topic.charAt(0).toUpperCase() + kb.topic.slice(1),
                        category: 'General Medicine',
                        fromFile: false,
                        fromAI: true,
                        sections: {
                            definition: kb.definition,
                            etiology: kb.etiology.split('. ').filter(s => s.trim()),
                            clinicalFeatures: kb.clinical.split('. ').filter(s => s.trim()),
                            diagnosis: kb.diagnosis.split('. ').filter(s => s.trim()),
                            management: kb.treatment.split('. ').filter(s => s.trim()),
                            complications: kb.complications.split('. ').filter(s => s.trim()),
                        },
                        highYieldPoints: [],
                        examFAQs: [],
                        examTips: null,
                        quiz: combinedQuiz,
                        flashcards: combinedFlash,
                    };
                    setNotes(customData);
                    setOriginalNotes(customData);
                    setCustomTopicData?.(customData);
                    onTopicGenerated(customData.title);
                    generateAIContent(customData);
                } else {
                    // Fallback: generate basic stub notes
                    const generatedQuiz = generateQuizFromText(topic, topic);
                    const generatedFlashcards = generateFlashcardsFromText(topic, topic);
                    const customData = {
                        title: topic,
                        category: 'General Medicine',
                        fromFile: false,
                        sections: {
                            definition: `**${topic}** — ${isGeminiAvailable() ? 'AI generation failed. ' : ''}Enter a built-in topic or upload a file with study material.\n\n💡 **Tip:** Add a Groq or Gemini API key in .env for AI-generated notes on any topic!`,
                        },
                        highYieldPoints: [],
                        examFAQs: [],
                        examTips: null,
                        quiz: generatedQuiz,
                        flashcards: generatedFlashcards,
                    };
                    setNotes(customData);
                    setOriginalNotes(customData);
                    setCustomTopicData?.(customData);
                    onTopicGenerated(topic);
                    generateAIContent(customData);
                }
            }
            setLoading(false);
        } else {
            console.warn("handleGenerate called with no topic or extracted text.");
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleGenerate();
    };

    // Auto-generate if selectedTopic changed
    React.useEffect(() => {
        if (selectedTopic && selectedTopic !== topic) {
            setTopic(selectedTopic);
            setNotes(null);
            setExtractedText('');
            setUploadedFiles([]);
            setFileResults([]);
            setPerFileTopics([]);
            setActiveFileIdx(0);
            setTimeout(() => {
                const found = findTopic(selectedTopic);
                if (found) {
                    setNotes(found);
                    onTopicGenerated(found.title);
                }
            }, 500);
        }
    }, [selectedTopic, topic, onTopicGenerated]); // Added topic and onTopicGenerated to dependencies

    // ── Section renderer ──────────────────────────────────
    const renderSection = (title, icon, content) => {
        if (!content) return null;
        if (Array.isArray(content) && content.length === 0) return null;
        return (
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.3rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {icon} {title}
                </h2>
                {typeof content === 'string' ? (
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{
                        __html: content.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--accent-tertiary)">$1</strong>')
                    }} />
                ) : (
                    <ul style={{ paddingLeft: '20px' }}>
                        {content.map((item, i) => (
                            <li key={i} style={{ position: 'relative', paddingLeft: '18px', marginBottom: '10px', color: 'var(--text-secondary)', lineHeight: 1.7, listStyle: 'none' }}>
                                <span style={{ position: 'absolute', left: 0, color: 'var(--accent-primary)', fontWeight: 'bold' }}>▸</span>
                                <span dangerouslySetInnerHTML={{
                                    __html: item
                                        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--accent-tertiary)">$1</strong>')
                                        .replace(/\*(.*?)\*/g, '<em style="color:var(--accent-secondary)">$1</em>')
                                        .replace(/\n/g, '<br/>')
                                }} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    // ── JSX ───────────────────────────────────────────────
    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>📘 Lecture Notes Generator</h1>
                <p>Enter a medical topic or upload study materials (supports multiple files — each file generates separate notes)</p>
            </div>

            {/* Topic Input & Upload Area */}
            {!notes && (
                <>
                    <div className="topic-input-card">
                        <h2 style={{ marginBottom: '4px', fontSize: '1.3rem' }}>🔬 What would you like to study?</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                            Try: Myocardial Infarction, Pneumonia, Diabetes Mellitus — or upload files
                        </p>
                        <div className="topic-input-row">
                            <input
                                className="input-field"
                                type="text"
                                placeholder="Enter a medical topic (e.g., Myocardial Infarction)..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                            <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={(!topic.trim() && !extractedText) || loading}>
                                {loading ? '⏳ Generating...' : '✨ Generate Notes'}
                            </button>
                        </div>

                        {/* Mode Selector — Detailed Notes only */}
                        <div className="mode-selector">
                            <div className={`mode-option active`}>
                                <div className="mode-icon">📖</div>
                                <div className="mode-title">Detailed Notes</div>
                                <div className="mode-desc">Comprehensive conceptual notes with quiz &amp; flashcards</div>
                            </div>
                        </div>
                    </div>

                    {/* Upload Zone */}
                    <div
                        className={`upload-zone${dragOver ? ' drag-over' : ''}`}
                        style={{ marginTop: '24px' }}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_FILE_TYPES}
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            multiple
                        />
                        {parsing ? (
                            <>
                                <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto 12px' }}></div>
                                <div className="upload-text">📄 Extracting text from {uploadedFiles.length} file(s)...</div>
                            </>
                        ) : fileResults.length > 0 && extractedText ? (
                            <>
                                <div className="upload-icon">✅</div>
                                <div className="upload-text" style={{ color: 'var(--accent-primary)' }}>
                                    {fileResults.filter(r => r.status === 'success').length} file(s) processed. Click 'Generate Notes' or upload different files.
                                </div>
                                <div className="upload-hint">Click to upload different files</div>
                            </>
                        ) : (
                            <>
                                <div className="upload-icon">📁</div>
                                <div className="upload-text">Drag & drop your files here, or click to browse</div>
                                <div className="upload-hint">Supports multiple files: PDF, DOCX, PPTX, TXT, MD, CSV — each file becomes a separate topic</div>
                            </>
                        )}
                    </div>

                    {/* File Error */}
                    {fileError && (
                        <div className="auth-error" style={{ marginTop: '12px' }}>{fileError}</div>
                    )}

                    {/* Per-File Detected Topics */}
                    {perFileTopics.length > 0 && (
                        <div className="glass-card" style={{ marginTop: '16px', padding: '20px' }}>
                            <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                📂 {perFileTopics.length} Topic{perFileTopics.length > 1 ? 's' : ''} Detected
                                <span className="badge badge-primary">{perFileTopics.length > 1 ? 'Separate notes for each' : '1 file'}</span>
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                {perFileTopics.map((ft, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '10px 14px',
                                        background: 'var(--bg-input)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--accent-primary)',
                                        fontSize: '0.88rem'
                                    }}>
                                        <span>📄</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ft.topicTitle}</div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ft.fileName} • {ft.text.length.toLocaleString()} chars</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={loading} style={{ width: '100%' }}>
                                {loading ? '⏳ Generating...' : `✨ Generate Notes for ${perFileTopics.length} Topic${perFileTopics.length > 1 ? 's' : ''}`}
                            </button>
                            {perFileTopics.length > 1 && (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px', textAlign: 'center' }}>
                                    Each file will produce its own separate notes, quiz, flashcards & images — no mixing!
                                </p>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Loading */}
            {loading && (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 20px' }}></div>
                    <h3 style={{ marginBottom: '8px' }}>Generating comprehensive notes...</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Analyzing content • Building notes • Creating quiz & flashcards</p>
                </div>
            )}

            {/* Generated Notes */}
            {notes && !loading && (
                <div ref={notesRef} className="animate-fade-in">
                    {/* Per-File Topic Tabs */}
                    {perFileTopics.length > 1 && (
                        <div className="glass-card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>📂 Uploaded Topics:</span>
                                <span className="badge badge-secondary">{perFileTopics.length} files</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {perFileTopics.map((ft, idx) => (
                                    <button
                                        key={idx}
                                        className={`btn btn-sm ${idx === activeFileIdx ? 'btn-primary' : 'btn-outline'}`}
                                        style={{ fontSize: '0.82rem', padding: '6px 14px', transition: 'all 0.2s' }}
                                        onClick={() => {
                                            setActiveFileIdx(idx);
                                            setNotes(perFileTopics[idx]);
                                            setCustomTopicData?.(perFileTopics[idx]); // Update custom data for active topic
                                            onTopicGenerated(perFileTopics[idx].title);
                                        }}
                                    >
                                        📄 {ft.fileName || ft.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                    <span className="badge badge-primary">{notes.category}</span>
                                    {notes.fromFile && <span className="badge badge-secondary">📁 From File</span>}
                                    {notes.fromAI && <span className="badge badge-secondary" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff' }}>🤖 AI Generated</span>}
                                    {notes.quiz && (
                                        <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            {aiQuizLoading && <span style={{ width: '10px', height: '10px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />}
                                            {notes.quiz.length} Quiz Qs
                                            {aiQuizDone && <span title="AI-enhanced">✨</span>}
                                        </span>
                                    )}
                                    {notes.flashcards && (
                                        <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            {aiQuizLoading && <span style={{ width: '10px', height: '10px', border: '2px solid rgba(255,255,255,0.7)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />}
                                            {notes.flashcards.length} Flashcards
                                            {aiQuizDone && <span title="AI-enhanced">✨</span>}
                                        </span>
                                    )}
                                    {perFileTopics.length > 1 && <span className="badge badge-primary" style={{ background: 'var(--accent-secondary)', color: '#fff' }}>File {activeFileIdx + 1} of {perFileTopics.length}</span>}
                                </div>
                                <h2 style={{
                                    fontSize: '1.6rem',
                                    fontFamily: 'var(--font-heading)',
                                    background: 'var(--gradient-primary)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>{notes.title}</h2>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                {translating && <span style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', width: '14px', height: '14px', border: '2px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></span>Translating...</span>}
                                {aiQuizLoading && (
                                    <span style={{ color: 'var(--accent-secondary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(114,137,255,0.12)', borderRadius: '20px', border: '1px solid rgba(114,137,255,0.25)' }}>
                                        <span style={{ width: '12px', height: '12px', border: '2px solid var(--accent-secondary)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                                        🤖 Generating competitive questions…
                                    </span>
                                )}
                                {aiQuizDone && !aiQuizLoading && (
                                    <span style={{ color: 'var(--accent-primary)', fontSize: '0.82rem', padding: '4px 10px', background: 'rgba(0,230,180,0.10)', borderRadius: '20px', border: '1px solid rgba(0,230,180,0.25)' }}>
                                        ✨ AI questions ready
                                    </span>
                                )}
                                {translateError && <span style={{ color: 'var(--accent-danger)', fontSize: '0.78rem' }}>{translateError}</span>}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '1.1rem' }}>🌐</span>
                                    <select
                                        className="input-field"
                                        style={{ padding: '6px 10px', fontSize: '0.85rem', width: 'auto', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)' }}
                                        value={selectedLanguage}
                                        onChange={(e) => handleTranslate(e.target.value)}
                                        disabled={translating}
                                    >
                                        <option value="en">🇺🇸 English</option>
                                        {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                                            <option key={code} value={code}>🌐 {name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button className="btn btn-sm btn-outline" onClick={() => { setNotes(null); setTopic(''); setSelectedTopic(''); setUploadedFiles([]); setFileResults([]); setExtractedText(''); setPerFileTopics([]); setActiveFileIdx(0); setAiQuizDone(false); }}>
                                    ← New Topic
                                </button>
                                <button className="btn btn-sm btn-secondary" onClick={() => { setSelectedTopic(notes.title); setActivePage('quiz'); }}>
                                    📝 Take Quiz
                                </button>
                                <button className="btn btn-sm btn-secondary" onClick={() => { setSelectedTopic(notes.title); setActivePage('flashcards'); }}>
                                    🃏 Flashcards
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* AI Image with Labels */}
                    <TopicImage topicTitle={notes.title} />

                    {/* Concept Animation — Only show if no labeled image exists (avoids redundant part breakdowns) */}
                    {!hasPreloadedImage(notes.title) && <ConceptAnimation topicTitle={notes.title} />}

                    {/* Notes Sections */}
                    <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
                        {renderSection(SECTION_META.definition?.title || 'Definition', SECTION_META.definition?.icon || '📘', notes.sections?.definition)}
                        {renderSection(SECTION_META.etiology?.title || 'Etiology', SECTION_META.etiology?.icon || '🔬', notes.sections?.etiology)}
                        {renderSection(SECTION_META.pathophysiology?.title || 'Pathophysiology', SECTION_META.pathophysiology?.icon || '⚙️', notes.sections?.pathophysiology)}
                        {renderSection(SECTION_META.clinicalFeatures?.title || 'Clinical Features', SECTION_META.clinicalFeatures?.icon || '🩺', notes.sections?.clinicalFeatures)}
                        {renderSection(SECTION_META.diagnosis?.title || 'Diagnosis', SECTION_META.diagnosis?.icon || '🔍', notes.sections?.diagnosis)}
                        {renderSection(SECTION_META.management?.title || 'Management', SECTION_META.management?.icon || '💊', notes.sections?.management)}
                        {renderSection(SECTION_META.complications?.title || 'Complications', SECTION_META.complications?.icon || '⚠️', notes.sections?.complications)}
                        {renderSection(SECTION_META.prevention?.title || 'Prevention', SECTION_META.prevention?.icon || '🛡️', notes.sections?.prevention)}
                    </div>

                    {/* High Yield Points */}
                    {notes.highYieldPoints && notes.highYieldPoints.length > 0 && (
                        <div className="high-yield-box" style={{ marginBottom: '24px' }}>
                            <h3>⚡ High-Yield Exam Points</h3>
                            <ul>
                                {notes.highYieldPoints.map((point, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{
                                        __html: point.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--accent-primary)">$1</strong>')
                                    }} />
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Exam FAQs */}
                    {notes.examFAQs && notes.examFAQs.length > 0 && (
                        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                            <h3 style={{ color: 'var(--accent-primary)', marginBottom: '14px', fontSize: '1.2rem' }}>📋 Frequently Asked Exam Questions</h3>
                            {notes.examFAQs.map((faq, i) => {
                                const isString = typeof faq === 'string';
                                return (
                                    <div key={i} style={{
                                        padding: '14px',
                                        background: 'var(--bg-input)',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: '10px',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
                                            Q{i + 1}: {isString ? faq : faq.question}
                                        </div>
                                        {!isString && faq.answer && (
                                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem', marginTop: '6px' }} dangerouslySetInnerHTML={{
                                                __html: faq.answer.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--accent-tertiary)">$1</strong>')
                                            }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Exam Focus */}
                    {notes.examTips && <ExamFocus examTips={notes.examTips} />}
                </div>
            )}
        </div>
    );
}

