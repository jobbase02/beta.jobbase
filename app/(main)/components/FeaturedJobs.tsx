"use client";

import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation'; // Commented out for preview
import { 
  MapPin, 
  ArrowRight, 
  Building2, 
  Loader2,
  Calendar,
  Users,
  Flame,
  Briefcase
} from 'lucide-react';

// --- Types ---
interface Job {
  id: string;
  title: string;
  company_name: string;
  logo_url: string;
  location: string;
  created_at: string;
  last_date: string;
  description: string;
  application_count: number; 
}

// --- Mock Router for Preview Environment ---
const useRouter = () => {
  return {
    push: (path: string) => {
      console.log(`Navigating to: ${path}`);
      window.location.href = path;
    },
    back: () => window.history.back(),
    refresh: () => window.location.reload()
  };
};

export default function FeaturedJobsCarousel() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/user/see-jobs');
        const data = await res.json();
        if (data.success && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        }
      } catch (error) {
        console.error("Failed to load jobs", error);
        // Fallback mock data if API fails (for preview purposes)
        if (jobs.length === 0) {
            setJobs([
                {
                    id: '1',
                    title: 'Senior Frontend Engineer',
                    company_name: 'TechCorp',
                    logo_url: '',
                    location: 'San Francisco, CA',
                    created_at: new Date().toISOString(),
                    last_date: new Date(Date.now() + 864000000).toISOString(),
                    description: 'React expert needed',
                    application_count: 150
                },
                {
                    id: '2',
                    title: 'Product Designer',
                    company_name: 'Creative Studio',
                    logo_url: '',
                    location: 'Remote',
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                    last_date: new Date(Date.now() + 864000000).toISOString(),
                    description: 'UI/UX expert needed',
                    application_count: 320
                },
                 {
                    id: '3',
                    title: 'Backend Developer',
                    company_name: 'DataSystems',
                    logo_url: '',
                    location: 'New York, NY',
                    created_at: new Date(Date.now() - 172800000).toISOString(),
                    last_date: new Date(Date.now() + 864000000).toISOString(),
                    description: 'Node.js expert needed',
                    application_count: 85
                }
            ])
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center items-center bg-white">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (jobs.length === 0) return null;

  // Duplicate jobs for infinite loop (ensure we have enough items)
  // If we have few jobs, duplicate more times to fill the width
  const jobsToDisplay = jobs.length < 5 
    ? [...jobs, ...jobs, ...jobs, ...jobs, ...jobs, ...jobs] 
    : [...jobs, ...jobs, ...jobs];

  return (
    // Changed py-24 to pb-24 pt-0 to remove top padding
    <section className="pb-24 pt-0 relative overflow-hidden bg-white">
      
      {/* CSS for the Marquee Animation */}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          gap: 1.5rem; /* 24px gap */
          width: max-content;
          animation: scroll 60s linear infinite; 
        }
        /* Pause animation on hover */
        .marquee-container:hover .marquee-track {
          animation-play-state: paused;
        }
      `}</style>

      {/* --- Theme Alignment: Background Elements --- */}
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      {/* Soft Gradient Blob (Blue) - Adjusted position to differ slightly from Bento */}
      <div className="absolute right-0 bottom-0 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-blue-400 opacity-10 blur-[120px] pointer-events-none"></div>


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section - Aligned with Bento Typography */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold text-zinc-900 tracking-tight mb-4">
              Featured Opportunities.
            </h2>
            <p className="text-zinc-500 text-lg">
              Explore our hand-picked selection of the most exciting career opportunities available right now.
            </p>
          </div>
          
          <button 
            onClick={() => router.push('/jobs')}
            className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-300 shadow-sm"
          >
            View All Jobs <ArrowRight size={16} />
          </button>
        </div>

        {/* Infinite Scroll Wrapper */}
        <div 
            className="marquee-container relative w-full overflow-hidden -mx-6 px-6 py-4"
            style={{
                // Fade edges mask for smooth entry/exit
                maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
            }}
        >
          <div className="marquee-track"> 
            {jobsToDisplay.map((job, index) => (
              <div 
                  key={`${job.id}-${index}`} 
                  className="w-[360px] flex-shrink-0" 
              >
                  <JobCard job={job} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile "View All" Button */}
        <div className="md:hidden mt-8">
             <button 
               onClick={() => router.push('/jobs')}
               className="w-full py-4 rounded-2xl bg-zinc-900 text-white font-bold shadow-lg shadow-zinc-900/10 flex items-center justify-center gap-2 active:scale-98 transition-transform"
             >
               See More Jobs <ArrowRight size={16} />
             </button>
        </div>

      </div>
    </section>
  );
}

// --- Sub-Component: Job Card ---
function JobCard({ job }: { job: Job }) {
  const router = useRouter();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getPostedTime = (dateStr: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24));
    if (days === 0) return "New";
    if (days === 1) return "1d ago";
    return `${days}d ago`;
  };

  const handleApply = (e: React.MouseEvent) => {
      e.stopPropagation(); 
      router.push(`/apply?job_id=${job.id}`);
  };

  const isHighDemand = job.application_count > 200;

  return (
    // Updated: Added a gradient background to the wrapper for the thin border effect
    <div 
      className="group relative rounded-3xl p-[1px] bg-gradient-to-br from-violet-200 via-purple-100 to-blue-200 hover:from-violet-400 hover:via-purple-300 hover:to-blue-400 transition-all duration-300 h-[300px] w-full cursor-pointer hover:shadow-xl hover:shadow-purple-200/20"
      onClick={handleApply}
    >
      {/* Inner White Card */}
      <div className="bg-white rounded-[23px] h-full w-full p-6 flex flex-col justify-between relative overflow-hidden">
        
        {/* Subtle Gradient Glow on Hover (borrowed concept from Bento) */}
        <div className="absolute top-0 right-0 p-24 bg-gradient-to-br from-blue-50/0 to-blue-50/50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="relative z-10">
          {/* Top Row: Badges & Time */}
          <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-2">
                  {/* Replaced Pulse with a cleaner badge style */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                      Hiring
                  </div>

                  {isHighDemand && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-100/50">
                          <Flame size={12} className="fill-orange-500" />
                          High Demand
                      </div>
                  )}
              </div>

              <span className="text-xs font-medium text-zinc-500 bg-zinc-50 px-2 py-1 rounded-full border border-zinc-100">
                  {getPostedTime(job.created_at)}
              </span>
          </div>

          {/* Header: Logo & Title */}
          <div className="flex gap-4 mb-2">
              {/* Logo Box - Rounded-2xl to match Bento icon boxes */}
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                {job.logo_url ? (
                  <img src={job.logo_url} alt={job.company_name} className="w-8 h-8 object-contain" />
                ) : (
                  <Building2 className="text-zinc-400 w-6 h-6" />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-lg text-zinc-900 leading-tight truncate group-hover:text-blue-600 transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm font-medium text-zinc-600 truncate mt-0.5">{job.company_name}</p>
              </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 pt-4 mt-auto border-t border-zinc-50">
            {/* Chips Container */}
            <div className="flex flex-wrap gap-2 text-sm text-zinc-600 mb-4">
                <div className="flex items-center gap-2 bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-100">
                    <MapPin size={14} className="text-zinc-400" />
                    <span className="truncate text-xs font-medium">{job.location || 'Remote'}</span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-100">
                    <Calendar size={14} className="text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-400">Deadline:</span>
                    <span className="truncate text-xs font-medium">{formatDate(job.last_date)}</span>
                </div>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
                    <Users size={14} className="text-zinc-400" />
                    <span>{job.application_count} applicants</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ArrowRight size={14} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}