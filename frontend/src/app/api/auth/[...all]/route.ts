import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Force dynamic rendering - don't try to build at compile time
export const dynamic = "force-dynamic";

export const { GET, POST } = toNextJsHandler(auth);
