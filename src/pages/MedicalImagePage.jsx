// ═══════════════════════════════════════════════════════════════
// Medical Image Page — Interactive Labelled Diagrams + Image Upload
// Upload any anatomy/radiology image → AI explains each organ/structure
// SVG-based anatomical diagrams with clickable labels
// AI-generated exam-oriented descriptions
// ═══════════════════════════════════════════════════════════════

import React, { useState, useRef } from 'react';
import { chatCompletion, analyzeImageWithVision } from '../utils/aiService';

const MEDICAL_DIAGRAMS = [
    {
        id: 'heart',
        title: 'Heart (Anatomy)',
        category: 'Cardiology',
        icon: '❤️',
        structures: [
            { id: 'ra', label: 'Right Atrium', x: 30, y: 35, desc: 'Receives deoxygenated blood from SVC and IVC. Contains SA node (pacemaker). Separated from left atrium by interatrial septum.' },
            { id: 'la', label: 'Left Atrium', x: 68, y: 30, desc: 'Receives oxygenated blood from 4 pulmonary veins. Thinner wall than left ventricle. Commonly site of thrombus formation in atrial fibrillation.' },
            { id: 'rv', label: 'Right Ventricle', x: 35, y: 60, desc: 'Pumps blood to pulmonary circulation via pulmonary trunk. Thinner wall (4-5mm) than LV. Contains trabeculae carneae and moderator band.' },
            { id: 'lv', label: 'Left Ventricle', x: 60, y: 65, desc: 'Pumps oxygenated blood to systemic circulation via aorta. Thickest wall (12-15mm). Most common site of myocardial infarction.' },
            { id: 'aorta', label: 'Aorta', x: 52, y: 12, desc: 'Largest artery. Ascending aorta → aortic arch (3 branches) → descending aorta. Aortic valve has 3 cusps. Coronary arteries arise from aortic sinuses.' },
            { id: 'pa', label: 'Pulmonary Artery', x: 42, y: 18, desc: 'Carries deoxygenated blood from RV to lungs. Bifurcates into right and left pulmonary arteries. Patent ductus arteriosus connects it to aorta in fetal circulation.' },
            { id: 'tv', label: 'Tricuspid Valve', x: 32, y: 48, desc: 'AV valve between RA and RV. Has 3 cusps attached to papillary muscles via chordae tendineae. Tricuspid regurgitation: seen in right heart failure, infective endocarditis (IV drug users).' },
            { id: 'mv', label: 'Mitral Valve', x: 62, y: 48, desc: 'AV valve between LA and LV. Has 2 cusps (bicuspid). Most commonly affected valve in rheumatic heart disease. Mitral stenosis: "opening snap" on auscultation.' },
            { id: 'ivs', label: 'Interventricular Septum', x: 48, y: 55, desc: 'Separates right and left ventricles. Has membranous (thin, upper) and muscular (thick, lower) parts. VSD is most common congenital heart defect.' },
            { id: 'svc', label: 'Superior Vena Cava', x: 25, y: 15, desc: 'Returns deoxygenated blood from upper body to right atrium. Formed by union of right and left brachiocephalic veins. SVC syndrome: compression by mediastinal tumors (lung cancer, lymphoma).' },
        ],
        color: '#ff6b6b',
    },
    {
        id: 'lungs',
        title: 'Lungs (Respiratory)',
        category: 'Pulmonology',
        icon: '🫁',
        structures: [
            { id: 'trachea', label: 'Trachea', x: 50, y: 10, desc: 'C-shaped cartilage rings (16-20). Bifurcates at carina (T4-5 level). Right main bronchus: wider, shorter, more vertical — foreign bodies lodge here more often.' },
            { id: 'rmb', label: 'Right Main Bronchus', x: 35, y: 25, desc: 'Wider, shorter, more vertical than left. Divides into 3 lobar bronchi (upper, middle, lower). Most common site for aspiration of foreign bodies.' },
            { id: 'lmb', label: 'Left Main Bronchus', x: 65, y: 28, desc: 'Longer, narrower, more horizontal. Passes under aortic arch. Divides into 2 lobar bronchi (upper and lower). Left lung has 2 lobes (right has 3).' },
            { id: 'rul', label: 'Right Upper Lobe', x: 30, y: 30, desc: '3 segments: apical, posterior, anterior. TB commonly affects apical segment. Separated from middle lobe by horizontal fissure.' },
            { id: 'rml', label: 'Right Middle Lobe', x: 32, y: 50, desc: '2 segments: lateral and medial. Middle lobe syndrome: recurrent collapse due to compression by enlarged lymph nodes.' },
            { id: 'rll', label: 'Right Lower Lobe', x: 35, y: 70, desc: '5 segments including superior (apical) segment. Most common site for aspiration pneumonia (especially superior segment). Separated by oblique fissure.' },
            { id: 'lul', label: 'Left Upper Lobe', x: 68, y: 32, desc: 'Includes lingula (equivalent of right middle lobe). 4-5 segments. Contains lingular segment which is commonly affected in bronchiectasis.' },
            { id: 'lll', label: 'Left Lower Lobe', x: 65, y: 65, desc: '4-5 segments. Common site for community-acquired pneumonia. Separated from upper lobe by oblique fissure.' },
            { id: 'hilum', label: 'Hilum', x: 48, y: 40, desc: 'Contains bronchi, pulmonary vessels, nerves, lymph nodes. Hilar lymphadenopathy: seen in sarcoidosis, TB, lymphoma, lung cancer.' },
            { id: 'pleura', label: 'Pleura', x: 20, y: 55, desc: 'Visceral (lines lung) and parietal (lines chest wall) layers with pleural space between. Pleural effusion: fluid accumulation. Pneumothorax: air in pleural space.' },
        ],
        color: '#7289ff',
    },
    {
        id: 'kidney',
        title: 'Kidney (Renal)',
        category: 'Nephrology',
        icon: '🫘',
        structures: [
            { id: 'cortex', label: 'Renal Cortex', x: 25, y: 30, desc: 'Outer layer containing glomeruli, proximal and distal convoluted tubules. Site of ultrafiltration. Cortical necrosis: seen in DIC, abruptio placentae.' },
            { id: 'medulla', label: 'Renal Medulla', x: 45, y: 50, desc: 'Contains renal pyramids with loops of Henle and collecting ducts. Medullary pyramids drain into minor calyces. Papillary necrosis: diabetes, analgesic nephropathy, sickle cell.' },
            { id: 'pelvis', label: 'Renal Pelvis', x: 65, y: 45, desc: 'Funnel-shaped structure collecting urine from major calyces. Continuous with ureter. Pelviureteric junction (PUJ): common site for obstruction by calculi.' },
            { id: 'glom', label: 'Glomerulus', x: 30, y: 15, desc: 'Tuft of fenestrated capillaries within Bowman\'s capsule. Site of filtration (GFR ~125 mL/min). Glomerulonephritis: nephritic (RBCs) vs nephrotic (proteinuria >3.5g/day).' },
            { id: 'pct', label: 'Proximal Convoluted Tubule', x: 50, y: 20, desc: 'Reabsorbs 65-70% of filtered water, glucose, amino acids, Na+, HCO3-. Brush border for absorption. Most metabolically active segment. Damaged first in ischemia.' },
            { id: 'loh', label: 'Loop of Henle', x: 40, y: 60, desc: 'Descending limb: permeable to water. Ascending limb: impermeable to water, active Na+/K+/2Cl- reabsorption. Target of loop diuretics (Furosemide). Creates medullary concentration gradient.' },
            { id: 'dct', label: 'Distal Convoluted Tubule', x: 55, y: 30, desc: 'Na+/Cl- reabsorption (thiazide diuretics act here). Part of juxtaglomerular apparatus (macula densa). Aldosterone-sensitive Na+ reabsorption.' },
            { id: 'cd', label: 'Collecting Duct', x: 50, y: 75, desc: 'ADH-sensitive water reabsorption. Principal cells: Na+ reabsorption, K+ secretion (aldosterone). Intercalated cells: H+ secretion, HCO3- reabsorption. Target of ADH → aquaporin-2 insertion.' },
            { id: 'ra2', label: 'Renal Artery', x: 72, y: 35, desc: 'Branch of abdominal aorta at L1-2. Divides into segmental → interlobar → arcuate → interlobular arteries. Renal artery stenosis: cause of secondary hypertension.' },
            { id: 'ureter', label: 'Ureter', x: 70, y: 70, desc: '25cm muscular tube, retroperitoneal. Three constrictions: PUJ, pelvic brim, VUJ (most common site for stone impaction). Peristalsis propels urine.' },
        ],
        color: '#00e6b4',
    },
    {
        id: 'brain',
        title: 'Brain (Neurology)',
        category: 'Neurology',
        icon: '🧠',
        structures: [
            { id: 'frontal', label: 'Frontal Lobe', x: 30, y: 25, desc: 'Motor cortex (precentral gyrus), Broca\'s area (speech production), personality, planning, judgment. Frontal lobe lesion: personality changes, disinhibition, motor aphasia.' },
            { id: 'parietal', label: 'Parietal Lobe', x: 55, y: 20, desc: 'Somatosensory cortex (postcentral gyrus), spatial awareness, body image. Lesion: contralateral sensory loss, agnosia, Gerstmann syndrome (dominant), neglect (non-dominant).' },
            { id: 'temporal', label: 'Temporal Lobe', x: 35, y: 55, desc: 'Auditory cortex, Wernicke\'s area (speech comprehension), hippocampus (memory). Lesion: receptive aphasia, memory deficits. Uncal herniation → CN III palsy.' },
            { id: 'occipital', label: 'Occipital Lobe', x: 78, y: 35, desc: 'Visual cortex (V1). Receives input from lateral geniculate nucleus via optic radiations. Lesion: contralateral homonymous hemianopia with macular sparing.' },
            { id: 'cerebellum', label: 'Cerebellum', x: 75, y: 60, desc: 'Coordination, balance, motor learning. Vermis: truncal ataxia. Hemispheres: limb ataxia (ipsilateral). DANISH mnemonic: Dysdiadochokinesia, Ataxia, Nystagmus, Intention tremor, Slurred speech, Hypotonia.' },
            { id: 'brainstem', label: 'Brainstem', x: 58, y: 65, desc: 'Midbrain + Pons + Medulla. CN III-XII nuclei. Vital centers (respiratory, cardiac). Brainstem death: fixed dilated pupils, absent brainstem reflexes, apnea test positive.' },
            { id: 'thalamus', label: 'Thalamus', x: 52, y: 40, desc: 'Relay station for all sensory input (except olfaction). Lateral geniculate body (vision), medial geniculate body (hearing). Thalamic stroke: contralateral sensory loss + pain.' },
            { id: 'hypothal', label: 'Hypothalamus', x: 45, y: 48, desc: 'Controls autonomic NS, pituitary gland, temperature, hunger, thirst, circadian rhythm. Lesion: diabetes insipidus, obesity, temperature dysregulation.' },
        ],
        color: '#b794ff',
    },
    {
        id: 'liver',
        title: 'Liver (Hepatology)',
        category: 'Gastroenterology',
        icon: '🫶',
        structures: [
            { id: 'rl', label: 'Right Lobe', x: 35, y: 40, desc: 'Largest lobe (60-65% of liver mass). Segments V-VIII (Couinaud). Most common site for liver abscess (amoebic). Right hepatectomy: segments V-VIII.' },
            { id: 'll', label: 'Left Lobe', x: 65, y: 35, desc: 'Segments II-IV (Couinaud). Separated from right by falciform ligament (anatomical) and Cantlie\'s line (surgical). Left lateral sectionectomy: segments II-III.' },
            { id: 'pv', label: 'Portal Vein', x: 50, y: 60, desc: 'Formed by SMV + splenic vein behind pancreatic neck. Carries nutrient-rich blood from GI tract. Portal hypertension: >12 mmHg, causes varices, ascites, splenomegaly.' },
            { id: 'ha', label: 'Hepatic Artery', x: 45, y: 55, desc: 'Branch of celiac trunk. Provides 25% blood flow but 50% O2 supply. Hepatic artery thrombosis: major complication post-liver transplant.' },
            { id: 'hv', label: 'Hepatic Veins', x: 50, y: 15, desc: 'Right, middle, left hepatic veins drain into IVC. Budd-Chiari syndrome: hepatic vein thrombosis → ascites, hepatomegaly, abdominal pain.' },
            { id: 'cbd', label: 'Common Bile Duct', x: 55, y: 70, desc: 'Formed by common hepatic duct + cystic duct. Passes behind duodenum (D1), in head of pancreas. Opens at ampulla of Vater. Choledocholithiasis: stone in CBD.' },
            { id: 'gb', label: 'Gallbladder', x: 42, y: 50, desc: 'Pear-shaped, 30-50ml capacity. Fundus, body, neck, cystic duct. Murphy\'s sign positive in cholecystitis. Gallstones: cholesterol (80%) vs pigment (20%).' },
            { id: 'pt', label: 'Portal Triad', x: 50, y: 48, desc: 'Hepatic artery + portal vein + bile duct at porta hepatis. Contained in hepatoduodenal ligament. Pringle maneuver: clamping this to control hepatic bleeding.' },
        ],
        color: '#ffc107',
    },
];

