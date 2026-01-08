import React from 'react';
import { Activity, MousePointer2, TrendingUp, BarChart3, Hash, AlertCircle } from 'lucide-react';

// --- 1. KPI CARD (Version XXL & VIP) ---
export const KpiCard = ({ title, value, icon: Icon, onClick, isActive }) => (
  <div 
    onClick={onClick}
    className={`relative px-8 py-6 rounded-[2rem] bg-white border transition-all duration-300 cursor-pointer flex flex-col justify-between h-[160px] group overflow-hidden
      ${isActive 
        ? 'border-orange-500 shadow-2xl shadow-orange-500/10 transform -translate-y-2' 
        : 'border-slate-100 shadow-sm hover:border-orange-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-2'
      }
    `}
  >
    {/* Décoration d'arrière plan */}
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-slate-50 rounded-bl-[100%] transition-opacity opacity-50 group-hover:to-orange-50/50`} />

    <div className="flex justify-between items-start relative z-10">
        <div className={`p-4 rounded-2xl transition-all duration-300
          ${isActive ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600'}
        `}>
          {Icon ? <Icon size={28} strokeWidth={1.5} /> : <Activity size={28} />}
        </div>
        
        {/* Indicateur actif discret */}
        {isActive && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
    </div>

    <div className="relative z-10">
      <h3 className={`text-4xl font-extrabold tracking-tight leading-none mb-2 ${isActive ? 'text-slate-900' : 'text-slate-800'}`}>
        {value}
      </h3>
      <p className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-orange-500'}`}>
        {title}
      </p>
    </div>
  </div>
);

// --- 2. ACTION ITEM (Style Gris/Orange Strict) ---
export const ActionItem = ({ icon: Icon, title, desc, onClick, variant = "default" }) => {
  const isDestructive = variant === "destructive";
  
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center p-4 mb-3 rounded-2xl border transition-all duration-300 group text-left active:scale-[0.98] bg-white shadow-sm
        ${isDestructive 
            ? 'border-slate-100 hover:border-slate-300 hover:bg-slate-50' // Style Destructif (Gris)
            : 'border-slate-100 hover:border-orange-200 hover:bg-orange-50/30' // Style Normal (Orange)
        }
      `}
    >
      <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl mr-4 transition-colors duration-300
         ${isDestructive 
            ? 'bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white' 
            : 'bg-slate-50 text-slate-400 group-hover:bg-orange-500 group-hover:text-white shadow-sm'}
      `}>
        {Icon ? <Icon size={20} strokeWidth={2} /> : <MousePointer2 size={20} />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-extrabold truncate ${isDestructive ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-700 group-hover:text-orange-900'}`}>{title}</h4>
        <p className="text-[11px] font-medium text-slate-400 truncate mt-1 group-hover:text-slate-500">{desc}</p>
      </div>
    </button>
  );
};

// --- 3. DATA PREVIEW (Tableau Élégant avec Bordures) ---
export const DataPreview = ({ data, info, selectedCol, onSelectCol }) => {
  if (!data || data.length === 0) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <BarChart3 size={32} className="text-slate-300" />
      </div>
      <p className="text-sm font-medium">Aucune donnée disponible</p>
    </div>
  );

  const colStats = info.columns_summary.find(c => c.name === selectedCol);
  
  // Helpers stats
  const getStatValue = (key) => {
      if (!info.statistics || !info.statistics[selectedCol]) return null;
      const val = info.statistics[selectedCol][key];
      if (val === undefined || val === null) return null;
      return typeof val === 'number' ? Number(val.toFixed(2)) : val;
  };

  const stats = {
      min: getStatValue('min'),
      max: getStatValue('max'),
      mean: getStatValue('mean'),
      median: getStatValue('50%') || getStatValue('median'),
      std: getStatValue('std')
  };

  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* HEADER AVEC STATS (Style Épuré) */}
      {selectedCol && colStats ? (
        <div className="bg-white px-8 py-6 flex-shrink-0 z-20 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-4">
                <h3 className="font-black text-slate-900 text-3xl tracking-tight">{selectedCol}</h3>
                <span className="text-[10px] bg-slate-900 text-white px-3 py-1 rounded-full uppercase font-bold tracking-widest shadow-lg shadow-slate-200">
                    {colStats.type}
                </span>
             </div>
             <div className="flex gap-3">
                {/* Badges Gris/Orange au lieu de Rouge/Bleu */}
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-200">
                    <AlertCircle size={14}/> {colStats.missing} Vides
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-xs font-bold border border-orange-100">
                    <Hash size={14}/> {colStats.unique} Uniques
                </div>
             </div>
          </div>
          
          {/* STATS CAPSULES (Gris/Orange uniquement) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             {stats.min !== null && <StatCapsule label="Min" value={stats.min} />}
             {stats.max !== null && <StatCapsule label="Max" value={stats.max} />}
             {stats.mean !== null && <StatCapsule label="Moyenne" value={stats.mean} isPrimary />}
             {stats.median !== null && <StatCapsule label="Médiane" value={stats.median} />}
             {stats.std !== null && <StatCapsule label="Ecart Type" value={stats.std} />}
          </div>
        </div>
      ) : (
        <div className="px-8 py-8 border-b border-slate-100 bg-white flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3 text-slate-400">
                <MousePointer2 size={20} className="animate-bounce text-orange-400" />
                <span className="text-base font-medium">Sélectionnez une colonne pour analyser...</span>
            </div>
        </div>
      )}

      {/* TABLEAU */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50/30 p-6">
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
            <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                {Object.keys(data[0]).map((key) => (
                    <th 
                    key={key} 
                    onClick={() => onSelectCol(key)}
                    className={`px-6 py-5 text-left text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-all border-b border-slate-200
                        ${key === selectedCol 
                            ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-500' 
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}
                    `}
                    >
                    <div className="flex items-center gap-2">
                        {key}
                        {key === selectedCol && <TrendingUp size={14} />}
                    </div>
                    </th>
                ))}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-sm">
                {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-orange-50/30 transition-colors group">
                    {Object.values(row).map((val, i) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium group-hover:text-slate-900 border-r border-slate-50 last:border-r-0">
                        {val === null ? <span className="text-slate-300 italic">null</span> : val.toString()}
                    </td>
                    ))}
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

// Petit composant helper pour les stats
const StatCapsule = ({ label, value, isPrimary }) => (
    <div className={`rounded-2xl p-3 border transition-all hover:-translate-y-1 hover:shadow-md cursor-default
        ${isPrimary 
            ? 'bg-orange-50 border-orange-100 text-orange-800' 
            : 'bg-white border-slate-100 text-slate-700'}
    `}>
        <span className={`text-[9px] font-black uppercase block mb-1 ${isPrimary ? 'text-orange-400' : 'text-slate-400'}`}>
            {label}
        </span>
        <span className="text-lg font-bold block truncate">{value}</span>
    </div>
);