import React, { useState } from 'react';
import dataService from '../../../services/data.service';

const ScrapeTab = ({ onSuccess }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null); // { session_id, tables: [] }

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
      // On envoie l'ID de session temporaire + l'index de la table
      const res = await dataService.scrapeSelect(previewData.session_id, [index]);
      onSuccess(res.data);
    } catch (err) {
      alert("Erreur lors de l'import de la table.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="font-bold text-gray-800">Web Scraping</h3>
        <p className="text-sm text-gray-500">Extract tables from any webpage (Wikipedia, etc.)</p>
      </div>

      {/* Input Zone */}
      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(nominal)" 
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
        />
        <button 
          onClick={handlePreview} 
          disabled={loading}
          className="bg-brand-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-600 disabled:opacity-50 transition"
        >
          {loading ? 'Scanning...' : 'Extract Tables'}
        </button>
      </div>

      {/* Résultats */}
      {previewData && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-[300px] overflow-y-auto">
          <p className="text-sm font-bold text-green-600 mb-3">
             ✅ {previewData.message}
          </p>
          <div className="space-y-3">
            {previewData.tables.map((table) => (
              <div key={table.index} className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm flex justify-between items-center hover:border-brand-300 transition">
                <div>
                  <span className="font-bold text-gray-800">Table #{table.index + 1}</span>
                  <span className="text-xs text-gray-500 ml-2">({table.rows} rows, {table.cols} cols)</span>
                  <div className="text-xs text-gray-400 mt-1 truncate max-w-md">
                    Cols: {table.columns.join(', ')}
                  </div>
                </div>
                <button 
                  onClick={() => handleImport(table.index)}
                  className="text-xs font-bold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  Import
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrapeTab;