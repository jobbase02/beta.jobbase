"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Terminal, Users, Briefcase, Trophy } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 md:pt-28 md:pb-32 px-6 overflow-hidden bg-white selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- Background Elements --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Subtle Grid */}
        <div 
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
          }}
        />
        
        {/* Ambient Gradients - Shifted for Split Layout */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
        
        {/* --- LEFT COLUMN: Content --- */}
        <div className="flex flex-col items-start text-left">
          
         {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            // CHANGE HERE: Removed 'mb-8', added 'mt-6 mb-2'
            // 'mt-6' pushes the badge down (keeping title static)
            // 'mb-2' creates the small gap between badge and title
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-sm font-semibold text-blue-600 mt-6 mb-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            #1 Community for Tech Jobs
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 leading-[1.1] mb-6"
          >
            Your Next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Big Move.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-500 max-w-lg mb-8 leading-relaxed font-medium"
          >
            Unlock direct access to top tech companies. Verified listings, salary insights, and a community that helps you win.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 w-full sm:w-auto"
          >
            <button className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-zinc-900/20 active:scale-95 flex items-center gap-2">
              Find a Job <ArrowRight size={18} />
            </button>
            <button className="px-8 py-4 bg-white border border-zinc-200 text-zinc-700 font-semibold rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-95 flex items-center gap-2">
              Explore Prep Resources
            </button>
          </motion.div>

          {/* Horizontal Divider */}
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h-px bg-zinc-200 w-full my-10"
          />

          {/* Stats Row */}
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.5, delay: 0.6 }}
             className="grid grid-cols-3 gap-8 w-full"
          >
            <div>
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-2xl md:text-3xl">
                15k+ <Briefcase size={20} className="text-blue-500" />
              </div>
              <div className="text-sm text-zinc-500 font-medium mt-1">Jobs Shared</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-2xl md:text-3xl">
                8.5k+ <Users size={20} className="text-purple-500" />
              </div>
              <div className="text-sm text-zinc-500 font-medium mt-1">Active Members</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-2xl md:text-3xl">
                1.2k+ <Trophy size={20} className="text-yellow-500" />
              </div>
              <div className="text-sm text-zinc-500 font-medium mt-1">Placed Candidates</div>
            </div>
          </motion.div>

        </div>

        {/* --- RIGHT COLUMN: macOS Terminal Animation --- */}
        <motion.div
           initial={{ opacity: 0, x: 50 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8, delay: 0.4 }}
           className="relative mx-auto w-full max-w-lg lg:max-w-none"
        >
           {/* Decorative Backdrops behind Terminal */}
           <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30 animate-pulse" />
           
           <div className="relative rounded-xl bg-[#1e1e1e] border border-zinc-800 shadow-2xl overflow-hidden min-h-[400px] flex flex-col">
              
              {/* macOS Header */}
              <div className="bg-[#2d2d2d] px-4 py-3 flex items-center gap-2 border-b border-zinc-700">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
                 </div>
                 <div className="flex-1 text-center text-xs font-mono text-zinc-400 opacity-60">
                    job_success_tracker.exe
                 </div>
              </div>

              {/* Terminal Content */}
              <div className="p-6 font-mono text-sm md:text-base text-zinc-300 space-y-4">
                 
                 {/* Line 0: Init */}
                 <div className="flex items-center gap-2">
                    <span className="text-green-400">➜</span>
                    <span className="text-blue-400">~</span>
                    <span className="text-zinc-100"> initiate_application_process</span>
                 </div>

                 {/* Line 1: Application Submitted */}
                 <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 }}
                    className="pl-4 border-l-2 border-zinc-700 py-1"
                 >
                    <div className="text-zinc-500 text-xs mb-1">Step 1: Processing...</div>
                    <div className="flex items-center gap-2 text-white">
                       <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
                          <Check size={10} className="text-blue-400" />
                       </div>
                       <span className="text-blue-200">Application:</span> 
                       <span className="font-bold text-white">Submitted</span>
                    </div>
                 </motion.div>

                 {/* Line 2: Resume Shortlisted */}
                 <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 3.5 }}
                    className="pl-4 border-l-2 border-zinc-700 py-1"
                 >
                    <div className="text-zinc-500 text-xs mb-1">Step 2: HR Review...</div>
                    <div className="flex items-center gap-2 text-white">
                        <div className="w-4 h-4 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50">
                          <Check size={10} className="text-yellow-400" />
                       </div>
                       <span className="text-yellow-200">Resume:</span> 
                       <span className="font-bold text-white">Shortlisted</span>
                    </div>
                 </motion.div>

                  {/* Line 3: Result Selected */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 5.5 }}
                    className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                 >
                    <div className="flex items-center gap-2 text-green-400 font-bold text-lg mb-1">
                       <Terminal size={18} /> Status Update
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                       </span>
                       <span className="text-white text-xl font-bold tracking-wide">Result: Selected!</span>
                    </div>
                    <div className="text-green-300/60 text-xs mt-2 font-sans">
                       offer_letter_generated.pdf sent to email.
                    </div>
                 </motion.div>

                 {/* Typing Cursor */}
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 6 }}
                    className="flex items-center gap-2 mt-4"
                 >
                    <span className="text-green-400">➜</span>
                    <span className="text-blue-400">~</span>
                    <motion.span 
                       animate={{ opacity: [0, 1, 0] }} 
                       transition={{ repeat: Infinity, duration: 0.8 }}
                       className="w-2.5 h-5 bg-zinc-400 block"
                    />
                 </motion.div>

              </div>
           </div>

           {/* Floating Badge on top of screen */}
           <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-zinc-100 hidden md:block"
           >
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                    <Briefcase size={20} />
                 </div>
                 <div>
                    <div className="text-xs text-zinc-500 font-bold">New Offer</div>
                    <div className="font-bold text-zinc-900">$120,000/yr</div>
                 </div>
              </div>
           </motion.div>

        </motion.div>

      </div>
    </section>
  );
};

export default Hero;