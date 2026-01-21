import React, { useState, useEffect } from 'react';

/**
 * Composant Toast pour afficher les nouvelles notes détectées
 */
export function NewGradesNotification({ newGrades, onDismiss }) {
    const [visible, setVisible] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        // Auto-dismiss après 15 secondes si pas interagi
        const timer = setTimeout(() => {
            if (!expanded) {
                setVisible(false);
                setTimeout(onDismiss, 300); // Attendre l'animation
            }
        }, 15000);

        return () => clearTimeout(timer);
    }, [expanded, onDismiss]);

    if (!newGrades || newGrades.length === 0) return null;

    const handleDismiss = () => {
        setVisible(false);
        setTimeout(onDismiss, 300);
    };

    return (
        <div className={`new-grades-notification ${visible ? 'visible' : 'hidden'}`}>
            <div className="notification-header" onClick={() => setExpanded(!expanded)}>
                <div className="notification-icon">🎉</div>
                <div className="notification-title">
                    {newGrades.length === 1
                        ? 'Nouvelle note disponible !'
                        : `${newGrades.length} nouvelles notes !`}
                </div>
                <button className="notification-close" onClick={handleDismiss}>×</button>
            </div>

            {expanded && (
                <div className="notification-details">
                    {newGrades.map((grade, i) => (
                        <div key={i} className="notification-grade-item">
                            <span className="notification-grade-code">{grade.code}</span>
                            <span className="notification-grade-desc">{grade.description}</span>
                            <span className="notification-grade-value">
                                {grade.note === '~' ? 'En attente' : grade.note}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {!expanded && (
                <div className="notification-hint">
                    Cliquez pour voir le détail
                </div>
            )}
        </div>
    );
}
