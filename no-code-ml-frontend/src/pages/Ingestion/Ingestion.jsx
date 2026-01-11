import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, Globe, Database, Zap, Wand2, PenTool, 
  CheckCircle2, ArrowRight, FileJson, Layers, LayoutGrid, Info 
} from 'lucide-react';

// Import des composants (Assurez-vous que les chemins sont corrects)
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
      {!successData && (
        <div className="text-center mb-10 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            Get Started with Your Data
          </h1>
          <p className="text-lg text-gray-500">
            Choose the best way to import or generate your dataset to begin analysis.
          </p>
        </div>
      )}

      <div className="w-full max-w-5xl">
        
        {/* --- ÉCRAN DE SUCCÈS (NOUVEAU DESIGN) --- */}
        {successData ? (
          <div className="flex justify-center items-center min-h-[500px]">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-orange-100 p-8 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
              
              {/* Fond décoratif subtil */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-300 to-orange-500"></div>

              {/* Icône */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 text-orange-500 rounded-full mb-6 ring-4 ring-orange-50/50 shadow-sm">
                <CheckCircle2 size={32} strokeWidth={2.5} />
              </div>

              {/* Titre et Fichier */}
              <h2 className="text-2xl font-semibold text-slate-700 mb-2">Import Successful</h2>
              
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-sm font-medium border border-slate-100 max-w-[250px]">
                   <FileJson size={14} className="text-orange-400"/>
                   <span className="truncate">{successData.filename}</span>
                </div>
              </div>

              {/* Stats - Style épuré */}
              <div className="flex justify-center gap-12 mb-10 border-t border-b border-slate-50 py-6">
                <div className="text-center group">
                   <div className="flex items-center justify-center gap-2 mb-1">
                      <LayoutGrid size={16} className="text-slate-400 group-hover:text-orange-400 transition-colors" />
                      <span className="text-2xl font-medium text-slate-700">{rows}</span>
                   </div>
                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Rows</p>
                </div>
                <div className="w-px bg-slate-100"></div>
                <div className="text-center group">
                   <div className="flex items-center justify-center gap-2 mb-1">
                      <Layers size={16} className="text-slate-400 group-hover:text-orange-400 transition-colors" />
                      <span className="text-2xl font-medium text-slate-700">{cols}</span>
                   </div>
                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Columns</p>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex flex-col gap-3">
                <button 
                  onClick={goToExploration} 
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                >
                  Start Visualization 
                  <ArrowRight size={18} className="text-white/80 group-hover:translate-x-1 transition-transform"/>
                </button>
                
                <button 
                  onClick={handleReset} 
                  className="w-full py-3 text-slate-400 font-medium text-sm hover:text-slate-600 transition-colors"
                >
                  Import a different dataset
                </button>
              </div>

            </div>
          </div>
        ) : (
          
          /* --- ÉCRAN DE SÉLECTION (Inchangé) --- */
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

                        {/* --- TOOLTIP RICHE --- */}
                        {isHovered && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 z-[100] pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 transform rotate-45"></div>
                            
                            <div className="bg-white text-gray-800 p-4 rounded-xl shadow-xl shadow-orange-500/10 border border-gray-100">
                              <h4 className="font-bold text-sm mb-1.5 flex items-center gap-2 text-gray-900">
                                <Icon size={16} className="text-orange-500" />
                                {info.title}
                              </h4>
                              <p className="text-xs text-gray-500 font-medium leading-relaxed border-b border-gray-100 pb-2 mb-2">
                                {info.desc}
                              </p>
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