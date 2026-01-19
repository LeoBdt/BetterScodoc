import React from 'react';

export function AttendanceView({ data }) {
    if (!data) {
        return (
            <div className="loading-state">
                <div className="spinner-large"></div>
                <p>Chargement...</p>
            </div>
        );
    }

    const { absences, totauxAbsences, relevé } = data;
    const ressources = relevé?.ressources || {};

    // Get module name from ID
    const getModuleName = (moduleId) => {
        if (typeof moduleId === 'string') return moduleId;
        const found = Object.entries(ressources).find(([_, r]) => r.id === moduleId);
        return found ? `${found[0]} - ${found[1].titre}` : 'Module inconnu';
    };

    // Convert absences object to array and sort by date
    const absencesList = [];
    if (absences) {
        Object.entries(absences).forEach(([date, items]) => {
            items.forEach(abs => {
                if (abs.statut !== 'present') {
                    absencesList.push({ ...abs, date });
                }
            });
        });
    }
    absencesList.sort((a, b) => new Date(b.date) - new Date(a.date));

    const stats = totauxAbsences || {
        absent: { justifie: { heure: 0 }, non_justifie: { heure: 0, compte: 0 } },
        retard: { compte: 0 }
    };

    const formatHour = (h) => {
        const hours = Math.floor(h);
        const mins = Math.round((h % 1) * 60);
        return `${hours}h${mins.toString().padStart(2, '0')}`;
    };

    return (
        <div className="attendance-page">
            <header className="page-header">
                <h1>Assiduité</h1>
                <p>Suivi de vos absences et retards</p>
            </header>

            {/* Stats */}
            <div className="stats-grid small">
                <div className="stat-card glass-card">
                    <div className="stat-value">{stats.total?.heure || 0}h</div>
                    <div className="stat-label">Total</div>
                </div>
                <div className="stat-card glass-card border-danger">
                    <div className="stat-value danger-text">{stats.absent?.non_justifie?.heure || 0}h</div>
                    <div className="stat-label">Non justifiées</div>
                    <div className="stat-sublabel">{stats.absent?.non_justifie?.compte || 0} absence(s)</div>
                </div>
                <div className="stat-card glass-card border-success">
                    <div className="stat-value success-text">{stats.absent?.justifie?.heure || 0}h</div>
                    <div className="stat-label">Justifiées</div>
                </div>
            </div>

            {/* List */}
            <section className="section">
                <h2 className="section-title">Historique ({absencesList.length})</h2>
                <div className="absence-list">
                    {absencesList.map((abs, i) => (
                        <div
                            key={abs.idAbs || i}
                            className={`absence-item glass-card ${abs.justifie ? 'justified' : 'unjustified'}`}
                        >
                            <div className="absence-main">
                                <div className="absence-date">
                                    {new Date(abs.date).toLocaleDateString('fr-FR', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </div>
                                <div className="absence-time">
                                    {formatHour(abs.debut)} - {formatHour(abs.fin)}
                                </div>
                            </div>
                            <div className="absence-module">
                                {getModuleName(abs.matiereComplet)}
                            </div>
                            <div className={`absence-status ${abs.justifie ? 'success' : 'danger'}`}>
                                {abs.statut === 'retard' ? '⏰ Retard' : abs.justifie ? '✓ Justifiée' : '✕ Non justifiée'}
                            </div>
                        </div>
                    ))}

                    {absencesList.length === 0 && (
                        <div className="empty-state success glass-card">
                            <div className="empty-icon">🎉</div>
                            <p>Aucune absence enregistrée. Bravo !</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
