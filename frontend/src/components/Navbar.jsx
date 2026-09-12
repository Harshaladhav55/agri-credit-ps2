import React from 'react';
import { ShieldCheck, Users, Landmark, TrendingUp, SlidersHorizontal, Leaf, LogOut, Database, Sun, Moon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout, theme, onToggleTheme }) {
  const allTabs = [
    { id: 'farmer', label: 'Farmer Data Vault', icon: Leaf, roles: ['farmer'] },
    { id: 'fpo', label: 'FPO Community Hub', icon: Users, roles: ['farmer', 'fpo'] },
    { id: 'bank', label: 'Bank Assessment Portal', icon: Landmark, roles: ['bank'] },
    { id: 'market', label: 'Govt & Market Analytics', icon: TrendingUp, roles: ['farmer', 'fpo', 'bank'] },
    { id: 'simulator', label: 'Credit Simulator', icon: SlidersHorizontal, roles: ['farmer', 'fpo', 'bank'] },
    { id: 'audit', label: 'Registered Accounts', icon: Database, roles: ['bank'] }
  ];

  const userRole = user?.role || 'farmer';
  const visibleTabs = allTabs.filter(tab => tab.roles.includes(userRole));
  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-50 border-b transition-colors shadow-md ${
      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-emerald-800/40 text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab(visibleTabs[0]?.id || 'farmer')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-md shadow-emerald-900/40">
              <ShieldCheck className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-extrabold text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  AgroLoan <span className="text-emerald-600">Trust</span>
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border hidden sm:inline-block ${
                  isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-950 text-emerald-300 border-emerald-700/50'
                }`}>
                  Building Trust, Enabling Credit
                </span>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex space-x-1 overflow-x-auto py-1">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile, Theme Toggle & Sign Out Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition-all ${
                isLight ? 'bg-slate-100 border-slate-300 text-amber-600 hover:bg-amber-50' : 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {user && (
              <div className={`hidden md:flex items-center space-x-2 border px-3 py-1 rounded-xl text-xs ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-white'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold">{user.name}</span>
                <span className="text-emerald-600 uppercase font-bold text-[10px]">({user.role})</span>
              </div>
            )}

            <button
              onClick={onLogout}
              className={`border text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                isLight
                  ? 'bg-slate-100 hover:bg-rose-50 border-slate-300 text-slate-700 hover:text-rose-700'
                  : 'bg-slate-800 hover:bg-rose-950 border-slate-700 text-slate-300 hover:text-rose-300'
              }`}
              title="Sign Out to Login Page"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
