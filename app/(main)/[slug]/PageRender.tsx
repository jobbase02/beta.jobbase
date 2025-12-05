"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Tag, ChevronLeft, AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation'; // UNCOMMENT THIS LINE for Next.js App Router

const API_ENDPOINT = '/api/cms/single-post';

const PostPage = () => {
  const params = useParams(); // UNCOMMENT THIS LINE for Next.js App Router
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Priority 1: Get slug from route params (Next.js)
    // Priority 2: Get slug from query string (Fallback/Standard React)
    
    // CHANGE THIS LINE IN PRODUCTION:
    const urlSlug = params?.slug || new URLSearchParams(window.location.search).get('slug');
   

    if (!urlSlug) {
      setError("No slug found. Check the URL.");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching post for slug: ${urlSlug}`);
        const res = await fetch(`${API_ENDPOINT}?slug=${urlSlug}`);
        
        // Handle non-200 responses
        if (!res.ok) {
           const errorText = await res.text();
           throw new Error(`API Error (${res.status}): ${errorText}`);
        }

        const json = await res.json();
        console.log("API Response:", json); // Debugging

        // Handle API-level errors
        if (!json.success) {
          throw new Error(json.message || "Failed to load post data");
        }

        setPost(json.post);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, []); // Add [params] to dependency array in production

  // --- Date Formatter ---
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-28 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-24"></div>
          <div className="h-12 bg-slate-100 rounded w-3/4"></div>
          <div className="h-6 bg-slate-100 rounded w-1/2"></div>
          <div className="space-y-4 pt-8">
            <div className="h-4 bg-slate-100 rounded w-full"></div>
            <div className="h-4 bg-slate-100 rounded w-full"></div>
            <div className="h-4 bg-slate-100 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 p-4 rounded-full inline-block mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Unable to Load Post</h1>
          <p className="text-slate-500 mb-6">{error || "The requested post could not be found."}</p>
          <button 
            onClick={() => window.history.back()}
            className="text-blue-600 font-semibold hover:underline"
          >
            &larr; Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pt-28 pb-20">
      
      {/* --- Breadcrumb / Back --- */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <button 
          onClick={() => window.history.back()}
          className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          <div className="p-1 rounded-full bg-slate-100 group-hover:bg-blue-50 transition-colors">
            <ChevronLeft size={16} />
          </div>
          Back to listings
        </button>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* --- Header Section --- */}
        <header className="mb-10 text-center md:text-left">
          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
            <span dangerouslySetInnerHTML={{ __html: post.title }}></span>
          </h1>

          {/* Author & Meta Data */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 text-slate-500 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-3">
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full border border-slate-200" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                  <User size={20} className="text-slate-400" />
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-slate-900">{post.author?.name || "JobBase Team"}</p>
                <p className="text-xs">Author</p>
              </div>
            </div>

            <div className="hidden md:block w-px h-8 bg-slate-200"></div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                <span>Posted {formatDate(post.date)}</span>
              </div>
              {post.modified !== post.date && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  <span>Updated {formatDate(post.modified)}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* --- Excerpt Section --- */}
        {post.excerpt && (
            <div className="mb-12">
                <div className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light border-l-4 border-blue-600 pl-6 italic bg-slate-50 py-4 rounded-r-xl">
                    <span dangerouslySetInnerHTML={{ __html: post.excerpt }}></span>
                </div>
            </div>
        )}

        {/* --- Content Body with Enhanced Styling --- */}
        
        {/* We inject specific CSS to ensure all WordPress HTML elements are styled correctly, 
            overriding any defaults and ensuring consistency without relying solely on 'prose'. */}
        <style>{`
          .post-content { color: #334155; font-size: 1.125rem; line-height: 1.8; }
          
          /* Headings */
          .post-content h1 { font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-top: 2.5rem; margin-bottom: 1.25rem; line-height: 1.2; }
          .post-content h2 { font-size: 1.875rem; font-weight: 700; color: #0f172a; margin-top: 2.5rem; margin-bottom: 1rem; line-height: 1.3; }
          .post-content h3 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-top: 2rem; margin-bottom: 0.75rem; }
          .post-content h4 { font-size: 1.25rem; font-weight: 600; color: #0f172a; margin-top: 1.75rem; margin-bottom: 0.75rem; }
          .post-content h5 { font-size: 1.125rem; font-weight: 600; color: #0f172a; margin-top: 1.5rem; margin-bottom: 0.5rem; }
          .post-content h6 { font-size: 1rem; font-weight: 600; color: #475569; margin-top: 1.5rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
          
          /* Paragraphs & Spacing */
          .post-content p { margin-bottom: 1.5rem; }
          .post-content strong { color: #0f172a; font-weight: 700; }
          
          /* Lists */
          .post-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
          .post-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; }
          .post-content li { margin-bottom: 0.5rem; padding-left: 0.25rem; }
          .post-content li::marker { color: #3b82f6; } /* Blue bullets */
          
          /* Links */
          .post-content a { color: #2563eb; text-decoration: underline; text-underline-offset: 4px; font-weight: 500; transition: color 0.2s; }
          .post-content a:hover { color: #1d4ed8; }
          
          /* Blockquotes */
          .post-content blockquote { border-left: 4px solid #3b82f6; padding: 1rem 1.5rem; font-style: italic; color: #475569; background: #f8fafc; margin: 2rem 0; border-radius: 0 0.5rem 0.5rem 0; }
          
          /* Images */
          .post-content img { border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin: 2rem auto; max-width: 100%; height: auto; display: block; }
          .post-content figure { margin: 2rem 0; }
          .post-content figcaption { text-align: center; font-size: 0.875rem; color: #64748b; margin-top: 0.5rem; font-style: italic; }
          
          /* Tables */
          .post-content table { width: 100%; border-collapse: collapse; margin: 2rem 0; overflow-x: auto; display: block; }
          .post-content table::-webkit-scrollbar { height: 8px; }
          .post-content table::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
          .post-content th { background-color: #f1f5f9; text-align: left; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; font-weight: 600; color: #0f172a; white-space: nowrap; }
          .post-content td { padding: 0.75rem 1rem; border: 1px solid #e2e8f0; color: #334155; }
          .post-content tr:nth-child(even) { background-color: #f8fafc; }
          .post-content tr:hover { background-color: #f1f5f9; }
          
          /* Code blocks */
          .post-content pre { background-color: #1e293b; color: #f8fafc; padding: 1.25rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1.5rem; font-family: monospace; font-size: 0.875em; line-height: 1.6; }
          .post-content code { background-color: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875em; color: #dc2626; }
          .post-content pre code { background-color: transparent; padding: 0; color: inherit; font-size: inherit; }
          
          /* Embeds/Iframes */
          .post-content iframe { width: 100%; aspect-ratio: 16/9; margin: 2rem 0; border-radius: 0.5rem; border: none; background: #f1f5f9; }
          
          /* HR */
          .post-content hr { border: 0; border-top: 2px dashed #e2e8f0; margin: 3rem 0; }
        `}</style>

        <div 
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        ></div>

        {/* --- Tags --- */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Tag size={16} /> Related Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span 
                  key={tag.id} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-default"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* --- Static About Author Card --- */}
        <div className="mt-16 bg-slate-50 rounded-2xl p-8 border border-slate-100 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
             <div className="flex-shrink-0">
                {post.author?.avatar ? (
                  <img src={post.author.avatar} alt={post.author.name} className="w-20 h-20 rounded-full border-4 border-white shadow-sm" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-sm">
                    <User size={32} className="text-slate-400" />
                  </div>
                )}
             </div>
             <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">About {post.author?.name || "The Author"}</h3>
                <p className="text-slate-600 leading-relaxed">
                    JobBase Team is a dedicated group of career experts and researchers committed to bringing you the latest job opportunities, internship updates, and career resources. We strive to simplify your job search journey with accurate and timely information.
                </p>
             </div>
        </div>

      </article>
    </div>
  );
};

export default PostPage;