"use client"

import React, { useState } from "react"
import { ChevronRight, Sparkles, Cpu, Layers, Zap } from "lucide-react"
import { LiquidButton } from "@/components/ui/liquid-glass-button"

interface HeroProps {
  eyebrow?: string
  title: string
  subtitle: string
  ctaLabel?: string
  ctaHref?: string
}

export function Hero({
  eyebrow = "AI-POWERED PERSONALIZED LEARNING PLATFORM",
  title = "Master In-Demand Skills with Pathcraft AI",
  subtitle = "Experience next-generation adaptive roadmaps, automated skill gap detection, and real-time AI guidance tailored to your career objectives.",
  ctaLabel = "Explore Learning Path",
  ctaHref = "#demo-section",
}: HeroProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 25;
    const y = (e.clientY - rect.top - rect.height / 2) / 25;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto w-full pt-28 pb-20 px-6 text-center md:px-8 
      min-h-[85vh] overflow-hidden 
      bg-gradient-to-b from-slate-100 via-sky-50/50 to-slate-100
      perspective-2000 flex flex-col items-center justify-center"
    >
      {/* Mesh Grid Background */}
      <div
        className="absolute -z-10 inset-0 opacity-40 h-full w-full 
        bg-[linear-gradient(to_right,#0284c7_1px,transparent_1px),linear-gradient(to_bottom,#0284c7_1px,transparent_1px)] 
        bg-[size:4rem_4rem] 
        [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_60%,transparent_100%)]
        transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${15 + mousePos.y}deg) rotateY(${mousePos.x}deg) scale(1.1)`,
        }}
      />

      {/* Floating Glowing Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float-reverse pointer-events-none" />

      {/* Main Glass Stage Card */}
      <div 
        className="relative z-10 max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl glass-3d-card preserve-3d transition-transform duration-200 ease-out shadow-2xl"
        style={{
          transform: `rotateX(${-mousePos.y * 0.8}deg) rotateY(${mousePos.x * 0.8}deg)`,
        }}
      >
        
        {/* Eyebrow Badge */}
        {eyebrow && (
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-300/40 text-sky-700 text-xs font-extrabold tracking-wider uppercase mb-6 shadow-sm translate-z-30 animate-pulse-glow">
            <Sparkles className="w-4 h-4 text-sky-600 animate-spin-slow" />
            <span>{eyebrow}</span>
          </div>
        )}

        {/* Dynamic Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-none mb-6 translate-z-50 bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-950 bg-clip-text text-transparent drop-shadow-sm">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-medium leading-relaxed mb-8 translate-z-30">
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 translate-z-50">
          <a href={ctaHref}>
            <LiquidButton size="xxl" className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white font-extrabold shadow-xl shadow-sky-600/30">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 fill-current text-amber-300" />
                <span>{ctaLabel}</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </LiquidButton>
          </a>
        </div>

        {/* Micro-Feature Cards */}
        <div className="grid grid-cols-3 gap-3 mt-10 pt-8 border-t border-slate-200/80 translate-z-20">
          <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/60 shadow-sm flex items-center justify-center space-x-2 text-xs font-bold text-slate-800 transform hover:translate-z-10 transition-transform">
            <Cpu className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">AI Gap Detection</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/60 shadow-sm flex items-center justify-center space-x-2 text-xs font-bold text-slate-800 transform hover:translate-z-10 transition-transform">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Learning Roadmap</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/60 shadow-sm flex items-center justify-center space-x-2 text-xs font-bold text-slate-800 transform hover:translate-z-10 transition-transform">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">98% Goal Match</span>
          </div>
        </div>

      </div>
    </section>
  )
}
