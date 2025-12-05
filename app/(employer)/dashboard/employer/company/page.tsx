"use client";

import React, { useState, useEffect } from 'react';
import { 
    Building2, Globe, MapPin, Users, FileText, 
    Loader2, Save, LayoutDashboard, Image as ImageIcon, 
    AlertCircle, CheckCircle2, Edit2, X, ExternalLink
} from 'lucide-react';

interface CompanyData {
    name: string;
    website: string;
    description: string;
    location: string;
    size: string;
    logo_url: string;
}

const EmptyCompany: CompanyData = {
    name: '', website: '', description: '', location: '', size: '', logo_url: ''
};

export default function CompanySettings() {
    const [company, setCompany] = useState<CompanyData>(EmptyCompany);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // New state for Modal
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // --- Fetch Data on Mount ---
    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/employer/company');
            const data = await res.json();
            
            if (res.ok && data.company) {
                setCompany({
                    name: data.company.name || '',
                    website: data.company.website || '',
                    description: data.company.description || '',
                    location: data.company.location || '',
                    size: data.company.size || '',
                    logo_url: data.company.logo_url || '',
                });
            } else {
                console.log("No company data linked yet.");
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network connection failed.' });
        } finally {
            setIsLoading(false);
        }
    };

    // --- New Function: Sync Employer Data ---
    const syncEmployerData = async () => {
        try {
            // Simply calling the API as requested
            await fetch('/api/employer/company/sync');
            console.log("Employer data synced successfully");
        } catch (error) {
            console.error("Failed to sync employer data", error);
        }
    };

    // --- Handle Updates ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/employer/company', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(company),
            });

            const data = await res.json();

            if (res.ok) {
                // 1. Update local state
                if (data.company) {
                     setCompany({
                        name: data.company.name || '',
                        website: data.company.website || '',
                        description: data.company.description || '',
                        location: data.company.location || '',
                        size: data.company.size || '',
                        logo_url: data.company.logo_url || '',
                    });
                }
                
                // 2. Call the Sync API as requested
                await syncEmployerData();

                // 3. UI Success handling
                setMessage({ type: 'success', text: 'Company details updated and synced!' });
                setIsModalOpen(false); // Close modal on success
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update company.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setCompany({ ...company, [e.target.name]: e.target.value });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] bg-gray-50/50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500 font-medium">Loading company details...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50/50 py-12 relative">
             {/* Decorative Background Header */}
             <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-blue-700 to-indigo-900 transform -skew-y-2 origin-top-left -z-10 shadow-lg" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 text-white">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Building2 className="w-8 h-8 text-blue-200" />
                            Company Profile
                        </h1>
                        <p className="text-blue-100 mt-2 text-sm md:text-base opacity-90 max-w-2xl">
                            Manage the company information visible to candidates.
                        </p>
                    </div>
                    
                    {/* Edit Button (Opens Modal) */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4 md:mt-0 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-medium"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                    </button>
                </div>

                {/* Notifications */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl shadow-sm border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                        message.type === 'success' 
                            ? 'bg-green-50 text-green-800 border-green-200' 
                            : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                        <p className="font-medium">{message.text}</p>
                    </div>
                )}

                {/* --- READ ONLY VIEW (Default) --- */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Logo Display */}
                            <div className="w-32 h-32 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                                {company.logo_url ? (
                                    <img src={company.logo_url} alt="Company Logo" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <Building2 className="w-12 h-12 text-gray-300" />
                                )}
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{company.name || "Company Name Not Set"}</h2>
                                    {company.website && (
                                        <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium mt-1">
                                            <Globe className="w-4 h-4" />
                                            {company.website}
                                            <ExternalLink className="w-3 h-3 ml-0.5" />
                                        </a>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase">Headquarters</p>
                                            <p className="font-medium">{company.location || "Not specified"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase">Size</p>
                                            <p className="font-medium">{company.size || "Not specified"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            About
                        </h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {company.description || "No description provided yet."}
                        </p>
                    </div>
                </div>

            </div>

            {/* --- EDIT MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsModalOpen(false)}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Edit Company Profile</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Form Area */}
                        <div className="overflow-y-auto flex-1">
                            <form id="companyForm" onSubmit={handleSubmit} className="p-6 md:p-8">
                                
                                {/* Section 1: Core Identity */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                            <LayoutDashboard className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">Brand Identity</h2>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={company.name}
                                                onChange={handleChange}
                                                placeholder="e.g. Acme Innovations Ltd."
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Website URL</label>
                                            <div className="relative group">
                                                <Globe className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                                <input
                                                    type="url"
                                                    name="website"
                                                    value={company.website}
                                                    onChange={handleChange}
                                                    placeholder="https://acme.com"
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Logo Image URL</label>
                                            <div className="relative group">
                                                <ImageIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    name="logo_url"
                                                    value={company.logo_url}
                                                    onChange={handleChange}
                                                    placeholder="https://example.com/logo.png"
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Details & Bio */}
                                <div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">About the Organization</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Headquarters Location</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    name="location"
                                                    value={company.location}
                                                    onChange={handleChange}
                                                    placeholder="e.g. San Francisco, CA"
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Size</label>
                                            <div className="relative">
                                                <select
                                                    name="size"
                                                    value={company.size}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm bg-white appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select employee count...</option>
                                                    <option value="1-10">1-10 employees</option>
                                                    <option value="11-50">11-50 employees</option>
                                                    <option value="51-200">51-200 employees</option>
                                                    <option value="201-500">201-500 employees</option>
                                                    <option value="500+">500+ employees</option>
                                                </select>
                                                <div className="absolute right-4 top-4 pointer-events-none">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Description</label>
                                            <div className="relative group">
                                                <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                                <textarea
                                                    name="description"
                                                    rows={5}
                                                    value={company.description}
                                                    onChange={handleChange}
                                                    placeholder="Tell candidates about your mission, culture, and what makes your company great..."
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                disabled={isSaving}
                                className="px-6 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="companyForm" // Links this button to the form
                                disabled={isSaving}
                                className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}