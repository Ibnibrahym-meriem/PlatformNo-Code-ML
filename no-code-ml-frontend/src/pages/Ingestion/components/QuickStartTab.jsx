import React, { useState } from 'react';
import dataService from '../../../services/data.service';

const datasets = [
  { id: 'titanic', name: 'Titanic', type: 'Classification', desc: 'Predict survival on the Titanic.', icon: '🚢' },
  { id: 'iris', name: 'Iris Flowers', type: 'Classification', desc: 'Predict flower species based on petals.', icon: '🌸' },
  { id: 'housing', name: 'Housing', type: 'Regression', desc: 'Predict California housing prices.', icon: '🏠' },
  { id: 'diabetes', name: 'Diabetes', type: 'Regression', desc: 'Predict disease progression.', icon: '🍬' },
  { id: 'wine', name: 'Wine Quality', type: 'Classification', desc: 'Classify wine based on chemical analysis.', icon: '🍷' },
  { id: 'cancer', name: 'Breast Cancer', type: 'Classification', desc: 'Diagnostic (Malignant/Benign).', icon: '🔬' },
  { id: 'movies', name: 'Movies', type: 'Recommender', desc: 'Dataset of movie ratings.', icon: '🎬' },
  { id: 'penguins', name: 'Penguins', type: 'Classification', desc: 'Predict penguin species (Palmer Archipelago).', icon: '🐧' },
  { id: 'tips', name: 'Tips', type: 'Regression', desc: 'Predict restaurant tips based on bills.', icon: '🍽️' },
  { id: 'moons', name: 'Moons', type: 'Clustering', desc: 'Geometric shape for clustering demo.', icon: '🌙' },
];

const QuickStartTab = ({ onSuccess }) => {
  const [loadingId, setLoadingId] = useState(null);

  const handleLoad = async (id) => {
    setLoadingId(id);
    try {
      const res = await dataService.ingestQuickStart(id);
      onSuccess(res.data);
    } catch (err) {
      alert("Erreur de chargement: " + err.message);
      setLoadingId(null);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="font-bold text-gray-800">Quick Start Datasets</h3>
        <p className="text-sm text-gray-500">Practice with clean, pre-loaded standard datasets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[450px] overflow-y-auto p-1 custom-scrollbar">
        {datasets.map((ds) => (
          <button 
            key={ds.id}
            onClick={() => handleLoad(ds.id)}
            disabled={loadingId !== null}
            className={`
              flex flex-col items-start p-5 border rounded-xl text-left transition-all duration-200 group relative overflow-hidden
              ${loadingId === ds.id 
                 ? 'border-brand-300 bg-brand-50' 
                 : 'border-gray-200 bg-white hover:border-brand-400 hover:shadow-lg hover:-translate-y-1'}
            `}
          >
            {/* Type badge */}
            <span className={`
               absolute top-3 right-3 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full
               ${ds.type === 'Classification' ? 'bg-purple-100 text-purple-600' : 
                 ds.type === 'Regression' ? 'bg-blue-100 text-blue-600' : 
                 ds.type === 'Clustering' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}
            `}>
               {ds.type}
            </span>

            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{ds.icon}</div>
            
            <h4 className="font-bold text-gray-800 text-lg group-hover:text-brand-600">{ds.name}</h4>
            <p className="text-sm text-gray-500 mt-1 leading-snug">{ds.desc}</p>
            
            {loadingId === ds.id && (
               <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <div className="text-brand-600 font-bold text-sm animate-pulse">Loading...</div>
               </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickStartTab;