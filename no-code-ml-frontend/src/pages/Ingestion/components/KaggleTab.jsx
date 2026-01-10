import React, { useState } from 'react';
import dataService from '../../../services/data.service';
import { Search, Settings, Key, User, DownloadCloud, Database, X } from 'lucide-react';

const KaggleTab = ({ onSuccess }) => {
  // États de recherche
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState(null);

  // États de configuration (Clés API)
  const [showConfig, setShowConfig] = useState(false);
  const [kUsername, setKUsername] = useState('');
  const [kKey, setKKey] = useState('');
  const [savingKeys, setSavingKeys] = useState(false);

  // --- 1. FONCTION DE RECHERCHE ---
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query) return;

    setLoading(true);
    setResults([]);
    try {
      const res = await dataService.searchKaggle(query);
      setResults(res.data.results);
      setShowConfig(false); 
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || "";

      if (msg.toLowerCase().includes("key") || msg.toLowerCase().includes("kaggle") || msg.includes("Unauthorized")) {
        setShowConfig(true);
      } else {
        alert("Erreur de recherche : " + msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 2. FONCTION DE SAUVEGARDE DES CLÉS ---
  const handleSaveKeys = async () => {
    if (!kUsername || !kKey) {
      alert("Veuillez remplir les deux champs.");
      return;
    }
    setSavingKeys(true);
    try {
      await dataService.saveKaggleKeys(kUsername, kKey);
      alert("✅ Clés enregistrées ! Réessayez la recherche.");
      setShowConfig(false);
      if (query) handleSearch(null);
    } catch (err) {
      console.error(err);
      alert("Impossible de sauvegarder les clés.");
    } finally {
      setSavingKeys(false);
    }
  };

  // --- 3. FONCTION D'IMPORT ---
  const handleImport = async (datasetId) => {
    if (!datasetId) return;
    setImportingId(datasetId);
    try {
      const res = await dataService.ingestKaggle(datasetId);
      onSuccess(res.data);
    } catch (err) {
      const msg = err.response?.data?.detail || "Erreur inconnue";
      alert(`Erreur lors de l'import : ${msg}`);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      
      {/* En-tête */}
      <div className="flex justify-between items-start mb-8">
        <div className="text-center flex-1">
          <h3 className="font-bold text-gray-800 text-lg">Kaggle Datasets</h3>
          <p className="text-sm text-gray-500">Explore and import public datasets</p>
        </div>
        <button 
            onClick={() => setShowConfig(!showConfig)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-2 transition-all
              ${showConfig ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}
            `}
        >
            <Settings size={14}/> {showConfig ? 'Close Config' : 'API Keys'}
        </button>
      </div>

      {/* --- ZONE DE CONFIGURATION (Style Orange/Gris) --- */}
      {showConfig && (
        <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl mb-8 animate-in fade-in slide-in-from-top-2 relative">
            <div className="absolute top-4 right-4 text-orange-300 hover:text-orange-500 cursor-pointer" onClick={() => setShowConfig(false)}>
                <X size={18}/>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white text-orange-500 flex items-center justify-center shadow-sm">
                    <Key size={16}/> 
                </div>
                <h4 className="font-bold text-gray-800">Kaggle Configuration</h4>
            </div>

            <p className="text-xs text-gray-500 mb-4 ml-1">
                Your keys are securely stored and linked to your account.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-2 rounded-xl border border-orange-100 focus-within:ring-2 focus-within:ring-orange-200 transition-shadow">
                    <div className="flex items-center px-3 py-1 gap-2 border-b border-gray-50">
                        <User size={12} className="text-gray-400"/>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Username</span>
                    </div>
                    <input 
                        type="text" 
                        value={kUsername}
                        onChange={(e) => setKUsername(e.target.value)}
                        placeholder="your_kaggle_username"
                        className="w-full p-2 text-sm outline-none text-gray-700 placeholder-gray-300 font-medium"
                    />
                </div>
                
                <div className="bg-white p-2 rounded-xl border border-orange-100 focus-within:ring-2 focus-within:ring-orange-200 transition-shadow">
                    <div className="flex items-center px-3 py-1 gap-2 border-b border-gray-50">
                        <Key size={12} className="text-gray-400"/>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">API Key</span>
                    </div>
                    <input 
                        type="password" 
                        value={kKey}
                        onChange={(e) => setKKey(e.target.value)}
                        placeholder="•••••••••••••••••••••"
                        className="w-full p-2 text-sm outline-none text-gray-700 placeholder-gray-300 font-medium"
                    />
                </div>
            </div>
            
            <div className="mt-4 flex justify-end">
                <button 
                    onClick={handleSaveKeys}
                    disabled={savingKeys}
                    className="bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200 flex items-center gap-2"
                >
                    {savingKeys ? "Saving..." : "Save Credentials"}
                </button>
            </div>
        </div>
      )}

      {/* --- BARRE DE RECHERCHE --- */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 relative">
        <div className="absolute left-4 top-3.5 text-gray-400">
            <Search size={20}/>
        </div>
        <input 
          type="text" 
          placeholder="Ex: Titanic, Finance, Health..." 
          className="flex-1 pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none shadow-sm transition-all bg-white font-medium text-gray-700"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition shadow-lg shadow-gray-200 disabled:opacity-70 disabled:shadow-none"
        >
          {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"/> : 'Search'}
        </button>
      </form>

      {/* --- LISTE DES RÉSULTATS --- */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scroll max-h-[450px]">
        {results.length === 0 && !loading && !showConfig && (
           <div className="flex flex-col items-center justify-center py-12 opacity-50">
              <Database size={48} className="text-gray-300 mb-4"/>
              <p className="text-gray-400 text-sm font-medium">Start by typing a keyword above</p>
           </div>
        )}

        {results.map((ds, idx) => (
          <div key={idx} className="bg-white border border-gray-100 p-5 rounded-2xl flex justify-between items-center group hover:border-orange-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-5 overflow-hidden">
               {/* Logo Kaggle Stylisé */}
               <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0 shadow-sm border border-sky-100">
                 K
               </div>
               
               <div className="min-w-0">
                  <h4 className="font-bold text-gray-800 truncate text-base mb-1">{ds.title}</h4>
                  <p className="text-xs text-gray-400 font-mono truncate bg-gray-50 px-2 py-0.5 rounded inline-block border border-gray-100 mb-2">
                    {ds.id}
                  </p> 
                  <div className="flex gap-3">
                     {ds.size && (
                        <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                            <Database size={10}/> {ds.size}
                        </span>
                     )}
                     {ds.voteCount !== undefined && (
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                            ★ {ds.voteCount}
                        </span>
                     )}
                  </div>
               </div>
            </div>
            
            <button 
              onClick={() => handleImport(ds.id)}
              disabled={importingId !== null}
              className={`ml-4 px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 flex-shrink-0
                ${importingId === ds.id 
                   ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                   : 'bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg'}`}
            >
              {importingId === ds.id ? (
                  <><div className="animate-spin w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full"/> Loading...</>
              ) : (
                  <><DownloadCloud size={14}/> Import</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KaggleTab;