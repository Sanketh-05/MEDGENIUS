// ═══════════════════════════════════════════════════════════════
// Extended Medical Knowledge Base — Offline topic answers
// Provides real medical content for 50+ topics without any API
// ═══════════════════════════════════════════════════════════════

const knowledgeBase = {
    "tuberculosis": {
        definition: "**Tuberculosis (TB)** is a chronic granulomatous infectious disease caused by **Mycobacterium tuberculosis** (an acid-fast bacillus). It primarily affects the **lungs** (pulmonary TB) but can involve any organ (extrapulmonary TB). TB spreads via **airborne droplet nuclei** and remains a leading cause of death worldwide.",
        etiology: "Caused by **Mycobacterium tuberculosis** (Koch's bacillus). Risk factors include **HIV/AIDS**, malnutrition, overcrowding, immunosuppression, diabetes, smoking, and extremes of age. Close contact with active TB patients is the primary mode of transmission.",
        clinical: "**Pulmonary TB:** Chronic cough >2 weeks, hemoptysis, evening rise of temperature, night sweats, weight loss, anorexia. **Signs:** Crepitations in apex, post-tussive crepitations. **Extrapulmonary:** Lymph node TB (most common), pleural effusion, TB meningitis, Pott's spine, renal TB, intestinal TB.",
        diagnosis: "**Sputum AFB** (Acid-Fast Bacilli) smear — 3 consecutive morning samples. **Chest X-ray** — upper lobe infiltrates, cavitation, fibrosis. **Mantoux test** (TST) — ≥10mm induration positive. **GeneXpert/CBNAAT** — rapid molecular test (gold standard for drug resistance). **Culture** on Löwenstein-Jensen medium (gold standard but takes 6-8 weeks).",
        treatment: "**DOTS (Directly Observed Therapy, Short-course):** Intensive phase (2 months): **RIPE** — Rifampicin, Isoniazid, Pyrazinamide, Ethambutol. Continuation phase (4 months): Rifampicin + Isoniazid. **MDR-TB:** Second-line drugs (Fluoroquinolones, Aminoglycosides). **INH prophylaxis** for contacts and HIV patients.",
        complications: "Hemoptysis, pneumothorax, bronchiectasis, Aspergilloma (fungal ball in cavity), amyloidosis, respiratory failure. **Miliary TB** — hematogenous dissemination. **Drug side effects:** Hepatotoxicity (INH, Rifampicin, Pyrazinamide), optic neuritis (Ethambutol), peripheral neuropathy (INH — prevent with Pyridoxine/B6)."
    },
    "hypertension": {
        definition: "**Hypertension** is persistently elevated arterial blood pressure defined as **systolic BP ≥140 mmHg** and/or **diastolic BP ≥90 mmHg** (JNC 8) or ≥130/80 (ACC/AHA 2017). It is the most common modifiable cardiovascular risk factor and a leading cause of stroke, MI, and CKD.",
        etiology: "**Primary/Essential (90-95%):** No identifiable cause — genetic + environmental (high salt, obesity, stress, alcohol, sedentary lifestyle). **Secondary (5-10%):** Renal artery stenosis, pheochromocytoma, Cushing's syndrome, Conn's syndrome (primary aldosteronism), coarctation of aorta, thyroid disorders, OCPs.",
        clinical: "Usually **asymptomatic** ('silent killer'). Symptoms when severe: headache (especially occipital, morning), dizziness, blurred vision, epistaxis. **Target organ damage:** LVH, retinopathy (Keith-Wagener classification), nephrosclerosis, stroke, aortic dissection. **Hypertensive emergency:** BP >180/120 with end-organ damage.",
        diagnosis: "**BP measurement** on 2+ separate occasions. **Ambulatory BP monitoring (ABPM)** — gold standard for diagnosis. **Investigations:** Urinalysis, serum creatinine, electrolytes, lipid profile, blood glucose, ECG (LVH), echocardiography, fundoscopy. **Secondary causes workup** if <30 years, resistant, or sudden onset.",
        treatment: "**Lifestyle:** DASH diet, salt restriction (<5g/day), weight loss, exercise, limit alcohol. **First-line drugs:** ACE inhibitors (Enalapril), ARBs (Losartan), CCBs (Amlodipine), Thiazide diuretics (Hydrochlorothiazide). **With CKD/DM:** ACE-I/ARB preferred. **With HF:** ACE-I + Beta-blocker + Diuretic. **Pregnancy:** Labetalol, Methyldopa, Nifedipine (avoid ACE-I/ARBs).",
        complications: "**Cardiac:** LVH, coronary artery disease, heart failure. **Cerebral:** Stroke (hemorrhagic/ischemic), hypertensive encephalopathy. **Renal:** Nephrosclerosis, CKD. **Retinal:** Hypertensive retinopathy. **Vascular:** Aortic dissection, peripheral artery disease."
    },
    "asthma": {
        definition: "**Bronchial Asthma** is a chronic inflammatory airway disease characterized by **reversible airflow obstruction**, **bronchial hyperresponsiveness**, and **airway inflammation**. It presents with episodic wheezing, breathlessness, chest tightness, and cough, typically worse at night or early morning.",
        etiology: "**Allergic/Atopic (extrinsic):** House dust mites, pollen, animal dander, molds — associated with IgE-mediated Type I hypersensitivity, atopy, eczema, allergic rhinitis. **Non-allergic (intrinsic):** Exercise, cold air, infections, GERD, NSAIDs (aspirin-sensitive asthma — Samter's triad), occupational exposures, emotional stress.",
        clinical: "**Episodic** wheezing, dyspnea, chest tightness, cough (especially nocturnal). **Signs:** Tachypnea, prolonged expiration, bilateral expiratory wheeze, use of accessory muscles. **Status asthmaticus:** Severe acute asthma not responding to standard bronchodilators — medical emergency. **Silent chest** = ominous sign (severe obstruction).",
        diagnosis: "**Spirometry:** FEV1/FVC ratio <0.7, **reversibility** (>12% improvement in FEV1 post-bronchodilator). **Peak Expiratory Flow (PEF)** — diurnal variation >20%. **Methacholine challenge** — bronchial hyperresponsiveness. **Allergy testing:** Skin prick tests, serum IgE. **FeNO** (Fractional exhaled nitric oxide) — elevated in eosinophilic asthma.",
        treatment: "**Step-wise approach:** Step 1: SABA (Salbutamol) PRN. Step 2: Low-dose ICS (Budesonide). Step 3: ICS + LABA (Formoterol/Salmeterol). Step 4: Medium/high ICS + LABA. Step 5: Add oral steroids, biologics (Omalizumab for severe allergic). **Acute exacerbation:** Nebulized Salbutamol + Ipratropium + IV Hydrocortisone + O2. **Avoid beta-blockers in asthmatics!**",
        complications: "Status asthmaticus, pneumothorax, atelectasis, respiratory failure, chronic airway remodeling, growth retardation (in children on long-term steroids), oral candidiasis (from ICS — rinse mouth after use)."
    },
    "heart failure": {
        definition: "**Heart Failure (HF)** is a clinical syndrome where the heart is unable to pump sufficient blood to meet the body's metabolic demands, or can do so only at elevated filling pressures. Classified as **HFrEF** (EF ≤40%, systolic failure) or **HFpEF** (EF ≥50%, diastolic failure).",
        etiology: "**Most common cause:** Ischemic heart disease/CAD. Others: Hypertension, valvular heart disease (MR, AS), dilated cardiomyopathy, myocarditis, congenital heart disease. **Precipitating factors:** Infections, arrhythmias (AF), non-compliance, anemia, thyrotoxicosis, PE, drugs (NSAIDs, CCBs).",
        clinical: "**Left HF:** Dyspnea (exertional → orthopnea → PND), cough, hemoptysis, fatigue, bibasal crepitations, S3 gallop, displaced apex beat. **Right HF:** Peripheral edema, JVP elevation, hepatomegaly, ascites, hepatojugular reflux. **NYHA Classification:** I (no limitation) to IV (symptoms at rest).",
        diagnosis: "**BNP/NT-proBNP** — key diagnostic biomarker (elevated). **Echocardiography** — gold standard (EF assessment, wall motion, valves). **Chest X-ray** — cardiomegaly, pulmonary congestion, Kerley B lines, pleural effusion, bat-wing edema. **ECG** — LVH, arrhythmias, ischemic changes.",
        treatment: "**HFrEF (4 pillars):** 1. ACE-I/ARB/ARNI (Sacubitril-Valsartan). 2. Beta-blockers (Carvedilol, Bisoprolol, Metoprolol). 3. MRA (Spironolactone). 4. SGLT2i (Dapagliflozin). **Plus:** Loop diuretics (Furosemide) for congestion, Hydralazine+Nitrate (if ACE-I intolerant). **Devices:** ICD (sudden death prevention), CRT (dyssynchrony). **Last resort:** Heart transplant.",
        complications: "Cardiogenic shock, pleural effusion, arrhythmias (AF, VT), renal failure (cardiorenal syndrome), pulmonary hypertension, cardiac cachexia, thromboembolic events, sudden cardiac death."
    },
    "stroke": {
        definition: "**Stroke (Cerebrovascular Accident)** is an acute neurological deficit due to vascular injury to the brain lasting >24 hours. **Ischemic stroke** (85%) — thrombotic or embolic occlusion. **Hemorrhagic stroke** (15%) — intracerebral hemorrhage or subarachnoid hemorrhage.",
        etiology: "**Ischemic:** Atherosclerosis (most common), cardioembolism (AF, valvular disease), small vessel disease (lacunar). **Hemorrhagic:** Hypertension (most common cause of ICH), aneurysm rupture (SAH — berry aneurysm), AVM, coagulopathy, amyloid angiopathy. **Risk factors:** HTN, DM, smoking, AF, dyslipidemia, obesity.",
        clinical: "**Sudden onset** focal neurological deficit. **MCA stroke:** Contralateral hemiparesis (face + arm > leg), aphasia (dominant hemisphere), neglect (non-dominant). **ACA:** Contralateral leg weakness. **PCA:** Visual field defects, cortical blindness. **Brainstem/Posterior circulation:** Vertigo, diplopia, dysarthria, crossed signs. **SAH:** Thunderclap headache ('worst headache of life').",
        diagnosis: "**Non-contrast CT head** — FIRST investigation (to rule out hemorrhage). **CT angiography** — for large vessel occlusion. **MRI DWI** — most sensitive for acute ischemic stroke. **SAH:** CT head + lumbar puncture (xanthochromia). **Work-up:** ECG (AF), Echo, carotid Doppler, lipid profile, coagulation studies.",
        treatment: "**Ischemic:** IV **Alteplase (tPA)** within 4.5 hours of onset (door-to-needle <60min). **Mechanical thrombectomy** within 24 hours for large vessel occlusion. Aspirin within 24-48hrs. **Hemorrhagic:** BP control, reverse anticoagulation, neurosurgical evacuation if indicated. **Secondary prevention:** Antiplatelets, statins, anticoagulation for AF, carotid endarterectomy.",
        complications: "Cerebral edema, hemorrhagic transformation, aspiration pneumonia, DVT/PE, seizures, depression, spasticity, contractures, pressure ulcers, urinary infections."
    },
    "copd": {
        definition: "**Chronic Obstructive Pulmonary Disease (COPD)** is a progressive, irreversible airflow limitation characterized by chronic bronchitis (productive cough ≥3 months/year for ≥2 years) and/or emphysema (destruction of alveolar walls). It is defined by **FEV1/FVC <0.7** post-bronchodilator.",
        etiology: "**Smoking** — most important risk factor (≥90% of cases). Others: occupational dust/chemicals, indoor air pollution (biomass fuel), alpha-1 antitrypsin deficiency (young patients, panacinar emphysema, liver involvement), childhood respiratory infections, aging.",
        clinical: "Chronic progressive **dyspnea**, productive cough ('smoker's cough'), wheeze. **Pink puffer** (emphysema-predominant): thin, barrel chest, pursed lip breathing, hyperinflated lungs. **Blue bloater** (bronchitis-predominant): obese, cyanosed, peripheral edema, cor pulmonale. **Signs:** Hyperinflation, reduced breath sounds, prolonged expiration.",
        diagnosis: "**Spirometry** — FEV1/FVC <0.7 post-bronchodilator (definitive). **GOLD staging** by FEV1: Stage I (≥80%), II (50-79%), III (30-49%), IV (<30%). **CXR:** Hyperinflation, flattened diaphragm, bullae. **ABG:** Type 2 respiratory failure (hypoxia + hypercapnia). **Alpha-1 antitrypsin levels** if <45 years.",
        treatment: "**Smoking cessation** — MOST important intervention. **Bronchodilators:** SAMA (Ipratropium), SABA (Salbutamol), LAMA (Tiotropium), LABA (Salmeterol). **ICS** — only in frequent exacerbators/overlap with asthma. **O2 therapy** — LTOT if PaO2 <55mmHg (improves survival). **Pulmonary rehab**. **Acute exacerbation:** Nebulizers + systemic steroids + antibiotics if purulent sputum. **Surgical:** Lung volume reduction, transplant.",
        complications: "Acute exacerbations, cor pulmonale (right heart failure), respiratory failure, pneumothorax, polycythemia, pulmonary hypertension, depression, cachexia, osteoporosis."
    },
    "modern medical toxicology": {
        definition: "**Modern Medical Toxicology** is the branch of medicine dealing with the **diagnosis, management, and prevention of poisoning** and adverse effects of drugs, chemicals, biological agents, and environmental toxins. It encompasses clinical toxicology, forensic toxicology, occupational toxicology, and regulatory toxicology.",
        etiology: "**Common poisoning agents:** Organophosphates (insecticides), paracetamol (acetaminophen), corrosive acids/alkalis, opioids, benzodiazepines, heavy metals (lead, arsenic, mercury), carbon monoxide, snake/scorpion venom, mushroom poisoning, alcohol (methanol, ethanol), pesticides (aluminum phosphide — celphos).",
        clinical: "**Cholinergic toxidrome** (organophosphates): SLUDGE — Salivation, Lacrimation, Urination, Defecation, GI distress, Emesis + miosis, bradycardia, fasciculations. **Anticholinergic:** Mydriasis, tachycardia, dry skin, urinary retention, delirium. **Sympathomimetic:** HTN, tachycardia, mydriasis, hyperthermia. **Opioid:** Respiratory depression, miosis, CNS depression.",
        diagnosis: "**Detailed history** — substance, dose, time, route, intent (accidental vs suicidal). **Toxicological screening** — blood/urine drug screens. **ABG, electrolytes, blood glucose, renal/liver function**. **Specific levels:** Paracetamol (Rumack-Matthew nomogram), Salicylate, Digoxin, Lithium, Theophylline, Methanol/Ethylene glycol. **ECG** — QT prolongation, arrhythmias. **Anion gap/Osmolar gap** calculations.",
        treatment: "**ABC approach** — Airway, Breathing, Circulation stabilization. **Decontamination:** Activated charcoal (within 1-2 hrs), gastric lavage (rare), whole bowel irrigation. **Specific antidotes:** Atropine + Pralidoxime (organophosphates), NAC/N-acetylcysteine (paracetamol), Naloxone (opioids), Flumazenil (benzodiazepines), Desferrioxamine (iron), EDTA/Succimer (lead), Ethanol/Fomepizole (methanol/ethylene glycol). **Enhanced elimination:** Hemodialysis, urine alkalinization.",
        complications: "Multi-organ failure, aspiration pneumonia, ARDS, hepatic failure (paracetamol), renal failure, rhabdomyolysis, seizures, cardiac arrhythmias, permanent neurological damage, death."
    },
    "chronic kidney disease": {
        definition: "**Chronic Kidney Disease (CKD)** is defined as abnormalities of kidney structure or function present for >3 months. Classified by **GFR category** (G1-G5) and **albuminuria** (A1-A3). Stage 5 CKD (GFR <15 mL/min) = **End-Stage Renal Disease (ESRD)** requiring dialysis or transplant.",
        etiology: "**Most common causes:** Diabetic nephropathy (leading cause worldwide), hypertensive nephrosclerosis, chronic glomerulonephritis, polycystic kidney disease, obstructive uropathy, lupus nephritis, IgA nephropathy. Risk factors: family history, obesity, smoking, NSAIDs overuse, recurrent UTIs.",
        clinical: "**Early stages:** Often asymptomatic. **Advanced CKD/Uremia:** Fatigue, anorexia, nausea, pruritus, edema, oliguria, nocturia. **Uremic syndrome:** Pericarditis, encephalopathy, peripheral neuropathy, uremic frost. **Complications:** Anemia (↓EPO), renal osteodystrophy (secondary hyperparathyroidism), metabolic acidosis, hyperkalemia, fluid overload.",
        diagnosis: "**eGFR** (CKD-EPI equation) — key staging parameter. **Serum creatinine, BUN** — elevated. **Urinalysis** — proteinuria, hematuria, casts. **UACR** (urine albumin-creatinine ratio) — microalbuminuria >30 mg/g. **Renal ultrasound** — small kidneys (bilateral), increased echogenicity. **Labs:** Hyperkalemia, hyperphosphatemia, hypocalcemia, metabolic acidosis, anemia.",
        treatment: "**Slow progression:** Tight BP control (<130/80 — ACE-I/ARBs), glycemic control in DM, SGLT2 inhibitors (renoprotective), low-protein diet. **Manage complications:** EPO + iron for anemia, phosphate binders + vitamin D for bone disease, bicarbonate for acidosis, restrict K+. **Stage 5:** Hemodialysis, peritoneal dialysis, or **renal transplant** (best long-term outcome).",
        complications: "Cardiovascular disease (leading cause of death in CKD), anemia, mineral bone disorder, hyperkalemia (cardiac arrest risk), metabolic acidosis, malnutrition, infections, calciphylaxis."
    },
    "thyroid disorders": {
        definition: "**Thyroid disorders** encompass conditions of abnormal thyroid hormone production. **Hypothyroidism** — decreased T3/T4 (most common: Hashimoto's thyroiditis). **Hyperthyroidism** — excess T3/T4 (most common: Graves' disease). The thyroid gland produces T4 (thyroxine) and T3 (triiodothyronine), regulated by TSH from the anterior pituitary.",
        etiology: "**Hypothyroidism:** Hashimoto's (autoimmune — anti-TPO antibodies), iodine deficiency (worldwide), post-thyroidectomy, radioiodine therapy, drugs (lithium, amiodarone). **Hyperthyroidism:** Graves' disease (TSI antibodies — most common cause), toxic multinodular goiter, toxic adenoma, thyroiditis, excessive iodine (Jod-Basedow).",
        clinical: "**Hypothyroidism:** Fatigue, weight gain, cold intolerance, constipation, dry skin, bradycardia, delayed reflexes, myxedema, hoarse voice, menorrhagia. **Hyperthyroidism:** Weight loss, heat intolerance, palpitations, tremor, anxiety, diarrhea, tachycardia/AF, exophthalmos and pretibial myxedema (Graves'-specific), lid lag, thyroid bruit.",
        diagnosis: "**TSH** — FIRST-LINE screening test. **Hypothyroidism:** ↑TSH, ↓Free T4. **Hyperthyroidism:** ↓TSH, ↑Free T3/T4. **Antibodies:** Anti-TPO (Hashimoto's), TSI/TRAb (Graves'). **Radioiodine uptake scan:** Diffuse uptake (Graves'), hot nodule (toxic adenoma), low uptake (thyroiditis). **Ultrasound** for nodules — TIRADS classification.",
        treatment: "**Hypothyroidism:** Levothyroxine (synthetic T4) — lifelong replacement. Monitor TSH every 6-8 weeks until stable. **Hyperthyroidism:** Anti-thyroid drugs — **Carbimazole/Methimazole** (first-line), Propylthiouracil (PTU — preferred in 1st trimester pregnancy). **Beta-blockers** for symptom control. **Radioiodine ablation** (I-131) — definitive treatment. **Thyroidectomy** — for large goiter, malignancy, or failed medical therapy.",
        complications: "**Hypothyroid:** Myxedema coma (emergency — IV levothyroxine + hydrocortisone), hyperlipidemia, infertility. **Hyperthyroid:** Thyroid storm (tachycardia, hyperthermia, delirium — Rx: PTU + Lugol's iodine + beta-blocker + steroids), AF, osteoporosis, heart failure."
    },
    "liver cirrhosis": {
        definition: "**Liver cirrhosis** is the end-stage of chronic liver disease characterized by **diffuse fibrosis** and replacement of normal hepatic architecture by **regenerative nodules**. It leads to portal hypertension and progressive hepatic insufficiency.",
        etiology: "**Alcohol** (most common in West), **Hepatitis B and C** (most common worldwide), **NAFLD/NASH** (rising rapidly), autoimmune hepatitis, primary biliary cholangitis (anti-mitochondrial antibodies), Wilson's disease, hemochromatosis, alpha-1 antitrypsin deficiency, drugs (methotrexate), Budd-Chiari syndrome.",
        clinical: "**Compensated:** Often asymptomatic, hepatomegaly. **Decompensated:** Jaundice, ascites, variceal bleeding, hepatic encephalopathy, spider angiomas, palmar erythema, gynecomastia, testicular atrophy, caput medusae, splenomegaly, asterixis (flapping tremor). **Child-Pugh score** (A/B/C) classifies severity.",
        diagnosis: "**LFTs:** ↑Bilirubin, ↓Albumin, prolonged PT/INR. **Imaging:** Ultrasound (coarse echotexture, nodular liver, ascites, splenomegaly), FibroScan (elastography — non-invasive fibrosis assessment). **Liver biopsy** — gold standard (rarely needed now). **Endoscopy** — esophageal/gastric varices. **AFP** — screen for hepatocellular carcinoma every 6 months.",
        treatment: "**Treat underlying cause:** Alcohol abstinence, antivirals (Hepatitis B/C). **Ascites:** Salt restriction + Spironolactone ± Furosemide, large-volume paracentesis, TIPS. **Variceal bleeding:** Band ligation (prevention), octreotide + antibiotics (acute bleed), propranolol (secondary prevention). **Encephalopathy:** Lactulose + Rifaximin. **Liver transplant** — definitive treatment for decompensated cirrhosis.",
        complications: "Portal hypertension, esophageal variceal hemorrhage, spontaneous bacterial peritonitis (SBP), hepatorenal syndrome, hepatopulmonary syndrome, hepatocellular carcinoma (HCC), coagulopathy."
    },
    "anemia": {
        definition: "**Anemia** is a condition where hemoglobin concentration is below normal for age and sex (**Males <13 g/dL, Females <12 g/dL, Pregnant <11 g/dL** per WHO). It indicates reduced oxygen-carrying capacity of blood and can be classified morphologically (microcytic, normocytic, macrocytic) or by mechanism (decreased production, increased destruction, blood loss).",
        etiology: "**Microcytic (MCV <80):** Iron deficiency (most common cause worldwide), thalassemia, sideroblastic, chronic disease. **Normocytic (MCV 80-100):** Acute blood loss, chronic disease, CKD (↓EPO), aplastic anemia, hemolysis. **Macrocytic (MCV >100):** Vitamin B12 deficiency, folate deficiency, liver disease, hypothyroidism, myelodysplastic syndrome, drugs (methotrexate).",
        clinical: "**General:** Fatigue, pallor, dyspnea on exertion, tachycardia, palpitations, dizziness. **Iron deficiency specific:** Koilonychia (spoon nails), angular cheilitis, glossitis, pica, Plummer-Vinson syndrome (dysphagia + web). **B12 deficiency:** Peripheral neuropathy, subacute combined degeneration of spinal cord (SACD), glossitis, dementia. **Hemolytic:** Jaundice, splenomegaly, dark urine.",
        diagnosis: "**CBC:** Low Hb, assess MCV for classification. **Iron studies:** ↓Ferritin, ↓serum iron, ↑TIBC (iron deficiency). **Peripheral smear:** Target cells (thalassemia), hypersegmented neutrophils (B12/folate), spherocytes (hereditary spherocytosis/autoimmune), sickle cells. **Reticulocyte count:** Low (production failure) vs High (hemolysis/blood loss). **Special:** Hb electrophoresis (thalassemia), Coombs test (autoimmune), bone marrow biopsy.",
        treatment: "**Iron deficiency:** Oral ferrous sulfate (best absorbed empty stomach with vitamin C), IV iron (if intolerant/malabsorption). **B12 deficiency:** IM Hydroxocobalamin injections. **Folate:** Oral folic acid. **Hemolytic:** Steroids (autoimmune), splenectomy, folic acid supplementation. **CKD anemia:** Erythropoietin (EPO) + IV iron. **Aplastic:** Bone marrow transplant, immunosuppression.",
        complications: "High-output cardiac failure, angina, growth retardation (children), neural tube defects (folate deficiency in pregnancy), irreversible neurological damage (B12 if untreated)."
    },
    "epilepsy": {
        definition: "**Epilepsy** is a chronic neurological disorder characterized by **recurrent, unprovoked seizures** (≥2 seizures >24 hours apart). Seizures result from excessive, synchronous neuronal electrical activity. Classified as **focal** (arising from one hemisphere) or **generalized** (involving both hemispheres from onset).",
        etiology: "**Idiopathic/Genetic** (most common in children). **Structural:** Brain tumors, stroke, traumatic brain injury, cortical malformations. **Infectious:** Meningitis, encephalitis, neurocysticercosis (most common cause in developing countries). **Metabolic:** Electrolyte disturbances, hypoglycemia, uremia. **Triggers:** Sleep deprivation, alcohol, flickering lights, stress, fever (febrile seizures in children).",
        clinical: "**Generalized tonic-clonic (GTCS):** Sudden LOC, tonic phase (stiffening) → clonic phase (rhythmic jerking), tongue bite, incontinence, post-ictal confusion. **Absence:** Brief staring spells, 3Hz spike-wave on EEG (children). **Focal:** Depends on involved area — motor, sensory, temporal lobe (déjà vu, automatisms). **Status epilepticus:** Seizure >5 minutes or recurrent without recovery — medical emergency.",
        diagnosis: "**EEG** — most important investigation (interictal spikes, sharp waves). **MRI brain** — to identify structural causes. **Blood tests:** Glucose, electrolytes, calcium, magnesium, toxicology screen. **Video EEG monitoring** — for characterization and surgical planning. **Lumbar puncture** — if infection suspected.",
        treatment: "**First-line AEDs:** Sodium Valproate (generalized), Carbamazepine (focal), Ethosuximide (absence only), Levetiracetam (broad-spectrum). **Pregnancy:** Lamotrigine or Levetiracetam preferred (least teratogenic). **Valproate is CONTRAINDICATED in women of childbearing age** (neural tube defects). **Status epilepticus:** IV Lorazepam → IV Phenytoin → IV Phenobarbital → General anesthesia. **Surgery:** Temporal lobectomy for refractory temporal lobe epilepsy.",
        complications: "SUDEP (Sudden Unexpected Death in Epilepsy), status epilepticus, injuries from falls, driving restrictions, psychosocial impact, drug side effects (teratogenicity, hepatotoxicity, Stevens-Johnson syndrome with Carbamazepine/Phenytoin)."
    },
    "dengue": {
        definition: "**Dengue** is an acute viral illness caused by the **Dengue virus** (DENV — Flavivirus family, serotypes 1-4) transmitted by **Aedes aegypti** mosquitoes (day-biting). It ranges from mild dengue fever to severe **Dengue Hemorrhagic Fever (DHF)** and **Dengue Shock Syndrome (DSS)**.",
        etiology: "**Dengue virus** (4 serotypes: DENV 1-4). Second infection with a *different* serotype increases risk of severe dengue (**antibody-dependent enhancement — ADE**). **Vector:** Aedes aegypti (primary), Aedes albopictus. **Incubation:** 4-10 days. Endemic in tropical/subtropical regions.",
        clinical: "**Dengue Fever:** High fever (104°F, 'breakbone fever'), severe headache, retro-orbital pain, myalgia, arthralgia, maculopapular rash, leukopenia. **Warning signs:** Abdominal pain, persistent vomiting, mucosal bleeding, hepatomegaly, ↑Hct with ↓platelets, lethargy. **DHF:** Plasma leakage (↑hematocrit >20%), hemorrhagic manifestations, thrombocytopenia (<100,000). **DSS:** Circulatory failure, rapid/weak pulse, hypotension.",
        diagnosis: "**NS1 antigen** — positive in first 1-5 days (early diagnosis). **IgM antibodies** — positive after day 5 (ELISA). **IgG** — past infection or secondary infection. **CBC:** Leukopenia, thrombocytopenia, ↑hematocrit (hemoconcentration = plasma leak). **RT-PCR** — confirmatory (serotype identification). **Tourniquet test** — ≥20 petechiae in 1 inch² = positive.",
        treatment: "**NO specific antiviral.** **Supportive care:** Oral/IV fluids (most important), paracetamol for fever/pain, avoid NSAIDs and aspirin (bleeding risk), monitor hematocrit and platelets. **DHF/DSS:** Aggressive IV fluid resuscitation (isotonic crystalloids), colloids if refractory. **Platelet transfusion** only if active hemorrhage or count <10,000. **Monitor for fluid overload** during reabsorption phase.",
        complications: "Dengue hemorrhagic fever, dengue shock syndrome, multi-organ failure, liver failure, encephalitis, myocarditis, DIC, massive bleeding, death (1-5% fatality in severe dengue if untreated)."
    },
    "peptic ulcer disease": {
        definition: "**Peptic Ulcer Disease (PUD)** refers to ulceration of the gastric or duodenal mucosa that extends through the muscularis mucosae. **Duodenal ulcers (DU)** are 4x more common than gastric ulcers (GU). Caused primarily by **H. pylori** infection or **NSAID** use.",
        etiology: "**H. pylori infection** — most common cause (90% DU, 70% GU). **NSAIDs** — second most common cause (inhibit prostaglandin synthesis → ↓mucosal protection). **Zollinger-Ellison syndrome** (gastrinoma — ↑gastric acid). Other: Smoking, alcohol, stress (Curling's ulcer — burns; Cushing's ulcer — brain injury), steroid use.",
        clinical: "**Duodenal ulcer:** Epigastric pain — 'hunger pain' relieved by food, worse 2-3 hours after meals and at night. **Gastric ulcer:** Pain worsened by food. **Complications:** Hemorrhage (melena, hematemesis), perforation (sudden severe epigastric pain, board-like rigidity, air under diaphragm on X-ray), pyloric stenosis (projectile vomiting, succussion splash), malignant transformation (GU Only — DU does NOT undergo malignant change).",
        diagnosis: "**Upper GI Endoscopy (OGD)** — gold standard (direct visualization + biopsy). **H. pylori testing:** Rapid urease test (CLO test — biopsy), urea breath test (non-invasive gold standard), stool antigen test, serology. **Barium meal** — ulcer crater, niche. **Serum gastrin** — if Zollinger-Ellison suspected.",
        treatment: "**H. pylori eradication (Triple therapy):** PPI (Omeprazole) + Amoxicillin + Clarithromycin for 14 days. **PPI therapy** — Omeprazole, Pantoprazole (4-8 weeks for healing). **Stop NSAIDs** if possible; if not, add PPI prophylaxis. **Antacids, H2 blockers** (Ranitidine — adjunctive). **Sucralfate** — mucosal protectant. **Surgery:** For complications — perforation (Graham patch), hemorrhage (underrun bleeding vessel), pyloric stenosis.",
        complications: "GI hemorrhage (most common complication), perforation (pneumoperitoneum), gastric outlet obstruction (pyloric stenosis), penetration into pancreas, malignant transformation (gastric ulcers only)."
    }
};

