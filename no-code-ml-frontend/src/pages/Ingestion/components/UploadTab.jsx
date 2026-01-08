import React, { useState } from 'react';
import dataService from '../../../services/data.service';

const UploadTab = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Gestion du fichier sélectionné
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await processUpload(file);
  };

  // Logique d'envoi au backend
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
    <div className="max-w-2xl mx-auto h-full flex flex-col justify-center">
      <div 
        className={`
          relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
          flex flex-col items-center justify-center gap-6 group
          ${dragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'}
        `}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDrop={() => setDragActive(false)}
      >
        {/* Input invisible qui couvre toute la zone */}
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileChange}
          accept=".csv, .xlsx, .xls, .parquet, .json"
          disabled={loading}
        />

        {/* Visuel */}
        <div className={`
          w-20 h-20 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110
          ${loading ? 'bg-gray-100 animate-pulse' : 'bg-orange-100 text-brand-600'}
        `}>
          {loading ? (
             // Spinner simple
             <svg className="w-8 h-8 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
             // Icone Document
             <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
             </svg>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-800">
            {loading ? 'Uploading your data...' : 'Drop files here or click to browse'}
          </h3>
          <p className="text-gray-500 mt-2 text-sm">
            Supports CSV, Excel (.xlsx), JSON, Parquet
          </p>
        </div>

        {!loading && (
          <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold shadow-sm group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:border-brand-200 transition">
            Select File
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadTab;