import React, { useState, useEffect } from 'react';
import { 
    Trophy, Activity, Clock, FileText, 
    Target, Layers, Zap, Download, AlertCircle 
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line 
} from 'recharts';
import trainingService from '../../services/trainingService';

// --- UTILITAIRE : FORMATAGE ---
const formatMetric = (val) => {
    if (val === undefined || val === null) return "-";
    if (typeof val === 'number') return val.toFixed(4);
    return val;
};

// --- COMPOSANT MATRICE DE CONFUSION ---
const ConfusionMatrixViz = ({ matrixData, labels }) => {
    if (!matrixData || !labels || matrixData.length === 0) {
        return <div className="text-gray-400 text-sm">Données indisponibles</div>;
    }
    const flatValues = matrixData.flat();
    const maxValue = Math.max(...flatValues) || 1;

    return (
        <div className="flex flex-col items-center justify-center py-4">
            <div 
                className="grid gap-2"
                style={{ gridTemplateColumns: `auto repeat(${labels.length}, minmax(80px, 1fr))` }}
            >
                <div className="h-8"></div>
                {labels.map((lbl, i) => (
                    <div key={i} className="flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
                        {lbl} (Pred)
                    </div>
                ))}
                {matrixData.map((row, i) => (
                    <React.Fragment key={i}>
                        <div className="flex items-center justify-end pr-4 text-xs font-bold text-gray-500 uppercase">
                            {labels[i]} (True)
                        </div>
                        {row.map((val, j) => {
                            const intensity = val / maxValue; 
                            return (
                                <div 
                                    key={j}
                                    className="h-16 flex items-center justify-center rounded-lg border border-gray-100 text-base font-bold transition-all hover:scale-105 shadow-sm"
                                    style={{
                                        backgroundColor: `rgba(249, 115, 22, ${0.1 + (intensity * 0.9)})`,
                                        color: intensity > 0.6 ? 'white' : '#1f2937'
                                    }}
                                >
                                    {val}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const Results = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        try {
            const storedData = localStorage.getItem('last_training_results');
            if (storedData) setData(JSON.parse(storedData));
        } catch (e) { console.error(e); }
    }, []);

    if (!data) return null;

    const { models, report_filename } = data;
    if (!models || models.length === 0) return null;

    const bestModel = models.find(m => m.is_best_model) || models[0];
    const problemType = bestModel?.problem_type || "Classification";
    const metrics = bestModel?.metrics || {};

    const featureImpData = metrics.feature_importance?.slice(0, 10) || [];
    const rocData = metrics.roc_curve_data?.fpr 
        ? metrics.roc_curve_data.fpr.map((fpr, i) => ({ fpr, tpr: metrics.roc_curve_data.tpr[i] }))
        : [];
    const cmData = metrics.confusion_matrix?.matrix;
    const cmLabels = metrics.confusion_matrix?.labels;

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-10 pt-6 px-6 space-y-8 animate-in fade-in duration-500 font-sans">
            
            {/* --- 1. KPI CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Card 1: Champion (Gris Anthracite) */}
                <div className="md:col-span-1 bg-[#1e293b] rounded-2xl p-6 text-white shadow-xl shadow-gray-200 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                        <Trophy size={120} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Modèle Champion</p>
                        <h3 className="text-xl font-bold leading-tight">{bestModel.algorithm}</h3>
                    </div>
                    <div className="mt-4">
                        <span className="inline-flex items-center gap-2 bg-white/10 border border-white/5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-200 backdrop-blur-sm">
                            <Layers size={12} className="text-orange-400" /> {problemType}
                        </span>
                    </div>
                </div>

                {/* Card 2: Main Score */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {problemType === 'Classification' ? 'Accuracy' : 'RMSE'}
                            </p>
                            <h3 className="text-4xl font-black text-gray-900 mt-2 tracking-tight">
                                {formatMetric(problemType === 'Classification' ? metrics.accuracy : metrics.rmse)}
                            </h3>
                        </div>
                        <div className={`p-3 rounded-xl ${problemType === 'Classification' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                            <Target size={24} />
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div 
                            className={`h-full ${problemType === 'Classification' ? 'bg-green-500' : 'bg-blue-500'}`} 
                            style={{ width: `${problemType === 'Classification' ? (metrics.accuracy || 0) * 100 : 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Card 3: Secondary Score */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                     <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {problemType === 'Classification' ? 'F1 Score' : 'R2 Score'}
                            </p>
                            <h3 className="text-4xl font-black text-gray-900 mt-2 tracking-tight">
                                {formatMetric(metrics.f1_score || metrics.r2_score)}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Activity size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-auto font-medium">
                        Validation (Mean): <span className="text-gray-700 font-bold">{formatMetric(metrics.cv_score_mean)}</span>
                    </p>
                </div>

                {/* Card 4: Time */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Temps</p>
                            <h3 className="text-4xl font-black text-gray-900 mt-2 tracking-tight">
                                {formatMetric(metrics.training_time_sec)}<span className="text-base font-bold text-gray-400 ml-1">s</span>
                            </h3>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <Clock size={24} />
                        </div>
                    </div>
                     <p className="text-xs text-gray-400 mt-auto font-medium">
                         Données: <span className="font-bold text-gray-700">{data.rows || "Dataset"}</span>
                     </p>
                </div>
            </div>

            {/* --- 2. GRAPHIQUES PRINCIPAUX (FEATURES + ROC) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Facteurs d'Influence */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[400px] flex flex-col">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Zap size={14} className="text-orange-500"/> Facteurs d'Influence
                    </h4>
                    <div className="flex-1 w-full min-h-0">
                        {featureImpData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={featureImpData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6"/>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="feature" type="category" width={120} tick={{fontSize: 11, fill:'#6b7280', fontWeight: 600}} />
                                    <Tooltip cursor={{fill: '#fff7ed'}} contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                                    <Bar dataKey="importance" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <AlertCircle className="mb-2 opacity-50"/>
                                <span className="text-sm">Données non disponibles</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. COURBE ROC (Prioritaire) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[400px] flex flex-col">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Activity size={14} className="text-purple-500"/> Courbe ROC 
                        {metrics.roc_auc && <span className="ml-2 bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px]">AUC: {metrics.roc_auc}</span>}
                    </h4>
                    <div className="flex-1 min-h-0">
                        {rocData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={rocData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                                    <XAxis dataKey="fpr" type="number" hide />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}}/>
                                    <Line type="monotone" dataKey="tpr" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                                    <Line type="monotone" dataKey="fpr" stroke="#cbd5e1" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <span className="text-sm">Non disponible (Régression ou binaire manquant)</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- 3. MATRICE DE CONFUSION (Si Classification) --- */}
            {problemType === 'Classification' && cmData && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Layers size={14} className="text-blue-500"/> Matrice de Confusion
                    </h4>
                    <div className="w-full overflow-x-auto">
                        <ConfusionMatrixViz matrixData={cmData} labels={cmLabels} />
                    </div>
                </div>
            )}

            {/* --- 4. TABLEAU ELEGANT --- */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30">
                    <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">Classement des Modèles</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-4 font-semibold tracking-wider">Rang</th>
                                <th className="px-8 py-4 font-semibold tracking-wider">Algorithme</th>
                                <th className="px-8 py-4 text-right font-semibold tracking-wider text-gray-800">Score Principal</th>
                                <th className="px-8 py-4 text-right font-semibold tracking-wider">Validation</th>
                                <th className="px-8 py-4 text-right font-semibold tracking-wider">Temps</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {models.map((model, idx) => (
                                <tr key={idx} className={`group hover:bg-gray-50 transition-colors ${model.is_best_model ? 'bg-orange-50/10' : ''}`}>
                                    <td className="px-8 py-5">
                                        <span className={`font-mono text-xs w-6 h-6 flex items-center justify-center rounded-full ${idx === 0 ? 'bg-yellow-100 text-yellow-700 font-bold' : 'text-gray-400'}`}>
                                            {idx + 1}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            {model.is_best_model && <Trophy size={16} className="text-orange-500" />}
                                            <span className={`font-bold ${model.is_best_model ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {model.algorithm}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className="font-black text-gray-900 text-base">
                                            {formatMetric(problemType === 'Classification' ? model.metrics?.accuracy : model.metrics?.rmse)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right text-gray-500 font-medium">
                                        {formatMetric(model.metrics?.cv_score_mean)}
                                    </td>
                                    <td className="px-8 py-5 text-right text-gray-400 font-mono text-xs">
                                        {formatMetric(model.metrics?.training_time_sec)}s
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- 5. BOUTON DOWNLOAD RAPPORT (En bas, centré) --- */}
            {report_filename && (
                <div className="flex justify-center pt-4 pb-8">
                    <a 
                        href={trainingService.getReportUrl(report_filename)}
                        target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wide hover:bg-black hover:scale-105 transition-all shadow-xl shadow-gray-200"
                    >
                        <Download size={18} />
                        Télécharger le Rapport Complet (PDF)
                    </a>
                </div>
            )}
            
        </div>
    );
};

export default Results;