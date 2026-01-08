import React from 'react';
import { ChevronDown } from 'lucide-react';

// --- 1. KPI CARD (N'oubliez pas le 'export') ---
export const KpiCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-lg ${color}`}>
      {Icon && <Icon size={24} />}
    </div>
    <div>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{title}</p>
    </div>
  </div>
);

// --- 2. ACTION BUTTON (C'est ici que l'erreur se produisait) ---
export const ActionButton = ({ icon: Icon, title, desc, onClick, variant = "default" }) => {
  const isDestructive = variant === "destructive";
  
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center p-3 mb-3 bg-white border border-transparent rounded-xl transition-all group text-left
        ${isDestructive 
          ? 'hover:bg-red-50 hover:border-red-100' 
          : 'hover:bg-orange-50 hover:border-orange-100'
        }
      `}
    >
      <div className={`p-2.5 rounded-lg mr-3 transition-colors 
        ${isDestructive ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-600'}
      `}>
        {Icon && <Icon size={18} />}
      </div>
      <div>
        <h4 className={`text-sm font-bold ${isDestructive ? 'text-gray-800' : 'text-gray-700'}`}>{title}</h4>
        <p className="text-[10px] text-gray-400 font-medium">{desc}</p>
      </div>
    </button>
  );
};

// --- 3. DATA TABLE (N'oubliez pas le 'export') ---
export const DataTable = ({ data, columns, selectedCol, onSelectCol }) => {
  if (!data || data.length === 0) return <div className="p-10 text-center text-gray-400 italic">No data available</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      {/* Header du tableau avec Selecteur */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
        <h3 className="font-bold text-gray-800 text-sm">Data Preview</h3>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">Inspect column:</span>
          <div className="relative">
            <select 
              value={selectedCol}
              onChange={(e) => onSelectCol(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">-- Select --</option>
              {columns && columns.map(c => (
                <option key={c.name} value={c.name}>{c.name} ({c.type})</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1.5 text-gray-400 pointer-events-none"/>
          </div>
          <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-md">
            {data.length} rows preview
          </span>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th 
                  key={key} 
                  className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors
                    ${key === selectedCol ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-400' : 'text-gray-500 hover:bg-gray-100'}
                  `}
                  onClick={() => onSelectCol(key)}
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100 text-sm">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                {Object.values(row).map((val, i) => (
                  <td key={i} className="px-4 py-2.5 whitespace-nowrap text-gray-600 font-medium text-xs">
                    {val === null ? <span className="text-red-300 italic">null</span> : val.toString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};