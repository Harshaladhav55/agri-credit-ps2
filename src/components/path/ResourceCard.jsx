import React, { useState } from 'react';
import { useLearning } from '../../context/LearningContext';
import { CheckCircle2, Circle, Clock, Award, Sparkles, ArrowUpRight, PlayCircle } from 'lucide-react';

export const ResourceCard = ({ item, isProject = false }) => {
  const { toggleCourseCompletion, addChatMessage, setActiveTab } = useLearning();
  const [showAiReason, setShowAiReason] = useState(false);

  const handleAskAiAboutThis = () => {
    addChatMessage(`Can you explain why "${item.title}" is included in my path and what prerequisites I need before starting it?`);
    setActiveTab('ai-assistant');
  };

  return (
    <div className={`w-full p-5 rounded-3xl border transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between relative ${
      item.completed 
        ? 'bg-slate-50/90 border-slate-200 text-slate-500 shadow-sm' 
        : 'bg-white border-slate-200 hover:border-sky-400 shadow-sm hover:shadow-md'
    }`}>
      
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start space-x-3">
            <button
              onClick={() => toggleCourseCompletion(item.id)}
              className="mt-0.5 text-slate-400 hover:text-sky-600 transition-colors shrink-0 transform hover:scale-110"
              title={item.completed ? "Mark as Incomplete" : "Mark as Completed"}
            >
              {item.completed ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </button>
            
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isProject 
                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                    : 'bg-sky-100 text-sky-800 border border-sky-200'
                }`}>
                  {isProject ? item.type || 'Project' : item.provider || 'Pathcraft AI'}
                </span>

                {item.badge && (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    {item.badge}
                  </span>
                )}
              </div>

              <h4 className={`text-sm font-extrabold leading-snug ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                {item.title}
              </h4>
            </div>
          </div>

          {/* AI Insight Toggle Button */}
          <button
            onClick={() => setShowAiReason(!showAiReason)}
            className={`p-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1 transition-all shrink-0 ${
              showAiReason
                ? 'bg-sky-100 border-sky-300 text-sky-800 scale-105'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Toggle AI Recommendation Reasoning"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="hidden sm:inline text-[11px]">AI Insight</span>
          </button>
        </div>

        {/* AI Explanation Banner */}
        {showAiReason && item.aiInsight && (
          <div className="my-3 p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-start space-x-2 animate-in fade-in duration-200 shadow-sm">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-extrabold text-sky-950 block mb-1">Why Recommended:</span>
              <p className="text-slate-700 text-[11px] leading-relaxed font-medium">{item.aiInsight}</p>
              <button
                onClick={handleAskAiAboutThis}
                className="mt-2 text-[10px] font-extrabold text-sky-700 hover:underline flex items-center space-x-1"
              >
                <span>Ask AI assistant for full syllabus</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Meta Footer Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 font-bold">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{item.duration}</span>
          </span>
          {item.level && (
            <span className="flex items-center space-x-1 font-bold">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              <span>{item.level}</span>
            </span>
          )}
        </div>

        <button 
          onClick={handleAskAiAboutThis}
          className="text-xs font-extrabold text-sky-600 hover:text-sky-700 flex items-center space-x-1 transition-transform hover:translate-x-0.5"
        >
          <span>Explore</span>
          <PlayCircle className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
