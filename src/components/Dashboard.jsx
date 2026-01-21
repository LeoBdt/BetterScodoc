import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { EvolutionChart } from './EvolutionChart';
import { exportToPdf } from '../services/pdfExport';
import { calculatePercentile, getPercentileLabel } from '../services/gradeNotifications';

export function Dashboard({ data, allSemesters = [] }) {
    const [selectedEval, setSelectedEval] = useState(null);
    const [exporting, setExporting] = useState(false);

    if (!data?.relevé) {
        return (
            <div className="loading-state">
                <div className="spinner spinner-large"></div>
                <p>Chargement des données...</p>
            </div>
        );
    }

    const { relevé, absences, totauxAbsences } = data;
    const { etudiant, formation, semestre, ues, ressources, saes } = relevé;

    const getGradeColor = (grade) => {
        if (grade === null || grade === undefined || grade === '~') return 'neutral';
        const val = parseFloat(grade);
        if (isNaN(val)) return 'neutral';
        if (val >= 16) return 'excellent';
        if (val >= 14) return 'good';
        if (val >= 10) return 'average';
        if (val >= 8) return 'warning';
        return 'danger';
    };

    const formatGrade = (grade) => {
        if (grade === null || grade === undefined || grade === '~') return '-';
        const val = parseFloat(grade);
        return isNaN(val) ? '-' : val.toFixed(2);
    };

    // Obtenir le statut de validation d'une UE depuis semestre.decision_ue
    const getValidationStatus = (ueCode) => {
        // Chercher dans decision_ue par acronyme
        const decisionUe = semestre?.decision_ue?.find(d => d.acronyme === ueCode);
        if (!decisionUe?.code) return null;

        const decision = decisionUe.code;

        const statusMap = {
            'ADM': { label: 'Admis', class: 'status-admis', icon: '✅' },
            'ADJ': { label: 'Admis jury', class: 'status-admis', icon: '✅' },
            'CMP': { label: 'Compensé', class: 'status-compense', icon: '🔄' },
            'AJ': { label: 'Ajourné', class: 'status-ajourne', icon: '❌' },
            'ATT': { label: 'En attente', class: 'status-attente', icon: '⏳' },
            'DEF': { label: 'Défaillant', class: 'status-defaillant', icon: '⚠️' },
            'RAT': { label: 'Rattrapage', class: 'status-rattrapage', icon: '🔁' },
            'ABS': { label: 'Absent', class: 'status-absent', icon: '🚫' },
        };

        return statusMap[decision.toUpperCase()] || { label: decision, class: 'status-autre', icon: '📋' };
    };

    // Obtenir le statut de la décision année
    const getDecisionAnnee = () => {
        const decision = semestre?.decision_annee?.code;
        if (!decision) return null;

        const statusMap = {
            'ADM': { label: 'Admis', class: 'status-admis', icon: '✅' },
            'ADJ': { label: 'Admis jury', class: 'status-admis', icon: '✅' },
            'AJ': { label: 'Ajourné', class: 'status-ajourne', icon: '❌' },
            'ATT': { label: 'En attente', class: 'status-attente', icon: '⏳' },
            'PASD': { label: 'Passage différé', class: 'status-attente', icon: '⏳' },
            'PAS1NCI': { label: 'Passage', class: 'status-admis', icon: '✅' },
            'RED': { label: 'Redoublement', class: 'status-rattrapage', icon: '🔁' },
        };

        return statusMap[decision.toUpperCase()] || { label: decision, class: 'status-autre', icon: '📋' };
    };

    // Obtenir le titre d'une SAE
    const getSaeTitle = (saeCode) => {
        return saes?.[saeCode]?.titre || saeCode;
    };

    const absStats = totauxAbsences?.absent || { non_justifie: { heure: 0 }, justifie: { heure: 0 } };

    // Générer les données de l'histogramme basées sur min/max/moy
    const generateHistogram = (eval_) => {
        const min = parseFloat(eval_.note?.min) || 0;
        const max = parseFloat(eval_.note?.max) || 20;
        const moy = parseFloat(eval_.note?.moy) || 10;
        const userNote = parseFloat(eval_.note?.value);

        // Créer une distribution approximative
        const bars = [];
        for (let i = 0; i <= 20; i += 2) {
            // Distribution en cloche centrée autour de la moyenne
            const distance = Math.abs(i - moy);
            const height = Math.max(5, 100 - (distance * 8));
            const isUser = !isNaN(userNote) && userNote >= i && userNote < i + 2;
            bars.push({ range: `${i}-${i + 2}`, height, isUser });
        }
        return bars;
    };

    return (
        <div className="dashboard">
            {/* Modale des détails d'évaluation - rendue dans un portail pour un bon positionnement */}
            {selectedEval && createPortal(
                <div className="modal-overlay" onClick={() => setSelectedEval(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{selectedEval.description}</h3>
                            <button className="modal-close" onClick={() => setSelectedEval(null)}>×</button>
                        </div>

                        <div className="eval-detail-stats">
                            <div className="eval-detail-stat">
                                <div className={`eval-detail-stat-value grade-${getGradeColor(selectedEval.note?.value)}`}>
                                    {formatGrade(selectedEval.note?.value)}
                                </div>
                                <div className="eval-detail-stat-label">Ta note</div>
                            </div>
                            <div className="eval-detail-stat">
                                <div className="eval-detail-stat-value">{formatGrade(selectedEval.note?.moy)}</div>
                                <div className="eval-detail-stat-label">Moyenne</div>
                            </div>
                            <div className="eval-detail-stat">
                                <div className="eval-detail-stat-value">{formatGrade(selectedEval.note?.min)} - {formatGrade(selectedEval.note?.max)}</div>
                                <div className="eval-detail-stat-label">Min - Max</div>
                            </div>
                        </div>

                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            Répartition estimée des notes :
                        </p>

                        <div className="histogram">
                            {generateHistogram(selectedEval).map((bar, i) => (
                                <div
                                    key={i}
                                    className={`histogram-bar ${bar.isUser ? 'user-bar' : ''}`}
                                    style={{ height: `${bar.height}%` }}
                                    title={bar.range}
                                >
                                    <span className="histogram-label">{bar.range.split('-')[0]}</span>
                                </div>
                            ))}
                        </div>

                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                            {selectedEval.note?.value !== '~' && '🟢 Ta note est en vert'}
                        </p>
                    </div>
                </div>,
                document.getElementById('better-scodoc-root')
            )}

            <header className="page-header">
                <div className="page-header-content">
                    <div>
                        <h1>Bonjour, {etudiant?.prenom}</h1>
                        <p>{formation?.titre || 'B.U.T MMI'} — Semestre {semestre?.numero}</p>
                    </div>
                    <button
                        className="glass-button export-btn"
                        onClick={async () => {
                            setExporting(true);
                            try {
                                await exportToPdf(data);
                            } catch (e) {
                                console.error('Export failed:', e);
                                alert('Erreur lors de l\'export PDF');
                            }
                            setExporting(false);
                        }}
                        disabled={exporting}
                    >
                        {exporting ? '⏳ Export...' : '📄 Exporter PDF'}
                    </button>
                </div>
            </header>

            {/* Cartes de Statistiques */}
            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <div className={`stat-value grade-${getGradeColor(semestre?.notes?.value)}`}>
                            {formatGrade(semestre?.notes?.value)}
                        </div>
                        <div className="stat-label">Moyenne Générale</div>
                        <div className="stat-sublabel">
                            Rang: {semestre?.rang?.value}/{semestre?.rang?.total}
                            {(() => {
                                const percentile = calculatePercentile(semestre?.rang?.value, semestre?.rang?.total);
                                const label = getPercentileLabel(percentile);
                                return label ? <span className="percentile-badge">{label}</span> : null;
                            })()}
                        </div>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                        <div className="stat-value">{semestre?.ECTS?.acquis || 0}/{semestre?.ECTS?.total || 30}</div>
                        <div className="stat-label">ECTS</div>
                    </div>
                </div>

                {/* Décision Année - si disponible */}
                {(() => {
                    const decision = getDecisionAnnee();
                    if (!decision) return null;
                    return (
                        <div className={`stat-card glass-card ${decision.class === 'status-admis' ? 'border-success' : decision.class === 'status-ajourne' ? 'border-danger' : ''}`}>
                            <div className="stat-icon">🎓</div>
                            <div className="stat-content">
                                <div className={`stat-value ${decision.class === 'status-admis' ? 'success-text' : decision.class === 'status-ajourne' ? 'danger-text' : ''}`}>
                                    {decision.icon} {decision.label}
                                </div>
                                <div className="stat-label">Décision Année</div>
                            </div>
                        </div>
                    );
                })()}

                <div className="stat-card glass-card border-danger">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                        <div className="stat-value danger-text">{absStats.non_justifie?.heure || 0}h</div>
                        <div className="stat-label">Absences non justifiées</div>
                    </div>
                </div>

                <div className="stat-card glass-card border-success">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <div className="stat-value success-text">{absStats.justifie?.heure || 0}h</div>
                        <div className="stat-label">Absences justifiées</div>
                    </div>
                </div>
            </div>

            {/* Grille des UEs */}
            <section className="section">
                <h2 className="section-title">Unités d'Enseignement</h2>
                <div className="ue-grid">
                    {ues && Object.entries(ues).map(([code, ue]) => {
                        // Obtenir le titre complet de la ressource
                        const getResourceTitle = (resCode) => {
                            return ressources?.[resCode]?.titre || resCode;
                        };

                        return (
                            <div
                                key={code}
                                className="ue-card glass-card"
                            >
                                <div className="ue-header">
                                    <div>
                                        <span className="ue-code">{code}</span>
                                        <span className="ue-name">{ue.titre}</span>
                                    </div>
                                    <div className="ue-stats">
                                        {/* Badge de validation si disponible */}
                                        {(() => {
                                            const status = getValidationStatus(code);
                                            return status ? (
                                                <span className={`ue-status ${status.class}`}>
                                                    {status.icon} {status.label}
                                                </span>
                                            ) : null;
                                        })()}
                                        <span className={`ue-grade grade-${getGradeColor(ue.moyenne?.value)}`}>
                                            {formatGrade(ue.moyenne?.value)}
                                        </span>
                                        <span className="ue-rang">
                                            #{ue.moyenne?.rang}/{ue.moyenne?.total}
                                        </span>
                                    </div>
                                </div>

                                {/* Ressources */}
                                {ue.ressources && Object.keys(ue.ressources).length > 0 && (
                                    <div className="ue-resources">
                                        <div className="resources-section-label">📚 Ressources</div>
                                        {Object.entries(ue.ressources).map(([resCode, res]) => (
                                            <div key={resCode} className="resource-item">
                                                <div className="resource-info">
                                                    <span className="resource-code">{resCode}</span>
                                                    <span className="resource-name">{getResourceTitle(resCode)}</span>
                                                </div>
                                                <span className={`resource-grade grade-${getGradeColor(res.moyenne)}`}>
                                                    {formatGrade(res.moyenne)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {/* SAEs et Portfolio */}
                                {ue.saes && Object.keys(ue.saes).length > 0 && (
                                    <div className="ue-resources ue-saes">
                                        <div className="resources-section-label">🎯 SAÉ & Portfolio</div>
                                        {Object.entries(ue.saes).map(([saeCode, sae]) => (
                                            <div key={saeCode} className="resource-item sae-item">
                                                <div className="resource-info">
                                                    <span className="resource-code sae-code">{saeCode}</span>
                                                    <span className="resource-name">{getSaeTitle(saeCode)}</span>
                                                </div>
                                                <span className={`resource-grade grade-${getGradeColor(sae.moyenne)}`}>
                                                    {formatGrade(sae.moyenne)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Graphique Comparatif des UEs */}
            {ues && Object.keys(ues).filter(k => !k.includes('Bonus')).length > 0 && (
                <section className="section">
                    <h2 className="section-title">📊 Comparatif des UEs</h2>
                    <div className="glass-card evolution-card">
                        <EvolutionChart
                            ues={ues}
                            semestre={semestre}
                        />
                    </div>
                </section>
            )}

            {/* Détail des Ressources */}
            <section className="section">
                <h2 className="section-title">Ressources & Évaluations</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    💡 Clique sur une évaluation pour voir la répartition des notes
                </p>
                <div className="resources-list">
                    {ressources && Object.entries(ressources).map(([code, res]) => (
                        <div key={code} className="resource-card glass-card">
                            <div className="resource-header">
                                <div>
                                    <span className="resource-code-lg">{code}</span>
                                    <span className="resource-title">{res.titre}</span>
                                </div>
                            </div>

                            {res.evaluations && res.evaluations.length > 0 && (
                                <div className="evaluations-list">
                                    {res.evaluations.map((eval_, i) => (
                                        <div
                                            key={eval_.id || i}
                                            className="eval-item clickable"
                                            onClick={() => setSelectedEval(eval_)}
                                        >
                                            <div className="eval-info">
                                                <span className="eval-desc">{eval_.description}</span>
                                                <span className="eval-date">
                                                    {new Date(eval_.date).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                            <div className="eval-grades">
                                                <span className={`eval-note grade-${getGradeColor(eval_.note?.value)}`}>
                                                    {formatGrade(eval_.note?.value)}
                                                </span>
                                                <span className="eval-stats">
                                                    (moy: {formatGrade(eval_.note?.moy)} | {formatGrade(eval_.note?.min)}-{formatGrade(eval_.note?.max)})
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {(!res.evaluations || res.evaluations.length === 0) && (
                                <div className="no-evals">Pas encore d'évaluations</div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Détail des SAEs */}
            {saes && Object.keys(saes).length > 0 && (
                <section className="section">
                    <h2 className="section-title">🎯 SAÉ & Portfolio</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        💡 Clique sur une évaluation pour voir la répartition des notes
                    </p>
                    <div className="resources-list saes-list">
                        {Object.entries(saes).map(([code, sae]) => (
                            <div key={code} className="resource-card glass-card sae-card">
                                <div className="resource-card-header">
                                    <div>
                                        <span className="resource-card-code sae-code">{code}</span>
                                        <span className="resource-card-title">{sae.titre}</span>
                                    </div>
                                </div>

                                {sae.evaluations && sae.evaluations.length > 0 && (
                                    <div className="evaluations-list">
                                        {sae.evaluations.map((eval_, i) => (
                                            <div
                                                key={eval_.id || i}
                                                className="eval-item clickable"
                                                onClick={() => setSelectedEval(eval_)}
                                            >
                                                <div className="eval-info">
                                                    <span className="eval-desc">{eval_.description}</span>
                                                    <span className="eval-date">
                                                        {new Date(eval_.date).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                                <div className="eval-grades">
                                                    <span className={`eval-note grade-${getGradeColor(eval_.note?.value)}`}>
                                                        {formatGrade(eval_.note?.value)}
                                                    </span>
                                                    <span className="eval-stats">
                                                        (moy: {formatGrade(eval_.note?.moy)} | {formatGrade(eval_.note?.min)}-{formatGrade(eval_.note?.max)})
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {(!sae.evaluations || sae.evaluations.length === 0) && (
                                    <div className="no-evals">Pas encore d'évaluations</div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <footer className="scrape-info">
                <small>
                    {semestre?.annee_universitaire} | {semestre?.date_debut} → {semestre?.date_fin}
                </small>
            </footer>
        </div>
    );
}
