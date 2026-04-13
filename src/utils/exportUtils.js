import jsPDF from 'jspdf';

/**
 * Export notes as PDF
 */
export function exportNotesPDF(topicData) {
    if (!topicData) return;
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    let y = margin;

    const addText = (text, opts = {}) => {
        const { fontSize = 10, fontStyle = 'normal', color = [30, 30, 30], spacing = 6 } = opts;
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, pageWidth);
        lines.forEach(line => {
            if (y > 270) { doc.addPage(); y = margin; }
            doc.text(line, margin, y);
            y += spacing;
        });
        y += 2;
    };

    const addSection = (title, content) => {
        if (!content) return;
        y += 4;
        addText(title, { fontSize: 14, fontStyle: 'bold', color: [6, 150, 120] });
        if (typeof content === 'string') {
            addText(content.replace(/\*\*/g, ''), { fontSize: 10 });
        } else if (Array.isArray(content)) {
            content.forEach(item => {
                addText('• ' + item.replace(/\*\*/g, '').replace(/\n/g, ' '), { fontSize: 9.5, color: [50, 50, 50] });
            });
        }
    };

    // Title
    addText('MedGenius — Lecture Notes', { fontSize: 8, color: [100, 100, 100] });
    addText(topicData.title || 'Medical Notes', { fontSize: 20, fontStyle: 'bold', color: [6, 180, 140], spacing: 10 });
    addText(topicData.category || 'General Medicine', { fontSize: 10, color: [100, 100, 100] });
    y += 6;

    // Sections
    const { sections } = topicData;
    if (sections) {
        addSection('Definition', sections.definition);
        addSection('Etiology', sections.etiology);
        addSection('Pathophysiology', sections.pathophysiology);
        addSection('Clinical Features', sections.clinicalFeatures);
        addSection('Diagnosis', sections.diagnosis);
        addSection('Management', sections.management);
    }

    // High Yield Points
    if (topicData.highYieldPoints?.length) {
        y += 4;
        addText('HIGH-YIELD EXAM POINTS', { fontSize: 14, fontStyle: 'bold', color: [200, 160, 0] });
        topicData.highYieldPoints.forEach(p => {
            addText('📌 ' + p.replace(/\*\*/g, ''), { fontSize: 9.5 });
        });
    }

    doc.save(`MedGenius_${(topicData.title || 'Notes').replace(/\s+/g, '_')}.pdf`);
}

/**
 * Export flashcards as PDF
 */
export function exportFlashcardsPDF(topicData) {
    if (!topicData?.flashcards) return;
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    let y = margin;

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('MedGenius — Flashcards', margin, y);
    y += 8;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 180, 140);
    doc.text(`${topicData.title} — Flashcards`, margin, y);
    y += 14;

    topicData.flashcards.forEach((card, i) => {
        if (y > 250) { doc.addPage(); y = margin; }

        // Card number
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 100, 100);
        doc.text(`CARD ${i + 1} [${card.category.toUpperCase()}]`, margin, y);
        y += 6;

        // Question
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        const qLines = doc.splitTextToSize('Q: ' + card.front, pageWidth);
        qLines.forEach(line => { doc.text(line, margin, y); y += 6; });

        // Answer
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        const aLines = doc.splitTextToSize('A: ' + card.back.replace(/\*\*/g, '').replace(/\n/g, ' '), pageWidth);
        aLines.forEach(line => { doc.text(line, margin, y); y += 5.5; });

        y += 4;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, margin + pageWidth, y);
        y += 6;
    });

    doc.save(`MedGenius_Flashcards_${(topicData.title || 'Cards').replace(/\s+/g, '_')}.pdf`);
}

/**
 * Export quiz results as PDF
 */
export function exportQuizResultsPDF(topicData, answers, submitted, score, totalQuestions) {
    if (!topicData?.quiz) return;
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    let y = margin;

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('MedGenius — Quiz Results', margin, y);
    y += 8;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 180, 140);
    doc.text(`${topicData.title} — Quiz Results`, margin, y);
    y += 10;

    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(`Score: ${score} / ${totalQuestions} (${Math.round((score / totalQuestions) * 100)}%)`, margin, y);
    y += 14;

    topicData.quiz.forEach((q, i) => {
        if (y > 250) { doc.addPage(); y = margin; }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        const qLines = doc.splitTextToSize(`${i + 1}. ${q.question}`, pageWidth);
        qLines.forEach(line => { doc.text(line, margin, y); y += 5.5; });

        const userAnswer = answers[i];
        const isCorrect = submitted[i];

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        if (userAnswer !== undefined) {
            doc.setTextColor(isCorrect ? 0 : 200, isCorrect ? 150 : 50, isCorrect ? 100 : 50);
            doc.text(`Your answer: ${String.fromCharCode(65 + userAnswer)}. ${q.options[userAnswer]} ${isCorrect ? '✓' : '✗'}`, margin + 4, y);
            y += 5;
        }
        doc.setTextColor(0, 130, 100);
        doc.text(`Correct: ${String.fromCharCode(65 + q.correct)}. ${q.options[q.correct]}`, margin + 4, y);
        y += 8;
    });

    doc.save(`MedGenius_Quiz_${(topicData.title || 'Results').replace(/\s+/g, '_')}.pdf`);
}
