import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Import des composants
import UploadTab from './components/UploadTab';
import KaggleTab from './components/KaggleTab';
import QuickStartTab from './components/QuickStartTab';
import ScrapeTab from './components/ScrapeTab';
import GenerateTab from './components/GenerateTab';
import ManualTab from './components/ManualTab';

const Ingestion = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [successData, setSuccessData] = useState(null); 
  const navigate = useNavigate();

  // Callback quand une donnée est chargée
  const handleSuccess = (data) => {
    localStorage.setItem('current_session_id', data.session_id);
    localStorage.setItem('current_filename', data.filename);
    setSuccessData(data);
  };

  const handleReset = () => {
    setSuccessData(null);
  };

  // --- MODIFICATION ICI : Redirection vers Visualization ---
  const goToExploration = () => {
    navigate('/visualization'); // On va vers l'exploration d'abord
  };

  const getCounts = (data) => {
    if (!data) return { rows: 0, cols: 0 };
    let colCount = 0;
    if (data.cols !== undefined) colCount = data.cols;
    else if (data.n_cols !== undefined) colCount = data.n_cols;
    else if (data.columns && Array.isArray(data.columns)) colCount = data.columns.length;
    let rowCount = data.rows !== undefined ? data.rows : (data.n_rows || 0);
    return { rows: rowCount, cols: colCount };
  };

  const tabs = [
    { id: 'upload', label: 'Upload', icon: '📂' },
    { id: 'scrape', label: 'Scrape', icon: '🌐' },
    { id: 'kaggle', label: 'Kaggle', icon: 'K' },
    { id: 'quick', label: 'Quick', icon: '⚡' },
    { id: 'generate', label: 'Generate', icon: '🎲' },
    { id: 'manual', label: 'Manual', icon: '✍️' },
  ];

  const { rows, cols } = getCounts(successData);

  return (
    <div className="flex flex-col h-full p-8 bg-[#F9FAFB]">
      
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Get Started with Your Data
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          {successData 
            ? "Dataset uploaded successfully! Let's explore your data." 
            : "Choose how you'd like to import or create your dataset."}
        </p>
      </div>

      <div className="flex-1 flex justify-center items-start">
        <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 shadow-sm min-h-[500px] transition-all duration-300 relative overflow-hidden">
          
          {successData ? (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up">
              
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">Import Successful!</h2>
              
              <p className="text-gray-500 mb-8 max-w-lg mx-auto overflow-hidden text-ellipsis whitespace-nowrap">
                Your dataset <span className="font-mono text-gray-700 font-bold bg-gray-100 px-2 py-1 rounded" title={successData.filename}>
                   {successData.filename.length > 45 ? "..." + successData.filename.slice(-40) : successData.filename}
                </span> is ready.
              </p>

              <div className="flex gap-8 mb-10">
                <div className="text-center px-6 py-4 bg-gray-50 rounded-xl border border-gray-100 min-w-[130px]">
                   <p className="text-3xl font-bold text-brand-600">{rows}</p>
                   <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mt-1">Rows</p>
                </div>
                <div className="text-center px-6 py-4 bg-gray-50 rounded-xl border border-gray-100 min-w-[130px]">
                   <p className="text-3xl font-bold text-brand-600">{cols}</p>
                   <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mt-1">Columns</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleReset}
                  className="px-6 py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition"
                >
                  Import Another
                </button>
                {/* --- MODIFICATION ICI : Bouton vers Exploration --- */}
                <button 
                  onClick={goToExploration}
                  className="px-8 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 shadow-lg shadow-orange-200 transition transform hover:-translate-y-1"
                >
                  Go to Exploration →
                </button>
              </div>

            </div>
          ) : (
            <>
              <div className="flex justify-center mb-10">
                <div className="bg-gray-100 p-1.5 rounded-xl flex gap-1 overflow-x-auto">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
                          ${isActive 
                            ? 'bg-white text-gray-900 shadow-sm transform scale-100 ring-1 ring-black/5' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                        `}
                      >
                        <span className={isActive ? 'text-brand-500' : 'text-gray-400'}>{tab.icon}</span>
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="animate-fade-in">
                {activeTab === 'upload' && <UploadTab onSuccess={handleSuccess} />}
                {activeTab === 'scrape' && <ScrapeTab onSuccess={handleSuccess} />}
                {activeTab === 'kaggle' && <KaggleTab onSuccess={handleSuccess} />}
                {activeTab === 'quick' && <QuickStartTab onSuccess={handleSuccess} />}
                {activeTab === 'generate' && <GenerateTab onSuccess={handleSuccess} />}
                {activeTab === 'manual' && <ManualTab onSuccess={handleSuccess} />}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Ingestion;