// ═══════════════════════════════════════════════════════════════
// Smart Notes Builder
// Automatically structures unstructured text into medical note
// sections using keyword analysis and heuristics
// ═══════════════════════════════════════════════════════════════

const SECTION_KEYWORDS = {
    definition: [
        'definition', 'define', 'what is', 'overview', 'introduction',
        'refers to', 'is defined as', 'is characterized'
    ],
    etiology: [
        'etiology', 'aetiology', 'cause', 'caused by', 'risk factor',
        'predisposing', 'precipitating', 'origin', 'due to'
    ],
    pathophysiology: [
        'pathophysiology', 'pathogenesis', 'mechanism', 'pathway',
        'cascade', 'process', 'leads to', 'results in', 'sequence'
    ],
    clinicalFeatures: [
        'clinical feature', 'symptom', 'sign', 'presentation',
        'manifest', 'chief complaint', 'examination', 'finding'
    ],
    diagnosis: [
        'diagnosis', 'investigation', 'lab', 'imaging', 'test',
        'gold standard', 'criteria', 'classification', 'staging',
        'x-ray', 'ct scan', 'mri', 'biopsy', 'blood test'
    ],
    management: [
        'management', 'treatment', 'therapy', 'drug', 'medication',
        'surgical', 'conservative', 'pharmacological', 'dose',
        'first line', 'second line', 'intervention', 'protocol'
    ],
    complications: [
        'complication', 'prognosis', 'outcome', 'sequelae',
        'mortality', 'morbidity', 'adverse', 'side effect'
    ],
    prevention: [
        'prevention', 'prophylaxis', 'vaccine', 'screening',
        'lifestyle', 'diet', 'exercise', 'avoid'
    ]
};

const SECTION_META = {
    definition: { title: 'Definition & Overview', icon: '📘' },
    etiology: { title: 'Etiology & Risk Factors', icon: '🔬' },
    pathophysiology: { title: 'Pathophysiology', icon: '⚙️' },
    clinicalFeatures: { title: 'Clinical Features', icon: '🩺' },
    diagnosis: { title: 'Diagnosis & Investigations', icon: '🔍' },
    management: { title: 'Management & Treatment', icon: '💊' },
    complications: { title: 'Complications & Prognosis', icon: '⚠️' },
    prevention: { title: 'Prevention', icon: '🛡️' }
};

/**
 * Score a line for each section based on keyword hits
 */
function scoreLine(line) {
    const lower = line.toLowerCase();
    const scores = {};
    for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
        scores[section] = 0;
        keywords.forEach(kw => {
            if (lower.includes(kw)) scores[section] += 2;
        });
    }
    return scores;
}

/**
 * Try to detect heading lines (short, capitalized, or has heading markers)
 */
