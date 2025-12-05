"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2, 
  MapPin, 
  Calendar, 
  X, 
  CheckCircle2,
  Building2,
  ExternalLink,
  Mail,
  FileText, 
  LinkIcon,
  Globe,
  ChevronRight
} from "lucide-react";
import { main } from "framer-motion/client";

// --- Types (Preserved) ---
type Profile = {
  full_name: string;
  headline: string;
  bio: string;
  skills: string;
  email?: string;
  resume_url?: string;
};

type Experience = {
  id?: string;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
};

type Education = {
  id?: string;
  school: string;
  degree: string;
  field_of_study: string;
  start_year: string;
  end_year: string;
};

type Certification = {
  id?: string;
  name: string;
  issuer: string;
  issue_date: string;
  credential_url: string;
};

// --- Helper: Ensure Absolute URL ---
const ensureUrl = (url?: string) => {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

export default function Dashboard() {
  const router = useRouter();
  
  // --- State (Preserved) ---
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);

  // Data
  const [profile, setProfile] = useState<Profile>({ full_name: "", headline: "", bio: "", skills: "", resume_url: "" });
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // Active Modals
  const [activeExp, setActiveExp] = useState<Experience | null>(null);
  const [activeEdu, setActiveEdu] = useState<Education | null>(null);
  const [activeCert, setActiveCert] = useState<Certification | null>(null);

  // --- Fetch Data (Preserved) ---
  useEffect(() => {
    const initDashboard = async () => {
      try {
        const authRes = await fetch("/api/auth/check");
        const authData = await authRes.json();

        if (!authData.isLoggedIn || !authData.user) {
          router.push("/login");
          return;
        }

        const dataRes = await fetch("/api/user/data");
        const authName = authData.user.user_metadata?.full_name || authData.user.user_metadata?.name || "";
        
        if (dataRes.ok) {
          const { data } = await dataRes.json();
          if (data) {
            setProfile({
              full_name: data.full_name || authName, 
              headline: data.headline || "",
              bio: data.bio || "",
              skills: data.skills || "",
              email: authData.user.email, 
              resume_url: data.resume_url || "" 
            });
            setExperiences(data.experiences || []);
            setEducations(data.educations || []);
            setCertifications(data.certifications || []);
          }
        } else {
           setProfile(prev => ({ ...prev, full_name: authName, email: authData.user.email }));
        }

      } catch (e) {
        console.error("Dashboard Init Error", e);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [router]);

  // --- Handlers (Preserved) ---
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/data", { method: "POST", body: JSON.stringify(profile) });
      if (!res.ok) throw new Error("Failed");
      setIsEditingProfile(false); 
    } catch (error) {
      alert("Error saving profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveItem = async (type: "experiences" | "educations" | "certifications", data: any, closeModal: () => void) => {
    setModalSaving(true);
    try {
      const res = await fetch("/api/user/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });
      if (res.ok) {
        window.location.reload(); 
        closeModal();
      } else {
        alert("Failed to save item");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteItem = async (type: string, id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    if (type === "experiences") setExperiences(prev => prev.filter(i => i.id !== id));
    if (type === "educations") setEducations(prev => prev.filter(i => i.id !== id));
    if (type === "certifications") setCertifications(prev => prev.filter(i => i.id !== id));

    try {
      await fetch(`/api/user/data?type=${type}&id=${id}`, { method: "DELETE" });
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
        </div>
        <p className="text-slate-500 font-medium animate-pulse text-sm tracking-wide">Initializing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 pb-32 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Decorative Background */}
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 mt-20">
        
       {/* --- 1. Basic Info Section (Inline Styles) --- */}
        <section className="group bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-300 hover:shadow-slate-300/50">
          
          {/* Banner Image */}
          <div className="h-40 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {!isEditingProfile && (
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full transition-all active:scale-95 hover:shadow-lg"
              >
                <Edit2 size={12} /> <span className="hidden sm:inline">Edit Profile</span>
              </button>
            )}
          </div>

          <div className="px-6 pb-8 sm:px-10">
            {/* Profile Avatar Container */}
            <div className="relative -mt-12 mb-6 flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="relative group/avatar">
                <div className="h-32 w-32 bg-white rounded-full flex items-center justify-center p-1.5 ring-4 ring-white shadow-xl relative z-10">
                  <div className="h-full w-full bg-slate-100 rounded-full flex items-center justify-center text-slate-300 overflow-hidden">
                     <User size={64} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              
              {!isEditingProfile && (
                <div className="flex-1 text-center md:text-left mt-2 md:mt-0 pt-2 md:pb-2 space-y-1">
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{profile.full_name || "Your Name"}</h1>
                  <p className="text-lg text-indigo-600 font-medium">{profile.headline || "Add a headline to describe what you do"}</p>
                </div>
              )}
            </div>

            {isEditingProfile ? (
              /* --- EDIT MODE FORM (Inline Styles) --- */
              <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  
                  {/* Full Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                    <input 
                      value={profile.full_name} 
                      onChange={e => setProfile({...profile, full_name: e.target.value})} 
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm" 
                      placeholder="John Doe" 
                    />
                  </div>

                  {/* Headline */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Headline</label>
                    <input 
                      value={profile.headline} 
                      onChange={e => setProfile({...profile, headline: e.target.value})} 
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm" 
                      placeholder="e.g. Senior Software Engineer" 
                    />
                  </div>

                  {/* Resume Link */}
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                      <LinkIcon size={12}/> Resume / Portfolio URL
                    </label>
                    <div className="relative group">
                        <input 
                          value={profile.resume_url || ""} 
                          onChange={e => setProfile({...profile, resume_url: e.target.value})} 
                          className="w-full px-4 py-3 pl-10 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm" 
                          placeholder="https://drive.google.com/..." 
                        />
                        <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                          <Globe size={18} />
                        </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Bio</label>
                    <textarea 
                      value={profile.bio} 
                      onChange={e => setProfile({...profile, bio: e.target.value})} 
                      rows={4} 
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm resize-none leading-relaxed min-h-[120px]" 
                      placeholder="Tell recruiters about your background, passions, and goals..." 
                    />
                  </div>

                  {/* Skills */}
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Skills</label>
                    <input 
                      value={profile.skills} 
                      onChange={e => setProfile({...profile, skills: e.target.value})} 
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm" 
                      placeholder="React, TypeScript, Node.js, System Design..." 
                    />
                    <p className="text-[11px] text-slate-400 font-medium pl-1">Separate skills with commas</p>
                  </div>
                </div>
                
                {/* --- Action Buttons (Direct Styling) --- */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-slate-200/60">
                  <button 
                    onClick={() => setIsEditingProfile(false)} 
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile} 
                    disabled={savingProfile} 
                    className="flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none px-8 shadow-lg shadow-indigo-500/20"
                  >
                    {savingProfile ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} 
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              /* --- VIEW MODE --- */
              <div className="animate-in fade-in duration-500 space-y-8">
                 <div className="flex flex-wrap justify-center md:justify-start gap-3 border-b border-slate-100 pb-8">
                     <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/60 shadow-sm">
                         <Mail size={16} className="text-slate-400" /> 
                         {profile.email}
                     </div>
                     
                     {profile.resume_url && (
                         <a 
                           href={ensureUrl(profile.resume_url)} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                         >
                            <FileText size={16} /> View Resume <ExternalLink size={12} className="opacity-50" />
                         </a>
                     )}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    <div className="md:col-span-2 space-y-3">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                         About Me
                      </h3>
                      <p className="text-slate-600 leading-7 whitespace-pre-wrap text-[15px]">
                        {profile.bio || <span className="italic text-slate-400">Your bio is currently empty. Click edit to introduce yourself to the world.</span>}
                      </p>
                    </div>

                    <div className="md:col-span-1 space-y-3">
                       <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                         Skills
                       </h3>
                       <div className="flex flex-wrap gap-2">
                        {profile.skills ? profile.skills.split(",").filter(s => s.trim()).map((skill, i) => (
                          <span 
                            key={i} 
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-default"
                          >
                            {skill.trim()}
                          </span>
                        )) : <span className="text-sm text-slate-400 italic">No skills listed.</span>}
                      </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </section>

       {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* --- Left Column: Experience (Takes 2/3) --- */}
           <div className="lg:col-span-2 space-y-8">
              
              {/* Experience Section */}
              <section className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm"><Briefcase size={18} /></span> 
                    Experience
                  </h2>
                  <button 
                    onClick={() => setActiveExp({ title: "", company: "", location: "", start_date: "", end_date: "", is_current: false, description: "" })}
                    className="flex items-center justify-center w-9 h-9 text-blue-600 bg-white border border-blue-100 hover:border-blue-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="p-8">
                  <div className="space-y-1 relative">
                    {/* Vertical Timeline Line */}
                    {experiences.length > 0 && (
                      <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-slate-200 via-slate-200 to-transparent"></div>
                    )}
                    
                    {experiences.length === 0 ? (
                      <EmptyState icon={<Briefcase size={24} />} text="No work experience" subText="Add your career history here." />
                    ) : experiences.map((exp) => (
                      <div key={exp.id} className="group relative pl-12 py-2 transition-all">
                        {/* Timeline Dot */}
                        <div className="absolute left-0 top-3.5 h-[10px] w-[10px] ml-[14px] rounded-full bg-white border-[3px] border-slate-300 group-hover:border-blue-500 group-hover:scale-125 transition-all shadow-sm z-10"></div>
                        
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 p-5 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all duration-200 group-hover:shadow-sm">
                           <div className="space-y-2 w-full">
                             <div className="flex justify-between items-start w-full">
                               <div>
                                 <h3 className="font-bold text-slate-900 text-lg leading-tight">{exp.title}</h3>
                                 <div className="text-sm font-semibold text-slate-600 flex flex-wrap items-center gap-x-2 mt-1">
                                   <Building2 size={14} className="text-blue-500" /> {exp.company}
                                 </div>
                               </div>
                               
                               {/* Edit/Delete Buttons (Visible on Hover) */}
                               <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => setActiveExp(exp)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"><Edit2 size={14}/></button>
                                 <button onClick={() => handleDeleteItem("experiences", exp.id!)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-300 transition-all shadow-sm hover:shadow-md"><Trash2 size={14}/></button>
                               </div>
                             </div>

                             <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 pt-1">
                               <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-sm">
                                  <MapPin size={12} className="text-slate-400" /> {exp.location}
                               </span>
                               <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-sm">
                                  <Calendar size={12} className="text-slate-400" /> 
                                  {exp.start_date} — {exp.is_current ? <span className="text-green-600 font-bold bg-green-50 px-1.5 rounded">Present</span> : exp.end_date}
                               </span>
                             </div>

                             {exp.description && (
                               <div className="relative mt-3 pl-4 border-l-2 border-slate-100">
                                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                               </div>
                             )}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Education Section */}
              <section className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm"><GraduationCap size={18} /></span> 
                    Education
                  </h2>
                  <button 
                    onClick={() => setActiveEdu({ school: "", degree: "", field_of_study: "", start_year: "", end_year: "" })}
                    className="flex items-center justify-center w-9 h-9 text-indigo-600 bg-white border border-indigo-100 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="p-8 grid grid-cols-1 gap-6">
                   {educations.length === 0 ? (
                      <EmptyState icon={<GraduationCap size={24} />} text="No education" subText="List your degrees." />
                   ) : educations.map(edu => (
                     <div key={edu.id} className="relative p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-300 hover:bg-white hover:shadow-lg hover:shadow-indigo-100/50 transition-all group">
                       <div className="flex justify-between items-start">
                         <div className="space-y-1">
                           <h3 className="font-bold text-slate-900 text-lg">{edu.school}</h3>
                           <div className="flex flex-wrap items-center gap-2 text-sm text-indigo-600 font-semibold">
                              <Award size={14} /> <span>{edu.degree}</span> 
                              <span className="text-slate-300">•</span>
                              <span>{edu.field_of_study}</span>
                           </div>
                           <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-3 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-500 shadow-sm">
                              <Calendar size={12} /> {edu.start_year} - {edu.end_year}
                           </div>
                         </div>
                         <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setActiveEdu(edu)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"><Edit2 size={14}/></button>
                            <button onClick={() => handleDeleteItem("educations", edu.id!)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-300 transition-all shadow-sm hover:shadow-md"><Trash2 size={14}/></button>
                         </div>
                       </div>
                     </div>
                   ))}
                </div>
              </section>
           </div>

           {/* --- Right Column: Certifications --- */}
           <div className="lg:col-span-1 space-y-8">
              <section className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden sticky top-24 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Award size={18} className="text-orange-500" /> Certifications
                  </h2>
                  <button 
                    onClick={() => setActiveCert({ name: "", issuer: "", issue_date: "", credential_url: "" })}
                    className="flex items-center justify-center w-7 h-7 text-orange-600 bg-white border border-orange-100 hover:border-orange-500 hover:bg-orange-500 hover:text-white rounded-lg transition-all shadow-sm hover:shadow-md active:scale-90"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {certifications.length === 0 ? (
                     <EmptyState icon={<Award size={20} />} text="No Items" subText="Add certifications." />
                  ) : certifications.map(cert => (
                    <div key={cert.id} className="group flex flex-col p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-orange-300 hover:shadow-md hover:shadow-orange-100/50 transition-all relative">
                      <div className="flex justify-between items-start">
                         <div className="pr-6">
                            <h4 className="font-bold text-sm text-slate-900 leading-snug">{cert.name}</h4>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{cert.issuer}</p>
                         </div>
                         <div className="flex flex-col gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2">
                             <button onClick={() => setActiveCert(cert)} className="p-1.5 bg-white border border-slate-100 rounded-md text-slate-400 hover:text-orange-600 hover:border-orange-200 shadow-sm transition-all"><Edit2 size={12} /></button>
                             <button onClick={() => handleDeleteItem("certifications", cert.id!)} className="p-1.5 bg-white border border-slate-100 rounded-md text-slate-400 hover:text-red-600 hover:border-red-200 shadow-sm transition-all"><Trash2 size={12} /></button>
                         </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/50">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded-full">{cert.issue_date}</span>
                         {cert.credential_url && (
                           <a href={ensureUrl(cert.credential_url)} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full hover:bg-orange-100 transition-colors">
                              Credential <ExternalLink size={10} />
                           </a>
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
           </div>
      </div>

      {/* --- MODALS (Updated with Inline Styles) --- */}

      {/* 1. Experience Modal */}
      {activeExp && (
        <Modal title={activeExp.id ? "Edit Experience" : "Add Experience"} onClose={() => setActiveExp(null)}>
           <div className="space-y-6">
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Job Title</label>
                   <div className="relative group">
                     <input className="w-full px-4 py-3 pl-10 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm" value={activeExp.title} onChange={e => setActiveExp({...activeExp, title: e.target.value})} placeholder="e.g. Product Manager" autoFocus />
                     <Briefcase size={18} className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Company</label>
                   <div className="relative group">
                     <input className="w-full px-4 py-3 pl-10 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm" value={activeExp.company} onChange={e => setActiveExp({...activeExp, company: e.target.value})} placeholder="e.g. Google" />
                     <Building2 size={18} className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Location</label>
                   <div className="relative group">
                      <input className="w-full px-4 py-3 pl-10 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm" value={activeExp.location} onChange={e => setActiveExp({...activeExp, location: e.target.value})} placeholder="e.g. London, UK" />
                      <MapPin size={18} className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                   </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Start Date</label>
                    <input type="date" className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm" value={activeExp.start_date} onChange={e => setActiveExp({...activeExp, start_date: e.target.value})} />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">End Date</label>
                    <input type="date" disabled={activeExp.is_current} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm disabled:bg-slate-100 disabled:text-slate-400" value={activeExp.end_date} onChange={e => setActiveExp({...activeExp, end_date: e.target.value})} />
                 </div>
              </div>
              
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 cursor-pointer transition-all group select-none">
                  <div className="relative flex items-center">
                    <input type="checkbox" className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-blue-500 checked:bg-blue-500" checked={activeExp.is_current} onChange={e => setActiveExp({...activeExp, is_current: e.target.checked})} />
                     <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                        <CheckCircle2 size={12} />
                     </div>
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">I currently work here</span>
              </label>

              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Description</label>
                 <textarea rows={5} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm resize-none leading-relaxed" value={activeExp.description} onChange={e => setActiveExp({...activeExp, description: e.target.value})} placeholder="Describe your key responsibilities and achievements..." />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-2 border-t border-slate-100">
                 <button onClick={() => setActiveExp(null)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-all">Cancel</button>
                 <button onClick={() => handleSaveItem("experiences", activeExp, () => setActiveExp(null))} disabled={modalSaving} className="flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none w-full sm:w-auto">
                    {modalSaving ? <Loader2 className="animate-spin" size={18}/> : "Save Experience"}
                 </button>
              </div>
           </div>
        </Modal>
      )}

      {/* 2. Education Modal */}
      {activeEdu && (
        <Modal title="Education" onClose={() => setActiveEdu(null)}>
           <div className="space-y-6">
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">School / University</label>
                <div className="relative group">
                    <input className="w-full px-4 py-3 pl-10 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm" value={activeEdu.school} onChange={e => setActiveEdu({...activeEdu, school: e.target.value})} placeholder="e.g. Stanford University" autoFocus />
                    <Building2 size={18} className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Degree</label>
                  <div className="relative group">
                    <input className="w-full px-4 py-3 pl-10 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm" value={activeEdu.degree} onChange={e => setActiveEdu({...activeEdu, degree: e.target.value})} placeholder="e.g. Bachelor's" />
                    <Award size={18} className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Field of Study</label>
                  <input className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm" value={activeEdu.field_of_study} onChange={e => setActiveEdu({...activeEdu, field_of_study: e.target.value})} placeholder="e.g. Computer Science" />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Start Year</label>
                   <input className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm text-center" placeholder="YYYY" maxLength={4} value={activeEdu.start_year} onChange={e => setActiveEdu({...activeEdu, start_year: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">End Year</label>
                   <input className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm text-center" placeholder="YYYY" maxLength={4} value={activeEdu.end_year} onChange={e => setActiveEdu({...activeEdu, end_year: e.target.value})} />
                </div>
             </div>

             <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-2 border-t border-slate-100">
                 <button onClick={() => setActiveEdu(null)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-all">Cancel</button>
                 <button onClick={() => handleSaveItem("educations", activeEdu, () => setActiveEdu(null))} disabled={modalSaving} className="flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none w-full sm:w-auto">
                    {modalSaving ? <Loader2 className="animate-spin" size={18}/> : "Save Education"}
                 </button>
             </div>
           </div>
        </Modal>
      )}

      {/* 3. Certification Modal */}
      {activeCert && (
        <Modal title="Certification" onClose={() => setActiveCert(null)}>
           <div className="space-y-6">
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Certification Name</label>
                <div className="relative group">
                    <input className="w-full px-4 py-3 pl-10 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm" value={activeCert.name} onChange={e => setActiveCert({...activeCert, name: e.target.value})} placeholder="e.g. AWS Solutions Architect" autoFocus />
                    <Award size={18} className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Issuing Organization</label>
                <div className="relative group">
                    <input className="w-full px-4 py-3 pl-10 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm" value={activeCert.issuer} onChange={e => setActiveCert({...activeCert, issuer: e.target.value})} placeholder="e.g. Amazon Web Services" />
                    <Building2 size={18} className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Issue Date</label>
                <input type="date" className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm" value={activeCert.issue_date} onChange={e => setActiveCert({...activeCert, issue_date: e.target.value})} />
             </div>
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Credential URL</label>
                <div className="relative group">
                    <input className="w-full px-4 py-3 pl-10 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-400 text-slate-800 shadow-sm" value={activeCert.credential_url} onChange={e => setActiveCert({...activeCert, credential_url: e.target.value})} placeholder="https://..." />
                    <LinkIcon size={18} className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
             </div>

             <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-2 border-t border-slate-100">
                 <button onClick={() => setActiveCert(null)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-all">Cancel</button>
                 <button onClick={() => handleSaveItem("certifications", activeCert, () => setActiveCert(null))} disabled={modalSaving} className="flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none w-full sm:w-auto">
                    {modalSaving ? <Loader2 className="animate-spin" size={18}/> : "Save Certification"}
                 </button>
             </div>
           </div>
        </Modal>
        )}
      </main>
      </div>
    );
  }

// --- Helper Components ---

function EmptyState({ icon, text, subText }: { icon: React.ReactNode, text: string, subText: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
      <div className="bg-white p-4 rounded-full shadow-sm mb-4 text-slate-300 ring-1 ring-slate-100">
        {icon}
      </div>
      <p className="font-bold text-slate-900 text-sm">{text}</p>
      <p className="text-xs text-slate-400 max-w-[200px] mt-1">{subText}</p>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 zoom-in-95 duration-300 relative z-10 rounded-t-3xl sm:rounded-3xl ring-1 ring-slate-900/5">
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-900 tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}