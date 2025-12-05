import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Helper function to perform the logout logic
async function performLogout() {
  (await cookies()).set({
    name: 'employer_session',
    value: '',
    expires: new Date(0), // Set expiration date to the past
    path: '/', // Must match the path used when setting the cookie
  });
}

export async function POST() {
  await performLogout();

  // Return a response confirming success
  return NextResponse.json(
    { 
      success: true,
      message: 'Logout successful' 
    }, 
    { status: 200 }
  );
}

// Add GET handler to fix "HTTP ERROR 405" when accessing via browser/link
export async function GET(request: Request) {
  await performLogout();
  // Redirect to the login page immediately
  return NextResponse.redirect(new URL('/auth/employer', request.url));
}