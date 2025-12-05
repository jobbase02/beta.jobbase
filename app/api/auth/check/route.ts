import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  // 1. Supabase Client Create karo Server side ke liye
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
            // Read-only check mein iski need nahi hoti, but structure ke liye zaruri hai
        },
        remove(name: string, options: any) {
            // Read-only check mein iski need nahi hoti
        },
      },
    }
  );

  // 2. User verify karo (Secure tarike se)
  // 'getUser' database hit karta hai to verify user exists and token is valid
  const { data: { user }, error } = await supabase.auth.getUser();

  // 3. Response Logic
  if (user && !error) {
    return NextResponse.json(
      { 
        isLoggedIn: true, 
        user: user 
      },
      { status: 200 }
    );
  }

  // Agar user nahi hai ya error hai
  return NextResponse.json(
    { 
      isLoggedIn: false, 
      user: null 
    },
    { status: 200 } // Hum 200 hi bhej rahe hain taaki frontend error throw na kare, bas false read kare
  );
}