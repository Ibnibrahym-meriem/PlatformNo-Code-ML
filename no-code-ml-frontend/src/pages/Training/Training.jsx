import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { 
    Target, ChevronDown, ChevronUp, Play, Sliders, 
    Zap, Activity, Layers, Settings, CheckCircle2, 
    BarChart2, MousePointer2, Database, Check,
    Component, PieChart, AlertTriangle // Ajout de AlertTriangle
} from 'lucide-react';

import PreprocessingService from '../../services/preprocessingService';
import trainingService from '../../services/trainingService';
import { PROBLEM_TYPES, ALGO_META } from './constants';

// --- COMPOSANT ICONE MODERNE (Conservé) ---
const ModernIcon = ({ icon: Icon, color = "orange", size = "md" }) => {
    const styles = {
        orange: "from-orange-400 to-orange-600 shadow-orange-500/30",
        yellow: "from-amber-400 to-amber-600 shadow-amber-500/30",
        blue:   "from-blue-400 to-blue-600 shadow-blue-500/30",
        gray:   "from-slate-500 to-slate-700 shadow-slate-500/30",
        dark:   "from-slate-700 to-slate-900 shadow-slate-900/30",
        violet: "from-violet-400 to-violet-600 shadow-violet-500/30"
    };
    
    const dims = size === "lg" ? "w-16 h-16 rounded-2xl" : "w-12 h-12 rounded-xl";
    const iconSize = size === "lg" ? 32 : 22;

    return (
        <div className={`
            ${dims} flex items-center justify-center 
            bg-gradient-to-br ${styles[color] || styles.orange}
            shadow-lg text-white transform transition-transform hover:scale-105 duration-200
        `}>
            <Icon size={iconSize} strokeWidth={2.5} />
        </div>
    );
};

// --- COMPOSANT CARTE ALGO (Conservé) ---
const AlgoCardItem = ({ name, description, badge, isSelected, onClick }) => (
    <div 
        onClick={onClick}
        className={`
            relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[110px] group
            ${isSelected 
                ? 'border-orange-500 bg-orange-50/30' 
                : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-md'
            }
        `}
    >
        {isSelected && (
            <div className="absolute top-2 right-2 text-orange-500 animate-in zoom-in">
                <CheckCircle2 size={18} fill="currentColor" className="text-white" />
            </div>
        )}
        
        <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-md transition-colors ${isSelected ? 'bg-orange-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                {ALGO_META[name] && React.createElement(ALGO_META[name].icon, { 
                    size: 16, 
                    className: isSelected ? 'text-orange-600' : 'text-gray-500' 
                })}
                {!ALGO_META[name] && <Zap size={16} className={isSelected ? 'text-orange-600' : 'text-gray-500'}/>}
            </div>
            <h4 className="font-semibold text-sm text-gray-800 leading-tight">{name}</h4>
        </div>
        
        <p className="text-[10px] text-gray-500 mb-2 line-clamp-2">{description || "Algorithme standard"}</p>
        
        <div className="flex items-center">
            <span className={`
                text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border
                ${badge === 'high' ? 'bg-gray-100 text-gray-600 border-gray-200' : 
                  badge === 'low' ? 'bg-gray-50 text-gray-400 border-gray-100' :
                  'bg-orange-50 text-orange-600 border-orange-100'}
            `}>
                {badge || 'medium'}
            </span>
        </div>
    </div>
);

