import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: { json: () => PromiseLike<{ email: any; password: any; fullName: any; }> | { email: any; password: any; fullName: any; }; }) {
  try {
    // 1. Parse the request body
    const { email, password, fullName } = await request.json();

    // 2. Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // 3. Register with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          // Store additional user data in metadata
          full_name: fullName, 
        },
      },
    });

    // 4. Handle Supabase errors (e.g., user already exists, weak password)
    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    // 5. Return success
    return NextResponse.json(
      { 
        message: "Account created successfully. Please check your email for verification.", 
        user: data.user 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Signup API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}