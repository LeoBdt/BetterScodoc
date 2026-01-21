import React from 'react';

export function ProfileView({ data, photoUrl, allSemesters }) {
    if (!data?.relevé) {
        return (
            <div className="loading-state">
                <div className="spinner spinner-large"></div>
                <p>Chargement...</p>
            </div>
        );
    }

    const { relevé } = data;
    const { etudiant, formation, semestre } = relevé;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const formatGrade = (grade) => {
        if (grade === null || grade === undefined || grade === '~') return '-';
        const val = parseFloat(grade);
        return isNaN(val) ? '-' : val.toFixed(2);
    };

    return (
        <div className="profile-page">
            <header className="page-header">
                <h1>Mon Profil</h1>
                <p>Toutes vos informations personnelles et académiques</p>
            </header>

            {/* Full User Card */}
            <div className="user-full-card">
                {photoUrl ? (
                    <img src={photoUrl} alt="Photo" className="user-full-photo" />
                ) : (
                    <div className="user-photo-placeholder" style={{ width: 100, height: 130 }}>
                        {etudiant?.prenom?.[0]?.toUpperCase()}
                    </div>
                )}
                <div className="user-full-info">
                    <div className="user-full-name">{etudiant?.prenom} {etudiant?.nom}</div>
                    <div className="user-full-formation">{formation?.titre}</div>
                    <div className="user-full-badges">
                        <span className="badge">📚 Semestre {semestre?.numero}</span>
                        <span className="badge">🎓 {etudiant?.dept_acronym}</span>
                        <span className="badge">📅 {semestre?.annee_universitaire}</span>
                        {etudiant?.boursier && <span className="badge">💰 Boursier</span>}
                    </div>
                </div>
            </div>

            {/* Profile Sections */}
            <div className="profile-grid">
                {/* Personal Info */}
                <div className="glass-card profile-section">
                    <h3 className="profile-section-title">👤 Informations personnelles</h3>
                    <div className="profile-item">
                        <span className="profile-item-label">Nom complet</span>
                        <span className="profile-item-value">{etudiant?.prenom} {etudiant?.nom}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Date de naissance</span>
                        <span className="profile-item-value">{etudiant?.date_naissance}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Lieu de naissance</span>
                        <span className="profile-item-value">{etudiant?.lieu_naissance || etudiant?.dept_naissance || '-'}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Nationalité</span>
                        <span className="profile-item-value">{etudiant?.nationalite || 'Française'}</span>
                    </div>
                </div>

                {/* Contact */}
                <div className="glass-card profile-section">
                    <h3 className="profile-section-title">📧 Contact</h3>
                    <div className="profile-item">
                        <span className="profile-item-label">Email universitaire</span>
                        <span
                            className="profile-item-value copyable highlight"
                            onClick={() => copyToClipboard(etudiant?.email)}
                            title="Cliquer pour copier"
                        >
                            {etudiant?.email}
                        </span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Email personnel</span>
                        <span
                            className="profile-item-value copyable"
                            onClick={() => copyToClipboard(etudiant?.emailperso)}
                            title="Cliquer pour copier"
                        >
                            {etudiant?.emailperso || '-'}
                        </span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Téléphone</span>
                        <span className="profile-item-value">{etudiant?.telephonemobile || '-'}</span>
                    </div>
                </div>

                {/* Address */}
                <div className="glass-card profile-section">
                    <h3 className="profile-section-title">📍 Adresse</h3>
                    <div className="profile-item">
                        <span className="profile-item-label">Rue</span>
                        <span className="profile-item-value">{etudiant?.domicile}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Code postal</span>
                        <span className="profile-item-value">{etudiant?.code_postal || etudiant?.codepostaldomicile || '-'}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Ville</span>
                        <span className="profile-item-value">{etudiant?.villedomicile}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Pays</span>
                        <span className="profile-item-value">{etudiant?.paysdomicile || 'France'}</span>
                    </div>
                </div>

                {/* Academic IDs */}
                <div className="glass-card profile-section">
                    <h3 className="profile-section-title">🆔 Identifiants</h3>
                    <div className="profile-item">
                        <span className="profile-item-label">N° Étudiant (NIP)</span>
                        <span
                            className="profile-item-value copyable highlight"
                            onClick={() => copyToClipboard(etudiant?.code_nip)}
                        >
                            {etudiant?.code_nip}
                        </span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Code INE</span>
                        <span
                            className="profile-item-value copyable"
                            onClick={() => copyToClipboard(etudiant?.code_ine)}
                        >
                            {etudiant?.code_ine}
                        </span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">ID ScoDoc</span>
                        <span className="profile-item-value">{etudiant?.etudid}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Département</span>
                        <span className="profile-item-value">{etudiant?.dept_acronym} (ID: {etudiant?.dept_id})</span>
                    </div>
                </div>

                {/* Formation */}
                <div className="glass-card profile-section">
                    <h3 className="profile-section-title">📚 Formation</h3>
                    <div className="profile-item">
                        <span className="profile-item-label">Diplôme</span>
                        <span className="profile-item-value">{formation?.acronyme}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Intitulé officiel</span>
                        <span className="profile-item-value">{formation?.titre_officiel}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Semestre actuel</span>
                        <span className="profile-item-value highlight">S{semestre?.numero}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Année</span>
                        <span className="profile-item-value">{semestre?.annee_universitaire}</span>
                    </div>
                </div>

                {/* Current Semester Stats */}
                <div className="glass-card profile-section">
                    <h3 className="profile-section-title">📊 Semestre actuel</h3>
                    <div className="profile-item">
                        <span className="profile-item-label">Moyenne générale</span>
                        <span className="profile-item-value highlight">{formatGrade(semestre?.notes?.value)}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Rang</span>
                        <span className="profile-item-value">{semestre?.rang?.value} / {semestre?.rang?.total}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">Moyenne promo</span>
                        <span className="profile-item-value">{formatGrade(semestre?.notes?.moy)}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-item-label">ECTS</span>
                        <span className="profile-item-value">{semestre?.ECTS?.acquis} / {semestre?.ECTS?.total}</span>
                    </div>
                </div>
            </div>

            {/* Semester History */}
            <section className="section">
                <h2 className="section-title">📅 Historique des semestres</h2>
                <div className="semester-history">
                    {allSemesters?.map((sem, i) => (
                        <div key={sem.formsemestre_id} className="semester-badge glass-card">
                            <span>S{sem.semestre_id}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{sem.annee_scolaire}</span>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}
