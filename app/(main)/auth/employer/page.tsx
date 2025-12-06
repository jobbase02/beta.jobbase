"use client";

import { Suspense } from "react"; // 1. Import Suspense
import EmployerAuth from "./EmpAuthComponent";
import { ChevronLeft, Loader2 } from "lucide-react"; // Import a loader icon

// Optional: Create a simple loading component for the fallback
const AuthLoading = () => (
  <div className="w-full h-[400px] flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl border border-zinc-100 shadow-xl">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
    <p className="text-zinc-500 text-sm font-medium">Loading...</p>
  </div>
);

export default function AuthPage() {
  return (
        <Suspense fallback={<AuthLoading />}>
           <EmployerAuth />
        </Suspense>
     
  );
}