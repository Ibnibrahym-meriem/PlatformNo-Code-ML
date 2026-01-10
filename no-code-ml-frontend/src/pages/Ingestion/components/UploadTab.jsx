import React, { useState } from 'react';
import dataService from '../../../services/data.service';
import { UploadCloud, FileSpreadsheet, FileJson, Loader2 } from 'lucide-react';

const UploadTab = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Gestion du fichier sélectionné
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await processUpload(file);
  };

  // Logique d'envoi au backend (Inchangée)
  const processUpload = async (file) => {
    setLoading(true);
    try {
      const res = await dataService.uploadFile(file);
      onSuccess(res.data);
    } catch (error) {
      alert("Erreur Upload: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-center max-w-2xl mx-auto py-6">
      
      <div 
        className={`
          relative flex flex-col items-center justify-center h-[450px]
          border-2 border-dashed rounded-3xl transition-all duration-300 ease-out group
          ${dragActive 
            ? 'border-orange-500 bg-orange-50/40 scale-[1.01]' 
            : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-gray-50/50 hover:shadow-sm'
          }
        `}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDrop={() => setDragActive(false)}
      >
        {/* Input invisible - Parquet retiré de accept */}
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
          onChange={handleFileChange}
          accept=".csv, .xlsx, .xls, .json"
          disabled={loading}
        />

        {/* --- ETAT DE CHARGEMENT --- */}
        {loading ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-orange-100 mb-6">
                    <Loader2 className="w-10 h-10 text-orange-600 animate-spin" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Uploading data...</h3>
                <p className="text-gray-500 mt-2 text-sm">Please wait while we process your file.</p>
            </div>
        ) : (
            /* --- ETAT NORMAL --- */
            <div className="flex flex-col items-center text-center pointer-events-none px-6">
                
                {/* Icone Principale avec dégradé thème */}
                <div className={`
                    w-24 h-24 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-orange-500/10 transition-transform duration-500 group-hover:scale-110
                    bg-gradient-to-br from-orange-400 to-orange-600
                `}>
                    <UploadCloud className="w-12 h-12 text-white" strokeWidth={1.5} />
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Click to upload or drag and drop
                </h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                    Import your dataset to start the analysis. Supported formats:
                </p>

                {/* Badges Formats - Parquet retiré */}
                <div className="flex items-center gap-3 justify-center mb-8">
                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                        <FileSpreadsheet size={14} className="text-green-600"/> 
                        <span className="text-xs font-bold text-gray-600">CSV / Excel</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                        <FileJson size={14} className="text-yellow-600"/> 
                        <span className="text-xs font-bold text-gray-600">JSON</span>
                    </div>
                </div>

                {/* Bouton Faux (Visuel seulement) */}
                <button className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm group-hover:border-orange-300 group-hover:text-orange-600 transition-colors">
                    Browse Computer
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default UploadTab;