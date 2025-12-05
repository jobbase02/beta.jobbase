import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// --- Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Using Anon Key as requested (Ensure your SQL policies allow this)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Helper: Get Session User ---
async function getSessionUser() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('employer_session'); // Ensure this matches your login cookie name
    if (!sessionCookie?.value) return null;
    try {
        return JSON.parse(sessionCookie.value);
    } catch {
        return null;
    }
}

// ----------------------------------------------------------------------

// 1. GET: Fetch Company Details (Includes "Lazy Linking" Logic)
export async function GET(request: Request) {
    try {
        const user = await getSessionUser();
        if (!user || !user.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Step A: Fetch Employer Data
        const { data: employer, error: empError } = await supabase
            .from('employers')
            .select('id, company_id, company_name')
            .eq('id', user.id)
            .single();

        if (empError || !employer) {
            return NextResponse.json({ message: 'Employer record not found.' }, { status: 404 });
        }

        // Step B: Check if linked. If NOT, perform "Lazy Link"
        let activeCompanyId = employer.company_id;

        if (!activeCompanyId && employer.company_name) {
            console.log(`[LazyLink] Employer ${user.id} has no company_id. Attempting to link to "${employer.company_name}"...`);

            // 1. Try to find an existing company with this name
            const { data: existingCompany } = await supabase
                .from('companies')
                .select('id')
                .eq('name', employer.company_name)
                .single();

            if (existingCompany) {
                activeCompanyId = existingCompany.id;
            } else {
                // 2. If not found, create it
                const { data: newCompany, error: createError } = await supabase
                    .from('companies')
                    .insert({ name: employer.company_name })
                    .select('id')
                    .single();
                
                if (createError) throw createError;
                activeCompanyId = newCompany.id;
            }

            // 3. Update the employer record with the new ID
            if (activeCompanyId) {
                await supabase
                    .from('employers')
                    .update({ company_id: activeCompanyId })
                    .eq('id', user.id);
            }
        }

        // Step C: Fetch the final Company Data
        if (!activeCompanyId) {
            return NextResponse.json({ message: 'No company linked and no name found to create one.' }, { status: 404 });
        }

        const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', activeCompanyId)
            .single();

        if (companyError) throw companyError;

        return NextResponse.json({ company: companyData }, { status: 200 });

    } catch (error: any) {
        console.error('API GET Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// 2. PUT: Update Company Details
export async function PUT(request: Request) {
    try {
        const user = await getSessionUser();
        if (!user || !user.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Get the company_id from the employer record
        const { data: employer } = await supabase
            .from('employers')
            .select('company_id')
            .eq('id', user.id)
            .single();

        if (!employer?.company_id) {
            return NextResponse.json({ message: 'Cannot update: No company linked to this account.' }, { status: 400 });
        }

        const body = await request.json();

        // Security: Remove sensitive fields if they exist in body
        const { id, created_at, ...updates } = body;

        // Perform Update
        const { data, error } = await supabase
            .from('companies')
            .update({
                ...updates,
                updated_at: new Date().toISOString() // Always update timestamp
            })
            .eq('id', employer.company_id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ message: 'Company profile updated successfully.', company: data }, { status: 200 });

    } catch (error: any) {
        console.error('API PUT Error:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}