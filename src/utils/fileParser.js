// ═══════════════════════════════════════════════════════════════
// File Parsing Utilities
// Handles text, PDF, DOCX, and PPT file extraction client-side
// ═══════════════════════════════════════════════════════════════

/**
 * Parse a text file
 */
export function parseTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read text file'));
        reader.readAsText(file);
    });
}

/**
 * Parse a PDF file using pdfjs-dist
 */
export async function parsePdfFile(file) {
    try {
        const pdfjsLib = await import('pdfjs-dist');

        // Use the bundled worker via Vite's ?url import or CDN fallback
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            try {
                const workerUrl = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
                pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.default;
                console.log('[MedGenius] PDF.js worker loaded from local bundle');
            } catch (workerErr) {
                console.warn('[MedGenius] Local worker failed, using CDN:', workerErr.message);
                // Fallback to CDN - use jsdelivr which has latest versions
                const version = pdfjsLib.version || '5.4.624';
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
            }
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';
        }

        return fullText.trim() || 'PDF parsed but no readable text found. The PDF may contain only images.';
    } catch (err) {
        console.error('PDF parse error:', err);
        // Fallback: try reading as text
        try {
            const text = await parseTextFile(file);
            if (text && text.trim().length > 50) return text;
        } catch { /* ignore */ }
        throw new Error(`Failed to parse PDF: ${err.message}`);
    }
}

/**
 * Parse a DOCX file using mammoth
 */
export async function parseDocxFile(file) {
    try {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value || 'DOCX parsed but no text content found.';
    } catch (err) {
        console.error('DOCX parse error:', err);
        throw new Error(`Failed to parse DOCX: ${err.message}`);
    }
}

/**
 * Parse a PPT/PPTX file (basic extraction via XML parsing)
 * PPTX files are ZIP archives containing XML files
 */
export async function parsePptFile(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const rawText = decoder.decode(uint8Array);

        // Extract text between XML tags that typically contain slide text
        const textMatches = rawText.match(/<a:t>([^<]*)<\/a:t>/g);
        if (textMatches && textMatches.length > 0) {
            const textContent = textMatches
                .map(m => m.replace(/<\/?a:t>/g, ''))
                .filter(t => t.trim().length > 0)
                .join(' ');

            if (textContent.trim()) {
                return textContent.trim();
            }
        }

        return 'PPTX parsed but limited text could be extracted. For best results, also enter the topic name in the text field above.';
    } catch (err) {
        console.error('PPT parse error:', err);
        throw new Error(`Failed to parse PPTX: ${err.message}`);
    }
}

/**
 * Main file parser — routes to the correct parser based on file extension
 */
export async function parseFile(file) {
    if (!file) throw new Error('No file provided');

    const name = file.name.toLowerCase();
    const ext = name.split('.').pop();

    console.log(`[MedGenius] Parsing file: ${file.name} (${ext}), size: ${file.size} bytes`);

    try {
        switch (ext) {
            case 'txt':
            case 'md':
            case 'csv':
                return await parseTextFile(file);
            case 'pdf':
                return await parsePdfFile(file);
            case 'docx':
                return await parseDocxFile(file);
            case 'doc':
                return 'DOC format (legacy) requires conversion. Please save as DOCX and re-upload, or paste the text directly into the input field.';
            case 'pptx':
                return await parsePptFile(file);
            case 'ppt':
                return 'PPT format (legacy) requires conversion. Please save as PPTX and re-upload, or paste the text directly into the input field.';
            default:
                // Try reading as text for unknown extensions
                try {
                    const text = await parseTextFile(file);
                    if (text && text.trim().length > 0) return text;
                    return `Could not extract text from .${ext} file.`;
                } catch {
                    return `Unsupported file format: .${ext}. Supported formats: PDF, DOCX, PPTX, TXT, MD, CSV`;
                }
        }
    } catch (err) {
        console.error(`[MedGenius] File parse error for ${ext}:`, err);
        throw err;
    }
}

/**
 * Get accepted file types string for input elements
 */
export const ACCEPTED_FILE_TYPES = '.pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.csv';

/**
 * Get human-readable file type description
 */
export function getFileTypeLabel(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const labels = {
        pdf: '📄 PDF',
        docx: '📝 Word (DOCX)',
        doc: '📝 Word (DOC)',
        pptx: '📊 PowerPoint (PPTX)',
        ppt: '📊 PowerPoint (PPT)',
        txt: '📃 Text',
        md: '📋 Markdown',
        csv: '📊 CSV',
    };
    return labels[ext] || `📎 ${ext.toUpperCase()}`;
}

/**
 * Parse multiple files and combine their text
 * Returns { combinedText, results: [{ name, status, chars, error }] }
 */
export async function parseMultipleFiles(files) {
    const results = [];
    let combinedText = '';

    for (const file of files) {
        try {
            const text = await parseFile(file);
            const chars = text?.trim().length || 0;
            results.push({ name: file.name, status: 'success', chars });
            if (chars > 0) {
                combinedText += `\n\n=== From: ${file.name} ===\n\n${text.trim()}`;
            }
        } catch (err) {
            results.push({ name: file.name, status: 'error', chars: 0, error: err.message });
        }
    }

    return { combinedText: combinedText.trim(), results };
}
