// components/EmployerDashboard.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { 
    Briefcase, 
    Users, 
    FileText,
    Clock, 
    Loader2,
    CalendarDays,
    ArrowRight,
    AlertCircle
} from 'lucide-react';

// Define the structure of the data expected from the API
interface DashboardStats {
    totalJobs: number;
    totalApplications: number;
}

interface RecentJob {
    id: string;
    title: string;
    created_at: string;
    status: boolean; // Assuming 'status' is a boolean in your DB (true=Active, false=Inactive)
    applicationCount: number;
}

interface DashboardData {
    stats: DashboardStats;
    recentJobs: RecentJob[];
}

const EmptyDashboardData: DashboardData = {
    stats: { totalJobs: 0, totalApplications: 0 },
    recentJobs: []
};

// --- Dashboard Card Component (No changes needed) ---
function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: React.ElementType, color: string }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-shadow hover:shadow-lg">
            <div className={`flex items-center justify-between`}>
                <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
            </div>
            <div className="mt-4">
                <p className="text-3xl font-extrabold text-gray-900">{value.toLocaleString()}</p>
            </div>
        </div>
    );
}

// --- Main Dashboard Component ---
export default function EmployerDashboard() {
    const router = useRouter(); // Initialize router hook
    
    const [data, setData] = useState<DashboardData>(EmptyDashboardData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/employer/dashboard');
            
            if (response.ok) {
                const result = await response.json();
                setData(result);
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Server error' }));
                setError(`Failed to fetch dashboard data: ${errorData.message || response.statusText}`);
            }
        } catch (err) {
            console.error(err);
            setError("A network error occurred while fetching dashboard data.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- New Navigation Handler ---
    const handleJobClick = (jobId: string) => {
        // Redirects to /dashboard/employer/applicants?job_id={jobId}
        router.push(`/dashboard/employer/applicants?job_id=${jobId}`);
    };
    // -----------------------------


    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-red-50 p-6 rounded-xl border border-red-200 flex items-center gap-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <p className="text-red-700 font-medium">Error: {error}. Please check your authentication and API access.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="mt-4 text-gray-600">Loading your recruitment summary...</p>
            </div>
        );
    }
    
    // --- Render Content ---
    const { stats, recentJobs } = data;

    return (
        <main className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Dashboard Header */}
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
                    Recruitment Overview
                </h1>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
                    <StatCard 
                        title="Total Jobs Posted" 
                        value={stats.totalJobs} 
                        icon={Briefcase} 
                        color="text-indigo-600"
                    />
                    <StatCard 
                        title="Total Applications" 
                        value={stats.totalApplications} 
                        icon={Users} 
                        color="text-green-600"
                    />
                    <StatCard 
                        title="Jobs Currently Active" 
                        value={recentJobs.filter(j => j.status).length} 
                        icon={Clock} 
                        color="text-yellow-600"
                    />
                    <StatCard 
                        title="Avg Applications per Job" 
                        value={stats.totalJobs > 0 ? Math.round(stats.totalApplications / stats.totalJobs) : 0} 
                        icon={FileText} 
                        color="text-pink-600"
                    />
                </div>

                {/* Recent Jobs Section */}
                <div className="mt-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Recent Job Activity</h2>
                        {/* Ensure this path is correct based on your routing */}
                        <a href="/dashboard/employer/jobs" className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                            View All Jobs <ArrowRight className="w-4 h-4 ml-1" />
                        </a>
                    </div>

                    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
                        {recentJobs.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">
                                You haven't posted any jobs yet. Get started!
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {recentJobs.map((job) => (
                                    // 🛠️ Updated to make the entire list item clickable
                                    <li 
                                        key={job.id} 
                                        className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => handleJobClick(job.id)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Briefcase className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                            <div>
                                                <p className="text-lg font-semibold text-gray-900">{job.title}</p>
                                                <p className="text-sm text-gray-500 flex items-center mt-0.5">
                                                    <CalendarDays className="w-3 h-3 mr-1.5" /> 
                                                    Posted: {new Date(job.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">{job.applicationCount}</p>
                                            <p className="text-sm text-gray-500">Applications</p>
                                            <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                job.status
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {job.status ? 'Active' : 'Closed'}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
}