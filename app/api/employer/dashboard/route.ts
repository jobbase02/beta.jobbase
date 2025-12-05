// app/api/employer/dashboard/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// --- Type Definitions for Supabase Response ---

/**
 * Defines the expected structure of a job record from the recentJobsPromise query.
 * Note: applications_count is returned as an array of objects for nested selects with count.
 */
interface RecentJob {
    id: string;
    title: string;
    created_at: string;
    status: string;
    applications_count: { count: number }[];
}


// --- Configuration & Helpers ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize Supabase Client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to get authenticated user from cookie.
 * @returns The user object (e.g., { id: 'employer_uuid' }) or null.
 */
async function getSessionUser(): Promise<{ id: string } | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('employer_session');

    if (!sessionCookie?.value) return null;

    try {
        // Assuming your cookie stores a JSON object with { id: 'employer_uuid', ... }
        const user = JSON.parse(sessionCookie.value);
        if (typeof user === 'object' && user !== null && 'id' in user) {
            return user as { id: string };
        }
        return null;
    } catch (e) {
        return null;
    }
}

// ----------------------------------------------------------------------

/**
 * GET: Fetch all dashboard statistics and recent jobs for the authenticated employer.
 */
export async function GET(request: Request) {
    try {
        const user = await getSessionUser();
        if (!user || !user.id) {
            // Unauthenticated users see a 401
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const employerId = user.id;

        // 1. Fetch Total Jobs Count
        const jobsCountPromise = supabase
            .from('jobs')
            .select('id', { count: 'exact', head: true })
            .eq('employer_id', employerId);

        // 2. Fetch Total Applications Count
        // NOTE: This logic fetches job IDs first, then counts applications based on those IDs.
        // This is kept as per the user's explicit request ("dont change any logic").
        const applicationsCountPromise = (async () => {
            const { data: jobIds, error: jobIdError } = await supabase
                .from('jobs')
                .select('id')
                .eq('employer_id', employerId);

            if (jobIdError) throw jobIdError;

            const ids = (jobIds || []).map(job => job.id);
            return supabase
                .from('applications')
                .select('id', { count: 'exact', head: true })
                .in('job_id', ids);
        })();

        // 3. Fetch Recent Jobs (5 latest, including status and application count)
        // The multiline string for select is kept as in the original code.
        const recentJobsPromise = supabase
            .from('jobs')
            .select(` id,
                title,
                created_at,
                status,
                applications_count:applications(count)
            `)
            .eq('employer_id', employerId)
            .order('created_at', { ascending: false })
            .limit(5);

        // Execute all promises in parallel
        const [
            { count: totalJobs, error: jobsError },
            { count: totalApplications, error: applicationsError },
            { data: recentJobsData, error: recentJobsError }
        ] = await Promise.all([
            jobsCountPromise,
            applicationsCountPromise,
            recentJobsPromise
        ]);

        if (jobsError || applicationsError || recentJobsError) {
            console.error('Supabase multi-query error:', jobsError || applicationsError || recentJobsError);
            return NextResponse.json(
                { message: 'Database query failed.', details: jobsError || applicationsError || recentJobsError },
                { status: 500 }
            );
        }

        // --- Apply Type Assertion to Fix Error ---

        const typedRecentJobsData = recentJobsData as RecentJob[] | null;

        return NextResponse.json({
            stats: {
                totalJobs: totalJobs || 0,
                totalApplications: totalApplications || 0,
            },
            // The type assertion above fixes the TypeScript errors in the .map() function below.
            recentJobs: (typedRecentJobsData || []).map(job => ({
                id: job.id,
                title: job.title,
                created_at: job.created_at,
                status: job.status,
                // Extract count from the array result
                applicationCount: job.applications_count[0]?.count || 0
            })),
        }, { status: 200 });

    } catch (error) {
        console.error('API GET Handler Error:', error);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}