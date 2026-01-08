import React, { useState } from 'react';
import dataService from '../../../services/data.service';

const KaggleTab = ({ onSuccess }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]); // Liste des datasets trouvés
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState(null); // Pour savoir quel dataset charge

  // 1. Recherche
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setResults([]);
    try {
      const res = await dataService.searchKaggle(query);
      setResults(res.data.results);
    } catch (err) {
      alert("Erreur lors de la recherche Kaggle. Vérifiez votre backend.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Import
// Dans src/pages/Ingestion/components/KaggleTab.jsx

  const handleImport = async (datasetRef) => {
    // 1. On verrouille le bouton
    setImportingId(datasetRef);
    
    try {
      const res = await dataService.ingestKaggle(datasetRef);
      // 2. Si ça marche, on notifie le parent
      onSuccess(res.data);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'importation depuis Kaggle.");
    } finally {
      // 3. IMPORTANT : Quoi qu'il arrive (succès ou erreur), on déverrouille le bouton !
      setImportingId(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div className="text-center mb-6">
        <h3 className="font-bold text-gray-800">Search Kaggle Datasets</h3>
        <p className="text-sm text-gray-500">Access thousands of public datasets directly</p>
      </div>

      {/* Barre de recherche */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-3 text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input 
            type="text" 
            placeholder="Search topic (e.g. 'finance', 'diabetes', 'housing')..." 
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg disabled:opacity-70"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Liste des résultats */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[400px]">
        {results.length === 0 && !loading && (
           <div className="text-center text-gray-400 mt-10">
              Try searching for "Titanic" or "Iris" to see results.
           </div>
        )}

        {results.map((ds, idx) => (
          <div key={idx} className="bg-white border border-gray-200 p-4 rounded-xl hover:border-brand-300 hover:shadow-md transition flex justify-between items-center group">
            <div className="flex items-start gap-4">
               {/* Icone K Kaggle */}
               <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0">
                 K
               </div>
               <div>
                  <h4 className="font-bold text-gray-800 group-hover:text-brand-600 transition">{ds.title}</h4>
                  <p className="text-xs text-gray-400">{ds.ref}</p>
                  <div className="flex gap-2 mt-1">
                     <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">CSV</span>
                     <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Public</span>
                  </div>
               </div>
            </div>
            
            <button 
              onClick={() => handleImport(ds.ref)}
              disabled={importingId !== null}
              className={`
                px-4 py-2 rounded-lg text-sm font-bold transition
                ${importingId === ds.ref 
                   ? 'bg-gray-100 text-gray-400 cursor-wait' 
                   : 'bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white'}
              `}
            >
              {importingId === ds.ref ? 'Downloading...' : 'Import'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KaggleTab;