// ═══════════════════════════════════════════════════════════════
// Translation Service — Groq / Ollama (primary), HuggingFace (fallback)
// Translates medical notes content into Indian regional languages
// ═══════════════════════════════════════════════════════════════

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const OLLAMA_API_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3';
const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;

const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'];

export const LANGUAGE_NAMES = {
    hi: 'हिन्दी (Hindi)',
    te: 'తెలుగు (Telugu)',
    ta: 'தமிழ் (Tamil)',
    bn: 'বাংলা (Bengali)',
    mr: 'मराठी (Marathi)',
};

const LANGUAGE_FULL_NAMES = {
    hi: 'Hindi',
    te: 'Telugu',
    ta: 'Tamil',
    bn: 'Bengali',
    mr: 'Marathi',
};

export function getLanguageOptions() {
    return Object.entries(LANGUAGE_NAMES).map(([code, name]) => ({ code, name }));
}

// ── Groq Translation ──────────────────────────────────────────
async function translateViaGroq(text, targetLang) {
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') return null;
    const langName = LANGUAGE_FULL_NAMES[targetLang] || targetLang;

    for (const model of GROQ_MODELS) {
        try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: 'system',
                            content: `You are a medical translator. Translate the provided medical text to ${langName}. 
Rules:
- Keep all medical terms, drug names, and acronyms in English
- Preserve markdown formatting (**bold**, bullet points)
- Output ONLY the translated text — no explanation, no prefix
- If the text is already in ${langName}, return it as-is`,
                        },
                        { role: 'user', content: text },
                    ],
                    temperature: 0.1,
                    max_tokens: 1024,
                }),
            });

            if (res.status === 429) continue; // rate limit — try next model
            if (!res.ok) return null;

            const data = await res.json();
            const translated = data.choices?.[0]?.message?.content?.trim();
            if (translated) return translated;
        } catch {
            continue;
        }
    }
    return null;
}

// ── Ollama Translation Fallback ───────────────────────────────
async function translateViaOllama(text, targetLang) {
    const langName = LANGUAGE_FULL_NAMES[targetLang] || targetLang;
    try {
        const res = await fetch(`${OLLAMA_API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `You are a medical translator. Translate the provided medical text to ${langName}. Keep medical terms in English. Output ONLY the translation.`,
                    },
                    { role: 'user', content: text },
                ],
                stream: false,
                options: { num_predict: 512, temperature: 0.1 },
            }),
        });

        if (!res.ok) return null;
        const data = await res.json();
        return data.message?.content?.trim() || null;
    } catch {
        return null;
    }
}

// ── HuggingFace Translation Fallback (Helsinki-NLP) ──────────
async function translateViaHuggingFace(text, targetLang) {
    if (!HF_API_KEY || HF_API_KEY === 'your_huggingface_api_key_here') return null;
    const model = targetLang === 'hi'
        ? 'Helsinki-NLP/opus-mt-en-hi'
        : 'Helsinki-NLP/opus-mt-en-mul';

    try {
        const truncated = text.substring(0, 400);
        const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HF_API_KEY}`,
            },
            body: JSON.stringify({
                inputs: truncated,
                parameters: { tgt_lang: targetLang },
            }),
        });

        if (!res.ok) return null;
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.translation_text) {
            return data[0].translation_text;
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Translate a single text string — tries Groq, then Ollama, then HuggingFace
 */
export async function translateText(text, targetLang) {
    if (targetLang === 'en' || !targetLang || !text?.trim()) return text;

    // Try Groq first (fastest, highest quality)
    let result = await translateViaGroq(text, targetLang);
    if (result) return result;

    // Try Ollama (local fallback)
    result = await translateViaOllama(text, targetLang);
    if (result) return result;

    // Try HuggingFace (last resort)
    result = await translateViaHuggingFace(text, targetLang);
    if (result) return result;

    // Return original if all fail
    console.warn('[MedGenius] All translation providers failed for lang:', targetLang);
    return text;
}

/**
 * Translate an array of strings
 */
export async function translateArray(arr, targetLang) {
    if (targetLang === 'en' || !arr || arr.length === 0) return arr;
    const results = [];
    for (const item of arr) {
        const translated = await translateText(String(item), targetLang);
        results.push(translated);
        await new Promise(r => setTimeout(r, 150)); // small delay between calls
    }
    return results;
}

/**
 * Translate an entire notes object — sections, highYieldPoints, examFAQs
 */
export async function translateNotes(notesObj, targetLang) {
    if (targetLang === 'en' || !notesObj) return notesObj;

    const translated = { ...notesObj };

    // Translate sections
    if (notesObj.sections) {
        const newSections = {};
        for (const [key, value] of Object.entries(notesObj.sections)) {
            if (typeof value === 'string') {
                newSections[key] = await translateText(value, targetLang);
            } else if (Array.isArray(value)) {
                newSections[key] = await translateArray(value, targetLang);
            } else {
                newSections[key] = value;
            }
            await new Promise(r => setTimeout(r, 200));
        }
        translated.sections = newSections;
    }

    // Translate high yield points
    if (notesObj.highYieldPoints?.length > 0) {
        translated.highYieldPoints = await translateArray(notesObj.highYieldPoints, targetLang);
    }

    // Translate exam FAQs
    if (notesObj.examFAQs?.length > 0) {
        translated.examFAQs = await translateArray(notesObj.examFAQs, targetLang);
    }

    translated._translatedTo = targetLang;
    translated._translatedName = LANGUAGE_NAMES[targetLang] || targetLang;
    return translated;
}
