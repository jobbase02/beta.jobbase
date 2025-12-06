import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "../globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Suspense } from "react"; // ✅ Imported correctly

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jobbase.in"),
  title: {
    default: "JobBase.in | Find Your Next Career Move",
    template: "%s | JobBase.in",
  },
  description: "The premier job platform for professionals.",
  keywords: ["jobs", "hiring", "career", "recruitment", "india", "job search"],
  openGraph: {
    title: "JobBase.in - Find Your Dream Job",
    description: "Connect with top employers and discover opportunities.",
    url: "https://jobbase.in",
    siteName: "JobBase.in",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/logo.png",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${merriweather.variable} flex flex-col min-h-screen`}
      >
        <Suspense fallback={<div></div>}>
        <Navbar />
          </Suspense>
        
        <main className="flex-grow">
          {/* ✅ Correctly wrapped Suspense Boundary */}
            {children}
          
        </main>
        
        <Footer />
      </body>
    </html>
  );
}