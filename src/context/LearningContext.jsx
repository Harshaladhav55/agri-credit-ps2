import React, { createContext, useContext, useState } from 'react';
import { DEMO_PERSONAS, INITIAL_ROADMAPS } from '../data/mockData';
import { apiService } from '../services/api';

const LearningContext = createContext();

export const LearningProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); 
  const [activeRoadmap, setActiveRoadmap] = useState(INITIAL_ROADMAPS['ai-specialist']);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfilerOpen, setIsProfilerOpen] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! Welcome to Pathcraft AI. I have analyzed your background and target goal. How can I help you customize your roadmap today?',
      timestamp: '10:25 AM',
      suggestions: [
        'Why did you recommend LoRA fine-tuning?',
        'Adjust path to 5 hours / week',
        'Add more hands-on PyTorch labs'
      ]
    }
  ]);

  const login = async (personaIdOrUserObj) => {
    if (typeof personaIdOrUserObj === 'object' && personaIdOrUserObj !== null) {
      // Try MongoDB backend login/register first
      let apiUser = await apiService.login({
        email: personaIdOrUserObj.email,
        password: 'password123'
      });

      if (!apiUser) {
        apiUser = await apiService.register({
          name: personaIdOrUserObj.name || 'Learner',
          email: personaIdOrUserObj.email || 'user@example.com',
          password: 'password123',
          targetGoal: personaIdOrUserObj.targetGoal || 'Generative AI & LLM Architect'
        });
      }

      const customUser = {
        id: apiUser?._id || `user-${Date.now()}`,
        name: apiUser?.name || personaIdOrUserObj.name || 'Learner',
        email: apiUser?.email || personaIdOrUserObj.email || 'user@example.com',
        role: 'Learner',
        targetGoal: apiUser?.targetGoal || personaIdOrUserObj.targetGoal || 'Generative AI & LLM Architect',
        experienceLevel: apiUser?.experienceLevel || 'Intermediate',
        avatar: apiUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        completedCourses: apiUser?.completedCourses || ['Foundational Programming', 'Data Analysis Basics'],
        weeklyCommitment: apiUser?.weeklyCommitment || 8,
        preferredStyle: 'Hands-on Projects & Labs',
      };

      setCurrentUser(customUser);

      // Fetch roadmap from MongoDB or fallback
      const dbRoadmap = await apiService.getRoadmap();
      if (dbRoadmap) {
        setActiveRoadmap(dbRoadmap);
      } else {
        setActiveRoadmap({
          ...INITIAL_ROADMAPS['ai-specialist'],
          title: `Personalized Learning Path for ${customUser.name}`,
          aiReasoning: `Tailored AI learning path synthesized for ${customUser.name} (${customUser.email}) matching target goal: ${customUser.targetGoal}.`
        });
      }

      setChatMessages([
        {
          sender: 'ai',
          text: `Hello ${customUser.name}! Welcome to Pathcraft AI. I have generated your **Personalized Learning Path** in MongoDB with a 98% goal match. How can I help you customize your roadmap today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: [
            'Why did you recommend this roadmap?',
            'Adjust path commitment to 5 hours/week',
            'Add hands-on capstone project'
          ]
        }
      ]);
    } else {
      const found = DEMO_PERSONAS.find(p => p.id === personaIdOrUserObj) || DEMO_PERSONAS[0];
      setCurrentUser(found);
      if (INITIAL_ROADMAPS[found.id]) {
        setActiveRoadmap(INITIAL_ROADMAPS[found.id]);
      }
      setChatMessages([
        {
          sender: 'ai',
          text: `Hello ${found.name}! Welcome back. I tailored your **${INITIAL_ROADMAPS[found.id]?.title || 'Learning Path'}** with a 98% goal match score. How can I help you customize your roadmap today?`,
          timestamp: '10:25 AM',
          suggestions: [
            'Why did you recommend LoRA fine-tuning?',
            'Adjust path to 5 hours / week',
            'Add more hands-on PyTorch labs'
          ]
        }
      ]);
    }
    setActiveTab('dashboard');
  };

  const logout = () => {
    localStorage.removeItem('pathcraft_token');
    setCurrentUser(null);
  };

  const updateProfile = (profileData) => {
    setCurrentUser(prev => ({
      ...prev,
      ...profileData
    }));
  };

  const toggleCourseCompletion = async (courseId) => {
    if (!activeRoadmap) return;
    
    // Try MongoDB patch first
    const updatedDbRoadmap = await apiService.toggleCourse(courseId);
    if (updatedDbRoadmap) {
      setActiveRoadmap(updatedDbRoadmap);
      return;
    }

    // Client fallback
    const updatedMilestones = activeRoadmap.milestones.map(m => {
      const updatedCourses = m.courses.map(c => {
        if (c.id === courseId) {
          return { ...c, completed: !c.completed };
        }
        return c;
      });
      
      const totalItems = updatedCourses.length + (m.projects ? m.projects.length : 0);
      const completedItems = updatedCourses.filter(c => c.completed).length + 
        (m.projects ? m.projects.filter(p => p.completed).length : 0);
      const newProgress = Math.round((completedItems / totalItems) * 100);

      return {
        ...m,
        courses: updatedCourses,
        progress: newProgress,
        status: newProgress === 100 ? 'completed' : newProgress > 0 ? 'in-progress' : 'upcoming'
      };
    });

    setActiveRoadmap({
      ...activeRoadmap,
      milestones: updatedMilestones
    });
  };

  // ─── Smart AI Engine ───────────────────────────────────────────────────────
  const buildAIResponse = (text) => {
    const lower = text.toLowerCase();
    const roadmap = activeRoadmap;
    const user = currentUser;

    // Helper: get all roadmap phases as a numbered workflow
    const getWorkflowSteps = () => {
      if (!roadmap?.milestones) return '';
      return roadmap.milestones.map((m, i) =>
        `**Step ${i + 1} — ${m.title}** (${m.progress}% done)\n` +
        m.courses.map(c => `  • ${c.completed ? '✅' : '⬜'} ${c.title} [${c.duration}] — ${c.aiInsight}`).join('\n') +
        (m.projects?.length ? '\n  🔧 Projects: ' + m.projects.map(p => `${p.completed ? '✅' : '⬜'} ${p.title}`).join(', ') : '')
      ).join('\n\n');
    };

    // Helper: get next incomplete item
    const getNextStep = () => {
      if (!roadmap?.milestones) return null;
      for (const m of roadmap.milestones) {
        for (const c of m.courses) {
          if (!c.completed) return { item: c, phase: m };
        }
        if (m.projects) {
          for (const p of m.projects) {
            if (!p.completed) return { item: p, phase: m };
          }
        }
      }
      return null;
    };

    // Helper: compute overall progress
    const totalItems = roadmap?.milestones?.reduce((a, m) => a + m.courses.length + (m.projects?.length || 0), 0) || 0;
    const doneItems = roadmap?.milestones?.reduce((a, m) =>
      a + m.courses.filter(c => c.completed).length + (m.projects?.filter(p => p.completed)?.length || 0), 0) || 0;
    const pct = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;

    const next = getNextStep();

    // ── WORKFLOW / ROADMAP / STEPS ──────────────────────────────────────────
    if (lower.match(/workflow|roadmap|path|steps?|phases?|plan|outline|journey|overview|show me/)) {
      return {
        text: `## 🗺️ Your Personalized Learning Workflow\n\nHere is your complete step-by-step roadmap for **${roadmap?.title || user?.targetGoal}**:\n\n${getWorkflowSteps()}\n\n---\n📊 **Overall Progress:** ${pct}% complete (${doneItems}/${totalItems} items)\n⏱️ **Estimated Duration:** ${roadmap?.estimatedWeeks} weeks at ${user?.weeklyCommitment} hrs/week\n🎯 **Goal Match Score:** ${roadmap?.matchScore}%\n\n${next ? `✨ **Your next action:** Start "${next.item.title}" in ${next.phase.title}` : '🎉 All steps completed! You are ready for your capstone project.'}`,
        suggestions: ['What should I focus on this week?', 'Explain the prerequisites for each phase', 'How do I get certified after this?']
      };
    }

    // ── NEXT STEP / WHAT SHOULD I DO ───────────────────────────────────────
    if (lower.match(/next|what (should|do) i|start|begin|where|focus|priorit|today|this week/)) {
      if (!next) {
        return {
          text: `🎉 **Congratulations, ${user?.name}!** You have completed all modules in your roadmap!\n\nYour next step is to apply for roles as a **${user?.targetGoal}** or tackle an industry capstone project.\n\n**Recommended capstone ideas:**\n• Build a Production RAG Chatbot with LangChain + Pinecone\n• Fine-tune Llama 3 on a proprietary dataset and deploy via FastAPI\n• Create an AI Agent with tool-use and memory for enterprise workflows`,
          suggestions: ['Give me capstone project ideas', 'What certifications should I get?', 'How do I prepare my portfolio?']
        };
      }
      const phase = next.phase;
      return {
        text: `## ⚡ Your Next Priority Action\n\n**📌 Module:** ${next.item.title}\n**📂 Phase:** ${phase.title}\n**⏱️ Duration:** ${next.item.duration || 'N/A'}\n**🏷️ Type:** ${next.item.type || 'Course'}\n\n${next.item.aiInsight ? `**🤖 Why this now?**\n${next.item.aiInsight}` : ''}\n\n**Prerequisites completed:**\n${phase.prerequisites?.map(p => `✅ ${p}`).join('\n') || '✅ None required — you can start immediately!'}\n\n**After completing this, you unlock:**\n${phase.courses.filter(c => !c.completed).slice(1, 3).map(c => `→ ${c.title}`).join('\n') || '→ The next milestone phase'}`,
        suggestions: ['How long will this take me overall?', 'Show me the full workflow', 'What skills will I gain from this?']
      };
    }

    // ── SKILLS / SKILL GAP ─────────────────────────────────────────────────
    if (lower.match(/skill|gap|competenc|proficien|learn|know|strength|weakness/)) {
      const skills = roadmap?.skillsAcquired || [];
      const gaps = skills.filter(s => s.target - s.current > 20).sort((a, b) => (b.target - b.current) - (a.target - a.current));
      const strong = skills.filter(s => s.current >= 70);
      return {
        text: `## 🎯 Your Skill Gap Analysis\n\n**Current Experience Level:** ${user?.experienceLevel}\n**Target Role:** ${user?.targetGoal}\n\n**📈 Biggest Skill Gaps to Close:**\n${gaps.map(s => `• **${s.name}** — You are at ${s.current}%, need ${s.target}% (gap: ${s.target - s.current}%)`).join('\n') || '• No major gaps — great progress!'}\n\n**💪 Your Strengths:**\n${strong.map(s => `• ${s.name} — ${s.current}%`).join('\n') || '• Keep building your skills!'}\n\n**🔑 AI Recommendation:**\nFocus on closing the **${gaps[0]?.name || 'top skill'}** gap first — it is the most critical for your target role and currently has the largest gap.`,
        suggestions: ['Show me courses to close my top skill gap', 'How does my skill level compare to industry?', 'What should I learn this month?']
      };
    }

    // ── TIMELINE / HOURS / SCHEDULE ────────────────────────────────────────
    if (lower.match(/time|hour|week|schedule|duration|long|when|finish|complete|deadline/)) {
      const hoursMatch = lower.match(/(\d+)\s*hours?/);
      const newHours = hoursMatch ? parseInt(hoursMatch[1]) : null;
      const currentWeeks = roadmap?.estimatedWeeks || 12;
      const totalHours = roadmap?.totalHours || 96;
      const adjWeeks = newHours ? Math.ceil(totalHours / newHours) : currentWeeks;
      return {
        text: `## ⏱️ Your Learning Timeline\n\n**Current plan:** ${user?.weeklyCommitment} hrs/week → **${currentWeeks} weeks** total\n**Total course hours:** ~${totalHours} hours\n\n${newHours ? `**Adjusted to ${newHours} hrs/week:**\n📅 New estimated completion: **${adjWeeks} weeks** (${Math.round(adjWeeks / 4)} months)\n\n` : ''}**Phase-by-Phase Timeline:**\n${roadmap?.milestones?.map((m, i) => `**Phase ${i + 1}** — ${m.title}\n  • Status: ${m.status === 'completed' ? '✅ Completed' : m.status === 'in-progress' ? '🔄 In Progress' : '⏳ Upcoming'}\n  • Progress: ${m.progress}%\n  • Courses: ${m.courses.length} modules`).join('\n\n') || ''}\n\n**💡 Tip:** Consistent ${user?.weeklyCommitment}-hour weekly sessions are optimal for your learning style: *${user?.preferredStyle}*`,
        suggestions: ['Adjust path to 5 hours/week', 'What are the fastest modules to complete?', 'Show me the full workflow']
      };
    }

    // ── PREREQUISITES / DEPENDENCIES ───────────────────────────────────────
    if (lower.match(/prerequisite|depend|require|before|unlock|need to|first/)) {
      return {
        text: `## 🔗 Prerequisite Dependency Map\n\nHere is how each phase unlocks the next:\n\n${roadmap?.milestones?.map((m, i) => {
          const prereqs = m.prerequisites?.join(', ') || 'None — starting phase';
          const status = m.status === 'completed' ? '✅ Completed' : m.status === 'in-progress' ? '🔄 Active' : '🔒 Locked';
          return `**Phase ${i + 1}: ${m.title}**\n  ${status}\n  🔑 Requires: ${prereqs}`;
        }).join('\n\n') || ''}\n\n**📌 Current unlock status:**\n${next ? `Your next unlocked module is **"${next.item.title}"** in ${next.phase.title}.` : 'All phases are unlocked — great progress!'}`,
        suggestions: ['What is my next step?', 'Show me the full workflow', 'How long until the next phase?']
      };
    }

    // ── CAPSTONE / PROJECT ─────────────────────────────────────────────────
    if (lower.match(/capstone|project|portfolio|apply|practis|hands.on|build|create/)) {
      return {
        text: `## 🔧 Capstone & Project Recommendations\n\nBased on your target role as **${user?.targetGoal}**, here are the best capstone projects:\n\n**🥇 Top Recommended Project:**\nBuild a **Production AI Assistant** using RAG + LangChain + Pinecone with a React frontend — this covers 85% of your target skill requirements.\n\n**🔬 Hands-on Projects in Your Roadmap:**\n${roadmap?.milestones?.flatMap(m => m.projects || []).map(p => `• ${p.completed ? '✅' : '⬜'} **${p.title}** (${p.type}, ${p.duration})`).join('\n') || '• Complete more phases to unlock projects'}\n\n**💡 Portfolio Strategy:**\n1. Deploy each project on GitHub with a detailed README\n2. Host a live demo (Hugging Face Spaces or Vercel)\n3. Write a technical blog post explaining your implementation\n4. Link projects in your LinkedIn profile`,
        suggestions: ['Which project is most in-demand?', 'How do I deploy my AI project?', 'What certifications complement this?']
      };
    }

    // ── CERTIFICATION ──────────────────────────────────────────────────────
    if (lower.match(/certif|badge|credential|exam|test|validate/)) {
      return {
        text: `## 🏆 Certification Roadmap for ${user?.targetGoal}\n\n**Recommended certifications in order:**\n\n1. **AWS Certified Machine Learning Specialty** — validates your ML deployment skills\n2. **Google Professional ML Engineer** — industry-recognized for LLM applications\n3. **DeepLearning.AI Specialization Certificate** — covers Transformers & LLMs\n4. **Hugging Face Certification** — specific to open-source LLM fine-tuning\n\n**📅 When to attempt:**\nAim for certifications after completing **Phase 2** of your roadmap (when your LLM fine-tuning score reaches ~70%).\n\n**💰 Estimated ROI:**\nThese certifications can increase your salary by **15–30%** for ${user?.targetGoal} roles.`,
        suggestions: ['How do I prepare for the AWS ML exam?', 'Show me what skills I still need', 'What is my current progress?']
      };
    }

    // ── WHY / RECOMMENDATION REASONING ────────────────────────────────────
    if (lower.match(/why|reason|recommend|suggest|chose|selected|explain|rationale/)) {
      return {
        text: `## 🤖 AI Recommendation Reasoning\n\n**Why this roadmap was built for you:**\n\n${roadmap?.aiReasoning || 'Your roadmap was personalized based on your background and target goal.'}\n\n**Key personalization factors:**\n• **Your background:** ${user?.completedCourses?.join(', ') || 'General learner'}\n• **Experience level:** ${user?.experienceLevel}\n• **Weekly availability:** ${user?.weeklyCommitment} hours\n• **Learning style:** ${user?.preferredStyle}\n• **Target goal match:** ${roadmap?.matchScore}%\n\n**The AI engine optimized for:**\n1. Fastest path to your target role\n2. Building on your existing knowledge\n3. Prioritizing the highest-demand industry skills\n4. Fitting within your weekly time budget`,
        suggestions: ['Show me the full workflow', 'What are the top industry skills I need?', 'How does my path compare to the standard?']
      };
    }

    // ── PROGRESS / STATUS ──────────────────────────────────────────────────
    if (lower.match(/progress|status|how am i|doing|percent|complete|achiev/)) {
      return {
        text: `## 📊 Your Learning Progress Report\n\n**Overall Completion:** ${pct}% (${doneItems} of ${totalItems} items done)\n\n**Phase Breakdown:**\n${roadmap?.milestones?.map(m => {
          const icon = m.status === 'completed' ? '✅' : m.status === 'in-progress' ? '🔄' : '⏳';
          return `${icon} **${m.title}** — ${m.progress}%`;
        }).join('\n') || ''}\n\n**Skill Progression:**\n${roadmap?.skillsAcquired?.map(s => {
          const filled = Math.round(s.current / 10);
          const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
          return `• ${s.name}: [${bar}] ${s.current}% → ${s.target}%`;
        }).join('\n') || ''}\n\n**🎯 Next milestone:** ${next ? `Complete "${next.item.title}" in ${next.phase.title}` : 'All milestones complete!'}`,
        suggestions: ['What should I do next?', 'Which skill has the biggest gap?', 'How long until I finish?']
      };
    }

    // ── GENERAL / FALLBACK ─────────────────────────────────────────────────
    return {
      text: `## 💬 Pathcraft AI Response\n\nThanks for your question, **${user?.name}**! I am your personalized AI learning guide for your **${user?.targetGoal}** journey.\n\nHere is what I can help you with:\n\n• **"Show me my workflow"** — Full step-by-step roadmap\n• **"What should I do next?"** — Your immediate priority action\n• **"Explain my skill gaps"** — Gap analysis vs your target role\n• **"How long will this take?"** — Timeline & schedule planning\n• **"Why did you recommend this?"** — AI reasoning & personalization\n• **"Show me projects"** — Capstone & hands-on project ideas\n• **"What certifications do I need?"** — Certification roadmap\n• **"What is my progress?"** — Detailed progress report\n\n**Quick tip:** You are currently at **${pct}% completion** of your learning path!`,
      suggestions: ['Show me my workflow', 'What should I focus on next?', 'Show me my skill gap analysis']
    };
  };

  const addChatMessage = async (userMessageText) => {
    const userMsg = {
      sender: 'user',
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);

    // Add typing indicator
    setChatMessages(prev => [...prev, { sender: 'ai', text: '', isTyping: true, timestamp: '' }]);

    // Try MongoDB Chat API call
    const chatRes = await apiService.sendChatMessage(userMessageText);

    // Remove typing indicator
    setChatMessages(prev => prev.filter(m => !m.isTyping));

    if (chatRes && chatRes.aiMessage) {
      setChatMessages(prev => [...prev, {
        sender: 'ai',
        text: chatRes.aiMessage.text,
        timestamp: chatRes.aiMessage.timestamp,
        suggestions: chatRes.aiMessage.suggestions
      }]);
      return;
    }

    // Smart client AI engine
    await new Promise(r => setTimeout(r, 900));
    const { text: aiText, suggestions } = buildAIResponse(userMessageText);

    const aiMsg = {
      sender: 'ai',
      text: aiText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions
    };

    setChatMessages(prev => [...prev, aiMsg]);
  };

  const generateNewGoalPath = async (goalPrompt) => {
    const dbRoadmap = await apiService.generateRoadmap(goalPrompt);
    if (dbRoadmap) {
      setActiveRoadmap(dbRoadmap);
      return;
    }

    const updatedRoadmap = {
      ...activeRoadmap,
      title: `Custom Path: ${goalPrompt}`,
      matchScore: 99,
      aiReasoning: `Generated specifically for prompt: "${goalPrompt}". Dynamically synthesized modules based on real-time industry skill gap analysis.`,
    };
    setActiveRoadmap(updatedRoadmap);
    addChatMessage(`I want to generate a new path: "${goalPrompt}"`);
  };

  return (
    <LearningContext.Provider value={{
      currentUser,
      activeRoadmap,
      activeTab,
      setActiveTab,
      isProfilerOpen,
      setIsProfilerOpen,
      chatMessages,
      login,
      logout,
      updateProfile,
      toggleCourseCompletion,
      addChatMessage,
      generateNewGoalPath
    }}>
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => useContext(LearningContext);
