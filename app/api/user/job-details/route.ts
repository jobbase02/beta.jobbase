import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { job_id } = await request.json();

    if (!job_id) {
      return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
    }

    // Fetch Job + Employer + Company details
    // We use the foreign key relationships to nest the data.
    // jobs -> employers (via employer_id) -> companies (via company_id)
    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
        employers (
          *,
          companies (
            *
          )
        )
      `)
      .eq('id', job_id)
      .single();

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Optional: Format the data for the frontend
    // The schema shows 'status' is a boolean. 
    // Let's create a readable string for "Active" vs "Closed".
    const formattedJob = {
      ...job,
      status_label: job.status ? 'Active' : 'Closed', 
      // Flattens the nested company data for easier access if needed
      company_logo: job.employers?.companies?.logo_url,
      company_name: job.employers?.companies?.name
    };

    return NextResponse.json({ success: true, job: formattedJob });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}