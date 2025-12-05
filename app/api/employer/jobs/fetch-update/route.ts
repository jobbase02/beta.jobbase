import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to get authenticated user from cookie
async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('employer_session');

  if (!sessionCookie?.value) return null;

  try {
    return JSON.parse(sessionCookie.value);
  } catch (e) {
    return null;
  }
}

// 1. GET: Fetch all jobs for the current employer
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || !user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ jobs: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

// 2. PUT: Update a specific job (Title, Desc, Date, STATUS)
export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, last_date, status } = body;

    // Validate only ID is strictly required for the query
    if (!id) {
      return NextResponse.json(
        { message: 'Missing job ID' },
        { status: 400 }
      );
    }

    // Perform Update
    const { data, error } = await supabase
      .from('jobs')
      .update({ title, description, last_date, status }) // Added status
      .eq('id', id)
      .eq('employer_id', user.id) // Ensure ownership
      .select();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { message: 'Job not found or permission denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Job updated successfully', job: data[0] }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

// 3. DELETE: Delete a specific job
export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get ID from URL params (e.g. ?id=123)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing job ID' }, { status: 400 });
    }

    // Delete
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('employer_id', user.id); // Ensure ownership

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Job deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}