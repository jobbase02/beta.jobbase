"use client"

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
                    <Suspense fallback={<></>}>
                        <Navbar />
                    </Suspense>
                    <main className="flex-grow">
                        {children}
                    </main>

                </div>
            </body>
        </html>
    );
}