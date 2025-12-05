import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { job_id, candidate_name, candidate_email, resume_url } = body;

    // 1. Basic Validation
    if (!job_id || !candidate_name || !candidate_email || !resume_url) {
      return NextResponse.json(
        { success: false, error: 'All fields are required.' }, 
        { status: 400 }
      );
    }

    // 2. Check for duplicate application Manually
    // This is safer if you haven't set up the UNIQUE constraint in SQL yet.
    const { data: existingApp, error: checkError } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', job_id)
      .eq('candidate_email', candidate_email)
      .single();

    if (existingApp) {
      return NextResponse.json(
        { success: false, error: 'You have already applied for this job.' },
        { status: 409 } // 409 Conflict
      );
    }

    // 3. Insert into applications table
    const { data, error } = await supabase
      .from('applications')
      .insert([
        {
          job_id,
          candidate_name,
          candidate_email,
          resume_url,
          status: 'pending', // Default status
          applied_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      // Fallback: Check for DB-level constraint violation (code 23505)
      if (error.code === '23505') {
         return NextResponse.json(
           { success: false, error: 'You have already applied for this job.' }, 
           { status: 409 }
         );
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Application submitted successfully!', data });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}