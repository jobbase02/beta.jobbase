import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // <--- 1. IMPORT COOKIES
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Clean inputs
    const email = (body.email || '').trim();
    const password = (body.password || '').trim();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Get user via RPC
    const { data: userJson, error } = await supabase
      .rpc('get_employer_for_login', { 
        email_input: email 
      });

    if (error || !userJson) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = userJson as any; 

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check Status
    if (!user.is_email_verified) {
      return NextResponse.json({ error: 'Please verify your email address first.' }, { status: 403 });
    }

    if (!user.is_approved) {
      return NextResponse.json({ error: 'Your account is pending approval by our team.' }, { status: 403 });
    }

    // --- NEW SESSION LOGIC STARTS HERE ---
    
    // 1. Create a lightweight session object
    const sessionPayload = JSON.stringify({
        id: user.id,
        email: user.email,
        company: user.company_name, // useful for dashboard
        role: 'employer'
    });

    // 2. Set the Secure HTTP-Only Cookie
    // This allows the "session" to persist even if the user refreshes
    (await
          // 2. Set the Secure HTTP-Only Cookie
          // This allows the "session" to persist even if the user refreshes
          cookies()).set({
        name: 'employer_session',
        value: sessionPayload,
        httpOnly: true, // Frontend JS cannot read this (Security against XSS)
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 Days
        sameSite: 'strict',
    });

    // --- NEW SESSION LOGIC ENDS HERE ---

    // Remove sensitive data before sending back
    const { password_hash, secret_code, otp_expires_at, ...safeUser } = user;
    
    return NextResponse.json({ 
      message: 'Login successful', 
      user: safeUser 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}