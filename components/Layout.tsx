
import React, { useState } from 'react';
import { LayoutDashboard, Calculator, Wallet, Menu, X, PieChart, PenTool, Moon, Sun, User, ChevronRight, LogIn, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  // Auth Props
  user: UserProfile | null; // Firebase User
  onLogin: () => void;
  onLogout: () => void;
}

// Custom Premium Gold Coin (Round) Logo
const GoldCoinLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="coinGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="25%" stopColor="#FCD34D" />
        <stop offset="50%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <linearGradient id="innerGrad" x1="18" y1="18" x2="6" y2="6" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#B45309" />
        <stop offset="40%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#FEF3C7" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    
    {/* Outer Edge */}
    <circle cx="12" cy="12" r="11" fill="url(#coinGrad)" stroke="#92400E" strokeWidth="0.5"/>
    
    {/* Detailed Rim */}
    <circle cx="12" cy="12" r="9" fill="none" stroke="#FFFBEB" strokeWidth="0.5" strokeOpacity="0.5" strokeDasharray="0.5 1"/>
    
    {/* Inner Core */}
    <circle cx="12" cy="12" r="7.5" fill="url(#innerGrad)" stroke="#78350F" strokeWidth="0.2" />
    
    {/* 'S' Monogram */}
    <text x="12" y="15.5" fontSize="11" fontWeight="900" fontFamily="serif" textAnchor="middle" fill="#78350F" style={{ textShadow: '0px 1px 0px rgba(255,255,255,0.4)' }}>S</text>
    
    {/* Shine Reflection */}
    <path d="M8 6C8 6 10 4 12 4C14 4 16 6 16 6" stroke="white" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />
  </svg>
);

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  toggleTheme,
  user,
  onLogin,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tracker', label: 'Income & Expenses', icon: Wallet },
    { id: 'analytics', label: 'Analytics & Budgets', icon: PieChart },
    { id: 'calculator', label: 'Financial Calculator', icon: Calculator },
    { id: 'tools', label: 'Tools & Backup', icon: PenTool },
  ];

  return (
    <div className={`flex h-screen font-sans overflow-hidden selection:bg-[#B38728] selection:text-white transition-colors duration-300 ${isDarkMode ? 'dark bg-[#020617]' : 'bg-gray-50'}`}>
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0F172A] dark:bg-black text-white shadow-2xl z-30 flex-shrink-0 border-r border-[#B38728]/30 transition-colors duration-300 relative h-screen">
        {/* Background Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

        <div className="p-8 flex items-center gap-4 border-b border-[#B38728]/20 relative overflow-hidden group flex-shrink-0">
          {/* Logo Container */}
          <div className="relative w-14 h-14 flex-shrink-0">
             {/* Subtle Back Glow */}
             <div className="absolute inset-0 bg-[#B38728] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
             
             {/* Icon */}
             <div className="relative z-10 w-full h-full flex items-center justify-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105 group-hover:rotate-12">
                <GoldCoinLogo className="w-full h-full drop-shadow-lg" />
             </div>
          </div>

          <div className="z-10 min-w-0 flex flex-col justify-center">
            <span className="text-2xl font-bold tracking-tight block bg-gold-text bg-clip-text text-transparent drop-shadow-sm font-sans">ShweBudget</span>
            <span className="text-[10px] text-[#B38728] font-bold tracking-[0.3em] uppercase pl-0.5">Premium</span>
          </div>
        </div>
        
        {/* Navigation - Takes available space */}
        <nav className="flex-1 py-6 px-4 space-y-2 relative z-10 overflow-y-auto">
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
              <div className="flex items-center justify-center w-6 h-6">
                 <item.icon size={22} className={`${activeTab === item.id ? "stroke-[2.5px]" : "stroke-[1.5px]"}`} />
              </div>
              <span className="text-sm relative z-10 tracking-wide leading-none pt-0.5">{item.label}</span>
              {activeTab === item.id && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
            </button>
          ))}
        </nav>

        {/* Bottom Section: Auth + Theme + Footer */}
        <div className="relative z-20 mt-auto bg-[#020617]/50 backdrop-blur-md border-t border-[#B38728]/20">
            
            <div className="px-4 pt-4 space-y-3">
                {/* Auth Button */}
                {user ? (
                <div className="relative">
                    <button 
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                    >
                        <div className="w-9 h-9 rounded-full bg-gold-gradient p-[2px] flex-shrink-0">
                            <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center overflow-hidden">
                                <span className="text-[#FCD34D] font-bold text-sm">{user.name.charAt(0)}</span>
                            </div>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <p className="text-[10px] text-green-400 uppercase tracking-wider font-bold">● Online</p>
                            <p className="font-bold text-xs text-white truncate">{user.name}</p>
                        </div>
                        <ChevronRight size={14} className={`text-gray-500 transition-transform ${isProfileMenuOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {isProfileMenuOpen && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-[#1E293B] border border-[#B38728]/30 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                            <div className="p-2">
                                <button 
                                    onClick={onLogout}
                                    className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-red-400 hover:bg-white/5 font-bold"
                                >
                                    <LogOut size={14} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                ) : (
                    <button 
                        onClick={onLogin}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-white text-[#0F172A] hover:bg-gray-200 font-bold rounded-xl transition-all shadow-md text-xs"
                    >
                        <LogIn size={16} />
                        Sign In with Google
                    </button>
                )}

                {/* Theme Toggle */}
                <button 
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-gray-400 hover:text-[#FCD34D] transition-all border border-[#B38728]/10 hover:border-[#B38728]/40 shadow-inner"
                >
                    <span className="text-[10px] font-bold uppercase tracking-wider">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                    {isDarkMode ? <Moon size={16} className="fill-current" /> : <Sun size={16} />}
                </button>
            </div>

            {/* Footer Credit */}
            <div className="p-4 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Powered By</p>
                <a 
                href="https://web.facebook.com/PrimeNovaDigitalSolution" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-gold-text bg-clip-text text-transparent font-bold text-xs hover:scale-105 transition-transform"
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
             <div className="relative w-10 h-10">
                <GoldCoinLogo className="w-full h-full drop-shadow-md" />
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
            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                {user ? (
                   /* Mobile User View */
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-[#0F172A] font-bold">
                            {user.name.charAt(0)}
                         </div>
                         <div>
                            <p className="text-xs text-green-400 font-bold">● Online</p>
                            <span className="font-bold text-white">{user.name}</span>
                         </div>
                      </div>
                      <button 
                         onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                         className="text-xs bg-red-600/20 text-red-400 border border-red-600/50 px-3 py-1.5 rounded-lg font-bold"
                      >
                         Sign Out
                      </button>
                   </div>
                ) : (
                    /* Mobile Guest View */
                    <div className="space-y-3">
                       <div className="flex items-center justify-between text-gray-300">
                          <div className="flex items-center gap-2">
                             <User size={18} />
                             <span className="font-bold">Guest Mode</span>
                          </div>
                       </div>
                       <button 
                         onClick={() => { onLogin(); setIsMobileMenuOpen(false); }}
                         className="w-full flex items-center justify-center gap-2 py-2 bg-white text-[#0F172A] rounded-lg font-bold text-sm"
                      >
                         <LogIn size={16} />
                         Sign In with Google
                      </button>
                    </div>
                )}
            </div>

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
