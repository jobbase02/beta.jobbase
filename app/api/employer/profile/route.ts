// app/api/employer/profile/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// --- Configuration & Helpers ---
// NOTE: Ensure these environment variables are correctly set in your hosting environment.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// REMOVED: Service Role Key as requested.
// Using Anon Key for all operations.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize the Supabase Client globally.
// Client for reads and writes (RLS policies on DB side must allow this)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);


// Helper to get authenticated user from cookie
async function getSessionUser() {
    // Access cookies directly
    const cookieStore = await cookies(); 
    const sessionCookie = cookieStore.get('employer_session');

    if (!sessionCookie?.value) return null;

    try {
        // Assuming your cookie stores a JSON object with { id: 'employer_uuid', ... }
        return JSON.parse(sessionCookie.value);
    } catch (e) {
        return null;
    }
}

// ----------------------------------------------------------------------

// 1. GET: Fetch employer profile details
export async function GET(request: Request) {
    try {
        const user = await getSessionUser();
        if (!user || !user.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const employerId = user.id;
        
        console.log("Attempting to fetch profile for Employer ID:", employerId);

        // Using the supabaseAnon client
        const { data, error } = await supabaseAnon
            .from('employers')
            .select('name, email, company_name, position')
            .eq('id', employerId)
            .single(); 

        if (error) {
            console.error('Supabase fetch profile error:', error);
            // Handling "No rows returned" (PGRST116) as 404 Not Found
            if (error.code === 'PGRST116') {
                 return NextResponse.json({ message: 'Employer profile record not found in database (404).' }, { status: 404 });
            }
            return NextResponse.json({ message: 'Database fetch failed: ' + error.message }, { status: 500 });
        }
        
        if (!data) {
             return NextResponse.json({ message: 'Employer profile record not found (Data is null).' }, { status: 404 });
        }

        return NextResponse.json({ profile: data }, { status: 200 });

    } catch (error) {
        console.error('API GET Handler Error:', error);
        return NextResponse.json({ message: 'Server initialization failed or unhandled error occurred.' }, { status: 500 });
    }
}

// 2. PUT: Update employer profile details
export async function PUT(request: Request) {
    try {
        const user = await getSessionUser();
        if (!user || !user.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const employerId = user.id;
        const body = await request.json();
        
        const { name, company_name, position } = body;
        
        // Data payload to update
        const updatePayload = {
            ...(name !== undefined && { name }),
            ...(company_name !== undefined && { company_name }),
            ...(position !== undefined && { position }),
            updated_at: new Date().toISOString()
        };

        // Check if any actual field (besides updated_at) was provided
        if (Object.keys(updatePayload).length <= 1) { 
            return NextResponse.json({ message: 'No fields provided for update.' }, { status: 400 });
        }

        // 🚀 CHANGED: Now using supabaseAnon (Anon Key) instead of Service Key
        const { data, error } = await supabaseAnon 
            .from('employers')
            .update(updatePayload)
            .eq('id', employerId)
            .select('name, email, company_name, position'); // Return updated fields

        if (error) {
            console.error('Supabase update profile error:', error);
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ message: 'Profile update failed or user not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Profile updated successfully', profile: data[0] }, { status: 200 });

    } catch (error) {
        console.error('API PUT Handler Error:', error);
        return NextResponse.json({ message: 'Server initialization failed or unhandled error occurred.' }, { status: 500 });
    }
}