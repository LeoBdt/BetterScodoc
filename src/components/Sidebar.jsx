import React from 'react';

export function Sidebar({ activeTab, setActiveTab, onLogout, semesters, onSelectSemester, currentSemesterId, theme, toggleTheme }) {
    const tabs = [
        { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
        { id: 'attendance', label: 'Assiduité', icon: '📅' },
        { id: 'profile', label: 'Mon Profil', icon: '👤' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">🎓</div>
                <span className="sidebar-title">BetterScoDoc</span>
            </div>

            {/* Theme Toggle */}
            <div className="theme-toggle" onClick={toggleTheme}>
                <div className="theme-toggle-track">
                    <div className="theme-toggle-thumb"></div>
                </div>
                <span className="theme-toggle-label">
                    {theme === 'dark' ? '🌙 Sombre' : '☀️ Clair'}
                </span>
            </div>

            {/* Semester Selector */}
            {semesters && semesters.length > 0 && (
                <div className="semester-selector">
                    <label className="semester-label">Semestre</label>
                    <select
                        className="semester-select glass-input"
                        value={currentSemesterId || ''}
                        onChange={(e) => onSelectSemester(e.target.value)}
                    >
                        {semesters.map((sem) => (
                            <option key={sem.formsemestre_id} value={sem.formsemestre_id}>
                                S{sem.semestre_id} - {sem.annee_scolaire}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <nav>
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{tab.icon}</span>
                        <span className="nav-label">{tab.label}</span>
                    </div>
                ))}
            </nav>

            <div className="nav-item logout-item" onClick={onLogout}>
                <span className="nav-icon">🚪</span>
                <span className="nav-label">Déconnexion</span>
            </div>
        </aside>
    );
}
