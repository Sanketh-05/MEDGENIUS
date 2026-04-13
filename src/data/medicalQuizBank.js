// ═══════════════════════════════════════════════════════════════
// Medical Quiz Bank — Generates unique quizzes and flashcards
// from the medical knowledge base. No repeated questions.
// ═══════════════════════════════════════════════════════════════
import { findKnowledge, getKnowledgeTopics } from './medicalKnowledge';

// Shuffle array (Fisher-Yates)
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ─── Generate MCQ quiz from a knowledge base topic ─────────
export function generateKnowledgeQuiz(topicName) {
    const kb = findKnowledge(topicName);
    if (!kb) return null;

    const title = kb.topic.charAt(0).toUpperCase() + kb.topic.slice(1);
    const questions = [];
    const usedQ = new Set();

    function addQ(q) {
        const key = q.question.toLowerCase().substring(0, 60);
        if (usedQ.has(key)) return;
        usedQ.add(key);
        questions.push(q);
    }

    // ── 1. Definition question ──
    const defSnippet = kb.definition.replace(/\*\*/g, '').substring(0, 120);
    addQ({
        question: `Which of the following best describes ${title}?`,
        options: shuffle([
            defSnippet,
            'An autoimmune condition causing destruction of blood cells',
            'A metabolic disorder affecting enzyme production',
            'A congenital malformation of the cardiovascular system',
        ]),
        get correct() { return this.options.indexOf(defSnippet); },
        difficulty: 'easy',
        explanations: {
            correct: `Correct! ${kb.definition.substring(0, 150)}`,
            wrong: { 0: 'Review the definition section.', 1: 'This describes a different condition.', 2: 'Check the notes.', 3: 'Incorrect.' }
        }
    });

    // ── 2. Etiology question ──
    const etioCause = kb.etiology.match(/\*\*(.+?)\*\*/)?.[1] || kb.etiology.split('.')[0].substring(0, 100);
    addQ({
        question: `What is the primary etiology of ${title}?`,
        options: shuffle([
            etioCause,
            'Viral infection of the central nervous system',
            'Autoimmune destruction of the adrenal glands',
            'Deficiency of vitamin B12 and folic acid',
        ]),
        get correct() { return this.options.indexOf(etioCause); },
        difficulty: 'moderate',
        explanations: {
            correct: `Correct! ${kb.etiology.substring(0, 150)}`,
            wrong: { 0: 'Review etiology.', 1: 'Not the primary cause.', 2: 'Incorrect.', 3: 'Wrong condition.' }
        }
    });

    // ── 3. Clinical features question ──
    const clinSnippet = kb.clinical.split('.')[0].replace(/\*\*/g, '').substring(0, 120);
    addQ({
        question: `Which clinical presentation is characteristic of ${title}?`,
        options: shuffle([
            clinSnippet,
            'Painless jaundice with weight loss and dark urine',
            'Bilateral pitting edema with ascites and spider naevi',
            'Sudden onset chest pain radiating to the left arm',
        ]),
        get correct() { return this.options.indexOf(clinSnippet); },
        difficulty: 'moderate',
        explanations: {
            correct: `Correct! ${kb.clinical.substring(0, 150)}`,
            wrong: { 0: 'Review clinical features.', 1: 'This describes a different condition.', 2: 'Check the notes.', 3: 'Incorrect.' }
        }
    });

    // ── 4. Diagnosis question ──
    const diagSnippet = kb.diagnosis.split('.')[0].replace(/\*\*/g, '').substring(0, 120);
    addQ({
        question: `What is the key diagnostic approach for ${title}?`,
        options: shuffle([
            diagSnippet,
            'CT scan with contrast of the abdomen and pelvis',
            'Serum electrophoresis and bone marrow biopsy',
            'Pulmonary function tests with methacholine challenge',
        ]),
        get correct() { return this.options.indexOf(diagSnippet); },
        difficulty: 'clinical',
        explanations: {
            correct: `Correct! ${kb.diagnosis.substring(0, 150)}`,
            wrong: { 0: 'Review the diagnosis section.', 1: 'Different investigation.', 2: 'Not the primary tool.', 3: 'Wrong.' }
        }
    });

    // ── 5. Treatment question ──
    const txSnippet = kb.treatment.split('.')[0].replace(/\*\*/g, '').substring(0, 120);
    addQ({
        question: `What is the primary treatment approach for ${title}?`,
        options: shuffle([
            txSnippet,
            'Total parenteral nutrition and bed rest',
            'Immediate surgical decompression',
            'High-dose corticosteroids with immunosuppressants',
        ]),
        get correct() { return this.options.indexOf(txSnippet); },
        difficulty: 'clinical',
        explanations: {
            correct: `Correct! ${kb.treatment.substring(0, 150)}`,
            wrong: { 0: 'Review treatment.', 1: 'Not the standard approach.', 2: 'Incorrect.', 3: 'Wrong management.' }
        }
    });

    // ── 6. Complications question ──
    const compSnippet = kb.complications.split(',')[0].replace(/\*\*/g, '').substring(0, 120);
    addQ({
        question: `Which is a recognized complication of ${title}?`,
        options: shuffle([
            compSnippet,
            'Progressive renal amyloidosis',
            'Bilateral optic neuritis',
            'Spontaneous pneumoperitoneum',
        ]),
        get correct() { return this.options.indexOf(compSnippet); },
        difficulty: 'moderate',
        explanations: {
            correct: `Correct! Complications of ${title} include: ${kb.complications.substring(0, 150)}`,
            wrong: { 0: 'Review complications.', 1: 'Not typically associated.', 2: 'Incorrect.', 3: 'Different condition.' }
        }
    });

    // ── 7-10. Extract more specific facts from the text ──
    const factPatterns = [
        { regex: /gold standard[:\s]+(.{10,80})/i, qTemplate: (m) => `What is the gold standard for ${title}?` },
        { regex: /first[ -]line[:\s]+(.{10,80})/i, qTemplate: (m) => `What is the first-line treatment for ${title}?` },
        { regex: /most common[:\s]+(.{5,80})/i, qTemplate: (m) => `What is the most common finding/cause in ${title}?` },
        { regex: /drug of choice[:\s]+(.{5,80})/i, qTemplate: (m) => `What is the drug of choice for ${title}?` },
    ];

    const fullText = `${kb.definition} ${kb.etiology} ${kb.clinical} ${kb.diagnosis} ${kb.treatment} ${kb.complications}`;
    factPatterns.forEach(fp => {
        if (questions.length >= 10) return;
        const match = fullText.match(fp.regex);
        if (match) {
            const answer = match[1].replace(/\*\*/g, '').replace(/[.;]$/, '').trim().substring(0, 100);
            addQ({
                question: fp.qTemplate(match),
                options: shuffle([
                    answer,
                    'Clinical observation and monitoring',
                    'Surgical intervention as first approach',
                    'Empirical broad-spectrum antibiotics',
                ]),
                get correct() { return this.options.indexOf(answer); },
                difficulty: 'clinical',
                explanations: {
                    correct: `Correct! ${answer}`,
                    wrong: { 0: 'Check the notes.', 1: 'Incorrect.', 2: 'Not standard.', 3: 'Review.' }
                }
            });
        }
    });

    return questions;
}

