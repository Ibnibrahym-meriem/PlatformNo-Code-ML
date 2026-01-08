import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Database, 
  BarChart2, 
  FlaskConical, 
  Cpu, 
  Trophy, 
  LayoutDashboard,
  PieChart,
  FileText,
  Sliders,
  CheckSquare,
  Target
} from 'lucide-react';

// --- DONNÉES DE LA DOCUMENTATION ---
const docSections = [
  {
    id: 'start',
    title: 'Getting Started',
    subtitle: 'Platform Overview',
    description: "Start your journey from raw data to deployed model. You control the model selection.",
    icon: <LayoutDashboard />,
    nextStep: 'ingestion',
    content: (
      <div className="space-y-8">
        <p className="text-xl text-slate-600 font-light leading-relaxed">
          Welcome to <span className="font-bold text-slate-900">DataFlow AI</span>. This platform empowers you to build sophisticated ML models without writing a single line of code.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-4xl font-bold text-slate-200 mb-4 block">01</span>
                <div className="font-bold text-slate-900 mb-2">Ingest</div>
                <div className="text-sm text-slate-500">Upload CSV, JSON, or Excel files securely.</div>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-4xl font-bold text-slate-200 mb-4 block">02</span>
                <div className="font-bold text-slate-900 mb-2">Process</div>
                <div className="text-sm text-slate-500">Clean data and visualize patterns instantly.</div>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-4xl font-bold text-slate-200 mb-4 block">03</span>
                <div className="font-bold text-slate-900 mb-2">Train</div>
                <div className="text-sm text-slate-500">Compare algorithms and export results.</div>
            </div>
        </div>
      </div>
    )
  },
  {
    id: 'ingestion',
    title: 'Data Ingestion',
    subtitle: 'Import your Dataset',
    description: "Upload your data files securely. We support CSV, JSON, and Excel formats.",
    icon: <Database />,
    nextStep: 'exploration',
    content: (
      <div className="space-y-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">How to import data</h3>
            <ol className="space-y-6 text-slate-600">
                <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold shrink-0">1</div>
                    <div>
                        <p className="font-medium text-slate-900">Navigate to Data Ingestion</p>
                        <p className="text-sm text-slate-500 mt-1">Click the tab in the sidebar menu.</p>
                    </div>
                </li>
                <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold shrink-0">2</div>
                    <div>
                        <p className="font-medium text-slate-900">Drag and Drop</p>
                        <p className="text-sm text-slate-500 mt-1 mb-2">Supported formats:</p>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-slate-100 rounded-md text-xs font-mono text-slate-600">.csv</span>
                            <span className="px-3 py-1 bg-slate-100 rounded-md text-xs font-mono text-slate-600">.json</span>
                            <span className="px-3 py-1 bg-slate-100 rounded-md text-xs font-mono text-slate-600">.xlsx</span>
                        </div>
                    </div>
                </li>
                <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold shrink-0">3</div>
                    <div>
                        <p className="font-medium text-slate-900">Validation</p>
                        <p className="text-sm text-slate-500 mt-1">Verify the preview table to ensure columns are correctly detected (UTF-8).</p>
                    </div>
                </li>
            </ol>
        </div>
      </div>
    )
  },
  {
    id: 'exploration',
    title: 'Exploration',
    subtitle: 'Visualize Patterns',
    description: "Analyze distributions, Pie charts, and correlations to understand your data.",
    icon: <BarChart2 />,
    nextStep: 'lab',
    content: (
      <div className="space-y-8">
        <p className="text-slate-600 font-light text-lg">
            Select a column in the sidebar to generate interactive charts instantly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-orange-200 transition-all shadow-sm group">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-orange-600 transition-colors">
                        <BarChart2 className="w-6 h-6"/>
                    </div>
                    <span className="font-bold text-slate-900 text-lg">Distribution</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">Histograms to analyze the spread and skewness of numerical data.</p>
            </div>
            
            <div className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-orange-200 transition-all shadow-sm group">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-orange-600 transition-colors">
                        <PieChart className="w-6 h-6"/>
                    </div>
                    <span className="font-bold text-slate-900 text-lg">Répartition</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">Pie charts for categorical data (e.g., Gender, City) to visualize proportions.</p>
            </div>

            <div className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-orange-200 transition-all shadow-sm group">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-orange-600 transition-colors font-bold text-xs w-10 h-10 flex items-center justify-center">
                        BP
                    </div>
                    <span className="font-bold text-slate-900 text-lg">Box Plot</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">Identify outliers and quartiles instantly for numerical features.</p>
            </div>

            <div className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-orange-200 transition-all shadow-sm group">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-orange-600 transition-colors font-bold text-xs w-10 h-10 flex items-center justify-center">
                        HM
                    </div>
                    <span className="font-bold text-slate-900 text-lg">Correlation</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">Heatmap to find relationships and dependencies between variables.</p>
            </div>
        </div>
      </div>
    )
  },
  {
    id: 'lab',
    title: 'Data Lab',
    subtitle: 'Clean & Preprocess',
    description: "Prepare your data for training. Handle missing values, duplicates, and outliers.",
    icon: <FlaskConical />,
    nextStep: 'training',
    content: (
      <div className="space-y-6">
        <p className="text-slate-600 mb-6 font-light">Data quality directly impacts model accuracy. Use the tools below to sanitize your dataset:</p>
        
        <div className="space-y-4">
            {[
                { title: 'Missing Values Handling', why: 'Models cannot process empty cells (NaN).', action: 'Use "Drop Rows" or "Fill Mean/Median".', color: 'bg-orange-500' },
                { title: 'Duplicates Removal', why: 'Duplicate rows bias the model by overfitting to repeated data.', action: '"Remove Duplicates" keeps only unique records.', color: 'bg-slate-400' },
                { title: 'Outliers Detection', why: 'Extreme values skew statistical properties (mean, variance).', action: 'Use "Clip" or "Remove" based on IQR method.', color: 'bg-slate-400' },
                { title: 'Encoding', why: 'Algorithms require numerical input (No text).', action: 'Converts categories (e.g., "Yes") into numbers (1).', color: 'bg-slate-400' },
                { title: 'Normalization', why: 'Brings all features to a common scale (0 to 1).', action: 'Apply Min-Max Scaling.', color: 'bg-slate-400' },
                { title: 'SMOTE (Balancing)', why: 'Fixes imbalanced classes (e.g., 90% No / 10% Yes).', action: 'Generates synthetic samples.', color: 'bg-slate-400' }
            ].map((item, index) => (
                <div key={index} className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm hover:border-slate-300 transition-all">
                    <h4 className="font-bold text-slate-900 flex items-center gap-3 mb-2">
                        <span className={`w-2 h-2 rounded-full ${item.color}`}></span> 
                        {item.title}
                    </h4>
                    <div className="pl-5 border-l border-slate-100 ml-1">
                        <p className="text-sm text-slate-600 mb-1"><span className="font-semibold text-slate-900">Why?</span> {item.why}</p>
                        <p className="text-sm text-slate-500"><span className="font-semibold text-slate-900">Action:</span> {item.action}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    )
  },
  {
    id: 'training',
    title: 'Model Training',
    subtitle: 'Train your Model',
    description: "Configure the problem type, select specific algorithms, and tune hyperparameters.",
    icon: <Cpu />,
    nextStep: 'results',
    content: (
      <div className="space-y-10">
        
        {/* Section 1: Auto Detection */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Cpu className="w-5 h-5 text-orange-600" />
                Automatic Problem Detection
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Based on your Target Variable, the system automatically detects the ML Task:
            </p>
            <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600">Classification</span>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600">Regression</span>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600">Clustering</span>
            </div>
        </div>

        {/* Section 2: Elegant Workflow */}
        <div>
            <h3 className="font-bold text-slate-900 mb-6 text-xl">Training Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Step 1 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Target size={64} />
                    </div>
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold mb-4">1</div>
                    <h4 className="font-bold text-slate-900 mb-2">Target Variable</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Select the column you want to predict from the dropdown menu.
                    </p>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <CheckSquare size={64} />
                    </div>
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold mb-4">2</div>
                    <h4 className="font-bold text-slate-900 mb-2">Select Models</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Choose algorithms to compare (Random Forest, SVM, XGBoost, etc.).
                    </p>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Sliders size={64} />
                    </div>
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold mb-4">3</div>
                    <h4 className="font-bold text-slate-900 mb-2">Fine Tuning</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Adjust Hyperparameters, K-Folds (Default: 5) and Test size.
                    </p>
                </div>

            </div>
        </div>
      </div>
    )
  },
  {
    id: 'results',
    title: 'Results',
    subtitle: 'View Performance',
    description: "Compare models, analyze Confusion Matrices, and export your report.",
    icon: <Trophy />,
    nextStep: null, 
    content: (
      <div className="space-y-8">
        <p className="text-slate-600 font-light text-lg">
            Once training is complete, the <strong>Leaderboard</strong> ranks models by their score (Accuracy or RMSE).
        </p>

        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-orange-200 transition-colors">
                <span className="font-bold text-slate-900 block text-lg mb-2">Confusion Matrix</span>
                <span className="text-sm text-slate-500 leading-relaxed">Crucial for Classification. Check False Positives (FP) and False Negatives (FN).</span>
            </div>
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-orange-200 transition-colors">
                <span className="font-bold text-slate-900 block text-lg mb-2">ROC Curve</span>
                <span className="text-sm text-slate-500 leading-relaxed">Visualizes the trade-off between sensitivity and specificity.</span>
            </div>
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-orange-200 transition-colors">
                <span className="font-bold text-slate-900 block text-lg mb-2">Training Time</span>
                <span className="text-sm text-slate-500 leading-relaxed">Check how fast the model trains (important for large datasets).</span>
            </div>
        </div>

        <div className="flex items-center gap-6 bg-slate-50 border border-slate-200 p-8 rounded-2xl mt-4">
            <div className="p-4 bg-white rounded-xl shadow-sm">
                 <FileText className="text-orange-600 w-8 h-8" />
            </div>
            <div>
                <h4 className="font-bold text-xl text-slate-900">Export Report</h4>
                <p className="text-sm text-slate-500 mt-2">Download the full analysis, including charts and metrics, as a PDF file.</p>
            </div>
        </div>
      </div>
    )
  }
];

const Documentation = () => {
  const [activeTab, setActiveTab] = useState(null);
  const activeSection = docSections.find(s => s.id === activeTab);

  const handleNextStep = (nextId) => {
    if (nextId) {
        setActiveTab(nextId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    // ✅ MODIFICATION ICI : Utilisation de bg-slate-50 (gris clair) pour le fond global
    // au lieu de bg-white, pour éviter la coupure avec le reste du dashboard.
    <div className="w-full min-h-[calc(100vh-4rem)] bg-slate-50 p-6 md:p-12 relative">
      
      {/* --- HEADER GLOBAL --- */}
      {!activeTab && (
        <div className="mb-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Master <span className="text-orange-600">DataFlow AI</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-light">
            Everything you need to go from raw data to deployed models.
          </p>
        </div>
      )}

      {/* --- VUE 1 : LA GRILLE --- */}
      {!activeTab && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-10">
            {docSections.map((section) => (
              <div 
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className="group bg-white rounded-[2rem] p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-orange-100 transition-all duration-500 cursor-pointer flex flex-col relative overflow-hidden hover:-translate-y-2"
              >
                <div className="flex items-start justify-between mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-600 transition-all duration-500">
                        {React.cloneElement(section.icon, { size: 32 })}
                    </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {section.title}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    {section.subtitle}
                </p>
                <p className="text-base text-slate-500 leading-relaxed font-light mb-8">
                  {section.description}
                </p>

                <div className="mt-auto flex items-center text-sm font-bold text-orange-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                  Read Guide <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            ))}
        </div>
      )}

      {/* --- VUE 2 : LE GUIDE DÉTAILLÉ --- */}
      {activeTab && activeSection && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-5xl mx-auto relative">
          
          {/* ✅ FLÈCHE RETOUR (Fixe, haut gauche) */}
          <div className="absolute -top-6 -left-4 md:-left-12">
            <button 
                onClick={() => setActiveTab(null)}
                className="group flex items-center gap-2 p-2 text-slate-400 hover:text-orange-600 transition-colors"
                title="Back to Overview"
            >
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="pt-8">
            {/* Contenu Principal */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgb(0,0,0,0.05)] overflow-hidden">
                
                {/* Header */}
                <div className="bg-white px-10 py-12 border-b border-slate-50 flex flex-col md:flex-row items-start md:items-center gap-8">
                    <div className="w-20 h-20 bg-orange-50 rounded-2xl text-orange-600 flex items-center justify-center shrink-0">
                        {React.cloneElement(activeSection.icon, { size: 40 })}
                    </div>
                    <div>
                        <h2 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-3">Documentation Center</h2>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">{activeSection.title}</h1>
                    </div>
                </div>

                {/* Corps du texte */}
                <div className="p-10 md:p-14">
                    {activeSection.content}
                </div>

                {/* Footer Navigation */}
                <div className="bg-slate-50/50 p-10 border-t border-slate-50 flex justify-end items-center">
                    {activeSection.nextStep ? (
                       <button 
                          onClick={() => handleNextStep(activeSection.nextStep)}
                          className="group flex items-center gap-3 bg-slate-900 hover:bg-orange-600 text-white px-8 py-4 rounded-xl shadow-lg transition-all font-bold tracking-wide text-sm"
                       >
                          Next Step: {docSections.find(s => s.id === activeSection.nextStep)?.title}
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                       </button>
                    ) : (
                      /* ✅ BOUTON RETOUR FINAL */
                      <button 
                          onClick={() => setActiveTab(null)}
                          className="group flex items-center gap-3 bg-slate-900 hover:bg-orange-600 text-white px-8 py-4 rounded-xl shadow-lg transition-all font-bold tracking-wide text-sm"
                       >
                          Back to Overview
                          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/>
                       </button>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documentation;