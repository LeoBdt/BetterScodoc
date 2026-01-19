import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Composant de chargement initial
function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="loading-screen-content">
                <div className="loading-screen-logo">🎓</div>
                <h1 className="loading-screen-title">BetterScoDoc</h1>
                <p className="loading-screen-text">Récupération de vos données...</p>
                <div className="progress-bar" style={{ width: 220, marginTop: 24, marginLeft: 'auto', marginRight: 'auto' }}>
                    <div className="progress-fill" style={{ width: '60%' }}></div>
                </div>
            </div>
        </div>
    );
}

// Fonction pour faire un fetch direct depuis le content script
async function fetchDataDirect() {
    try {
        const response = await fetch('/services/data.php?q=dataPremièreConnexion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include'
        });

        const text = await response.text();

        try {
            const data = JSON.parse(text);
            if (!data.erreur) {
                return { success: true, data };
            }
        } catch (e) {
            console.log('[BetterScoDoc] Response is not JSON');
        }

        return { success: false };
    } catch (e) {
        console.log('[BetterScoDoc] Fetch error:', e);
        return { success: false };
    }
}

// Fonction d'initialisation
async function initExtension() {
    console.log('🚀 BetterScoDoc Extension Starting...');

    // Créer notre conteneur racine
    const rootDiv = document.createElement('div');
    rootDiv.id = 'better-scodoc-root';
    document.body.appendChild(rootDiv);

    // Masquer le contenu original
    const originalElements = Array.from(document.body.children).filter(
        child => child.id !== 'better-scodoc-root'
    );
    originalElements.forEach(child => {
        child.style.display = 'none';
    });

    const root = ReactDOM.createRoot(rootDiv);

    // Afficher l'écran de chargement immédiatement
    root.render(
        <React.StrictMode>
            <LoadingScreen />
        </React.StrictMode>
    );

    // Récupérer les données
    console.log('[BetterScoDoc] Fetching data...');
    const result = await fetchDataDirect();

    // Monter l'application React avec les données
    root.render(
        <React.StrictMode>
            <App
                isExtension={true}
                initialData={result.success ? result.data : null}
                showOriginalSite={() => {
                    rootDiv.style.display = 'none';
                    originalElements.forEach(child => {
                        child.style.display = '';
                    });
                }}
            />
        </React.StrictMode>
    );
}

// Lancer l'extension
if (window.location.hostname.includes('wscodoc.iutbeziers.fr')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExtension);
    } else {
        initExtension();
    }
}
