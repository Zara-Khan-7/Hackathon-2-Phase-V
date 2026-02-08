import { createAuthClient } from "better-auth/react";

// Use relative URL so it works on any domain (localhost, Vercel, etc.)
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
});

export const { signIn, signUp, signOut, useSession } = authClient;

// Get JWT token for backend API calls
export const getJwtToken = async (): Promise<string | null> => {
  try {
    console.log("[Auth] Fetching JWT token from /api/token...");
    const response = await fetch("/api/token", {
      credentials: "include",
    });

    console.log("[Auth] Token endpoint response:", response.status);

    if (!response.ok) {
      console.log("[Auth] Token endpoint returned non-OK status");
      return null;
    }

    const data = await response.json();
    console.log("[Auth] Token received:", data.token ? `${data.token.substring(0, 20)}...` : "null");
    return data.token || null;
  } catch (err) {
    console.error("[Auth] Error fetching token:", err);
    return null;
  }
};
