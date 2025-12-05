import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize with ANON KEY
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    // 1. Env Check
    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json({ error: 'Server Config Error: Missing SendGrid Key' }, { status: 500 });
    }

    // 2. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 3. Call the SQL Function (RPC)
    // This allows us to insert the row even with the ANON Key
    const { error: dbError } = await supabase.rpc('request_employer_otp', {
      email_input: email,
      otp_code: otp,
      expires_at: expiresAt
    });

    if (dbError) {
      console.error('Supabase RPC Error:', dbError);
      return NextResponse.json({ error: 'Database Error: ' + dbError.message }, { status: 500 });
    }

    // 4. Send Email
    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: 'mail@support.jobbase.in', name: 'Job Portal Auth' }, // Replace with your verified sender
        subject: 'Your Verification Code',
        content: [{ type: 'text/plain', value: `Your code is: ${otp}` }]
      })
    });

    if (!sgResponse.ok) {
      console.error('SendGrid Error:', await sgResponse.text());
      return NextResponse.json({ error: 'Failed to send email' }, { status: 502 });
    }

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}