import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 1. Initialize Supabase with ANON KEY
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    // 2. Parse Body
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    console.log('Verifying OTP for:', email);

    // 3. Call the SQL Function (RPC)
    // This runs the logic we defined in SQL securely
    const { data: status, error: rpcError } = await supabase.rpc('verify_employer_otp', {
      email_input: email,
      otp_input: otp
    });

    if (rpcError) {
      console.error('Supabase RPC Error:', rpcError);
      return NextResponse.json({ error: 'Database Error' }, { status: 500 });
    }

    // 4. Handle the specific return values from SQL
    switch (status) {
      case 'SUCCESS':
        return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
      
      case 'INVALID_CODE':
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });

      case 'EXPIRED':
        return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });

      case 'USER_NOT_FOUND':
        return NextResponse.json({ error: 'User not found' }, { status: 404 });

      default:
        return NextResponse.json({ error: 'Unknown verification error' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}