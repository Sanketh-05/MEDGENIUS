// ═══════════════════════════════════════════════════════════════
// Interactive Anatomy Explorer — MEDGENIUS
// Pipeline:
//   1. Groq/Ollama → generates anatomy parts JSON with coordinates
//   2. HuggingFace Inference API → generates actual medical illustration image
//   3. Image is displayed with numbered interactive hotspot dots overlaid
//   4. Clicking a dot → shows description, function, clinical, exam facts
//   5. AI chat assistant for follow-up questions
// ═══════════════════════════════════════════════════════════════

import React, { useState, useRef, useCallback } from 'react';
import { chatCompletion } from '../utils/aiService';

// ── Config ──────────────────────────────────────────────────────
const HF_API_KEY = import.meta.env.VITE_HF_API_KEY || '';

// HuggingFace Inference API — FLUX.1-schnell (fast, good quality)
const HF_IMAGE_MODELS = [
    'black-forest-labs/FLUX.1-schnell',
    'stabilityai/stable-diffusion-xl-base-1.0',
    'stabilityai/stable-diffusion-2-1',
];
const HF_BASE = 'https://router.huggingface.co/hf-inference/models';

// ── Palette ─────────────────────────────────────────────────────
const PALETTE = [
    '#00e6b4', '#7289ff', '#ff6b6b', '#ffa94d', '#ffd43b',
    '#69db7c', '#f783ac', '#da77f2', '#63e6be', '#74c0fc',
    '#ff922b', '#20c997', '#cc5de8', '#a9e34b', '#4dabf7',
    '#fa5252', '#e64980', '#be4bdb', '#7048e8', '#1098ad',
];

// ── Quick-access topics ─────────────────────────────────────────
const TOPICS = [
    { icon: '❤️', label: 'Heart', q: 'human heart' },
    { icon: '🧠', label: 'Brain', q: 'human brain' },
    { icon: '🫁', label: 'Lungs', q: 'human lungs' },
    { icon: '🫘', label: 'Kidney', q: 'human kidney' },
    { icon: '🍖', label: 'Liver', q: 'human liver' },
    { icon: '👁️', label: 'Eye', q: 'human eye cross-section' },
    { icon: '👂', label: 'Ear', q: 'human ear cross-section' },
    { icon: '🦷', label: 'Tooth', q: 'tooth cross-section' },
    { icon: '🦴', label: 'Knee', q: 'knee joint anatomy' },
    { icon: '🧬', label: 'Cell', q: 'animal cell anatomy' },
    { icon: '🫀', label: 'Neuron', q: 'neuron anatomy' },
    { icon: '💊', label: 'Pancreas', q: 'pancreas anatomy' },
];

// ── Build image prompt ──────────────────────────────────────────
function buildImagePrompt(topic) {
    return (
        `Create a high-quality 2D medical textbook illustration of ${topic}. ` +
        `Requirements: ` +
        `Style: professional medical textbook diagram. ` +
        `Perspective: clear anatomical or cross-section view. ` +
        `Rendering: flat 2D educational illustration, not 3D, not artistic. ` +
        `Background: plain white. ` +
        `Color scheme: realistic anatomical colors used in textbooks. ` +
        `Clarity: structures must be clearly distinguishable. ` +
        `Resolution: high resolution suitable for zooming. ` +
        `No artistic effects or stylization. ` +
        `No text, captions, or labels inside the image. ` +
        `Designed for interactive educational software. ` +
        `The image must accurately represent human anatomy and be suitable for medical students.`
    );
}

