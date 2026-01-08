import React, { useState, useEffect, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Trash2, Calculator, Hash, Type, Binary, Scale, Scissors, Shuffle, 
  Activity, Layers, AlertTriangle, Copy, Heart, Wand2, FileMinus, 
  ArrowRight, CheckCircle2, Lock
} from 'lucide-react';

import labService from '../../services/labService';
import { KpiCard, ActionItem, DataPreview } from './LabComponents'; 

const STEPS = [
    { id: 'Missing', label: 'Missing', icon: AlertTriangle },
    { id: 'Duplicates', label: 'Doublons', icon: Copy },
    { id: 'Encode', label: 'Encode', icon: Hash },
    { id: 'Outliers', label: 'Outliers', icon: Scissors },
    { id: 'Scale', label: 'Scale', icon: Scale },
    { id: 'Smote', label: 'Smote', icon: Shuffle },
];

const CustomSelect = ({ label, value, options, onChange, placeholder = "Sélectionner...", disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full mb-4" ref={containerRef}>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">
                {label}
            </label>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold py-3 px-4 rounded-xl transition-all shadow-sm
                    ${isOpen ? 'border-orange-600 ring-1 ring-orange-600 bg-white' : 'hover:border-orange-300 hover:bg-white'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <span className="truncate">{value || placeholder}</span>
                <span className="text-slate-400 text-xs">▼</span>
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl shadow-slate-300/50 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                    {options.length > 0 ? options.map((opt) => (
                        <div
                            key={opt}
                            onClick={() => { onChange({ target: { value: opt } }); setIsOpen(false); }}
                            className={`px-4 py-2.5 text-sm cursor-pointer border-b border-slate-50 last:border-0 transition-colors ${value === opt ? 'font-bold text-orange-700 bg-orange-50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            {opt}
                        </div>
                    )) : (
                        <div className="px-4 py-3 text-xs text-slate-400 italic">Aucune colonne compatible</div>
                    )}
                </div>
            )}
        </div>
    );
};

const DataLab = () => {
  const [sessionId] = useState(localStorage.getItem('current_session_id'));
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [activeKpi, setActiveKpi] = useState(null);

  const currentStep = STEPS[currentStepIndex];

  useEffect(() => { if (sessionId) loadData(); }, [sessionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await labService.getInfo(sessionId);
      if (res.data && res.data.info) {
        setInfo(res.data.info);
        updateSelectedColumnForStep(0, res.data.info);
      }
    } catch (err) { toast.error("Erreur de chargement"); } 
    finally { setLoading(false); }
  };

  const isNumeric = (colName, currentInfo = info) => {
      const col = currentInfo?.columns_summary.find(c => c.name === colName);
      if (!col) return false;
      const type = (col.type || col.dtype || '').toLowerCase();
      return type.includes('int') || type.includes('float') || type.includes('number');
  };

  const isCategorical = (colName, currentInfo = info) => {
      const col = currentInfo?.columns_summary.find(c => c.name === colName);
      if (!col) return false;
      const type = (col.type || col.dtype || '').toLowerCase();
      return type.includes('object') || type.includes('category') || type.includes('bool');
  };

  const getCompatibleColumns = (stepId = currentStep.id, currentInfo = info) => {
      if (!currentInfo) return [];
      const allCols = currentInfo.columns_summary.map(c => c.name);
      if (stepId === 'Encode') return allCols.filter(c => isCategorical(c, currentInfo));
      if (stepId === 'Scale' || stepId === 'Outliers') return allCols.filter(c => isNumeric(c, currentInfo));
      return allCols; 
  };

  const updateSelectedColumnForStep = (idx, currentInfo = info) => {
      const stepId = STEPS[idx].id;
      const compatible = getCompatibleColumns(stepId, currentInfo);
      setSelectedColumn(compatible.length > 0 ? compatible[0] : '');
  };

  const handleNextStep = () => {
      if (currentStepIndex < STEPS.length - 1) {
          const nextIndex = currentStepIndex + 1;
          setCurrentStepIndex(nextIndex);
          updateSelectedColumnForStep(nextIndex);
          toast.success(`Étape : ${STEPS[nextIndex].label}`);
      } else {
          toast.success("Processus terminé !");
      }
  };

  const handleAction = async (promise, msg) => {
    if (!sessionId) return;
    toast.promise(promise, {
      loading: 'Traitement en cours...',
      success: (res) => { setInfo(res.data.info); return msg; },
      error: "Erreur lors du traitement"
    });
  };

  const autoClean = () => handleAction(labService.clean(sessionId, [], true), "Auto Clean Terminé");
  const removeDuplicates = () => handleAction(labService.clean(sessionId, [], false, true), "Doublons supprimés");
  const clean = (m, v=null) => handleAction(labService.clean(sessionId, [{column: selectedColumn, method: m, value: v}]), "Nettoyé");
  const encode = (m) => handleAction(labService.encode(sessionId, [{column: selectedColumn, method: m}]), "Encodé");
  const norm = (m) => handleAction(labService.normalize(sessionId, [selectedColumn], m), "Normalisé");
  const outlier = (a) => handleAction(labService.outliers(sessionId, [selectedColumn], a), "Outliers traités");
  const balance = (m) => handleAction(labService.balance(sessionId, selectedColumn, m), "Équilibré");

  if (!sessionId) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400">Session introuvable</div>;
  if (loading && !info) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div></div>;
  if (!info) return null;

  const compatibleCols = getCompatibleColumns();

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-[#f8fafc] p-6 font-sans text-slate-900 flex flex-col gap-6 overflow-hidden">
      <Toaster position="bottom-right" />

      {/* --- 1. LIGNE DES KPIs --- */}
      <div className="grid grid-cols-5 gap-6 shrink-0 h-[140px]">
          <KpiCard title="Lignes" value={info.shape.rows} icon={Activity} color="text-orange-600" isActive={activeKpi==='rows'} onClick={()=>setActiveKpi('rows')} />
          <KpiCard title="Colonnes" value={info.shape.columns} icon={Layers} color="text-blue-600" isActive={activeKpi==='cols'} onClick={()=>setActiveKpi('cols')} />
          <KpiCard title="Vides" value={info.columns_summary.reduce((a, c) => a + c.missing, 0)} icon={AlertTriangle} color="text-yellow-600" isActive={activeKpi==='missing'} onClick={()=>setActiveKpi('missing')} />
          <KpiCard title="Doublons" value={info.duplicates} icon={Copy} color="text-red-600" isActive={activeKpi==='dups'} onClick={()=>setActiveKpi('dups')} />
          <KpiCard title="Santé" value={`${(100 - (info.columns_summary.reduce((a, c) => a + c.missing, 0)/(info.shape.rows*info.shape.columns)*100)).toFixed(0)}%`} icon={Heart} color="text-green-600" isActive={activeKpi==='health'} onClick={()=>setActiveKpi('health')} />
      </div>

      {/* --- 2. BOUTON AI AUTO CLEAN (ALIGNÉ À DROITE, DANS LA ZONE ROUGE) --- */}
      <div className="flex justify-end shrink-0">
          <button 
              onClick={autoClean} 
              className="flex items-center gap-3 bg-[#c2410c] text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:bg-[#9a3412] transition-all duration-300 active:scale-95 group"
          >
              <Wand2 size={20} className="group-hover:rotate-12 transition-transform" /> 
              <span className="font-extrabold text-sm uppercase tracking-widest">AI Auto Clean</span>
          </button>
      </div>

      {/* --- 3. WORKSPACE (2 COLONNES) --- */}
      <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
          
          {/* SIDEBAR (ACTIONS SÉQUENTIELLES) */}
          <div className="w-[360px] flex-shrink-0 bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              
              <div className="p-6 border-b border-slate-100 bg-white">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-900 text-lg">Smart Actions</h3>
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded">
                          {currentStepIndex + 1} / {STEPS.length}
                      </span>
                  </div>

                  {/* NAVIGATION TABS */}
                  <div className="flex gap-1.5 bg-slate-50 p-1.5 rounded-xl overflow-x-auto no-scrollbar mb-6">
                      {STEPS.map((step, idx) => (
                          <button 
                            key={step.id}
                            onClick={() => { setCurrentStepIndex(idx); updateSelectedColumnForStep(idx); }}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all flex-shrink-0
                                ${idx === currentStepIndex 
                                    ? 'bg-white text-orange-600 shadow-md' 
                                    : idx < currentStepIndex ? 'text-green-600' : 'text-slate-400'}
                            `}
                          >
                              {step.label}
                          </button>
                      ))}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
                      {currentStep.label}
                  </h4>

                  {/* SELECTEUR DE COLONNE */}
                  {currentStep.id !== 'Duplicates' && (
                      <CustomSelect 
                        label={currentStep.id === 'Smote' ? "Target" : "Colonne Cible"}
                        value={selectedColumn}
                        options={compatibleCols}
                        onChange={(e) => setSelectedColumn(e.target.value)}
                        placeholder={compatibleCols.length===0 ? "-" : "Choisir..."}
                        disabled={compatibleCols.length === 0}
                      />
                  )}
              </div>

              {/* LISTE DES ACTIONS */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-50/30">
                  {currentStep.id === 'Missing' && (
                    <>
                      <ActionItem icon={Trash2} title="Drop Rows" desc="Supprimer lignes vides" onClick={() => clean('drop_rows')} variant="destructive" />
                      <ActionItem icon={Calculator} title="Fill Mean" desc="Remplacer par Moyenne" onClick={() => clean('mean')} />
                      <ActionItem icon={Hash} title="Fill Median" desc="Remplacer par Médiane" onClick={() => clean('median')} />
                      <ActionItem icon={Type} title="Fill Mode" desc="Remplacer par Mode" onClick={() => clean('mode')} />
                    </>
                  )}

                  {currentStep.id === 'Duplicates' && (
                    <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-sm text-slate-500 mb-4">Suppression globale des doublons.</p>
                        <ActionItem icon={FileMinus} title="Remove Duplicates" desc="Tout supprimer" onClick={removeDuplicates} variant="destructive" />
                    </div>
                  )}

                  {currentStep.id === 'Encode' && compatibleCols.length > 0 && (
                    <>
                      <ActionItem icon={Hash} title="Label Encoding" desc="0, 1, 2..." onClick={() => encode('label')} />
                      <ActionItem icon={Binary} title="One-Hot Encoding" desc="Colonnes binaires" onClick={() => encode('onehot')} />
                    </>
                  )}

                  {currentStep.id === 'Scale' && compatibleCols.length > 0 && (
                     <>
                       <ActionItem icon={Scale} title="Standard Scaler" desc="Z-Score Normalization" onClick={() => norm('standard')} />
                       <ActionItem icon={Scale} title="MinMax Scaler" desc="Scale 0-1" onClick={() => norm('minmax')} />
                     </>
                  )}

                  {currentStep.id === 'Outliers' && compatibleCols.length > 0 && (
                    <>
                       <ActionItem icon={Scissors} title="Cap Outliers" desc="Clip (IQR)" onClick={() => outlier('clip')} />
                       <ActionItem icon={Trash2} title="Drop Outliers" desc="Remove (IQR)" onClick={() => outlier('drop')} variant="destructive" />
                    </>
                  )}

                  {currentStep.id === 'Smote' && (
                     <>
                      <ActionItem icon={Shuffle} title="SMOTE" desc="Générer synthétique" onClick={() => balance('smote')} />
                      <ActionItem icon={Trash2} title="Undersample" desc="Réduire majorité" onClick={() => balance('random_under')} variant="destructive" />
                     </>
                  )}
              </div>

              {/* BOUTON SUIVANT */}
              <div className="p-5 border-t border-slate-100 bg-white shrink-0">
                <button onClick={handleNextStep} className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${currentStepIndex < STEPS.length - 1 ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200'}`}>
                    {currentStepIndex < STEPS.length - 1 ? (<>Étape Suivante <ArrowRight size={18}/></>) : (<>Terminer le Lab <CheckCircle2 size={18}/></>)}
                </button>
              </div>
          </div>

          {/* DROITE : DATA PREVIEW AVEC STATS */}
          <div className="flex-1 overflow-hidden h-full rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 bg-white relative">
            <DataPreview data={info.preview} info={info} selectedCol={selectedColumn} onSelectCol={setSelectedColumn} />
          </div>

      </div>
    </div>
  );
};

export default DataLab;