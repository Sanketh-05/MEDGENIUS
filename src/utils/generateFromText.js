// ═══════════════════════════════════════════════════════════════
// Generate quizzes and flashcards from extracted text
// Uses improved NLP-style heuristics for more accurate study material
// ═══════════════════════════════════════════════════════════════

/**
 * Normalize a line: trim, remove markdown bold, remove bullet markers
 */
function cleanLine(line) {
    return line.trim()
        .replace(/\*\*/g, '')
        .replace(/^[-•▸*]\s*/, '')
        .replace(/^\d+[.)]\s*/, '');
}

/**
 * Split text into meaningful sentences (handles bullets, newlines, and periods)
 */
function splitIntoSentences(text) {
    // First split by newlines
    const rawLines = text.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);
    const sentences = [];

    rawLines.forEach(line => {
        // If line is short enough, keep as-is
        if (line.length < 200) {
            sentences.push(cleanLine(line));
        } else {
            // Split long lines on period-space boundaries
            const parts = line.split(/(?<=\.)\s+/).map(p => cleanLine(p)).filter(p => p.length > 10);
            sentences.push(...parts);
        }
    });

    return sentences.filter(s => s.length > 12);
}

/**
 * Extract key statements from text — scored by educational value
 */
function extractKeyStatements(text) {
    const sentences = splitIntoSentences(text);

    const keywords = [
        'is defined as', 'refers to', 'is characterized by', 'is caused by',
        'most common', 'gold standard', 'first line', 'treatment of choice',
        'diagnosis', 'investigation', 'pathogenesis', 'etiology',
        'classified as', 'includes', 'results in', 'leads to',
        'contraindicated', 'indicated', 'mechanism', 'complication',
        'risk factor', 'prognosis', 'management', 'drug of choice',
        'clinical feature', 'presentation', 'symptom', 'sign of',
        'associated with', 'characterized', 'hallmark', 'pathognomonic',
        'most important', 'type', 'stage', 'grade', 'class',
        'prevention', 'prophylaxis', 'screening', 'criteria',
        'caused by', 'due to', 'occurs in', 'seen in', 'found in',
    ];

    const scored = sentences.map(line => {
        let score = 0;
        const lower = line.toLowerCase();
        keywords.forEach(kw => {
            if (lower.includes(kw)) score += 2;
        });
        if (/^[-•▸*]\s/.test(line)) score += 1;
        if (/^\d+[.)]\s/.test(line)) score += 1;
        if (line.includes(':')) score += 1;
        // Boost lines that look like definitions
        if (/\bis\b.*\b(defined|characterized|caused|associated)\b/i.test(line)) score += 3;
        // Boost lines with specific factual patterns
        if (/\b(most common|gold standard|first line|drug of choice|treatment of choice)\b/i.test(line)) score += 3;
        if (line.length < 15) score -= 3;
        if (line.length > 300) score -= 1;
        return { text: line, score };
    });

    return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(s => s.text);
}

/**
 * Extract term:definition pairs from the text
 */
function extractDefinitions(text) {
    const sentences = splitIntoSentences(text);
    const defs = [];

    sentences.forEach(sent => {
        // Pattern: "Term is defined as / refers to / is characterized by definition"
        const defMatch = sent.match(/^(.{5,60}?)\s+(?:is defined as|refers to|is characterized by|is caused by|means)\s+(.{10,})/i);
        if (defMatch) {
            defs.push({ term: defMatch[1].trim(), definition: defMatch[2].trim() });
            return;
        }

        // Pattern: "Term: Definition"
        const colonSplit = sent.split(':');
        if (colonSplit.length === 2 && colonSplit[0].length > 3 && colonSplit[0].length < 60 && colonSplit[1].trim().length > 10) {
            defs.push({ term: colonSplit[0].trim(), definition: colonSplit[1].trim() });
            return;
        }

        // Pattern: "Term — Definition" or "Term – Definition"
        const dashMatch = sent.match(/^(.{5,60}?)\s*[—–]\s+(.{10,})/);
        if (dashMatch) {
            defs.push({ term: dashMatch[1].trim(), definition: dashMatch[2].trim() });
        }
    });

    return defs;
}

/**
 * Extract bullet-point lists from text
 */
