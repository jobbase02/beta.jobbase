// components/EmployerProfile.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  Briefcase, 
  Mail, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Edit2, 
  X,
  Camera
} from 'lucide-react';

interface ProfileData {
    name: string;
    email: string;
    company_name: string;
    position: string;
}

const EmptyProfile: ProfileData = {
    name: '',
    email: '',
    company_name: '',
    position: '',
};

export default function EmployerProfile() {
    const [profile, setProfile] = useState<ProfileData>(EmptyProfile);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // UI State for Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // --- State for Form Inputs (Editable fields only) ---
    const [formData, setFormData] = useState<Omit<ProfileData, 'email'>>(EmptyProfile);

    // --- Data Fetching ---
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/employer/profile');
            if (response.ok) {
                const result = await response.json();
                const fetchedProfile = result.profile;
                setProfile(fetchedProfile);
                // Initialize form data with fetched values
                setFormData({
                    name: fetchedProfile.name || '',
                    company_name: fetchedProfile.company_name || '',
                    position: fetchedProfile.position || '',
                });
            } else {
                let errorMessage = 'Server error';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || response.statusText;
                } catch {
                    errorMessage = response.statusText;
                }
                setError(`Failed to load profile: ${errorMessage}`);
            }
        } catch (err) {
            console.error("Fetch profile error:", err);
            setError("A network error occurred while loading data.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Form Handling ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleEditClick = () => {
        // Reset form data to current profile state before opening
        setFormData({
            name: profile.name,
            company_name: profile.company_name,
            position: profile.position,
        });
        setIsEditModalOpen(true);
        setError(null); // Clear previous errors
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        setError(null);
        setSuccessMessage(null);

        // Simple validation check
        if (!formData.name || !formData.company_name) {
             setError("Name and Company Name are required fields.");
             setIsUpdating(false);
             return;
        }

        try {
            const response = await fetch('/api/employer/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
                setProfile(result.profile); // Update main state
                setSuccessMessage("Profile updated successfully!");
                setIsEditModalOpen(false); // Close Modal on success
                setTimeout(() => setSuccessMessage(null), 4000);
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Server update failed.' }));
                setError(`Update failed: ${errorData.message || response.statusText}`);
            }
        } catch (err) {
            console.error("Update profile error:", err);
            setError("A network error occurred during the update.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50/50">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                    <Loader2 className="relative w-10 h-10 animate-spin text-blue-600" />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">Retrieving your data...</p>
            </div>
        );
    }
    
    // Display fatal fetch error immediately
    if (error && !isEditModalOpen && !successMessage) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4">
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-start gap-4 shadow-sm">
                    <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
                    <div>
                        <h3 className="text-red-800 font-semibold">Unable to Load Profile</h3>
                        <p className="text-red-600 mt-1 text-sm">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50/50 py-12 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-blue-600 to-indigo-700 transform -skew-y-3 origin-top-left -z-10 shadow-lg" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 text-white">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Employer Profile</h1>
                        <p className="text-blue-100 mt-1 text-sm sm:text-base opacity-90">Manage your account settings and company details</p>
                    </div>
                    
                    {successMessage && (
                        <div className="mt-4 sm:mt-0 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl">
                            <CheckCircle2 className="w-4 h-4 text-green-300" />
                            <span className="text-sm font-medium">{successMessage}</span>
                        </div>
                    )}
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    
                    {/* Cover / Avatar Area */}
                    <div className="h-32 bg-gray-100 relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600">
                                        <User className="w-10 h-10" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-4 right-4">
                            <button 
                                onClick={handleEditClick}
                                className="group flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full text-sm font-semibold text-gray-700 shadow-sm hover:shadow-md transition-all active:scale-95 border border-gray-200"
                            >
                                <Edit2 className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Profile Details Grid */}
                    <div className="pt-16 pb-8 px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                            
                            <ProfileField 
                                label="Full Name" 
                                value={profile.name} 
                                icon={User} 
                            />
                            
                            <ProfileField 
                                label="Email Address" 
                                value={profile.email} 
                                icon={Mail} 
                                badge="Verified"
                            />
                            
                            <ProfileField 
                                label="Company Name" 
                                value={profile.company_name} 
                                icon={Building2} 
                            />
                            
                            <ProfileField 
                                label="Current Position" 
                                value={profile.position} 
                                icon={Briefcase} 
                            />

                        </div>
                    </div>
                </div>
            </div>

            {/* --- EDIT MODAL --- */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                        onClick={() => !isUpdating && setIsEditModalOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Update your personal details</p>
                            </div>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                disabled={isUpdating}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body (Form) */}
                        <div className="p-6 overflow-y-auto">
                            {error && (
                                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2 mb-4 animate-in slide-in-from-top-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-5">
                                <ProfileInput
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    icon={User}
                                    placeholder="Jane Doe"
                                    required
                                />

                                <ProfileInput
                                    label="Company Name"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    icon={Building2}
                                    placeholder="Acme Corp"
                                    required
                                />

                                <ProfileInput
                                    label="Job Title"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    icon={Briefcase}
                                    placeholder="Hiring Manager"
                                />
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                disabled={isUpdating}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="edit-profile-form"
                                disabled={isUpdating}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-all shadow-sm"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                        
                        {/* Loading Overlay within Modal */}
                        {isUpdating && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10 cursor-not-allowed" />
                        )}
                    </div>
                </div>
            )}

        </main>
    );
}

// --- Helper Components ---

// 1. View Mode Field Component
function ProfileField({ label, value, icon: Icon, badge }: { label: string, value: string, icon: React.ElementType, badge?: string }) {
    return (
        <div className="group">
            <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
                {badge && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">{badge}</span>}
            </div>
            <div className="text-gray-900 font-medium text-lg border-b border-transparent group-hover:border-gray-100 pb-1 transition-colors break-words">
                {value || <span className="text-gray-400 italic text-base">Not set</span>}
            </div>
        </div>
    );
}

// 2. Edit Mode Input Component
interface ProfileInputProps {
    label: string;
    name: keyof Omit<ProfileData, 'email'>;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon: React.ElementType;
    placeholder?: string;
    required?: boolean;
}

function ProfileInput({ label, name, value, onChange, icon: Icon, placeholder, required = false }: ProfileInputProps) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" aria-hidden="true" />
                </div>
                <input
                    type="text"
                    name={name}
                    id={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    className="block w-full rounded-lg border-gray-300 pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
                />
            </div>
        </div>
    );
}