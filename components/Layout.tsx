import React, { useState } from 'react';
import { LayoutDashboard, Calculator, Wallet, Menu, X, PieChart, PenTool, Bean, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, isDarkMode, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tracker', label: 'Income & Expenses', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'calculator', label: 'Financial Calculator', icon: Calculator },
    { id: 'tools', label: 'Tools & Settings', icon: PenTool },
  ];

  return (
    <div className={`flex h-screen font-sans overflow-hidden selection:bg-[#B38728] selection:text-white transition-colors duration-300 ${isDarkMode ? 'dark bg-[#020617]' : 'bg-gray-50'}`}>
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0F172A] dark:bg-black text-white shadow-2xl z-30 flex-shrink-0 border-r border-[#B38728]/30 transition-colors duration-300 relative">
        {/* Background Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

        <div className="p-8 flex items-center gap-4 border-b border-[#B38728]/20 relative overflow-hidden">
          {/* Gold Bean Logo (Shwe Pae) */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 flex items-center justify-center text-white shadow-[0_0_25px_rgba(251,191,36,0.6)] z-10 shrink-0 ring-1 ring-[#FCF6BA]/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <Bean size={26} strokeWidth={2.5} className="relative z-10 drop-shadow-md group-hover:scale-110 transition-transform duration-300 -rotate-45" />
          </div>
          <div className="z-10 min-w-0">
            <span className="text-2xl font-bold tracking-tight block bg-gold-text bg-clip-text text-transparent drop-shadow-sm">ShweBudget</span>
            <span className="text-[10px] text-[#B38728] font-bold tracking-[0.2em] uppercase">Premium</span>
          </div>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-3 relative z-10">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                activeTab === item.id
                  ? 'bg-gold-gradient text-[#0F172A] font-bold shadow-[0_4px_20px_rgba(212,175,55,0.3)] translate-x-1'
                  : 'text-gray-400 hover:bg-white/5 hover:text-[#FCD34D] hover:translate-x-1 border border-transparent hover:border-[#B38728]/20'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? "stroke-[2.5px]" : "stroke-[1.5px]"} />
              <span className="text-sm relative z-10 tracking-wide">{item.label}</span>
              {activeTab === item.id && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
            </button>
          ))}
        </nav>

        {/* Theme Toggle (Desktop) */}
        <div className="px-4 pb-4 relative z-10">
            <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-gray-400 hover:text-[#FCD34D] transition-all border border-[#B38728]/10 hover:border-[#B38728]/40 shadow-inner"
            >
                <span className="text-xs font-bold uppercase tracking-wider">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                {isDarkMode ? <Moon size={18} className="fill-current" /> : <Sun size={18} />}
            </button>
        </div>
        
        <div className="p-6 border-t border-[#B38728]/20 bg-[#020617]/50 backdrop-blur-sm relative z-10">
          <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Powered By</p>
            <a 
              href="https://web.facebook.com/PrimeNovaDigitalSolution" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-gold-text bg-clip-text text-transparent font-bold text-sm hover:scale-105 transition-transform"
            >
              PrimeNova Digital Solution
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0 transition-colors duration-300 bg-gray-50 dark:bg-[#020617]">
        <header className="md:hidden flex items-center justify-between p-4 bg-[#0F172A] dark:bg-black text-white shadow-md z-40 sticky top-0 flex-shrink-0 border-b border-[#B38728]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(251,191,36,0.5)] ring-1 ring-[#FCF6BA]/30">
              <Bean size={20} strokeWidth={2.5} className="drop-shadow-sm -rotate-45" />
            </div>
            <span className="font-bold text-lg bg-gold-text bg-clip-text text-transparent">ShweBudget</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-[#FCD34D]"
            >
                {isDarkMode ? <Moon size={22} className="fill-current"/> : <Sun size={22} />}
            </button>
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-[#FCD34D]"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 bg-[#0F172A] dark:bg-black z-30 pt-20 px-4 md:hidden animate-fade-in flex flex-col">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-gold-gradient text-[#0F172A] font-bold shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-[#FCD34D]'
                  }`}
                >
                  <item.icon size={24} />
                  <span className="text-lg">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-auto pb-8 text-center">
                 <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Powered By</p>
                <a 
                  href="https://web.facebook.com/PrimeNovaDigitalSolution" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gold-text bg-clip-text text-transparent font-bold block text-lg"
                >
                  PrimeNova Digital Solution
                </a>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-[#020617] relative scroll-smooth w-full transition-colors duration-300">
           {/* Decorative Background Elements - Luxury Theme */}
           <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#B38728]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none z-0 mix-blend-screen dark:mix-blend-lighten"></div>
           <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#1E293B]/20 dark:bg-black/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none z-0"></div>
           
           <div className="relative z-10 max-w-full mx-auto p-4 md:p-8 lg:p-10 pb-24">
             {children}
           </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;