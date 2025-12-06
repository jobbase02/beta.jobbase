// components/ApplicantsPage.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { 
    Loader2, 
    CheckCircle2, 
    AlertCircle, 
    Mail, 
    FileText, 
    Clock, 
    ArrowLeft,
    User,
    ChevronDown,
    ListFilter,
    Search
} from 'lucide-react';

// Define the Applicant structure. 
// Note: We use string here to be flexible, but ApplicantStatus for strict checks.
interface Applicant {
    id: string;
    job_id: string;
    candidate_name: string;
    candidate_email: string;
    resume_url: string;
    status: string; // Changed to 'string' to handle unexpected DB values gracefully
    applied_at: string;
}

// Define the Status type for known valid statuses
type ApplicantStatus = 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED';

// Map status (DB value) to UI properties
const statusMap: Record<ApplicantStatus, { icon: React.ElementType, color: string, display: string }> = {
    'PENDING': { icon: Clock, color: 'text-yellow-700 bg-yellow-100 border-yellow-300', display: 'Pending' },
    'REVIEWED': { icon: ListFilter, color: 'text-blue-700 bg-blue-100 border-blue-300', display: 'Reviewed' },
    'SHORTLISTED': { icon: CheckCircle2, color: 'text-green-700 bg-green-100 border-green-300', display: 'Shortlisted' },
    'REJECTED': { icon: AlertCircle, color: 'text-red-700 bg-red-100 border-red-300', display: 'Rejected' },
};

// Fallback for unknown or malformed status
const UNKNOWN_STATUS = { 
    icon: AlertCircle, 
    color: 'text-gray-700 bg-gray-100 border-gray-300', 
    display: 'Unknown Status' 
};


// Utility to get job_id from the URL (simulating Next.js environment)
const getJobIdFromUrl = () => {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        return params.get('job_id');
    }
    return null;
};

// Mock Job Title (since we don't fetch the job details here)
const MOCK_JOB_TITLE = "Senior Frontend Developer";

