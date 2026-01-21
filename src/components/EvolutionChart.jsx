import React from 'react';

/**
 * Graphique comparatif des moyennes par UE
 * Version simple avec barres CSS (pas de dépendance externe)
 */
export function EvolutionChart({ ues, semestre }) {
    // Filtrer les UEs valides (pas les bonus)
    const validUes = Object.entries(ues || {})
        .filter(([code, ue]) => !code.includes('Bonus') && ue.moyenne?.value)
        .sort((a, b) => {
            // Trier par numéro d'UE
            const numA = parseInt(a[1].numero) || 0;
            const numB = parseInt(b[1].numero) || 0;
            return numA - numB;
        });

    if (validUes.length < 1) {
        return (
            <div className="evolution-chart-placeholder">
                <p>📊 Le graphique sera disponible quand les moyennes des UE seront calculées.</p>
            </div>
        );
    }

    // Moyenne générale du semestre
    const moyGenerale = parseFloat(semestre?.notes?.value) || 0;
    const moyPromo = parseFloat(semestre?.notes?.moy) || 0;

    return (
        <div className="simple-chart">
            <div className="chart-bars">
                {validUes.map(([code, ue]) => {
                    const moy = parseFloat(ue.moyenne?.value) || 0;
                    const ueMoyPromo = parseFloat(ue.moyenne?.moy) || 0;
                    const heightPercent = (moy / 20) * 100;
                    const promoHeightPercent = (ueMoyPromo / 20) * 100;

                    return (
                        <div key={code} className="chart-bar-group">
                            <div className="chart-bar-container">
                                {/* Barre moyenne promo */}
                                {ueMoyPromo > 0 && (
                                    <div
                                        className="chart-bar chart-bar-promo"
                                        style={{ height: `${promoHeightPercent}%` }}
                                        title={`Promo: ${ueMoyPromo.toFixed(2)}`}
                                    />
                                )}
                                {/* Barre étudiant - toujours bleue */}
                                <div
                                    className="chart-bar chart-bar-student"
                                    style={{ height: `${heightPercent}%` }}
                                    title={`${moy.toFixed(2)}/20`}
                                >
                                    <span className="chart-bar-value">{moy.toFixed(1)}</span>
                                </div>
                            </div>
                            <span className="chart-bar-label" title={ue.titre}>{code.replace('UE', '')}</span>
                        </div>
                    );
                })}

                {/* Barre pour la moyenne générale */}
                <div className="chart-bar-group chart-bar-general">
                    <div className="chart-bar-container">
                        {moyPromo > 0 && (
                            <div
                                className="chart-bar chart-bar-promo"
                                style={{ height: `${(moyPromo / 20) * 100}%` }}
                                title={`Promo: ${moyPromo.toFixed(2)}`}
                            />
                        )}
                        <div
                            className="chart-bar chart-bar-student chart-bar-moyenne"
                            style={{ height: `${(moyGenerale / 20) * 100}%` }}
                            title={`Moyenne: ${moyGenerale.toFixed(2)}/20`}
                        >
                            <span className="chart-bar-value">{moyGenerale.toFixed(1)}</span>
                        </div>
                    </div>
                    <span className="chart-bar-label">Moy. Gén.</span>
                </div>
            </div>

            {/* Légende avec codes + noms */}
            <div className="chart-legend">
                <span className="legend-item"><span className="legend-dot student"></span> Ta moyenne</span>
                <span className="legend-item"><span className="legend-dot promo"></span> Moyenne promo</span>
            </div>

            {/* Noms des UE */}
            <div className="chart-ue-names">
                {validUes.map(([code, ue]) => (
                    <span key={code} className="chart-ue-name">
                        <strong>{code.replace('UE', '')}</strong> {ue.titre}
                    </span>
                ))}
                <span className="chart-ue-name">
                    <strong>Moy. Gén.</strong> Moyenne Générale
                </span>
            </div>
        </div>
    );
}