function extractBulletPoints(text) {
    const lines = text.split(/\n/).map(l => l.trim());
    const bullets = [];

    lines.forEach(line => {
        if (/^[-•▸*]\s/.test(line) && line.length > 10 && line.length < 200) {
            bullets.push(cleanLine(line));
        }
    });

    return bullets;
}

/**
 * Build shuffled options array and return { options, correctIdx }
 */
function buildOptions(correctAnswer, distractors) {
    const options = [correctAnswer, ...distractors.slice(0, 3)];
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    return { options, correctIdx: options.indexOf(correctAnswer) };
}

/**
 * Build wrong explanations object
 */
function buildWrongExplanations(total, correctIdx, context = '') {
    const msgs = [
        context ? `Incorrect. ${context}` : 'Review the notes for the correct answer.',
        'This is not supported by the study material.',
        'Check the relevant section in your notes.',
        'This option does not match the content.'
    ];
    const obj = {};
    for (let i = 0; i < total; i++) {
        if (i !== correctIdx) obj[i] = msgs[i % msgs.length];
    }
    return obj;
}

/**
 * Generate smart distractor options for MCQs
 */
function generateDistractors(correctAnswer, allStatements, currentIdx) {
    const distractors = [];
    const used = new Set([correctAnswer.toLowerCase()]);

    // Pick statements that are different enough from the correct answer
    const shuffled = [...allStatements].sort(() => Math.random() - 0.5);
    shuffled.forEach((stmt, i) => {
        if (distractors.length >= 3) return;
        const candidate = stmt.substring(0, 120);
        if (!used.has(candidate.toLowerCase()) && candidate.length > 10) {
            distractors.push(candidate);
            used.add(candidate.toLowerCase());
        }
    });

    const fallbacks = [
        'This finding is typically seen in a different clinical context',
        'This is associated with a completely different pathological process',
        'No current evidence supports this association',
        'This mechanism has not been established for this condition',
        'This is a common misconception in clinical practice'
    ];
    let fIdx = 0;
    while (distractors.length < 3) {
        distractors.push(fallbacks[fIdx % fallbacks.length]);
        fIdx++;
    }
    return distractors.slice(0, 3);
}

/**
 * Generate MCQ quiz questions from extracted text
 */
