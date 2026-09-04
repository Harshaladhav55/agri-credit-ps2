import React from 'react';
import { LearningProvider, useLearning } from './context/LearningContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { ProfileSetupModal } from './components/onboarding/ProfileSetupModal';
import { RoadmapView } from './components/path/RoadmapView';
import { AIAssistantPanel } from './components/ai/AIAssistantPanel';
import { ProgressDashboard } from './components/dashboard/ProgressDashboard';
import { Sparkles } from 'lucide-react';

const MainAppContent = () => {
  const { currentUser, activeTab } = useLearning();

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-sky-600 selection:text-white">
      {/* Header Bar */}
      <Header />

      {/* Profiler / AI Config Modal */}
      <ProfileSetupModal />

      {/* Active Tab View */}
      <main className="flex-1">
        {activeTab === 'roadmap' && <RoadmapView />}
        {activeTab === 'ai-assistant' && <AIAssistantPanel />}
        {activeTab === 'dashboard' && <ProgressDashboard />}
      </main>

      {/* Pathcraft AI Footer */}
      <footer className="bg-white border-t border-slate-200 text-xs text-slate-500 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-slate-900">
              Pathcraft <span className="text-sky-600 font-normal">AI</span>
            </span>
            <span>© 2026 Pathcraft AI Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-6 font-medium">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-900 transition-colors">AI Transparency Report</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Help Center</a>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <LearningProvider>
      <MainAppContent />
    </LearningProvider>
  );
}