export default function ApplicantsPage() {
    const jobId = getJobIdFromUrl();
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'All' | ApplicantStatus>('All');
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching ---
    useEffect(() => {
        if (!jobId) {
            setError("Error: No job ID provided in the URL.");
            setIsLoading(false);
            return;
        }
        fetchApplicants(jobId);
    }, [jobId]);

    const fetchApplicants = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/employer/jobs/applicants?job_id=${id}`);
            
            if (res.ok) {
                const data = await res.json();
                
                // --- 🛠️ FIX: Clean the incoming status data ---
                const cleanedApplicants: Applicant[] = (data.applicants || []).map((app: Applicant) => ({
                    ...app,
                    // Ensure status is always UPPERCASE for lookup
                    status: app.status ? app.status.toUpperCase() : 'PENDING' 
                }));
                // ---------------------------------------------
                
                setApplicants(cleanedApplicants);

            } else {
                let errorMessage = res.statusText;
                
                const contentType = res.headers.get("content-type");
                
                if (contentType && contentType.includes("application/json")) {
                    try {
                        const errorData = await res.json();
                        errorMessage = errorData.message || res.statusText;
                    } catch (e) {
                        console.error("Failed to parse JSON error body:", e);
                        errorMessage = `Server Error (Status ${res.status}): Response body was empty or malformed.`;
                    }
                } else {
                    errorMessage = `Server Error (Status ${res.status}): ${res.statusText}. Response was not JSON.`;
                }

                setError(`Failed to fetch applicants: ${errorMessage}`);
            }
        } catch (err) {
            console.error(err);
            setError("A network error occurred while fetching data.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Status Update Handler ---
    const handleStatusUpdate = async (applicantId: string, newStatus: ApplicantStatus) => {
        const applicantToUpdate = applicants.find(a => a.id === applicantId);
        if (!applicantToUpdate || !jobId) return;

        // Note: newStatus is already guaranteed to be a valid ApplicantStatus (uppercase)
        const originalStatus = applicantToUpdate.status;
        
        // 1. Optimistic UI Update
        setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, status: newStatus } : a));

        try {
            // 2. API Call to update DB - includes job_id for ownership check
            const res = await fetch('/api/employer/jobs/applicants', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicant_id: applicantId,
                    job_id: jobId, 
                    status: newStatus,
                }),
            });

            if (!res.ok) {
                // 3. Revert on failure
                setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, status: originalStatus } : a));
                
                let failureMessage = 'Server error during status update.';
                const contentType = res.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                    const errorData = await res.json();
                    failureMessage = errorData.message || failureMessage;
                }
                
                alert(`Failed to update status: ${failureMessage}`); 
            }
            // If res.ok, the optimistic update holds.
        } catch (err) {
            console.error("Status update error:", err);
            // 3. Revert on network error
            setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, status: originalStatus } : a));
            alert("Network error updating status.");
        }
    };

    // --- Rendering Logic ---

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
                <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-800">Application Error</h2>
                <p className="text-gray-500 mt-2 text-center max-w-md">{error}</p>
                <button 
                    onClick={() => window.history.back()}
                    className="mt-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                </button>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-gray-500 font-medium">Loading candidate applications...</p>
            </div>
        );
    }

    const filteredApplicants = applicants.filter(app => 
        filterStatus === 'All' || app.status === filterStatus
    );

    // Get available statuses for the filter dropdown
    const availableStatuses = Object.keys(statusMap) as ApplicantStatus[];

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Section */}
                <div className="mb-8">
                    {/* Simulated back button */}
                    <button 
                        onClick={() => window.history.back()}
                        className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 mb-3 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Back to Job Listings
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Applicants for: {MOCK_JOB_TITLE}
                    </h1>
                    
                </div>

                {/* Controls and Stats */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="text-lg font-semibold text-gray-800">
                        {filteredApplicants.length} Candidates Found
                    </div>
                    
                    {/* Status Filter Dropdown */}
                    <div className="relative inline-block text-left w-full sm:w-auto">
                        <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
                        <div className="flex items-center gap-2">
                            <ListFilter className="w-4 h-4 text-gray-500" />
                            <select
                                id="status-filter"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as 'All' | ApplicantStatus)}
                                className="appearance-none block w-full sm:w-48 bg-white border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            >
                                <option value="All">All Statuses</option>
                                {availableStatuses.map(statusKey => (
                                    <option key={statusKey} value={statusKey}>{statusMap[statusKey].display}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Applicants List */}
                {filteredApplicants.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <div className="bg-blue-50 p-4 rounded-full mb-4">
                            <Search className="h-8 w-8 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No applicants match filter</h3>
                        <p className="mt-1 text-sm text-gray-500">Try changing the status filter or ensure the job ID is correct.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredApplicants.map((applicant) => {
                            // 🛠️ FIX: Use the cleaned status, cast it to the correct type for lookup
                            const safeStatus = (applicant.status as ApplicantStatus) in statusMap 
                                ? applicant.status as ApplicantStatus 
                                : 'PENDING'; // Default to PENDING if status is invalid/unknown

                            const { icon: StatusIcon, color: statusColor, display: statusDisplay } = statusMap[safeStatus as ApplicantStatus] || UNKNOWN_STATUS;
                            
                            return (
                                <div key={applicant.id} className="bg-white p-5 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center border border-gray-200 hover:shadow-lg transition-all duration-200">
                                    
                                    {/* Candidate Info */}
                                    <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-1/3">
                                        <User className="w-6 h-6 text-blue-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-base font-semibold text-gray-900 line-clamp-1">{applicant.candidate_name}</p>
                                            <a 
                                                href={`mailto:${applicant.candidate_email}`} 
                                                className="flex items-center text-xs text-gray-500 hover:text-blue-600 transition-colors"
                                            >
                                                <Mail className="w-3 h-3 mr-1" />
                                                {applicant.candidate_email}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Status and Applied Date */}
                                    <div className="flex items-center gap-6 w-full md:w-1/3 justify-start md:justify-center">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                                            <StatusIcon className="w-3 h-3 mr-1.5" />
                                            {statusDisplay}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center">
                                            <Clock className="w-3 h-3 mr-1.5" />
                                            Applied: {new Date(applicant.applied_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex items-center gap-3 mt-4 md:mt-0 w-full md:w-1/3 justify-end">
                                        
                                        {/* Resume Link */}
                                        <a 
                                            href={applicant.resume_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                                            title="View Candidate Resume"
                                        >
                                            <FileText className="w-4 h-4 mr-2" />
                                            Resume
                                        </a>

                                        {/* Status Dropdown */}
                                        <div className="relative">
                                            <select
                                                // Display the current (cleaned) status
                                                value={applicant.status}
                                                // Handle update using a guaranteed valid status key
                                                onChange={(e) => handleStatusUpdate(applicant.id, e.target.value as ApplicantStatus)}
                                                className="appearance-none block w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-3 pr-8 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow min-w-[120px]"
                                            >
                                                {availableStatuses.map(statusKey => (
                                                    <option key={statusKey} value={statusKey}>
                                                        {statusMap[statusKey].display}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}