export default function MedicalImagePage() {
    const [selectedDiagram, setSelectedDiagram] = useState(null);
    const [selectedStructure, setSelectedStructure] = useState(null);
    const [hoveredId, setHoveredId] = useState(null);

    // Ask Anything chat
    const [chatMessages, setChatMessages] = useState([]); // [{role:'user'|'ai', text}]
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    const sendAnatomyMessage = async () => {
        if (!chatInput.trim() || chatLoading || !selectedDiagram) return;
        const userMsg = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatLoading(true);
        try {
            const history = chatMessages.slice(-6).map(m => `${m.role === 'user' ? 'Student' : 'Professor'}: ${m.text}`).join('\n');
            const result = await chatCompletion(
                `You are an expert anatomy professor and clinician teaching medical students about ${selectedDiagram.title}. Answer questions accurately, concisely, and with clinical relevance. Reference specific structures of ${selectedDiagram.title} where appropriate.`,
                `${history ? `Previous exchange:\n${history}\n\n` : ''}Student question: "${userMsg}"\n\nAnswer in 3-5 sentences with clinical relevance. Be precise and exam-oriented.`,
                { maxTokens: 400, temperature: 0.3 }
            );
            setChatMessages(prev => [...prev, { role: 'ai', text: result || 'No response.' }]);
        } catch {
            setChatMessages(prev => [...prev, { role: 'ai', text: 'AI unavailable. Please check your API key.' }]);
        }
        setChatLoading(false);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    // Image Upload States
    const [uploadedImage, setUploadedImage] = useState(null); // base64 (no prefix)
    const [uploadedMimeType, setUploadedMimeType] = useState('image/jpeg'); // MIME type for vision API
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null); // object URL for display
    const [aiAnalysis, setAiAnalysis] = useState(null); // { title, parts: [{name, description, clinical}] }
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzeError, setAnalyzeError] = useState('');
    const [imageDragOver, setImageDragOver] = useState(false);
    const [selectedPart, setSelectedPart] = useState(null);
    const imageInputRef = useRef(null);



    // ── Image Upload + AI Analysis ────────────────────────────────
    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const handleImageUpload = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const url = URL.createObjectURL(file);
        setUploadedImageUrl(url);
        setUploadedMimeType(file.type || 'image/jpeg');
        setAiAnalysis(null);
        setAnalyzeError('');
        setSelectedPart(null);
        // Convert to base64 then immediately start analysis
        toBase64(file).then(b64 => {
            setUploadedImage(b64);
            // Auto-analyze as soon as rendering is ready
            setTimeout(() => triggerAnalysis(b64, file.type || 'image/jpeg'), 100);
        });
    };

    // Separated so we can call it with fresh values before state settles
    const triggerAnalysis = async (b64, mime) => {
        setAnalyzing(true);
        setAnalyzeError('');
        setAiAnalysis(null);
        setSelectedPart(null);

        const systemPrompt = `You are an expert medical educator and radiologist.
Analyze the medical image and identify all visible organs and structures.
Respond ONLY with valid JSON. No extra text, no markdown fences.`;

        const userPrompt = `A medical student uploaded this anatomy/radiology image for study.
Identify each clearly visible organ or anatomical structure.

Return ONLY this JSON (no markdown):
{
  "organ": "Name of the main organ/system shown",
  "type": "anatomy | radiology | histology | other",
  "overview": "1-2 sentence overview of what this image shows",
  "parts": [
    {
      "id": 1,
      "name": "Structure name",
      "x": 45,
      "y": 30,
      "description": "What this structure is and its function — 2 sentences",
      "clinical": "Key clinical significance, common pathology, or exam high-yield fact",
      "color": "#00e6b4"
    }
  ]
}

IMPORTANT COORDINATE RULES — READ CAREFULLY:
- x is the horizontal position (0=left edge, 100=right edge)
- y is the vertical position (0=top edge, 100=bottom edge)
- Look at the ACTUAL IMAGE carefully. Identify where each structure physically appears.
- Place the marker dot AT THE CENTER of that structure as it appears in this specific image.
- Example: if the heart appears in the upper-center of the image, x≈50, y≈30.
- Do NOT use generic/average anatomy positions. Use the real pixel positions visible in THIS image.
- Spread markers so they don't overlap. Identify 5-8 visible structures.`;

        try {
            const result = await analyzeImageWithVision(
                b64, mime, systemPrompt, userPrompt,
                { maxTokens: 2000, temperature: 0.2 }
            );
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON in response');
            const parsed = JSON.parse(jsonMatch[0]);
            if (!parsed.parts || parsed.parts.length === 0) throw new Error('No parts identified');
            setAiAnalysis(parsed);
        } catch (err) {
            console.error('[ImageAnalysis]', err);
            setAnalyzeError('AI could not fully analyze this image. Try uploading again or use a clearer image.');
        }
        setAnalyzing(false);
    };



    const handleStructureClick = (structure) => {
        setSelectedStructure(structure);
        setStructureAiDesc('');
    };

    // ── Diagram Selection ────────────────────────────────────
    const [structureAiDesc, setStructureAiDesc] = React.useState('');
    const [structureAiLoading, setStructureAiLoading] = React.useState(false);

    const getStructureAIDesc = async (structure, organ) => {
        setStructureAiLoading(true);
        setStructureAiDesc('');
        try {
            const result = await chatCompletion(
                'You are a senior medical professor. Provide concise, high-yield anatomical and clinical information for MBBS students.',
                `Explain the ${structure.label} (part of ${organ}) in 3-4 sentences. Include: function, blood supply or innervation if relevant, and 1-2 key clinical high-yield pearls. Be accurate and concise.`,
                { maxTokens: 300, temperature: 0.2 }
            );
            setStructureAiDesc(result || 'AI description not available.');
        } catch {
            setStructureAiDesc('Could not load AI description. Check your API key.');
        }
        setStructureAiLoading(false);
    };
    if (!selectedDiagram) {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1>🖼️ Image-Based Medical Learning</h1>
                    <p>Upload your anatomy/radiology image for AI-powered explanations · Or explore our interactive labelled diagrams</p>
                </div>

                {/* ── Image Upload Section ───────────────────── */}
                <div className="glass-card" style={{ padding: '24px', marginBottom: '32px', border: '1px solid rgba(0,230,180,0.2)' }}>
                    <h3 style={{ marginBottom: '8px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📸 Upload Your Medical Image → AI Explains Each Organ/Structure
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                        Upload any anatomy diagram, radiology film (X-ray, CT, MRI), histology slide, or medical textbook figure.
                        AI will identify and explain each visible structure with clinical significance.
                    </p>

                    {!uploadedImageUrl ? (
                        <div
                            className={`glass-card upload-zone${imageDragOver ? ' drag-over' : ''}`}
                            style={{ padding: '40px', textAlign: 'center', cursor: 'pointer', border: '2px dashed rgba(0,230,180,0.3)', background: 'rgba(0,230,180,0.02)', borderRadius: '12px' }}
                            onDragOver={(e) => { e.preventDefault(); setImageDragOver(true); }}
                            onDragLeave={() => setImageDragOver(false)}
                            onDrop={(e) => { e.preventDefault(); setImageDragOver(false); handleImageUpload(e.dataTransfer.files?.[0]); }}
                            onClick={() => imageInputRef.current?.click()}
                        >
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🔬</span>
                            <h4 style={{ marginBottom: '6px' }}>Drop or click to upload medical image</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Supports: JPEG, PNG, WebP, TIFF · X-rays, CT scans, anatomy diagrams, histology slides</p>
                            <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e.target.files?.[0])} />
                        </div>
                    ) : (
                        <div>
                            {/* ── Image with ON-IMAGE overlaid hotspot tooltips ── */}
                            <div style={{ position: 'relative', width: '100%', marginBottom: '12px', lineHeight: 0 }}>
                                <img
                                    src={uploadedImageUrl}
                                    alt="Uploaded medical"
                                    id="uploaded-medical-img"
                                    style={{ width: '100%', maxHeight: '520px', objectFit: 'contain', borderRadius: '12px', border: '1px solid rgba(0,230,180,0.2)', background: '#000', display: 'block' }}
                                />

                                {/* Analysing spinner overlaid on image */}
                                {analyzing && (
                                    <div style={{ position: 'absolute', inset: 0, borderRadius: '12px', background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', zIndex: 20 }}>
                                        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: '2rem' }}>⚙️</span>
                                        <span style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.9rem' }}>AI is identifying structures…</span>
                                    </div>
                                )}

                                {/* Numbered hotspot buttons ON the image */}
                                {aiAnalysis && aiAnalysis.parts.map((part, i) => {
                                    const px = Math.min(Math.max(part.x ?? 50, 4), 94);
                                    const py = Math.min(Math.max(part.y ?? 50, 4), 92);
                                    const isSelected = selectedPart === i;
                                    // Label goes right if dot is in left 55% of image, otherwise left
                                    const labelRight = px <= 55;

                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                position: 'absolute',
                                                left: `${px}%`,
                                                top: `${py}%`,
                                                transform: 'translate(-50%, -50%)',
                                                zIndex: isSelected ? 30 : 10,
                                            }}
                                        >
                                            {/* Dot button */}
                                            <button
                                                onClick={() => setSelectedPart(isSelected ? null : i)}
                                                title={part.name}
                                                style={{
                                                    width: isSelected ? '32px' : '26px',
                                                    height: isSelected ? '32px' : '26px',
                                                    borderRadius: '50%',
                                                    background: part.color || '#00e6b4',
                                                    color: '#000',
                                                    fontWeight: 800,
                                                    fontSize: '0.72rem',
                                                    border: isSelected ? '3px solid #fff' : '2px solid rgba(255,255,255,0.85)',
                                                    cursor: 'pointer',
                                                    boxShadow: isSelected
                                                        ? `0 0 0 4px ${part.color || '#00e6b4'}44, 0 4px 16px rgba(0,0,0,0.8)`
                                                        : '0 2px 8px rgba(0,0,0,0.7)',
                                                    transition: 'all 0.18s ease',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    animation: isSelected ? 'none' : 'pulse 2s infinite',
                                                    position: 'relative', zIndex: 2,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {i + 1}
                                            </button>

                                            {/* Always-visible name label pill + leader line */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                ...(labelRight
                                                    ? { left: 'calc(100% + 6px)' }
                                                    : { right: 'calc(100% + 6px)' }),
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                pointerEvents: 'none',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {/* Short leader line */}
                                                <div style={{
                                                    width: '10px',
                                                    height: '1.5px',
                                                    background: part.color || '#00e6b4',
                                                    opacity: 0.8,
                                                    order: labelRight ? 0 : 1,
                                                }} />
                                                {/* Name pill */}
                                                <div style={{
                                                    background: 'rgba(8,12,26,0.88)',
                                                    border: `1px solid ${part.color || '#00e6b4'}`,
                                                    borderRadius: '20px',
                                                    padding: '3px 9px',
                                                    fontSize: '0.68rem',
                                                    fontWeight: 700,
                                                    color: part.color || '#00e6b4',
                                                    backdropFilter: 'blur(4px)',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                                                    letterSpacing: '0.01em',
                                                    order: labelRight ? 1 : 0,
                                                }}>
                                                    {part.name}
                                                </div>
                                            </div>

                                            {/* Floating tooltip card ON the image (shown on click) */}
                                            {isSelected && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 'calc(100% + 10px)',
                                                    ...(labelRight
                                                        ? { left: '0' }
                                                        : { right: '0' }),
                                                    width: '240px',
                                                    background: 'rgba(10,15,30,0.97)',
                                                    border: `1.5px solid ${part.color || '#00e6b4'}`,
                                                    borderRadius: '12px',
                                                    padding: '14px',
                                                    boxShadow: `0 8px 32px rgba(0,0,0,0.85), 0 0 0 1px ${part.color || '#00e6b4'}22`,
                                                    backdropFilter: 'blur(10px)',
                                                    animation: 'fadeIn 0.18s ease',
                                                    lineHeight: '1.5',
                                                    zIndex: 50,
                                                }}>
                                                    {/* Close + title */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '6px' }}>
                                                        <strong style={{ fontSize: '0.88rem', color: part.color || 'var(--accent-primary)', flex: 1, lineHeight: 1.3 }}>
                                                            📍 {part.name}
                                                        </strong>
                                                        <button onClick={() => setSelectedPart(null)}
                                                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.9rem', padding: '0', lineHeight: 1, flexShrink: 0, pointerEvents: 'auto' }}>✕</button>
                                                    </div>
                                                    {/* Description */}
                                                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.84)', lineHeight: 1.6, marginBottom: '8px' }}>
                                                        {part.description}
                                                    </p>
                                                    {/* Clinical pearl */}
                                                    <div style={{ padding: '8px 10px', background: 'rgba(114,137,255,0.12)', borderRadius: '7px', borderLeft: `3px solid ${part.color || 'var(--accent-secondary)'}` }}>
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-secondary)', display: 'block', marginBottom: '3px' }}>🩺 CLINICAL PEARL</span>
                                                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.76)', lineHeight: 1.5 }}>{part.clinical}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Action row */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center', lineHeight: 'initial' }}>
                                {aiAnalysis && (
                                    <button className="btn btn-sm btn-outline" onClick={() => triggerAnalysis(uploadedImage, uploadedMimeType)} disabled={analyzing}>
                                        🔄 Re-analyze
                                    </button>
                                )}
                                <button className="btn btn-sm btn-outline" onClick={() => { setUploadedImageUrl(null); setUploadedImage(null); setAiAnalysis(null); setAnalyzeError(''); setSelectedPart(null); }}>
                                    📁 Upload New Image
                                </button>
                                {analyzeError && (
                                    <span style={{ color: 'var(--accent-danger)', fontSize: '0.82rem' }}>⚠️ {analyzeError}</span>
                                )}
                            </div>

                            {/* Structure legend pills below the image (click to jump to dot) */}
                            {aiAnalysis && (
                                <div>
                                    {aiAnalysis.overview && (
                                        <div style={{ marginBottom: '10px', padding: '9px 14px', background: 'rgba(0,230,180,0.05)', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                            <strong style={{ color: 'var(--accent-primary)' }}>🔬 {aiAnalysis.organ}</strong>{' · '}{aiAnalysis.overview}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {aiAnalysis.parts.map((p, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedPart(selectedPart === i ? null : i)}
                                                style={{
                                                    cursor: 'pointer', fontSize: '0.76rem', padding: '4px 11px', borderRadius: '16px',
                                                    background: selectedPart === i ? (p.color || 'var(--accent-primary)') : 'rgba(255,255,255,0.04)',
                                                    border: `1.5px solid ${p.color || 'rgba(0,230,180,0.4)'}`,
                                                    color: selectedPart === i ? '#000' : (p.color || 'var(--accent-primary)'),
                                                    fontWeight: 600, transition: 'all 0.2s',
                                                }}
                                            >
                                                {i + 1}. {p.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Static Diagrams */}
                <h3 style={{ marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
                    📚 Interactive Labelled Diagrams:
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {MEDICAL_DIAGRAMS.map((diagram) => (
                        <div
                            key={diagram.id}
                            className="glass-card clinical-case-card"
                            style={{ cursor: 'pointer', padding: '28px', textAlign: 'center' }}
                            onClick={() => setSelectedDiagram(diagram)}
                        >
                            <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '12px' }}>{diagram.icon}</span>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{diagram.title}</h3>
                            <span className="badge badge-primary">{diagram.category}</span>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '12px' }}>
                                {diagram.structures.length} labelled structures
                            </p>
                        </div>
                    ))}
                </div>


            </div>
        );
    }

    // ── Interactive Diagram View ─────────────────────────────
    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>{selectedDiagram.icon} {selectedDiagram.title}</h1>
                <p>Click on any labelled structure to learn more</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
                {/* SVG Diagram */}
                <div className="glass-card" style={{ padding: '20px', position: 'relative' }}>
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '500px', borderRadius: '12px' }}>
                        {/* Background gradient */}
                        <defs>
                            <radialGradient id={`grad-${selectedDiagram.id}`} cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor={selectedDiagram.color} stopOpacity="0.08" />
                                <stop offset="100%" stopColor="transparent" />
                            </radialGradient>
                        </defs>
                        <rect x="0" y="0" width="100" height="100" fill={`url(#grad-${selectedDiagram.id})`} rx="4" />

                        {/* Organ outline (simplified) */}
                        <text x="50" y="50" textAnchor="middle" fill={selectedDiagram.color} fontSize="8" opacity="0.15" fontWeight="bold">
                            {selectedDiagram.icon}
                        </text>

                        {/* Structure labels */}
                        {selectedDiagram.structures.map((s) => {
                            const isSelected = selectedStructure?.id === s.id;
                            const isHovered = hoveredId === s.id;
                            return (
                                <g key={s.id}
                                    onClick={() => handleStructureClick(s)}
                                    onMouseEnter={() => setHoveredId(s.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {/* Dot */}
                                    <circle
                                        cx={s.x} cy={s.y} r={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                                        fill={isSelected ? '#00e6b4' : selectedDiagram.color}
                                        opacity={isSelected ? 1 : 0.8}
                                    >
                                        {isSelected && <animate attributeName="r" values="2;3;2" dur="1.5s" repeatCount="indefinite" />}
                                    </circle>
                                    {/* Leader line */}
                                    <line
                                        x1={s.x} y1={s.y}
                                        x2={s.x + (s.x > 50 ? 4 : -4)} y2={s.y - 3}
                                        stroke={isSelected ? '#00e6b4' : selectedDiagram.color}
                                        strokeWidth="0.3" opacity="0.6"
                                    />
                                    {/* Label background */}
                                    <rect
                                        x={s.x > 50 ? s.x + 3 : s.x - 25}
                                        y={s.y - 6}
                                        width="22" height="5" rx="1.5"
                                        fill={isSelected ? 'rgba(0,230,180,0.2)' : isHovered ? 'rgba(114,137,255,0.15)' : 'rgba(10,15,26,0.7)'}
                                        stroke={isSelected ? '#00e6b4' : isHovered ? selectedDiagram.color : 'transparent'}
                                        strokeWidth="0.3"
                                    />
                                    {/* Label text */}
                                    <text
                                        x={s.x > 50 ? s.x + 14 : s.x - 14}
                                        y={s.y - 2.5}
                                        textAnchor="middle"
                                        fill={isSelected ? '#00e6b4' : isHovered ? '#fff' : '#8a94b8'}
                                        fontSize="2.2"
                                        fontWeight={isSelected ? 'bold' : 'normal'}
                                    >
                                        {s.label}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Info Panel */}
                <div>
                    {selectedStructure ? (
                        <div className="glass-card" style={{ padding: '24px', borderLeft: `4px solid ${selectedDiagram.color}` }}>
                            <h3 style={{ color: selectedDiagram.color, marginBottom: '12px', fontSize: '1.2rem' }}>
                                📍 {selectedStructure.label}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px' }}>
                                {selectedStructure.desc}
                            </p>

                            {/* AI Description */}
                            {!structureAiDesc && !structureAiLoading && (
                                <button className="btn btn-sm btn-outline" onClick={() => getStructureAIDesc(selectedStructure, selectedDiagram.title)}>
                                    🤖 Get AI Description
                                </button>
                            )}
                            {structureAiLoading && (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span> Generating…
                                </div>
                            )}
                            {structureAiDesc && (
                                <div style={{ marginTop: '12px', padding: '14px', background: 'rgba(0,230,180,0.06)', borderRadius: '10px', borderLeft: '3px solid var(--accent-primary)' }}>
                                    <strong style={{ color: 'var(--accent-primary)', fontSize: '0.85rem' }}>🤖 AI Description:</strong>
                                    <p style={{ marginTop: '6px', color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.9rem' }}>{structureAiDesc}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>👆</span>
                            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Select a Structure</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Click on any label in the diagram to view its description and clinical significance.
                            </p>
                        </div>
                    )}

                    {/* All Structures List */}
                    <div className="glass-card" style={{ padding: '20px', marginTop: '16px' }}>
                        <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>📋 All Structures</h4>
                        <div style={{ display: 'grid', gap: '6px', maxHeight: '250px', overflowY: 'auto' }}>
                            {selectedDiagram.structures.map((s) => (
                                <div
                                    key={s.id}
                                    style={{
                                        padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem',
                                        background: selectedStructure?.id === s.id ? 'rgba(0,230,180,0.1)' : 'rgba(255,255,255,0.02)',
                                        color: selectedStructure?.id === s.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        border: selectedStructure?.id === s.id ? '1px solid rgba(0,230,180,0.3)' : '1px solid transparent',
                                    }}
                                    onClick={() => handleStructureClick(s)}
                                >
                                    📍 {s.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ask Anything Chat Panel */}
            <div className="glass-card" style={{ padding: '24px', marginTop: '28px', borderTop: '2px solid rgba(0,230,180,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '1.3rem' }}>🤖</span>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--accent-primary)' }}>Ask Anything — {selectedDiagram.title}</h3>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ask any question about this organ, its structures, diseases, or clinical relevance</p>
                    </div>
                </div>

                {/* Chat messages */}
                <div style={{ display: 'grid', gap: '10px', maxHeight: '320px', overflowY: 'auto', marginBottom: '14px', paddingRight: '4px' }}>
                    {chatMessages.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px', fontSize: '0.85rem' }}>
                            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '8px' }}>💬</span>
                            Try asking: "What are common diseases of this organ?", "Explain the blood supply", "What are the exam high-yield facts?"
                        </div>
                    )}
                    {chatMessages.map((msg, i) => (
                        <div key={i} style={{
                            display: 'flex', gap: '10px',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                        }}>
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                                background: msg.role === 'user' ? 'var(--accent-secondary)' : 'var(--accent-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem',
                            }}>
                                {msg.role === 'user' ? '👤' : '🤖'}
                            </div>
                            <div style={{
                                maxWidth: '80%', padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem', lineHeight: 1.65,
                                background: msg.role === 'user' ? 'rgba(114,137,255,0.1)' : 'rgba(0,230,180,0.06)',
                                border: msg.role === 'user' ? '1px solid rgba(114,137,255,0.2)' : '1px solid rgba(0,230,180,0.15)',
                                color: 'var(--text-secondary)',
                            }}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {chatLoading && (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>🤖</div>
                            <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(0,230,180,0.06)', border: '1px solid rgba(0,230,180,0.15)', display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--accent-primary)', fontSize: '0.82rem' }}>
                                <span style={{ animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>⚙️</span> Thinking…
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Chat input */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        className="input-field"
                        style={{ flex: 1, padding: '10px 16px', fontSize: '0.9rem' }}
                        placeholder={`Ask about ${selectedDiagram.title}... (e.g. blood supply, common diseases, exam facts)`}
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendAnatomyMessage()}
                        disabled={chatLoading}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={sendAnatomyMessage}
                        disabled={chatLoading || !chatInput.trim()}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {chatLoading ? '⏳' : '📤 Ask'}
                    </button>
                    {chatMessages.length > 0 && (
                        <button className="btn btn-sm btn-outline" onClick={() => setChatMessages([])} title="Clear chat">
                            🗑️
                        </button>
                    )}
                </div>
            </div>

            {/* Back button */}
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <button className="btn btn-secondary" onClick={() => { setSelectedDiagram(null); setSelectedStructure(null); }}>
                    ← All Diagrams
                </button>
            </div>
        </div>
    );
}
