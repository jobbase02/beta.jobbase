import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, company_name, position } = body;

    // --- FIX STARTS HERE ---
    // 1. Force password to be a string and remove leading/trailing spaces
    // This prevents "123456 " (with space) from breaking the login later
    const password = String(body.password || '').trim();

    // 2. Validation
    if (!email || !password || !name || !company_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (password.length < 6) {
       return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // 3. Temporary Debug Log (Check your VS Code terminal when you sign up)
    // Remove this before going live!
    console.log(`🔐 Hashing password: "${password}"`); 
    // --- FIX ENDS HERE ---

    console.log('Completing signup for:', email);

    // 4. Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. Call the SQL Function
    const { data: status, error: rpcError } = await supabase.rpc('complete_employer_signup', {
      email_input: email,
      password_hash_input: passwordHash,
      name_input: name,
      company_name_input: company_name,
      position_input: position || '' 
    });

    if (rpcError) {
      console.error('Supabase RPC Error:', rpcError);
      return NextResponse.json({ error: 'Database Error' }, { status: 500 });
    }

    if (status === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'User not found. Please restart signup.' }, { status: 404 });
    }

    if (status === 'NOT_VERIFIED') {
      return NextResponse.json({ error: 'Email must be verified first.' }, { status: 403 });
    }

    return NextResponse.json({ message: 'Account created, pending approval' }, { status: 200 });

  } catch (error: any) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}