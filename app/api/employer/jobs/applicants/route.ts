// app/api/employer/jobs/applicants/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// --- Configuration & Helpers ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize Supabase Client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define valid statuses (matching the database case: UPPERCASE)
const VALID_STATUSES = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED'];

// Helper to get authenticated user from cookie
async function getSessionUser() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('employer_session');

    if (!sessionCookie?.value) return null;

    try {
        // Assuming your cookie stores a JSON object with { id: 'employer_uuid' }
        return JSON.parse(sessionCookie.value);
    } catch (e) {
        return null;
    }
}

// Helper to check if the employer owns the job before proceeding
async function checkJobOwnership(jobId: string, employerId: string) {
    const { data, error } = await supabase
        .from('jobs')
        .select('id')
        .eq('id', jobId)
        .eq('employer_id', employerId)
        .single();

    return !error && data !== null;
}

// ----------------------------------------------------------------------

// 1. GET: Fetch all applicants for a specific job
// URL: /api/employer/jobs/applicants?job_id=UUID
export async function GET(request: Request) {
    try {
        const user = await getSessionUser();
        if (!user || !user.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('job_id');

        if (!jobId) {
            return NextResponse.json({ message: 'Missing job_id query parameter' }, { status: 400 });
        }

        // SECURITY CHECK: Ensure the employer owns the job
        const isOwner = await checkJobOwnership(jobId, user.id);
        if (!isOwner) {
            return NextResponse.json({ message: 'Job not found or access denied' }, { status: 404 });
        }

        // Fetch applicants for the job
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('job_id', jobId)
            .order('applied_at', { ascending: false });

        if (error) {
            console.error('Supabase fetch applicants error:', error);
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json({ applicants: data }, { status: 200 });

    } catch (error) {
        console.error('API GET Handler Error:', error);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}


// 2. PUT: Update an applicant's status
export async function PUT(request: Request) {
    try {
        const user = await getSessionUser();
        if (!user || !user.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { applicant_id, job_id, status } = body;

        if (!applicant_id || !job_id || !status) {
            return NextResponse.json({ message: 'Missing applicant_id, job_id, or status' }, { status: 400 });
        }

        const newStatus = String(status).toUpperCase();
        if (!VALID_STATUSES.includes(newStatus)) {
            return NextResponse.json({ 
                message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}.`,
            }, { status: 400 });
        }

        // SECURITY CHECK: Ensure the employer owns the job
        const isOwner = await checkJobOwnership(job_id, user.id);
        if (!isOwner) {
            return NextResponse.json({ message: 'Job not found or access denied' }, { status: 404 });
        }

        // Update the status
        const { data, error } = await supabase
            .from('applications')
            .update({ status: newStatus })
            .eq('id', applicant_id)
            .eq('job_id', job_id) // Match both ID and Job ID for safety
            .select();

        if (error) {
            console.error('Supabase update status error:', error);
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                { message: 'Applicant not found or status update failed (permission/ID mismatch)' },
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            message: 'Status updated successfully', 
            updatedApplicant: data[0] 
        }, { status: 200 });

    } catch (error) {
        console.error('API PUT Handler Error:', error);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}