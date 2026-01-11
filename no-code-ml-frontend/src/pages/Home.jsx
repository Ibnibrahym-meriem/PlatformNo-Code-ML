import React, { useEffect, useRef, useState } from 'react';
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
const IconBookLarge = () => (
  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25" />
  </svg>
);
const IconBookSmall = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25" />
  </svg>
);
const IconHistory = () => (
  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Hook pour détecter quand un élément entre dans le viewport avec un seuil ajusté
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // On ne déclenche l'animation qu'une seule fois
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { 
        threshold: 0.1, 
        // L'élément doit être à 100px du bas de l'écran pour déclencher
        rootMargin: '0px 0px -100px 0px' 
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isVisible];
};

const Home = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [navBg, setNavBg] = useState(false);

  // Gestion du scroll pour la navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setNavBg(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCardClick = () => {
    navigate('/register');
  };

  const docItems = [
    { title: "Getting Started", desc: "Learn the basics and start your first ML project", icon: <IconBookSmall /> },
    { title: "Data Import Guide", desc: "How to import data from various sources", icon: <IconDatabase /> },
    { title: "EDA & Visualization", desc: "Explore your data with interactive charts", icon: <IconChart /> },
    { title: "Data Lab", desc: "Clean and preprocess your data with AI tools", icon: <IconSparkles /> },
    { title: "Model Training", desc: "Configure and train ML models", icon: <IconChip /> },
    { title: "Results & Export", desc: "Evaluate performance and deploy models", icon: <IconResult /> },
  ];

  // Refs pour animations scroll
  const [featuresRef, featuresVisible] = useScrollAnimation();
  const [splitRef, splitVisible] = useScrollAnimation();
  const [docsRef, docsVisible] = useScrollAnimation();
  const [ctaRef, ctaVisible] = useScrollAnimation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50 font-sans text-slate-900 selection:bg-orange-100 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        navBg 
          ? 'bg-white/95 backdrop-blur-2xl shadow-lg shadow-slate-100/50 border-b border-slate-200/50' 
          : 'bg-white/60 backdrop-blur-xl border-b border-slate-100/30'
      }`}>
        <div className="flex justify-between items-center px-8 py-5 max-w-[1600px] mx-auto w-full">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl text-white flex items-center justify-center shadow-lg shadow-orange-200/50 group-hover:shadow-xl group-hover:shadow-orange-300/60 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Zap size={20} fill="currentColor" strokeWidth={0} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors duration-300">DataFlow </span>
          </div>
          
          <div className="hidden md:flex gap-10 text-slate-600 font-medium text-sm tracking-wide">
            <a href="#features" className="hover:text-orange-600 transition-all duration-300 relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#docs" className="hover:text-orange-600 transition-all duration-300 relative group">
              Documentation
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

          <div className="flex gap-4">
            <Link to="/login" className="px-6 py-2.5 text-slate-600 font-semibold hover:text-orange-600 text-sm transition-all duration-300 hover:scale-105">
              Sign In
            </Link>
            <Link to="/register" className="px-7 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-500 transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-orange-500/30 text-sm hover:scale-105 hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="min-h-[90vh] flex flex-col justify-center items-center text-center px-4 max-w-6xl mx-auto pt-20 relative">
        {/* Gradient décoratif animé */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-orange-100/40 via-orange-50/30 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" style={{animationDuration: '4s'}}></div>
        
        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{animationDelay: '100ms', animationFillMode: 'both'}}>
          
          {/* BADGE SUPPRIMÉ ICI */}
          
          <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 mb-8 leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{animationDelay: '300ms', animationFillMode: 'both'}}>
            Build Machine Learning <br />
            Models <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 animate-gradient">Without Code</span>
          </h1>
          
          <p className="text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-6 duration-1000" style={{animationDelay: '400ms', animationFillMode: 'both'}}>
            From data ingestion to model training — automate your ML —  Clean, explore, and train models in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center w-full animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{animationDelay: '500ms', animationFillMode: 'both'}}>
            <Link to="/register" className="group px-10 py-5 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-lg font-bold rounded-2xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-2xl shadow-orange-300/40 hover:shadow-2xl hover:shadow-orange-400/50 hover:-translate-y-1 hover:scale-105 relative overflow-hidden">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Free
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <button className="group px-10 py-5 bg-white text-slate-700 text-lg font-bold rounded-2xl border-2 border-slate-200 hover:bg-slate-50 hover:border-orange-300 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-orange-200/30 hover:-translate-y-1">
              <span className="text-orange-600 group-hover:scale-110 transition-transform duration-300">▷</span> 
              Watch Demo
            </button>
          </div>
        </div>

        {/* Floating elements décoratifs */}
        <div className="absolute bottom-20 left-10 w-20 h-20 bg-gradient-to-br from-orange-200/30 to-orange-100/20 rounded-2xl rotate-12 blur-xl animate-float" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-slate-200/30 to-slate-100/20 rounded-3xl -rotate-12 blur-xl animate-float" style={{animationDelay: '1s'}}></div>
      </header>

      {/* --- FEATURES GRID (Animé au scroll) --- */}
      <section id="features" ref={featuresRef} className="py-32 bg-white relative overflow-hidden">
        {/* Gradient de fond */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-orange-50/60 via-orange-50/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className={`max-w-[1600px] mx-auto px-6 relative z-10 transition-all duration-1000 ease-out transform ${
          featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          <div className="text-center mb-20">
            <div className="inline-block px-5 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-200 mb-6 shadow-sm">
              Platform
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">Platform Capabilities</h2>
            <p className="text-slate-500 mt-6 text-xl font-light max-w-2xl mx-auto">Everything you need to master your data and build intelligent models</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            
            {[
              { icon: <IconBookLarge />, title: "Documentation", desc: "Comprehensive guides, tutorials, and API references to master the platform.", delay: 0 },
              { icon: <IconDatabase />, title: "Data Ingestion", desc: "Import datasets from CSV, Kaggle, or external URLs securely and instantly.", delay: 100 },
              { icon: <IconChart />, title: "Visual Exploration", desc: "Discover patterns with interactive charts and AI-driven analysis tools.", delay: 200 },
              { icon: <IconSparkles />, title: "Data Lab", desc: "Automatically clean, normalize, fill missing values and fix quality.", delay: 0 },
              { icon: <IconChip />, title: "Model Training", desc: "Train advanced machine learning models (RF, SVM, XGB) with one click.", delay: 100 },
              { icon: <IconResult />, title: "Results", desc: "Evaluate performance metrics, compare models and export reports.", delay: 200 },
              { icon: <IconHistory />, title: "History", desc: "Track your experiments, compare model versions, and audit past runs.", delay: 0 },
            ].map((item, idx) => (
              <div 
                key={idx}
                onClick={handleCardClick}
                className={`group flex-1 min-w-[320px] max-w-[400px] bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(234,88,12,0.15)] hover:border-orange-200/60 hover:-translate-y-3 transition-all duration-700 ease-out cursor-pointer relative overflow-hidden backdrop-blur-sm ${
                  featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
                style={{
                  transitionDelay: featuresVisible ? `${item.delay}ms` : '0ms'
                }}
              >
                {/* Gradient hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 via-orange-50/0 to-orange-100/0 group-hover:from-orange-50/40 group-hover:via-orange-50/20 group-hover:to-transparent transition-all duration-500 rounded-[2.5rem]"></div>
                
                {/* Background icon décoratif */}
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-[0.06] transition-all duration-500 text-orange-600 group-hover:scale-110 group-hover:rotate-6">
                  {item.icon}
                </div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100/50 text-slate-400 rounded-3xl flex items-center justify-center mb-8 group-hover:from-orange-600 group-hover:to-orange-500 group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-lg group-hover:shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-3">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-orange-600 transition-colors duration-300">{item.title}</h3>
                  <p className="text-slate-500 text-base leading-relaxed group-hover:text-slate-600 transition-colors duration-300">{item.desc}</p>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* --- SPLIT SECTION (Animé au scroll) --- */}
      <section ref={splitRef} className="py-32 bg-gradient-to-b from-slate-50 to-white overflow-hidden relative">
        {/* Éléments décoratifs */}
        <div className="absolute top-20 left-0 w-72 h-72 bg-orange-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-slate-100/40 rounded-full blur-3xl"></div>

        <div className={`max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center gap-24 relative z-10 transition-all duration-1000 ease-out transform ${
          splitVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          <div className="flex-1 max-w-xl">
            <div className="inline-block px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-200/50 mb-6 shadow-sm">
              Why Choose Us
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-8 leading-[1.15] tracking-tight">
              Focus on Insights,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">Not Infrastructure</span>
            </h2>
            <p className="text-xl text-slate-500 mb-12 leading-relaxed font-light">
              Our AI handles the heavy lifting — from data cleaning to model selection. 
              You focus on what matters: understanding your data.
            </p>
            <ul className="space-y-6">
              {[
                "No coding required",
                "AI-assisted data cleaning",
                "Interactive visualizations",
                "Multiple ML algorithms",
                "Export results easily"
              ].map((item, idx) => (
                <li 
                  key={idx}
                  className={`flex items-center text-slate-800 font-semibold text-lg group hover:translate-x-2 transition-all duration-500 ease-out ${
                    splitVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                  }`}
                  style={{transitionDelay: splitVisible ? `${idx * 150}ms` : '0ms'}}
                >
                  <div className="mr-4 flex-shrink-0 w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors duration-300">
                    <IconCheck />
                  </div>
                  <span className="group-hover:text-orange-600 transition-colors duration-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex-1 w-full flex justify-center md:justify-end">
            <div className={`relative w-full max-w-[600px] h-[450px] bg-gradient-to-br from-white to-slate-50 rounded-[3rem] p-12 shadow-2xl shadow-slate-300/40 border border-slate-200/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-orange-200/30 transition-all duration-1000 ease-out delay-200 group transform ${
               splitVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-20'
            }`}>
              {/* Decorative elements */}
              <div className="absolute top-12 right-12 flex flex-col gap-4 items-end opacity-[0.06] group-hover:opacity-[0.08] transition-opacity duration-500">
                <div className="w-32 h-4 bg-slate-900 rounded-full"></div>
                <div className="w-20 h-4 bg-slate-900 rounded-full"></div>
              </div>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full text-orange-600 bg-gradient-to-br from-orange-50 to-orange-100/50 p-10 rounded-[2rem] shadow-xl shadow-orange-200/40 backdrop-blur-sm group-hover:scale-105 group-hover:rotate-2 transition-all duration-500">
                <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              
              <div className="absolute bottom-12 left-12 right-12 h-32 bg-slate-50/70 backdrop-blur-md rounded-3xl border border-slate-100 shadow-lg group-hover:bg-white/80 transition-all duration-500"></div>
              
              {/* Floating dots */}
              <div className="absolute top-24 left-16 w-3 h-3 bg-orange-400 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-32 right-20 w-2 h-2 bg-slate-400 rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- DOCUMENTATION SECTION (Animé au scroll) --- */}
      <section id="docs" ref={docsRef} className="py-32 bg-white relative overflow-hidden">
        {/* Gradient décoratif */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-orange-50/40 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className={`max-w-[1400px] mx-auto px-6 relative z-10 transition-all duration-1000 ease-out transform ${
          docsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          <div className="text-center mb-20">
            <span className="inline-block bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-200 shadow-sm">
              Resources
            </span>
            <h2 className="text-5xl md:text-6xl font-extrabold mt-8 text-slate-900 tracking-tight">Documentation</h2>
            <p className="text-slate-500 mt-6 max-w-2xl mx-auto text-xl font-light">Everything you need to get started and master DataFlow AI</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {docItems.map((item, i) => (
              <div 
                key={i} 
                onClick={handleCardClick}
                className={`group flex items-start gap-6 p-8 bg-gradient-to-br from-white to-slate-50/30 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/50 hover:border-orange-200/60 hover:shadow-2xl hover:shadow-orange-200/40 hover:-translate-y-3 cursor-pointer transition-all duration-700 ease-out relative overflow-hidden ${
                  docsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
                style={{transitionDelay: docsVisible ? `${i * 100}ms` : '0ms'}}
              >
                {/* Gradient hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-50/0 group-hover:from-orange-50/30 group-hover:to-transparent transition-all duration-500 rounded-[2rem]"></div>
                
                <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100/50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:from-orange-600 group-hover:to-orange-500 group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-lg group-hover:shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-3">
                  {React.cloneElement(item.icon, { className: "w-8 h-8" })}
                </div>
                
                <div className="relative z-10 flex-1">
                  <h4 className="font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors duration-300 text-xl">{item.title}</h4>
                  <p className="text-base text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors duration-300">{item.desc}</p>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION (Animé au scroll) --- */}
      <section ref={ctaRef} className="py-40 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-orange-100/20 via-orange-50/30 to-orange-100/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className={`max-w-5xl mx-auto text-center px-4 relative z-10 transition-all duration-1000 ease-out transform ${
          ctaVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-20'
        }`}>
          <div className="bg-gradient-to-br from-white via-orange-50/30 to-white rounded-[3rem] p-16 border border-orange-100/50 shadow-2xl shadow-orange-200/30 backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-orange-300/40 transition-all duration-500">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 via-orange-50/20 to-orange-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            {/* Floating decorative elements */}
            <div className="absolute top-8 right-8 w-24 h-24 bg-orange-200/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-8 left-8 w-32 h-32 bg-slate-200/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="inline-block px-5 py-2 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-200 mb-8 shadow-sm">
                Get Started Today
              </div>
              
              <h2 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-10 tracking-tight leading-[1.1]">
                Ready to Get Started?
              </h2>
              
              <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                Join thousands of data scientists who are building ML models faster with DataFlow .
              </p>
              
              <div className="flex justify-center gap-6">
                <Link to="/register" className="group px-12 py-5 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-xl font-bold rounded-2xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-2xl shadow-orange-300/50 hover:shadow-2xl hover:shadow-orange-400/60 hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Create Free Account
                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gradient-to-b from-white to-slate-50 py-16 border-t border-slate-100">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl text-white flex items-center justify-center shadow-lg shadow-orange-200/50 group-hover:shadow-xl group-hover:shadow-orange-300/60 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Zap size={22} fill="currentColor" strokeWidth={0} />
            </div>
            <span className="font-bold text-slate-900 text-xl group-hover:text-orange-600 transition-colors duration-300">DataFlow AI</span>
          </div>
          
          <div className="flex gap-10 text-base text-slate-500 font-medium">
            <a href="#" className="hover:text-orange-600 transition-all duration-300 relative group">
              Documentation
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#" className="hover:text-orange-600 transition-all duration-300 relative group">
              Privacy
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#" className="hover:text-orange-600 transition-all duration-300 relative group">
              Terms
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>
          
          <div className="text-base text-slate-400 font-light">
            © 2026 DataFlow AI. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in-from-bottom-4 {
          from { transform: translateY(1rem); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slide-in-from-bottom-6 {
          from { transform: translateY(1.5rem); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slide-in-from-bottom-8 {
          from { transform: translateY(2rem); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .fade-in {
          animation-name: fade-in;
        }
        
        .slide-in-from-bottom-4 {
          animation-name: slide-in-from-bottom-4;
        }
        
        .slide-in-from-bottom-6 {
          animation-name: slide-in-from-bottom-6;
        }
        
        .slide-in-from-bottom-8 {
          animation-name: slide-in-from-bottom-8;
        }
        
        .duration-700 {
          animation-duration: 700ms;
        }
        
        .duration-1000 {
          animation-duration: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default Home;