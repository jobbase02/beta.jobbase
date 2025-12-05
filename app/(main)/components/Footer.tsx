"use client";

import React from "react";
import { 
  Instagram, 
  Linkedin, 
  Youtube, 
  ArrowUpRight 
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Link Data
  const companyLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Careers", href: "/careers" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Disclaimer", href: "/disclaimer" },
    { name: "Sitemap", href: "/sitemap.xml" },
  ];

  const resourceLinks = [
    { name: "Blog", href: "/blog" },
    { name: "Guides", href: "/guides" },
    { name: "Help Center", href: "/help" },
    { name: "Partners", href: "/partners" },
  ];

  const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-white border-t border-zinc-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column (Spans 4 columns on large screens) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <a href="/" className="inline-block">
              <img 
                src="/logo.png" 
                alt="JobBase Logo" 
                className="h-10 w-auto object-contain" 
              />
            </a>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
              Connecting exceptional talent with world-class companies. 
              We are building the infrastructure for the next generation of recruitment.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-2">
              {socialLinks.map((social, i) => {
                const Icon = social.icon;
                return (
                  <a
                    key={i}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-300 group"
                  >
                    <Icon size={18} className="transition-transform group-hover:scale-110" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns (Spanning remaining space) */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            
            {/* Company */}
            <div>
              <h4 className="font-bold text-zinc-900 mb-6 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-4">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-sm text-zinc-500 hover:text-zinc-900 font-medium transition-colors flex items-center group w-fit">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-zinc-900 mb-6 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-4">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-sm text-zinc-500 hover:text-zinc-900 font-medium transition-colors w-fit">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold text-zinc-900 mb-6 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-4">
                {resourceLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-sm text-zinc-500 hover:text-zinc-900 font-medium transition-colors flex items-center gap-1 group w-fit">
                      {link.name}
                      <ArrowUpRight size={12} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300 text-zinc-400" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-400 font-medium">
            © {currentYear} JobBase Inc. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-700">All systems normal</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;