// ── Build AI parts prompt ───────────────────────────────────────
function buildPartsPrompt(topic) {
    return `You are a senior anatomy professor and medical educator. Generate a structured educational explanation of the main anatomical parts of "${topic}" for medical students.

Respond ONLY with valid JSON — no extra text whatsoever:

{
  "title": "e.g. Human Heart — Anterior View",
  "overview": "2-3 sentence clinical overview using medically correct terminology",
  "viewLabel": "e.g. Anterior View",
  "parts": [
    {
      "id": 1,
      "label": "Medically correct anatomical name e.g. Left Ventricle",
      "shortLabel": "L. Ventricle",
      "x": 42,
      "y": 68,
      "description": "Location: precise anatomical location and boundaries. Composition: tissue layers and structural components. Relationships: neighbouring structures.",
      "function": "Specific physiological function with mechanism. Include quantitative values where applicable (e.g. stroke volume, GFR).",
      "clinical": "Most clinically important condition affecting this structure. Include pathophysiology, key signs/symptoms, and first-line treatment.",
      "examFacts": [
        "Key exam point 1 — specific measurement, value, or high-yield fact (USMLE/UKMLA level)",
        "Key exam point 2 — commonly tested clinical scenario or diagnostic finding",
        "Key exam point 3 — drug mechanism, nerve supply, blood supply, or embryological origin"
      ]
    }
  ]
}

CRITICAL RULES:
- Use medically correct terminology ONLY — avoid fictional or incorrect structures
- Generate 8-12 structures accurately representing "${topic}"
- x and y are PERCENTAGE positions (0-100) on the image — place each structure at its TRUE anatomical location:
  * Heart: Left Ventricle x:40,y:70 | Right Ventricle x:60,y:62 | Ascending Aorta x:48,y:20 | Left Atrium x:36,y:48 | Right Atrium x:68,y:44 | Pulmonary Trunk x:42,y:30 | Mitral Valve x:44,y:57 | SA Node x:70,y:36 | Tricuspid Valve x:58,y:57
  * Brain: Frontal Lobe x:30,y:22 | Parietal Lobe x:58,y:20 | Temporal Lobe x:22,y:52 | Occipital Lobe x:78,y:35 | Cerebellum x:68,y:72 | Brainstem x:52,y:82 | Corpus Callosum x:50,y:42 | Thalamus x:50,y:52
  * Lungs: Right Upper Lobe x:28,y:28 | Right Middle Lobe x:27,y:47 | Right Lower Lobe x:28,y:66 | Left Upper Lobe x:72,y:28 | Left Lower Lobe x:72,y:60 | Trachea x:50,y:16 | Carina x:50,y:28 | Hilum x:50,y:44
  * Eye: Cornea x:18,y:50 | Iris x:30,y:50 | Lens x:40,y:50 | Vitreous Body x:62,y:50 | Retina x:80,y:50 | Optic Nerve x:92,y:52 | Sclera x:50,y:22 | Choroid x:52,y:75
  * Kidney: Renal Cortex x:24,y:35 | Renal Medulla x:40,y:42 | Renal Pelvis x:62,y:50 | Ureter x:72,y:72 | Renal Artery x:55,y:28 | Renal Vein x:55,y:65 | Major Calyx x:52,y:44 | Minor Calyx x:46,y:54
- Vary x,y significantly so NO two dots overlap
- The explanation must be concise, clear, and suitable for medical exam preparation
- Topic: "${topic}"`;
}

// ── Parse anatomy JSON from AI response ─────────────────────────
function parsePartsJSON(rawText) {
    if (!rawText) return null;
    let json = rawText;
    const fence = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) json = fence[1];
    const s = json.indexOf('{');
    const e = json.lastIndexOf('}');
    if (s < 0 || e < 0) return null;
    try {
        const data = JSON.parse(json.slice(s, e + 1));
        if (!data.parts?.length) return null;
        data.parts = data.parts
            .filter(p => p?.label)
            .map((p, i) => ({
                id: p.id ?? i + 1,
                label: String(p.label).trim(),
                shortLabel: String(p.shortLabel || p.label).trim().substring(0, 20),
                x: Math.max(5, Math.min(92, Number(p.x) || 50)),
                y: Math.max(8, Math.min(90, Number(p.y) || 50)),
                description: p.description || '',
                function: p.function || '',
                clinical: p.clinical || '',
                examFacts: Array.isArray(p.examFacts) ? p.examFacts : [],
                color: PALETTE[i % PALETTE.length],
            }));
        return data;
    } catch (e) {
        console.warn('[Anatomy] JSON parse error:', e.message);
        return null;
    }
}

