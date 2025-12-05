"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bold, 
  List, 
  Type, 
  Calendar, 
  Briefcase, 
  Loader2, 
  ArrowLeft,
  Eye,
  PenLine,
  CheckCircle2,
  Info,
  AlertCircle,
  X
} from 'lucide-react';

export default function CreateJob() {
  const router = useRouter();
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lastDate, setLastDate] = useState('');
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to show toast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    // Auto hide after 3 seconds
    setTimeout(() => {
        setToast(null);
    }, 4000);
  };

  // Editor Helper Functions (Logic Unchanged)
  const insertTag = (tagType: 'para' | 'list' | 'bold') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end);
    let newText = '';

    if (tagType === 'para') {
      newText = `<p>${selectedText || 'New Paragraph'}</p>`;
    } else if (tagType === 'bold') {
      newText = `<strong>${selectedText || 'Bold Text'}</strong>`;
    } else if (tagType === 'list') {
      const items = selectedText.split('\n').filter(i => i.trim().length > 0);
      if (items.length > 0) {
        const listItems = items.map(item => `  <li>${item}</li>`).join('\n');
        newText = `<ul>\n${listItems}\n</ul>`;
      } else {
        newText = `<ul>\n  <li>List item 1</li>\n  <li>List item 2</li>\n</ul>`;
      }
    }

    const updatedDescription = 
      description.substring(0, start) + 
      newText + 
      description.substring(end);

    setDescription(updatedDescription);
  };

  // Handle Submit (Updated to use Toast)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/employer/jobs/create-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          last_date: lastDate,
        }),
      });

      if (response.ok) {
        // Show success toast
        showToast('Job Posted Successfully!', 'success');
        
        // Wait 1.5s before redirecting so user sees the toast
        setTimeout(() => {
            router.push('/dashboard/employer/jobs');
        }, 1500);
      } else {
        const err = await response.json();
        if (response.status === 401) {
          showToast('Your session has expired. Please login again.', 'error');
          setTimeout(() => router.push('/auth/employer/login'), 2000);
        } else {
          showToast(`Failed to post job: ${err.message || 'Unknown error'}`, 'error');
        }
      }
    } catch (error) {
      console.error(error);
      showToast('An error occurred while posting the job.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 relative">
       {/* Decorative Background */}
       <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-blue-600 to-indigo-900 -z-10 shadow-lg" />

       {/* Toast Notification Container */}
       {toast && toast.show && (
            <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-top-5 duration-300 ${
                toast.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-900' 
                    : 'bg-red-50 border-red-200 text-red-900'
            }`}>
                <div className={`p-1 rounded-full ${toast.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {toast.type === 'success' ? (
                        <CheckCircle2 className={`w-5 h-5 ${toast.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                </div>
                <div>
                    <h4 className="font-bold text-sm">{toast.type === 'success' ? 'Success' : 'Error'}</h4>
                    <p className="text-sm opacity-90">{toast.message}</p>
                </div>
                <button 
                    onClick={() => setToast(null)} 
                    className="ml-2 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
       )}

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Post a New Job</h1>
              <p className="text-blue-100 text-sm mt-1">Create a listing to find your next great hire.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          <div className="p-8 space-y-8">
            {/* Section 1: Basic Info */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                 <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Briefcase className="w-4 h-4" />
                 </div>
                 <h2 className="text-lg font-bold text-gray-900">Job Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Title */}
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm border transition-all shadow-sm"
                      placeholder="e.g. Senior Frontend Developer"
                    />
                  </div>
                </div>

                {/* Last Date */}
                <div>
                  <label htmlFor="last_date" className="block text-sm font-semibold text-gray-700 mb-2">
                    Application Deadline <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="date"
                      name="last_date"
                      id="last_date"
                      required
                      value={lastDate}
                      onChange={(e) => setLastDate(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm border transition-all shadow-sm text-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Section 2: Editor */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <PenLine className="w-4 h-4" />
                    </div>
                    <label className="text-lg font-bold text-gray-900">
                        Description
                    </label>
                </div>

                {/* Preview Toggle Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setPreviewMode(false)}
                        className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${!previewMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <PenLine className="w-3.5 h-3.5 mr-1.5" />
                        Write
                    </button>
                    <button
                        type="button"
                        onClick={() => setPreviewMode(true)}
                        className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${previewMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        Preview
                    </button>
                </div>
              </div>

              {/* Editor Container */}
              <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm">
                
                {/* Formatting Toolbar - Only visible in Write mode */}
                {!previewMode && (
                    <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => insertTag('para')}
                        className="p-1.5 rounded hover:bg-white hover:shadow-sm hover:text-blue-600 text-gray-600 transition-all"
                        title="Paragraph"
                    >
                        <Type className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <button
                        type="button"
                        onClick={() => insertTag('bold')}
                        className="p-1.5 rounded hover:bg-white hover:shadow-sm hover:text-blue-600 text-gray-600 transition-all"
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertTag('list')}
                        className="p-1.5 rounded hover:bg-white hover:shadow-sm hover:text-blue-600 text-gray-600 transition-all"
                        title="List"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    </div>
                )}

                {/* Input Area vs Preview Area */}
                <div className="bg-white">
                  {!previewMode ? (
                    <textarea
                      ref={textareaRef}
                      id="description"
                      name="description"
                      rows={12}
                      className="block w-full border-0 p-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm font-mono leading-relaxed resize-y"
                      placeholder="Describe the role, responsibilities, and requirements..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  ) : (
                    <div 
                      className="block w-full p-6 min-h-[19rem] bg-white text-gray-900 prose prose-blue prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: description || '<p class="text-gray-400 italic">No description content yet...</p>' }}
                    />
                  )}
                </div>
              </div>
              
              {!previewMode && (
                <div className="mt-3 flex items-start gap-2 text-xs text-gray-500 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p>
                        Highlight text and click the toolbar icons to apply formatting. Use "Make Para" to properly space your paragraphs.
                    </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer Actions */}
          <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={() => router.back()} 
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Post Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}