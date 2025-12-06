// app/post/page.jsx
"use client";
import { Suspense } from 'react';
import ApplyPage from './ApplyComponent'; // Apne component ka path yahan check kar lena

export default function Page() {
  return (
    <Suspense fallback={<></>}>
      <ApplyPage />
    </Suspense>
  );
}