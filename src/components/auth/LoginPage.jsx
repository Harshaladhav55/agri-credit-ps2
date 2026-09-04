import React, { useState } from 'react';
import { useLearning } from '../../context/LearningContext';
import { Hero } from '../ui/hero-1';
import { LiquidButton } from '../ui/liquid-glass-button';
import { Bot, CheckCircle2, AlertCircle, ArrowRight, UserPlus } from 'lucide-react';

// Helpers for client-side registered user tracking
const REGISTERED_EMAILS_KEY = 'pathcraft_registered_emails';

const getRegisteredEmails = () => {
  try {
    return JSON.parse(localStorage.getItem(REGISTERED_EMAILS_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveRegisteredEmail = (email) => {
  const emails = getRegisteredEmails();
  if (!emails.includes(email.trim().toLowerCase())) {
    emails.push(email.trim().toLowerCase());
    localStorage.setItem(REGISTERED_EMAILS_KEY, JSON.stringify(emails));
  }
};

const isEmailRegistered = (email) => {
  return getRegisteredEmails().includes(email.trim().toLowerCase());
};

export const LoginPage = () => {
  const { login } = useLearning();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [touched, setTouched] = useState({ email: false, password: false });
  const [formError, setFormError] = useState('');

  // 3D Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 30;
    const y = (e.clientY - rect.top - rect.height / 2) / 30;
    setTilt({ x, y });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Field validation helpers
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = email.trim() !== '' && emailRegex.test(email);
  const isPasswordValid = password.length >= 6;

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const deriveNameFromEmail = (userEmail) => {
    if (!userEmail) return 'Learner';
    const prefix = userEmail.split('@')[0];
    return prefix
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setSuccessMessage('');

    if (!email.trim()) {
      setFormError('Email address is required.');
      return;
    }
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address (e.g. user@example.com).');
      return;
    }
    if (!password) {
      setFormError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    // ── Sign In validation ──
    if (!isSignUp) {
      if (!isEmailRegistered(email)) {
        setFormError('NO_ACCOUNT'); // special sentinel to render rich error
        return;
      }
    }

    setFormError('');

    const displayName = deriveNameFromEmail(email);

    if (isSignUp) {
      // Save the email as registered before logging in
      saveRegisteredEmail(email);
    }

    // Authenticate and redirect seamlessly to the Dashboard
    login({
      name: displayName,
      email: email.trim(),
      targetGoal: 'Generative AI & LLM Architect'
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between overflow-x-hidden">
      
      {/* Hero Section */}
      <div className="w-full">
        <Hero 
          eyebrow="AI-POWERED PERSONALIZED LEARNING PLATFORM"
          title="Personalized AI Learning Paths"
          subtitle="Interactive Skill Gap Analysis, dynamic prerequisite modeling, and real-time path customization tailored to your goals."
          ctaLabel="Explore Learning Portal"
          ctaHref="#demo-section"
        />
      </div>

      {/* Login Card Section */}
      <div 
        id="demo-section" 
        className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full -mt-24 z-30 relative perspective-1000"
      >
        <div 
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          className="glass-3d-card rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 preserve-3d transition-transform duration-200 ease-out border border-white/80"
          style={{
            transform: `rotateX(${-tilt.y}deg) rotateY(${tilt.x}deg)`,
          }}
        >
          
          {/* Left Panel */}
          <div className="md:col-span-5 bg-gradient-to-br from-sky-500/10 via-indigo-500/10 to-slate-50 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-sky-400/20 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-xs font-extrabold uppercase tracking-wider mb-6 shadow-sm">
                <Bot className="w-4 h-4 text-sky-600 animate-bounce" />
                <span>AI LEARNER PROFILER</span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 mb-4 leading-tight">
                Experience AI-Powered Personalization
              </h3>

              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-sm text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <span><strong>Skill Gap Analysis:</strong> Real-time competency modeling across target career benchmarks.</span>
                </li>
                <li className="flex items-start space-x-3 text-sm text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <span><strong>Interactive Path Nodes:</strong> Dynamic milestone timelines with prerequisite links.</span>
                </li>
                <li className="flex items-start space-x-3 text-sm text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <span><strong>AI Conversational Guidance:</strong> Ask why recommendations were made anytime.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200/80 relative z-10">
              <div className="text-xs text-slate-600 font-medium">
                <span className="text-slate-900 font-extrabold">250,000+</span> personalized learning paths generated
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="md:col-span-7 p-8 flex flex-col justify-center bg-white/90">
            <div>
              <div className="flex border-b border-slate-200 mb-6">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setFormError(''); setSuccessMessage(''); setTouched({ email: false, password: false }); }}
                  className={`pb-3 px-5 text-sm font-extrabold border-b-2 transition-all ${
                    !isSignUp 
                      ? 'border-sky-600 text-sky-600 scale-105' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setFormError(''); setSuccessMessage(''); setTouched({ email: false, password: false }); }}
                  className={`pb-3 px-5 text-sm font-extrabold border-b-2 transition-all ${
                    isSignUp 
                      ? 'border-sky-600 text-sky-600 scale-105' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Form Validation Error Banner */}
              {formError && formError !== 'NO_ACCOUNT' && (
                <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              {/* Not Registered Error Banner */}
              {formError === 'NO_ACCOUNT' && (
                <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-800 animate-in fade-in duration-150">
                  <div className="flex items-start space-x-2">
                    <UserPlus className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-amber-900 mb-1">Account not found!</p>
                      <p className="font-medium">
                        No account exists for <span className="font-extrabold text-amber-900">{email}</span>. You must register first before you can sign in.
                      </p>
                      <button
                        type="button"
                        onClick={() => { setIsSignUp(true); setFormError(''); setTouched({ email: false, password: false }); }}
                        className="mt-2 inline-flex items-center space-x-1 text-sky-700 font-extrabold underline underline-offset-2 hover:text-sky-900 transition-colors"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Create an account now →</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message Banner */}
              {successMessage && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center space-x-2 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                
                {/* Email Field */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email address <span className="text-red-500">*</span>
                    </label>
                    {touched.email && (
                      <span className={`text-[10px] font-extrabold ${isEmailValid ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isEmailValid ? 'Valid email' : 'Invalid email format'}
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFormError(''); }}
                    onBlur={() => handleBlur('email')}
                    placeholder="name@company.com"
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-inner ${
                      touched.email && !isEmailValid 
                        ? 'border-red-400 focus:ring-2 focus:ring-red-400' 
                        : touched.email && isEmailValid 
                        ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-400' 
                        : 'border-slate-300 focus:ring-2 focus:ring-sky-600'
                    }`}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password <span className="text-red-500">*</span>
                    </label>
                    {touched.password && (
                      <span className={`text-[10px] font-extrabold ${isPasswordValid ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isPasswordValid ? 'Min 6 chars satisfied' : 'Too short'}
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFormError(''); }}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-inner ${
                      touched.password && !isPasswordValid 
                        ? 'border-red-400 focus:ring-2 focus:ring-red-400' 
                        : touched.password && isPasswordValid 
                        ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-400' 
                        : 'border-slate-300 focus:ring-2 focus:ring-sky-600'
                    }`}
                  />
                </div>

                <div className="pt-2">
                  <LiquidButton
                    type="submit"
                    size="xl"
                    className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-extrabold shadow-lg shadow-sky-600/20"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>{isSignUp ? 'Create Profile & View Dashboard' : 'Sign In to Pathcraft AI'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </LiquidButton>
                </div>
              </form>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
