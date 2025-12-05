"use client";

import React from "react";
import AuthForm from "../components/Auth";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function AuthPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-white selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      
      {/* Background Decor (Matching your design system) */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%)'
          }}
        />
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to Home Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 transition-colors font-medium text-sm"
        >
          <ChevronLeft size={16} /> Back to Home
        </Link>
        
        {/* The Auth Component */}
        <AuthForm />
      </div>

    </div>
  );
}