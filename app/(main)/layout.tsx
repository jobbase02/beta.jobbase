import type { Metadata } from "next";
// Importing 'Inter' for UI and 'Merriweather' for that "News/Blog" reading feel
import { Inter, Merriweather } from "next/font/google";
import "../globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// 1. UI Font (Sans-Serif) - Clean, modern, good for navigation & buttons
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// 2. Reading Font (Serif) - Excellent for job descriptions & blog posts
const merriweather = Merriweather({
  variable: "--font-serif", // easier to remember as 'font-serif'
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"], // Including multiple weights for bold headlines
  display: "swap",
});

// 3. Metadata for JobBase.in
export const metadata: Metadata = {
  // IMPORTANT: Replace with your actual production URL
  metadataBase: new URL("https://jobbase.in"),
  
  title: {
    default: "JobBase.in | Find Your Next Career Move",
    template: "%s | JobBase.in",
  },
  description: "The premier job platform for professionals. Find jobs, recruit talent, and read career insights on JobBase.in.",
  
  keywords: ["jobs", "hiring", "career", "recruitment", "india", "job search"],

  // 4. Social Media Preview (The "Card" people see on LinkedIn/Twitter/WhatsApp)
  openGraph: {
    title: "JobBase.in - Find Your Dream Job",
    description: "Connect with top employers and discover opportunities.",
    url: "https://jobbase.in",
    siteName: "JobBase.in",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/logo.png", // Ensure this file exists in your 'public' folder
        width: 1200,
        height: 630,
        alt: "JobBase.in Logo",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "JobBase.in",
    description: "Connect with top employers and discover opportunities.",
    images: ["/logo.png"], 
  },
};

// 5. Clean Layout Component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${merriweather.variable}`}
      >
        <div>
          <Navbar />
        </div>
        {children}
        <Footer />
      </body>
    </html>
  );
}