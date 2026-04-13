// ═══════════════════════════════════════════════════════════════
// AI Service — Multi-Provider (Groq → HuggingFace → Ollama)
// Primary: Groq (Llama 3.3 70B, Llama 3.1 8B, Gemma2 9B)
// Fallback 1: HuggingFace BioMistral-7B (medical-specialized)
// Fallback 2: Ollama (local LLM — works offline)
// ═══════════════════════════════════════════════════════════════

// ─── Provider Config ─────────────────────────────────────────
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;
const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3';

let ollamaAvailable = null; // cached check

function getProvider() {
    if (GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here') return 'groq';
    if (HF_API_KEY && HF_API_KEY !== 'your_huggingface_api_key_here') return 'huggingface';
    if (ollamaAvailable === true) return 'ollama';
    return 'ollama'; // will attempt and cache
}

// ─── GROQ Provider (OpenAI-compatible REST API) ──────────────
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'];
let groqModelIndex = 0;

async function groqChat(messages, systemPrompt) {
    for (let i = groqModelIndex; i < GROQ_MODELS.length; i++) {
        try {
            const model = GROQ_MODELS[i];
            console.log(`[MedGenius] Using Groq model: ${model}`);

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...messages,
                    ],
                    temperature: 0.7,
                    max_tokens: 2048,
                }),
            });

            if (response.status === 429) {
                console.warn(`[MedGenius] Groq model ${model} rate limited, trying next...`);
                groqModelIndex = i + 1;
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Groq API error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || null;
        } catch (err) {
            if (err.message?.includes('429') && i < GROQ_MODELS.length - 1) {
                groqModelIndex = i + 1;
                continue;
            }
            console.error(`[MedGenius] Groq error:`, err.message);
            // Fall through to HuggingFace fallback
            return null;
        }
    }
    return null;
}

// ─── HuggingFace Provider (BioMistral Medical Fallback) ──────
const HF_MODELS = [
    'mistralai/Mistral-7B-Instruct-v0.3',
    'BioMistral/BioMistral-7B',
    'TinyLlama/TinyLlama-1.1B-Chat-v1.0'
];
let hfModelIndex = 0;

