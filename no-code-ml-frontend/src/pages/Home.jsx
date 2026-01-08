import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react'; 

// --- ICONES SVG (Style Ligne fin & Élégant) ---
const IconDatabase = () => (
  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);
const IconSparkles = () => (
  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);
const IconChart = () => (
  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);
const IconChip = () => (
  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
  </svg>
);
const IconResult = () => (
  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.091-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-6 h-6 text-orange-500 mr-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
// Icone Livre (Documentation) - Version Large
const IconBookLarge = () => (
  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25" />
  </svg>
);
// Icone Livre (Documentation) - Version Petite
const IconBookSmall = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25" />
  </svg>
);
// Nouvelle Icone Historique
const IconHistory = () => (
  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Home = () => {
  const navigate = useNavigate();

  // Fonction de redirection vers Register quand on clique sur une carte
  const handleCardClick = () => {
    navigate('/register');
  };

  // Liste pour la section Documentation (API Reference retiré)
  const docItems = [
    { title: "Getting Started", desc: "Learn the basics and start your first ML project", icon: <IconBookSmall /> },
    { title: "Data Import Guide", desc: "How to import data from various sources", icon: <IconDatabase /> },
    { title: "EDA & Visualization", desc: "Explore your data with interactive charts", icon: <IconChart /> },
    { title: "Data Lab", desc: "Clean and preprocess your data with AI tools", icon: <IconSparkles /> },
    { title: "Model Training", desc: "Configure and train ML models", icon: <IconChip /> },
    { title: "Results & Export", desc: "Evaluate performance and deploy models", icon: <IconResult /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-orange-100">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all">
        <div className="flex justify-between items-center px-8 py-5 max-w-[1600px] mx-auto w-full">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-10 h-10 bg-orange-600 rounded-xl text-white flex items-center justify-center shadow-lg shadow-orange-200 hover:scale-105 transition-transform">
                <Zap size={20} fill="currentColor" strokeWidth={0} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">DataFlow AI</span>
          </div>
          
          <div className="hidden md:flex gap-10 text-slate-500 font-medium text-sm tracking-wide">
            <a href="#features" className="hover:text-orange-600 transition-colors">Features</a>
            <a href="#docs" className="hover:text-orange-600 transition-colors">Documentation</a>
          </div>

          <div className="flex gap-4">
            <Link to="/login" className="px-6 py-2.5 text-slate-600 font-semibold hover:text-orange-600 text-sm transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="px-7 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all shadow-md hover:shadow-lg text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="min-h-[90vh] flex flex-col justify-center items-center text-center px-4 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight">
          Build Machine Learning <br />
          Models <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">Without Code</span>
        </h1>
        
        <p className="text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
          From data ingestion to model training — automate your ML workflow with 
          AI-powered tools. Clean, explore, and train models in minutes.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center w-full">
          <Link to="/register" className="px-10 py-5 bg-orange-600 text-white text-lg font-bold rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 hover:shadow-2xl hover:-translate-y-1">
            Start Free →
          </Link>
          <button className="px-10 py-5 bg-white text-slate-700 text-lg font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md">
            <span>▷</span> Watch Demo
          </button>
        </div>
      </header>

      {/* --- FEATURES GRID (LARGE & VIP) --- */}
      <section id="features" className="py-32 bg-white relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-50/40 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-[1600px] mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
             <h2 className="text-4xl font-extrabold text-slate-900">Platform Capabilities</h2>
             <p className="text-slate-500 mt-4 text-lg">Everything you need to master your data</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            
            {/* 1. DOCUMENTATION (Nouvelle carte au début) */}
            <div onClick={handleCardClick} className="group flex-1 min-w-[320px] max-w-[400px] bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(234,88,12,0.15)] hover:border-orange-100 hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <IconBookLarge />
               </div>
              <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <IconBookLarge />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-orange-600 transition-colors">Documentation</h3>
              <p className="text-slate-500 text-base leading-relaxed">Comprehensive guides, tutorials, and API references to master the platform.</p>
            </div>

            {/* 2. Data Ingestion */}
            <div onClick={handleCardClick} className="group flex-1 min-w-[320px] max-w-[400px] bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(234,88,12,0.15)] hover:border-orange-100 hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <IconDatabase />
               </div>
              <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <IconDatabase />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-orange-600 transition-colors">Data Ingestion</h3>
              <p className="text-slate-500 text-base leading-relaxed">Import datasets from CSV, Kaggle, or external URLs securely and instantly.</p>
            </div>

            {/* 3. Visual Exploration */}
            <div onClick={handleCardClick} className="group flex-1 min-w-[320px] max-w-[400px] bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(234,88,12,0.15)] hover:border-orange-100 hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <IconChart />
               </div>
              <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <IconChart />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-orange-600 transition-colors">Visual Exploration</h3>
              <p className="text-slate-500 text-base leading-relaxed">Discover patterns with interactive charts and AI-driven analysis tools.</p>
            </div>

             {/* 4. Data Lab */}
             <div onClick={handleCardClick} className="group flex-1 min-w-[320px] max-w-[400px] bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(234,88,12,0.15)] hover:border-orange-100 hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <IconSparkles />
               </div>
              <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <IconSparkles />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-orange-600 transition-colors">Data Lab</h3>
              <p className="text-slate-500 text-base leading-relaxed">Automatically clean, normalize, fill missing values and fix quality.</p>
            </div>

            {/* 5. Model Training */}
            <div onClick={handleCardClick} className="group flex-1 min-w-[320px] max-w-[400px] bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(234,88,12,0.15)] hover:border-orange-100 hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <IconChip />
               </div>
              <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <IconChip />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-orange-600 transition-colors">Model Training</h3>
              <p className="text-slate-500 text-base leading-relaxed">Train advanced machine learning models (RF, SVM, XGB) with one click.</p>
            </div>

            {/* 6. Results */}
            <div onClick={handleCardClick} className="group flex-1 min-w-[320px] max-w-[400px] bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(234,88,12,0.15)] hover:border-orange-100 hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <IconResult />
               </div>
              <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <IconResult />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-orange-600 transition-colors">Results</h3>
              <p className="text-slate-500 text-base leading-relaxed">Evaluate performance metrics, compare models and export reports.</p>
            </div>

            {/* 7. HISTORY (Nouvelle carte à la fin) */}
            <div onClick={handleCardClick} className="group flex-1 min-w-[320px] max-w-[400px] bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(234,88,12,0.15)] hover:border-orange-100 hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <IconHistory />
               </div>
              <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <IconHistory />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-orange-600 transition-colors">History</h3>
              <p className="text-slate-500 text-base leading-relaxed">Track your experiments, compare model versions, and audit past runs.</p>
            </div>

          </div>
        </div>
      </section>

      {/* --- SPLIT SECTION --- */}
      <section className="py-32 bg-slate-50 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center gap-24">
          <div className="flex-1 max-w-xl">
            <h2 className="text-5xl font-extrabold text-slate-900 mb-8 leading-tight">
              Focus on Insights,<br />
              <span className="text-orange-600">Not Infrastructure</span>
            </h2>
            <p className="text-xl text-slate-500 mb-10 leading-relaxed font-light">
              Our AI handles the heavy lifting — from data cleaning to model selection. 
              You focus on what matters: understanding your data.
            </p>
            <ul className="space-y-6">
              <li className="flex items-center text-slate-800 font-bold text-lg"><IconCheck /> No coding required</li>
              <li className="flex items-center text-slate-800 font-bold text-lg"><IconCheck /> AI-assisted data cleaning</li>
              <li className="flex items-center text-slate-800 font-bold text-lg"><IconCheck /> Interactive visualizations</li>
              <li className="flex items-center text-slate-800 font-bold text-lg"><IconCheck /> Multiple ML algorithms</li>
              <li className="flex items-center text-slate-800 font-bold text-lg"><IconCheck /> Export results easily</li>
            </ul>
          </div>
          <div className="flex-1 w-full flex justify-center md:justify-end">
            <div className="relative w-full max-w-[600px] h-[450px] bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200 border border-slate-100/50">
               {/* Decorative Abstract UI */}
               <div className="absolute top-12 right-12 flex flex-col gap-4 items-end opacity-10">
                  <div className="w-32 h-4 bg-slate-900 rounded-full"></div>
                  <div className="w-20 h-4 bg-slate-900 rounded-full"></div>
               </div>
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full text-orange-600 bg-orange-50 p-8 rounded-[2rem] shadow-lg">
                  <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
               </div>
               <div className="absolute bottom-12 left-12 right-12 h-32 bg-slate-50/50 backdrop-blur-md rounded-3xl border border-slate-100"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- DOCUMENTATION SECTION (WIDE & INTERACTIVE) --- */}
      <section id="docs" className="py-32 bg-white relative">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-20">
            <span className="bg-slate-100 text-slate-600 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-200">Resources</span>
            <h2 className="text-5xl font-extrabold mt-8 text-slate-900 tracking-tight">Documentation</h2>
            <p className="text-slate-500 mt-6 max-w-2xl mx-auto text-xl font-light">Everything you need to get started and master DataFlow AI</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {docItems.map((item, i) => (
               <div key={i} onClick={handleCardClick} className="group flex items-start gap-6 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:border-orange-200 hover:shadow-2xl hover:-translate-y-2 cursor-pointer transition-all duration-500">
                  <div className="flex-shrink-0 w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
                    {React.cloneElement(item.icon, { className: "w-7 h-7" })}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors text-xl">{item.title}</h4>
                    <p className="text-base text-slate-500 leading-relaxed group-hover:text-slate-600">{item.desc}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-40 bg-white">
         <div className="max-w-5xl mx-auto text-center px-4 bg-gradient-to-br from-orange-50 to-white rounded-[3rem] p-16 border border-slate-100">
            <h2 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-10 tracking-tight">Ready to Get Started?</h2>
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Join thousands of data scientists who are building ML models faster with DataFlow AI.
            </p>
            <div className="flex justify-center gap-6">
              <Link to="/register" className="px-12 py-5 bg-orange-600 text-white text-xl font-bold rounded-2xl hover:bg-orange-700 transition shadow-2xl shadow-orange-200 hover:-translate-y-1">
                Create Free Account →
              </Link>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-orange-600 rounded-xl text-white flex items-center justify-center shadow-lg">
                 <Zap size={20} fill="currentColor" strokeWidth={0} />
             </div>
             <span className="font-bold text-slate-900 text-xl">DataFlow AI</span>
          </div>
          <div className="flex gap-10 text-base text-slate-500 font-medium">
             <a href="#" className="hover:text-orange-600 transition-colors">Documentation</a>
             <a href="#" className="hover:text-orange-600 transition-colors">Privacy</a>
             <a href="#" className="hover:text-orange-600 transition-colors">Terms</a>
          </div>
          <div className="text-base text-slate-400">
            © 2026 DataFlow AI. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;