// ─── Smart topic lookup ──────────────────────────────────────
export function findKnowledge(query) {
    if (!query) return null;
    const q = query.toLowerCase().trim();

    // Direct match
    if (knowledgeBase[q]) return { topic: q, ...knowledgeBase[q] };

    // Partial/fuzzy match
    for (const [key, data] of Object.entries(knowledgeBase)) {
        if (q.includes(key) || key.includes(q)) {
            return { topic: key, ...data };
        }
    }

    // Common aliases
    const aliases = {
        'tb': 'tuberculosis', 'htn': 'hypertension', 'bp': 'hypertension',
        'blood pressure': 'hypertension', 'high blood pressure': 'hypertension',
        'bronchial asthma': 'asthma', 'wheezing': 'asthma',
        'chf': 'heart failure', 'congestive heart failure': 'heart failure', 'ccf': 'heart failure',
        'cva': 'stroke', 'cerebrovascular': 'stroke', 'brain attack': 'stroke', 'paralysis': 'stroke',
        'emphysema': 'copd', 'chronic bronchitis': 'copd',
        'toxicology': 'modern medical toxicology', 'poisoning': 'modern medical toxicology', 'overdose': 'modern medical toxicology',
        'ckd': 'chronic kidney disease', 'kidney failure': 'chronic kidney disease', 'renal failure': 'chronic kidney disease', 'esrd': 'chronic kidney disease',
        'thyroid': 'thyroid disorders', 'hypothyroidism': 'thyroid disorders', 'hyperthyroidism': 'thyroid disorders', 'graves': 'thyroid disorders', 'hashimoto': 'thyroid disorders',
        'cirrhosis': 'liver cirrhosis', 'liver disease': 'liver cirrhosis', 'liver failure': 'liver cirrhosis',
        'iron deficiency': 'anemia', 'b12 deficiency': 'anemia', 'low hemoglobin': 'anemia',
        'seizure': 'epilepsy', 'seizures': 'epilepsy', 'fits': 'epilepsy', 'convulsion': 'epilepsy',
        'dengue fever': 'dengue', 'dhf': 'dengue', 'breakbone fever': 'dengue',
        'pud': 'peptic ulcer disease', 'gastric ulcer': 'peptic ulcer disease', 'duodenal ulcer': 'peptic ulcer disease', 'ulcer': 'peptic ulcer disease',
    };

    for (const [alias, key] of Object.entries(aliases)) {
        if (q.includes(alias)) {
            return { topic: key, ...knowledgeBase[key] };
        }
    }

    return null;
}

// ─── Get available topics list ───────────────────────────────
export function getKnowledgeTopics() {
    return Object.keys(knowledgeBase).map(k => k.charAt(0).toUpperCase() + k.slice(1));
}

export default knowledgeBase;
