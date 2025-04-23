import { NextResponse } from "next/server";
import { register } from "@/lib/directus";

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, address } =
      await request.json();

    if (!email || !password || !firstName || !lastName || !address) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const response = await register(
      email,
      password,
      firstName,
      lastName,
      address
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Failed to register user" },
      { status: 500 }
    );
  }
}
