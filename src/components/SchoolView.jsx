import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BulletinView } from './BulletinView';

export function SchoolView({ student, token }) {
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSemester, setSelectedSemester] = useState(null);

    useEffect(() => {
        loadSemesters();
    }, []);

    const loadSemesters = async () => {
        try {
            const data = await api.getFormSemestres(student.id, token);
            // Sort by date (usually ID or date_debut is enough) - assuming data is array
            // Reverse to see latest first
            setSemesters([...data].reverse());
            // Select the first one by default if available
            if (data.length > 0) {
                setSelectedSemester(data[data.length - 1]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Chargement de votre parcours...</div>;

    if (selectedSemester) {
        return (
            <div className="fade-in">
                <button
                    onClick={() => setSelectedSemester(null)}
                    className="mb-4 text-sm text-blue-300 hover:text-blue-200 flex items-center gap-1 transition-colors"
                >
                    ← Retour aux semestres
                </button>
                <BulletinView semester={selectedSemester} student={student} token={token} />
            </div>
        )
    }

    return (
        <div className="space-y-6 fade-in">
            <header>
                <h2 className="text-3xl font-bold mb-1">Bonjour, {student.prenom}</h2>
                <p className="text-gray-400">Voici vos semestres enregistrés</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {semesters.map((sem, i) => (
                    <div
                        key={sem.formsemestre_id}
                        className={`glass-card cursor-pointer hover:bg-white/5 border-l-4 ${sem.etat ? 'border-l-green-400' : 'border-l-gray-500'} delay-${(i % 5) * 100}`}
                        onClick={() => setSelectedSemester(sem)}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-mono px-2 py-1 rounded bg-black/30 text-gray-400">{sem.modalite || 'Standard'}</span>
                            {i === 0 && <span className="text-xs font-bold text-accent-color px-2 py-1 bg-blue-500/20 rounded">ACTUEL</span>}
                        </div>
                        <h3 className="text-xl font-bold mb-1">{sem.titre_num}</h3>
                        <p className="text-sm text-gray-300">{sem.date_debut} — {sem.date_fin}</p>
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className="text-sm text-gray-400">{sem.formation_acronyme}</span>
                            <span className="text-accent-color text-sm group-hover:translate-x-1 transition-transform">Voir les notes →</span>
                        </div>
                    </div>
                ))}
                {semesters.length === 0 && (
                    <div className="glass-card col-span-full p-8 text-center text-gray-400">
                        Aucun semestre trouvé pour ce dossier.
                    </div>
                )}
            </div>
        </div>
    );
}
