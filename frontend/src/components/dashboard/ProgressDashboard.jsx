import React, { useState } from 'react';
import { useLearning } from '../../context/LearningContext';
import { LiquidButton } from '../ui/liquid-glass-button';
import { Target, Award, Clock, CheckCircle2, TrendingUp, Sparkles, Play, Zap, Layers, Cpu, BookOpen, ChevronRight, BarChart2 } from 'lucide-react';

export const ProgressDashboard = () => {
  const { currentUser, activeRoadmap, setActiveTab, toggleCourseCompletion } = useLearning();
  const [activeTopicId, setActiveTopicId] = useState('overview');
  const [hoveredSkill, setHoveredSkill] = useState(null);

  if (!activeRoadmap) return null;

  const skills = activeRoadmap.skillsAcquired || [];

  // Calculate next recommended item
  let nextActionItem = null;
  for (const m of activeRoadmap.milestones) {
    const uncompleted = m.courses.find(c => !c.completed);
    if (uncompleted) {
      nextActionItem = { ...uncompleted, milestoneTitle: m.title };
      break;
    }
    const uncompletedProject = m.projects?.find(p => !p.completed);
    if (uncompletedProject) {
      nextActionItem = { ...uncompletedProject, milestoneTitle: m.title };
      break;
    }
  }

  const totalItems = activeRoadmap.milestones.reduce((acc, m) => 
    acc + m.courses.length + (m.projects ? m.projects.length : 0), 0);
  
  const completedItems = activeRoadmap.milestones.reduce((acc, m) => 
    acc + m.courses.filter(c => c.completed).length + (m.projects ? m.projects.filter(p => p.completed).length : 0), 0);

  const overallPercent = Math.round((completedItems / totalItems) * 100);

  // Topics Menu Items for Left Vertical Sidebar
  const dashboardTopics = [
    { id: 'overview', title: 'Dashboard Overview', icon: TrendingUp, badge: `${overallPercent}%` },
    { id: 'skills', title: 'Skill Gap Matrix', icon: Target, badge: `${skills.length} Skills` },
    { id: 'next-action', title: 'Next Recommended Action', icon: Zap, badge: 'Priority' },
    ...activeRoadmap.milestones.map(m => ({
      id: `milestone-${m.id}`,
      title: m.title,
      icon: Layers,
      badge: `${m.progress}%`,
      milestoneData: m
    }))
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Glass Welcome Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 glass-3d-card rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden preserve-3d">
        <div className="flex items-center space-x-5">
          <div className="relative">
            <img 
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-sky-500/30 shadow-xl" 
              src={currentUser?.avatar} 
              alt={currentUser?.name} 
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
              ✓
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-extrabold uppercase tracking-wider border border-sky-200">
                AI LEARNER DASHBOARD
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Welcome back, {currentUser?.name}!
            </h1>
            <p className="text-xs text-slate-600 mt-1 flex items-center space-x-2 font-medium">
              <span>Target Role: <strong className="text-sky-600 font-extrabold">{currentUser?.targetGoal}</strong></span>
              <span>•</span>
              <span>Level: <strong className="text-slate-900 font-bold">{currentUser?.experienceLevel}</strong></span>
            </p>
          </div>
        </div>

        <LiquidButton
          onClick={() => setActiveTab('roadmap')}
          size="lg"
          className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shrink-0"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span>View Full Roadmap</span>
          </div>
        </LiquidButton>
      </div>

      {/* DUAL COLUMN DASHBOARD: LEFT VERTICAL TOPICS SIDEBAR + RIGHT CONTENT STAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT VERTICAL TOPICS SIDEBAR */}
        <div className="lg:col-span-4 glass-3d-card rounded-3xl p-5 shadow-lg space-y-4 sticky top-24">
          <div className="px-3 py-2 border-b border-slate-200/80">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-sky-600" />
              <span>Dashboard Topics & Modules</span>
            </h3>
          </div>

          <nav className="space-y-2">
            {dashboardTopics.map((topic) => {
              const Icon = topic.icon;
              const isActive = activeTopicId === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopicId(topic.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group transform hover:translate-x-1 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-50 to-indigo-50 border-sky-400 text-sky-800 shadow-md font-extrabold border-l-4 border-l-sky-600'
                      : 'bg-white/80 border-slate-200/70 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-bold'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                      isActive ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs truncate">{topic.title}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${
                      isActive ? 'bg-sky-200 text-sky-900' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {topic.badge}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-sky-600 translate-x-0.5' : 'text-slate-400'}`} />
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* RIGHT CONTENT STAGE (DYNAMICALLY BASED ON SELECTED LEFT TOPIC) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* OVERVIEW TOPIC VIEW */}
          {(activeTopicId === 'overview' || activeTopicId === 'next-action') && (
            <div className="space-y-6">
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-3d-card rounded-3xl p-5 shadow-sm flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-bold">Progress</div>
                    <div className="text-xl font-extrabold text-slate-900 mt-0.5">{overallPercent}%</div>
                  </div>
                </div>

                <div className="glass-3d-card rounded-3xl p-5 shadow-sm flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-bold">Match Score</div>
                    <div className="text-xl font-extrabold text-slate-900 mt-0.5">{activeRoadmap.matchScore}%</div>
                  </div>
                </div>

                <div className="glass-3d-card rounded-3xl p-5 shadow-sm flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-bold">Pace</div>
                    <div className="text-xl font-extrabold text-slate-900 mt-0.5">{currentUser?.weeklyCommitment} hrs/wk</div>
                  </div>
                </div>
              </div>

              {/* Next Recommended Action Widget */}
              <div className="bg-gradient-to-br from-sky-50 via-white to-indigo-50 border border-sky-200 rounded-3xl p-6 shadow-xl relative overflow-hidden preserve-3d">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200 text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5 shadow-sm">
                    <Zap className="w-4 h-4 text-sky-600 fill-current" />
                    <span>Next Recommended Action</span>
                  </span>
                  <span className="text-xs text-slate-500 font-bold">{nextActionItem?.milestoneTitle}</span>
                </div>

                {nextActionItem ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                        {nextActionItem.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {nextActionItem.aiInsight || 'Key required module to advance to your next milestone phase.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                      <div className="flex items-center space-x-3 text-slate-500 font-medium">
                        <span>Duration: <strong className="text-slate-900">{nextActionItem.duration}</strong></span>
                        <span>•</span>
                        <span>Provider: <strong className="text-sky-600">{nextActionItem.provider || nextActionItem.type}</strong></span>
                      </div>

                      <LiquidButton
                        onClick={() => toggleCourseCompletion(nextActionItem.id)}
                        size="default"
                        className="bg-sky-600 text-white font-extrabold text-xs shadow-md"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Module</span>
                        </div>
                      </LiquidButton>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-emerald-600 font-extrabold text-sm">
                    🎉 All recommended actions completed!
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SKILL GAP MATRIX TOPIC VIEW */}
          {(activeTopicId === 'overview' || activeTopicId === 'skills') && (
            <div className="glass-3d-card rounded-3xl p-6 shadow-md space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                  <Target className="w-4 h-4 text-sky-600" />
                  <span>Skill Gap Competency Matrix</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Current skill proficiency vs target role benchmarks
                </p>
              </div>

              <div className="space-y-4">
                {skills.map((sk, idx) => (
                  <div 
                    key={idx}
                    onMouseEnter={() => setHoveredSkill(idx)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    className={`space-y-2 p-3.5 rounded-2xl transition-all duration-200 ${
                      hoveredSkill === idx ? 'bg-sky-50 shadow-md scale-102 border border-sky-200' : 'bg-white/80 border border-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-900">{sk.name}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        <span className="text-sky-600 font-extrabold">{sk.current}%</span> / {sk.target}% target
                      </span>
                    </div>

                    <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className="absolute top-0 bottom-0 bg-sky-100 border-r-2 border-sky-500 z-10"
                        style={{ width: `${sk.target}%` }}
                      ></div>
                      <div 
                        className="h-full bg-gradient-to-r from-sky-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-700 relative z-20"
                        style={{ width: `${sk.current}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MILESTONE TOPIC DETAIL VIEW */}
          {activeTopicId.startsWith('milestone-') && (
            <div className="glass-3d-card rounded-3xl p-6 shadow-md space-y-5">
              {(() => {
                const milestoneId = activeTopicId.replace('milestone-', '');
                const m = activeRoadmap.milestones.find(m => m.id === milestoneId);
                if (!m) return null;

                return (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div>
                        <span className="text-xs font-extrabold px-3 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                          Phase {m.phase} Milestone Topic
                        </span>
                        <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                          {m.title}
                        </h3>
                      </div>
                      <span className="text-lg font-extrabold text-sky-600 font-mono">
                        {m.progress}% Completed
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                        <BookOpen className="w-4 h-4 text-sky-600" />
                        <span>Recommended Module Topics ({m.courses.length})</span>
                      </div>

                      <div className="space-y-3">
                        {m.courses.map(course => (
                          <div key={course.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                                  {course.provider}
                                </span>
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                                  {course.badge}
                                </span>
                              </div>
                              <h4 className="text-sm font-extrabold text-slate-900">{course.title}</h4>
                              <p className="text-xs text-slate-500 mt-1">{course.aiInsight}</p>
                            </div>
                            <button
                              onClick={() => toggleCourseCompletion(course.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                course.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-600 text-white'
                              }`}
                            >
                              {course.completed ? 'Completed ✓' : 'Mark Done'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
