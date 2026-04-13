// ═══════════════════════════════════════════════════════════════
// Whisper Service (Hugging Face)
// Handles Audio/Video transcription using openai/whisper-large-v3
// ═══════════════════════════════════════════════════════════════

const HF_API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3";

/**
 * Transcribes audio via Hugging Face Inference API.
 * Due to HF limits, we might fail on large files directly.
 * An ideal architecture would process via a backend.
 * Here we send the file as a Blob.
 * 
 * @param {File|Blob} file Audio or Video file containing sound
 * @returns {string} Transcribed text
 */
export async function transcribeAudio(file) {
    const apiKey = import.meta.env.VITE_HF_API_KEY;
    if (!apiKey) {
        throw new Error("Hugging Face API key not found in .env (VITE_HF_API_KEY).");
    }

    try {
        console.log(`[WhisperService] Transcribing file: ${file.name} (${file.size} bytes)...`);

        // Ensure file is loaded as buffer
        const arrayBuffer = await file.arrayBuffer();

        const response = await fetch(HF_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": file.type || "audio/flac", // Fallback content type
            },
            body: arrayBuffer,
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("[WhisperService] API Error:", result);
            throw new Error(result.error || "Failed to transcribe audio. The file might be too large for the free inference API.");
        }

        console.log("[WhisperService] Transcription success:", result.text?.substring(0, 100) + "...");
        return result.text || "";
    } catch (err) {
        console.error("[WhisperService] Error:", err);
        throw err;
    }
}