const ModelTraining = () => {
    const navigate = useNavigate();

    // --- STATE LOGIC ---
    const [sessionId] = useState(localStorage.getItem('current_session_id'));
    const [columns, setColumns] = useState([]);
    
    const [targetCol, setTargetCol] = useState(null);
    const [problemType, setProblemType] = useState(null);
    const [selectedAlgos, setSelectedAlgos] = useState([]);
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [autoSuggest] = useState(true);
    
    const [splitRatio, setSplitRatio] = useState(20); 
    const [kFolds, setKFolds] = useState(5);
    const [showHyperparams, setShowHyperparams] = useState(true); 
    const [hyperparams, setHyperparams] = useState({}); 
    const [paramDefinitions, setParamDefinitions] = useState({});

    const [loading, setLoading] = useState(false);

    // --- 1. LOAD DATA ---
    useEffect(() => {
        if (!sessionId) {
            // Pas de session, on ne fait rien ici, l'affichage sera géré par le if(!sessionId) plus bas
            return;
        }
        const init = async () => {
            try {
                const response = await PreprocessingService.getInfo(sessionId);
                const realData = response.data || response;

                if (realData && realData.info && Array.isArray(realData.info.columns_summary)) {
                    setColumns(realData.info.columns_summary.map(c => c.name));
                } 
                else if (realData && Array.isArray(realData.columns_summary)) {
                    setColumns(realData.columns_summary.map(c => c.name));
                }
                else {
                    toast.error("Format de données invalide");
                }
            } catch (e) { 
                console.error("Erreur chargement session"); 
                // Optionnel: toast.error("Erreur chargement session");
            }
        };
        init();
    }, [sessionId]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    // --- 2. DETECT TARGET ---
    const handleTargetSelection = async (colName) => {
        setIsDropdownOpen(false);
        if (colName !== "" && colName === targetCol) return;

        setTargetCol(colName);
        setSelectedAlgos([]);
        setHyperparams({});

        // LOGIQUE CLUSTERING
        if (colName === "") {
            setProblemType("Unsupervised"); 
            if (autoSuggest) {
                 setTimeout(() => toggleAlgo("K-Means", true), 50);
            }
            toast.success("Mode Clustering (Non-supervisé) activé");
            return; 
        }

        // LOGIQUE STANDARD
        setProblemType(null); 
        const tId = toast.loading("Analyse de la cible...");
        
        try {
            const res = await trainingService.detectProblemType(sessionId, colName);
            const type = res.data ? res.data.problem_type : res.problem_type;
            
            setProblemType(type);
            toast.success(`Type détecté : ${type}`, { id: tId });

            if (autoSuggest) {
                let suggestion = [];
                if (type === 'Classification') suggestion = ["Random Forest", "Logistic Regression"];
                else if (type === 'Regression') suggestion = ["Linear Regression", "Random Forest"];
                
                suggestion.forEach(algo => toggleAlgo(algo, true)); 
            }
        } catch (err) {
            toast.error("Erreur de détection", { id: tId });
            setProblemType(null);
        }
    };

    // --- 3. HANDLE ALGOS ---
    const toggleAlgo = async (algo, forceSelect = false) => {
        let newSelection;
        if (selectedAlgos.includes(algo) && !forceSelect) {
            newSelection = selectedAlgos.filter(a => a !== algo);
        } else {
            if (selectedAlgos.includes(algo)) return;
            newSelection = [...selectedAlgos, algo];
            
            if (!paramDefinitions[algo]) {
                try {
                    const res = await trainingService.getHyperparameters(algo);
                    const paramsData = res.data || res;
                    
                    if (Array.isArray(paramsData)) {
                        setParamDefinitions(prev => ({ ...prev, [algo]: paramsData }));
                        const defaults = {};
                        paramsData.forEach(p => defaults[p.name] = p.default);
                        setHyperparams(prev => ({ ...prev, [algo]: defaults }));
                    }
                } catch (e) { console.error(e); }
            }
        }
        setSelectedAlgos(newSelection);
    };

    const updateHyperparam = (algo, param, value) => {
        setHyperparams(prev => ({
            ...prev,
            [algo]: { ...prev[algo], [param]: value }
        }));
    };

    // --- 4. START TRAIN ---
    const startTraining = async () => {
        if ((!targetCol && problemType !== 'Unsupervised') || selectedAlgos.length === 0) return;
        
        setLoading(true);
        const tId = toast.loading("Entraînement des modèles...");
        
        try {
            const payload = {
                session_id: sessionId,
                target_column: targetCol,
                problem_type: problemType,
                algorithm_names: selectedAlgos,
                split_ratio: splitRatio / 100,
                k_folds: kFolds,
                hyperparameters: hyperparams
            };

            const res = await trainingService.trainModels(payload);
            const resultData = res.data || res; 

            localStorage.setItem('last_training_results', JSON.stringify(resultData));
            toast.success("Terminé ! Redirection...", { id: tId });
            setTimeout(() => { navigate('/results'); }, 1000);

        } catch (err) {
            toast.error("Échec de l'entraînement", { id: tId });
        } finally {
            setLoading(false);
        }
    };

    const availableAlgos = problemType ? PROBLEM_TYPES[problemType] : [];

    // --- 5. GESTION DU CAS "PAS DE DONNÉES" (AJOUTÉ ICI) ---
    if (!sessionId) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-12 text-center max-w-lg w-full shadow-xl shadow-gray-200 border border-gray-100 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={36} className="text-orange-500" strokeWidth={2}/>
                    </div>
                    
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Aucune donnée chargée</h2>
                    <p className="text-gray-500 mb-8 font-medium">
                        Pour entraîner un modèle, vous devez d'abord importer un jeu de données.
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

    // --- AFFICHAGE NORMAL (Si sessionId existe) ---
    return (
        <div className="min-h-screen bg-[#F8F9FA] text-gray-800 font-sans p-6">
            <Toaster position="top-center" />
            
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* --- COLONNE GAUCHE (Target) --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[380px] relative z-20">
                        {/* HEADER AVEC ICONE MODERNE */}
                        <div className="flex items-center gap-4 mb-8">
                            <ModernIcon icon={Target} color="orange" />
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Target Variable</h3>
                                <p className="text-xs text-gray-500 font-medium">What do you want to predict?</p>
                            </div>
                        </div>

                        {/* Dropdown */}
                        <div className="relative mb-8" ref={dropdownRef}>
                            <label className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-2 block ml-1">Select Column</label>
                            
                            <div 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`
                                    w-full bg-white border cursor-pointer text-sm font-semibold rounded-xl px-4 py-4 flex items-center justify-between transition-all shadow-sm
                                    ${isDropdownOpen ? 'border-orange-500 ring-4 ring-orange-500/10' : 'border-gray-200 hover:border-gray-300'}
                                `}
                            >
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Database size={18} className={isDropdownOpen ? 'text-orange-500' : 'text-gray-400'} />
                                    <span>
                                        {targetCol === "" 
                                            ? "🚫 No Target (Clustering)" 
                                            : (targetCol || "Choose a target column...")
                                        }
                                    </span>
                                </div>
                                <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Menu Liste */}
                            {isDropdownOpen && (
                                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto animate-in slide-in-from-top-2 fade-in duration-200">
                                    <div className="p-1">
                                        <div 
                                            onClick={() => handleTargetSelection("")}
                                            className={`
                                                px-4 py-3 rounded-lg cursor-pointer text-sm font-bold flex items-center justify-between transition-colors mb-1 border-b border-gray-50
                                                ${targetCol === "" ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-50'}
                                            `}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Component size={16} />
                                                <span>No Target (Clustering)</span>
                                            </div>
                                            {targetCol === "" && <Check size={16} />}
                                        </div>

                                        {columns.length > 0 ? columns.map(c => (
                                            <div 
                                                key={c} 
                                                onClick={() => handleTargetSelection(c)}
                                                className={`
                                                    px-4 py-3 rounded-lg cursor-pointer text-sm font-medium flex items-center justify-between transition-colors
                                                    ${targetCol === c ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                                                `}
                                            >
                                                {c}
                                                {targetCol === c && <Check size={16} />}
                                            </div>
                                        )) : (
                                            <div className="px-4 py-3 text-sm text-gray-400 text-center italic">Chargement...</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mb-2 relative z-10">
                            <h4 className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-3 ml-1">Detected Type</h4>
                            <div className="grid grid-cols-2 gap-4 h-24">
                                {problemType === 'Unsupervised' ? (
                                    <div className="col-span-2 border-2 border-gray-200 bg-gray-50 text-gray-500 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm animate-in zoom-in">
                                        <Component size={28} />
                                        <span className="text-sm font-bold">Clustering (Unsupervised)</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1 animate-pulse"/>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`
                                            border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300
                                            ${problemType === 'Classification' 
                                                ? 'border-orange-500 bg-orange-50/50 text-orange-700 shadow-sm' 
                                                : 'border-dashed border-gray-200 text-gray-300 bg-gray-50/50'}
                                        `}>
                                            <Layers size={24} />
                                            <span className="text-xs font-bold">Classification</span>
                                            {problemType === 'Classification' && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1 animate-pulse"/>}
                                        </div>
                                        <div className={`
                                            border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300
                                            ${problemType === 'Regression' 
                                                ? 'border-orange-500 bg-orange-50/50 text-orange-700 shadow-sm' 
                                                : 'border-dashed border-gray-200 text-gray-300 bg-gray-50/50'}
                                        `}>
                                            <BarChart2 size={24} />
                                            <span className="text-xs font-bold">Regression</span>
                                            {problemType === 'Regression' && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1 animate-pulse"/>}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- COLONNE DROITE (Algorithmes) --- */}
                <div className="lg:col-span-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[380px] z-10">
                        {/* HEADER AVEC ICONE MODERNE */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <ModernIcon icon={Zap} color="yellow" />
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Algorithms</h3>
                                    <p className="text-xs text-gray-500 font-medium">Select one or more to compare</p>
                                </div>
                            </div>
                        </div>

                        {!problemType ? (
                            <div className="flex flex-col items-center justify-center h-60 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                                <MousePointer2 className="text-gray-300 mb-2" size={32}/>
                                <p className="text-sm font-medium text-gray-400">Select a target variable first</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
                                {availableAlgos.map(algo => (
                                    <AlgoCardItem
                                        key={algo}
                                        name={algo}
                                        description={ALGO_META[algo]?.desc}
                                        badge={ALGO_META[algo]?.tag} 
                                        isSelected={selectedAlgos.includes(algo)}
                                        onClick={() => toggleAlgo(algo)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- LIGNE BASSE : EVALUATION / CROSS VALIDATION --- */}
                <div className="lg:col-span-5">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col justify-center">
                        {/* HEADER AVEC ICONE MODERNE */}
                        <div className="flex items-center gap-4 mb-6">
                            <ModernIcon icon={Settings} color="blue" />
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Evaluation Strategy</h3>
                                <p className="text-xs text-gray-500 font-medium">Split & Cross-Validation</p>
                            </div>
                        </div>

                        <div className="space-y-6 px-2">
                            {/* --- TEST SIZE SLIDER --- */}
                            <div className="border-b border-gray-50 pb-6">
                                <div className="flex justify-between mb-3 items-end">
                                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <PieChart size={14} className="text-gray-400"/> Test Set Size
                                    </label>
                                    <span className="text-sm font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md min-w-[40px] text-center">{splitRatio}%</span>
                                </div>
                                <input 
                                    type="range" min="10" max="50" step="5"
                                    value={splitRatio} onChange={e=>setSplitRatio(e.target.value)}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-600 transition-colors"
                                />
                                <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                    <span>Training (90%)</span>
                                    <span>Balanced (50%)</span>
                                </div>
                            </div>

                            {/* K-Fold Slider */}
                            <div>
                                <div className="flex justify-between mb-3 items-end">
                                    <label className="text-sm font-bold text-gray-700">Number of Folds</label>
                                    <span className="text-sm font-bold bg-gray-900 text-white px-2 py-0.5 rounded-md min-w-[24px] text-center">{kFolds}</span>
                                </div>
                                <input 
                                    type="range" min="2" max="10" 
                                    value={kFolds} onChange={e=>setKFolds(e.target.value)}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-600 transition-colors"
                                />
                                <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                    <span>Fast (2)</span>
                                    <span>Robust (10)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- LIGNE BASSE : HYPERPARAMETERS --- */}
                <div className="lg:col-span-7">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
                        <div 
                            className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded-t-xl transition-colors"
                            onClick={() => setShowHyperparams(!showHyperparams)}
                        >
                            {/* HEADER AVEC ICONE MODERNE */}
                            <div className="flex items-center gap-4">
                                <ModernIcon icon={Sliders} color="gray" />
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Hyperparameters</h3>
                                    <p className="text-xs text-gray-500 font-medium">Fine-tune model configuration</p>
                                </div>
                            </div>
                            {showHyperparams ? <ChevronUp className="text-gray-400"/> : <ChevronDown className="text-gray-400"/>}
                        </div>

                        {showHyperparams && (
                            <div className="px-6 pb-6 flex-1 overflow-y-auto max-h-[250px] scrollbar-thin">
                                {selectedAlgos.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-8">Select algorithms to see parameters</p>
                                ) : (
                                    <div className="space-y-8 mt-2">
                                        {selectedAlgos.map(algoName => (
                                            <div key={algoName} className="space-y-4 animate-in slide-in-from-bottom-2">
                                                <h5 className="text-xs font-bold uppercase text-orange-600 tracking-wide border-b border-gray-100 pb-2">{algoName}</h5>
                                                {paramDefinitions[algoName]?.map(param => (
                                                    <div key={param.name}>
                                                        <div className="flex justify-between mb-2">
                                                            <label className="text-sm font-medium text-gray-700">{param.name.replace(/_/g, ' ')}</label>
                                                            <span className="text-xs font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100 text-gray-600">
                                                                {hyperparams[algoName]?.[param.name]}
                                                            </span>
                                                        </div>
                                                        <input 
                                                            type="range"
                                                            min={param.min || 1}
                                                            max={param.max || 100}
                                                            step={param.step || 1}
                                                            value={hyperparams[algoName]?.[param.name] || param.default}
                                                            onChange={(e) => updateHyperparam(algoName, param.name, parseFloat(e.target.value))}
                                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                                        />
                                                    </div>
                                                ))}
                                                {(!paramDefinitions[algoName] || paramDefinitions[algoName].length === 0) && (
                                                    <p className="text-xs text-gray-400 italic">Default parameters (no tuning available)</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- ACTION BAR (Bas de page) --- */}
            <div className="w-full mt-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row justify-between items-center shadow-sm">
                    <div className="hidden md:block"></div>

                    <button 
                        onClick={startTraining}
                        disabled={loading || (!targetCol && problemType !== 'Unsupervised') || selectedAlgos.length === 0}
                        className={`
                            w-full md:w-auto px-8 py-3 rounded-lg font-bold text-white shadow-md flex justify-center items-center gap-2 transition-all
                            ${loading || (!targetCol && problemType !== 'Unsupervised') || selectedAlgos.length === 0
                                ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                                : 'bg-[#F29C7E] hover:bg-[#E88B6D] active:scale-95'
                            }
                        `}
                    >
                        {loading ? (
                            <span>Training...</span>
                        ) : (
                            <>
                                <Play size={18} fill="currentColor"/>
                                <span>Train Model</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModelTraining;