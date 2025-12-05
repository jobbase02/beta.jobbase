"use client";

import Hero from "./components/Hero";
import CompaniesMarque from "./components/CompaniesMarque";
import BentoCategories from "./components/BentoCategories";
import FeaturedJobs from "./components/FeaturedJobs";
import UserSegments from "./components/UserSegments";


const Background = () => (
  <div className="fixed inset-0 -z-10 bg-[#FAFAFA]">
    {/* Subtle Grid */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
    
    {/* Ambient Light - Boosted for better "Attraction" */}
    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none" />
  </div>
);


export default function JobBaseLanding() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <Background />
      <Hero />
      <CompaniesMarque/>
      <BentoCategories />
      <FeaturedJobs />
      <UserSegments />
    </div>
  );
} 