import React, { useState } from 'react';
import { useLearning } from '../../context/LearningContext';
import { ResourceCard } from './ResourceCard';
import { LiquidButton } from '../ui/liquid-glass-button';
import { Sparkles, Target, Clock, CheckCircle2, Sliders, AlertCircle, ArrowRight, BookOpen, Layers, Zap } from 'lucide-react';

export const RoadmapView = () => {
  const { activeRoadmap, currentUser, setIsProfilerOpen, generateNewGoalPath, setActiveTab } = useLearning();
  const [customGoalInput, setCustomGoalInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!activeRoadmap) return null;

  const handleCustomGoalSubmit = (e) => {
    e.preventDefault();
    if (!customGoalInput.trim()) {
      setErrorMsg('Please describe a learning goal or target skill.');
      return;
    }
    if (customGoalInput.trim().length < 3) {
      setErrorMsg('Goal description must be at least 3 characters long.');
      return;
    }
    setErrorMsg('');
    generateNewGoalPath(customGoalInput.trim());
    setCustomGoalInput('');
  };

  const totalCourses = activeRoadmap.milestones.reduce((acc, m) => acc + m.courses.length, 0);
  const completedCourses = activeRoadmap.milestones.reduce((acc, m) => 
    acc + m.courses.filter(c => c.completed).length, 0);
  const overallProgress = Math.round((completedCourses / totalCourses) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50/60 to-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-800 text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>AI Recommended Learning Path</span>
              </span>

              <span className="px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-extrabold">
                {activeRoadmap.matchScore}% Match for {currentUser?.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeRoadmap.title}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {activeRoadmap.aiReasoning}
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-sm">
              <div className="text-xs text-slate-500 font-bold">Total Duration</div>
              <div className="text-lg font-extrabold text-slate-900 flex items-center justify-center space-x-1 mt-0.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>{activeRoadmap.totalHours} hrs</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">~{activeRoadmap.estimatedWeeks} weeks</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-sm">
              <div className="text-xs text-slate-500 font-bold">Path Progress</div>
              <div className="text-lg font-extrabold text-emerald-600 flex items-center justify-center space-x-1 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{overallProgress}%</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">{completedCourses}/{totalCourses} Modules</div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 rounded-2xl p-3.5 text-center flex flex-col justify-center shadow-sm">
              <button
                onClick={() => setIsProfilerOpen(true)}
                className="w-full py-2 px-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Refine AI Path</span>
              </button>
            </div>
          </div>

        </div>

        {/* Natural Language Goal Input Bar with LiquidButton */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          {errorMsg && (
            <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCustomGoalSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Target className="w-4 h-4 text-sky-600" />
              </div>
              <input
                type="text"
                value={customGoalInput}
                onChange={(e) => { setCustomGoalInput(e.target.value); setErrorMsg(''); }}
                placeholder="Or describe your custom goal in natural language (e.g. 'Build generative AI apps with LangChain in 4 weeks')..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 transition-all shadow-sm"
              />
            </div>
            
            <LiquidButton
              type="submit"
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shrink-0"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-white" />
                <span>Generate Custom Roadmap</span>
              </div>
            </LiquidButton>
          </form>
        </div>

      </div>

      {/* VERTICAL SEQUENTIAL LEARNING ROADMAP */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-sky-600" />
              <span>Structured Vertical Learning Path</span>
            </h2>
            <p className="text-xs text-slate-500">Step-by-step sequential milestones and recommended courses</p>
          </div>

          <button
            onClick={() => setActiveTab('ai-assistant')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
          >
            <span>Ask AI about prerequisites</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Vertical Timeline Step Nodes Container */}
        <div className="space-y-8 relative before:absolute before:inset-0 before:left-5 sm:before:left-6 before:w-1 before:bg-slate-200">
          {activeRoadmap.milestones.map((milestone) => (
            <div key={milestone.id} className="relative pl-12 sm:pl-16">
              
              {/* Vertical Timeline Node Circle */}
              <div className={`absolute left-0 top-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xs font-extrabold border shadow-md transition-all ${
                milestone.status === 'completed'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-600/20'
                  : milestone.status === 'in-progress'
                  ? 'bg-sky-600 border-sky-500 text-white shadow-sky-600/30 ring-4 ring-sky-500/20'
                  : 'bg-white border-slate-300 text-slate-400'
              }`}>
                {milestone.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <span>P{milestone.phase}</span>
                )}
              </div>

              {/* Vertical Milestone Card Container */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        milestone.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        milestone.status === 'in-progress' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {milestone.status.replace('-', ' ')}
                      </span>

                      {milestone.prerequisites && milestone.prerequisites.length > 0 && (
                        <span className="text-[11px] text-slate-500 font-medium flex items-center space-x-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Prerequisites: <strong>{milestone.prerequisites.join(', ')}</strong></span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900">
                      {milestone.title}
                    </h3>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full sm:w-40 space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>Milestone Progress</span>
                      <span>{milestone.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className="h-full bg-gradient-to-r from-sky-600 to-emerald-500 transition-all duration-500" 
                        style={{ width: `${milestone.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Vertical List / Responsive Grid of Recommended Courses */}
                <div className="space-y-3">
                  <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    <span>Recommended Courses ({milestone.courses.length})</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {milestone.courses.map(course => (
                      <ResourceCard key={course.id} item={course} isProject={false} />
                    ))}
                  </div>
                </div>

                {/* Vertical List of Mini-Projects & Capstones */}
                {milestone.projects && milestone.projects.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Hands-On Project / Capstone ({milestone.projects.length})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {milestone.projects.map(project => (
                        <ResourceCard key={project.id} item={project} isProject={true} />
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
