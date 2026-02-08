"use client";

import { getJwtToken } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ToolInvocation {
  tool_name: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

export interface ChatResponse {
  message: string;
  tools_invoked: ToolInvocation[];
  conversation_id?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  tool_calls?: ToolInvocation[];
  timestamp?: Date;
}

export interface StreamChunk {
  type: "tool_invocation" | "content" | "done";
  data: unknown;
}

export async function sendChatMessage(
  userId: string,
  message: string,
  stream: boolean = false
): Promise<ChatResponse> {
  const token = await getJwtToken();

  if (!token) {
    throw new Error("Not authenticated - please log in");
  }

  const response = await fetch(`${API_BASE_URL}/api/${userId}/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, stream }),
  });

  if (response.status === 401) {
    throw new Error("Session expired - please log in again");
  }

  if (response.status === 403) {
    throw new Error("You don't have permission to access this resource");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function* streamChatMessage(
  userId: string,
  message: string
): AsyncGenerator<StreamChunk> {
  const token = await getJwtToken();

  if (!token) {
    throw new Error("Not authenticated - please log in");
  }

  const response = await fetch(`${API_BASE_URL}/api/${userId}/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, stream: true }),
  });

  if (response.status === 401) {
    throw new Error("Session expired - please log in again");
  }

  if (response.status === 403) {
    throw new Error("You don't have permission to access this resource");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Failed to get response reader");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data === "[DONE]") {
          return;
        }
        try {
          yield JSON.parse(data) as StreamChunk;
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }
}
