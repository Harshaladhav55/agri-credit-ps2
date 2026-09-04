import React, { useState, useRef, useEffect } from 'react';
import { useLearning } from '../../context/LearningContext';
import { AI_SUGGESTED_PROMPTS } from '../../data/mockData';
import { LiquidButton } from '../ui/liquid-glass-button';
import { Bot, User, Send, Sparkles, CornerDownLeft, MessageSquare, Cpu } from 'lucide-react';

export const AIAssistantPanel = () => {
  const { chatMessages, addChatMessage, currentUser } = useLearning();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText || !inputText.trim()) return;
    addChatMessage(inputText.trim());
    setInputText('');
  };

  const handlePromptClick = (promptText) => {
    addChatMessage(promptText);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="glass-3d-card rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[750px] border border-white/80 preserve-3d">
        
        {/* 3D Glass Top Bar */}
        <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-slate-50 px-6 py-4 border-b border-slate-200/80 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-600/30">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <span>Pathcraft 3D AI Assistant</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] uppercase font-extrabold">Active 3D Neural Engine</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Ask why recommendations were made, adjust commitment, or explain prerequisites</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-600 font-medium">
            <span>Target Goal: <strong className="text-sky-600 font-extrabold">{currentUser?.targetGoal}</strong></span>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
          
          {/* Introductory AI Greeting Card */}
          <div className="bg-white/90 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 space-y-2 shadow-md">
            <div className="flex items-center space-x-2 text-sky-600 font-extrabold">
              <Sparkles className="w-4 h-4 text-sky-600 animate-spin-slow" />
              <span>3D Pathcraft Neural Capability</span>
            </div>
            <p className="font-medium text-slate-600 leading-relaxed">
              I analyze real-time industry skill gap metrics, your past completion history (<strong>{currentUser?.completedCourses.join(', ')}</strong>), and target level (<strong>{currentUser?.experienceLevel}</strong>) to continuously optimize your 3D learning path.
            </p>
          </div>

          {chatMessages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-600/30'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-xl rounded-3xl p-5 text-xs leading-relaxed space-y-2 shadow-md ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none font-medium'
              }`}>
                <div className={`flex items-center justify-between text-[10px] pb-1 border-b ${
                  msg.sender === 'user' ? 'border-white/20 text-sky-100' : 'border-slate-100 text-slate-400'
                }`}>
                  <span className="font-extrabold">{msg.sender === 'user' ? currentUser?.name : 'Pathcraft 3D AI'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                
                <div className="whitespace-pre-wrap font-sans text-xs">
                  {msg.text}
                </div>

                {/* Follow-up suggestions */}
                {msg.suggestions && (
                  <div className="pt-2.5 space-y-1.5 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Suggested Next Questions:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handlePromptClick(sug)}
                          className="text-[11px] px-3 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all text-left font-bold shadow-sm transform hover:scale-105"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts Drawer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200">
          <div className="flex items-center space-x-2 mb-2 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
            <span>Interactive 3D Prompts:</span>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {AI_SUGGESTED_PROMPTS.map((promptText, i) => (
              <button
                key={i}
                onClick={() => handlePromptClick(promptText)}
                className="px-3.5 py-1.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl text-xs text-slate-700 hover:text-sky-700 whitespace-nowrap transition-all shrink-0 font-semibold shadow-sm transform hover:scale-105"
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSend} className="flex items-center space-x-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask AI why a course was recommended, or request 3D roadmap adjustments..."
                className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 transition-all shadow-inner"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <CornerDownLeft className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <LiquidButton
              type="submit"
              disabled={!inputText.trim()}
              size="default"
              className="bg-sky-600 text-white font-extrabold text-xs shadow-md shrink-0"
            >
              <div className="flex items-center space-x-1.5">
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </div>
            </LiquidButton>
          </form>
        </div>

      </div>
    </div>
  );
};
