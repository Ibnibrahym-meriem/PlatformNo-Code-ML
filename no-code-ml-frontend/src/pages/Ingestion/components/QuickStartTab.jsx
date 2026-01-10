import React, { useState } from 'react';
import dataService from '../../../services/data.service';
import { 
  Database, Activity, TrendingUp, Users, HeartPulse, 
  ShoppingCart, Film, Home, Droplet, Shapes, ArrowRight 
} from 'lucide-react';

const datasets = [
  { id: 'titanic', name: 'Titanic', type: 'Classification', desc: 'Predict survival probability based on passenger data.', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'iris', name: 'Iris Flowers', type: 'Classification', desc: 'Classify flower species using petal measurements.', icon: Droplet, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'housing', name: 'Housing', type: 'Regression', desc: 'Forecast California housing prices from census data.', icon: Home, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'diabetes', name: 'Diabetes', type: 'Regression', desc: 'Analyze disease progression indicators.', icon: Activity, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'wine', name: 'Wine Quality', type: 'Classification', desc: 'Determine wine quality score from chemical stats.', icon: Database, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'cancer', name: 'Breast Cancer', type: 'Classification', desc: 'Diagnostic prediction (Malignant vs Benign).', icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: 'movies', name: 'Movies', type: 'Recommender', desc: 'User ratings database for recommendation systems.', icon: Film, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'penguins', name: 'Penguins', type: 'Classification', desc: 'Palmer Archipelago penguin species classification.', icon: Database, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { id: 'tips', name: 'Tips', type: 'Regression', desc: 'Predict restaurant tip amounts based on total bill.', icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'moons', name: 'Moons', type: 'Clustering', desc: 'Synthetic geometric data for clustering demos.', icon: Shapes, color: 'text-yellow-500', bg: 'bg-yellow-50' },
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
    <div className="h-full flex flex-col">
      {/* En-tête avec description plus claire */}
      <div className="mb-6 flex justify-between items-end">
        <div>
            <h3 className="font-bold text-gray-800 text-lg">Quick Start Datasets</h3>
            <p className="text-sm text-gray-500 mt-1">Select a pre-loaded dataset to start practicing immediately.</p>
        </div>
        <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
            {datasets.length} Datasets Available
        </span>
      </div>

      {/* Grille des datasets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scroll max-h-[450px]">
        {datasets.map((ds) => (
          <button 
            key={ds.id}
            onClick={() => handleLoad(ds.id)}
            disabled={loadingId !== null}
            className={`
              relative flex flex-col p-5 rounded-2xl border text-left transition-all duration-300 group
              ${loadingId === ds.id 
                 ? 'border-orange-200 bg-orange-50/50' 
                 : 'border-gray-100 bg-white hover:border-orange-200 hover:shadow-lg hover:-translate-y-1'}
            `}
          >
            <div className="flex justify-between items-start w-full mb-3">
                {/* Icône avec fond coloré */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ds.bg} ${ds.color} shadow-sm group-hover:scale-110 transition-transform`}>
                    <ds.icon size={20} strokeWidth={2.5} />
                </div>
                
                {/* Badge Type */}
                <span className={`
                   text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border
                   ${ds.type === 'Classification' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                     ds.type === 'Regression' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                     'bg-gray-50 text-gray-600 border-gray-100'}
                `}>
                   {ds.type}
                </span>
            </div>
            
            <div>
                <h4 className="font-bold text-gray-800 text-base mb-1 group-hover:text-orange-600 transition-colors">
                    {ds.name}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                    {ds.desc}
                </p>
            </div>

            {/* Indicateur visuel au survol */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                <ArrowRight size={16} className="text-orange-400" />
            </div>
            
            {/* Overlay Chargement */}
            {loadingId === ds.id && (
               <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-10">
                  <div className="flex flex-col items-center">
                      <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <span className="text-orange-600 font-bold text-xs">Loading...</span>
                  </div>
               </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickStartTab;