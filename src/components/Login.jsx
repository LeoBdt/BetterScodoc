import React, { useState } from 'react';
import { api } from '../services/api';

export function Login({ onLogin, showOriginalSite }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');

    const isExtension = window.location.hostname.includes('wscodoc.iutbeziers.fr');

    const handleExtensionLogin = () => {
        window.location.href = 'https://wscodoc.iutbeziers.fr/services/doAuth.php?href=' + encodeURIComponent(window.location.href);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setProgress(10);
        setStatus('Connexion au serveur CAS...');

        try {
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 5, 80));
            }, 500);

            setProgress(20);
            setStatus('Authentification en cours...');

            const result = await api.login(username, password);

            clearInterval(progressInterval);
            setProgress(90);
            setStatus('Récupération des données...');

            setTimeout(() => {
                setProgress(100);
                setStatus('Connexion réussie !');
                onLogin(result);
            }, 300);

        } catch (err) {
            console.error(err);
            setError(err.message || "Échec de la connexion");
            setProgress(0);
            setLoading(false);
        }
    };

    // Mode Extension : Afficher un message de connexion
    if (isExtension) {
        return (
            <div className="login-container">
                <div className="glass-card login-card fade-in">
                    <div className="login-header">
                        <div className="logo-icon">🎓</div>
                        <h1>BetterScoDoc</h1>
                        <p>Connexion requise</p>
                    </div>

                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                            Pour utiliser BetterScoDoc, vous devez d'abord vous connecter via le portail CAS de l'IUT.
                        </p>

                        <button
                            onClick={handleExtensionLogin}
                            className="glass-button login-button"
                            style={{ width: '100%' }}
                        >
                            Se connecter via le CAS
                        </button>

                        {showOriginalSite && (
                            <div style={{ marginTop: 24 }}>
                                <button
                                    onClick={showOriginalSite}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        fontSize: 13,
                                        textDecoration: 'underline',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Utiliser le site original
                                </button>
                            </div>
                        )}
                    </div>

                    {error && <div className="error-message">{error}</div>}
                </div>
            </div>
        );
    }

    // Mode Local (développement)
    return (
        <div className="login-container">
            <div className="glass-card login-card fade-in">
                <div className="login-header">
                    <div className="logo-icon">🎓</div>
                    <h1>BetterScoDoc</h1>
                    <p>Accédez à vos notes et absences</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label>Identifiant CAS</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="glass-input"
                            placeholder="prenom.nom"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="input-group">
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="glass-input"
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="glass-button login-button"
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>

                    {loading && (
                        <div className="progress-container">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="progress-text">{status}</div>
                        </div>
                    )}
                </form>

                <div className="login-footer">
                    <small>Connexion sécurisée via CAS IUT Béziers</small>
                </div>
            </div>
        </div>
    );
}
