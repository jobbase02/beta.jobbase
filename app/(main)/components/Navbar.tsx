"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Menu, 
  X, 
  Briefcase, 
  MapPin, 
  Globe, 
  BookOpen,
  LogOut,
  User,
  LayoutDashboard,
  ChevronDown
} from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation"; // Added hooks
import Link from "next/link"; // Recommended to use Link instead of <a>

// Define User Interface based on Supabase structure
interface UserData {
  id: string;
  email?: string;
  user_metadata: {
    full_name?: string;
    [key: string]: any;
  };
}

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  const searchParams = useSearchParams(); // Get current query params (category=...)

  const [scrolled, setScrolled] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null); // Renamed activeTab to hoveredTab for clarity
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Click Outside to Close Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Auth Check on Mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        if (data.isLoggedIn && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // 4. Logout Handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsUserMenuOpen(false);
      router.refresh();
      router.push('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Helper: Get Initials
  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // FIXED LINKS: Added '/' at the start and removed '#'
  const navLinks = [
    { name: "Walk-in Drives", href: "/post?category=walk-in-drive", icon: <MapPin size={18} /> },
    { name: "Off Campus Drives", href: "/post?category=off-campus", icon: <Briefcase size={18} /> },
    { name: "Remote Jobs", href: "/post?category=remote", icon: <Globe size={18} /> },
    { name: "Internships", href: "/post?category=internship", icon: <Globe size={18} /> },
    { name: "Resources", href: "/post?category=resources", icon: <BookOpen size={18} /> },
  ];

  // Helper: Check if link is active
  const isLinkActive = (href: string) => {
    // Split href into path and query string
    const [linkPath, linkQuery] = href.split('?');
    
    // Check if path matches
    if (pathname !== linkPath) return false;

    // If there is a query (e.g., ?category=remote), check if it matches the current URL params
    if (linkQuery) {
        const linkParams = new URLSearchParams(linkQuery);
        const linkCategory = linkParams.get('category');
        const currentCategory = searchParams.get('category');
        return linkCategory === currentCategory;
    }

    return true;
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 w-full flex justify-center z-50 pt-4 px-4 pointer-events-none">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className={`
            pointer-events-auto
            relative flex items-center justify-between
            transition-all duration-500 ease-out
            ${
              scrolled
                ? "w-full max-w-5xl py-2.5 px-4 rounded-full bg-white/85 backdrop-blur-2xl border border-zinc-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                : "w-full max-w-7xl py-4 px-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm"
            }
          `}
        >
          {/* --- Left: Logo --- */}
          <div className="flex items-center gap-2">
            <Link href="/" className="relative group overflow-hidden rounded-lg">
              <img 
                src="/logo.png" 
                alt="JobBase" 
                className="h-8 md:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
              />
            </Link>
          </div>

          {/* --- Center: Desktop Navigation (Pills) --- */}
          <div className="hidden md:flex items-center gap-1 bg-zinc-100/50 p-1 rounded-full border border-zinc-200/50">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onMouseEnter={() => setHoveredTab(link.name)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`
                    relative px-4 py-1.5 text-sm font-medium transition-colors z-10 duration-300
                    ${active ? "text-zinc-900 font-semibold" : "text-zinc-500 hover:text-zinc-900"}
                  `}
                >
                  {/* Hover Effect (Moving Pill) */}
                  {hoveredTab === link.name && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white rounded-full shadow-sm border border-zinc-200/50 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  {/* Active State Indicator (Small dot or background if you prefer) */}
                  {active && !hoveredTab && (
                     <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-white/50 rounded-full border border-zinc-200/30 -z-20"
                     />
                  )}
                  
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* --- Right: Actions --- */}
          <div className="flex items-center gap-2 md:gap-3">
            
            {/* Desktop Only Actions */}
            <div className="hidden md:flex items-center gap-3">
              
              {/* AUTH SECTION */}
              {loading ? (
                // Loading Skeleton
                <div className="w-8 h-8 rounded-full bg-zinc-200 animate-pulse" />
              ) : user ? (
                // LOGGED IN STATE
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 hover:bg-zinc-100 rounded-full transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {getInitials(user.user_metadata?.full_name)}
                    </div>
                    {/* Optional: Show little arrow */}
                    <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* USER DROPDOWN */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl border border-zinc-200 shadow-xl p-2 flex flex-col gap-1 z-50"
                      >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-zinc-100 mb-1">
                          <p className="font-semibold text-zinc-900 truncate">
                            {user.user_metadata?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                        </div>

                        {/* Links */}
                        <Link 
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-600 rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                        >
                          <LayoutDashboard size={18} />
                          Dashboard
                        </Link>
                        
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut size={18} />
                          Log Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // LOGGED OUT STATE
                <Link 
                  href="/auth?redirect=/" 
                  className="text-sm font-medium text-zinc-600 hover:text-black transition-colors px-2"
                >
                  Log in
                </Link>
              )}

              {/* Post Job Button */}
              <Link 
                href="/dashboard/employer"
                className="relative group overflow-hidden rounded-full bg-zinc-900 px-5 py-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-zinc-900/20 hover:shadow-zinc-900/40 flex items-center gap-2"
              >
                <div className="absolute inset-0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
                <span className="text-white font-medium text-sm relative z-20">Post a Job</span>
                <Briefcase size={16} className="text-zinc-300 group-hover:text-white transition-colors relative z-20" />
              </Link>
            </div>

            {/* --- Mobile Animated Menu Toggle --- */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100/80 hover:bg-zinc-200/80 transition-colors z-50"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={20} className="text-zinc-800" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={20} className="text-zinc-800" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.nav>
      </div>

      {/* --- Mobile Menu Overlay --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[45] bg-zinc-900/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 pb-10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Drag Indicator */}
              <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-8" />

              {/* Mobile Links */}
              <div className="flex flex-col gap-2 mb-8">
                {navLinks.map((link, i) => {
                  const active = isLinkActive(link.href);
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                        <Link
                        href={link.href}
                        className={`group flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98]
                            ${active 
                                ? "bg-zinc-900 border-zinc-900" 
                                : "bg-zinc-50 border-zinc-100 hover:bg-zinc-100"
                            }
                        `}
                        >
                        <div className="flex items-center gap-4">
                            <span className={`p-2 rounded-lg shadow-sm ${active ? "bg-zinc-800 text-white" : "bg-white text-zinc-600"}`}>
                            {link.icon}
                            </span>
                            <span className={`text-lg font-semibold ${active ? "text-white" : "text-zinc-800"}`}>
                            {link.name}
                            </span>
                        </div>
                        <ArrowRight size={20} className={`transition-colors ${active ? "text-zinc-400" : "text-zinc-300 group-hover:text-zinc-900"}`} />
                        </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Mobile Bottom Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 gap-3"
              >
                {/* Mobile Auth Section */}
                {user ? (
                    <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold">
                          {getInitials(user.user_metadata?.full_name)}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">{user.user_metadata?.full_name}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Link href="/dashboard" className="flex items-center justify-center py-3 bg-white border border-zinc-200 rounded-xl font-medium text-zinc-700">
                           Dashboard
                        </Link>
                        <button onClick={handleLogout} className="flex items-center justify-center py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-medium">
                           Logout
                        </button>
                      </div>
                    </div>
                ) : (
                  <Link href="/auth" className="flex items-center justify-center py-4 rounded-2xl font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors">
                    Log In
                  </Link>
                )}

                 <Link 
                    href="/dashboard/employer" 
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xl shadow-zinc-900/20 active:scale-[0.98]"
                  >
                    Post a Job
                    <Briefcase size={18} className="text-zinc-300" />
                 </Link>
              </motion.div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;