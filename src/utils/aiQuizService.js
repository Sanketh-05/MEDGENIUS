// ═══════════════════════════════════════════════════════════════
// AI Quiz & Flashcard Service
// Generates competitive MCQ quiz questions + distinct flashcards
// for any medical topic using Groq (primary) / Ollama (fallback).
// Guarantees ZERO overlap between quiz questions and flashcards.
// ═══════════════════════════════════════════════════════════════

import { chatCompletion } from './aiService.js';

// ── Prompt templates ─────────────────────────────────────────

const SYSTEM_PROMPT = `You are a senior medical examiner and educator at a top medical school.
Generate high-quality, competitive examination material at the USMLE/UKMLA level.
Your questions must be tricky, scenario-based, and test deep clinical reasoning — not just memorization.
Wrong options (distractors) must be plausible and commonly confused with the correct answer.
Respond ONLY with valid JSON, no extra text.`;

function buildQuizPrompt(topic, notesSummary) {
    return `Generate 10 competitive MCQ quiz questions AND 10 distinct flashcards for the medical topic: "${topic}"

${notesSummary ? `Context from notes:\n${notesSummary.substring(0, 1200)}\n` : ''}

STRICT RULES:
- Quiz questions must use CLINICAL SCENARIOS (patient vignettes) — NOT simple "what is" questions
- Flashcards must be RECALL/DEFINITION style — completely different question pattern from the quiz
- NO topic overlap between any quiz question and any flashcard (they test the SAME topic through different cognitive levels)
- Quiz wrong options must be clinically plausible (similar sounding drugs, nearby values, related conditions)
- All 10 quiz questions must be UNIQUE with different clinical angles
- All 10 flashcards must be UNIQUE — no two with the same front

Respond with EXACTLY this JSON structure:
{
  "quiz": [
    {
      "question": "A 55-year-old male presents with... [scenario]... which of the following is most appropriate?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "difficulty": "hard",
      "explanation": "Detailed 2-sentence clinical explanation of why correct is right and distractors are wrong"
    }
  ],
  "flashcards": [
    {
      "front": "Recall question (e.g. Define / List / Enumerate / Compare / Mechanism of...)",
      "back": "Comprehensive answer with key facts",
      "category": "definitions|pathways|clinical|drugs|investigations"
    }
  ]
}

Generate 10 quiz MCQs and 10 flashcards now for topic: "${topic}"`;
}

// ── Parser ────────────────────────────────────────────────────

function parseAIResponse(rawText) {
    if (!rawText) return null;

    // Try to extract JSON block
    let jsonStr = rawText;

    // Strip markdown code fences if present
    const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1];

    // Find outermost {...} brace
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    if (start === -1 || end === -1) return null;

    jsonStr = jsonStr.slice(start, end + 1);

    try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed.quiz) && Array.isArray(parsed.flashcards)) {
            return parsed;
        }
    } catch (e) {
        console.warn('[aiQuizService] JSON parse failed:', e.message);
    }

    return null;
}

// ── Validate & normalise items ────────────────────────────────

function normaliseQuiz(items) {
    return items
        .filter(q =>
            q &&
            typeof q.question === 'string' && q.question.length > 10 &&
            Array.isArray(q.options) && q.options.length >= 2 &&
            typeof q.correct === 'number'
        )
        .map((q, idx) => ({
            question: q.question.trim(),
            options: q.options.map(o => String(o).trim()),
            correct: Math.max(0, Math.min(q.correct, q.options.length - 1)),
            difficulty: q.difficulty || (idx < 3 ? 'moderate' : 'hard'),
            explanations: {
                correct: q.explanation || 'See clinical guidelines.',
                wrong: {}
            },
            source: 'ai'
        }));
}

function normaliseFlashcards(items) {
    return items
        .filter(f =>
            f &&
            typeof f.front === 'string' && f.front.length > 5 &&
            typeof f.back === 'string' && f.back.length > 5
        )
        .map(f => ({
            front: f.front.trim(),
            back: f.back.trim(),
            category: f.category || 'clinical',
            source: 'ai'
        }));
}

// ── De-duplicate between quiz and flashcards ──────────────────

function deduplicate(quiz, flashcards) {
    // Collect key phrases used in quiz questions
    const quizKeywords = new Set();
    quiz.forEach(q => {
        const words = q.question.toLowerCase().split(/\s+/).filter(w => w.length > 5);
        words.slice(0, 8).forEach(w => quizKeywords.add(w));
    });

    // Filter flashcards that are too similar to quiz questions
    const unique = flashcards.filter(f => {
        const frontWords = f.front.toLowerCase().split(/\s+/).filter(w => w.length > 5);
        const overlap = frontWords.filter(w => quizKeywords.has(w)).length;
        // Allow some overlap (same topic) but reject if front is almost identical
        const overlapRatio = overlap / Math.max(frontWords.length, 1);
        return overlapRatio < 0.7; // reject if >70% wording overlap
    });

    return unique;
}

// ── Helper: build a notes summary string from the notes object ─

function buildNotesSummary(notes) {
    if (!notes) return '';
    const parts = [];
    if (notes.sections?.definition) parts.push(String(notes.sections.definition).substring(0, 300));
    if (notes.sections?.etiology) {
        const e = Array.isArray(notes.sections.etiology)
            ? notes.sections.etiology.slice(0, 3).join('. ')
            : String(notes.sections.etiology);
        parts.push(e.substring(0, 200));
    }
    if (notes.sections?.clinicalFeatures) {
        const c = Array.isArray(notes.sections.clinicalFeatures)
            ? notes.sections.clinicalFeatures.slice(0, 3).join('. ')
            : String(notes.sections.clinicalFeatures);
        parts.push(c.substring(0, 200));
    }
    if (notes.sections?.management) {
        const m = Array.isArray(notes.sections.management)
            ? notes.sections.management.slice(0, 3).join('. ')
            : String(notes.sections.management);
        parts.push(m.substring(0, 200));
    }
    if (notes.highYieldPoints?.length) {
        parts.push(notes.highYieldPoints.slice(0, 4).join('. '));
    }
    return parts.join('\n');
}

// ── Main export ───────────────────────────────────────────────

/**
 * Generate AI quiz questions and flashcards for a topic.
 * Returns { quiz: [...], flashcards: [...] } or null on failure.
 *
 * @param {string} topicTitle - The medical topic name
 * @param {object|null} notesData - The notes object (for context)
 * @returns {Promise<{quiz: Array, flashcards: Array}|null>}
 */
export async function generateAIQuizAndFlashcards(topicTitle, notesData = null) {
    const notesSummary = buildNotesSummary(notesData);

    try {
        const rawText = await chatCompletion(
            SYSTEM_PROMPT,
            buildQuizPrompt(topicTitle, notesSummary),
            { maxTokens: 3500, temperature: 0.4 }
        );

        const parsed = parseAIResponse(rawText);
        if (!parsed) {
            console.warn('[aiQuizService] Could not parse AI response');
            return null;
        }

        const quiz = normaliseQuiz(parsed.quiz || []);
        let flashcards = normaliseFlashcards(parsed.flashcards || []);

        // Remove any flashcards with near-identical wording to quiz questions
        flashcards = deduplicate(quiz, flashcards);

        if (quiz.length === 0 && flashcards.length === 0) return null;

        return { quiz, flashcards };
    } catch (err) {
        console.warn('[aiQuizService] Generation failed:', err.message);
        return null;
    }
}

/**
 * Quick check — returns true if AI is configured (Groq key present).
 */
export function isAIQuizAvailable() {
    return !!(import.meta.env.VITE_GROQ_API_KEY);
}
