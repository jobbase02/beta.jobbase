// app/jobs/[job_id]/applicants/page.jsx (or similar dynamic route)

import { Suspense } from 'react';
// Yahan component ka naam 'ApplicantsContent' use kiya gaya hai
import ApplicantsContent from './ApplicantsComponent'; 


// 🚨 Main Page Component (Server Component by default)
export default function ApplicantsPageWrapper() {
  return (
    // ✅ Suspense boundary wrapping the Client Component
    // This resolves the build error caused by accessing window.location.search (or useSearchParams)
    <Suspense fallback={<></>}>
      {/* Your client component which reads URL search params */}
      <ApplicantsContent />
    </Suspense>
  );
}