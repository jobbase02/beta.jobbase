"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Globe, 
  Briefcase, 
  MapPin, 
  GraduationCap, 
  Trophy 
} from "lucide-react";

// Updated data for the specific categories requested
const CATEGORIES = [
  {
    id: 1,
    title: "Internships",
    desc: "Gain real-world experience with top tech companies.",
    count: "500+ Openings",
    icon: GraduationCap,
    bg: "bg-blue-50/50",
    border: "border-blue-100",
    color: "text-blue-600",
  },
  {
    id: 2,
    title: "Remote Jobs",
    desc: "Work from the comfort of your home or anywhere.",
    count: "350+ Jobs",
    icon: Globe,
    bg: "bg-purple-50/50",
    border: "border-purple-100",
    color: "text-purple-600",
  },
  {
    id: 3,
    title: "Off Campus Drives",
    desc: "Exclusive recruitment drives for fresh graduates.",
    count: "200+ Drives",
    icon: Briefcase,
    bg: "bg-orange-50/50",
    border: "border-orange-100",
    color: "text-orange-600",
  },
  {
    id: 4,
    title: "Walk-in Drives",
    desc: "Direct interviews at company locations near you.",
    count: "80+ Events",
    icon: MapPin,
    bg: "bg-emerald-50/50",
    border: "border-emerald-100",
    color: "text-emerald-600",
  },
  {
    id: 5,
    title: "Competitions",
    desc: "Hackathons, coding challenges, and hiring contests.",
    count: "45+ Events",
    icon: Trophy,
    bg: "bg-rose-50/50",
    border: "border-rose-100",
    color: "text-rose-600",
  },
];

const BentoCategories = () => {
  const router = useRouter();

  const handleCategoryClick = (categoryTitle: string) => {
    // Redirect to /posts with the category query param
    // We use encodeURIComponent to handle spaces/special chars safely
    router.push(`/posts?categories=${encodeURIComponent(categoryTitle)}`);
  };

  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Soft Gradient Blob for depth */}
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold text-zinc-900 tracking-tight mb-4">Explore Opportunities.</h2>
            <p className="text-zinc-500 text-lg">Browse tailored opportunities. From internships to hackathons, find what suits your career path.</p>
          </div>
        </div>

        {/* Grid Layout - Adjusted for 5 items (3 on top, 2 on bottom for a balanced look on large screens) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.title)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              // Spanning logic: Make the first 2 span 3 columns, next 3 span 2 columns on large screens to fit 5 items nicely
              className={`
                group p-8 rounded-3xl ${cat.bg} border border-zinc-100 ${cat.border} 
                hover:shadow-xl hover:shadow-zinc-200/40 transition-all cursor-pointer 
                flex flex-col justify-between h-[260px] relative overflow-hidden
                ${i < 3 ? 'lg:col-span-2' : 'lg:col-span-3'} 
              `}
            >
              <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-white/0 to-white/40 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex justify-between items-start">
                <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-zinc-100/50 ${cat.color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                  {(() => {
                    const Icon = cat.icon;
                    return <Icon size={26} strokeWidth={1.5} />;
                  })()}
                </div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-zinc-100 shadow-sm transform translate-x-2 group-hover:translate-x-0">
                  <ArrowRight size={14} className="text-zinc-900" />
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-zinc-900 mb-2">{cat.title}</h3>
                <p className="text-zinc-600 text-sm mb-4 line-clamp-2">{cat.desc}</p>
                <div className="inline-block px-3 py-1 rounded-md bg-white border border-zinc-200/50 text-xs font-semibold text-zinc-700 shadow-sm">
                  {cat.count}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoCategories;