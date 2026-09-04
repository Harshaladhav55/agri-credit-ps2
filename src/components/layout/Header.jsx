import React from 'react';
import { useLearning } from '../../context/LearningContext';
import NavigationMenuDemo from '../ui/navigation-menu-demo';
import { Sparkles, Search, Bot, LayoutDashboard, Target, Sliders, LogOut } from 'lucide-react';

export const Header = () => {
  const { currentUser, activeTab, setActiveTab, setIsProfilerOpen, logout } = useLearning();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      
      {/* Top Navigation Menu Bar */}
      <NavigationMenuDemo />

      {/* Main Pathcraft Navigation Tabs */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 py-1.5">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                activeTab === 'roadmap'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Learning Path</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-assistant')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all relative ${
                activeTab === 'ai-assistant'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Path Assistant</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600"></span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Skill & Progress Dashboard</span>
            </button>
          </nav>

          <div className="hidden lg:flex items-center space-x-3 text-xs text-slate-600 font-medium">
            <button
              onClick={() => setIsProfilerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold flex items-center space-x-1.5 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-600" />
              <span>Adapt Preferences</span>
            </button>

            {currentUser && (
              <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
                <img 
                  className="w-8 h-8 rounded-full ring-2 ring-sky-500/40 object-cover" 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                />
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
};
