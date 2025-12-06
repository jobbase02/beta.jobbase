// app/post/page.jsx
import { Suspense } from 'react';
import PostContent from './PageRender'; // Apne component ka path yahan check kar lena

export default function Page() {
  return (
    // Suspense Boundary yahan lagayi hai
    <Suspense fallback={<></>}>
      <PostContent />
    </Suspense>
  );
}