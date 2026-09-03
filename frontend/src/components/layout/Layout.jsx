import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, Sparkles } from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#030014] text-slate-200 overflow-hidden relative selection:bg-purple-500/30 selection:text-white">
      {/* Aurora Ambient Backgrounds */}
      <div className="aurora-bg">
        <div className="aurora-orb orb-1" />
        <div className="aurora-orb orb-2" />
        <div className="aurora-orb orb-3" />
        <div className="absolute inset-0 glass-grid opacity-30" />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-md lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Mobile Header */}
        <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20 lg:hidden">
          <div className="flex items-center px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-white focus:outline-none transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="ml-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="font-bold text-lg text-white tracking-tight">FinTrack</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
