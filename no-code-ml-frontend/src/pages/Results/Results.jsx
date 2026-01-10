import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Nécessaire pour la redirection
import { 
    Trophy, Activity, Clock, 
    Target, Layers, Zap, Download, AlertCircle, BarChart2, AlertTriangle
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

// --- COMPOSANT ICONE MODERNE ---
const ModernIcon = ({ icon: Icon, color = "orange" }) => {
    const styles = {
        orange: "from-orange-400 to-orange-600 shadow-orange-500/30",
        dark:   "from-slate-700 to-slate-900 shadow-slate-800/30",
        gray:   "from-slate-400 to-slate-600 shadow-slate-500/30",
    };

    return (
        <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center 
            bg-gradient-to-br ${styles[color] || styles.orange}
            shadow-md text-white transform transition-transform hover:scale-105 duration-200
        `}>
            <Icon size={20} strokeWidth={2.5} />
        </div>
    );
};

// --- COMPOSANT MATRICE DE CONFUSION ---
const ConfusionMatrixViz = ({ matrixData, labels }) => {
    if (!matrixData || !labels || matrixData.length === 0) {
        return <div className="text-gray-400 text-sm">Données indisponibles</div>;
    }
    const flatValues = matrixData.flat();
    const maxValue = Math.max(...flatValues) || 1;

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div 
                className="grid gap-2"
                style={{ gridTemplateColumns: `auto repeat(${labels.length}, minmax(80px, 1fr))` }}
            >
                <div className="h-6"></div>
                {labels.map((lbl, i) => (
                    <div key={i} className="flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
                        {lbl} (P)
                    </div>
                ))}
                {matrixData.map((row, i) => (
                    <React.Fragment key={i}>
                        <div className="flex items-center justify-end pr-4 text-xs font-bold text-gray-500 uppercase">
                            {labels[i]} (T)
                        </div>
                        {row.map((val, j) => {
                            const intensity = val / maxValue; 
                            return (
                                <div 
                                    key={j}
                                    className="h-14 flex items-center justify-center rounded-md border border-gray-100 text-sm font-bold transition-all hover:scale-105 shadow-sm"
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
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        try {
            const storedData = localStorage.getItem('last_training_results');
            if (storedData) setData(JSON.parse(storedData));
        } catch (e) { console.error(e); }
    }, []);

    // --- 1. GESTION DU CAS "PAS DE DONNÉES" (EMPTY STATE) ---
    if (!data || !data.models) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans">
                <div className="bg-white rounded-3xl p-12 text-center max-w-lg w-full shadow-xl shadow-gray-200 border border-gray-100 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={36} className="text-orange-500" strokeWidth={2}/>
                    </div>
                    
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Aucune donnée chargée</h2>
                    <p className="text-gray-500 mb-8 font-medium">
                        Pour visualiser des graphiques et les performances, vous devez d'abord entraîner un modèle.
                    </p>

                    <button 
                        onClick={() => navigate('/ingestion')}
                        className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 hover:scale-105 transition-all duration-200"
                    >
                        Aller à l'Ingestion
                    </button>
                </div>
            </div>
        );
    }

    // --- 2. DONNÉES DISPONIBLES : EXTRACTION ---
    const { models, report_filename } = data;
    const bestModel = models.find(m => m.is_best_model) || models[0];
    const problemType = bestModel?.problem_type || "Classification";
    const metrics = bestModel?.metrics || {};

    const featureImpData = metrics.feature_importance?.slice(0, 10) || [];
    
    // ROC Data
    const rocData = metrics.roc_curve_data?.fpr 
        ? metrics.roc_curve_data.fpr.map((fpr, i) => ({ fpr, tpr: metrics.roc_curve_data.tpr[i] }))
        : [];

    const diagonalLine = [
        { fpr: 0, tpr: 0 },
        { fpr: 1, tpr: 1 }
    ];

    const cmData = metrics.confusion_matrix?.matrix;
    const cmLabels = metrics.confusion_matrix?.labels;

    // --- 3. AFFICHAGE DES RÉSULTATS ---
    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-10 pt-6 px-6 space-y-8 animate-in fade-in duration-500 font-sans text-gray-800">
            
            {/* --- KPI CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Champion */}
                <div className="md:col-span-1 bg-gray-50 rounded-xl p-6 border-2 border-gray-200 relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute right-0 top-0 opacity-5 transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110 duration-500 text-gray-900">
                        <Trophy size={100} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Trophy size={18} className="text-orange-500" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Champion Model</p>
                        </div>
                        <h3 className="text-2xl font-bold leading-tight text-gray-800">{bestModel.algorithm}</h3>
                    </div>
                    <div className="mt-4">
                        <span className="inline-flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 shadow-sm">
                            <Layers size={12} className="text-orange-500" /> {problemType}
                        </span>
                    </div>
                </div>

                {/* Accuracy / RMSE */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                {problemType === 'Classification' ? 'Accuracy' : 'RMSE'}
                            </p>
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {formatMetric(problemType === 'Classification' ? metrics.accuracy : metrics.rmse || metrics.inertia)}
                            </h3>
                        </div>
                        <ModernIcon icon={Target} color="orange" />
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-auto overflow-hidden">
                        <div 
                            className="h-full bg-orange-500"
                            style={{ width: `${problemType === 'Classification' ? (metrics.accuracy || 0) * 100 : 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* F1 Score / R2 */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                     <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                {problemType === 'Classification' ? 'F1 Score' : 'R2 Score'}
                            </p>
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {formatMetric(metrics.f1_score || metrics.r2_score || metrics.silhouette)}
                            </h3>
                        </div>
                        <ModernIcon icon={Activity} color="dark" />
                    </div>
                    <p className="text-xs text-gray-400 mt-auto font-medium pt-2">
                        Validation: <span className="text-gray-700 font-bold">{formatMetric(metrics.cv_score_mean)}</span>
                    </p>
                </div>

                {/* Time */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Training Time</p>
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {formatMetric(metrics.training_time_sec)}<span className="text-sm font-bold text-gray-400 ml-1">s</span>
                            </h3>
                        </div>
                        <ModernIcon icon={Clock} color="gray" />
                    </div>
                     <p className="text-xs text-gray-400 mt-auto font-medium pt-2">
                         Dataset: <span className="font-bold text-gray-700">{data.rows || "?"} rows</span>
                     </p>
                </div>
            </div>

            {/* --- 2. GRILLE : FEATURES + MATRICE --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature Importance */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[380px]">
                    <div className="flex items-center gap-3 mb-4">
                        <ModernIcon icon={Zap} color="orange" />
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Feature Importance</h3>
                            <p className="text-xs text-gray-500 font-medium">Top influencing factors</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '300px' }}>
                        {featureImpData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={featureImpData} layout="vertical" margin={{top: 0, right: 30, left: 10, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6"/>
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="feature" 
                                        type="category" 
                                        width={110} 
                                        tick={{fontSize: 10, fill:'#4b5563', fontWeight: 600}} 
                                        interval={0}
                                    />
                                    <Tooltip 
                                        cursor={{fill: '#fff7ed'}} 
                                        contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)', fontWeight: 'bold'}} 
                                    />
                                    <Bar dataKey="importance" fill="#f97316" radius={[0, 4, 4, 0]} barSize={14} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <AlertCircle className="mb-2 opacity-50"/>
                                <span className="text-sm font-medium">No data available</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Confusion Matrix */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[380px]">
                    <div className="flex items-center gap-3 mb-2">
                        <ModernIcon icon={Layers} color="gray" />
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Confusion Matrix</h3>
                            <p className="text-xs text-gray-500 font-medium">Prediction breakdown</p>
                        </div>
                    </div>
                    {problemType === 'Classification' && cmData ? (
                        <div className="flex-1 w-full flex items-center justify-center">
                            <ConfusionMatrixViz matrixData={cmData} labels={cmLabels} />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                             <AlertCircle className="mb-2 opacity-50"/>
                             <span className="text-sm">Not available for Regression</span>
                        </div>
                    )}
                </div>
            </div>

            {/* --- 3. COURBE ROC (Centrée et taille fixe) --- */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <ModernIcon icon={Activity} color="dark" />
                        <div>
                            <h3 className="font-bold text-gray-900 text-xl">ROC Curve</h3>
                            <p className="text-sm text-gray-500 font-medium">Receiver Operating Characteristic</p>
                        </div>
                    </div>
                    {metrics.roc_auc && (
                        <div className="bg-orange-50 text-orange-700 border border-orange-200 px-4 py-2 rounded-lg font-bold shadow-sm">
                            AUC = {metrics.roc_auc.toFixed(4)}
                        </div>
                    )}
                </div>
                
                {/* CONTENEUR FIXE (600x450px) CENTRÉ */}
                <div className="w-full flex justify-center pb-4">
                    <div style={{ width: '600px', height: '450px', position: 'relative' }} className="border border-gray-100 rounded-lg p-4 bg-gray-50/20">
                        {rocData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart margin={{top: 20, right: 20, left: 10, bottom: 20}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                                    <XAxis 
                                        dataKey="fpr" 
                                        type="number" 
                                        domain={[0, 1]} 
                                        ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                                        label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -10, fill: '#374151', fontSize: 13, fontWeight: 600 }}
                                        tick={{ fill: '#4b5563', fontSize: 12 }}
                                    />
                                    <YAxis 
                                        domain={[0, 1]} 
                                        ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                                        label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', offset: 0, fill: '#374151', fontSize: 13, fontWeight: 600 }}
                                        tick={{ fill: '#4b5563', fontSize: 12 }}
                                    />
                                    <Tooltip 
                                        formatter={(value) => value.toFixed(4)}
                                        labelFormatter={(label) => `FPR: ${Number(label).toFixed(4)}`}
                                        contentStyle={{borderRadius: '8px', border:'1px solid #e5e7eb', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}
                                    />
                                    <Line 
                                        data={diagonalLine} 
                                        dataKey="tpr" 
                                        stroke="#1e1b4b" 
                                        strokeDasharray="5 5" 
                                        strokeWidth={2} 
                                        dot={false} 
                                        activeDot={false}
                                        isAnimationActive={false}
                                    />
                                    <Line 
                                        data={rocData}
                                        dataKey="tpr" 
                                        stroke="#ea580c" 
                                        strokeWidth={3} 
                                        dot={false} 
                                        activeDot={{r: 6, fill: '#ea580c'}} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
                                <BarChart2 size={48} className="mb-4 opacity-20"/>
                                <span className="text-lg font-medium">Not available</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- 4. TABLEAU DES MODÈLES --- */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <BarChart2 size={18} className="text-gray-400"/>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Models Leaderboard</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-50/30">
                            <tr>
                                <th className="px-8 py-4 font-bold tracking-wider">Rank</th>
                                <th className="px-8 py-4 font-bold tracking-wider">Algorithm</th>
                                <th className="px-8 py-4 text-right font-bold tracking-wider text-gray-800">Main Score</th>
                                <th className="px-8 py-4 text-right font-bold tracking-wider">Validation</th>
                                <th className="px-8 py-4 text-right font-bold tracking-wider">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {models.map((model, idx) => (
                                <tr key={idx} className={`group hover:bg-gray-50 transition-colors ${model.is_best_model ? 'bg-orange-50/10' : ''}`}>
                                    <td className="px-8 py-4">
                                        <span className={`font-mono text-xs w-6 h-6 flex items-center justify-center rounded-full ${idx === 0 ? 'bg-orange-100 text-orange-700 font-bold ring-2 ring-orange-100' : 'text-gray-400 bg-gray-100'}`}>
                                            {idx + 1}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            {model.is_best_model && <Trophy size={16} className="text-orange-500" />}
                                            <span className={`font-bold ${model.is_best_model ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {model.algorithm}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <span className="font-black text-gray-900 text-base">
                                            {formatMetric(problemType === 'Classification' ? model.metrics?.accuracy : model.metrics?.rmse)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-right text-gray-500 font-medium">
                                        {formatMetric(model.metrics?.cv_score_mean)}
                                    </td>
                                    <td className="px-8 py-4 text-right text-gray-400 font-mono text-xs">
                                        {formatMetric(model.metrics?.training_time_sec)}s
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- 5. BOUTON DOWNLOAD --- */}
            {report_filename && (
                <div className="flex justify-center pt-4 pb-8">
                    <a 
                        href={trainingService.getReportUrl(report_filename)}
                        target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-black hover:scale-105 transition-all shadow-xl shadow-gray-200"
                    >
                        <Download size={18} />
                        Download Full Report (PDF)
                    </a>
                </div>
            )}
            
        </div>
    );
};

export default Results;