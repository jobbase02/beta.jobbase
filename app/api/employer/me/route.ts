// app/api/auth/employer/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Standard Anon Key setup)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('employer_session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 1. Get the ID from your custom session cookie
    const sessionUser = JSON.parse(sessionCookie.value);
    const employerId = sessionUser.id;

    // 2. Fetch the fresh 'name' and other details from Supabase using that ID
    const { data: employer, error } = await supabase
      .from('employers')
      .select('name, email, company_name')
      .eq('id', employerId)
      .single();

    if (error || !employer) {
      console.error("Error fetching employer details:", error);
      // Fallback: return session data if DB fetch fails
      return NextResponse.json({ data: sessionUser }, { status: 200 });
    }

    // 3. Return the merged data (Session ID + DB Name)
    const userData = {
      id: employerId,
      name: employer.name,           // The specific field you wanted
      email: employer.email,
      company: employer.company_name,
      role: sessionUser.role
    };

    return NextResponse.json({ data: userData }, { status: 200 });

  } catch (error) {
    console.error("Session API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}