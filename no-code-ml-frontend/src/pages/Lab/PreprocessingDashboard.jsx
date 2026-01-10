import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PreprocessingService from '../../services/preprocessingService';
import { 
  Database, Wand2, Scissors, 
  Activity, Scale, AlertCircle, CheckCircle, ArrowRight, Layers, 
  ChevronDown, Loader2, Sparkles, Check, X,
  ScanLine, TableProperties, FileWarning, Copy, BrainCircuit, Rocket, FastForward,
  LayoutList, Fingerprint, AlertTriangle, Target
} from 'lucide-react';

// --- NOUVEAU COMPOSANT ICONE MODERNE (Style SaaS) ---
const ModernIcon = ({ icon: Icon, color = "orange", size = "md" }) => {
  const styles = {
      orange: "from-orange-400 to-orange-600 shadow-orange-500/30",
      gray:   "from-slate-500 to-slate-700 shadow-slate-500/30",
      dark:   "from-slate-700 to-slate-900 shadow-slate-900/30",
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

// --- KPI CARD MISE À JOUR ---
const KpiCard = ({ icon: Icon, label, value, color = "gray" }) => {
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:translate-y-[-2px]">
            {/* Utilisation du nouvel icône moderne */}
            <ModernIcon icon={Icon} color={color} size="md" />
            
            <div className="overflow-hidden">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    {label}
                </div>
                <div className="text-2xl font-extrabold text-gray-800 truncate tracking-tight">
                    {value}
                </div>
            </div>
        </div>
    );
};

// --- COMPOSANT SELECTEUR ÉLÉGANT ---
const CustomSelect = ({ value, onChange, options, placeholder, icon: Icon, disabled, small }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${small ? 'w-full' : 'w-full'} z-50`} ref={dropdownRef}>
      <button 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between transition-all duration-200 border rounded-xl
          ${isOpen ? 'border-orange-500 ring-4 ring-orange-500/10 bg-white' : 'border-gray-200 bg-white hover:border-orange-300'}
          ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'cursor-pointer shadow-sm'}
          ${small ? 'py-2 px-3 text-xs' : 'py-3.5 px-5 text-sm'}
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {Icon && <Icon size={small ? 14 : 18} className={`${isOpen ? 'text-orange-600' : 'text-gray-400'}`} />}
          <span className={`font-semibold truncate ${selectedOption ? 'text-gray-800' : 'text-gray-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={small ? 14 : 16} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange-600' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
          <div className={`overflow-y-auto custom-scroll ${small ? 'max-h-40' : 'max-h-60'}`}>
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors
                  ${value === opt.value ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  ${small ? 'text-xs' : 'text-sm'}
                `}
              >
                <span className="truncate">{opt.label}</span>
                {value === opt.value && <Check size={small ? 12 : 14} className="text-orange-600"/>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- CONFIGURATION DES ÉTAPES ---
const STEPS = [
  { id: 0, key: 'TARGET', label: 'Target Variable', description: 'What do you want to predict?', icon: <Database size={18} /> },
  { id: 1, key: 'CLEANING', label: 'Data Cleaning', description: 'Handle missing values', icon: <Wand2 size={18} /> },
  { id: 2, key: 'ENCODING', label: 'Encoding', description: 'Categorical to numerical', icon: <Scissors size={18} /> },
  { id: 3, key: 'OUTLIERS', label: 'Outliers', description: 'Remove extremes', icon: <AlertCircle size={18} /> },
  { id: 4, key: 'NORMALIZATION', label: 'Normalization', description: 'Scale features', icon: <Activity size={18} /> },
  { id: 5, key: 'BALANCING', label: 'Balancing', description: 'Fix class imbalance', icon: <Scale size={18} /> },
];

const DataLab = () => {
  const navigate = useNavigate();
  const sessionId = localStorage.getItem('current_session_id');

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataInfo, setDataInfo] = useState(null);
  const [autoSkipping, setAutoSkipping] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [selectedColumnStats, setSelectedColumnStats] = useState(null);

  // Form Data
  const [targetCol, setTargetCol] = useState('');
  const [dropDups, setDropDups] = useState(false);
  const [cleanStrategies, setCleanStrategies] = useState({}); 
  const [encodeStrategies, setEncodeStrategies] = useState({});
  
  // Initialization
  const [outlierCols, setOutlierCols] = useState([]);
  const [outlierMethod, setOutlierMethod] = useState('iqr');
  const [outlierAction, setOutlierAction] = useState('clip');
  
  const [normCols, setNormCols] = useState([]);
  const [normMethod, setNormMethod] = useState('standard');
  const [balanceMethod, setBalanceMethod] = useState('smote');

  // --- INIT ---
  useEffect(() => {
    if (sessionId) refreshData();
  }, [sessionId]);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await PreprocessingService.getInfo(sessionId);
      if(res && res.info) setDataInfo(res.info);
      else throw new Error("Réponse vide.");
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  const goToNextStep = () => {
    const next = currentStep + 1;
    if (next < STEPS.length) {
      setCurrentStep(next);
      if (next > maxStepReached) setMaxStepReached(next);
    }
    setAutoSkipping(false);
  };

  // --- AUTO-SKIP LOGIC ---
  useEffect(() => {
    if (!dataInfo || loading) return;

    if (currentStep === 1) {
        const totalMissing = dataInfo.columns_summary.reduce((acc, c) => acc + c.missing, 0);
        if (totalMissing === 0 && dataInfo.duplicates === 0) {
            setAutoSkipping(true);
            const timer = setTimeout(() => goToNextStep(), 1500);
            return () => clearTimeout(timer);
        }
    }
    if (currentStep === 2) {
        const catCols = dataInfo.columns_summary.filter(c => c.type.includes('object') || c.type.includes('category'));
        const featuresToEncode = catCols.filter(c => c.name !== targetCol && targetCol !== 'NO_TARGET');
        
        if (featuresToEncode.length === 0) {
            setAutoSkipping(true);
            const timer = setTimeout(() => goToNextStep(), 1500);
            return () => clearTimeout(timer);
        }
    }
  }, [currentStep, dataInfo, targetCol]);

  // --- HANDLERS ---
  const handleSetTarget = () => { if (!targetCol) return alert("Sélectionnez une target."); goToNextStep(); };
  
  const handleApplyCleaning = async () => {
    setLoading(true);
    try {
      const strategies = Object.entries(cleanStrategies).map(([c, m]) => ({ column: c, method: m }));
      const res = await PreprocessingService.cleanData(sessionId, dropDups, strategies);
      setDataInfo(res.info);
      goToNextStep();
    } catch (e) { alert("Erreur nettoyage"); } finally { setLoading(false); }
  };

  const handleAutoClean = async () => {
    if(!targetCol) return alert("Sélectionnez la Target d'abord.");
    setLoading(true);
    try {
      const res = await PreprocessingService.runAutoPipeline(sessionId, targetCol);
      setDataInfo(res.info);
      setMaxStepReached(5);
      setCurrentStep(5);
    } catch (e) { alert("Erreur Auto-Pipeline"); } finally { setLoading(false); }
  };

  const handleApplyEncoding = async () => {
    setLoading(true);
    try {
      const strategies = Object.entries(encodeStrategies).map(([c, m]) => ({ column: c, method: m }));
      const res = await PreprocessingService.encodeData(sessionId, strategies, targetCol);
      setDataInfo(res.info);
      goToNextStep();
    } catch (e) { alert("Erreur encodage"); } finally { setLoading(false); }
  };

  const handleApplyOutliers = async () => {
    if(outlierCols.length === 0) return alert("Veuillez sélectionner au moins une colonne.");
    setLoading(true);
    try {
      const res = await PreprocessingService.handleOutliers(sessionId, outlierCols, outlierMethod, 1.5, outlierAction);
      setDataInfo(res.info);
      goToNextStep();
    } catch (e) { alert("Erreur outliers"); } finally { setLoading(false); }
  };

  const handleApplyNormalization = async () => {
    if(normCols.length === 0) return alert("Veuillez sélectionner au moins une colonne à normaliser.");
    setLoading(true);
    try {
      const res = await PreprocessingService.normalizeData(sessionId, normCols, normMethod);
      setDataInfo(res.info);
      goToNextStep();
    } catch (e) { alert("Erreur normalisation"); } finally { setLoading(false); }
  };

  const handleApplyBalancing = async () => {
    setLoading(true);
    try {
      const res = await PreprocessingService.balanceData(sessionId, targetCol, balanceMethod);
      setDataInfo(res.info);
      setShowSuccessModal(true);
    } catch (e) { alert("Erreur équilibrage"); } finally { setLoading(false); }
  };

  const handleSkipBalancing = () => {
    setShowSuccessModal(true);
  };

  if (!sessionId) return <div className="h-full flex items-center justify-center text-gray-500 text-xl">Aucune session.</div>;
  if (error) return <div className="h-full flex items-center justify-center text-red-500 text-xl">{error}</div>;
  if (loading || !dataInfo) return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-gray-800 mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">Chargement du Data Lab...</p>
    </div>
  );

  const numericCols = dataInfo.columns_summary.filter(c => c.type.includes('int') || c.type.includes('float')).map(c => c.name);
  const catCols = dataInfo.columns_summary.filter(c => c.type.includes('object') || c.type.includes('category')).map(c => c.name);
  const targetClasses = targetCol && targetCol !== 'NO_TARGET' && dataInfo.statistics[targetCol] ? dataInfo.columns_summary.find(c => c.name === targetCol)?.unique : 'N/A';

  const targetOptions = [
    { value: 'NO_TARGET', label: 'No Target (Clustering / Unsupervised)' },
    ...dataInfo.columns_summary.map(c => ({ value: c.name, label: `${c.name} (${c.type})` }))
  ];

  const cleaningOptions = [ { value: 'drop_rows', label: 'Drop Rows' }, { value: 'mean', label: 'Fill with Mean' }, { value: 'median', label: 'Fill with Median' }, { value: 'mode', label: 'Fill with Mode' } ];
  const encodingOptions = [ { value: 'label', label: 'Label Encoding' }, { value: 'onehot', label: 'One-Hot Encoding' } ];
  const outlierMethodOptions = [ { value: 'iqr', label: 'IQR (Interquartile Range)' }, { value: 'zscore', label: 'Z-Score (Standard Dev.)' } ];
  const outlierActionOptions = [ { value: 'clip', label: 'Clip (Cap Values)' }, { value: 'drop', label: 'Drop Rows' } ];
  const balancingOptions = [ { value: 'smote', label: 'SMOTE' }, { value: 'random_over', label: 'Random Oversampling' }, { value: 'random_under', label: 'Random Undersampling' } ];

  return (
    <div className="w-full bg-gray-50/50 font-sans text-gray-900 p-8 relative">
      
      {/* --- MODALE DE SUCCÈS --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-100 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Check size={32} className="text-green-600" strokeWidth={3} />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Preprocessing Complete</h2>
                <p className="text-gray-500 mb-8 px-2">
                    Your dataset has been successfully processed and is ready for model training.
                </p>

                <div className="flex gap-3 w-full">
                     <button onClick={() => setShowSuccessModal(false)} className="flex-1 py-3 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Close</button>
                     <button onClick={() => navigate('/training')} className="flex-[2] py-3 rounded-lg font-semibold text-white bg-gray-900 hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200">
                        <Rocket size={18} /> Train Model
                     </button>
                </div>
            </div>
        </div>
      )}

      {/* 1. TOP: KPI CARDS (MISE A JOUR AVEC VRAIES ICONES) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <KpiCard icon={LayoutList} label="Total Rows" value={dataInfo.shape.rows} color="orange" />
        <KpiCard icon={TableProperties} label="Columns" value={dataInfo.shape.columns} color="gray" />
        <KpiCard icon={AlertTriangle} label="Missing Values" value={dataInfo.columns_summary.reduce((acc, c) => acc + c.missing, 0)} color="orange" />
        <KpiCard icon={Copy} label="Duplicates" value={dataInfo.duplicates} color="gray" />
        <KpiCard icon={Fingerprint} label="Target Classes" value={targetClasses} color="dark" />
      </div>

      {/* 2. MIDDLE ROW */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* SIDEBAR */}
        <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col sticky top-6">
                <div className="p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                         <Layers size={18} className="text-orange-500"/> Pipeline Steps
                    </h3>
                </div>
                <div className="p-3 space-y-1 flex-1">
                    {STEPS.map((step) => {
                        const isActive = currentStep === step.id;
                        const isCompleted = step.id < maxStepReached;
                        const isLocked = step.id > maxStepReached;
                        return (
                            <button
                                key={step.id}
                                onClick={() => !isLocked && setCurrentStep(step.id)}
                                disabled={isLocked}
                                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 text-left group
                                    ${isActive 
                                        ? 'bg-orange-50 border border-orange-100'
                                        : 'hover:bg-gray-50 border border-transparent'}
                                    ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                <div className={`mr-3 p-2 rounded-md transition-colors 
                                    ${isActive 
                                        ? 'bg-white text-orange-600 shadow-sm' 
                                        : 'bg-gray-100 text-gray-400 group-hover:bg-white'}`}>
                                    {isCompleted && !isActive 
                                        ? <CheckCircle size={16} className="text-green-600"/> 
                                        : step.icon}
                                </div>
                                <div>
                                    <div className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{step.label}</div>
                                    <div className="text-[11px] text-gray-400 font-medium">{step.description}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                <div className="p-4 border-t border-gray-100 mt-auto bg-gray-50/30">
                     <button 
                        onClick={handleAutoClean} 
                        disabled={!targetCol}
                        className={`w-full py-3 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all border shadow-sm
                        ${targetCol ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-orange-200 hover:text-orange-600' : 'bg-gray-100 border-transparent text-gray-400 cursor-not-allowed'}`}
                    >
                        <Wand2 size={16} /> Auto-Pipeline
                     </button>
                </div>
            </div>
        </div>

        {/* WORKSPACE */}
        <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full min-h-[500px] relative flex flex-col">
                 {(loading || autoSkipping) && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] z-[60] flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-200">
                         <div className="relative mb-4">
                            <div className="w-12 h-12 border-4 border-gray-100 border-t-orange-500 rounded-full animate-spin"></div>
                        </div>
                        <span className="text-base font-semibold text-gray-700">Processing...</span>
                    </div>
                )}

                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{STEPS[currentStep].label}</h2>
                        <p className="text-sm text-gray-500 mt-1">Configure your processing parameters</p>
                    </div>
                    <div className="bg-gray-50 text-gray-500 px-3 py-1 rounded-md text-xs font-semibold border border-gray-200">
                        Step {currentStep + 1} / 6
                    </div>
                </div>

                <div className="p-8 flex-1 flex flex-col justify-center rounded-b-xl">
                    {/* STEP 0: TARGET */}
                    {currentStep === 0 && (
                        <div className="flex flex-col items-center justify-center w-full animate-in fade-in duration-300">
                            {/* NOUVELLE ICONE MODERNE POUR L'ETAPE 0 */}
                            <div className="mb-6"><ModernIcon icon={Target} color="orange" size="lg" /></div>
                            
                            <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">Select Target Variable</h3>
                            <p className="text-gray-500 text-center max-w-md mb-8">Choose the column you want your model to predict.</p>
                            
                            <div className="w-full max-w-xl">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Select Column</label>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <CustomSelect value={targetCol} onChange={setTargetCol} options={targetOptions} placeholder="Choose a target column..." icon={Database}/>
                                    </div>
                                    <button 
                                        onClick={handleSetTarget} 
                                        disabled={!targetCol} 
                                        className={`px-6 rounded-xl font-semibold shadow-sm transition-all flex items-center gap-2 whitespace-nowrap
                                            ${targetCol ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                                        `}
                                    >
                                        Confirm <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 1: CLEANING */}
                    {currentStep === 1 && (
                        <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-300">
                             <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl transition-all cursor-pointer hover:border-orange-300" onClick={() => setDropDups(!dropDups)}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${dropDups ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                                    {dropDups && <Check size={14} className="text-white" />}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-800">Remove duplicates</div>
                                    <div className="text-sm text-gray-500">{dataInfo.duplicates} duplicate rows detected.</div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-xl border border-gray-200">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Missing Values</h4>
                                    <span className="text-xs font-bold bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded">{dataInfo.columns_summary.filter(c => c.missing > 0).length} columns</span>
                                </div>
                                <div className="space-y-1 overflow-y-auto custom-scroll p-4 flex-1">
                                    {dataInfo.columns_summary.filter(c => c.missing > 0).length > 0 ? (
                                        dataInfo.columns_summary.filter(c => c.missing > 0).map(col => (
                                            <div key={col.name} className="flex flex-col sm:flex-row justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="mb-2 sm:mb-0 w-full">
                                                    <div className="font-medium text-gray-800 text-sm">{col.name}</div>
                                                    <div className="text-orange-500 text-xs font-medium mt-0.5">{col.missing} missing</div>
                                                </div>
                                                <div className="w-full sm:w-56">
                                                    <CustomSelect value={cleanStrategies[col.name] || ''} onChange={(val) => setCleanStrategies(prev => ({...prev, [col.name]: val}))} options={cleaningOptions} placeholder="Select action..." small={true}/>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full opacity-50">
                                            <CheckCircle size={32} className="text-gray-300 mb-2"/>
                                            <span className="font-medium text-gray-400 text-sm">No missing values found.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {dataInfo.columns_summary.some(c => c.missing > 0) || dataInfo.duplicates > 0 ? 
                                <button onClick={handleApplyCleaning} className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl shadow-sm hover:bg-black transition-all mt-auto">Apply Cleaning</button> 
                            : null}
                        </div>
                    )}

                    {/* STEP 2: ENCODING */}
                    {currentStep === 2 && (
                        <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-300">
                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-600 flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg border border-gray-200"><Scissors size={18} className="text-gray-500"/></div>
                                <div>
                                    <div className="font-semibold text-gray-800 text-sm">Categorical Encoding</div>
                                    <div className="text-xs text-gray-500">Convert text labels into numbers.</div>
                                </div>
                            </div>
                            <div className="overflow-y-auto custom-scroll space-y-2 flex-1">
                                {catCols.length > 0 && catCols.some(c => c !== targetCol && c !== 'NO_TARGET') ? (
                                    catCols.map(col => (
                                    <div key={col} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-gray-200 rounded-xl bg-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">Aa</div>
                                            <div>
                                                <span className="font-medium text-gray-800 text-sm block">{col}</span>
                                                {col === targetCol && <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Target</span>}
                                            </div>
                                        </div>
                                        <div className="w-56"><CustomSelect value={encodeStrategies[col] || (col === targetCol ? "label" : "")} onChange={(val) => setEncodeStrategies(prev => ({...prev, [col]: val}))} options={encodingOptions} placeholder="Select method..." disabled={col === targetCol} small={true}/></div>
                                    </div>
                                ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full opacity-50">
                                        <span className="font-medium text-gray-400 text-sm">No categorical features.</span>
                                    </div>
                                )}
                            </div>
                            {(catCols.length > 0 && catCols.some(c => c !== targetCol)) && 
                                <button onClick={handleApplyEncoding} className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl shadow-sm hover:bg-black transition-all mt-auto">Apply Encoding</button>
                            }
                        </div>
                    )}

                    {/* STEP 3: OUTLIERS */}
                    {currentStep === 3 && (
                        <div className="space-y-6 h-full flex flex-col justify-center animate-in fade-in duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Method</label>
                                    <CustomSelect value={outlierMethod} onChange={setOutlierMethod} options={outlierMethodOptions} placeholder="Select method" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Action</label>
                                    <CustomSelect value={outlierAction} onChange={setOutlierAction} options={outlierActionOptions} placeholder="Select action" />
                                </div>
                            </div>
                            <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Columns</label>
                                    <span className="text-xs text-gray-500">{outlierCols.length} selected</span>
                                </div>
                                <div className="overflow-y-auto custom-scroll p-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {numericCols.filter(c => c !== targetCol).map(col => (
                                            <div 
                                                key={col} 
                                                onClick={() => setOutlierCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
                                                className={`cursor-pointer border rounded-lg p-3 flex items-center gap-3 transition-all ${outlierCols.includes(col) ? 'bg-orange-50 border-orange-200' : 'hover:bg-gray-50 border-gray-200'}`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${outlierCols.includes(col) ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                                                    {outlierCols.includes(col) && <Check size={10} className="text-white"/>}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 truncate">{col}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleApplyOutliers} disabled={outlierCols.length === 0} className={`w-full py-3 font-semibold rounded-xl shadow-sm transition-all ${outlierCols.length > 0 ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                                Run Detection
                            </button>
                        </div>
                    )}

                    {/* STEP 4: NORMALIZATION */}
                    {currentStep === 4 && (
                        <div className="space-y-6 h-full flex flex-col justify-center animate-in fade-in duration-300">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div onClick={() => setNormMethod('standard')} className={`cursor-pointer p-6 border rounded-xl transition-all group ${normMethod === 'standard' ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200' : 'bg-white hover:border-gray-300 border-gray-200'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${normMethod === 'standard' ? 'border-orange-600' : 'border-gray-300'}`}>
                                            {normMethod === 'standard' && <div className="w-2 h-2 bg-orange-600 rounded-full"/>}
                                        </div>
                                        <span className="font-bold text-lg text-gray-800">Standard Scaler</span>
                                    </div>
                                    <p className="text-sm text-gray-500 ml-7">Mean = 0, Std = 1.</p>
                                </div>
                                <div onClick={() => setNormMethod('minmax')} className={`cursor-pointer p-6 border rounded-xl transition-all group ${normMethod === 'minmax' ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200' : 'bg-white hover:border-gray-300 border-gray-200'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${normMethod === 'minmax' ? 'border-orange-600' : 'border-gray-300'}`}>
                                            {normMethod === 'minmax' && <div className="w-2 h-2 bg-orange-600 rounded-full"/>}
                                        </div>
                                        <span className="font-bold text-lg text-gray-800">MinMax Scaler</span>
                                    </div>
                                    <p className="text-sm text-gray-500 ml-7">Range [0, 1].</p>
                                </div>
                             </div>

                             <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Columns to Normalize</label>
                                    <span className="text-xs text-gray-500">{normCols.length} selected</span>
                                </div>
                                <div className="overflow-y-auto custom-scroll p-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {numericCols.filter(c => c !== targetCol).map(col => (
                                            <div 
                                                key={col} 
                                                onClick={() => setNormCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])}
                                                className={`cursor-pointer border rounded-lg p-3 flex items-center gap-3 transition-all ${normCols.includes(col) ? 'bg-orange-50 border-orange-200' : 'hover:bg-gray-50 border-gray-200'}`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${normCols.includes(col) ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                                                    {normCols.includes(col) && <Check size={10} className="text-white"/>}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 truncate">{col}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                             <button onClick={handleApplyNormalization} disabled={normCols.length === 0} className={`w-full py-3 font-semibold rounded-xl shadow-sm transition-all ${normCols.length > 0 ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                                Normalize Data
                             </button>
                        </div>
                    )}

                    {/* STEP 5: BALANCING */}
                    {currentStep === 5 && (
                        <div className="flex flex-col h-full justify-center items-center space-y-8 animate-in fade-in duration-300">
                            <div className="text-center mt-4">
                                {/* NOUVELLE ICONE MODERNE POUR ETAPE 5 */}
                                <div className="mx-auto mb-6"><ModernIcon icon={Scale} color="orange" size="lg" /></div>
                                
                                <h3 className="text-2xl font-bold text-gray-800">Final Adjustments</h3>
                                <p className="text-gray-500 mt-2">
                                    Target: <span className="font-semibold text-gray-800">{targetCol === 'NO_TARGET' ? 'None' : targetCol}</span>
                                </p>
                            </div>
                            <div className="max-w-md mx-auto w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Balancing Strategy</label>
                                <CustomSelect value={balanceMethod} onChange={setBalanceMethod} options={balancingOptions} placeholder="Select strategy" />
                                
                                <div className="flex flex-col gap-3 mt-8">
                                    <button onClick={handleApplyBalancing} className="w-full py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2">
                                        <Rocket size={18}/> Apply & Finish
                                    </button>
                                    <button onClick={handleSkipBalancing} className="w-full py-2.5 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm">
                                        Skip this step <FastForward size={14}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* 3. BOTTOM ROW: TABLE & STATS */}
      <div className="grid grid-cols-12 gap-6 h-[600px]">
          {/* TABLE */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-50 p-2 rounded-lg text-gray-500"><Database size={18} /></div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm">Data Preview</h3>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                      {dataInfo.shape.rows} rows
                  </div>
              </div>

              <div className="overflow-x-auto no-scrollbar flex-1">
                  <table className="w-full text-sm text-left border-collapse">
                      <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                          <tr>
                              {dataInfo.columns_summary.map(col => {
                                  const isSelected = selectedColumnStats?.name === col.name;
                                  const isTarget = col.name === targetCol;
                                  return (
                                    <th key={col.name} onClick={() => setSelectedColumnStats(col)} className={`px-6 py-3 cursor-pointer transition-colors whitespace-nowrap text-xs font-bold uppercase tracking-wider ${isSelected ? 'bg-orange-50 text-orange-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                                      <div className="flex items-center gap-2">
                                          {col.name}
                                          {isTarget && (<span className="bg-gray-800 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">TARGET</span>)}
                                          {isSelected && <ChevronDown size={12} className="text-orange-600" />}
                                      </div>
                                    </th>
                                  );
                              })}
                          </tr>
                      </thead>
                      {/* --- MODIFICATION ICI : Sécurisation de l'affichage en cas de données manquantes --- */}
                      <tbody className="divide-y divide-gray-50">
                          {dataInfo.preview && dataInfo.preview.length > 0 ? (
                              dataInfo.preview.map((row, i) => (
                                  <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                                      {dataInfo.columns_summary.map(col => {
                                          const isSelected = selectedColumnStats?.name === col.name;
                                          // Protection contre les valeurs undefined ou null
                                          const cellValue = row[col.name];
                                          // Vérifie si la valeur existe vraiment (n'est pas null et n'est pas undefined)
                                          const displayValue = (cellValue !== null && cellValue !== undefined) 
                                            ? String(cellValue).substring(0, 25) 
                                            : null;

                                          return (
                                              <td key={col.name} className={`px-6 py-3 whitespace-nowrap text-sm border-r border-transparent last:border-r-0 ${isSelected ? 'bg-orange-50/30 font-medium text-gray-900' : 'text-gray-600'}`}>
                                                  {displayValue !== null ? displayValue : <span className="text-gray-300 italic text-xs">NaN</span>}
                                              </td>
                                          );
                                      })}
                                  </tr>
                              ))
                          ) : (
                              <tr>
                                  <td colSpan={dataInfo.columns_summary.length} className="px-6 py-8 text-center text-gray-400 italic">
                                      No preview data available.
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* STATS PANEL */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="bg-gray-50 p-2 rounded-lg text-gray-500"><Activity size={18} /></div>
                  <h3 className="font-bold text-gray-800 text-sm">Column Insights</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-6 custom-scroll">
                  {selectedColumnStats ? (
                      <div className="animate-in fade-in slide-in-from-right duration-200 space-y-6">
                          <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900 mb-1">{selectedColumnStats.name}</div>
                              <span className="text-xs font-bold bg-gray-100 border border-gray-200 px-3 py-1 rounded-full text-gray-500 uppercase tracking-wide">{selectedColumnStats.type}</span>
                          </div>
                          <div className="space-y-4">
                              <StatRow label="Missing Values" value={selectedColumnStats.missing} total={dataInfo.shape.rows} isAlert={selectedColumnStats.missing > 0} />
                              <StatRow label="Unique Values" value={selectedColumnStats.unique} />
                              {dataInfo.statistics[selectedColumnStats.name] && (
                              <>
                                  <div className="h-px bg-gray-100 my-4"></div>
                                  <StatRow label="Mean" value={dataInfo.statistics[selectedColumnStats.name].mean?.toFixed(2)} />
                                  <StatRow label="Std. Dev" value={dataInfo.statistics[selectedColumnStats.name].std?.toFixed(2)} />
                                  <StatRow label="Min" value={dataInfo.statistics[selectedColumnStats.name].min} />
                                  <StatRow label="Max" value={dataInfo.statistics[selectedColumnStats.name].max} />
                              </>
                              )}
                          </div>
                      </div>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-40">
                          <Activity size={48} className="text-gray-300 mb-4"/>
                          <p className="text-sm font-medium text-gray-500">Select a column to view stats</p>
                      </div>
                  )}
              </div>
          </div>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const StatRow = ({ label, value, total, isAlert }) => (
    <div className="flex justify-between items-center text-sm py-1">
        <span className="text-gray-500 font-medium">{label}</span>
        <div className="flex items-center gap-2">
            <span className={`font-bold ${isAlert ? "text-orange-600" : "text-gray-800"}`}>{value ?? '-'}</span>
            {total && <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded font-medium">({((value/total)*100).toFixed(0)}%)</span>}
        </div>
    </div>
);

export default DataLab;