export function generateQuizFromText(text, topicName = 'Uploaded Topic') {
    const statements = extractKeyStatements(text);
    const definitions = extractDefinitions(text);
    const bullets = extractBulletPoints(text);

    if (statements.length < 2 && definitions.length === 0) {
        return [{
            question: `Which of the following best describes "${topicName}"?`,
            options: [
                'A condition primarily affecting the respiratory system',
                'A systemic disorder with multiple organ involvement',
                'A localized inflammatory process',
                'An autoimmune condition of unknown etiology'
            ],
            correct: 1,
            difficulty: 'easy',
            explanations: {
                correct: `Based on the uploaded content about ${topicName}.`,
                wrong: { 0: 'Review the uploaded notes.', 2: 'See the notes for context.', 3: 'Check the etiology section.' }
            }
        }];
    }

    const questions = [];
    const usedTerms = new Set();

    // ── Pattern 1: Definition-based questions ──
    definitions.forEach((def, i) => {
        if (questions.length >= 12 || usedTerms.has(def.term.toLowerCase())) return;
        usedTerms.add(def.term.toLowerCase());

        const definition = def.definition.substring(0, 140);
        const distractors = generateDistractors(definition, statements, i);
        const { options, correctIdx } = buildOptions(definition, distractors);

        questions.push({
            question: `Which of the following best describes "${def.term}"?`,
            options,
            correct: correctIdx,
            difficulty: i < 3 ? 'easy' : 'moderate',
            explanations: {
                correct: `Correct! ${def.term}: ${def.definition.substring(0, 150)}.`,
                wrong: buildWrongExplanations(options.length, correctIdx, `The correct definition of "${def.term}" is: ${definition.substring(0, 80)}...`)
            }
        });
    });

    // ── Pattern 2: "most common / gold standard / first line" questions ──
    statements.forEach((stmt, i) => {
        if (questions.length >= 12) return;

        const match = stmt.match(/(most common|gold standard|first line|treatment of choice|drug of choice|hallmark|pathognomonic)\s+(.{5,100})/i);
        if (match && !usedTerms.has(match[1].toLowerCase() + match[2].substring(0, 20).toLowerCase())) {
            usedTerms.add(match[1].toLowerCase() + match[2].substring(0, 20).toLowerCase());
            const qualifier = match[1];
            const answer = match[2].replace(/[.;,]$/, '').trim().substring(0, 100);
            const distractors = generateDistractors(answer, statements, i);
            const { options, correctIdx } = buildOptions(answer, distractors);

            questions.push({
                question: `What is the ${qualifier.toLowerCase()} for ${topicName}?`,
                options,
                correct: correctIdx,
                difficulty: 'clinical',
                explanations: {
                    correct: `Correct! The ${qualifier.toLowerCase()} is ${answer}.`,
                    wrong: buildWrongExplanations(options.length, correctIdx)
                }
            });
        }
    });

    // ── Pattern 3: "What causes / What is associated with" questions ──
    statements.forEach((stmt, i) => {
        if (questions.length >= 12) return;

        const causeMatch = stmt.match(/(.{5,50}?)\s+(?:is caused by|due to|caused by)\s+(.{10,})/i);
        if (causeMatch && !usedTerms.has('cause:' + causeMatch[1].substring(0, 20).toLowerCase())) {
            usedTerms.add('cause:' + causeMatch[1].substring(0, 20).toLowerCase());
            const condition = causeMatch[1].trim();
            const cause = causeMatch[2].trim().substring(0, 120);
            const distractors = generateDistractors(cause, statements, i);
            const { options, correctIdx } = buildOptions(cause, distractors);

            questions.push({
                question: `What causes ${condition}?`,
                options,
                correct: correctIdx,
                difficulty: 'moderate',
                explanations: {
                    correct: `Correct! ${condition} is caused by ${cause.substring(0, 100)}.`,
                    wrong: buildWrongExplanations(options.length, correctIdx)
                }
            });
        }
    });

    // ── Pattern 4: Symptom/feature identification from bullet lists ──
    if (bullets.length >= 3 && questions.length < 12) {
        const correctBullets = bullets.slice(0, 2).join(', ').substring(0, 120);
        const wrongBullets = [
            'Increased appetite, weight gain, and excessive sleep',
            'Decreased urination, constipation, and dry skin',
            'Joint swelling, morning stiffness, and skin rash'
        ];
        const { options, correctIdx } = buildOptions(correctBullets, wrongBullets);

        questions.push({
            question: `Which of the following are features/symptoms of ${topicName}?`,
            options,
            correct: correctIdx,
            difficulty: 'moderate',
            explanations: {
                correct: `Correct! Key features include: ${correctBullets}.`,
                wrong: buildWrongExplanations(options.length, correctIdx, `Review the clinical features section for ${topicName}.`)
            }
        });
    }

    // ── Pattern 5: True/False style from remaining statements ──
    let idx = 0;
    while (questions.length < 8 && idx < statements.length) {
        const stmt = statements[idx++];
        if (stmt.length < 20 || stmt.length > 200) continue;
        if (usedTerms.has('tf:' + stmt.substring(0, 30).toLowerCase())) continue;
        usedTerms.add('tf:' + stmt.substring(0, 30).toLowerCase());

        const distractors = [
            'This statement is not supported by current evidence',
            'The opposite mechanism has been demonstrated',
            'This applies to a different condition entirely'
        ];
        const { options, correctIdx } = buildOptions(stmt.substring(0, 130), distractors);

        questions.push({
            question: `Which of the following statements about ${topicName} is TRUE?`,
            options,
            correct: correctIdx,
            difficulty: questions.length < 4 ? 'easy' : 'moderate',
            explanations: {
                correct: `Correct! ${stmt.substring(0, 150)}.`,
                wrong: buildWrongExplanations(options.length, correctIdx)
            }
        });
    }

    return questions;
}

/**
 * Generate flashcards from extracted text
 */
