// ═══════════════════════════════════════════════════════════════
// AI Service — Unified LLM interface (Groq primary, Ollama fallback)
// ═══════════════════════════════════════════════════════════════

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OLLAMA_API_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3';

/**
 * Send a chat completion request.
 * Strategy: Groq first (if API key available), then Ollama fallback.
 *
 * @param {string} systemPrompt - System message for the LLM
 * @param {string} userMessage  - User's question
 * @param {object} opts         - { maxTokens, temperature }
 * @returns {Promise<string>}   - LLM response text
 */
export async function chatCompletion(systemPrompt, userMessage, opts = {}) {
    const { maxTokens = 800, temperature = 0.3 } = opts;
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;

    // ── Try Groq first ──────────────────────────────
    if (groqKey) {
        try {
            const res = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${groqKey}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage },
                    ],
                    max_tokens: maxTokens,
                    temperature,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const text = data.choices?.[0]?.message?.content;
                if (text) return text;
            }
            // If Groq fails (rate limit, quota, etc.), fall through to Ollama
            console.warn('[MEDGENIUS AI] Groq request failed, trying Ollama fallback...');
        } catch (err) {
            console.warn('[MEDGENIUS AI] Groq unreachable:', err.message);
        }
    }

    // ── Ollama fallback ─────────────────────────────
    try {
        const res = await fetch(`${OLLAMA_API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
                stream: false,
                options: {
                    num_predict: maxTokens,
                    temperature,
                },
            }),
        });

        if (res.ok) {
            const data = await res.json();
            const text = data.message?.content;
            if (text) return text;
        }
        throw new Error('Ollama returned empty response');
    } catch (err) {
        console.warn('[MEDGENIUS AI] Ollama fallback failed:', err.message);
    }

    // ── Both failed ─────────────────────────────────
    throw new Error(
        groqKey
            ? 'Both Groq API and local Ollama are unavailable. Check your internet connection or start Ollama locally.'
            : 'No Groq API key configured and Ollama is not running. Set VITE_GROQ_API_KEY in .env or start Ollama (ollama serve).'
    );
}

/**
 * Analyze a medical image using a vision-capable model.
 * Sends the actual image bytes to Groq's vision model so it can SEE the image.
 *
 * @param {string} base64Image   - Base64-encoded image (no data: prefix)
 * @param {string} mimeType      - e.g. 'image/jpeg', 'image/png'
 * @param {string} systemPrompt  - Instructions for the AI
 * @param {string} userPrompt    - The text question / JSON schema request
 * @param {object} opts          - { maxTokens, temperature }
 * @returns {Promise<string>}    - AI response text
 */
export async function analyzeImageWithVision(base64Image, mimeType, systemPrompt, userPrompt, opts = {}) {
    const { maxTokens = 2000, temperature = 0.2 } = opts;
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;

    // Build multimodal user message: image + text
    const imageDataUrl = `data:${mimeType};base64,${base64Image}`;
    const multimodalContent = [
        {
            type: 'image_url',
            image_url: { url: imageDataUrl },
        },
        {
            type: 'text',
            text: userPrompt,
        },
    ];

    // ── Groq vision model ────────────────────────────
    if (groqKey) {
        try {
            const res = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${groqKey}`,
                },
                body: JSON.stringify({
                    // Groq's vision model — supports image_url content parts
                    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: multimodalContent },
                    ],
                    max_tokens: maxTokens,
                    temperature,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const text = data.choices?.[0]?.message?.content;
                if (text) return text;
            }
            const errBody = await res.text().catch(() => '');
            console.warn('[MEDGENIUS Vision] Groq vision failed:', res.status, errBody.slice(0, 200));
        } catch (err) {
            console.warn('[MEDGENIUS Vision] Groq vision unreachable:', err.message);
        }
    }

    // ── Ollama multimodal fallback (llava / bakllava) ──
    try {
        const res = await fetch(`${OLLAMA_API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llava',   // Must have llava pulled: ollama pull llava
                messages: [
                    { role: 'system', content: systemPrompt },
                    {
                        role: 'user',
                        content: userPrompt,
                        images: [base64Image],  // Ollama passes images separately
                    },
                ],
                stream: false,
                options: { num_predict: maxTokens, temperature },
            }),
        });

        if (res.ok) {
            const data = await res.json();
            const text = data.message?.content;
            if (text) return text;
        }
    } catch (err) {
        console.warn('[MEDGENIUS Vision] Ollama llava failed:', err.message);
    }

    throw new Error(
        groqKey
            ? 'Vision model unavailable. Ensure your Groq account has access to meta-llama/llama-4-scout-17b-16e-instruct.'
            : 'No API key configured. Set VITE_GROQ_API_KEY in .env to enable image analysis.'
    );
}

/**
 * Check which AI backend is available.
 * @returns {Promise<{provider: string, model: string} | null>}
 */
export async function checkAIAvailability() {
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    if (groqKey) {
        return { provider: 'Groq Cloud', model: 'llama-3.3-70b-versatile' };
    }

    try {
        const res = await fetch(`${OLLAMA_API_URL}/api/tags`, { method: 'GET' });
        if (res.ok) {
            const data = await res.json();
            const models = data.models?.map(m => m.name) || [];
            return {
                provider: 'Ollama (Local)',
                model: models.includes(OLLAMA_MODEL) ? OLLAMA_MODEL : (models[0] || 'unknown'),
            };
        }
    } catch { /* Ollama not running */ }

    return null;
}
