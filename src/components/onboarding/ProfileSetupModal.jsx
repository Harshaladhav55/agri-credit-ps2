import React, { useState } from 'react';
import { useLearning } from '../../context/LearningContext';
import { X, Sparkles, Sliders, Target, Clock, BookOpen, Check, Award, AlertCircle } from 'lucide-react';

export const ProfileSetupModal = () => {
  const { currentUser, updateProfile, isProfilerOpen, setIsProfilerOpen, generateNewGoalPath } = useLearning();

  const [targetGoal, setTargetGoal] = useState(currentUser?.targetGoal || 'Generative AI & LLM Architect');
  const [experienceLevel, setExperienceLevel] = useState(currentUser?.experienceLevel || 'Intermediate');
  const [weeklyCommitment, setWeeklyCommitment] = useState(currentUser?.weeklyCommitment || 8);
  const [preferredStyle, setPreferredStyle] = useState(currentUser?.preferredStyle || 'Hands-on Projects & Labs');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isProfilerOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!targetGoal.trim()) {
      setErrorMsg('Target Career Goal is required.');
      return;
    }
    if (targetGoal.trim().length < 3) {
      setErrorMsg('Target Goal must be at least 3 characters long.');
      return;
    }
    setErrorMsg('');
    updateProfile({
      targetGoal,
      experienceLevel,
      weeklyCommitment,
      preferredStyle
    });
    generateNewGoalPath(targetGoal);
    setIsProfilerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50/50 px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <span>Learner Profiling Engine</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200 text-[10px] uppercase font-bold">AI Config</span>
              </h3>
              <p className="text-xs text-slate-500">Tailor your AI roadmap parameters and gap recommendations</p>
            </div>
          </div>
          <button 
            onClick={() => setIsProfilerOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5 bg-white">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Target Goal Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Target className="w-4 h-4 text-sky-600" />
              <span>Target Career Goal / Objective</span>
            </label>
            <input
              type="text"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              placeholder="e.g. Generative AI Engineer, Cloud Architect, Full Stack Lead"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 transition-all"
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Current Skill & Experience Level</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setExperienceLevel(lvl)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    experienceLevel === lvl
                      ? 'bg-sky-50 border-sky-600 text-sky-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Commitment Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Weekly Time Commitment</span>
              </label>
              <span className="text-xs font-bold text-sky-700 px-2 py-0.5 rounded bg-sky-100 border border-sky-200">
                {weeklyCommitment} hours / week
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="25"
              step="1"
              value={weeklyCommitment}
              onChange={(e) => setWeeklyCommitment(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
              <span>3 hrs (Light Pace)</span>
              <span>10 hrs (Standard)</span>
              <span>25 hrs (Bootcamp Acceleration)</span>
            </div>
          </div>

          {/* Preferred Style */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>Preferred Learning Style</span>
            </label>
            <div className="space-y-2">
              {[
                'Hands-on Projects & Practical Labs',
                'Guided Video Modules & Quizzes',
                'Accelerated Intensive Exam Prep'
              ].map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setPreferredStyle(style)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all ${
                    preferredStyle === style
                      ? 'bg-sky-50 border-sky-600 text-sky-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>{style}</span>
                  {preferredStyle === style && <Check className="w-4 h-4 text-sky-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsProfilerOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/20 flex items-center space-x-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Re-Synthesize AI Path</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
