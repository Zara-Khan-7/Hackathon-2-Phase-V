"use client";

import { getJwtToken } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiClientOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getToken(): Promise<string | null> {
  // Use Better Auth JWT plugin to get a proper JWT token
  return await getJwtToken();
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { token: providedToken, ...fetchOptions } = options;

  // Get token from session if not provided
  const token = providedToken || await getToken();

  if (!token) {
    // Don't redirect - let the calling code handle the error
    // This prevents redirect loops
    throw new ApiError("Not authenticated - please log in", 401);
  }

  let response: Response;
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  try {
    console.log(`[API] Fetching: ${fullUrl}`);
    console.log(`[API] Token present: ${!!token}, length: ${token?.length || 0}`);
    response = await fetch(fullUrl, {
      ...fetchOptions,
      mode: "cors",
      credentials: "omit", // Don't send cookies to backend - we use JWT
      headers: {
        ...fetchOptions.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log(`[API] Response status: ${response.status}`);
  } catch (networkError) {
    // Network error - server not reachable
    const errorMsg = networkError instanceof Error ? networkError.message : String(networkError);
    console.error("[API] Network error details:", errorMsg);
    console.error("[API] Full error:", networkError);

    // Check if it's a CORS error or network error
    if (errorMsg.includes("CORS") || errorMsg.includes("blocked")) {
      throw new ApiError(
        `CORS error connecting to ${API_BASE_URL}. Check backend CORS configuration.`,
        0
      );
    }
    throw new ApiError(
      `Cannot connect to server at ${API_BASE_URL}. Error: ${errorMsg}`,
      0
    );
  }

  // Handle 401 - Unauthorized
  if (response.status === 401) {
    // Don't redirect - throw error and let component handle it
    throw new ApiError("Session expired - please log in again", 401);
  }

  // Handle 403 - Forbidden
  if (response.status === 403) {
    throw new ApiError("You don't have permission to access this resource", 403);
  }

  // Handle other errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.detail || `Request failed with status ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
