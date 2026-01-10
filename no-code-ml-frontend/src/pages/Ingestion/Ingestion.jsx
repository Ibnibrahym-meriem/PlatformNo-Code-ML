import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, Globe, Database, Zap, Wand2, PenTool, 
  CheckCircle2, ArrowRight, FileJson, Layers, LayoutGrid, Info 
} from 'lucide-react';

// Import des composants
import UploadTab from './components/UploadTab';
import KaggleTab from './components/KaggleTab';
import QuickStartTab from './components/QuickStartTab';
import ScrapeTab from './components/ScrapeTab';
import GenerateTab from './components/GenerateTab';
import ManualTab from './components/ManualTab';

// --- DEFINITION DES INFOS AU SURVOL ---
const HOVER_INFO = {
  upload: {
    title: "File Upload",
    desc: "Import local files directly from your computer.",
    tags: "CSV, Excel, JSON, Parquet"
  },
  scrape: {
    title: "Web Scraping",
    desc: "Extract tabular data from any public website URL.",
    tags: "Wikipedia, HTML Tables"
  },
  kaggle: {
    title: "Kaggle Integration",
    desc: "Search and download datasets directly from Kaggle API.",
    tags: "Public Datasets, API"
  },
  quick: {
    title: "Quick Start",
    desc: "Use pre-cleaned standard datasets for practice.",
    tags: "Titanic, Iris, Housing..."
  },
  generate: {
    title: "Synthetic Data",
    desc: "Create random data based on statistical rules.",
    tags: "Classification, Regression"
  },
  manual: {
    title: "Manual Entry",
    desc: "Type or paste your data directly into a grid editor.",
    tags: "Small Datasets"
  }
};

const Ingestion = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [hoveredTab, setHoveredTab] = useState(null); 
  const [successData, setSuccessData] = useState(null); 
  const navigate = useNavigate();

  // --- LOGIQUE METIER ---
  const handleSuccess = (data) => {
    localStorage.setItem('current_session_id', data.session_id);
    localStorage.setItem('current_filename', data.filename);
    setSuccessData(data);
  };

  const handleReset = () => {
    setSuccessData(null);
    setActiveTab('upload');
  };

  const goToExploration = () => {
    navigate('/visualization');
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
    { id: 'upload', label: 'Upload', icon: UploadCloud },
    { id: 'scrape', label: 'Scrape', icon: Globe },
    { id: 'kaggle', label: 'Kaggle', icon: Database },
    { id: 'quick', label: 'Quick Start', icon: Zap },
    { id: 'generate', label: 'Generate', icon: Wand2 },
    { id: 'manual', label: 'Manual', icon: PenTool },
  ];

  const { rows, cols } = getCounts(successData);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-10 px-4 font-sans text-gray-800">
      
      {/* --- EN-TÊTE --- */}
      <div className="text-center mb-10 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          Get Started with Your Data
        </h1>
        <p className="text-lg text-gray-500">
          {successData 
            ? "Great! Your data is ready. What would you like to do next?" 
            : "Choose the best way to import or generate your dataset to begin analysis."}
        </p>
      </div>

      <div className="w-full max-w-5xl">
        
        {/* --- ÉCRAN DE SUCCÈS --- */}
        {successData ? (
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200 border border-gray-100 p-10 md:p-16 text-center animate-in zoom-in-95 duration-300">
            {/* ... (Code succès identique à avant) ... */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-50 text-green-500 rounded-full mb-8 ring-8 ring-green-50/50">
              <CheckCircle2 size={48} strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Import Successful!</h2>
            <div className="flex justify-center items-center gap-2 mb-10">
                <FileJson size={18} className="text-gray-400"/>
                <span className="font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded-lg text-sm border border-gray-200 max-w-md truncate">
                   {successData.filename}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto mb-12">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center transition-transform hover:scale-105">
                 <LayoutGrid size={28} className="text-orange-500 mb-3" />
                 <p className="text-3xl font-black text-gray-800">{rows}</p>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Rows</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center transition-transform hover:scale-105">
                 <Layers size={28} className="text-gray-700 mb-3" />
                 <p className="text-3xl font-black text-gray-800">{cols}</p>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Columns</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleReset} className="px-8 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all">Import Another Dataset</button>
              <button onClick={goToExploration} className="px-10 py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2 hover:gap-3 group">Go to Visualization <ArrowRight size={18} className="transition-transform group-hover:translate-x-1"/></button>
            </div>
          </div>
        ) : (
          
          /* --- ÉCRAN DE SÉLECTION --- */
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-visible flex flex-col min-h-[600px]">
            
            {/* Barre de Navigation */}
            <div className="border-b border-gray-100 p-2 bg-gray-50/50 rounded-t-3xl z-20 relative">
              <div className="flex justify-center">
                <div className="flex gap-1 p-1 bg-gray-100/80 rounded-xl overflow-visible max-w-full">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const isHovered = hoveredTab === tab.id;
                    const Icon = tab.icon;
                    const info = HOVER_INFO[tab.id];

                    return (
                      <div key={tab.id} className="relative group">
                        
                        {/* BOUTON */}
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          onMouseEnter={() => setHoveredTab(tab.id)}
                          onMouseLeave={() => setHoveredTab(null)}
                          className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap relative z-10
                            ${isActive 
                              ? 'bg-white text-gray-900 shadow-md shadow-gray-200 ring-1 ring-black/5 transform scale-100' 
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                          `}
                        >
                          <Icon size={16} className={isActive ? 'text-orange-500' : 'text-gray-400'} strokeWidth={2.5} />
                          {tab.label}
                        </button>

                        {/* --- TOOLTIP RICHE (Position BAS - Thème Clair) --- */}
                        {isHovered && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 z-[100] pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Flèche vers le haut */}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 transform rotate-45"></div>
                            
                            <div className="bg-white text-gray-800 p-4 rounded-xl shadow-xl shadow-orange-500/10 border border-gray-100">
                              
                              {/* Titre */}
                              <h4 className="font-bold text-sm mb-1.5 flex items-center gap-2 text-gray-900">
                                <Icon size={16} className="text-orange-500" />
                                {info.title}
                              </h4>
                              
                              {/* Description */}
                              <p className="text-xs text-gray-500 font-medium leading-relaxed border-b border-gray-100 pb-2 mb-2">
                                {info.desc}
                              </p>
                              
                              {/* Tags / Info Sup */}
                              <div className="text-[10px] uppercase font-bold text-orange-600 tracking-wide flex items-center gap-1 bg-orange-50 px-2 py-1 rounded w-fit">
                                <Info size={10} /> {info.tags}
                              </div>

                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Contenu Dynamique */}
            <div className="flex-1 p-8 bg-white relative z-10">
                <div className="h-full w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeTab === 'upload' && <UploadTab onSuccess={handleSuccess} />}
                    {activeTab === 'scrape' && <ScrapeTab onSuccess={handleSuccess} />}
                    {activeTab === 'kaggle' && <KaggleTab onSuccess={handleSuccess} />}
                    {activeTab === 'quick' && <QuickStartTab onSuccess={handleSuccess} />}
                    {activeTab === 'generate' && <GenerateTab onSuccess={handleSuccess} />}
                    {activeTab === 'manual' && <ManualTab onSuccess={handleSuccess} />}
                </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Ingestion;