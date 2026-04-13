// ═══════════════════════════════════════════════════════════════
// FLUX Image Generation — routes through FastAPI backend proxy
// to avoid CORS restrictions when calling HuggingFace from browser
// ═══════════════════════════════════════════════════════════════

const HF_API_KEY = import.meta.env.VITE_HF_API_KEY || '';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/**
 * Generate a medical anatomy image via the FastAPI backend proxy.
 * Backend calls HuggingFace server-side (no CORS issues).
 * Returns a base64 blob URL; no label data is returned (frontend will rely
 * on OCR/vision or further AI prompts to identify structures).
 *
 * @param {string} prompt - The anatomy topic (e.g. "human heart anatomy")
 * @returns {Promise<{imageUrl: string, structures: object|null}>} - Image blob URL; structures always null
 */
export async function generateAnatomyImage(prompt) {
    const res = await fetch(`${BACKEND_URL}/api/anatomy/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            topic: prompt,
            hf_api_key: HF_API_KEY,
        }),
    });

    if (!res.ok) {
        let detail = `Backend error ${res.status}`;
        try {
            const err = await res.json();
            detail = err.detail || detail;
        } catch { /* ignore */ }
        throw new Error(detail);
    }

    const data = await res.json();
    if (!data.image_b64) throw new Error('No image data returned from backend.');

    // Convert base64 → Blob → Object URL
    const byteChars = atob(data.image_b64);
    const byteNums = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
        byteNums[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteNums], { type: data.mime_type || 'image/jpeg' });
    const imageUrl = URL.createObjectURL(blob);

    // Return image URL and pre-defined structures if available
    return {
        imageUrl,
        structures: data.parts ? {
            title: data.title,
            overview: data.overview,
            parts: data.parts
        } : null
    };
}
