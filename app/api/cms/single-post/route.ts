import { NextResponse } from 'next/server';

const WP_API_URL = "https://cms.jobbase.in/wp-json/wp/v2/posts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ success: false, message: "Missing slug parameter" }, { status: 400 });
  }

  try {
    // Fetch post with _embed to get author, image, and terms (tags/categories)
    const response = await fetch(
      `${WP_API_URL}?slug=${slug}&_embed`, 
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`WordPress API Error: ${response.statusText}`);
    }

    const posts = await response.json();

    if (posts.length === 0) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
    }

    const post = posts[0];

    // --- Data Extraction ---

    // 1. Featured Image
    let featuredImage = null;
    if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
      featuredImage = post._embedded['wp:featuredmedia'][0].source_url;
    }

    // 2. Author Name
    let authorName = "JobBase Team"; // Default
    let authorAvatar = null;
    if (post._embedded && post._embedded['author'] && post._embedded['author'][0]) {
      authorName = post._embedded['author'][0].name;
      authorAvatar = post._embedded['author'][0].avatar_urls?.['96'];
    }

    // 3. Tags (Found in wp:term usually at index 1, but we iterate to be safe)
    let tags = [];
    if (post._embedded && post._embedded['wp:term']) {
      // wp:term is an array of arrays. We look for the one where taxonomy is 'post_tag'
      const tagTerms = post._embedded['wp:term'].flat().filter((term: any) => term.taxonomy === 'post_tag');
      tags = tagTerms.map((tag: any) => ({ id: tag.id, name: tag.name, slug: tag.slug }));
    }

    // 4. Content Processing (Add nofollow and target="_blank")
    let processedContent = post.content.rendered;
    
    // Regex to add rel="nofollow noopener noreferrer" and target="_blank" to all anchors
    // This is a robust replacement that handles existing attributes gracefully-ish, 
    // but ensures our required attributes are present.
    processedContent = processedContent.replace(
      /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi, 
      (match: string, quote: string, url: string) => {
        // Return the anchor with forced attributes
        return `<a href="${url}" target="_blank" rel="nofollow noopener noreferrer"`;
      }
    );

    const postData = {
      id: post.id,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      content: processedContent,
      slug: post.slug,
      date: post.date,
      modified: post.modified,
      featured_image: featuredImage,
      author: {
        name: authorName,
        avatar: authorAvatar
      },
      tags: tags
    };

    return NextResponse.json({ success: true, post: postData });

  } catch (error: any) {
    console.error("Post Fetch Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}