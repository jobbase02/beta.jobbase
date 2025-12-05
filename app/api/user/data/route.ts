import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Helper to get Supabase Client
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );
}

// --- GET: Fetch Profile and All Lists ---
export async function GET() {
  const supabase = await getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    // 1. Fetch all data in parallel (Faster & avoids FK relationship errors)
    const [profileRes, expRes, eduRes, certRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("experiences").select("*").eq("user_id", user.id),
      supabase.from("educations").select("*").eq("user_id", user.id),
      supabase.from("certifications").select("*").eq("user_id", user.id),
    ]);

    // 2. Handle "New User" scenario (Profile doesn't exist yet)
    // If profileRes.error is present, we assume it's a new user and return empty defaults
    const profileData = profileRes.data || {
        full_name: user.user_metadata?.full_name || "",
        email: user.email,
        headline: "",
        bio: "",
        skills: ""
    };

    const experiences = expRes.data || [];
    const educations = eduRes.data || [];
    const certifications = certRes.data || [];

    // 3. Sort lists (Safety checks added for missing dates)
    experiences.sort((a: any, b: any) => 
        new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime()
    );
    
    // Convert years to numbers for sorting, fallback to 0
    educations.sort((a: any, b: any) => 
        (parseInt(b.end_year) || 0) - (parseInt(a.end_year) || 0)
    );

    // 4. Construct the final object shape your Frontend expects
    const combinedData = {
      ...profileData,
      experiences,
      educations,
      certifications
    };

    return NextResponse.json({ data: combinedData }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
  }
}

// --- POST: Update Basic Profile Info ---
export async function POST(request: Request) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email, // Ensure email is kept in sync
      full_name: body.full_name,
      headline: body.headline,
      bio: body.bio,
      skills: body.skills,
      resume_url: body.resume_url,
      updated_at: new Date().toISOString(),
    });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ message: "Profile saved" }, { status: 200 });
}

// --- PUT: Upsert (Add/Edit) List Item ---
export async function PUT(request: Request) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { type, data } = await request.json(); 
  
  // Security Check: Whitelist allowed tables
  const allowedTables = ["experiences", "educations", "certifications"];
  if (!allowedTables.includes(type)) {
    return NextResponse.json({ message: "Invalid table" }, { status: 400 });
  }

  // Inject user_id securely
  const payload = { ...data, user_id: user.id };

  // --- FIX: Sanitize Date Fields (Convert "" to NULL) ---
  if (type === "experiences") {
    // If start_date is empty string, make it null
    if (payload.start_date === "") payload.start_date = null;

    // If end_date is empty string OR job is current, make it null
    if (payload.end_date === "" || payload.is_current === true) {
      payload.end_date = null;
    }
  }

  if (type === "certifications") {
    // Handle potential empty date strings for certs
    if (payload.issue_date === "") payload.issue_date = null;
    if (payload.expiration_date === "") payload.expiration_date = null;
  }
  // -----------------------------------------------------

  // Remove empty ID if it exists (so Supabase treats it as a new Insert)
  if (!payload.id) delete payload.id;

  const { data: savedData, error } = await supabase
    .from(type)
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error("Save Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ data: savedData, message: "Item saved" }, { status: 200 });
}

// --- DELETE: Remove List Item ---
export async function DELETE(request: Request) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  if (!id || !type) return NextResponse.json({ message: "Missing params" }, { status: 400 });

  const { error } = await supabase
    .from(type)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // Security: Can only delete own data

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ message: "Item deleted" }, { status: 200 });
}