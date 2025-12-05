import { NextResponse } from 'next/server';

// Configuration: Slug to ID Mapping
const CATEGORY_MAP: Record<string, number> = {
  "internship": 5,
  "walk-in-drive": 4,
  "resources": 13,
  "remote": 3,
  "off-campus-drive": 2
};

const WP_API_URL = "https://cms.jobbase.in/wp-json/wp/v2/posts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug || !CATEGORY_MAP[slug]) {
    return NextResponse.json({ success: false, message: "Invalid or missing category slug" }, { status: 400 });
  }

  const categoryId = CATEGORY_MAP[slug];

  try {
    // Fetch posts from WordPress
    // _embed is required to get the Featured Image and Author info
    const response = await fetch(
      `${WP_API_URL}?categories=${categoryId}&per_page=30&_embed`, 
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );

    if (!response.ok) {
      throw new Error(`WordPress API Error: ${response.statusText}`);
    }

    const posts = await response.json();

    // Simplify the data structure for the frontend
    const formattedPosts = posts.map((post: any) => {
      // Extract Featured Image
      let featuredImage = null;
      if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
        featuredImage = post._embedded['wp:featuredmedia'][0].source_url;
      }

      return {
        id: post.id,
        title: post.title.rendered,
        slug: post.slug,
        date: post.date,
        featured_image: featuredImage,
        // We inject the requested slug as the category name for display
        category_slug: slug
      };
    });

    return NextResponse.json({ success: true, posts: formattedPosts });

  } catch (error: any) {
    console.error("API Fetch Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}