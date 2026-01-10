import React, { useState } from 'react';
import dataService from '../../../services/data.service';
import { Search, Globe, Table, Check, ArrowRight } from 'lucide-react';

const ScrapeTab = ({ onSuccess }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null); 

  // 1. Scanner l'URL
  const handlePreview = async () => {
    if (!url) return;
    setLoading(true);
    setPreviewData(null);
    try {
      const res = await dataService.scrapePreview(url);
      setPreviewData(res.data);
    } catch (err) {
      alert("Erreur scraping: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 2. Importer la table choisie
  const handleImport = async (index) => {
    if (!previewData) return;
    setLoading(true);
    try {
      const res = await dataService.scrapeSelect(previewData.session_id, [index]);
      onSuccess(res.data);
    } catch (err) {
      alert("Erreur lors de l'import de la table.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div className="text-center mb-8">
        <h3 className="font-bold text-gray-800 text-lg">Web Scraping</h3>
        <p className="text-sm text-gray-500">Extract tables from any webpage (Wikipedia, etc.)</p>
      </div>

      {/* --- BARRE DE RECHERCHE (STYLE DEMANDÉ) --- */}
      <div className="flex gap-3 mb-8">
        <div className="flex-1 relative">
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://en.wikipedia.org/wiki/List_of_countries_by_GDP..." 
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gray-100 outline-none shadow-sm transition-all text-gray-700 font-medium"
            />
            <Globe className="absolute left-4 top-3.5 text-gray-400" size={20}/>
        </div>
        <button 
          onClick={handlePreview} 
          disabled={loading}
          className="bg-black text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-gray-900 disabled:opacity-70 transition shadow-lg flex items-center gap-2"
        >
          {loading ? (
             <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"/>
          ) : (
             <>Search <Search size={18}/></>
          )}
        </button>
      </div>

      {/* --- RÉSULTATS (SCROLLABLE) --- */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scroll max-h-[400px]">
        {previewData && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-100 mb-4">
                    <Check size={18} />
                    <span className="font-bold text-sm">{previewData.message}</span>
                </div>

                {previewData.tables.map((table) => (
                <div key={table.index} className="bg-white p-5 border border-gray-100 rounded-2xl shadow-sm flex justify-between items-center group hover:border-orange-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-12 h-12 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                            <Table size={20} />
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-gray-800 text-base">Table #{table.index + 1}</h4>
                            <p className="text-xs text-gray-400 mt-0.5 font-mono bg-gray-50 px-2 py-0.5 rounded inline-block">
                                {table.rows} rows × {table.cols} columns
                            </p>
                            <p className="text-xs text-gray-400 mt-2 truncate w-full max-w-md">
                                {table.columns.join(', ')}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleImport(table.index)}
                        className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition flex items-center gap-2 shadow-md flex-shrink-0"
                    >
                        Import <ArrowRight size={14}/>
                    </button>
                </div>
                ))}
            </div>
        )}

        {!previewData && !loading && (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
                <Globe size={48} className="text-gray-300 mb-4"/>
                <p className="text-sm font-medium text-gray-400">Enter a URL to start extraction</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ScrapeTab;