// ─── Generate flashcards from a knowledge base topic ───────
export function generateKnowledgeFlashcards(topicName) {
    const kb = findKnowledge(topicName);
    if (!kb) return null;

    const title = kb.topic.charAt(0).toUpperCase() + kb.topic.slice(1);
    const cards = [];
    const usedFronts = new Set();

    function addCard(front, back, category) {
        const key = front.toLowerCase();
        if (usedFronts.has(key)) return;
        usedFronts.add(key);
        cards.push({ front, back, category });
    }

    // 1. Definition
    addCard(
        `What is ${title}?`,
        kb.definition.replace(/\*\*/g, ''),
        'definitions'
    );

    // 2. Etiology
    addCard(
        `What causes ${title}?`,
        kb.etiology.replace(/\*\*/g, ''),
        'pathways'
    );

    // 3. Clinical Features
    addCard(
        `What are the clinical features of ${title}?`,
        kb.clinical.replace(/\*\*/g, ''),
        'clinical'
    );

    // 4. Diagnosis
    addCard(
        `How is ${title} diagnosed?`,
        kb.diagnosis.replace(/\*\*/g, ''),
        'clinical'
    );

    // 5. Treatment
    addCard(
        `What is the treatment for ${title}?`,
        kb.treatment.replace(/\*\*/g, ''),
        'drugs'
    );

    // 6. Complications
    addCard(
        `What are the complications of ${title}?`,
        kb.complications.replace(/\*\*/g, ''),
        'clinical'
    );

    // 7-12. Extract specific facts
    const sections = [
        { text: kb.etiology, label: 'Risk factors' },
        { text: kb.diagnosis, label: 'Key investigation' },
        { text: kb.treatment, label: 'Drug of choice' },
    ];

    sections.forEach(sec => {
        const boldTerms = sec.text.match(/\*\*(.+?)\*\*/g);
        if (boldTerms) {
            boldTerms.slice(0, 2).forEach(term => {
                const cleanTerm = term.replace(/\*\*/g, '');
                if (cleanTerm.length > 3 && cleanTerm.length < 60) {
                    addCard(
                        `${sec.label}: What is the role of ${cleanTerm} in ${title}?`,
                        `${cleanTerm} is mentioned in the context of ${title}: ${sec.text.replace(/\*\*/g, '').substring(0, 200)}`,
                        'clinical'
                    );
                }
            });
        }
    });

    return cards;
}