// ── Call HuggingFace Inference API directly ─────────────────────
async function generateImageFromHF(prompt) {
    if (!HF_API_KEY) throw new Error('VITE_HF_API_KEY not set in .env');

    for (const model of HF_IMAGE_MODELS) {
        try {
            const res = await fetch(`${HF_BASE}/${model}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        num_inference_steps: model.includes('schnell') ? 4 : 20,
                        guidance_scale: 7.5,
                        width: 768,
                        height: 768,
                    },
                }),
            });

            if (res.status === 503 || res.status === 429) {
                console.warn(`[HF] Model ${model} unavailable (${res.status}), trying next...`);
                continue;
            }

            if (!res.ok) {
                const errText = await res.text().catch(() => '');
                console.warn(`[HF] Model ${model} error ${res.status}:`, errText.substring(0, 200));
                continue;
            }

            const blob = await res.blob();
            if (!blob || blob.size < 1000) {
                console.warn(`[HF] Model ${model} returned empty/tiny blob`);
                continue;
            }

            return URL.createObjectURL(blob);
        } catch (err) {
            console.warn(`[HF] Model ${model} failed:`, err.message);
            continue;
        }
    }

    throw new Error('All HuggingFace models failed or unavailable. Check VITE_HF_API_KEY and try again.');
}

// ── Hotspot overlay SVG ─────────────────────────────────────────
function HotspotOverlay({ parts, selected, onSelect, containerRef }) {
    const [hovered, setHovered] = useState(null);

    return (
        <svg
            style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                pointerEvents: 'none',
                overflow: 'visible',
            }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            <defs>
                <filter id="hs-glow" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>

            {parts.map((p) => {
                const isSel = selected?.id === p.id;
                const isHov = hovered === p.id;
                const r = isSel ? 2.8 : isHov ? 2.4 : 2.0;
                const labelAnchor = p.x < 50 ? 'start' : 'end';
                const labelX = p.x < 50 ? p.x + r + 1.5 : p.x - r - 1.5;

                return (
                    <g key={p.id}
                        style={{ pointerEvents: 'all', cursor: 'pointer' }}
                        onClick={() => onSelect(p)}
                        onMouseEnter={() => setHovered(p.id)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        {/* Pulse ring */}
                        {isSel && (
                            <circle cx={`${p.x}%`} cy={`${p.y}%`} r={`${r + 2}%`}
                                fill="none" stroke={p.color} strokeWidth="0.4" opacity="0.3">
                                <animate attributeName="r" from={`${r + 1.5}%`} to={`${r + 4}%`}
                                    dur="1.4s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.35" to="0"
                                    dur="1.4s" repeatCount="indefinite" />
                            </circle>
                        )}

                        {/* Dot shadow/ring */}
                        <circle cx={`${p.x}%`} cy={`${p.y}%`} r={`${r + 0.5}%`}
                            fill="rgba(0,0,0,0.55)" />

                        {/* Dot */}
                        <circle cx={`${p.x}%`} cy={`${p.y}%`} r={`${r}%`}
                            fill={isSel ? p.color : `${p.color}dd`}
                            stroke={isSel ? '#fff' : p.color}
                            strokeWidth={isSel ? '0.6' : '0.4'}
                            filter={isSel || isHov ? 'url(#hs-glow)' : undefined}
                            style={{ transition: 'r 0.15s' }}
                        />

                        {/* Number */}
                        <text x={`${p.x}%`} y={`${p.y + 0.9}%`}
                            textAnchor="middle"
                            fill={isSel ? '#000' : '#fff'}
                            fontSize="1.6%" fontWeight="900"
                            fontFamily="'Inter', sans-serif"
                            style={{ pointerEvents: 'none', userSelect: 'none' }}>
                            {p.id}
                        </text>

                        {/* Label */}
                        <text
                            x={`${labelX}%`} y={`${p.y + 0.9}%`}
                            textAnchor={labelAnchor}
                            fill={isSel || isHov ? p.color : 'rgba(255,255,255,0.9)'}
                            fontSize="1.4%" fontWeight={isSel ? '700' : '500'}
                            fontFamily="'Inter', sans-serif"
                            style={{ pointerEvents: 'none', userSelect: 'none' }}
                            stroke="rgba(0,0,0,0.7)"
                            strokeWidth="3"
                            paintOrder="stroke"
                        >
                            {p.shortLabel}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

// ── Part Detail Panel ──────────────────────────────────────────
function PartDetailPanel({ part, onClose }) {
    return (
        <div style={{
            padding: '22px 24px',
            background: `linear-gradient(135deg, ${part.color}12 0%, rgba(6,11,24,0.98) 100%)`,
            border: `1.5px solid ${part.color}45`,
            borderRadius: '16px',
            animation: 'fadeIn 0.22s ease',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                        background: `${part.color}25`, border: `2px solid ${part.color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: '800', color: part.color,
                    }}>{part.id}</span>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: part.color }}>{part.label}</h3>
                </div>
                <button onClick={onClose} style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', borderRadius: '8px',
                    padding: '4px 11px', fontSize: '0.77rem',
                }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '11px' }}>
                {[
                    { icon: '📍', label: 'Description', text: part.description, bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', lc: 'rgba(255,255,255,0.42)' },
                    { icon: '⚙️', label: 'Function', text: part.function, bg: `${part.color}0e`, border: `${part.color}30`, lc: part.color },
                    { icon: '🩺', label: 'Clinical Relevance', text: part.clinical, bg: 'rgba(255,107,107,0.07)', border: 'rgba(255,107,107,0.22)', lc: '#ff6b6b' },
                ].map(({ icon, label, text, bg, border, lc }) => text ? (
                    <div key={label} style={{ padding: '13px 15px', borderRadius: '11px', background: bg, border: `1px solid ${border}` }}>
                        <div style={{ fontSize: '0.67rem', fontWeight: '700', color: lc, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '7px' }}>
                            {icon} {label}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.83rem', color: 'rgba(255,255,255,0.83)', lineHeight: 1.7 }}>{text}</p>
                    </div>
                ) : null)}

                {part.examFacts?.length > 0 && (
                    <div style={{
                        padding: '13px 15px', borderRadius: '11px', gridColumn: '1 / -1',
                        background: 'rgba(255,193,7,0.07)', border: '1px solid rgba(255,193,7,0.22)',
                    }}>
                        <div style={{ fontSize: '0.67rem', fontWeight: '700', color: '#ffc107', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '9px' }}>
                            ⚡ High-Yield Exam Facts
                        </div>
                        {part.examFacts.map((f, i) => (
                            <div key={i} style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', marginBottom: '7px' }}>
                                <span style={{
                                    minWidth: '21px', height: '21px', borderRadius: '50%',
                                    background: 'rgba(255,193,7,0.14)', border: '1px solid rgba(255,193,7,0.33)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.66rem', fontWeight: '800', color: '#ffc107', flexShrink: 0,
                                }}>{i + 1}</span>
                                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.65 }}>{f}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────
export default function AnatomyExplorerPage() {
    const [query, setQuery] = useState('');
    const [phase, setPhase] = useState('idle'); // idle | parts | image | done | error
    const [phaseMsg, setPhaseMsg] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [partsData, setPartsData] = useState(null); // { title, overview, viewLabel, parts[] }
    const [selected, setSelected] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const imgRef = useRef(null);

    const [chatInput, setChatInput] = useState('');
    const [chatMsgs, setChatMsgs] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    // ── Main pipeline ─────────────────────────────────────────
    const runPipeline = useCallback(async (topic) => {
        if (!topic.trim() || phase === 'parts' || phase === 'image') return;

        setPhase('parts');
        setPhaseMsg('🧠 Identifying anatomical structures…');
        setImageUrl(null);
        setPartsData(null);
        setSelected(null);
        setImageLoaded(false);
        setChatMsgs([]);

        // ── Phase 1: Get anatomy parts from AI ──
        let parts = null;
        try {
            const raw = await chatCompletion(
                'You are a precise medical anatomy expert. Respond ONLY with valid JSON — no extra text.',
                buildPartsPrompt(topic),
                { maxTokens: 3500, temperature: 0.2 }
            );
            parts = parsePartsJSON(raw);
        } catch (err) {
            console.warn('[Anatomy] Parts AI failed:', err.message);
        }

        // ── Phase 2: Generate anatomy image from HF ──
        setPhase('image');
        setPhaseMsg('🎨 Generating medical illustration… (may take 20–40s)');

        let imgUrl = null;
        let imageError = null;
        try {
            imgUrl = await generateImageFromHF(buildImagePrompt(topic));
        } catch (err) {
            imageError = err.message;
            console.warn('[Anatomy] Image generation failed:', err.message);
        }

        // ── Phase 3: Combine results ──
        if (!parts && !imgUrl) {
            setPhase('error');
            setPhaseMsg(`Both AI parts and image generation failed. ${imageError || 'Check API keys.'}`);
            return;
        }

        // Use placeholder fallback title if AI parts failed
        if (!parts) {
            parts = {
                title: `${topic.charAt(0).toUpperCase()}${topic.slice(1)} Anatomy`,
                overview: '',
                viewLabel: 'Anatomical View',
                parts: [],
            };
        }

        setPartsData(parts);
        setImageUrl(imgUrl);
        setPhase('done');
        setPhaseMsg('');
    }, [phase]);

    const handleSearch = () => { if (query.trim()) runPipeline(query.trim()); };
    const isWorking = phase === 'parts' || phase === 'image';

    // ── AI Chat ───────────────────────────────────────────────
    const sendChat = async () => {
        if (!chatInput.trim() || chatLoading) return;
        const msg = chatInput.trim();
        setChatInput('');
        setChatMsgs(prev => [...prev, { role: 'user', text: msg }]);
        setChatLoading(true);
        try {
            const ctx = partsData
                ? `Topic: ${partsData.title}. Structures: ${partsData.parts.map(p => p.label).join(', ')}.`
                : 'General anatomy.';
            const hist = chatMsgs.slice(-6).map(m => `${m.role === 'user' ? 'Student' : 'Prof'}: ${m.text}`).join('\n');
            const ans = await chatCompletion(
                `You are a senior anatomy professor. Be concise and clinically relevant. Context: ${ctx}`,
                `${hist ? `History:\n${hist}\n\n` : ''}Student: "${msg}"\n\nAnswer in 3-4 sentences. End with one high-yield exam pearl.`,
                { maxTokens: 380, temperature: 0.25 }
            );
            setChatMsgs(prev => [...prev, { role: 'ai', text: ans }]);
        } catch {
            setChatMsgs(prev => [...prev, { role: 'ai', text: 'AI unavailable.' }]);
        }
        setChatLoading(false);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>🧬 Interactive Anatomy Explorer</h1>
                <p>Type any anatomy topic — AI generates a real medical illustration with labeled interactive structures and detailed explanations</p>
            </div>

            {/* Search */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <input className="input-field"
                        style={{ flex: 1, minWidth: '220px', padding: '13px 18px', fontSize: '0.93rem' }}
                        placeholder="e.g., human heart, brain anatomy, knee joint, animal cell…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !isWorking && handleSearch()}
                        disabled={isWorking}
                    />
                    <button className="btn btn-primary"
                        onClick={handleSearch} disabled={!query.trim() || isWorking}
                        style={{ padding: '13px 26px', fontSize: '0.95rem' }}>
                        {isWorking ? '⏳ Generating…' : '🔬 Explore'}
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                    {TOPICS.map(t => (
                        <button key={t.q} disabled={isWorking}
                            onClick={() => { setQuery(t.q); runPipeline(t.q); }}
                            style={{
                                padding: '5px 13px', borderRadius: '22px', fontSize: '0.76rem',
                                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                background: 'rgba(0,230,180,0.06)', border: '1.5px solid rgba(0,230,180,0.22)',
                                color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px',
                            }}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ padding: '7px 14px', marginBottom: '20px', background: 'rgba(255,193,7,0.05)', borderLeft: '3px solid #ffc107', borderRadius: '0 10px 10px 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                ⚠️ <strong style={{ color: '#ffc107' }}>Educational use only.</strong> Images generated by FLUX.1 via HuggingFace. Requires <code>VITE_HF_API_KEY</code> for images and <code>VITE_GROQ_API_KEY</code> for labels.
            </div>

            {/* Loading */}
            {isWorking && (
                <div style={{ minHeight: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '26px' }}>
                    {/* Dual-ring spinner */}
                    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                        <div style={{
                            position: 'absolute', inset: 0, borderRadius: '50%',
                            border: '4px solid rgba(0,230,180,0.1)',
                            borderTopColor: 'var(--accent-primary)',
                            animation: 'spin 0.9s linear infinite',
                        }} />
                        <div style={{
                            position: 'absolute', inset: '12px', borderRadius: '50%',
                            border: '3px solid rgba(114,137,255,0.1)',
                            borderTopColor: 'var(--accent-secondary)',
                            animation: 'spin 1.4s linear infinite reverse',
                        }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>
                            {phaseMsg}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {phase === 'parts' && 'Identifying structures with Groq AI…'}
                            {phase === 'image' && 'Rendering medical illustration with FLUX.1-schnell…'}
                        </p>
                        {/* Progress pills */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
                            {[
                                { label: '1. Identify structures', active: phase === 'parts', done: phase === 'image' || phase === 'done' },
                                { label: '2. Generate image', active: phase === 'image', done: phase === 'done' },
                                { label: '3. Build diagram', active: false, done: phase === 'done' },
                            ].map(s => (
                                <div key={s.label} style={{
                                    padding: '5px 12px', borderRadius: '20px', fontSize: '0.73rem', fontWeight: 600,
                                    background: s.done ? 'rgba(0,230,180,0.12)' : s.active ? 'rgba(0,230,180,0.06)' : 'rgba(255,255,255,0.03)',
                                    border: s.done ? '1.5px solid rgba(0,230,180,0.4)' : s.active ? '1.5px solid rgba(0,230,180,0.25)' : '1.5px solid rgba(255,255,255,0.06)',
                                    color: s.done ? 'var(--accent-primary)' : s.active ? 'var(--text-secondary)' : 'var(--text-muted)',
                                }}>
                                    {s.done ? '✓ ' : s.active ? '⏳ ' : ''}{s.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {phase === 'error' && (
                <div className="glass-card" style={{ padding: '28px', borderLeft: '4px solid var(--accent-danger)', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
                    <p style={{ color: 'var(--accent-danger)', fontWeight: 700, marginBottom: '8px' }}>Generation Failed</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', maxWidth: '500px', margin: '0 auto 16px' }}>{phaseMsg}</p>
                    <button className="btn btn-outline" onClick={() => setPhase('idle')}>Try Again</button>
                </div>
            )}

            {/* Idle */}
            {phase === 'idle' && (
                <div style={{ textAlign: 'center', padding: '70px 20px', opacity: 0.75 }}>
                    <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🧬</div>
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '1.3rem' }}>
                        Explore Any Anatomy Topic
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.75 }}>
                        Type a topic or click a chip above. The AI will generate a real medical illustration
                        using FLUX.1, then identify and label every major structure — click any dot to read
                        its description, function, clinical relevance, and exam-level facts.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
                        {['FLUX.1 medical image', 'Interactive labeled dots', 'Clinical explanations', 'Exam-level facts', 'AI chat'].map(f => (
                            <span key={f} style={{
                                padding: '6px 14px', borderRadius: '20px',
                                background: 'rgba(0,230,180,0.06)', border: '1px solid rgba(0,230,180,0.2)',
                                color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: 600,
                            }}>✓ {f}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Done ── */}
            {phase === 'done' && partsData && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 420px) 1fr', gap: '20px', alignItems: 'start' }}>

                    {/* LEFT: image + legend */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div className="glass-card" style={{ padding: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1rem' }}>{partsData.title}</h2>
                                    {partsData.viewLabel && (
                                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 700 }}>
                                            {partsData.viewLabel}
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button className="btn btn-sm btn-outline" style={{ fontSize: '0.72rem' }}
                                        onClick={() => runPipeline(query)} disabled={isWorking}>
                                        🔄 Regen
                                    </button>
                                    <button className="btn btn-sm btn-outline" style={{ fontSize: '0.72rem' }}
                                        onClick={() => { setPhase('idle'); setImageUrl(null); setPartsData(null); setSelected(null); setQuery(''); }}>
                                        ✕ Reset
                                    </button>
                                </div>
                            </div>

                            {/* Image with hotspot overlay */}
                            <div style={{
                                position: 'relative', borderRadius: '12px', overflow: 'hidden',
                                border: '1px solid rgba(0,230,180,0.15)',
                                background: '#060b18',
                                minHeight: '200px',
                            }}>
                                {/* Skeleton shimmer while image loads */}
                                {!imageLoaded && imageUrl && (
                                    <div style={{
                                        position: 'absolute', inset: 0, zIndex: 1,
                                        background: 'linear-gradient(90deg, #0d1520 25%, #162030 50%, #0d1520 75%)',
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 1.5s infinite',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <span style={{ color: 'rgba(0,230,180,0.5)', fontSize: '0.8rem' }}>Loading image…</span>
                                    </div>
                                )}

                                {imageUrl ? (
                                    <>
                                        <img
                                            ref={imgRef}
                                            src={imageUrl}
                                            alt={partsData.title}
                                            onLoad={() => setImageLoaded(true)}
                                            style={{
                                                width: '100%',
                                                display: 'block',
                                                objectFit: 'contain',
                                                maxHeight: '520px',
                                                opacity: imageLoaded ? 1 : 0,
                                                transition: 'opacity 0.4s ease',
                                            }}
                                        />
                                        {imageLoaded && partsData.parts.length > 0 && (
                                            <HotspotOverlay
                                                parts={partsData.parts}
                                                selected={selected}
                                                onSelect={setSelected}
                                            />
                                        )}
                                    </>
                                ) : (
                                    // No image (HF failed) — show placeholder with note
                                    <div style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        minHeight: '280px', gap: '12px', padding: '20px', textAlign: 'center',
                                    }}>
                                        <span style={{ fontSize: '3rem' }}>🖼️</span>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', maxWidth: '260px', lineHeight: 1.6 }}>
                                            Image generation unavailable — HuggingFace API may be overloaded. Labels and explanations are still available below.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Label count */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    {partsData.parts.length} labeled structures • Click any dot or label below
                                </span>
                                {imageUrl && (
                                    <span style={{ fontSize: '0.7rem', color: 'rgba(0,230,180,0.6)', fontWeight: 600 }}>
                                        ⚡ FLUX.1-schnell
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Overview */}
                        {partsData.overview && (
                            <div className="glass-card" style={{ padding: '14px' }}>
                                <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--accent-primary)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Overview</div>
                                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.72 }}>{partsData.overview}</p>
                            </div>
                        )}

                        {/* Legend pills */}
                        <div className="glass-card" style={{ padding: '13px' }}>
                            <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '9px' }}>
                                Labeled Structures
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {partsData.parts.map(p => (
                                    <button key={p.id} onClick={() => setSelected(p)} style={{
                                        padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                                        background: selected?.id === p.id ? p.color : `${p.color}16`,
                                        border: `1.5px solid ${p.color}50`,
                                        color: selected?.id === p.id ? '#000' : p.color,
                                        transition: 'all 0.17s',
                                    }}>
                                        {p.id}. {p.shortLabel}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: detail + list + chat */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {selected ? (
                            <PartDetailPanel part={selected} onClose={() => setSelected(null)} />
                        ) : (
                            <div className="glass-card" style={{ padding: '36px', textAlign: 'center', opacity: 0.6 }}>
                                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👆</div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                                    Click any numbered dot on the image or a structure label to see its full medical explanation
                                </p>
                            </div>
                        )}

                        {/* All parts list */}
                        <div className="glass-card" style={{ padding: '14px' }}>
                            <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--accent-primary)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
                                📚 All Structures — Click to Learn
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {partsData.parts.map(p => (
                                    <button key={p.id} onClick={() => setSelected(p)} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '9px 11px', borderRadius: '10px', cursor: 'pointer',
                                        background: selected?.id === p.id ? `${p.color}18` : 'rgba(255,255,255,0.025)',
                                        border: selected?.id === p.id ? `1px solid ${p.color}50` : '1px solid rgba(255,255,255,0.05)',
                                        textAlign: 'left', width: '100%', transition: 'all 0.16s',
                                    }}>
                                        <span style={{
                                            width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                                            background: `${p.color}20`, border: `1.5px solid ${p.color}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.7rem', fontWeight: '800', color: p.color,
                                        }}>{p.id}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: selected?.id === p.id ? p.color : 'var(--text-primary)', marginBottom: '1px' }}>
                                                {p.label}
                                            </div>
                                            <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {p.description?.substring(0, 75)}{p.description?.length > 75 ? '…' : ''}
                                            </div>
                                        </div>
                                        <span style={{ color: selected?.id === p.id ? p.color : 'rgba(255,255,255,0.2)', fontSize: '0.8rem', flexShrink: 0 }}>→</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chat */}
                        <div className="glass-card" style={{ padding: '15px' }}>
                            <h4 style={{ margin: '0 0 10px', fontSize: '0.82rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                🤖 Ask AI about {partsData.title}
                            </h4>
                            <div style={{ maxHeight: '210px', overflowY: 'auto', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                                {chatMsgs.length === 0 && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                        Ask: "Blood supply?" • "Most common disease?" • "Nerve innervation?"
                                    </p>
                                )}
                                {chatMsgs.map((m, i) => (
                                    <div key={i} style={{
                                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '90%', padding: '8px 12px', borderRadius: '10px',
                                        fontSize: '0.81rem', lineHeight: 1.6, color: 'var(--text-secondary)',
                                        background: m.role === 'user' ? 'rgba(114,137,255,0.12)' : 'rgba(0,230,180,0.07)',
                                        border: m.role === 'user' ? '1px solid rgba(114,137,255,0.2)' : '1px solid rgba(0,230,180,0.14)',
                                    }}>{m.text}</div>
                                ))}
                                {chatLoading && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--accent-primary)', fontSize: '0.78rem' }}>
                                        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span> Thinking…
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input className="input-field"
                                    style={{ flex: 1, padding: '9px 12px', fontSize: '0.83rem' }}
                                    placeholder={`Ask about ${partsData.title}…`}
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                                    disabled={chatLoading}
                                />
                                <button className="btn btn-primary" onClick={sendChat}
                                    disabled={chatLoading || !chatInput.trim()} style={{ padding: '9px 14px' }}>
                                    📤
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
