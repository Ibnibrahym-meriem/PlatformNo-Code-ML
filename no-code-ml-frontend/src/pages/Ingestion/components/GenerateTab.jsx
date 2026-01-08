import React, { useState } from 'react';
import dataService from '../../../services/data.service';

const GenerateTab = ({ onSuccess }) => {
  const [rows, setRows] = useState(100);
  const [cols, setCols] = useState(5);
  const [task, setTask] = useState('classification');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await dataService.generateSimple(rows, cols, task);
      onSuccess(res.data);
    } catch (err) {
      alert("Erreur génération: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="mb-6">
        <h3 className="font-bold text-gray-800">Generate Synthetic Data</h3>
        <p className="text-sm text-gray-500">Create random datasets for testing purposes</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-left space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Rows (Samples)</label>
            <input 
              type="number" 
              value={rows} 
              onChange={(e)=>setRows(Number(e.target.value))} 
              className="w-full border border-gray-300 p-2 rounded-lg focus:border-brand-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Columns (Features)</label>
            <input 
              type="number" 
              value={cols} 
              onChange={(e)=>setCols(Number(e.target.value))} 
              className="w-full border border-gray-300 p-2 rounded-lg focus:border-brand-500 outline-none" 
            />
          </div>
        </div>
        
        <div>
           <label className="block text-xs font-bold text-gray-700 mb-1">Task Type</label>
           <select 
             value={task} 
             onChange={(e)=>setTask(e.target.value)} 
             className="w-full border border-gray-300 p-2 rounded-lg focus:border-brand-500 outline-none bg-white"
           >
              <option value="classification">Classification (Categories)</option>
              <option value="regression">Regression (Continuous values)</option>
           </select>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading} 
          className="w-full bg-brand-500 text-white py-2.5 rounded-lg font-bold hover:bg-brand-600 transition disabled:opacity-50 mt-4"
        >
          {loading ? 'Generating...' : 'Generate Dataset'}
        </button>
      </div>
    </div>
  );
};

export default GenerateTab;