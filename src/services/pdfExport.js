/**
 * Service d'export PDF du bulletin
 * Utilise window.print() avec une nouvelle fenêtre stylée pour générer un PDF
 * Cette méthode est plus fiable dans les extensions Chrome
 */

/**
 * Formate une note pour l'affichage
 */
const formatGrade = (grade) => {
    if (grade === null || grade === undefined || grade === '~') return '-';
    const val = parseFloat(grade);
    return isNaN(val) ? '-' : val.toFixed(2);
};

/**
 * Retourne une classe CSS selon la note
 */
const getGradeClass = (grade) => {
    const val = parseFloat(grade);
    if (isNaN(val)) return '';
    if (val >= 16) return 'grade-excellent';
    if (val >= 14) return 'grade-good';
    if (val >= 10) return 'grade-average';
    if (val >= 8) return 'grade-warning';
    return 'grade-danger';
};

/**
 * Génère le contenu HTML stylé pour le PDF
 */
const generatePdfContent = (data) => {
    const { relevé, totauxAbsences } = data;
    const { etudiant, formation, semestre, ues, ressources } = relevé;
    const absStats = totauxAbsences?.absent || { non_justifie: { heure: 0 }, justifie: { heure: 0 } };

    // Générer les UEs
    let uesHtml = '';
    if (ues) {
        Object.entries(ues).forEach(([code, ue]) => {
            let resourcesHtml = '';
            if (ue.ressources) {
                Object.entries(ue.ressources).forEach(([resCode, res]) => {
                    const resTitle = ressources?.[resCode]?.titre || resCode;
                    resourcesHtml += `
                        <div class="pdf-resource">
                            <span>${resCode} - ${resTitle}</span>
                            <span class="${getGradeClass(res.moyenne)}">${formatGrade(res.moyenne)}</span>
                        </div>
                    `;
                });
            }

            uesHtml += `
                <div class="pdf-ue">
                    <div class="pdf-ue-header">
                        <div>
                            <span class="pdf-ue-code">${code}</span>
                            <span class="pdf-ue-title"> - ${ue.titre}</span>
                        </div>
                        <span class="pdf-ue-grade ${getGradeClass(ue.moyenne?.value)}">${formatGrade(ue.moyenne?.value)}/20</span>
                    </div>
                    <div class="pdf-resources">${resourcesHtml}</div>
                </div>
            `;
        });
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Relevé BetterScoDoc - ${etudiant?.prenom} ${etudiant?.nom}</title>
            <style>
                @media print {
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1a1a2e; line-height: 1.4; background: white; }
                .pdf-container { padding: 30px; max-width: 800px; margin: 0 auto; }
                .pdf-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
                .pdf-logo { font-size: 32px; margin-bottom: 10px; }
                .pdf-title { font-size: 24px; color: #3b82f6; margin-bottom: 5px; }
                .pdf-subtitle { font-size: 14px; color: #666; }
                .pdf-student-info { display: flex; justify-content: space-between; margin-bottom: 25px; padding: 15px; background: #f8fafc; border-radius: 8px; }
                .pdf-student-name { font-size: 18px; font-weight: bold; }
                .pdf-student-details { font-size: 12px; color: #666; margin-top: 5px; }
                .pdf-stats { display: flex; justify-content: space-around; margin-bottom: 25px; text-align: center; }
                .pdf-stat { padding: 15px 25px; background: #f0f9ff; border-radius: 8px; }
                .pdf-stat-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
                .pdf-stat-label { font-size: 11px; color: #666; margin-top: 5px; }
                .pdf-section { margin-bottom: 25px; }
                .pdf-section-title { font-size: 16px; font-weight: bold; color: #1a1a2e; margin-bottom: 12px; padding-bottom: 5px; border-bottom: 1px solid #e2e8f0; }
                .pdf-ue { margin-bottom: 15px; padding: 12px; background: #fafafa; border-radius: 6px; border-left: 3px solid #3b82f6; }
                .pdf-ue-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
                .pdf-ue-code { font-weight: bold; color: #3b82f6; }
                .pdf-ue-title { color: #333; font-size: 13px; }
                .pdf-ue-grade { font-weight: bold; }
                .pdf-resources { padding-left: 15px; }
                .pdf-resource { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; border-bottom: 1px solid #f0f0f0; }
                .pdf-resource:last-child { border-bottom: none; }
                .pdf-footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; padding-top: 15px; border-top: 1px solid #e2e8f0; }
                .grade-excellent { color: #3b82f6 !important; }
                .grade-good { color: #22c55e !important; }
                .grade-average { color: #333 !important; }
                .grade-warning { color: #f59e0b !important; }
                .grade-danger { color: #ef4444 !important; }
                .print-btn { 
                    position: fixed; top: 20px; right: 20px; 
                    padding: 12px 24px; background: #3b82f6; color: white; 
                    border: none; border-radius: 8px; font-size: 16px; cursor: pointer;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }
                .print-btn:hover { background: #2563eb; }
                @media print { .print-btn { display: none; } }
            </style>
        </head>
        <body>
            <button class="print-btn" onclick="window.print()">📄 Imprimer / Enregistrer PDF</button>
            
            <div class="pdf-container">
                <div class="pdf-header">
                    <div class="pdf-logo">🎓</div>
                    <div class="pdf-title">Relevé de Notes - BetterScoDoc</div>
                    <div class="pdf-subtitle">${formation?.titre || 'B.U.T'} - Semestre ${semestre?.numero}</div>
                </div>

                <div class="pdf-student-info">
                    <div>
                        <div class="pdf-student-name">${etudiant?.prenom} ${etudiant?.nom}</div>
                        <div class="pdf-student-details">
                            📧 ${etudiant?.email || 'N/A'}<br>
                            🆔 ${etudiant?.code_nip || 'N/A'}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div class="pdf-student-details">
                            Année ${semestre?.annee_universitaire || 'N/A'}<br>
                            ${semestre?.date_debut || ''} → ${semestre?.date_fin || ''}
                        </div>
                    </div>
                </div>

                <div class="pdf-stats">
                    <div class="pdf-stat">
                        <div class="pdf-stat-value ${getGradeClass(semestre?.notes?.value)}">${formatGrade(semestre?.notes?.value)}</div>
                        <div class="pdf-stat-label">Moyenne Générale</div>
                    </div>
                    <div class="pdf-stat">
                        <div class="pdf-stat-value">${semestre?.rang?.value || '-'}/${semestre?.rang?.total || '-'}</div>
                        <div class="pdf-stat-label">Rang</div>
                    </div>
                    <div class="pdf-stat">
                        <div class="pdf-stat-value">${semestre?.ECTS?.acquis || 0}/${semestre?.ECTS?.total || 30}</div>
                        <div class="pdf-stat-label">ECTS</div>
                    </div>
                    <div class="pdf-stat">
                        <div class="pdf-stat-value" style="color: #ef4444 !important;">${absStats.non_justifie?.heure || 0}h</div>
                        <div class="pdf-stat-label">Abs. non justifiées</div>
                    </div>
                </div>

                <div class="pdf-section">
                    <div class="pdf-section-title">📚 Unités d'Enseignement</div>
                    ${uesHtml}
                </div>

                <div class="pdf-footer">
                    Généré par BetterScoDoc le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}<br>
                    Ce document est un relevé non officiel.
                </div>
            </div>
        </body>
        </html>
    `;
};

/**
 * Exporte le bulletin en PDF
 * Ouvre une nouvelle fenêtre avec le contenu formaté et le dialogue d'impression
 */
export const exportToPdf = async (data) => {
    try {
        const content = generatePdfContent(data);

        // Ouvrir une nouvelle fenêtre avec le contenu
        const printWindow = window.open('', '_blank', 'width=800,height=900');

        if (!printWindow) {
            alert('Veuillez autoriser les popups pour exporter le PDF');
            return false;
        }

        printWindow.document.write(content);
        printWindow.document.close();

        // Attendre le chargement puis lancer l'impression
        printWindow.onload = () => {
            // Focus sur la fenêtre pour une meilleure UX
            printWindow.focus();
        };

        return true;
    } catch (error) {
        console.error('[BetterScoDoc] Erreur export PDF:', error);
        throw error;
    }
};