export function generateFlashcardsFromText(text, topicName = 'Uploaded Topic') {
    const statements = extractKeyStatements(text);
    const definitions = extractDefinitions(text);
    const bullets = extractBulletPoints(text);
    const cards = [];
    const usedFronts = new Set();
    const categories = ['definitions', 'clinical', 'pathways', 'drugs'];

    // ── Priority 1: Definition-based cards (most accurate) ──
    definitions.forEach((def, i) => {
        if (cards.length >= 20) return;
        const frontText = `What is ${def.term}?`;
        if (usedFronts.has(frontText.toLowerCase())) return;
        usedFronts.add(frontText.toLowerCase());

        cards.push({
            front: frontText,
            back: def.definition,
            category: categories[i % categories.length]
        });
    });

    // ── Priority 2: Key statement cards (term: explanation) ──
    statements.forEach((stmt, i) => {
        if (cards.length >= 20) return;

        const colonSplit = stmt.split(':');
        if (colonSplit.length === 2 && colonSplit[0].length > 3 && colonSplit[0].length < 60 && colonSplit[1].trim().length > 10) {
            const frontText = `Explain: ${colonSplit[0].trim()}`;
            if (usedFronts.has(frontText.toLowerCase())) return;
            usedFronts.add(frontText.toLowerCase());

            cards.push({
                front: frontText,
                back: colonSplit[1].trim(),
                category: categories[i % categories.length]
            });
            return;
        }

        // "most common / gold standard" cards
        const match = stmt.match(/(most common|gold standard|first line|drug of choice|treatment of choice|hallmark|pathognomonic)\s+(.{5,})/i);
        if (match) {
            const frontText = `What is the ${match[1].toLowerCase()} for ${topicName}?`;
            if (usedFronts.has(frontText.toLowerCase())) return;
            usedFronts.add(frontText.toLowerCase());

            cards.push({
                front: frontText,
                back: `**${match[1]}**: ${match[2].substring(0, 150)}`,
                category: 'clinical'
            });
            return;
        }

        // "caused by" cards
        const causeMatch = stmt.match(/(.{5,50}?)\s+(?:is caused by|caused by|due to)\s+(.{10,})/i);
        if (causeMatch) {
            const frontText = `What causes ${causeMatch[1].trim()}?`;
            if (usedFronts.has(frontText.toLowerCase())) return;
            usedFronts.add(frontText.toLowerCase());

            cards.push({
                front: frontText,
                back: causeMatch[2].trim().substring(0, 200),
                category: 'pathways'
            });
        }
    });

    // ── Priority 3: Bullet-point cards ──
    bullets.forEach((bullet, i) => {
        if (cards.length >= 20 || bullet.length < 15 || bullet.length > 200) return;
        const frontText = `Key fact ${cards.length + 1}: ${topicName}`;
        if (usedFronts.has(frontText.toLowerCase())) return;
        usedFronts.add(frontText.toLowerCase());

        cards.push({
            front: `Recall this key point about ${topicName}:`,
            back: bullet,
            category: categories[i % categories.length]
        });
    });

    // ── Priority 4: Fill-in-blank from remaining statements ──
    statements.forEach((stmt, i) => {
        if (cards.length >= 20 || stmt.length < 20 || stmt.length > 200) return;

        const words = stmt.split(' ');
        if (words.length > 5) {
            // Pick a keyword (not a common word) to blank out
            const commonWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'of', 'and', 'or', 'to', 'for', 'by', 'with', 'on', 'at', 'from', 'that', 'this', 'it']);
            const goodWords = words.filter((w, j) => j > 1 && w.length > 3 && !commonWords.has(w.toLowerCase()));
            if (goodWords.length > 0) {
                const keyword = goodWords[Math.floor(Math.random() * goodWords.length)];
                const question = words.map(w => w === keyword ? '______' : w).join(' ');
                const frontText = question;
                if (usedFronts.has(frontText.toLowerCase())) return;
                usedFronts.add(frontText.toLowerCase());

                cards.push({
                    front: question,
                    back: `**${keyword}**\n\nFull statement: ${stmt}`,
                    category: categories[i % categories.length]
                });
            }
        }
    });

    // Ensure at least 3 cards
    if (cards.length < 3) {
        const lines = text.split('\n').map(l => cleanLine(l)).filter(l => l.length > 15).slice(0, 5);
        lines.forEach((line, i) => {
            if (cards.length < 5) {
                cards.push({
                    front: `Key concept ${cards.length + 1} from ${topicName}`,
                    back: line,
                    category: categories[i % categories.length]
                });
            }
        });
    }

    return cards;
}
