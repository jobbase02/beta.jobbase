"use client";

import React, { Suspense } from "react"; // 1. Import Suspense
import AuthForm from "../components/Auth";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react"; // Import a loader icon

// Optional: Create a simple loading component for the fallback
const AuthLoading = () => (
  <div className="w-full h-[400px] flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl border border-zinc-100 shadow-xl">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
    <p className="text-zinc-500 text-sm font-medium">Loading authentication...</p>
  </div>
);

export default function AuthPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-white selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      
      {/* Background Decor */}
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
        
        {/* The Auth Component Wrapped in Suspense */}
        <Suspense fallback={<AuthLoading />}>
           <AuthForm />
        </Suspense>
      </div>

    </div>
  );
}