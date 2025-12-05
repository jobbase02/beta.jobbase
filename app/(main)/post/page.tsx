"use client"
import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight, Briefcase } from 'lucide-react';

// --- CONFIGURATION ---
const API_ENDPOINT = '/api/cms/category-post';

// Category Definitions for UI labels
const CATEGORY_LABELS = {
  "internship": { label: "Internships", color: "bg-blue-100 text-blue-700 border-blue-200" },
  "walk-in-drive": { label: "Walk-in Drives", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "resources": { label: "Resources", color: "bg-purple-100 text-purple-700 border-purple-200" },
  "remote": { label: "Remote Jobs", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  "off-campus-drive": { label: "Off Campus Drives", color: "bg-orange-100 text-orange-700 border-orange-200" }
};

const JobListingPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State to hold the current category derived from URL
  const [categorySlug, setCategorySlug] = useState('');

  useEffect(() => {
    // 1. Get the slug from the URL parameters on mount
    const searchParams = new URLSearchParams(window.location.search);
    const slug = searchParams.get('category') || 'internship'; // Default to internship if empty
    setCategorySlug(slug);

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        // 2. Real API Call
        const res = await fetch(`${API_ENDPOINT}?slug=${slug}`);
        
        if (!res.ok) {
           throw new Error(`Failed to fetch jobs: ${res.statusText}`);
        }
        
        const json = await res.json();
        
        if (!json.success) {
           throw new Error(json.message || 'API Error');
        }
        
        setPosts(json.posts || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // Empty dependency array means this runs once on mount (client-side)

  // Helper: Time Formatting
  const formatTimeDisplay = (dateString) => {
    if (!dateString) return "";
    const postDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now - postDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Rule: < 24 hours -> show hours
    if (diffInHours < 24) {
      if (diffInHours < 1) return "Just now";
      return `${diffInHours} hr${diffInHours > 1 ? 's' : ''} ago`;
    } 
    // Rule: <= 2 days -> show days
    else if (diffInDays <= 2) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } 
    // Rule: > 2 days -> show date
    else {
      return postDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const currentCategoryInfo = CATEGORY_LABELS[categorySlug] || { 
    label: categorySlug.replace(/-/g, ' '), 
    color: "bg-gray-100 text-gray-700 border-gray-200" 
  };

  return (
    // Added pt-24 for navbar spacing, uniform bg-slate-50 for the whole page
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pt-28 pb-20">
      
      {/* --- Header Section (No border, same bg) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="max-w-3xl">
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 capitalize tracking-tight">
            Latest {currentCategoryInfo.label}
          </h1>
          <p className="text-base text-slate-500 max-w-2xl leading-relaxed">
            Discover the most recent opportunities curated for your career growth.
          </p>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          // Adjusted loading skeleton to match new smaller card size
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-[340px] animate-pulse">
                <div className="h-40 bg-slate-200"></div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                     <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                     <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-10 bg-slate-200 rounded-lg w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-6">
              <Briefcase size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Unable to load jobs</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-8 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              Retry Connection
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-32">
            <div className="inline-block p-4 rounded-full bg-white mb-4 shadow-sm">
              <Briefcase className="text-slate-400" size={32} />
            </div>
            <p className="text-xl font-medium text-slate-900">No active listings found</p>
            <p className="text-slate-500 mt-2">Check back later for updates in <strong>{categorySlug}</strong></p>
          </div>
        ) : (
          // Grid updated: xl:grid-cols-4 for smaller cards on large screens, gap-6 for tighter spacing
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <JobCard 
                key={post.id} 
                post={post} 
                formatTime={formatTimeDisplay}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Job Card Component ---
const JobCard = ({ post, formatTime }) => {
  const handleApply = () => {
    // Redirects to /slug as requested
    window.location.href = `/${post.slug}`;
  };

  // Fallback image if featured_image is missing
  const bgImage = post.featured_image || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=60";

  return (
    <div className="group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full">
      {/* Image Section - Reduced height to h-40 */}
      <div className="relative h-40 overflow-hidden bg-slate-100">
        <img 
          src={bgImage} 
          alt={post.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1499750310159-52f8f6152133?w=800&auto=format&fit=crop"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content Section - Reduced padding to p-4 */}
      <div className="flex flex-col flex-grow p-4">
        
        {/* Top Row: Category (Left) - Time (Right) */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider border border-slate-200">
             {post.category_slug}
          </span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              {formatTime(post.date)}
            </span>
          </div>
        </div>

        <div className="flex-grow">
          {/* Title - Slightly smaller text */}
          <h3 
            className="text-base font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors cursor-pointer"
            onClick={handleApply}
            title={post.title}
          >
            {post.title}
          </h3>
        </div>

        {/* Footer / Action */}
        <div className="mt-4">
          <button 
            onClick={handleApply}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm"
          >
            Apply Now
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobListingPage;