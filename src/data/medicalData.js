// ═══════════════════════════════════════════════════════════════
// MedGenius — Medical Knowledge Base
// Rich pre-built content for demonstration topics
// ═══════════════════════════════════════════════════════════════

const medicalTopics = {

    "myocardial infarction": {
        title: "Myocardial Infarction (MI)",
        category: "Cardiology",
        sections: {
            definition: "Myocardial Infarction (MI) is defined as **myocardial cell death (necrosis)** due to prolonged ischemia resulting from an acute imbalance between myocardial oxygen supply and demand. It is characterized by elevated cardiac biomarkers (troponin) with at least one of the following: symptoms of ischemia, new ST-T changes or LBBB, development of pathological Q waves, or imaging evidence of new loss of viable myocardium.",
            etiology: [
                "**Atherosclerotic plaque rupture** — Most common cause (~90% of cases). Erosion or rupture of a vulnerable plaque in coronary arteries leads to thrombus formation",
                "**Coronary artery spasm** (Prinzmetal's angina) — Vasospasm causing transient occlusion",
                "**Coronary embolism** — From atrial fibrillation, endocarditis, or prosthetic valves",
                "**Coronary artery dissection** — Spontaneous or traumatic",
                "**Vasculitis** — Kawasaki disease, Takayasu arteritis, polyarteritis nodosa",
                "**Cocaine/Amphetamine use** — Causes intense vasoconstriction and increased oxygen demand",
                "**Severe anemia or hypotension** — Type 2 MI (supply-demand mismatch)"
            ],
            pathophysiology: [
                "Atherosclerotic plaque with a thin fibrous cap ruptures → exposure of **thrombogenic lipid core** and subendothelial collagen",
                "**Platelet adhesion and activation** → glycoprotein IIb/IIIa receptor activation → platelet aggregation",
                "**Coagulation cascade activation** → thrombin generation → fibrin mesh → occlusive thrombus",
                "Complete coronary occlusion → **transmural ischemia** (STEMI) or partial occlusion → subendocardial ischemia (NSTEMI)",
                "Ischemia progresses from **subendocardium to epicardium** (wavefront phenomenon — Reimer & Jennings)",
                "Irreversible myocardial necrosis begins within **20–40 minutes** of sustained ischemia",
                "**Coagulative necrosis** → inflammatory response → granulation tissue → fibrosis/scar (over 6–8 weeks)",
                "Complications depend on extent: LV dysfunction, arrhythmias, cardiogenic shock, rupture"
            ],
            clinicalFeatures: [
                "**Chest pain** — Severe, crushing, substernal/retrosternal, radiating to left arm, jaw, neck, or epigastrium. Lasts >20 minutes. Not relieved by rest or sublingual nitroglycerin",
                "**Diaphoresis** (profuse sweating) — Due to sympathetic activation",
                "**Nausea/Vomiting** — Especially in inferior MI (vagal stimulation)",
                "**Dyspnea** — Due to left ventricular dysfunction and pulmonary congestion",
                "**Anxiety** and feeling of impending doom (angor animi)",
                "**Tachycardia or bradycardia** — Depends on location and autonomic response",
                "**Hypotension** — Especially in large infarcts or right ventricular MI",
                "**S3/S4 gallop** — S4 due to reduced LV compliance, S3 due to LV failure",
                "**Silent MI** — Common in diabetics (autonomic neuropathy), elderly, and women"
            ],
            diagnosis: [
                "**ECG (12-lead)** — First-line investigation:\n  • STEMI: ST elevation ≥1mm in limb leads or ≥2mm in chest leads, new LBBB\n  • NSTEMI: ST depression, T-wave inversion, or no acute changes\n  • Hyperacute T waves (earliest sign), pathological Q waves (late sign of transmural necrosis)",
                "**Cardiac biomarkers:**\n  • **Troponin I/T** — Gold standard. Rises in 3–4 hours, peaks at 24 hours, remains elevated for 7–14 days\n  • **CK-MB** — Rises in 4–6 hours, peaks at 24 hours, normalizes by 48–72 hours (useful for detecting re-infarction)\n  • **Myoglobin** — Earliest marker (1–2 hours) but non-specific\n  • **LDH** — Late marker, peaks at 3–4 days",
                "**Echocardiography** — Regional wall motion abnormalities, LV function assessment (EF)",
                "**Coronary angiography** — Gold standard for identifying culprit vessel; enables immediate PCI",
                "**Chest X-ray** — To rule out other causes and detect pulmonary edema"
            ],
            management: [
                "**Immediate (MONA protocol modified):**\n  • **Morphine** — For pain relief (use with caution)\n  • **Oxygen** — Only if SpO₂ <94%\n  • **Nitroglycerin** — Sublingual/IV (contraindicated in RV infarct, hypotension)\n  • **Aspirin** — 325mg chewed immediately (antiplatelet)",
                "**Antiplatelet therapy:**\n  • Dual antiplatelet: Aspirin + P2Y12 inhibitor (Clopidogrel/Ticagrelor/Prasugrel)\n  • GP IIb/IIIa inhibitors (Abciximab, Eptifibatide) — in high-risk PCI",
                "**Anticoagulation:** Heparin (UFH or LMWH — Enoxaparin)",
                "**Reperfusion therapy (for STEMI):**\n  • **Primary PCI** — Gold standard if available within 90 min (door-to-balloon time)\n  • **Fibrinolysis** — If PCI not available within 120 min. Agents: Streptokinase, Alteplase (tPA), Tenecteplase\n  • Door-to-needle time: <30 minutes",
                "**Long-term management (secondary prevention):**\n  • **ACE inhibitors/ARBs** — Prevent remodeling (especially if EF <40%)\n  • **Beta-blockers** — Metoprolol, Carvedilol (reduce mortality)\n  • **Statins** — High-intensity (Atorvastatin 80mg)\n  • **Dual antiplatelet therapy** — For at least 12 months\n  • **Cardiac rehabilitation** — Exercise, lifestyle modification"
            ]
        },
        highYieldPoints: [
            "Troponin is the GOLD STANDARD biomarker for MI diagnosis",
            "CK-MB is preferred for detecting RE-INFARCTION (normalizes by 72 hrs)",
            "Door-to-balloon time for primary PCI: <90 minutes",
            "Door-to-needle time for fibrinolysis: <30 minutes",
            "Aspirin should be given to ALL patients (unless truly allergic)",
            "RV infarct → Avoid nitrates and diuretics (preload dependent)",
            "Killip Classification grades severity of heart failure post-MI",
            "Dressler syndrome: Post-MI pericarditis occurring 2–10 weeks after MI (autoimmune)",
            "Most common cause of death in first 24 hrs: Ventricular fibrillation",
            "Most common cause of death after 24 hrs: Cardiogenic shock"
        ],
        examFAQs: [
            "Differentiate between STEMI and NSTEMI based on ECG and biomarkers",
            "Enumerate the complications of MI (early and late)",
            "Describe the reperfusion strategies for STEMI",
            "What is Dressler syndrome? Explain its pathogenesis and management",
            "Draw and label the coronary artery anatomy and common sites of occlusion",
            "Describe the Killip classification system"
        ],
        quiz: [
            {
                question: "Which cardiac biomarker is considered the GOLD STANDARD for diagnosing acute myocardial infarction?",
                options: ["CK-MB", "Myoglobin", "Troponin I/T", "LDH"],
                correct: 2,
                difficulty: "easy",
                explanations: {
                    correct: "Troponin I/T is the gold standard due to high sensitivity and specificity for myocardial injury. It rises 3-4 hours after onset and remains elevated for 7-14 days.",
                    wrong: {
                        0: "CK-MB is useful but less specific than troponin. It is preferred for detecting re-infarction as it normalizes by 48-72 hours.",
                        1: "Myoglobin is the earliest marker to rise (1-2 hours) but is non-specific — it is also released from skeletal muscle injury.",
                        3: "LDH is a late marker (peaks at 3-4 days) and is non-specific. It is rarely used for MI diagnosis now."
                    }
                }
            },
            {
                question: "A 55-year-old male presents with severe chest pain for 45 minutes. ECG shows ST elevation in leads II, III, and aVF. Which coronary artery is most likely occluded?",
                options: ["Left anterior descending (LAD)", "Left circumflex (LCx)", "Right coronary artery (RCA)", "Left main coronary artery"],
                correct: 2,
                difficulty: "moderate",
                explanations: {
                    correct: "ST elevation in leads II, III, and aVF indicates an INFERIOR MI, which is most commonly caused by occlusion of the Right Coronary Artery (RCA). The RCA supplies the inferior wall of the left ventricle and the AV node in 85% of people.",
                    wrong: {
                        0: "LAD occlusion causes ANTERIOR MI → ST elevation in V1-V4 (and possibly V5-V6).",
                        1: "LCx occlusion causes LATERAL MI → ST elevation in leads I, aVL, V5-V6.",
                        3: "Left main occlusion causes widespread ST elevation/depression with hemodynamic compromise — this is catastrophic and usually fatal without immediate intervention."
                    }
                }
            },
            {
                question: "What is the recommended door-to-balloon time for primary PCI in STEMI?",
                options: ["<30 minutes", "<60 minutes", "<90 minutes", "<120 minutes"],
                correct: 2,
                difficulty: "easy",
                explanations: {
                    correct: "The recommended door-to-balloon time for primary PCI is <90 minutes. This is a quality metric for STEMI management. Faster reperfusion = more myocardium saved.",
                    wrong: {
                        0: "<30 minutes is the target for door-to-needle time (fibrinolysis), not PCI.",
                        1: "60 minutes is not the standard ACC/AHA guideline recommendation.",
                        3: "120 minutes is the maximum acceptable time for PCI when transfer from a non-PCI capable hospital is needed."
                    }
                }
            },
            {
                question: "A patient with acute inferior STEMI develops hypotension and clear lung fields. Which of the following should be AVOIDED?",
                options: ["IV normal saline", "Dobutamine", "Sublingual nitroglycerin", "Aspirin"],
                correct: 2,
                difficulty: "clinical",
                explanations: {
                    correct: "Nitroglycerin (and diuretics) should be AVOIDED in right ventricular infarction. RV infarct is preload-dependent — nitrates reduce preload and can cause severe hypotension. The triad of hypotension + clear lungs + elevated JVP suggests RV involvement.",
                    wrong: {
                        0: "IV normal saline is the FIRST-LINE treatment for RV infarct to maintain preload.",
                        1: "Dobutamine may be used if volume resuscitation fails to improve hemodynamics.",
                        3: "Aspirin should be given to ALL MI patients (unless documented severe allergy)."
                    }
                }
            },
            {
                question: "Dressler syndrome is characterized by which of the following?",
                options: [
                    "Ventricular fibrillation within 24 hours of MI",
                    "Autoimmune pericarditis occurring 2-10 weeks post-MI",
                    "Acute mitral regurgitation due to papillary muscle rupture",
                    "Left ventricular free wall rupture within 5 days"
                ],
                correct: 1,
                difficulty: "moderate",
                explanations: {
                    correct: "Dressler syndrome (Post-myocardial infarction syndrome) is an autoimmune-mediated pericarditis that occurs 2-10 weeks after MI. It presents with fever, pleuritic chest pain, pericardial effusion, and elevated ESR. It is caused by antimyocardial antibodies. Treated with NSAIDs/Aspirin and colchicine.",
                    wrong: {
                        0: "Ventricular fibrillation is the most common cause of death within the first 24 hours of MI but is not Dressler syndrome.",
                        2: "Papillary muscle rupture (usually posteromedial) causes acute MR, typically 3-5 days post-MI.",
                        3: "Free wall rupture causes cardiac tamponade, typically 3-7 days post-MI, and is usually fatal."
                    }
                }
            },
            {
                question: "Which is the EARLIEST change seen on ECG during acute myocardial infarction?",
                options: ["ST elevation", "Pathological Q waves", "Hyperacute T waves", "T wave inversion"],
                correct: 2,
                difficulty: "easy",
                explanations: {
                    correct: "Hyperacute (tall, peaked, broad-based) T waves are the EARLIEST ECG finding in acute MI, appearing within minutes. They represent subendocardial ischemia. They are often missed and can precede ST elevation.",
                    wrong: {
                        0: "ST elevation develops AFTER hyperacute T waves, typically within 30-60 minutes, and indicates transmural injury.",
                        1: "Pathological Q waves are a LATE finding (hours to days), indicating established transmural necrosis. They are often permanent.",
                        3: "T wave inversion develops during the evolution phase and can persist for months. It indicates ischemia rather than acute injury."
                    }
                }
            },
            {
                question: "Which class of drugs has been shown to reduce mortality in post-MI patients with reduced ejection fraction?",
                options: ["Calcium channel blockers", "ACE inhibitors", "Antiarrhythmic drugs (Class IC)", "NSAIDs"],
                correct: 1,
                difficulty: "moderate",
                explanations: {
                    correct: "ACE inhibitors (e.g., Ramipril, Enalapril) reduce mortality in post-MI patients, especially those with EF <40%. They prevent adverse ventricular remodeling, reduce afterload, and decrease neurohormonal activation. ARBs are an alternative if ACE-I intolerant.",
                    wrong: {
                        0: "Non-dihydropyridine CCBs (Verapamil, Diltiazem) may be used in NSTEMI without LV dysfunction, but they do NOT reduce mortality like ACE-I.",
                        2: "Class IC antiarrhythmics (Flecainide, Encainide) are CONTRAINDICATED post-MI due to increased mortality (CAST trial).",
                        3: "NSAIDs (except aspirin) should be AVOIDED post-MI as they increase risk of re-infarction, hypertension, and fluid retention."
                    }
                }
            },
            {
                question: "In the Killip classification, Class III corresponds to which clinical finding?",
                options: ["No evidence of heart failure", "Rales/crackles in <50% of lung fields", "Acute pulmonary edema", "Cardiogenic shock"],
                correct: 2,
                difficulty: "clinical",
                explanations: {
                    correct: "Killip Class III = Acute pulmonary edema (frank pulmonary edema with rales >50% lung fields). Killip I = No HF, Killip II = Mild HF (rales <50%), Killip III = Pulmonary edema, Killip IV = Cardiogenic shock.",
                    wrong: {
                        0: "No evidence of heart failure = Killip Class I (mortality ~6%).",
                        1: "Rales in <50% of lung fields = Killip Class II (mortality ~17%).",
                        3: "Cardiogenic shock = Killip Class IV (mortality ~60-80%)."
                    }
                }
            }
        ],
        flashcards: [
            { front: "What is the gold standard biomarker for MI?", back: "**Troponin I/T** — Rises at 3-4 hrs, peaks at 24 hrs, elevated for 7-14 days. Most sensitive and specific marker.", category: "definitions" },
            { front: "What is the door-to-balloon time for primary PCI?", back: "**< 90 minutes** from hospital arrival to first balloon inflation during coronary angioplasty in STEMI.", category: "definitions" },
            { front: "What is the Wavefront Phenomenon?", back: "**Reimer & Jennings concept:** Ischemic necrosis progresses from subendocardium → subepicardium over time. Early reperfusion saves epicardial myocardium.", category: "pathways" },
            { front: "Aspirin in MI: Mechanism of action?", back: "**Irreversibly inhibits cyclooxygenase-1 (COX-1)** → blocks Thromboxane A2 synthesis → inhibits platelet aggregation. Dose: 325mg chewed stat.", category: "drugs" },
            { front: "Drug contraindicated in Right Ventricular MI?", back: "**Nitroglycerin and Diuretics** — RV infarct is preload-dependent. Reducing preload → severe hypotension. Treat with IV fluids.", category: "drugs" },
            { front: "Dressler Syndrome: What and When?", back: "**Autoimmune pericarditis** occurring **2-10 weeks post-MI**. Due to antimyocardial antibodies. Features: fever, pleuritic pain, pericardial effusion, ↑ESR. Rx: NSAIDs + Colchicine.", category: "clinical" },
            { front: "Killip Classification: Class IV?", back: "**Cardiogenic Shock** — Hypotension (SBP <90), signs of hypoperfusion (oliguria, confusion, cold extremities). Mortality: 60-80%.", category: "clinical" },
            { front: "Earliest ECG change in acute MI?", back: "**Hyperacute T waves** — Tall, peaked, broad-based T waves appearing within minutes. Precede ST elevation. Often missed!", category: "definitions" },
            { front: "STEMI vs NSTEMI: Key difference?", back: "**STEMI**: Complete coronary occlusion → transmural ischemia → ST elevation on ECG. **NSTEMI**: Partial occlusion → subendocardial ischemia → ST depression/T inversion/no changes.", category: "clinical" },
            { front: "P2Y12 Inhibitors: Name 3 drugs", back: "**Clopidogrel** (prodrug, CYP2C19), **Ticagrelor** (reversible, no prodrug conversion), **Prasugrel** (irreversible, fastest onset). Used with Aspirin as DAPT for 12 months.", category: "drugs" }
        ],
        examTips: {
            importantTopics: ["ECG interpretation in MI", "Cardiac biomarkers timeline", "STEMI reperfusion strategies", "MI complications (early vs late)", "Secondary prevention after MI"],
            confusedConcepts: [
                "STEMI vs NSTEMI — STEMI requires emergent reperfusion, NSTEMI does not",
                "Door-to-balloon (90 min) vs Door-to-needle (30 min)",
                "CK-MB (re-infarction) vs Troponin (initial diagnosis)",
                "Inferior MI (II, III, aVF, RCA) vs Anterior MI (V1-V4, LAD)",
                "Type 1 MI (plaque rupture) vs Type 2 MI (supply-demand mismatch)"
            ],
            answerWritingTips: {
                "5marks": "Cover definition, 3-4 key points of pathophysiology, and main management.",
                "10marks": "Include definition, etiology, pathophysiology with mechanism, clinical features (5-6 points), diagnosis (ECG + biomarkers), and management (immediate + long term).",
                "15marks": "Comprehensive: definition, detailed etiology, step-by-step pathophysiology, complete clinical features including atypical presentations, all diagnostic modalities, detailed management protocol including MONA, reperfusion, secondary prevention, and complications."
            }
        },
        doubtResponses: {
            "complications": "**Complications of MI:**\n\n**Early (within 24-48 hrs):**\n• Arrhythmias (VF most common cause of death)\n• Acute heart failure / Cardiogenic shock\n• Pericarditis (within 24-72 hrs)\n\n**Late (days to weeks):**\n• Ventricular free wall rupture (3-7 days) → tamponade\n• VSD (3-5 days) → new pansystolic murmur\n• Papillary muscle rupture → acute mitral regurgitation\n• Left ventricular aneurysm\n• Mural thrombus → systemic embolization\n• Dressler syndrome (2-10 weeks)",
            "default": "That's a great question! In the context of Myocardial Infarction, the key principles to remember are:\n\n1. **Time is muscle** — earlier reperfusion saves more myocardium\n2. **Risk stratification** is crucial (TIMI score, GRACE score)\n3. **Secondary prevention** reduces recurrence and mortality\n\nWould you like me to elaborate on any specific aspect?"
        }
    },

    "pneumonia": {
        title: "Pneumonia",
        category: "Pulmonology",
        sections: {
            definition: "Pneumonia is an **acute infection of the lung parenchyma** (alveoli and terminal bronchioles) causing inflammation and consolidation. It is characterized by fever, cough, dyspnea, and a new infiltrate on chest X-ray. It remains a leading cause of morbidity and mortality worldwide, especially in children <5 years and elderly >65 years.",
            etiology: [
                "**Community-Acquired Pneumonia (CAP):**\n  • *Streptococcus pneumoniae* — Most common cause overall (rusty sputum)\n  • *Haemophilus influenzae* — Common in COPD patients\n  • *Mycoplasma pneumoniae* — Most common atypical organism (young adults, 'walking pneumonia')\n  • *Legionella pneumophila* — Air conditioning, hyponatremia, GI symptoms\n  • *Staphylococcus aureus* — Post-influenza pneumonia\n  • *Klebsiella pneumoniae* — Alcoholics, currant-jelly sputum",
                "**Hospital-Acquired Pneumonia (HAP):** Occurs ≥48 hrs after admission\n  • MRSA, *Pseudomonas aeruginosa*, *Acinetobacter*, Gram-negative bacilli",
                "**Aspiration Pneumonia:** Anaerobes (*Bacteroides*, *Fusobacterium*), often in right lower lobe",
                "**Viral:** Influenza, RSV, SARS-CoV-2, Adenovirus",
                "**Fungal:** *Pneumocystis jirovecii* (HIV/AIDS, CD4 <200), *Aspergillus*, *Histoplasma*"
            ],
            pathophysiology: [
                "Microorganism reaches lower respiratory tract via **inhalation, aspiration, or hematogenous spread**",
                "Organisms overcome pulmonary defense mechanisms (mucociliary clearance, alveolar macrophages, IgA)",
                "**Stage 1 — Congestion (Day 1-2):** Vascular engorgement, serous exudate in alveoli, rapid bacterial multiplication",
                "**Stage 2 — Red Hepatization (Day 2-4):** Alveoli filled with RBCs, neutrophils, fibrin → lung becomes firm and red (liver-like)",
                "**Stage 3 — Grey Hepatization (Day 4-8):** RBC lysis, persistent fibrin and neutrophils → grey-brown appearance",
                "**Stage 4 — Resolution (Day 8+):** Enzymatic digestion of exudate, macrophage cleanup → restoration of normal architecture"
            ],
            clinicalFeatures: [
                "**Typical pneumonia:** High fever with chills/rigors, productive cough (purulent/rusty sputum), pleuritic chest pain, dyspnea, tachypnea",
                "**Atypical pneumonia:** Gradual onset, low-grade fever, dry cough, headache, myalgia, extrapulmonary manifestations (Mycoplasma — bullous myringitis; Legionella — diarrhea, confusion)",
                "**Signs:** Tachypnea, tachycardia, decreased breath sounds, bronchial breathing over consolidated area, dullness on percussion, increased vocal fremitus, egophony, crackles/crepitations",
                "**In elderly:** May present with confusion, falls, or functional decline without classical features",
                "**In children:** Tachypnea is the most reliable clinical sign (WHO criteria)"
            ],
            diagnosis: [
                "**Chest X-ray** — Gold standard for diagnosis:\n  • Lobar/segmental consolidation (typical)\n  • Diffuse bilateral infiltrates (atypical, PCP)\n  • Cavitation (Staph, Klebsiella, TB, anaerobes)",
                "**Sputum culture and Gram stain** — Before starting antibiotics (if possible)",
                "**Blood cultures** — In hospitalized patients (positive in ~10-20%)",
                "**CBC** — Leukocytosis with neutrophilia (bacterial); lymphocytosis or normal (viral/atypical)",
                "**CRP and Procalcitonin** — Procalcitonin helps differentiate bacterial vs viral",
                "**Urinary antigen tests** — For Legionella and Pneumococcal pneumonia",
                "**CURB-65 score** — Severity assessment: Confusion, Urea >7, RR ≥30, BP <90/60, Age ≥65. Score ≥3 → ICU"
            ],
            management: [
                "**Outpatient (CURB-65: 0-1):**\n  • Previously healthy: Amoxicillin or Doxycycline\n  • Comorbidities: Amoxicillin-Clavulanate + Macrolide, or Respiratory Fluoroquinolone (Levofloxacin)",
                "**Inpatient (CURB-65: 2):**\n  • IV Beta-lactam (Ceftriaxone/Ampicillin-Sulbactam) + Macrolide (Azithromycin)\n  • OR Respiratory Fluoroquinolone alone",
                "**ICU (CURB-65: 3-5, severe):**\n  • IV Beta-lactam + Macrolide\n  • If Pseudomonas risk: Anti-pseudomonal beta-lactam + Fluoroquinolone\n  • If MRSA risk: Add Vancomycin or Linezolid",
                "**Supportive:** Oxygen therapy, IV fluids, antipyretics, chest physiotherapy",
                "**Prevention:** Pneumococcal vaccine (PCV-13, PPSV-23), Influenza vaccine annually"
            ]
        },
        highYieldPoints: [
            "Streptococcus pneumoniae is the MOST COMMON cause of CAP overall",
            "Mycoplasma pneumoniae — most common ATYPICAL cause, young adults",
            "CURB-65 score determines severity and site of care",
            "Legionella: HYPONATREMIA + diarrhea + confusion + pneumonia",
            "Klebsiella: Alcoholics + currant-jelly sputum + upper lobe cavitary lesion",
            "PCP pneumonia: CD4 <200 + bilateral ground-glass opacity + treat with TMP-SMX",
            "4 stages of lobar pneumonia: Congestion → Red Hepatization → Grey Hepatization → Resolution",
            "Aspiration pneumonia: RIGHT lower lobe (due to anatomy of right main bronchus)"
        ],
        examFAQs: [
            "Classify pneumonia and discuss the etiology of CAP",
            "Describe the pathological stages of lobar pneumonia",
            "Discuss the CURB-65 scoring system and its clinical significance",
            "Compare typical vs atypical pneumonia",
            "Management protocol of severe community-acquired pneumonia"
        ],
        quiz: [
            {
                question: "What is the most common causative organism of Community-Acquired Pneumonia?",
                options: ["Mycoplasma pneumoniae", "Staphylococcus aureus", "Streptococcus pneumoniae", "Haemophilus influenzae"],
                correct: 2,
                difficulty: "easy",
                explanations: {
                    correct: "Streptococcus pneumoniae (Pneumococcus) is the most common cause of CAP across all age groups. It classically causes lobar pneumonia with rusty-colored sputum. It is a Gram-positive lancet-shaped diplococcus.",
                    wrong: {
                        0: "Mycoplasma pneumoniae is the most common ATYPICAL cause, particularly in young adults. It causes 'walking pneumonia'.",
                        1: "S. aureus is an important cause of post-influenza pneumonia and hospital-acquired pneumonia, but NOT the commonest CAP organism.",
                        3: "H. influenzae is common in patients with COPD and chronic lung disease, but is not the overall most common."
                    }
                }
            },
            {
                question: "In the CURB-65 scoring system, which of the following criteria is NOT included?",
                options: ["Confusion", "Urea >7 mmol/L", "Temperature >39°C", "Respiratory rate ≥30/min"],
                correct: 2,
                difficulty: "easy",
                explanations: {
                    correct: "Temperature is NOT part of CURB-65. The criteria are: C-Confusion, U-Urea >7 mmol/L, R-Respiratory rate ≥30/min, B-Blood pressure <90/60 mmHg, 65-Age ≥65 years.",
                    wrong: {
                        0: "Confusion (new onset) IS part of the CURB-65 score.",
                        1: "Urea >7 mmol/L (BUN >19 mg/dL) IS part of the CURB-65 score.",
                        3: "Respiratory rate ≥30/min IS part of the CURB-65 score."
                    }
                }
            },
            {
                question: "A 60-year-old chronic alcoholic presents with high fever, productive cough with thick, bloody, mucoid sputum ('currant jelly'). CXR shows right upper lobe cavitary lesion. Most likely organism?",
                options: ["Streptococcus pneumoniae", "Klebsiella pneumoniae", "Mycobacterium tuberculosis", "Pseudomonas aeruginosa"],
                correct: 1,
                difficulty: "clinical",
                explanations: {
                    correct: "Klebsiella pneumoniae is classically associated with alcoholics and produces thick, bloody 'currant-jelly' sputum. It has a predilection for the upper lobes and frequently causes cavitation and abscess formation.",
                    wrong: {
                        0: "S. pneumoniae causes 'rusty' sputum, not currant-jelly. It less commonly causes cavitation.",
                        2: "TB can cause upper lobe cavitary lesions but typically has a more chronic/subacute course with night sweats and weight loss.",
                        3: "Pseudomonas is more common in hospital-acquired/ventilator-associated pneumonia and cystic fibrosis."
                    }
                }
            },
            {
                question: "Which stage of lobar pneumonia is characterized by alveoli filled with RBCs, fibrin, and neutrophils, giving the lung a liver-like consistency?",
                options: ["Congestion", "Red Hepatization", "Grey Hepatization", "Resolution"],
                correct: 1,
                difficulty: "moderate",
                explanations: {
                    correct: "Red Hepatization (Day 2-4) is characterized by massive exudation of RBCs, neutrophils, and fibrin into alveoli. The lung becomes firm, red, and has a liver-like (hepatic) consistency.",
                    wrong: {
                        0: "Congestion (Day 1-2) shows vascular engorgement and serous exudate but the lung is not yet firm.",
                        2: "Grey Hepatization (Day 4-8) involves lysis of RBCs with persistent fibrin — the lung turns grey/brown.",
                        3: "Resolution (Day 8+) is the healing phase with enzymatic digestion of exudate."
                    }
                }
            },
            {
                question: "What is the treatment of choice for Pneumocystis jirovecii pneumonia (PCP)?",
                options: ["Ceftriaxone + Azithromycin", "Trimethoprim-Sulfamethoxazole (TMP-SMX)", "Amphotericin B", "Vancomycin"],
                correct: 1,
                difficulty: "moderate",
                explanations: {
                    correct: "TMP-SMX (Co-trimoxazole) is the drug of choice for both treatment and prophylaxis of PCP. For severe PCP (PaO2 <70), add corticosteroids. PCP occurs in HIV patients with CD4 <200.",
                    wrong: {
                        0: "Ceftriaxone + Azithromycin is used for typical community-acquired bacterial pneumonia, not PCP.",
                        2: "Amphotericin B is used for systemic fungal infections like Cryptococcosis, severe Aspergillosis, but not PCP.",
                        3: "Vancomycin is used for MRSA pneumonia, not PCP."
                    }
                }
            }
        ],
        flashcards: [
            { front: "Most common cause of CAP?", back: "**Streptococcus pneumoniae** — Gram-positive lancet-shaped diplococcus. Produces 'rusty' sputum. Optochin-sensitive, bile-soluble.", category: "definitions" },
            { front: "4 stages of Lobar Pneumonia in order?", back: "1. **Congestion** (Day 1-2)\n2. **Red Hepatization** (Day 2-4)\n3. **Grey Hepatization** (Day 4-8)\n4. **Resolution** (Day 8+)", category: "pathways" },
            { front: "CURB-65 components?", back: "**C** - Confusion\n**U** - Urea >7 mmol/L\n**R** - Respiratory Rate ≥30\n**B** - BP <90/60\n**65** - Age ≥65\nScore 0-1: Outpatient | 2: Inpatient | 3+: ICU", category: "clinical" },
            { front: "Legionella pneumonia: Classic triad?", back: "1. **Pneumonia** (atypical)\n2. **Hyponatremia** (SIADH)\n3. **GI symptoms** (diarrhea, abdominal pain)\n+Confusion, high fever. Source: contaminated cooling towers/AC. Urinary antigen test for diagnosis.", category: "clinical" },
            { front: "Drug of choice for PCP pneumonia?", back: "**TMP-SMX (Co-trimoxazole)**\nProphylaxis when CD4 <200\nAdd steroids if PaO₂ <70 mmHg\nAlternative: Pentamidine, Atovaquone", category: "drugs" },
            { front: "Why does aspiration pneumonia affect right lower lobe?", back: "The **right main bronchus** is wider, shorter, and more vertical than the left → aspirated material preferentially enters right lung, especially the **right lower lobe** (posterior segment in supine, basal segment upright).", category: "clinical" }
        ],
        examTips: {
            importantTopics: ["Classification and etiology of pneumonia", "Pathological stages of lobar pneumonia", "CURB-65 scoring system", "Typical vs atypical pneumonia", "PCP in HIV patients"],
            confusedConcepts: [
                "Typical (acute, high fever, purulent sputum) vs Atypical (gradual, dry cough, extrapulmonary signs)",
                "CAP vs HAP vs VAP — different organisms and treatment protocols",
                "Red Hepatization (RBCs present) vs Grey Hepatization (RBCs lysed)",
                "CURB-65 vs PSI (PORT) score"
            ],
            answerWritingTips: {
                "5marks": "Definition, 4-5 common organisms, key management principles.",
                "10marks": "Add pathological stages, clinical features (typical vs atypical), CURB-65, and management stratified by severity.",
                "15marks": "Comprehensive with classification, detailed etiology, all 4 stages of pathology, clinical features, investigations, severity scoring, management protocol, and prevention."
            }
        },
        doubtResponses: {
            "default": "Great question about Pneumonia! Remember these key principles:\n\n1. **Identify the setting** — CAP, HAP, or aspiration determines organisms\n2. **Assess severity** — CURB-65 guides management decisions\n3. **Start empirical antibiotics early** — Adjust based on cultures\n\nWould you like me to go deeper into any aspect?"
        }
    },

    "diabetes mellitus": {
        title: "Diabetes Mellitus",
        category: "Endocrinology",
        sections: {
            definition: "Diabetes Mellitus (DM) is a group of **metabolic disorders** characterized by **chronic hyperglycemia** resulting from defects in insulin secretion, insulin action, or both. The chronic hyperglycemia of diabetes is associated with long-term microvascular (retinopathy, nephropathy, neuropathy) and macrovascular (coronary artery disease, peripheral vascular disease, stroke) complications.",
            etiology: [
                "**Type 1 DM (5-10%):**\n  • **Autoimmune destruction** of pancreatic β-cells (Type 1A)\n  • Antibodies: Anti-GAD65, Anti-IA2, Anti-insulin, Anti-ZnT8\n  • Associated with HLA-DR3, HLA-DR4\n  • Absolute insulin deficiency → prone to DKA\n  • Typical onset: children and young adults",
                "**Type 2 DM (90-95%):**\n  • **Insulin resistance** + relative insulin deficiency\n  • Strong genetic predisposition + environmental factors (obesity, sedentary lifestyle)\n  • Associated with metabolic syndrome\n  • Typical onset: adults >40 years (increasingly in younger)",
                "**Gestational DM (GDM):** Glucose intolerance first recognized during pregnancy (usually 24-28 weeks). Due to counter-regulatory hormones (hPL, cortisol, progesterone)",
                "**Other types:** MODY (monogenic), pancreatic diseases, endocrinopathies (Cushing's, acromegaly, pheochromocytoma), drug-induced (steroids, thiazides)"
            ],
            pathophysiology: [
                "**Type 1 DM:** Autoimmune T-cell mediated destruction of β-cells → loss of >80-90% β-cell mass → absolute insulin deficiency → unregulated gluconeogenesis, glycogenolysis, and lipolysis → DKA",
                "**Type 2 DM:** Peripheral insulin resistance (muscle, fat, liver) → compensatory β-cell hyperfunction → β-cell exhaustion → relative insulin deficiency. The 'Ominous Octet' (DeFronzo): impaired insulin secretion, ↑glucagon, ↑hepatic glucose production, ↑lipolysis, ↑renal glucose reabsorption, neurotransmitter dysfunction, impaired incretin effect, ↓glucose uptake in muscle",
                "**Chronic hyperglycemia** leads to tissue damage through: Polyol pathway (sorbitol/fructose accumulation → osmotic damage), Advanced Glycation End-products (AGEs → vascular damage), PKC activation, Hexosamine pathway",
                "**Microvascular complications:** Retinopathy (non-proliferative → proliferative), Nephropathy (microalbuminuria → macroalbuminuria → ESRD), Neuropathy (peripheral sensorimotor, autonomic)",
                "**Macrovascular complications:** Accelerated atherosclerosis → CAD, stroke, PVD"
            ],
            clinicalFeatures: [
                "**Classic triad:** Polyuria (osmotic diuresis), Polydipsia (compensatory thirst), Polyphagia (cellular starvation despite high glucose)",
                "**Type 1:** Rapid onset, weight loss, weakness, DKA at presentation",
                "**Type 2:** Insidious onset, often asymptomatic, may present with complications. Obesity, acanthosis nigricans (insulin resistance)",
                "**General:** Fatigue, blurred vision (lens swelling), recurrent infections (UTI, candidiasis), poor wound healing",
                "**Complications:** Diabetic retinopathy (visual changes), neuropathy (numbness, tingling, burning feet), nephropathy (edema, proteinuria), diabetic foot ulcers"
            ],
            diagnosis: [
                "**Diagnostic criteria (ADA):**\n  • Fasting Plasma Glucose (FPG) ≥126 mg/dL (7.0 mmol/L)\n  • 2-hour OGTT ≥200 mg/dL (11.1 mmol/L) using 75g glucose load\n  • HbA1c ≥6.5%\n  • Random Plasma Glucose ≥200 mg/dL with classic symptoms",
                "**Pre-diabetes:**\n  • Impaired Fasting Glucose (IFG): FPG 100-125 mg/dL\n  • Impaired Glucose Tolerance (IGT): 2-hr OGTT 140-199 mg/dL\n  • HbA1c: 5.7-6.4%",
                "**HbA1c** — Reflects average glucose over past 2-3 months (lifespan of RBC). Target: <7% for most adults",
                "**C-peptide levels** — Low/absent in Type 1, normal/high in early Type 2",
                "**Autoantibodies** — For Type 1: Anti-GAD65, Anti-IA2, Anti-insulin"
            ],
            management: [
                "**Type 1 DM:**\n  • **Insulin therapy** — Essential, lifelong\n  • Basal-bolus regimen: Long-acting (Glargine/Detemir) + Rapid-acting (Lispro/Aspart) before meals\n  • Insulin pump therapy (CSII)\n  • Blood glucose monitoring (SMBG or CGM)\n  • Carbohydrate counting",
                "**Type 2 DM:**\n  • **Lifestyle modification** — First-line (diet, exercise, weight loss)\n  • **Metformin** — First-line oral drug (biguanide, ↓hepatic glucose production, ↑insulin sensitivity)\n  • **Second-line agents:** Sulfonylureas (Glimepiride), DPP-4 inhibitors (Sitagliptin), SGLT2 inhibitors (Empagliflozin — cardio-renal benefits), GLP-1 agonists (Liraglutide — weight loss + CV benefit)\n  • **Insulin** — When oral agents fail or HbA1c >10%",
                "**Acute complications management:**\n  • **DKA:** IV fluids → IV insulin → Potassium replacement → Monitor glucose/K+ hourly. Identify trigger\n  • **HHS:** IV fluids (primary treatment) → IV insulin (lower rate than DKA)\n  • **Hypoglycemia:** Conscious — oral glucose/juice; Unconscious — IV dextrose or IM glucagon",
                "**Screening for complications:**\n  • Eyes: Annual dilated fundoscopy\n  • Kidneys: Annual urine albumin-creatinine ratio (UACR) + eGFR\n  • Feet: Annual monofilament testing\n  • Cardiovascular: Lipid profile, BP monitoring"
            ]
        },
        highYieldPoints: [
            "Type 1 = Autoimmune β-cell destruction, Type 2 = Insulin resistance + relative deficiency",
            "HbA1c ≥6.5% = Diabetes, 5.7-6.4% = Pre-diabetes",
            "Metformin is FIRST-LINE drug for Type 2 DM (contraindicated in renal failure, eGFR <30)",
            "DKA: Type 1 > Type 2. Triad: Hyperglycemia + Ketosis + Metabolic acidosis (↑anion gap)",
            "HHS: Type 2. Severe hyperglycemia (>600 mg/dL) + ↑osmolality + NO significant ketosis",
            "SGLT2 inhibitors (empagliflozin) — Cardio-renal protective benefits",
            "Diabetic nephropathy: Kimmelstiel-Wilson nodular glomerulosclerosis",
            "Most common cause of blindness in working-age adults: Diabetic retinopathy"
        ],
        examFAQs: [
            "Compare and contrast Type 1 and Type 2 DM",
            "Describe the pathogenesis and management of DKA",
            "Enumerate the microvascular and macrovascular complications of DM",
            "Discuss the mechanism of action of oral hypoglycemic agents",
            "Diagnostic criteria for DM as per ADA guidelines"
        ],
        quiz: [
            {
                question: "Which is the FIRST-LINE drug for Type 2 Diabetes Mellitus?",
                options: ["Glimepiride", "Insulin Glargine", "Metformin", "Sitagliptin"],
                correct: 2,
                difficulty: "easy",
                explanations: {
                    correct: "Metformin (biguanide) is the first-line oral drug for Type 2 DM. It works by decreasing hepatic glucose production and increasing peripheral insulin sensitivity. It does NOT cause hypoglycemia or weight gain.",
                    wrong: {
                        0: "Glimepiride (sulfonylurea) is a second-line agent. It stimulates insulin secretion and can cause hypoglycemia and weight gain.",
                        1: "Insulin Glargine is used when oral agents fail, or initially when HbA1c >10% or symptomatic hyperglycemia.",
                        3: "Sitagliptin (DPP-4 inhibitor) is a second-line agent that inhibits degradation of incretin hormones."
                    }
                }
            },
            {
                question: "Which of the following is a characteristic feature of Diabetic Ketoacidosis (DKA) but NOT of HHS?",
                options: ["Severe hyperglycemia", "Dehydration", "Significant ketonemia and ketonuria", "Altered consciousness"],
                correct: 2,
                difficulty: "moderate",
                explanations: {
                    correct: "Significant ketosis (ketonemia + ketonuria + metabolic acidosis) is a hallmark of DKA and distinguishes it from HHS. In DKA, absolute insulin deficiency leads to unopposed lipolysis → free fatty acids → ketone bodies (acetoacetate, β-hydroxybutyrate).",
                    wrong: {
                        0: "Hyperglycemia occurs in both, but is more severe in HHS (>600 mg/dL) compared to DKA (250-600 mg/dL).",
                        1: "Dehydration occurs in both DKA and HHS. HHS actually has more profound dehydration.",
                        3: "Altered consciousness can occur in both, but is more common and severe in HHS due to hyperosmolarity."
                    }
                }
            },
            {
                question: "HbA1c reflects average blood glucose levels over what period?",
                options: ["1-2 weeks", "2-3 months", "6 months", "1 year"],
                correct: 1,
                difficulty: "easy",
                explanations: {
                    correct: "HbA1c reflects average glycemia over the preceding 2-3 months, corresponding to the lifespan of red blood cells (~120 days). It is weighted more towards the most recent 30 days.",
                    wrong: {
                        0: "1-2 weeks is too short. Fructosamine (glycated albumin) reflects glucose over 2-3 weeks.",
                        2: "6 months is too long — RBCs live only ~120 days.",
                        3: "1 year is incorrect. No standard glycemic marker reflects this period."
                    }
                }
            },
            {
                question: "Which pathological finding is characteristic of diabetic nephropathy?",
                options: ["Crescentic glomerulonephritis", "Kimmelstiel-Wilson nodular glomerulosclerosis", "IgA nephropathy", "Membranous nephropathy"],
                correct: 1,
                difficulty: "moderate",
                explanations: {
                    correct: "Kimmelstiel-Wilson nodules (nodular glomerulosclerosis) are PATHOGNOMONIC of diabetic nephropathy. They are eosinophilic, acellular nodular deposits in the mesangium. Diffuse glomerulosclerosis is more common but less specific.",
                    wrong: {
                        0: "Crescentic GN is seen in rapidly progressive GN (RPGN) — Goodpasture, ANCA vasculitis, etc.",
                        2: "IgA nephropathy (Berger's disease) is the most common primary GN worldwide — mesangial IgA deposits.",
                        3: "Membranous nephropathy is associated with hepatitis B, SLE, and is a common cause of nephrotic syndrome in adults."
                    }
                }
            },
            {
                question: "A Type 2 DM patient with CKD (eGFR 25) and heart failure. Which drug class provides maximum cardiovascular and renal benefit?",
                options: ["Sulfonylureas", "DPP-4 inhibitors", "SGLT2 inhibitors", "Thiazolidinediones"],
                correct: 2,
                difficulty: "clinical",
                explanations: {
                    correct: "SGLT2 inhibitors (Empagliflozin, Dapagliflozin) have proven cardiovascular benefit (EMPA-REG, DAPA-HF trials) and renal protective effects (CREDENCE trial). They reduce heart failure hospitalizations, CV mortality, and slow CKD progression. Note: efficacy decreases with low eGFR, but benefit in HF persists.",
                    wrong: {
                        0: "Sulfonylureas can cause hypoglycemia and weight gain. No cardiovascular benefit proven. Require dose adjustment in CKD.",
                        1: "DPP-4 inhibitors are weight-neutral and safe in CKD but have NOT shown significant CV or renal benefits.",
                        3: "Thiazolidinediones (Pioglitazone) are CONTRAINDICATED in heart failure as they cause fluid retention and edema."
                    }
                }
            }
        ],
        flashcards: [
            { front: "HbA1c diagnostic criteria?", back: "**≥6.5%** = Diabetes\n**5.7-6.4%** = Pre-diabetes\n**<5.7%** = Normal\nReflects average glucose over 2-3 months (RBC lifespan).", category: "definitions" },
            { front: "DKA vs HHS: Key differences?", back: "**DKA:** Type 1 > Type 2, glucose 250-600, pH <7.3, significant ketosis, anion gap acidosis.\n**HHS:** Type 2, glucose >600, osmolality >320, NO significant ketosis, altered sensorium.", category: "clinical" },
            { front: "Metformin: Mechanism?", back: "Biguanide. **↓Hepatic glucose production** (primary), **↑peripheral insulin sensitivity**, ↓intestinal glucose absorption. Activates AMPK pathway. Does NOT cause hypoglycemia. Contraindicated: eGFR <30, lactic acidosis risk.", category: "drugs" },
            { front: "SGLT2 inhibitors: Name 2 + key benefit?", back: "**Empagliflozin, Dapagliflozin.** Block sodium-glucose co-transporter 2 in PCT → glycosuria → ↓glucose. **Cardio-renal protective** (↓HF hospitalizations, ↓CKD progression). Side effects: UTI, genital candidiasis, euglycemic DKA.", category: "drugs" },
            { front: "Diabetic Retinopathy: Non-proliferative vs Proliferative?", back: "**NPDR:** Microaneurysms, hard exudates, dot-blot hemorrhages, cotton-wool spots, macular edema.\n**PDR:** **Neovascularization** (hallmark) → vitreous hemorrhage, retinal detachment. Rx: Anti-VEGF, laser photocoagulation.", category: "clinical" },
            { front: "Kimmelstiel-Wilson lesion?", back: "**Nodular glomerulosclerosis** — PATHOGNOMONIC of diabetic nephropathy. Eosinophilic, acellular deposits in mesangium. Progression: hyperfiltration → microalbuminuria → macroalbuminuria → nephrotic syndrome → ESRD.", category: "pathways" }
        ],
        examTips: {
            importantTopics: ["Type 1 vs Type 2 comparison", "DKA pathogenesis and management", "Microvascular complications", "Oral hypoglycemic agents", "ADA diagnostic criteria"],
            confusedConcepts: [
                "DKA (ketosis + acidosis) vs HHS (hyperosmolar + NO ketosis)",
                "Type 1 (autoimmune, absolute deficiency) vs Type 2 (resistance + relative deficiency)",
                "Microalbuminuria (30-300 mg/day) vs Macroalbuminuria (>300 mg/day)",
                "NPDR (no new vessels) vs PDR (neovascularization)"
            ],
            answerWritingTips: {
                "5marks": "Definition, classify (Type 1 vs 2), diagnostic criteria, and first-line management.",
                "10marks": "Add pathophysiology, clinical features, all investigations, complications, and management by type.",
                "15marks": "Comprehensive with detailed pathogenesis, all complications (micro + macro) with mechanisms, complete management algorithm, and recent advances (SGLT2i, GLP-1 agonists)."
            }
        },
        doubtResponses: {
            "default": "Excellent question about Diabetes Mellitus! Key principles:\n\n1. **Classification matters** — management differs between Type 1 and Type 2\n2. **HbA1c is your best friend** — for diagnosis and monitoring\n3. **Screen for complications early** — eyes, kidneys, feet, heart\n\nWould you like to explore any specific aspect?"
        }
    }
};

// Helper to find a topic by fuzzy matching
export function findTopic(query) {
    if (!query) return null;
    const q = query.toLowerCase().trim();

    // Direct match
    if (medicalTopics[q]) return medicalTopics[q];

    // Partial match
    for (const [key, value] of Object.entries(medicalTopics)) {
        if (key.includes(q) || q.includes(key) || value.title.toLowerCase().includes(q)) {
            return value;
        }
    }

    // Abbreviation match
    const abbrevMap = {
        'mi': 'myocardial infarction',
        'heart attack': 'myocardial infarction',
        'cad': 'myocardial infarction',
        'dm': 'diabetes mellitus',
        'diabetes': 'diabetes mellitus',
        'sugar': 'diabetes mellitus',
        'type 1': 'diabetes mellitus',
        'type 2': 'diabetes mellitus',
        'cap': 'pneumonia',
        'lung infection': 'pneumonia',
    };

    for (const [abbrev, fullKey] of Object.entries(abbrevMap)) {
        if (q.includes(abbrev)) return medicalTopics[fullKey];
    }

    return null;
}

export function getAvailableTopics() {
    return Object.values(medicalTopics).map(t => ({
        title: t.title,
        category: t.category
    }));
}

export default medicalTopics;
