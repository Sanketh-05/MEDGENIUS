// ═══════════════════════════════════════════════════════════════
// Clinical Case Data — Virtual Patient Scenarios
// Step-by-step: History → Examination → Investigation → Diagnosis → Management
// ═══════════════════════════════════════════════════════════════

const clinicalCases = [
    {
        id: 'case-mi',
        title: 'Acute Myocardial Infarction',
        category: 'Cardiology',
        difficulty: 'moderate',
        demographics: '55-year-old male, smoker, hypertensive',
        presentation: 'Sudden onset severe chest pain radiating to left arm for 2 hours, associated with sweating and nausea.',
        steps: [
            {
                type: 'history',
                title: 'History Taking',
                question: 'Which history finding is MOST significant?',
                options: [
                    'Crushing retrosternal chest pain radiating to left arm with diaphoresis',
                    'Mild epigastric discomfort after heavy meal',
                    'Sharp pleuritic chest pain that worsens with breathing',
                    'Intermittent palpitations for the past week'
                ],
                correct: 0,
                explanation: 'Crushing retrosternal pain radiating to the left arm with diaphoresis is the classic presentation of acute MI. This triad demands immediate evaluation.'
            },
            {
                type: 'examination',
                title: 'Physical Examination',
                question: 'On examination, which finding would you expect?',
                options: [
                    'S3 gallop, diaphoresis, raised JVP',
                    'Barrel-shaped chest with hyperresonance',
                    'Splinter hemorrhages and Osler nodes',
                    'Spider angiomata and palmar erythema'
                ],
                correct: 0,
                explanation: 'S3 gallop suggests left ventricular dysfunction, diaphoresis indicates sympathetic activation, and raised JVP may suggest right heart failure — all common in acute MI.'
            },
            {
                type: 'investigation',
                title: 'Investigations',
                question: 'Which investigation is the FIRST priority?',
                options: [
                    '12-lead ECG within 10 minutes',
                    'Chest X-ray PA view',
                    'CT coronary angiography',
                    'Echocardiography'
                ],
                correct: 0,
                explanation: '12-lead ECG within 10 minutes is the gold standard first investigation. ST elevation in contiguous leads confirms STEMI. Time is muscle!'
            },
            {
                type: 'diagnosis',
                title: 'Diagnosis',
                question: 'ECG shows ST elevation in leads II, III, aVF. What is the diagnosis?',
                options: [
                    'Inferior wall STEMI',
                    'Anterior wall STEMI',
                    'Lateral wall STEMI',
                    'Posterior wall MI'
                ],
                correct: 0,
                explanation: 'ST elevation in leads II, III, aVF indicates inferior wall MI, typically caused by right coronary artery (RCA) occlusion.'
            },
            {
                type: 'management',
                title: 'Management',
                question: 'What is the definitive management?',
                options: [
                    'Primary PCI (angioplasty) within 90 minutes',
                    'Oral antacids and observation',
                    'Elective CABG after 6 weeks',
                    'Conservative management with bed rest'
                ],
                correct: 0,
                explanation: 'Primary PCI within 90 minutes of first medical contact is the treatment of choice for STEMI. Door-to-balloon time < 90 min is the target. MONA (Morphine, O2, Nitrates, Aspirin) is given while preparing for PCI.'
            }
        ]
    },
    {
        id: 'case-pneumonia',
        title: 'Community-Acquired Pneumonia',
        category: 'Pulmonology',
        difficulty: 'easy',
        demographics: '62-year-old female, diabetic',
        presentation: 'High fever, productive cough with rusty sputum for 3 days, and right-sided pleuritic chest pain.',
        steps: [
            {
                type: 'history',
                title: 'History Taking',
                question: 'Which symptom combination is most characteristic?',
                options: [
                    'High fever, rusty sputum, pleuritic chest pain',
                    'Chronic dry cough with weight loss over months',
                    'Sudden breathlessness with pink frothy sputum',
                    'Nocturnal cough with wheezing'
                ],
                correct: 0,
                explanation: 'The triad of high fever, rusty sputum (blood-tinged from alveolar inflammation), and pleuritic pain is classic for bacterial pneumonia, especially Streptococcus pneumoniae.'
            },
            {
                type: 'examination',
                title: 'Physical Examination',
                question: 'What would you find on chest examination?',
                options: [
                    'Bronchial breath sounds, increased vocal fremitus, dullness on percussion',
                    'Decreased breath sounds, hyperresonance, tracheal deviation',
                    'Bilateral basal crackles with S3 gallop',
                    'Stridor with intercostal recession'
                ],
                correct: 0,
                explanation: 'Consolidation produces bronchial breath sounds (air bronchogram), increased vocal fremitus (solid tissue conducts sound better), and dullness on percussion.'
            },
            {
                type: 'investigation',
                title: 'Investigations',
                question: 'Which investigation confirms the diagnosis?',
                options: [
                    'Chest X-ray showing lobar consolidation',
                    'CT pulmonary angiography',
                    'Spirometry with reversibility testing',
                    'V/Q scan'
                ],
                correct: 0,
                explanation: 'Chest X-ray is the key investigation showing lobar consolidation with air bronchograms. Sputum culture identifies the causative organism.'
            },
            {
                type: 'diagnosis',
                title: 'Diagnosis',
                question: 'CXR shows right lower lobe consolidation. Most likely organism?',
                options: [
                    'Streptococcus pneumoniae',
                    'Mycobacterium tuberculosis',
                    'Pneumocystis jirovecii',
                    'Aspergillus fumigatus'
                ],
                correct: 0,
                explanation: 'Streptococcus pneumoniae is the most common cause of community-acquired pneumonia (60-70%). It classically causes lobar consolidation with rusty sputum.'
            },
            {
                type: 'management',
                title: 'Management',
                question: 'What is the appropriate first-line treatment?',
                options: [
                    'Amoxicillin + Macrolide (e.g., Azithromycin)',
                    'Anti-tubercular therapy for 6 months',
                    'Inhaled corticosteroids + LABA',
                    'IV Amphotericin B'
                ],
                correct: 0,
                explanation: 'For moderate CAP, beta-lactam (Amoxicillin) + macrolide (Azithromycin) covers typical and atypical organisms. Assess severity using CURB-65 score.'
            }
        ]
    },
    {
        id: 'case-dka',
        title: 'Diabetic Ketoacidosis',
        category: 'Endocrinology',
        difficulty: 'moderate',
        demographics: '28-year-old female, Type 1 DM',
        presentation: 'Found confused with rapid deep breathing, abdominal pain, and vomiting. Had stopped insulin 2 days ago due to gastroenteritis.',
        steps: [
            {
                type: 'history',
                title: 'History Taking',
                question: 'Which history detail is most critical?',
                options: [
                    'Insulin omission in a Type 1 diabetic with intercurrent illness',
                    'Excessive water intake and polyuria for 6 months',
                    'Gradual weight gain with fatigue over 1 year',
                    'History of recurrent urinary tract infections'
                ],
                correct: 0,
                explanation: 'Insulin omission is the most common precipitant of DKA. Intercurrent illness increases counter-regulatory hormones, making insulin even more crucial.'
            },
            {
                type: 'examination',
                title: 'Physical Examination',
                question: 'What is the deep, rapid breathing pattern called?',
                options: [
                    'Kussmaul breathing — compensatory respiratory alkalosis',
                    'Cheyne-Stokes respiration indicating brain injury',
                    'Biot breathing indicating pontine lesion',
                    'Obstructive sleep apnea pattern'
                ],
                correct: 0,
                explanation: 'Kussmaul breathing (deep, rapid sighing) is the respiratory compensation for metabolic acidosis. The body blows off CO2 to raise pH. Fruity breath odor (acetone) is pathognomonic.'
            },
            {
                type: 'investigation',
                title: 'Investigations',
                question: 'Which is the diagnostic triad of DKA?',
                options: [
                    'Blood glucose > 250 mg/dL, pH < 7.3, ketones positive',
                    'Blood glucose < 70 mg/dL, pH > 7.45, low potassium',
                    'Normal glucose, elevated HbA1c, proteinuria',
                    'Fasting glucose 100-125 mg/dL, normal pH, no ketones'
                ],
                correct: 0,
                explanation: 'DKA diagnostic criteria: hyperglycemia (>250), acidosis (pH <7.3, bicarb <18), and ketonemia/ketonuria. ABG and serum electrolytes are essential.'
            },
            {
                type: 'diagnosis',
                title: 'Diagnosis',
                question: 'Labs show: glucose 450 mg/dL, pH 7.1, HCO3- 8, ketones +++. Diagnosis?',
                options: [
                    'Severe Diabetic Ketoacidosis',
                    'Hyperosmolar Hyperglycemic State',
                    'Lactic acidosis',
                    'Renal tubular acidosis'
                ],
                correct: 0,
                explanation: 'pH < 7.0-7.24 with high glucose and significant ketones = severe DKA. HHS typically has glucose >600, minimal ketones, and high osmolality.'
            },
            {
                type: 'management',
                title: 'Management',
                question: 'What is the FIRST step in management?',
                options: [
                    'IV normal saline bolus for fluid resuscitation',
                    'Subcutaneous insulin glargine',
                    'IV dextrose 25%',
                    'Oral metformin'
                ],
                correct: 0,
                explanation: 'Fluid resuscitation with IV normal saline is FIRST priority (patients are 5-10L depleted). Then: IV insulin infusion, potassium replacement (check K+ before insulin!), and monitoring.'
            }
        ]
    },
    {
        id: 'case-appendicitis',
        title: 'Acute Appendicitis',
        category: 'Surgery',
        difficulty: 'easy',
        demographics: '22-year-old male',
        presentation: 'Periumbilical pain that migrated to right iliac fossa over 12 hours, associated with nausea, vomiting, and low-grade fever.',
        steps: [
            {
                type: 'history',
                title: 'History Taking',
                question: 'Which pain pattern is classic for appendicitis?',
                options: [
                    'Periumbilical pain migrating to right iliac fossa (McBurney\'s point)',
                    'Sudden onset epigastric pain radiating to the back',
                    'Colicky pain with distension and absolute constipation',
                    'Constant left iliac fossa pain with bloody diarrhea'
                ],
                correct: 0,
                explanation: 'The migration of pain from periumbilical (visceral T10) to RIF (parietal peritoneum) is pathognomonic for appendicitis. This is called the "classic sequence."'
            },
            {
                type: 'examination',
                title: 'Physical Examination',
                question: 'Which clinical sign is most specific?',
                options: [
                    'Rebound tenderness at McBurney\'s point with positive Rovsing\'s sign',
                    'Murphy\'s sign with jaundice',
                    'Shifting dullness with fluid thrill',
                    'Visible peristalsis with succussion splash'
                ],
                correct: 0,
                explanation: 'McBurney\'s point tenderness (⅓ from ASIS to umbilicus) with rebound tenderness indicates peritoneal irritation. Rovsing\'s sign (palpating LIF causes RIF pain) is highly suggestive.'
            },
            {
                type: 'investigation',
                title: 'Investigations',
                question: 'Which investigation is most helpful?',
                options: [
                    'Ultrasound abdomen (non-compressible appendix > 6mm)',
                    'Barium enema',
                    'Colonoscopy',
                    'MRCP'
                ],
                correct: 0,
                explanation: 'USG showing non-compressible appendix >6mm diameter, target sign, and peri-appendicular fluid confirms the diagnosis. CT abdomen has highest sensitivity (>95%).'
            },
            {
                type: 'diagnosis',
                title: 'Diagnosis',
                question: 'Alvarado score is 8. USG shows dilated non-compressible appendix. Diagnosis?',
                options: [
                    'Acute appendicitis — surgical emergency',
                    'Mesenteric lymphadenitis — conservative management',
                    'Meckel\'s diverticulitis',
                    'Right ureteric colic'
                ],
                correct: 0,
                explanation: 'Alvarado score ≥7 strongly suggests appendicitis. With USG confirmation, this is acute appendicitis requiring surgical intervention. Score: Migration(1), Anorexia(1), Nausea(1), RIF tenderness(2), Rebound(1), Fever(1), Leukocytosis(2).'
            },
            {
                type: 'management',
                title: 'Management',
                question: 'What is the definitive treatment?',
                options: [
                    'Laparoscopic appendectomy with perioperative antibiotics',
                    'Conservative management with prolonged antibiotics only',
                    'Percutaneous drainage',
                    'Wait and watch for 72 hours'
                ],
                correct: 0,
                explanation: 'Laparoscopic appendectomy is the gold standard treatment. IV antibiotics (Ceftriaxone + Metronidazole) are started preoperatively. Early surgery reduces perforation risk.'
            }
        ]
    },
    {
        id: 'case-stroke',
        title: 'Acute Ischemic Stroke',
        category: 'Neurology',
        difficulty: 'moderate',
        demographics: '68-year-old male, atrial fibrillation, not on anticoagulants',
        presentation: 'Sudden onset right-sided weakness and slurred speech while watching TV. Symptoms started 1 hour ago.',
        steps: [
            {
                type: 'history',
                title: 'History Taking',
                question: 'What is the most critical piece of history?',
                options: [
                    'Exact time of symptom onset (1 hour ago) — within thrombolysis window',
                    'Family history of migraine',
                    'Dietary preferences',
                    'History of seasonal allergies'
                ],
                correct: 0,
                explanation: 'Time of onset is THE most critical information. IV thrombolysis (tPA) has a 4.5-hour window. "Time is brain" — 1.9 million neurons die every minute during a stroke.'
            },
            {
                type: 'examination',
                title: 'Physical Examination',
                question: 'Examination shows right hemiparesis, right facial droop, and expressive aphasia. Which area is affected?',
                options: [
                    'Left middle cerebral artery (MCA) territory',
                    'Right posterior cerebral artery territory',
                    'Vertebrobasilar territory',
                    'Right anterior cerebral artery territory'
                ],
                correct: 0,
                explanation: 'Right hemiparesis + right facial droop + expressive aphasia (Broca\'s area) = Left MCA territory stroke. MCA strokes are the most common ischemic strokes.'
            },
            {
                type: 'investigation',
                title: 'Investigations',
                question: 'What is the FIRST investigation?',
                options: [
                    'Non-contrast CT head (to rule out hemorrhage)',
                    'MRI brain with diffusion-weighted imaging',
                    'Carotid Doppler ultrasound',
                    'Lumbar puncture'
                ],
                correct: 0,
                explanation: 'Non-contrast CT head is FIRST to rule out hemorrhagic stroke (contraindication for thrombolysis). CT is fast, available, and reliably excludes bleed. MRI-DWI is more sensitive but takes longer.'
            },
            {
                type: 'diagnosis',
                title: 'Diagnosis',
                question: 'CT head is normal (no hemorrhage). NIHSS score is 14. Diagnosis?',
                options: [
                    'Acute ischemic stroke — candidate for thrombolysis',
                    'Hemorrhagic stroke — need surgical evacuation',
                    'Transient ischemic attack — no treatment needed',
                    'Todd\'s paralysis post-seizure'
                ],
                correct: 0,
                explanation: 'Normal CT + focal neurological deficits + onset <4.5 hours = acute ischemic stroke eligible for IV thrombolysis. NIHSS 14 indicates moderate-severe stroke.'
            },
            {
                type: 'management',
                title: 'Management',
                question: 'Patient is within the thrombolysis window. What is the treatment?',
                options: [
                    'IV Alteplase (tPA) 0.9 mg/kg within 4.5 hours of onset',
                    'Aspirin 300mg only',
                    'Warfarin loading dose',
                    'Surgical clot removal immediately'
                ],
                correct: 0,
                explanation: 'IV Alteplase (tPA) 0.9 mg/kg (max 90mg) — 10% as bolus, rest over 60 min. Within 4.5 hours. After 24 hours, start aspirin + statin. Long-term: anticoagulation for AF (DOACs preferred).'
            }
        ]
    },
    {
        id: 'case-preeclampsia',
        title: 'Pre-eclampsia',
        category: 'Obstetrics',
        difficulty: 'moderate',
        demographics: '26-year-old primigravida, 34 weeks gestation',
        presentation: 'Headache, blurred vision, and swelling of feet for 3 days. BP recorded as 160/110 mmHg at antenatal visit.',
        steps: [
            {
                type: 'history',
                title: 'History Taking',
                question: 'Which symptom indicates SEVERE pre-eclampsia?',
                options: [
                    'Severe headache with visual disturbances (blurred vision, scotomata)',
                    'Mild ankle edema in the evening',
                    'Morning sickness in first trimester',
                    'Frequent urination'
                ],
                correct: 0,
                explanation: 'Headache and visual disturbances are danger signs indicating cerebral edema and impending eclampsia. Other severe features: epigastric pain, oliguria, elevated liver enzymes.'
            },
            {
                type: 'examination',
                title: 'Physical Examination',
                question: 'BP is 160/110 mmHg. Urine dipstick shows 3+ protein. What does this confirm?',
                options: [
                    'Pre-eclampsia with severe features',
                    'Gestational diabetes',
                    'Normal physiological changes of pregnancy',
                    'Chronic kidney disease'
                ],
                correct: 0,
                explanation: 'Hypertension (>140/90) + proteinuria after 20 weeks = pre-eclampsia. BP >160/110 with proteinuria ≥3+ indicates severe pre-eclampsia requiring urgent management.'
            },
            {
                type: 'investigation',
                title: 'Investigations',
                question: 'Which lab finding indicates HELLP syndrome?',
                options: [
                    'Hemolysis + Elevated Liver enzymes + Low Platelets',
                    'Low hemoglobin + normal LFTs + high platelets',
                    'Elevated blood sugar + glycosuria',
                    'High TSH + low T4'
                ],
                correct: 0,
                explanation: 'HELLP syndrome (Hemolysis, Elevated Liver enzymes, Low Platelets) is a life-threatening complication of severe pre-eclampsia. LDH >600, AST >70, Platelets <100,000.'
            },
            {
                type: 'diagnosis',
                title: 'Diagnosis',
                question: 'Patient at 34 weeks with BP 160/110, proteinuria 3+, headache, visual symptoms. Diagnosis?',
                options: [
                    'Severe pre-eclampsia — needs urgent stabilization and delivery planning',
                    'Mild gestational hypertension — continue monitoring',
                    'Essential hypertension — start lifelong antihypertensives',
                    'Normal pregnancy — reassure and follow up'
                ],
                correct: 0,
                explanation: 'This is severe pre-eclampsia (BP >160/110, proteinuria, cerebral symptoms). At 34 weeks, the goal is to stabilize mother and plan delivery after corticosteroids for fetal lung maturity.'
            },
            {
                type: 'management',
                title: 'Management',
                question: 'What is the MOST important immediate intervention?',
                options: [
                    'IV Magnesium sulfate for seizure prophylaxis + Labetalol for BP control',
                    'Oral paracetamol for headache only',
                    'Strict bed rest and discharge after 24 hours',
                    'Start oral metformin'
                ],
                correct: 0,
                explanation: 'MgSO4 (Pritchard/Zuspan regimen) prevents eclamptic seizures. IV Labetalol/Hydralazine controls acute hypertension. Deliver after 34 weeks with corticosteroids. Definitive cure = delivery of placenta.'
            }
        ]
    },
    {
        id: 'case-tb',
        title: 'Pulmonary Tuberculosis',
        category: 'Pulmonology',
        difficulty: 'easy',
        demographics: '35-year-old male, low socioeconomic status',
        presentation: 'Chronic cough with blood-streaked sputum for 6 weeks, evening rise of fever, night sweats, and significant weight loss.',
        steps: [
            {
                type: 'history',
                title: 'History Taking',
                question: 'Which symptom combination is classic for pulmonary TB?',
                options: [
                    'Chronic cough >2 weeks, hemoptysis, evening fever, night sweats, weight loss',
                    'Acute onset high fever with rusty sputum for 3 days',
                    'Wheezing and breathlessness after allergen exposure',
                    'Progressive breathlessness over years with barrel chest'
                ],
                correct: 0,
                explanation: 'Constitutional symptoms (fever, night sweats, weight loss) + chronic cough >2 weeks with hemoptysis is the classic TB presentation. Any cough lasting >2 weeks should be evaluated for TB.'
            },
            {
                type: 'examination',
                title: 'Physical Examination',
                question: 'What would you expect on examination?',
                options: [
                    'Post-tussive crackles in upper lobes, low BMI, lymphadenopathy',
                    'Bilateral basal crepitations with pedal edema',
                    'Barrel chest with prolonged expiration',
                    'Stridor with drooling'
                ],
                correct: 0,
                explanation: 'TB preferentially affects the upper lobes (apex). Post-tussive crackles (crackles after coughing) are characteristic. Cachexia (low BMI) and cervical lymphadenopathy are common.'
            },
            {
                type: 'investigation',
                title: 'Investigations',
                question: 'What is the diagnostic investigation of choice in India?',
                options: [
                    'CBNAAT/GeneXpert (sputum) — detects MTB + Rifampicin resistance',
                    'Blood culture',
                    'Serology/Widal test',
                    'ECG'
                ],
                correct: 0,
                explanation: 'CBNAAT (Cartridge-Based Nucleic Acid Amplification Test)/GeneXpert is the WHO-recommended first test. Results in 2 hours. Detects MTB DNA + Rifampicin resistance simultaneously.'
            },
            {
                type: 'diagnosis',
                title: 'Diagnosis',
                question: 'GeneXpert: MTB detected, Rifampicin sensitive. CXR: upper lobe cavitation. Diagnosis?',
                options: [
                    'Drug-sensitive pulmonary tuberculosis',
                    'Drug-resistant TB (MDR-TB)',
                    'Non-tuberculous mycobacterial infection',
                    'Lung carcinoma'
                ],
                correct: 0,
                explanation: 'MTB detected + Rifampicin sensitive = drug-sensitive TB. Upper lobe cavitation is radiologically classic. This patient can be treated with standard DOTS regimen.'
            },
            {
                type: 'management',
                title: 'Management',
                question: 'What is the standard treatment regimen?',
                options: [
                    'DOTS: 2 months HRZE (intensive) + 4 months HRE (continuation)',
                    'Single drug Isoniazid for 12 months',
                    'Surgical resection of the affected lobe',
                    'Broad-spectrum antibiotics for 2 weeks'
                ],
                correct: 0,
                explanation: 'Standard DOTS (Directly Observed Therapy, Short-course): 2HRZE/4HRE. H=Isoniazid, R=Rifampicin, Z=Pyrazinamide, E=Ethambutol. Total 6 months. Daily fixed-dose combination under NTEP.'
            }
        ]
    },
    {
        id: 'case-fracture',
        title: 'Colles Fracture',
        category: 'Orthopedics',
        difficulty: 'easy',
        demographics: '60-year-old postmenopausal female',
        presentation: 'Fell on outstretched hand. Pain and swelling of right wrist with dinner-fork deformity.',
        steps: [
            {
                type: 'history',
                title: 'History Taking',
                question: 'What is the typical mechanism of injury?',
                options: [
                    'Fall on outstretched hand (FOOSH) with wrist in dorsiflexion',
                    'Direct blow to the dorsum of the hand',
                    'Twisting injury while carrying heavy weights',
                    'Repetitive strain injury from typing'
                ],
                correct: 0,
                explanation: 'FOOSH (Fall On Out-Stretched Hand) in dorsiflexion is the classic mechanism for Colles fracture. Common in osteoporotic postmenopausal women.'
            },
            {
                type: 'examination',
                title: 'Physical Examination',
                question: 'What is the characteristic deformity called?',
                options: [
                    'Dinner-fork deformity (dorsal angulation of distal radius)',
                    'Swan-neck deformity',
                    'Boutonniere deformity',
                    'Madelung deformity'
                ],
                correct: 0,
                explanation: 'Dinner-fork deformity: dorsal displacement and angulation of the distal fragment gives a lateral profile resembling a dinner fork. Also check for Garden-spade deformity (AP view).'
            },
            {
                type: 'investigation',
                title: 'Investigations',
                question: 'X-ray findings in Colles fracture include?',
                options: [
                    'Dorsal displacement, dorsal angulation, radial shortening, loss of radial inclination',
                    'Volar displacement with volar angulation',
                    'Oblique fracture of ulna with radial head dislocation',
                    'Compression fracture of carpal scaphoid'
                ],
                correct: 0,
                explanation: 'Colles fracture = extra-articular fracture of distal radius with dorsal displacement, dorsal angulation, radial shortening, and supination of distal fragment.'
            },
            {
                type: 'diagnosis',
                title: 'Diagnosis',
                question: 'X-ray: extra-articular distal radius fracture with dorsal displacement. DEXA T-score: -3.2. Diagnosis?',
                options: [
                    'Colles fracture with underlying osteoporosis',
                    'Smith fracture (reverse Colles)',
                    'Barton fracture (intra-articular)',
                    'Scaphoid fracture'
                ],
                correct: 0,
                explanation: 'Dorsal displacement = Colles (not Smith which is volar). T-score < -2.5 confirms osteoporosis. This is a fragility fracture — needs both fracture treatment AND osteoporosis management.'
            },
            {
                type: 'management',
                title: 'Management',
                question: 'What is the treatment for undisplaced Colles fracture?',
                options: [
                    'Below-elbow POP cast in slight palmar flexion and ulnar deviation for 6 weeks',
                    'Above-elbow cast in full extension',
                    'Immediate ORIF with plate fixation',
                    'Buddy strapping only'
                ],
                correct: 0,
                explanation: 'Undisplaced/minimally displaced: closed reduction + below-elbow POP cast (Colles position: slight palmar flexion + ulnar deviation) for 6 weeks. Displaced: may need K-wire fixation or ORIF.'
            }
        ]
    },
    {
        id: 'case-meningitis',
        title: 'Bacterial Meningitis',
        category: 'Neurology',
        difficulty: 'moderate',
        demographics: '19-year-old college student',
        presentation: 'Severe headache, high fever, neck stiffness, and photophobia for 24 hours. Found with petechial rash on trunk.',
        steps: [
            {
                type: 'history',
                title: 'History Taking',
                question: 'Which feature suggests bacterial rather than viral meningitis?',
                options: [
                    'Rapid onset, high fever, petechial/purpuric rash on extremities',
                    'Gradual onset headache with mild fever over 1 week',
                    'Chronic headache worse in the morning with nausea',
                    'Intermittent headache triggered by bright lights'
                ],
                correct: 0,
                explanation: 'Rapid onset + high fever + petechial rash (non-blanching) strongly suggests Neisseria meningitidis (meningococcal meningitis). The rash indicates meningococcemia and is a medical emergency.'
            },
            {
                type: 'examination',
                title: 'Physical Examination',
                question: 'Which signs confirm meningeal irritation?',
                options: [
                    'Positive Kernig\'s sign and Brudzinski\'s sign with neck rigidity',
                    'Positive Romberg\'s test',
                    'Positive Babinski sign bilaterally',
                    'Positive Trendelenburg sign'
                ],
                correct: 0,
                explanation: 'Kernig\'s sign (pain on knee extension with hip flexed), Brudzinski\'s sign (involuntary hip flexion on neck flexion), and neck rigidity form the classic triad of meningeal signs.'
            },
            {
                type: 'investigation',
                title: 'Investigations',
                question: 'What is the diagnostic investigation?',
                options: [
                    'Lumbar puncture — CSF analysis showing turbid fluid, high protein, low glucose, high neutrophils',
                    'CT head with contrast',
                    'Blood culture alone',
                    'EEG'
                ],
                correct: 0,
                explanation: 'LP with CSF analysis is diagnostic. Bacterial meningitis CSF: turbid, high opening pressure, raised protein (>100), low glucose (<40% serum), predominant neutrophils. Do CT first if papilledema/focal signs.'
            },
            {
                type: 'diagnosis',
                title: 'Diagnosis',
                question: 'CSF: turbid, protein 250, glucose 20 (serum 100), neutrophils 90%. Gram stain: gram-negative diplococci. Diagnosis?',
                options: [
                    'Meningococcal (Neisseria meningitidis) meningitis',
                    'Tubercular meningitis',
                    'Viral meningitis',
                    'Fungal meningitis (Cryptococcus)'
                ],
                correct: 0,
                explanation: 'Gram-negative diplococci = Neisseria meningitidis. In young adults, this is the most common cause. Notifiable disease — contacts need chemoprophylaxis with Rifampicin/Ciprofloxacin.'
            },
            {
                type: 'management',
                title: 'Management',
                question: 'What is the immediate treatment?',
                options: [
                    'IV Ceftriaxone (empirical) + IV Dexamethasone (before or with first antibiotic dose)',
                    'Oral amoxicillin for 10 days',
                    'Wait for CSF culture results before starting antibiotics',
                    'Antifungal therapy with Fluconazole'
                ],
                correct: 0,
                explanation: 'NEVER delay antibiotics. IV Ceftriaxone/Cefotaxime empirically. Dexamethasone before/with first antibiotic dose reduces mortality (especially in pneumococcal meningitis). Contact prophylaxis is essential.'
            }
        ]
    },
    {
        id: 'case-asthma',
        title: 'Acute Severe Asthma',
        category: 'Pulmonology',
        difficulty: 'moderate',
        demographics: '12-year-old male, known asthmatic',
        presentation: 'Severe breathlessness, unable to complete sentences, using accessory muscles. Not responding to home nebulizer.',
        steps: [
            {
                type: 'history',
                title: 'History Taking',
                question: 'Which feature classifies this as ACUTE SEVERE asthma?',
                options: [
                    'Cannot complete sentences, respiratory rate >25, heart rate >110',
                    'Mild wheeze on exertion, normal speech',
                    'Occasional cough at night, preserved exercise tolerance',
                    'Chronic productive cough for 3 months'
                ],
                correct: 0,
                explanation: 'Acute severe asthma: can\'t complete sentences, RR >25, HR >110, PEF 33-50% predicted. Life-threatening if: silent chest, cyanosis, bradycardia, altered consciousness, PEF <33%.'
            },
            {
                type: 'examination',
                title: 'Physical Examination',
                question: 'What examination finding indicates LIFE-THREATENING asthma?',
                options: [
                    'Silent chest (no wheeze due to severe air trapping)',
                    'Bilateral expiratory wheeze',
                    'Mild tachycardia with clear speech',
                    'Mild subcostal recession'
                ],
                correct: 0,
                explanation: 'Silent chest is paradoxically dangerous — it means airflow is so severely reduced that no wheeze can be generated. Other life-threatening signs: cyanosis, bradycardia, exhaustion, confusion.'
            },
            {
                type: 'investigation',
                title: 'Investigations',
                question: 'Which investigation is most useful in acute management?',
                options: [
                    'Peak Expiratory Flow Rate (PEFR) and pulse oximetry',
                    'Spirometry with reversibility testing',
                    'Chest CT scan',
                    'Sputum culture'
                ],
                correct: 0,
                explanation: 'PEFR objectively measures severity: >75% mild, 50-75% moderate, 33-50% severe, <33% life-threatening. SpO2 <92% needs urgent intervention. ABG if SpO2 <92% or life-threatening features.'
            },
            {
                type: 'diagnosis',
                title: 'Diagnosis',
                question: 'PEFR 40% predicted, SpO2 91%, unable to speak sentences. Classification?',
                options: [
                    'Acute severe asthma (borderline life-threatening)',
                    'Moderate asthma exacerbation',
                    'Mild intermittent asthma',
                    'COPD exacerbation'
                ],
                correct: 0,
                explanation: 'PEFR 33-50% + inability to speak + SpO2 borderline = acute severe asthma approaching life-threatening. Needs immediate aggressive treatment and close monitoring for deterioration.'
            },
            {
                type: 'management',
                title: 'Management',
                question: 'What is the IMMEDIATE treatment?',
                options: [
                    'O2 to maintain SpO2 94-98% + back-to-back Salbutamol nebulizers + IV Hydrocortisone',
                    'Oral montelukast and discharge',
                    'Inhaled corticosteroid (Budesonide) alone',
                    'Antibiotics for suspected infection'
                ],
                correct: 0,
                explanation: 'Acute severe: O2 (target 94-98%), Salbutamol nebulizer (5mg) back-to-back + Ipratropium bromide, IV Hydrocortisone 100mg or Prednisolone 40-50mg oral. If no response → IV MgSO4, IV Aminophylline. Consider ICU if deteriorating.'
            }
        ]
    }
];

export function getClinicalCases() {
    return clinicalCases;
}

export function getCaseById(id) {
    return clinicalCases.find(c => c.id === id) || null;
}

export function getCasesByCategory(category) {
    if (!category || category === 'all') return clinicalCases;
    return clinicalCases.filter(c => c.category === category);
}

export function getCaseCategories() {
    return [...new Set(clinicalCases.map(c => c.category))];
}

export default clinicalCases;
