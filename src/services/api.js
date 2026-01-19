// Détection automatique : si on est sur le domaine wscodoc, on est en mode extension
const IS_EXTENSION = window.location.hostname.includes('wscodoc.iutbeziers.fr');
const API_BASE_LOCAL = 'http://localhost:3001/api';
const SCODOC_BASE = 'https://wscodoc.iutbeziers.fr/services/data.php';

let currentSessionId = null;

// Helper pour faire les requêtes POST format x-www-form-urlencoded
const fetchScoDoc = async (query, extraParams = '') => {
    // Utiliser une URL relative en mode extension pour garantir l'envoi des cookies
    const url = IS_EXTENSION
        ? `/services/data.php?q=${encodeURIComponent(query)}${extraParams}`
        : `${SCODOC_BASE}?q=${encodeURIComponent(query)}${extraParams}`;

    console.log('[BetterScoDoc] Fetching:', url);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest' // Crucial pour que ScoDoc/PHP nous traite comme de l'AJAX
            }
            // credentials: 'include' est implicite en same-origin (extension)
        });

        // Si redirection vers CAS, ou page de login détectée dans l'URL finale
        if (response.redirected && response.url.includes('cas.iutbeziers.fr')) {
            console.log('[BetterScoDoc] Redirected to CAS');
            throw new Error('NOT_LOGGED_IN');
        }

        const text = await response.text();

        // Parfois ScoDoc renvoie du HTML de login même avec un code 200
        if (text.includes('<form action="/services/doAuth.php"')) {
            console.log('[BetterScoDoc] Login form detected in response');
            throw new Error('NOT_LOGGED_IN');
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            console.warn('[BetterScoDoc] Non-JSON response:', text.substring(0, 100));
            // Si le JSON est invalide, c'est souvent une page HTML d'erreur ou de login
            throw new Error('Invalid response from ScoDoc');
        }
    } catch (e) {
        console.error('[BetterScoDoc] Fetch error:', e);
        throw e;
    }
};

export const api = {
    // Login : En mode extension, on redirige juste vers le CAS si besoin
    login: async (username, password) => {
        if (IS_EXTENSION) {
            // En extension, on vérifie juste si on a accès aux données
            try {
                console.log('[BetterScoDoc] Checking session...');
                const data = await fetchScoDoc('dataPremièreConnexion');
                if (data.erreur) {
                    console.log('[BetterScoDoc] ScoDoc error:', data.erreur);
                    throw new Error(data.erreur);
                }
                console.log('[BetterScoDoc] Session valid!');
                return { success: true, data };
            } catch (e) {
                if (e.message === 'NOT_LOGGED_IN' || e.message === 'Invalid response from ScoDoc') {
                    // On remonte l'erreur spécifique pour afficher le bouton de login
                    throw new Error('NOT_LOGGED_IN');
                }
                throw e;
            }
        } else {
            // Mode Local (inchangé)
            const response = await fetch(`${API_BASE_LOCAL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Échec de connexion');
            currentSessionId = data.sessionId;
            return data;
        }
    },

    // Get bulletin
    getBulletin: async (semesterId) => {
        if (IS_EXTENSION) {
            return await fetchScoDoc('relevéEtudiant', `&semestre=${semesterId}`);
        } else {
            if (!currentSessionId) throw new Error('Non connecté');
            const response = await fetch(`${API_BASE_LOCAL}/bulletin/${semesterId}`, {
                headers: { 'X-Session-Id': currentSessionId }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erreur');
            return data;
        }
    },

    // Get initial data
    getData: async () => {
        if (IS_EXTENSION) {
            return await fetchScoDoc('dataPremièreConnexion');
        } else {
            // ... local fallback
            if (!currentSessionId) throw new Error('Non connecté');
            const response = await fetch(`${API_BASE_LOCAL}/data`, {
                headers: { 'X-Session-Id': currentSessionId }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erreur');
            return data;
        }
    },

    // Logout
    logout: async () => {
        if (IS_EXTENSION) {
            // En extension, logout = déconnexion scodoc
            window.location.href = 'https://wscodoc.iutbeziers.fr/logout';
        } else {
            if (currentSessionId) {
                await fetch(`${API_BASE_LOCAL}/logout`, {
                    method: 'POST',
                    headers: { 'X-Session-Id': currentSessionId }
                });
                currentSessionId = null;
            }
        }
    },

    getPhotoUrl: () => {
        if (IS_EXTENSION) {
            // En extension, l'URL directe fonctionne car on a le cookie
            return 'https://wscodoc.iutbeziers.fr/services/data.php?q=getStudentPic';
        } else {
            if (!currentSessionId) return null;
            return `${API_BASE_LOCAL}/photo`;
        }
    }
};
