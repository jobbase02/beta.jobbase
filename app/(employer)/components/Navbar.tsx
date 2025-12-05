// components/EmployerNavbar.tsx

"use client";

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Briefcase, 
    Plus, 
    User, 
    Settings, 
    LogOut, 
    Menu, 
    X, 
    LayoutDashboard
} from 'lucide-react';

// 1. Updated Interface to match your Login Cookie data
interface EmployerUser {
    [x: string]: ReactNode;
    id: string;
    email: string;
    company: string; // Your login code saves 'company', not 'full_name'
    role: string;
}

// --- Navigation Paths ---
const PATHS = {
    DASHBOARD: '/dashboard/employer',
    JOBS: '/dashboard/employer/jobs',
    CREATE_JOB: '/dashboard/employer/create-job',
    PROFILE: '/dashboard/employer/profile',
    SETTINGS: '/dashboard/employer/company',
    LOGIN: '/auth/employer',
    // 2. Updated API endpoint to the one created in Step 1
    API_USER_DATA: '/api/employer/me', 
    API_LOGOUT: '/api/employer/logout',
};

export default function EmployerNavbar() {
    const router = useRouter();
    
    // State
    const [user, setUser] = useState<EmployerUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Refs
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Helper: Get Initials (Updated to use Company Name)
    const getInitials = (name: string) => {
        if (!name) return 'EM';
        // Remove special chars and extra spaces
        const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
        const names = cleanName.split(/\s+/);
        
        let initials = '';
        if (names.length >= 2) {
            initials = names[0][0] + names[names.length - 1][0];
        } else if (names.length === 1) {
            initials = names[0].slice(0, 2);
        } else {
            return 'EM';
        }
        
        return initials.toUpperCase();
    };

    // Fetch User Data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // This calls the server-side API which CAN read the httpOnly cookie
                const response = await fetch(PATHS.API_USER_DATA);
                
                if (response.ok) {
                    const result = await response.json();
                    setUser(result.data || null);
                } else {
                    // Silently fail or handle unauthenticated state
                    setUser(null);
                }
            } catch (error) {
                console.error("Error fetching user data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle Logout
    const handleLogout = async () => {
        try {
            await fetch(PATHS.API_LOGOUT, { method: 'POST' });
            setUser(null); 
            router.push(PATHS.LOGIN); 
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // Navigation Helper
    const navigateTo = (path: string) => {
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
        router.push(path);
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    
                    {/* Left Side: Logo & Main Nav */}
                    <div className="flex">
                        {/* Logo */}
                        <div 
                            className="flex-shrink-0 flex items-center cursor-pointer group" 
                            onClick={() => navigateTo(PATHS.DASHBOARD)}
                        >
                            <div className="p-2 mr-2 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                <LayoutDashboard className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="font-extrabold text-xl tracking-wide text-gray-900 group-hover:text-blue-600 transition-colors">
                                Dashboard
                            </span>
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:ml-8 md:flex md:space-x-8">
                            <NavLink 
                                icon={<Briefcase className="w-4 h-4 mr-1.5" />} 
                                text="Jobs" 
                                onClick={() => navigateTo(PATHS.JOBS)} 
                            />
                        </div>
                    </div>

                    {/* Right Side: Actions & Profile */}
                    <div className="flex items-center space-x-4">
                        
                        {/* Post Job Button */}
                        <button 
                            onClick={() => navigateTo(PATHS.CREATE_JOB)}
                            className="cursor-pointer hidden sm:flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Post a Job
                        </button>

                        {/* Profile Dropdown */}
                        <div className="ml-3 relative" ref={dropdownRef}>
                            <div>
                                <button
                                    type="button"
                                    className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 items-center cursor-pointer hover:ring-2 hover:ring-gray-200 transition-all"
                                    id="user-menu-button"
                                    aria-expanded={isProfileOpen}
                                    aria-haspopup="true"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                >
                                    <span className="sr-only">Open user menu</span>
                                    {isLoading ? (
                                        <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
                                    ) : (
                                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                            {/* Using company name for initials */}
                                            {user ? getInitials(user.name) : 'EM'}
                                        </div>
                                    )}
                                </button>
                            </div>

                            {/* Dropdown Menu */}
                            {isProfileOpen && !isLoading && user && (
                                <div
                                    className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transform opacity-100 scale-100 transition-all duration-200 ease-out z-50"
                                    role="menu"
                                    aria-orientation="vertical"
                                    aria-labelledby="user-menu-button"
                                    tabIndex={-1}
                                >
                                    {/* Name and Email shown inside the box */}
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        {/* Displaying Company Name as the main identifier */}
                                        <p className="text-sm text-gray-900 font-semibold">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate" title={user.email}>{user.email}</p>
                                    </div>

                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); navigateTo(PATHS.PROFILE); }}
                                        className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 cursor-pointer"
                                        role="menuitem"
                                    >
                                        <User className="mr-3 h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                                        Profile
                                    </a>

                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); navigateTo(PATHS.SETTINGS); }}
                                        className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 cursor-pointer"
                                        role="menuitem"
                                    >
                                        <Settings className="mr-3 h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                                        Company Settings
                                    </a>

                                    <div className="border-t border-gray-100 my-1"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full group flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                                        role="menuitem"
                                    >
                                        <LogOut className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-600" />
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="-mr-2 flex items-center md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                type="button"
                                className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                                aria-controls="mobile-menu"
                                aria-expanded="false"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isMobileMenuOpen ? (
                                    <X className="block h-6 w-6" aria-hidden="true" />
                                ) : (
                                    <Menu className="block h-6 w-6" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200" id="mobile-menu">
                    <div className="pt-2 pb-3 space-y-1">
                        <MobileNavLink 
                            text="Jobs" 
                            icon={<Briefcase className="w-5 h-5 mr-3" />}
                            onClick={() => navigateTo(PATHS.JOBS)}
                        />
                        <MobileNavLink 
                            text="Post a Job" 
                            icon={<Plus className="w-5 h-5 mr-3" />}
                            onClick={() => navigateTo(PATHS.CREATE_JOB)}
                        />
                    </div>
                </div>
            )}
        </nav>
    );
}

// --- Helper Components ---
function NavLink({ text, icon, onClick }: { text: string; icon: React.ReactNode; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors duration-200 cursor-pointer"
        >
            {icon}
            {text}
        </button>
    );
}

function MobileNavLink({ text, icon, onClick }: { text: string; icon: React.ReactNode; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left flex items-center transition-colors duration-150 cursor-pointer'}
        >
            {icon}
            {text}
        </button>
    );
}