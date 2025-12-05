"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  Calendar, 
  Edit2, 
  Loader2, 
  Clock,
  X,
  Type,
  List,
  Bold,
  CheckCircle2,
  AlertCircle,
  Search,
  Trash2,
  Power,
  Users,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  last_date: string;
  created_at: string;
  status: boolean; // true = accepting applications, false = closed
}

export default function EmployerJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Modal State
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form State for Edit
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLastDate, setEditLastDate] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch Jobs on Mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/employer/jobs/fetch-update');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      } else {
        console.error("Failed to fetch jobs");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTIONS ---

  // 1. Delete Job
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job post? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/employer/jobs/fetch-update?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setJobs(prev => prev.filter(job => job.id !== id));
      } else {
        alert("Failed to delete job.");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting job.");
    }
  };

  // 2. Toggle Status (Close/Open Application)
  const handleStatusToggle = async (job: Job) => {
    const newStatus = !job.status;
    
    // Optimistic UI update
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));

    try {
      const res = await fetch('/api/employer/jobs/fetch-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: job.id,
          title: job.title,
          description: job.description,
          last_date: job.last_date,
          status: newStatus
        })
      });

      if (!res.ok) {
        // Revert on failure
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: job.status } : j));
        alert(`Failed to update status.`);
      }
    } catch (error) {
      console.error(error);
      // Revert on error
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: job.status } : j));
    }
  };

  // 3. Navigate to Candidates
  const handleViewCandidates = (jobId: string) => {
    router.push(`/dashboard/employer/applicants?job_id=${jobId}`);
  };

  // Open Modal
  const handleEditClick = (job: Job) => {
    setEditingJob(job);
    setEditTitle(job.title);
    setEditDescription(job.description);
    const dateStr = new Date(job.last_date).toISOString().split('T')[0];
    setEditLastDate(dateStr);
    setPreviewMode(false);
  };

  // Close Modal
  const closeEditModal = () => {
    setEditingJob(null);
    setEditTitle('');
    setEditDescription('');
    setEditLastDate('');
  };

  // Submit Update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    setIsUpdating(true);
    try {
      const res = await fetch('/api/employer/jobs/fetch-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingJob.id,
          title: editTitle,
          description: editDescription,
          last_date: editLastDate,
          status: editingJob.status 
        })
      });

      if (res.ok) {
        setJobs(prev => prev.map(j => 
          j.id === editingJob.id 
            ? { ...j, title: editTitle, description: editDescription, last_date: editLastDate }
            : j
        ));
        closeEditModal();
      } else {
        const errorData = await res.json();
        alert(`Failed to update job: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error updating job.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Editor Logic
  const insertTag = (tagType: 'para' | 'list' | 'bold') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editDescription.substring(start, end);
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

    const updated = 
      editDescription.substring(0, start) + 
      newText + 
      editDescription.substring(end);

    setEditDescription(updated);
  };

  // Filter Jobs
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to check if job is effectively active (Date + Status boolean)
  const isJobEffectivelyActive = (job: Job) => {
    const isDateValid = new Date(job.last_date) >= new Date();
    return isDateValid && job.status; 
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Job Listings</h1>
            <p className="mt-2 text-gray-500">Manage your active job postings and view applicant data.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by job title..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none w-full md:w-72 transition-all shadow-sm"
              />
            </div>
            <div className="hidden md:flex bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span>{jobs.length} Jobs</span>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <Briefcase className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              {searchTerm ? "No matches found for your search." : "You haven't posted any jobs yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => {
              const isActive = isJobEffectivelyActive(job);
              
              return (
                <div key={job.id} className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col relative overflow-hidden">
                  
                  {/* Card Header & Actions */}
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start gap-4 mb-4">
                       {/* Status Badge */}
                       <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {isActive ? 'Active' : 'Closed'}
                      </div>

                      {/* Management Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => handleStatusToggle(job)}
                          className={`p-2 rounded-lg transition-colors ${job.status ? 'text-gray-400 hover:text-green-600 hover:bg-green-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                          title={job.status ? "Close Applications" : "Re-open Applications"}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditClick(job)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Job"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(job.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Job"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    
                    {/* Description Preview */}
                    <div 
                      className="text-sm text-gray-500 line-clamp-2 prose prose-sm prose-gray mb-4 min-h-[40px]"
                      dangerouslySetInnerHTML={{ __html: job.description }}
                    />

                    {/* Meta Data */}
                    <div className="flex flex-col gap-2 text-xs text-gray-500 mt-auto">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-3.5 w-3.5 text-gray-400" />
                        <span className={!isActive ? 'text-red-500 font-medium' : ''}>
                          Deadline: {new Date(job.last_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-3.5 w-3.5 text-gray-400" />
                        Posted: {new Date(job.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Footer */}
                  <div className="mt-auto px-6 pb-6 pt-2">
                    <button
                      onClick={() => handleViewCandidates(job.id)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group/btn"
                    >
                      <Users className="w-4 h-4" />
                      <span>View Applicants</span>
                      <ChevronRight className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
              aria-hidden="true"
              onClick={closeEditModal}
            />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            {/* Modal Content */}
            <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100">
              
              {/* Modal Header */}
              <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Edit Job Details</h3>
                    <p className="text-xs text-gray-500">Update the job information below.</p>
                </div>
                <button 
                  onClick={closeEditModal}
                  className="bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 p-2 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-6">
                <form onSubmit={handleUpdate} className="space-y-5">
                  {/* Title Input */}
                  <div>
                    <label htmlFor="edit-title" className="block text-sm font-semibold text-gray-700 mb-1.5">Job Title</label>
                    <input
                      type="text"
                      id="edit-title"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all outline-none"
                    />
                  </div>

                  {/* Deadline Input */}
                  <div>
                    <label htmlFor="edit-date" className="block text-sm font-semibold text-gray-700 mb-1.5">Application Deadline</label>
                    <input
                      type="date"
                      id="edit-date"
                      required
                      value={editLastDate}
                      onChange={(e) => setEditLastDate(e.target.value)}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all outline-none"
                    />
                  </div>

                  {/* Description Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">Description</label>
                        <button
                          type="button"
                          onClick={() => setPreviewMode(!previewMode)}
                          className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                            previewMode 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {previewMode ? 'Back to Edit' : 'Preview Mode'}
                        </button>
                    </div>
                    
                    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                      {/* Toolbar */}
                      {!previewMode && (
                        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
                            <button type="button" onClick={() => insertTag('para')} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="Paragraph"><Type className="w-4 h-4" /></button>
                            <button type="button" onClick={() => insertTag('list')} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="List"><List className="w-4 h-4" /></button>
                            <button type="button" onClick={() => insertTag('bold')} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
                        </div>
                      )}

                      {/* Text Area */}
                      {!previewMode ? (
                        <textarea
                          ref={textareaRef}
                          rows={8}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="block w-full border-0 p-4 text-gray-900 focus:ring-0 sm:text-sm font-mono resize-y outline-none"
                          placeholder="Enter job description..."
                        />
                      ) : (
                        <div 
                          className="block w-full p-4 min-h-[192px] prose prose-sm max-w-none overflow-y-auto bg-gray-50/50"
                          dangerouslySetInnerHTML={{ __html: editDescription }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors shadow-sm"
                    >
                      {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}