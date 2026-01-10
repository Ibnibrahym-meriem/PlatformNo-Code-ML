import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Database, 
  BarChart2, 
  FlaskConical, 
  Cpu, 
  Trophy, 
  LogOut, 
  BrainCircuit 
} from 'lucide-react';

// --- CONFIGURATION DU HEADER PAR ROUTE ---
const pageDetails = {
  '/documentation': { title: 'Documentation', subtitle: 'User Guide & API Reference' },
  '/ingestion': { title: 'Data Ingestion', subtitle: 'Import your data' },
  '/visualization': { title: 'Exploration', subtitle: 'Visualize patterns' },
  '/lab': { title: 'Data Lab', subtitle: 'Clean & preprocess' },
  '/training': { title: 'Model Training', subtitle: 'Train your model' },
  '/results': { title: 'Results', subtitle: 'View performance' },
};

const Layout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const currentInfo = pageDetails[location.pathname] || { title: 'ML Studio', subtitle: 'No-Code Platform' };

  // --- MENU CONFIG ---
  const menuItems = [
    { path: '/documentation', label: 'Documentation', sub: 'Guide users', icon: BookOpen },
    { path: '/ingestion', label: 'Data Ingestion', sub: 'Import your data', icon: Database },
    { path: '/visualization', label: 'Exploration', sub: 'Visualize patterns', icon: BarChart2 },
    { path: '/lab', label: 'Data Lab', sub: 'Clean & preprocess', icon: FlaskConical },
    { path: '/training', label: 'Model Training', sub: 'Train your model', icon: Cpu },
    { path: '/results', label: 'Results', sub: 'View performance', icon: Trophy },
  ];

  // Composant Menu Item (Version Agrandie)
  const NavItem = ({ item }) => {
    const isActive = location.pathname.startsWith(item.path);
    const Icon = item.icon;

    return (
      <Link to={item.path} className="block mb-3 px-4">
        <div 
          className={`
            group flex items-center gap-5 p-4 rounded-2xl transition-all duration-300 ease-out
            ${isActive 
              ? 'bg-orange-50 border border-orange-100 shadow-sm' 
              : 'bg-transparent border border-transparent hover:bg-gray-50' 
            }
          `}
        >
          {/* Icône */}
          <div className={`
             w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300
             ${isActive 
               ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' 
               : 'bg-white text-gray-400 border border-gray-100 group-hover:border-gray-200 group-hover:text-gray-600 shadow-sm' 
             }
          `}>
             <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
          </div>

          <div className="flex flex-col">
            {/* 
                MODIFICATION ICI : 
                - Remplacement de text-gray-900 par text-gray-700 (Gris foncé au lieu de noir)
                - Remplacement de font-extrabold par font-bold (Moins gras)
            */}
            <span className={`text-[16px] leading-tight transition-colors duration-200 
              ${isActive 
                ? 'font-bold text-gray-700' // Actif : Gris foncé et gras (pas extra gras)
                : 'font-semibold text-gray-500 group-hover:text-gray-700' // Inactif : Gris moyen, devient gris foncé au survol
              }
            `}>
              {item.label}
            </span>
            
            <span className={`text-[12px] leading-tight mt-1 transition-colors duration-200 ${isActive ? 'text-orange-600 font-medium' : 'text-gray-400 group-hover:text-gray-500'}`}>
              {item.sub}
            </span>
          </div>
          
          {isActive && (
            <div className="ml-auto w-2 h-2 rounded-full bg-orange-500 shadow-orange-200 shadow-lg"></div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans antialiased">
      
      {/* SIDEBAR */}
      <aside className="w-[320px] bg-white/90 backdrop-blur-xl border-r border-gray-200/60 flex flex-col fixed h-full z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        {/* LOGO */}
        <div className="h-28 flex items-center px-10 border-b border-gray-100">
          <div className="flex items-center gap-4 cursor-pointer group">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 transition-transform group-hover:scale-105">
               <BrainCircuit size={28} />
            </div>
            <div className="flex flex-col">
              <h1 className="font-black text-[20px] text-gray-900 leading-none tracking-tight">ML Studio</h1>
              <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mt-1.5">No-Code</span>
            </div>
          </div>
        </div>

        {/* MENU */}
        <div className="flex-1 py-4 px-1 overflow-y-auto custom-scroll space-y-1">
          {menuItems.map((item) => <NavItem key={item.path} item={item} />)}
        </div>

        {/* USER PROFILE & LOGOUT */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/30">
           <div className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
              
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-600 text-white flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-white">
                    {user?.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <div className="flex-col hidden sm:flex">
                    <p className="text-sm font-bold text-gray-900 leading-tight">Account</p>
                    <p className="text-[11px] text-gray-400 font-medium truncate max-w-[100px]" title={user?.email}>{user?.email || 'user'}</p>
                  </div>
              </div>

              <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>

              <button 
                onClick={logout} 
                className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border hover:border-red-100 transition-all group"
                title="Logout"
              >
                <LogOut size={20} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>

           </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="ml-[320px] flex-1 flex flex-col min-h-screen relative">
        
        {/* HEADER */}
        <header className="h-28 px-14 flex items-center justify-between sticky top-0 z-40 bg-[#F8F9FA]/90 backdrop-blur-md">
           <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h2 className="text-2xl font-bold text-gray-600 tracking-tight">{currentInfo.title}</h2>
              <p className="text-sm text-gray-400 font-medium mt-1">{currentInfo.subtitle}</p>
           </div>
        </header>

        {/* CONTENU */}
        <main className="flex-1 px-14 pb-14">
           <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
             <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;