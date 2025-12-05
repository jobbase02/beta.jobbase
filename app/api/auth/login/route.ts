// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cookieStore = await cookies();

    // 1. Create a Supabase client configured to handle cookies for you
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // Supabase automatically sets the correct cookies here
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    // 2. Sign in (This will trigger the cookie 'set' method above)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    // 3. Cookies are already set by Supabase, just return success
    return NextResponse.json(
      { message: "Login successful", user: data.user },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}