function isHeading(line) {
    const trimmed = line.trim();
    if (trimmed.length < 3 || trimmed.length > 80) return false;
    if (/^#{1,4}\s/.test(trimmed)) return true;
    if (/^[A-Z][A-Z\s&:,\-]{3,}$/.test(trimmed)) return true;
    if (/^\d+\.\s*[A-Z]/.test(trimmed) && trimmed.length < 60) return true;
    if (trimmed.endsWith(':') && trimmed.length < 60) return true;
    return false;
}

/**
 * Build structured notes from unstructured text
 */
export function buildSmartNotes(text, topicTitle = 'Uploaded Notes') {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
    if (lines.length < 3) {
        return {
            sections: { definition: text },
            highYieldPoints: [],
            detectedSections: ['definition']
        };
    }

    // Group lines into paragraphs (separated by empty lines or headings)
    const paragraphs = [];
    let current = [];
    for (const line of lines) {
        if (line.length < 5 || isHeading(line)) {
            if (current.length > 0) {
                paragraphs.push({ heading: isHeading(line) ? line : null, lines: [...current] });
                current = [];
            }
            if (isHeading(line)) current.push(line);
        } else {
            current.push(line);
        }
    }
    if (current.length > 0) paragraphs.push({ heading: null, lines: current });

    // Score each paragraph for section assignment
    const sectionContent = {};
    const assignedParagraphs = new Set();

    paragraphs.forEach((para, idx) => {
        const fullText = para.lines.join(' ');
        const scores = scoreLine(fullText);
        // Also score the heading if present
        if (para.heading) {
            const headingScores = scoreLine(para.heading);
            for (const s of Object.keys(headingScores)) {
                scores[s] += headingScores[s] * 2; // Headings count double
            }
        }

        // Find best matching section
        let bestSection = null;
        let bestScore = 0;
        for (const [section, score] of Object.entries(scores)) {
            if (score > bestScore) {
                bestScore = score;
                bestSection = section;
            }
        }

        if (bestSection && bestScore >= 2) {
            if (!sectionContent[bestSection]) sectionContent[bestSection] = [];
            sectionContent[bestSection].push(...para.lines);
            assignedParagraphs.add(idx);
        }
    });

    // Assign unmatched paragraphs to 'definition' (general content) sequentially
    const unmatched = [];
    paragraphs.forEach((para, idx) => {
        if (!assignedParagraphs.has(idx)) {
            unmatched.push(...para.lines);
        }
    });

    if (unmatched.length > 0) {
        if (!sectionContent.definition) sectionContent.definition = [];
        sectionContent.definition = [...unmatched, ...(sectionContent.definition || [])];
    }

    // Ensure at least definition exists
    if (!sectionContent.definition && Object.keys(sectionContent).length > 0) {
        const firstKey = Object.keys(sectionContent)[0];
        sectionContent.definition = sectionContent[firstKey].slice(0, 3);
    }

    // Build the sections object (string for definition, arrays for others)
    const sections = {};
    for (const key of Object.keys(SECTION_META)) {
        if (sectionContent[key]) {
            if (key === 'definition') {
                sections[key] = sectionContent[key].slice(0, 5).join('\n\n');
            } else {
                sections[key] = sectionContent[key];
            }
        }
    }

    // Extract high-yield points (lines with key medical/academic terms)
    const highYieldKeywords = [
        'most common', 'gold standard', 'first line', 'pathognomonic', 'hallmark',
        'important', 'remember', 'key point', 'note that', 'defined as',
        'characterized by', 'caused by', 'treatment of choice', 'drug of choice',
        'diagnosis', 'investigation', 'risk factor', 'complication',
        'contraindicated', 'indicated for', 'mechanism of', 'results in',
        'associated with', 'leads to', 'classified as', 'prevention',
        'prognosis', 'management', 'clinical feature', 'presentation',
        'symptom', 'sign of', 'etiology', 'pathogenesis',
    ];

    const highYieldPoints = [];

    // Pass 1: lines with high-yield keywords
    const kwMatches = lines
        .filter(l => l.length > 15 && highYieldKeywords.some(kw => l.toLowerCase().includes(kw)))
        .slice(0, 8)
        .map(l => l.replace(/\*\*/g, '').replace(/^[-•▸*]\s*/, '').replace(/^\d+[.)]\s*/, ''));
    highYieldPoints.push(...kwMatches);

    // Pass 2: lines with colons (term: definition pattern) — common in study notes
    if (highYieldPoints.length < 5) {
        const colonLines = lines
            .filter(l => l.includes(':') && l.length > 20 && l.length < 200
                && !highYieldPoints.includes(l.replace(/\*\*/g, '')))
            .slice(0, 5 - highYieldPoints.length)
            .map(l => l.replace(/\*\*/g, ''));
        highYieldPoints.push(...colonLines);
    }

    // Pass 3: bullet-point or numbered lines (often key facts)
    if (highYieldPoints.length < 5) {
        const bulletLines = lines
            .filter(l => /^[-•▸*]\s/.test(l) && l.length > 15 && l.length < 200
                && !highYieldPoints.includes(l.replace(/^[-•▸*]\s*/, '').replace(/\*\*/g, '')))
            .slice(0, 5 - highYieldPoints.length)
            .map(l => l.replace(/^[-•▸*]\s*/, '').replace(/\*\*/g, ''));
        highYieldPoints.push(...bulletLines);
    }

    // Pass 4: information-dense sentences as final fallback
    if (highYieldPoints.length < 3) {
        const denseSentences = lines
            .filter(l => l.length > 20 && l.length < 180
                && !highYieldPoints.includes(l.replace(/\*\*/g, '')))
            .slice(0, 5 - highYieldPoints.length)
            .map(l => l.replace(/\*\*/g, ''));
        highYieldPoints.push(...denseSentences);
    }

    return {
        sections,
        highYieldPoints,
        detectedSections: Object.keys(sections)
    };
}

export { SECTION_META };
