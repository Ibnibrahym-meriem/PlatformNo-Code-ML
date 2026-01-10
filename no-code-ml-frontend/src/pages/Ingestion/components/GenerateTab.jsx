import React, { useState } from 'react';
import { 
  Zap, Sliders, Plus, Trash2, Database, AlertCircle 
} from 'lucide-react';
import dataService from '../../../services/data.service';

const GenerateTab = ({ onSuccess }) => {
  // --- STATE GLOBAL ---
  const [mode, setMode] = useState('simple'); // 'simple' | 'custom'
  const [loading, setLoading] = useState(false);

  // --- STATE SIMPLE GENERATION ---
  const [simpleRows, setSimpleRows] = useState(100);
  const [simpleCols, setSimpleCols] = useState(5);
  const [simpleTask, setSimpleTask] = useState('classification');

  // --- STATE CUSTOM GENERATION ---
  const [customRows, setCustomRows] = useState(100);
  const [columns, setColumns] = useState([
    {
      id: 1,
      name: "age",
      type: "int",
      rules: [{ min_val: 18, max_val: 80, percentage: 100 }]
    },
    {
      id: 2,
      name: "salary",
      type: "float",
      rules: [{ min_val: 30000, max_val: 120000, percentage: 100 }]
    }
  ]);

  // --- HANDLERS SIMPLE ---
  const handleGenerateSimple = async () => {
    setLoading(true);
    try {
      const payload = {
        n_rows: Number(simpleRows),
        n_cols: Number(simpleCols),
        task: simpleTask
      };
      const res = await dataService.generateSimple(payload);
      onSuccess(res.data || res);
    } catch (err) {
      alert("Erreur génération simple: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS CUSTOM ---
  const addColumn = () => {
    setColumns([
      ...columns,
      {
        id: Date.now(),
        name: `col_${columns.length + 1}`,
        type: "float",
        rules: [{ min_val: 0, max_val: 100, percentage: 100 }]
      }
    ]);
  };

  const removeColumn = (index) => {
    const newCols = columns.filter((_, i) => i !== index);
    setColumns(newCols);
  };

  const updateColumn = (index, field, value) => {
    const newCols = [...columns];
    newCols[index][field] = value;
    setColumns(newCols);
  };

  const updateRule = (colIndex, ruleIndex, field, value) => {
    const newCols = [...columns];
    newCols[colIndex].rules[ruleIndex][field] = Number(value);
    setColumns(newCols);
  };

  const addRule = (colIndex) => {
    const newCols = [...columns];
    newCols[colIndex].rules.push({ min_val: 0, max_val: 100, percentage: 0 });
    setColumns(newCols);
  };

  const removeRule = (colIndex, ruleIndex) => {
    const newCols = [...columns];
    newCols[colIndex].rules = newCols[colIndex].rules.filter((_, rI) => rI !== ruleIndex);
    setColumns(newCols);
  };

  const handleGenerateCustom = async () => {
    setLoading(true);
    try {
        const payload = {
            n_rows: Number(customRows),
            columns: columns.map(col => ({
                name: col.name,
                type: col.type,
                rules: col.rules.map(r => ({
                    min_val: Number(r.min_val),
                    max_val: Number(r.max_val),
                    percentage: Number(r.percentage)
                }))
            }))
        };
        const res = await dataService.generateCustom(payload);
        onSuccess(res.data || res);
    } catch (err) {
        console.error(err);
        alert("Erreur génération custom: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 text-center">
        <h3 className="font-bold text-gray-800 text-lg">Synthetic Data Generator</h3>
        <p className="text-sm text-gray-500">Create datasets for testing models</p>
      </div>

      {/* --- SWITCH MODE --- */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-xl inline-flex">
          <button
            onClick={() => setMode('simple')}
            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
              mode === 'simple' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Zap size={16} /> Quick (Maths)
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
              mode === 'custom' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sliders size={16} /> Custom Rules
          </button>
        </div>
      </div>

      {/* --- MODE SIMPLE --- */}
      {mode === 'simple' && (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Number of Rows</label>
              <input 
                type="number" 
                value={simpleRows} 
                onChange={(e) => setSimpleRows(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:border-orange-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Number of Features</label>
              <input 
                type="number" 
                value={simpleCols} 
                onChange={(e) => setSimpleCols(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:border-orange-500 outline-none transition"
              />
            </div>
          </div>
          
          <div className="mb-8">
             <label className="block text-xs font-bold text-gray-700 mb-2">Task Type</label>
             <select 
               value={simpleTask} 
               onChange={(e) => setSimpleTask(e.target.value)} 
               className="w-full border border-gray-300 p-3 rounded-lg focus:border-orange-500 outline-none bg-white transition"
             >
                <option value="classification">Classification (Categories target)</option>
                <option value="regression">Regression (Continuous target)</option>
             </select>
             <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
               <AlertCircle size={12}/> Uses Scikit-learn make_classification/regression
             </p>
          </div>

          <button 
            onClick={handleGenerateSimple} 
            disabled={loading} 
            className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-pulse">Generating...</span> : <><Zap size={18}/> Generate Quick Dataset</>}
          </button>
        </div>
      )}

      {/* --- MODE CUSTOM --- */}
      {mode === 'custom' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 space-y-6">
            
            {/* Global Settings */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-xs font-bold text-gray-700 mb-2">Total Rows to Generate</label>
                <input 
                    type="number" 
                    value={customRows} 
                    onChange={(e) => setCustomRows(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg bg-white outline-none focus:border-orange-500"
                />
            </div>

            {/* Columns List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {columns.map((col, colIndex) => (
                    <div key={col.id} className="border border-gray-200 rounded-xl p-4 relative hover:border-orange-300 transition group">
                        <div className="flex justify-between items-start mb-3 gap-3">
                            <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-gray-400">Column Name</label>
                                <input 
                                    type="text" 
                                    value={col.name} 
                                    onChange={(e) => updateColumn(colIndex, 'name', e.target.value)}
                                    className="w-full font-bold text-gray-800 border-b border-gray-300 focus:border-orange-500 outline-none py-1 bg-transparent"
                                    placeholder="ex: age"
                                />
                            </div>
                            <div className="w-32">
                                <label className="text-[10px] uppercase font-bold text-gray-400">Type</label>
                                <select 
                                    value={col.type} 
                                    onChange={(e) => updateColumn(colIndex, 'type', e.target.value)}
                                    className="w-full text-sm border-b border-gray-300 focus:border-orange-500 outline-none py-1 bg-transparent cursor-pointer"
                                >
                                    <option value="int">Integer</option>
                                    <option value="float">Float</option>
                                </select>
                            </div>
                            {/* BOUTON SUPPRIMER COLONNE : Gris au repos, Orange au survol */}
                            <button onClick={() => removeColumn(colIndex)} className="text-gray-300 hover:text-orange-500 p-1 mt-3 transition-colors">
                                <Trash2 size={16}/>
                            </button>
                        </div>

                        {/* Rules Section */}
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><Database size={12}/> Data Distribution Rules</span>
                                <button onClick={() => addRule(colIndex)} className="text-xs text-orange-600 hover:text-orange-800 font-bold flex items-center gap-1 transition-colors">
                                    <Plus size={12}/> Add Rule
                                </button>
                            </div>
                            
                            {col.rules.map((rule, ruleIndex) => (
                                <div key={ruleIndex} className="flex gap-2 items-center mb-2">
                                    <div className="flex-1">
                                        <input 
                                            type="number" 
                                            placeholder="Min" 
                                            value={rule.min_val} 
                                            onChange={(e) => updateRule(colIndex, ruleIndex, 'min_val', e.target.value)}
                                            className="w-full text-xs p-1.5 border border-gray-200 rounded focus:border-orange-500 outline-none"
                                        />
                                    </div>
                                    <span className="text-gray-400">-</span>
                                    <div className="flex-1">
                                        <input 
                                            type="number" 
                                            placeholder="Max" 
                                            value={rule.max_val} 
                                            onChange={(e) => updateRule(colIndex, ruleIndex, 'max_val', e.target.value)}
                                            className="w-full text-xs p-1.5 border border-gray-200 rounded focus:border-orange-500 outline-none"
                                        />
                                    </div>
                                    <div className="w-20 relative">
                                        <input 
                                            type="number" 
                                            placeholder="%" 
                                            value={rule.percentage} 
                                            onChange={(e) => updateRule(colIndex, ruleIndex, 'percentage', e.target.value)}
                                            className="w-full text-xs p-1.5 border border-gray-200 rounded pr-4 focus:border-orange-500 outline-none"
                                        />
                                        <span className="absolute right-1 top-1.5 text-xs text-gray-400">%</span>
                                    </div>
                                    {col.rules.length > 1 && (
                                        // BOUTON SUPPRIMER REGLE : Gris -> Orange
                                        <button onClick={() => removeRule(colIndex, ruleIndex)} className="text-gray-400 hover:text-orange-500 transition-colors">
                                            <Trash2 size={12}/>
                                        </button>
                                    )}
                                </div>
                            ))}
                            {col.rules.reduce((a, b) => a + (Number(b.percentage) || 0), 0) !== 100 && (
                                <p className="text-[10px] text-orange-500 mt-1 flex items-center gap-1 font-medium">
                                    <AlertCircle size={10} /> 
                                    Total percentage is {col.rules.reduce((a, b) => a + (Number(b.percentage) || 0), 0)}%. 
                                    (Remainder = None)
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={addColumn}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-400 hover:text-orange-600 font-bold transition flex items-center justify-center gap-2"
            >
                <Plus size={16}/> Add New Column
            </button>

            <div className="pt-4 border-t border-gray-100">
                <button 
                    onClick={handleGenerateCustom} 
                    disabled={loading} 
                    className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                    {loading ? <span className="animate-pulse">Generating...</span> : <><Sliders size={18}/> Generate Custom Dataset</>}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default GenerateTab;