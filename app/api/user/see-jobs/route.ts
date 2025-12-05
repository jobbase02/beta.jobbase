import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    // Fetch jobs with nested joins: 
    // 1. Jobs -> Employers -> Companies (for logo/name)
    // 2. Jobs -> Applications (count only)
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        description,
        last_date,
        created_at,
        employers (
          companies (
            name,
            logo_url,
            location,
            size
          )
        ),
        applications (count)
      `)
      .eq('status', true) // Only fetch active jobs
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    // Flatten the data structure
    const jobs = data.map((job: any) => {
      // Extract company details safely
      const employerData = Array.isArray(job.employers) ? job.employers[0] : job.employers;
      const companyData = employerData?.companies;

      // Extract application count safely
      // Supabase returns count in an array of objects like [{ count: 5 }]
      const appCountData = job.applications;
      const applicationCount = Array.isArray(appCountData) && appCountData.length > 0 
        ? appCountData[0].count 
        : 0;

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        last_date: job.last_date,
        created_at: job.created_at,
        company_name: companyData?.name || 'Confidential',
        logo_url: companyData?.logo_url || null,
        location: companyData?.location || 'Remote',
        company_size: companyData?.size || 'N/A',
        application_count: applicationCount, // Added field
      };
    });

    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    console.error('Error fetching featured jobs:', error.message);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}