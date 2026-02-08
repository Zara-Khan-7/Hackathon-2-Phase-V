import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import * as jose from "jose";

// Force dynamic rendering - don't try to build at compile time
export const dynamic = "force-dynamic";

// Secret must match backend JWT_SECRET
const JWT_SECRET = process.env.BETTER_AUTH_SECRET || "test-secret-key-for-development-only";

export async function GET() {
  try {
    // Get current session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Create JWT token for backend API
    const secret = new TextEncoder().encode(JWT_SECRET);

    const token = await new jose.SignJWT({
      sub: session.user.id,
      email: session.user.email,
      name: session.user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