async function huggingFaceChat(prompt, systemPrompt) {
    if (!HF_API_KEY || HF_API_KEY === 'your_huggingface_api_key_here') return null;

    for (let i = hfModelIndex; i < HF_MODELS.length; i++) {
        try {
            const model = HF_MODELS[i];
            console.log(`[MedGenius] Using HuggingFace model: ${model}`);

            const fullPrompt = `<s>[INST] ${systemPrompt}\n\n${prompt} [/INST]`;

            const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${HF_API_KEY}`,
                },
                body: JSON.stringify({
                    inputs: fullPrompt,
                    parameters: {
                        max_new_tokens: 1500,
                        temperature: 0.7,
                        return_full_text: false,
                    },
                }),
            });

            if (response.status === 503 || response.status === 429) {
                console.warn(`[MedGenius] HF model ${model} unavailable, trying next...`);
                hfModelIndex = i + 1;
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HF API error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            if (Array.isArray(data) && data[0]?.generated_text) {
                return data[0].generated_text;
            }
            return null;
        } catch (err) {
            console.error(`[MedGenius] HF error (${HF_MODELS[i]}):`, err.message);
            if (i < HF_MODELS.length - 1) {
                hfModelIndex = i + 1;
                continue;
            }
            return null;
        }
    }
    return null;
}

// ─── Ollama Provider (Local LLM Fallback) ────────────────────
async function ollamaChat(messages, systemPrompt) {
    try {
        console.log(`[MedGenius] Using Ollama model: ${OLLAMA_MODEL}`);

        const response = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages,
                ],
                stream: false,
                options: {
                    num_predict: 2048,
                    temperature: 0.7,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ollama error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        ollamaAvailable = true;
        return data.message?.content || null;
    } catch (err) {
        console.warn(`[MedGenius] Ollama error:`, err.message);
        ollamaAvailable = false;
        return null;
    }
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Check if any AI provider is available
 */
export function isGeminiAvailable() {
    // Always return true — we have Ollama as local fallback
    return true;
}

/**
 * Get the active provider name for display
 */
export function getProviderName() {
    const p = getProvider();
    if (p === 'groq') return 'Groq AI (Llama 3.3)';
    if (p === 'huggingface') return 'BioMistral AI';
    if (p === 'ollama') return `Ollama (${OLLAMA_MODEL})`;
    return 'AI';
}

/**
 * Ask a medical doubt to AI — tries Groq first, then HuggingFace
 */
export async function genericChat(systemPrompt, userMessage, opts = {}) {
    // A universal chat interface that uses the same multi-provider fallback logic
    const provider = getProvider();
    if (!provider) return null;

    const { maxTokens = 1500, temperature = 0.7 } = opts;
    const messages = [{ role: 'user', content: userMessage }];

    // Try Groq first
    if (GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here') {
        const res = await groqChat(messages, systemPrompt);
        if (res) return res;
    }

    // Fallback to HuggingFace
    if (HF_API_KEY && HF_API_KEY !== 'your_huggingface_api_key_here') {
        const res = await huggingFaceChat(userMessage, systemPrompt);
        if (res) return res;
    }

    // Fallback to Ollama
    const ollRes = await ollamaChat(messages, systemPrompt);
    if (ollRes) return ollRes;
    return null;
}

export async function askMedicalDoubt(question, topicContext = null, chatHistory = []) {
    const provider = getProvider();
    if (!provider) return null;

    let systemPrompt = `You are an expert medical study assistant and tutor. Your role is to help medical students learn and understand medical concepts clearly.

IMPORTANT RULES:
- Provide accurate, well-structured medical information
- Use bold (**text**) for key terms and important concepts
- Use bullet points for lists
- Include exam tips when relevant (prefix with 📌 or ⚡)
- Include clinical pearls and mnemonics when helpful
- Be concise but thorough — aim for 150-300 words per response
- If asked about non-medical topics, still answer helpfully but bring medical perspective when possible
- Use emojis sparingly for visual engagement (🔬 🩺 💊 ⚙️ ⚠️ 🛡️)
- Format responses to be easy to scan and study from
- You can answer ANY question — you are not limited to any specific topic`;

    if (topicContext?.title) {
        systemPrompt += `\n\nThe student is currently studying: **${topicContext.title}**`;
        if (topicContext.sections) {
            const sectionSummary = Object.entries(topicContext.sections)
                .map(([key, val]) => {
                    const text = Array.isArray(val) ? val.join('; ') : val;
                    return `${key}: ${typeof text === 'string' ? text.substring(0, 200) : ''}`;
                })
                .join('\n');
            systemPrompt += `\n\nStudy material context:\n${sectionSummary.substring(0, 1500)}`;
        }
    }

    // Inject language preference if set
    if (topicContext?.languagePreference) {
        systemPrompt += `\n\n${topicContext.languagePreference}`;
    }

    // Build chat messages from history
    const messages = chatHistory
        .filter(m => m.type === 'user' || m.type === 'ai')
        .slice(-6)
        .map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.text,
        }));

    // Add current question if not already in history
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.content !== question) {
        messages.push({ role: 'user', content: question });
    }

    let response = null;

    // Try Groq first
    if (GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here') {
        response = await groqChat(messages, systemPrompt);
    }

    // Fallback to HuggingFace
    if (!response && HF_API_KEY && HF_API_KEY !== 'your_huggingface_api_key_here') {
        const historyText = messages.slice(0, -1).map(m => `${m.role}: ${m.content}`).join('\n');
        const fullPrompt = historyText ? `Previous conversation:\n${historyText}\n\nUser: ${question}` : question;
        response = await huggingFaceChat(fullPrompt, systemPrompt);
    }

    // Fallback to Ollama (local)
    if (!response) {
        response = await ollamaChat(messages, systemPrompt);
    }

    if (!response) return null;

    // Clean up formatting
    return response
        .replace(/^#+\s/gm, '**')
        .replace(/\n{3,}/g, '\n\n');
}

/**
 * Generate comprehensive structured notes for any medical topic
 */
export async function generateTopicNotes(topicName) {
    const provider = getProvider();
    if (!provider) return null;

    const systemPrompt = `You are a medical textbook author. Generate comprehensive, accurate medical study notes. Always respond with valid JSON only — no markdown fences, no extra text.`;

    const prompt = `Generate comprehensive medical study notes for: "${topicName}"

Respond in EXACTLY this JSON format (raw JSON only, no markdown code fences):
{
  "title": "${topicName}",
  "category": "<appropriate medical category>",
  "sections": {
    "definition": "<comprehensive 3-5 sentence definition, use **bold** for key terms>",
    "etiology": ["<cause 1 with details>", "<cause 2>", "<cause 3>", "<cause 4>", "<cause 5>"],
    "pathophysiology": ["<mechanism 1>", "<mechanism 2>", "<mechanism 3>", "<mechanism 4>"],
    "clinicalFeatures": ["<feature 1>", "<feature 2>", "<feature 3>", "<feature 4>", "<feature 5>"],
    "diagnosis": ["<investigation 1>", "<investigation 2>", "<investigation 3>", "<investigation 4>"],
    "management": ["<treatment 1>", "<treatment 2>", "<treatment 3>", "<treatment 4>"],
    "complications": ["<complication 1>", "<complication 2>", "<complication 3>", "<complication 4>"],
    "prevention": ["<prevention 1>", "<prevention 2>", "<prevention 3>"]
  },
  "highYieldPoints": ["<fact 1>", "<fact 2>", "<fact 3>", "<fact 4>", "<fact 5>"],
  "examFAQs": ["<question 1>", "<question 2>", "<question 3>"]
}

Each array item should be detailed (1-3 sentences). Use **bold** for key terms. Be medically accurate.`;

    let response = null;

    // Try Groq first
    if (GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here') {
        response = await groqChat(
            [{ role: 'user', content: prompt }],
            systemPrompt
        );
    }

    // Fallback to HuggingFace
    if (!response && HF_API_KEY && HF_API_KEY !== 'your_huggingface_api_key_here') {
        response = await huggingFaceChat(prompt, systemPrompt);
    }

    // Fallback to Ollama (local)
    if (!response) {
        response = await ollamaChat([{ role: 'user', content: prompt }], systemPrompt);
    }

    if (!response) return null;

    try {
        const cleaned = response
            .replace(/```json\s*/g, '')
            .replace(/```\s*/g, '')
            .trim();

        // Try to extract JSON from response
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.warn('[MedGenius] No JSON found in AI response');
            return null;
        }

        const parsed = JSON.parse(jsonMatch[0]);

        if (!parsed.title || !parsed.sections) {
            console.warn('[MedGenius] Invalid notes structure from AI');
            return null;
        }

        return {
            title: parsed.title || topicName,
            category: parsed.category || 'General Medicine',
            fromFile: false,
            fromAI: true,
            sections: parsed.sections || {},
            highYieldPoints: parsed.highYieldPoints || [],
            examFAQs: parsed.examFAQs || [],
            examTips: null,
            quiz: null,
            flashcards: null,
        };
    } catch (err) {
        console.error('[MedGenius] Failed to parse AI notes:', err.message);
        return null;
    }
}

/**
 * Generate clinical case explanation with AI
 */
export async function generateCaseExplanation(caseData, stepName) {
    const provider = getProvider();
    if (!provider) return null;

    const systemPrompt = `You are a clinical medicine professor. Explain medical case findings concisely in 2-3 sentences. Be exam-focused.`;
    const prompt = `For a patient case: ${caseData.title} (${caseData.demographics})\nExplain the significance of the ${stepName} step and what the findings indicate. Keep it under 100 words.`;

    let response = null;
    if (GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here') {
        response = await groqChat([{ role: 'user', content: prompt }], systemPrompt);
    }
    if (!response && HF_API_KEY && HF_API_KEY !== 'your_huggingface_api_key_here') {
        response = await huggingFaceChat(prompt, systemPrompt);
    }
    if (!response) {
        response = await ollamaChat([{ role: 'user', content: prompt }], systemPrompt);
    }
    return response;
}

/**
 * Generate medical image/structure description
 */
export async function generateStructureDescription(structureName, organContext) {
    const provider = getProvider();
    if (!provider) return null;

    const systemPrompt = `You are an anatomy professor. Provide concise, exam-oriented descriptions of anatomical structures. Include clinical significance.`;
    const prompt = `Describe "${structureName}" in the context of ${organContext}. Include: location, function, clinical significance, and one exam tip. Keep under 80 words.`;

    let response = null;
    if (GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here') {
        response = await groqChat([{ role: 'user', content: prompt }], systemPrompt);
    }
    if (!response && HF_API_KEY && HF_API_KEY !== 'your_huggingface_api_key_here') {
        response = await huggingFaceChat(prompt, systemPrompt);
    }
    if (!response) {
        response = await ollamaChat([{ role: 'user', content: prompt }], systemPrompt);
    }
    return response;
}
