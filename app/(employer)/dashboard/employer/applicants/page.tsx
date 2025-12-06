// app/jobs/[job_id]/applicants/page.jsx (or similar dynamic route)

import React, { Suspense } from 'react';
// Yahan component ka naam 'ApplicantsContent' use kiya gaya hai
import ApplicantsContent from './ApplicantsComponent'; 

// Simple Loading UI for the Suspense fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 text-blue-600 animate-spin border-4 border-t-4 border-blue-200 border-t-blue-600 rounded-full" />
        <p className="text-gray-500 font-medium">Loading candidate applications...</p>
      </div>
    </div>
  );
}

// 🚨 Main Page Component (Server Component by default)
export default function ApplicantsPageWrapper() {
  return (
    // ✅ Suspense boundary wrapping the Client Component
    // This resolves the build error caused by accessing window.location.search (or useSearchParams)
    <Suspense fallback={<LoadingFallback />}>
      {/* Your client component which reads URL search params */}
      <ApplicantsContent />
    </Suspense>
  );
}