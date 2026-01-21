/**
 * Service de notification pour les nouvelles notes
 * Stocke les notes en localStorage et détecte les changements
 */

const STORAGE_KEY_PREFIX = 'betterscodoc_grades_';

/**
 * Récupère les notes stockées localement pour un semestre donné
 */
export const getStoredGrades = (semesterId) => {
    try {
        const key = `${STORAGE_KEY_PREFIX}${semesterId}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error('[BetterScoDoc] Erreur lecture localStorage:', e);
        return null;
    }
};

/**
 * Sauvegarde les notes actuelles pour un semestre donné
 */
export const storeGrades = (grades, semesterId) => {
    try {
        const key = `${STORAGE_KEY_PREFIX}${semesterId}`;
        localStorage.setItem(key, JSON.stringify(grades));
    } catch (e) {
        console.error('[BetterScoDoc] Erreur écriture localStorage:', e);
    }
};

/**
 * Extrait toutes les notes d'un relevé pour comparaison
 */
export const extractGrades = (data) => {
    if (!data?.relevé) return {};

    const grades = {};
    const ressources = data.relevé.ressources || {};
    const saes = data.relevé.saes || {};
    const ues = data.relevé.ues || {};

    // Fonction helper pour ajouter une note
    const addGrade = (key, code, desc, note, date) => {
        grades[key] = {
            code,
            description: desc,
            note: note?.value,
            date: date
        };
    };

    // 1. Ressources
    Object.entries(ressources).forEach(([code, res]) => {
        if (res.evaluations) {
            res.evaluations.forEach((eval_) => {
                const key = `${code}_${eval_.id || eval_.description}`;
                addGrade(key, code, eval_.description, eval_.note, eval_.date);
            });
        }
    });

    // 2. SAEs
    Object.entries(saes).forEach(([code, sae]) => {
        if (sae.evaluations) {
            sae.evaluations.forEach((eval_) => {
                const key = `${code}_${eval_.id || eval_.description}`;
                addGrade(key, code, eval_.description, eval_.note, eval_.date);
            });
        }
    });

    // 3. UEs
    Object.entries(ues).forEach(([code, ue]) => {
        if (ue.evaluations) {
            ue.evaluations.forEach((eval_) => {
                const key = `${code}_${eval_.id || eval_.description}`;
                addGrade(key, code, eval_.description, eval_.note, eval_.date);
            });
        }
    });

    return grades;
};

/**
 * Compare les notes actuelles avec les notes stockées
 * Retourne la liste des nouvelles notes
 */
export const detectNewGrades = (currentData) => {
    const semesterId = currentData.formsemestre_id
        || currentData.semestre?.formsemestre_id
        || currentData.relevé?.formsemestre_id
        || currentData.relevé?.semestre?.formsemestre_id;

    if (!semesterId) return [];

    const storedGrades = getStoredGrades(semesterId);
    const currentGrades = extractGrades(currentData);

    // Première visite pour ce semestre : stocker et ne rien signaler
    if (!storedGrades) {
        storeGrades(currentGrades, semesterId);
        return [];
    }

    const newGrades = [];

    Object.entries(currentGrades).forEach(([key, grade]) => {
        // Nouvelle évaluation
        if (!storedGrades[key]) {
            newGrades.push(grade);
        }
        // Note modifiée (était ~ et maintenant une vraie note)
        else if (storedGrades[key].note === '~' && grade.note !== '~') {
            newGrades.push(grade);
        }
    });

    // Mettre à jour le stockage
    storeGrades(currentGrades, semesterId);

    return newGrades;
};

/**
 * Calcule le percentile à partir du rang
 * @param {number} rang - Position de l'étudiant (1 = premier)
 * @param {number} total - Nombre total d'étudiants
 * @returns {number} Percentile (0-100, 100 = meilleur)
 */
export const calculatePercentile = (rang, total) => {
    if (!rang || !total || total === 0) return null;
    const percentile = ((total - rang) / total) * 100;
    return Math.round(percentile);
};

/**
 * Retourne un texte descriptif du percentile
 */
export const getPercentileLabel = (percentile) => {
    if (percentile === null) return '';
    if (percentile >= 90) return 'Top 10% 🏆';
    if (percentile >= 75) return 'Top 25% 🌟';
    if (percentile >= 50) return 'Top 50%';
    if (percentile >= 25) return 'Moitié inférieure';
    return 'Dernier quart';
};
