// app/post/page.jsx
"use client";
import { Suspense } from 'react';
import ApplyPage from './ApplyComponent'; // Apne component ka path yahan check kar lena

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ApplyPage />
    </Suspense>
  );
}

// Simple Loading UI (Jab tak data load hoga ye dikhega)
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-12 px-4 flex justify-center">
       <div className="text-slate-500 font-medium">Loading post...</div>
    </div>
  );
}