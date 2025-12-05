"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Briefcase, 
  Building2, 
  ArrowRight, 
  Bell, 
  TrendingUp,
  Users,
  CheckCircle2,
  Sparkles
} from "lucide-react";

const UserSegments = () => {
  const segments = [
    {
      id: "students",
      title: "Students & Freshers",
      subtitle: "Launch Your Career",
      description: "Get notified about off-campus drives, internships, and entry-level openings directly from company career pages.",
      features: ["Career Page Updates", "Entry-Level Jobs", "Internships"],
      icon: GraduationCap,
      color: "blue",
      gradient: "from-blue-50 to-indigo-50",
      iconColor: "text-blue-600",
      bgBlob: "bg-blue-400",
      action: "Start Learning",
      // Visual: A notification card floating in
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
            <motion.div 
              className="absolute right-0 top-1/2 -translate-y-1/2 w-52 bg-white rounded-xl shadow-xl border border-blue-100 p-4 flex flex-col gap-3 z-10"
              whileHover={{ scale: 1.05, rotate: 0 }}
              initial={{ rotate: 3 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Bell size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="h-2 w-20 bg-zinc-200 rounded-full mb-1.5"></div>
                        <div className="h-2 w-12 bg-zinc-100 rounded-full"></div>
                    </div>
                </div>
                <div className="w-full bg-blue-50 rounded-lg border border-blue-100 p-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-xs font-semibold text-blue-700">New Off-Campus Drive!</span>
                </div>
            </motion.div>
            
            {/* Background decorative card */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-36 bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 -rotate-6 z-0"></div>
        </div>
      )
    },
    {
      id: "professionals",
      title: "Professionals",
      subtitle: "Level Up Your Career",
      description: "Seeking a change? Unlock salary insights, read authentic company reviews, and apply to direct client opportunities.",
      features: ["Company Reviews", "Salary Insights", "Direct Hiring"],
      icon: Briefcase,
      color: "purple",
      gradient: "from-purple-50 to-fuchsia-50",
      iconColor: "text-purple-600",
      bgBlob: "bg-purple-400",
      action: "Explore Jobs",
      // Visual: Salary Graph growing
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
             <motion.div 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-52 bg-white rounded-xl shadow-xl border border-purple-100 p-4 z-10"
                whileHover={{ scale: 1.05, rotate: 0 }}
                initial={{ rotate: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
             >
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Salary Growth</span>
                    <TrendingUp size={16} className="text-emerald-500" />
                </div>
                <div className="flex items-end gap-2 h-16 mb-2 px-2">
                    <div className="w-1/4 bg-purple-100 rounded-t-sm h-[40%]"></div>
                    <div className="w-1/4 bg-purple-200 rounded-t-sm h-[60%]"></div>
                    <div className="w-1/4 bg-purple-300 rounded-t-sm h-[80%]"></div>
                    <div className="w-1/4 bg-purple-500 rounded-t-sm h-[100%] relative">
                        {/* Tooltip */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                            +40%
                        </div>
                    </div>
                </div>
            </motion.div>
             <div className="absolute right-6 top-1/2 -translate-y-1/2 w-48 h-32 bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 rotate-3 z-0"></div>
        </div>
      )
    },
    {
      id: "employers",
      title: "Companies & Recruiters",
      subtitle: "Hire Top Talent",
      description: "Connect with verified job seekers. Post jobs and find the perfect match for your team with our smart hiring tools.",
      features: ["Post Jobs", "Verified Profiles", "Smart Matching"],
      icon: Building2,
      color: "emerald",
      gradient: "from-emerald-50 to-teal-50",
      iconColor: "text-emerald-600",
      bgBlob: "bg-emerald-400",
      action: "Post a Job",
      // Visual: Candidate profile match
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
             <motion.div 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-52 bg-white rounded-xl shadow-xl border border-emerald-100 p-4 z-10"
                whileHover={{ scale: 1.05, rotate: 0 }}
                initial={{ rotate: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
             >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                        <Users size={18} className="text-white" />
                    </div>
                    <div>
                        <div className="h-2 w-24 bg-zinc-200 rounded-full mb-1.5"></div>
                        <div className="flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <div className="h-2 w-12 bg-emerald-100 rounded-full"></div>
                        </div>
                    </div>
                </div>
                <div className="flex -space-x-2 px-1">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-sm ${i === 4 ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-200'}`}>
                           {i === 4 && '+12'}
                        </div>
                    ))}
                </div>
            </motion.div>
             <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-36 bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 -rotate-3 z-0"></div>
        </div>
      )
    }
  ];

  return (
    // Changed py-24 to pt-0 pb-24 as requested
    <section className="pt-0 pb-24 bg-white relative overflow-hidden">
        
        {/* Background Grid Pattern for texture */}
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
            
            {/* Header */}
            <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">Who's using JobBase?</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {segments.map((segment, i) => (
                    <motion.div
                        key={segment.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -8 }}
                        className="group relative bg-white rounded-[32px] border border-zinc-200 overflow-hidden hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-300 flex flex-col h-[400px] md:h-[340px] lg:h-[450px]"
                    >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${segment.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                        {/* Content Section */}
                        <div className="relative z-10 p-8 flex flex-col h-full">
                            {/* Header */}
                            <div className="mb-4">
                                <div className={`w-14 h-14 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center mb-5 ${segment.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                                    {React.createElement(segment.icon, { size: 28 })}
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 mb-1">{segment.title}</h3>
                                <p className={`text-sm font-bold uppercase tracking-wide opacity-80 ${segment.iconColor}`}>{segment.subtitle}</p>
                            </div>

                            {/* Description */}
                            <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-medium">
                                {segment.description}
                            </p>

                            {/* Features Tags */}
                            <div className="flex flex-wrap gap-2 mb-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                {segment.features.map((feat, i) => (
                                    <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/80 border border-zinc-200/60 text-zinc-600 shadow-sm backdrop-blur-sm">
                                        {feat}
                                    </span>
                                ))}
                            </div>

                            {/* Action - Appears/Moves on Hover */}
                            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-zinc-900 group-hover:gap-3 transition-all">
                                {segment.action} <ArrowRight size={16} />
                            </div>
                        </div>

                        {/* Visual/Image Section (Right Side on large, Bottom on small) */}
                        <div className="absolute right-0 bottom-0 w-1/2 h-full hidden md:block lg:w-[45%] pointer-events-none">
                            {/* Colored Blob Background - stronger blur for better blend */}
                            <div className={`absolute right-[-20%] bottom-[-20%] w-[120%] h-[120%] rounded-full opacity-10 blur-[60px] group-hover:opacity-20 transition-opacity ${segment.bgBlob}`} />
                            {segment.visual}
                        </div>
                        
                        {/* Mobile Visual Blob (Simplified) */}
                        <div className={`md:hidden absolute right-[-20%] bottom-[-20%] w-[200px] h-[200px] rounded-full opacity-10 blur-[50px] ${segment.bgBlob}`} />

                    </motion.div>
                ))}
            </div>
        </div>
    </section>
  );
};

export default UserSegments;