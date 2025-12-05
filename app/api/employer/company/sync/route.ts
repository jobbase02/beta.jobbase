import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// --- Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Using Anon Key as requested.
// NOTE: This works because you have configured RLS policies to allow
// the 'anon' role to select/update these tables.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Using GET so it's easy to trigger from a browser or simple Cron service
export async function GET(request: Request) {
    try {
        console.log("🔄 Starting Company Name Sync (Anon Mode)...");

        // 1. Fetch all employers who are linked to a company
        // We select the employer's current text name, and the LINKED company's actual name
        const { data: records, error } = await supabase
            .from('employers')
            .select(`
                id,
                company_name,
                company_id,
                companies!inner (
                    id,
                    name
                )
            `)
            .not('company_id', 'is', null); // Only check linked accounts

        if (error) {
            console.error("Supabase Fetch Error:", error);
            throw error;
        }

        if (!records || records.length === 0) {
            return NextResponse.json({ message: 'No records to check.' }, { status: 200 });
        }

        // 2. Identify Mismatches
        // We look for rows where employer.company_name != companies.name
        const updatesNeeded = records.filter((record: any) => {
            const employerName = record.company_name; // Name in Employer Table
            const actualCompanyName = record.companies?.name; // Name in Company Table

            // Return true if they are different (and company name exists)
            return actualCompanyName && employerName !== actualCompanyName;
        });

        if (updatesNeeded.length === 0) {
            console.log("✅ All names are in sync.");
            return NextResponse.json({ message: 'Sync complete. No discrepancies found.', updated_count: 0 }, { status: 200 });
        }

        console.log(`⚠️ Found ${updatesNeeded.length} records out of sync. Fixing now...`);

        // 3. Fix Mismatches (Batch Update)
        // We loop through the mismatches and update the employers table
        const updatePromises = updatesNeeded.map((record: any) => {
            const correctName = record.companies.name;
            
            return supabase
                .from('employers')
                .update({ 
                    company_name: correctName,
                    updated_at: new Date().toISOString()
                })
                .eq('id', record.id);
        });

        // Execute all updates in parallel
        await Promise.all(updatePromises);

        console.log(`✅ Successfully updated ${updatesNeeded.length} records.`);

        return NextResponse.json({ 
            success: true, 
            message: `Sync successful. Updated ${updatesNeeded.length} employer records to match their company profiles.`,
            updated_count: updatesNeeded.length,
            details: updatesNeeded.map((r: any) => ({
                employer_id: r.id,
                old_name: r.company_name,
                new_name: r.companies.name
            }))
        }, { status: 200 });

    } catch (error: any) {
        console.error("❌ Sync failed:", error);
        return NextResponse.json({ message: 'Sync failed', error: error.message }, { status: 500 });
    }
}