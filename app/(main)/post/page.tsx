"use client";

import { Suspense } from "react"; // 1. Import Suspense
import PostPage from "./PostComponent";

export default function AuthPage() {
  return (
        <Suspense fallback={<></>}>
           <PostPage />
        </Suspense>
     
  );
}