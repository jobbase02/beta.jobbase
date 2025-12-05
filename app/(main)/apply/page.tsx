"use client";

import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon,
  Globe,
  Users,
  Briefcase
} from 'lucide-react';

// --- Types ---
interface Company {
  name: string;
  description?: string;
  website?: string;
  location?: string;
  size?: string;
  logo_url?: string;
}

interface Employer {
  name: string;
  email: string;
  companies?: Company;
}

interface JobDetails {
  id: string;
  title: string;
  description: string;
  status: boolean; // true = Active, false = Closed
  last_date: string;
  created_at: string;
  
  // Flattened helpers from API
  company_name?: string; 
  company_logo?: string;
  status_label?: string;

  // Nested data from API
  employers?: Employer;
}

export default function ApplyPage() {
  // --- Standard React replacements for Next.js hooks ---
  const [jobId, setJobId] = useState<string | null>(null);

  // Mock router for preview environment
  const router = {
    push: (path: string) => {
      console.log('Navigating to:', path);
      // window.location.href = path; // Uncomment for real nav
    },
    back: () => {
      console.log('Going back');
      // window.history.back(); // Uncomment for real nav
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setJobId(params.get('job_id'));
    }
  }, []);
  // ----------------------------------------------------

  // State
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [alreadyApplied, setAlreadyApplied] = useState(false); // New State

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    resume_url: ''
  });

  // Helper: Check if job is active
  const isJobOpen = job?.status === true;

  // --- 1. Auth Check & User Data Fetch (Updated with Redirect) ---
  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      try {
        const res = await fetch('/api/user/data');
        
        // --- NEW: Redirect Logic ---
        if (!res.ok) {
          // 1. Get current full URL
          const currentUrl = window.location.href;
          // 2. Encode it to be safe as a query parameter
          const encodedUrl = encodeURIComponent(currentUrl);
          // 3. Redirect to auth page with the return link
          window.location.href = `/auth?redirect=${encodedUrl}`;
          return; // Stop execution
        }
        // ---------------------------

        // If authorized, proceed to populate form data
        const responseJson = await res.json();
        const userData = responseJson.data;

        if (userData && userData.id) {
          setFormData(prev => ({
            ...prev,
            name: userData.full_name || '',
            email: userData.email || '',
            resume_url: userData.resume_url || prev.resume_url 
          }));
        }
      } catch (err) {
        // Optional: If the network request fails entirely, you might also want to redirect
        console.error('Auth check failed:', err);
      }
    };

    // We run this when jobId exists, or you can change dependencies to [] to run immediately on mount
    if (jobId) {
      checkAuthAndFetchUser();
    }
  }, [jobId]);

  // --- 1. Auth Check & User Data Fetch ---
  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      try {
        const res = await fetch('/api/user/data');
        if (!res.ok) throw new Error('Not authenticated');

        const responseJson = await res.json();
        const userData = responseJson.data;

        if (userData && userData.id) {
          setFormData(prev => ({
            ...prev,
            name: userData.full_name || '',
            email: userData.email || '',
            resume_url: userData.resume_url || prev.resume_url 
          }));
        }
      } catch (err) {
        console.log('User not authenticated or API unavailable');
      }
    };

    if (jobId) {
      checkAuthAndFetchUser();
    }
  }, [jobId]);

  // --- 2. Fetch Job Details ---
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;

      try {
        const res = await fetch('/api/user/job-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: jobId }),
        });
        
        const data = await res.json();
        if (data.success) {
          setJob(data.job);
        } else {
          setError(data.error || 'Failed to load job details');
        }
      } catch (err) {
        setError('An unexpected error occurred while loading the job.');
        
        // --- MOCK DATA FOR PREVIEW IF API FAILS ---
        setJob({
          id: '123',
          title: 'Senior Frontend Developer',
          description: '<p>We are looking for an experienced developer.</p><ul><li>React & Next.js mastery</li><li>Experience with Tailwind CSS</li><li>Understanding of backend APIs</li></ul><p>Join us today!</p>',
          status: true,
          last_date: '2023-12-31',
          created_at: new Date().toISOString(),
          company_name: 'TechFlow Solutions',
          company_logo: '', 
          employers: {
            name: 'Sarah Connor',
            email: 'sarah@techflow.com',
            companies: {
              name: 'TechFlow Solutions',
              description: 'TechFlow is a leading provider of innovative software solutions.',
              website: 'https://example.com',
              location: 'San Francisco, CA',
              size: '50-100'
            }
          }
        });
        // ------------------------------------------
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Reset "already applied" state if they change email, to allow retrying with different email
    if (e.target.name === 'email' && alreadyApplied) {
      setAlreadyApplied(false);
      setError('');
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const normalizeUrl = (url: string) => {
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!isJobOpen) {
      setError('This job is no longer accepting applications.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/user/submit-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          candidate_name: formData.name,
          candidate_email: formData.email,
          resume_url: normalizeUrl(formData.resume_url)
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Specific handling for "Already Applied"
        setAlreadyApplied(true);
        setError(data.error || 'You have already applied for this position.');
        setSubmitting(false);
        return;
      }

      if (data.success) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Failed to submit application. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render: Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-zinc-500 font-medium">Loading application...</p>
        </div>
      </div>
    );
  }

  // --- Render: Missing Job ID ---
  if ((!jobId && !job && !loading)) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900">Job Not Found</h2>
          <p className="text-zinc-500 mt-2">No Job ID provided.</p>
           <button onClick={() => window.location.search = '?job_id=demo'} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            View Demo Job
          </button>
        </div>
      </div>
    )
  }

  // --- Render: Success State ---
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center border border-zinc-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Application Sent!</h2>
          <p className="text-zinc-600 mb-8">
            Your application for <span className="font-semibold text-zinc-900">{job?.title}</span> has been submitted successfully.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => router.push('/jobs')} 
              className="w-full py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const company = job?.employers?.companies;
  const employerName = job?.employers?.name;
  
  // Logic for button disable/text
  const isButtonDisabled = submitting || !isJobOpen || alreadyApplied;
  let buttonText = 'Submit Application';
  if (submitting) buttonText = 'Submitting...';
  else if (alreadyApplied) buttonText = 'Already Applied';
  else if (!isJobOpen) buttonText = 'Application Closed';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* --- Left Column: Job & Company Info --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Job Header Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-zinc-200 shadow-sm relative overflow-hidden">
               {!isJobOpen && (
                 <div className="absolute top-0 right-0 left-0 bg-red-50 border-b border-red-100 p-2 text-center text-red-700 text-sm font-medium">
                   This position is currently closed
                 </div>
               )}

              <div className={`flex items-start gap-6 ${!isJobOpen ? 'mt-6' : ''}`}>
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 p-2">
                  {job?.company_logo ? (
                    <img src={job.company_logo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 md:w-10 md:h-10 text-zinc-300" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">{job?.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm md:text-base text-zinc-500">
                    <span className="flex items-center gap-1.5 font-medium text-zinc-700">
                      <Building2 size={16} /> {job?.company_name || 'Hidden Company'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} /> { company?.location || 'Remote'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} /> Posted {new Date(job?.created_at || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description Content */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-zinc-200 shadow-sm">
              <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                Job Description
              </h3>
              
              {/* Added explicit classes for list styling */}
              <div 
                className="prose prose-zinc max-w-none 
                  prose-headings:font-bold prose-headings:text-zinc-900 
                  prose-p:text-zinc-600 prose-a:text-blue-600 prose-li:text-zinc-600
                  prose-ul:list-disc prose-ul:ml-6 
                  prose-ol:list-decimal prose-ol:ml-6
                  [&>ul]:list-disc [&>ul]:ml-6 
                  [&>ol]:list-decimal [&>ol]:ml-6"
                dangerouslySetInnerHTML={{ __html: job?.description || '<p>No description provided.</p>' }}
              />
            </div>

             {/* Company & Employer Details Section */}
             {(company || employerName) && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-zinc-200 shadow-sm">
                <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                  About the Company
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {company?.size && (
                     <div className="flex items-center gap-3 text-zinc-600">
                       <Users className="w-5 h-5 text-zinc-400" />
                       <span>{company.size} Employees</span>
                     </div>
                  )}
                  {company?.website && (
                     <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:underline">
                       <Globe className="w-5 h-5 text-blue-500" />
                       <span>Visit Website</span>
                     </a>
                  )}
                  {employerName && (
                     <div className="flex items-center gap-3 text-zinc-600">
                        <Briefcase className="w-5 h-5 text-zinc-400" />
                        <span>Hiring Manager: {employerName}</span>
                     </div>
                  )}
                </div>

                {company?.description && (
                  <p className="text-zinc-600 leading-relaxed">
                    {company.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* --- Right Column: Application Form --- */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg sticky top-8 overflow-hidden">
              <div className={`p-6 ${isJobOpen && !alreadyApplied ? 'bg-zinc-900' : 'bg-zinc-600'} text-white`}>
                <h3 className="text-lg font-bold">
                  {alreadyApplied ? 'Application Status' : (isJobOpen ? 'Apply for this position' : 'Applications Closed')}
                </h3>
                <p className="text-zinc-400 text-sm mt-1">
                  {alreadyApplied ? 'You have already applied.' : (isJobOpen 
                    ? 'Please review your details below.' 
                    : 'This job is no longer accepting new applications.')}
                </p>
              </div>

              <div className="p-6 md:p-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-zinc-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      disabled={isButtonDisabled}
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-zinc-50/50 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-zinc-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      disabled={isButtonDisabled}
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-zinc-50/50 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Resume URL Field */}
                  <div className="space-y-2">
                    <label htmlFor="resume_url" className="text-sm font-semibold text-zinc-700 flex items-center justify-between">
                      <span>Resume / Portfolio Link <span className="text-red-500">*</span></span>
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-3.5 text-zinc-400 w-5 h-5" />
                      <input
                        type="text"
                        id="resume_url"
                        name="resume_url"
                        required
                        disabled={isButtonDisabled}
                        value={formData.resume_url}
                        onChange={handleInputChange}
                        placeholder="drive.google.com/..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-zinc-50/50 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isButtonDisabled}
                    className={`w-full py-4 mt-4 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2
                      ${!isButtonDisabled
                        ? 'bg-gradient-to-r from-blue-600 to-violet-600 shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.01] active:scale-[0.98]' 
                        : 'bg-zinc-400 cursor-not-allowed opacity-70'
                      }`}
                  >
                    {submitting && <Loader2 className="animate-spin w-5 h-5" />}
                    {buttonText}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}