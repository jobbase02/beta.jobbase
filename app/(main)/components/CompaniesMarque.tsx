"use client";

import React from "react";

const COMPANIES = [
  { name: "Google", logo: "https://logo.clearbit.com/google.com" },
  { name: "Amazon", logo: "https://logo.clearbit.com/amazon.com" },
  { name: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com" },
  { name: "Airbus", logo: "https://logo.clearbit.com/airbus.com" },
  { name: "Amex", logo: "https://logo.clearbit.com/americanexpress.com" },
  { name: "Rubrik", logo: "https://logo.clearbit.com/rubrik.com" },
  { name: "Accenture", logo: "https://logo.clearbit.com/accenture.com" },
  { name: "Wipro", logo: "https://logo.clearbit.com/wipro.com" },
  { name: "Capgemini", logo: "https://logo.clearbit.com/capgemini.com" },
];

const Marquee = () => {
  return (
    // CHANGE 1: Removed 'mt-12'. Now the strip will touch the section above it.
    // CHANGE 2: Added 'relative z-10'. This ensures the badge floats ON TOP of the Hero section.
    <div className="w-full bg-white relative z-10 border-b border-zinc-200">
      
      {/* THE BADGE 
         - absolute top-0: Starts exactly at the seam between Hero and Strip.
         - -translate-y-1/2: Pushes it up so half is on the Hero (colored bg) and half is on the Strip (white bg).
      */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="bg-white px-6 py-2 rounded-full border border-zinc-200 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide text-zinc-600 uppercase">
            Companies we share updates for
          </span>
        </div>
      </div>

      {/* THE STRIP */}
      {/* Added border-t border-zinc-200 to give a crisp line that the badge sits on */}
      <div className="py-10 overflow-hidden relative border-t border-zinc-200">
        
        {/* Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />

        {/* Animation Container */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] items-center">
          {[...COMPANIES, ...COMPANIES, ...COMPANIES, ...COMPANIES].map((company, i) => (
            <div
              key={i}
              className="mx-10 md:mx-16 flex items-center justify-center min-w-[100px]"
            >
              <img
                src={company.logo}
                alt={company.name}
                className="h-8 md:h-10 w-auto object-contain hover:scale-110 transition-transform duration-300"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); } 
        }
      `}</style>
    </div>
  );
};

export default Marquee;