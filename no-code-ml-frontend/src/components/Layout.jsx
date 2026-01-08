import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- CONFIGURATION DU HEADER PAR ROUTE ---
const pageDetails = {
  '/documentation': { title: 'Documentation', subtitle: 'User Guide & API Reference' }, // ✅ CORRIGÉ ICI
  '/ingestion': { title: 'Data Ingestion', subtitle: 'Import your data' },
  '/visualization': { title: 'Exploration', subtitle: 'Visualize patterns' },
  '/lab': { title: 'Data Lab', subtitle: 'Clean & preprocess' },
  '/training': { title: 'Model Training', subtitle: 'Train your model' },
  '/results': { title: 'Results', subtitle: 'View performance' },
  '/history': { title: 'History', subtitle: 'Track experiments' },
};

// --- ICÔNES MINIMALISTES ---
const Icons = {
  Brain: () => <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />,
  Database: () => <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />,
  Chart: () => <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
  Beaker: () => <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  Chip: () => <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />,
  Trophy: () => <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172V5.25a3 3 0 016 0v2.906a7.454 7.454 0 01-.982 3.172m-6.83 0a7.454 7.454 0 01-.982-3.172V5.25a3 3 0 016 0v2.906a7.454 7.454 0 01-.982 3.172M9 4.5h6a3 3 0 013 3v2.871a7.454 7.454 0 01-1.353 4.293C15.936 15.688 14.28 16.5 12 16.5s-3.936-.812-4.647-1.836A7.454 7.454 0 016 10.371V7.5a3 3 0 013-3z" />,
  Clock: () => <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
  Doc: () => <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
};

const Layout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const currentInfo = pageDetails[location.pathname] || { title: 'Dashboard', subtitle: 'Overview' };

  // --- MENU CONFIG ---
  const menuItems = [
    // ✅ CORRIGÉ ICI (path: '/documentation')
    { path: '/documentation', label: 'Documentation', sub: 'Guide & API', Icon: Icons.Doc },
    { path: '/ingestion', label: 'Data Ingestion', sub: 'Import your data', Icon: Icons.Database },
    { path: '/visualization', label: 'Exploration', sub: 'Visualize patterns', Icon: Icons.Chart },
    { path: '/lab', label: 'Data Lab', sub: 'Clean & preprocess', Icon: Icons.Beaker },
    { path: '/training', label: 'Model Training', sub: 'Train your model', Icon: Icons.Chip },
    { path: '/results', label: 'Results', sub: 'View performance', Icon: Icons.Trophy },
    { path: '/history', label: 'History', sub: 'Track experiments', Icon: Icons.Clock },
  ];

  // Composant Menu Item
  const NavItem = ({ item }) => {
    const isActive = location.pathname.startsWith(item.path);

    return (
      <Link to={item.path} className="block mb-2 px-2">
        <div 
          className={`
            group flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 ease-in-out border
            ${isActive 
              ? 'bg-[#FFF0E6] border-[#FFF0E6]' 
              : 'bg-transparent border-transparent hover:bg-gray-50' 
            }
          `}
        >
          <div className={`
             w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
             ${isActive 
               ? 'bg-[#EA580C] text-white shadow-md shadow-orange-200' 
               : 'bg-gray-200 text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-gray-500' 
             }
          `}>
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2 : 2}>
               <item.Icon />
             </svg>
          </div>

          <div className="flex flex-col">
            <span className={`text-[15px] leading-tight transition-colors duration-200 ${isActive ? 'font-bold text-[#EA580C]' : 'font-medium text-gray-500 group-hover:text-gray-800'}`}>
              {item.label}
            </span>
            <span className={`text-[11px] leading-tight mt-0.5 transition-colors duration-200 ${isActive ? 'text-gray-800 font-medium' : 'text-gray-400 group-hover:text-gray-500'}`}>
              {item.sub}
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-sans antialiased selection:bg-orange-100 selection:text-orange-900">
      
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-white border-r border-gray-100 flex flex-col fixed h-full z-40 shadow-[2px_0_20px_rgba(0,0,0,0.015)]">
        
        {/* LOGO */}
        <div className="h-24 flex items-center px-6 border-b border-gray-50">
          <div className="flex items-center gap-3.5 cursor-pointer">
            <div className="w-11 h-11 bg-[#4338ca] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <Icons.Brain />
               </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-[17px] text-gray-900 leading-tight">ML Studio</h1>
              <p className="text-[11px] font-medium text-gray-400">No-Code Platform</p>
            </div>
          </div>
        </div>

        {/* MENU */}
        <div className="flex-1 py-8 px-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => <NavItem key={item.path} item={item} />)}
        </div>

        {/* USER PROFILE */}
        <div className="p-4 border-t border-gray-50">
           <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100/50 hover:bg-gray-100 transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 text-white flex items-center justify-center font-bold text-xs shadow-md">
                {user?.email?.[0].toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800">My Account</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email || 'user@example.com'}</p>
              </div>
              <button onClick={logout} className="text-gray-300 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="ml-[280px] flex-1 flex flex-col min-h-screen">
        
        {/* HEADER */}
        <header className="h-20 px-10 flex items-center justify-between sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
           <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{currentInfo.title}</h2>
              <p className="text-sm text-gray-500 font-medium mt-0.5">{currentInfo.subtitle}</p>
           </div>

           <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg shadow-gray-900/10 hover:bg-black transition-all text-sm">
                <span className="text-lg leading-none mb-0.5">+</span> New Project
              </button>
           </div>
        </header>

        <main className="flex-1 p-10 bg-[#fbfbfb]">
           <div className="max-w-[1600px] mx-auto animate-fadeIn">
             <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;