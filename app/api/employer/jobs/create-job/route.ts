import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    // 1. Get the Session Cookie to authenticate the user
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('employer_session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { message: 'Unauthorized: No active session found' },
        { status: 401 }
      );
    }

    // 2. Parse Session Data safely to get the employer_id
    let employer_id;
    try {
      const sessionData = JSON.parse(sessionCookie.value);
      employer_id = sessionData.id;
      
      if (!employer_id) throw new Error("No ID in session");
    } catch (e) {
      return NextResponse.json(
        { message: 'Unauthorized: Invalid session data' },
        { status: 401 }
      );
    }

    // 3. Parse the incoming JSON body (we do NOT expect employer_id here anymore)
    const body = await request.json();
    const { title, description, last_date } = body;

    // 4. Validate required fields
    if (!title || !description || !last_date) {
      return NextResponse.json(
        { message: 'Missing required fields: title, description, or last_date' },
        { status: 400 }
      );
    }

    // 5. Insert data into the 'jobs' table
    const { data, error } = await supabase
      .from('jobs')
      .insert([
        {
          employer_id, // UUID from the secure HTTP-only cookie
          title,       // Text
          description, // Text (HTML content)
          last_date,   // Timestamp
        },
      ])
      .select();

    // 6. Handle Supabase errors
    if (error) {
      console.error('Supabase Insertion Error:', error);
      return NextResponse.json(
        { message: error.message }, 
        { status: 500 }
      );
    }

    // 7. Return success response
    return NextResponse.json(
      { message: 'Job posted successfully', job: data },
      { status: 201 }
    );

  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}