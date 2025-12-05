import React, { Suspense } from 'react';
import Navbar from './components/Navbar';
import "../globals.css";
export default function EmployerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="scroll-smooth">  
        <body>
        <div className="flex flex-col min-h-screen">
            <Navbar />
           
                   <main className="flex-grow">
                     {/* ✅ Correctly wrapped Suspense Boundary */}
                     <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                       {children}
                     </Suspense>
                   </main>
            
        </div>
        </body> 
        </html>
    );
}