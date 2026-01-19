import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function BulletinView({ semester, student, token }) {
    const [bulletin, setBulletin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBulletin();
    }, [semester]);

    const loadBulletin = async () => {
        setLoading(true);
        try {
            const data = await api.getBulletin(semester.formsemestre_id, student.id, token);
            setBulletin(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Chargement des notes...</div>;
    if (!bulletin) return <div className="p-8 text-center text-red-400">Impossible de charger le bulletin.</div>;

    // Group by UE (Unité d'Enseignement) if structured that way, or just list modules.
    // Usually ScoDoc 9 API returns a structure with 'ues' containing 'modules'.
    // We need to robustly handle the structure. Assuming standard ScoDoc 9 JSON structure.

    // Helper to get color for grade
    const getGradeColor = (grade) => {
        if (!grade && grade !== 0) return 'text-gray-500';
        const val = parseFloat(grade);
        if (val >= 16) return 'text-blue-400';
        if (val >= 14) return 'text-green-400';
        if (val >= 10) return 'text-white';
        if (val >= 8) return 'text-orange-400';
        return 'text-red-400';
    };

    // Helper to format module code
    const formatCode = (code) => code ? code.split('.').pop() : '';

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-2xl font-bold">{semester.titre_num}</h2>
                    <p className="text-gray-400 text-sm">{semester.date_debut} au {semester.date_fin}</p>
                </div>
                {bulletin.moy_gen && (
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Moyenne Générale</div>
                        <div className={`text-3xl font-bold ${getGradeColor(bulletin.moy_gen)}`}>
                            {Number(bulletin.moy_gen).toFixed(2)}
                        </div>
                    </div>
                )}
            </div>

            {/* Grid layout for UEs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bulletin.ues && bulletin.ues.map((ue, idx) => (
                    <div key={ue.id || idx} className="glass-card flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-2">
                            <div>
                                <h3 className="font-bold text-lg text-blue-200">{ue.acronyme}</h3>
                                <p className="text-xs text-blue-200/60" title={ue.titre}>{ue.titre && ue.titre.length > 40 ? ue.titre.substring(0, 40) + '...' : ue.titre}</p>
                            </div>
                            {ue.moy && (
                                <div className={`text-xl font-bold ${getGradeColor(ue.moy)}`}>
                                    {Number(ue.moy).toFixed(2)}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-3">
                            {ue.modules && ue.modules.map((mod, midx) => (
                                <div key={mod.id || midx} className="flex flex-col gap-1 p-2 rounded hover:bg-white/5 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-200" title={mod.titre}>
                                            {mod.acronyme || formatCode(mod.code)} - {mod.titre && mod.titre.length > 25 ? mod.titre.substring(0, 25) + '...' : mod.titre}
                                        </span>
                                        <span className={`font-mono font-bold ${getGradeColor(mod.moy)}`}>
                                            {mod.moy !== undefined && mod.moy !== null ? Number(mod.moy).toFixed(2) : '-'}
                                        </span>
                                    </div>
                                    {/* Show Coefficients or other details if needed */}
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Coef: {mod.coef}</span>
                                        <span>{mod.notes_count || 0} note(s)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {(!bulletin.ues || bulletin.ues.length === 0) && (
                    <div className="col-span-full text-center text-gray-500 italic p-4">
                        Aucune unité d'enseignement trouvée pour ce bulletin.
                    </div>
                )}
            </div>
        </div>
    );
}
