# Quickstart: Authentication & Frontend API Integration

**Feature**: 002-auth-frontend-integration
**Date**: 2026-01-09

## Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Neon PostgreSQL database (from Spec 1)
- FastAPI backend running (from Spec 1)

## Setup Steps

### 1. Create Next.js Project

```bash
# Create new Next.js app with App Router
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd frontend
```

### 2. Install Dependencies

```bash
# Better Auth and dependencies
pnpm add better-auth

# Database adapter for Better Auth
pnpm add @prisma/client prisma

# UI components (optional, for auth forms)
pnpm add @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

### 3. Configure Environment Variables

Create `.env.local` in the `frontend/` directory:

```env
# Better Auth Configuration
BETTER_AUTH_SECRET=your-256-bit-secret-here  # MUST match backend JWT_SECRET
BETTER_AUTH_URL=http://localhost:3000

# Database (same as backend - Better Auth needs user storage)
DATABASE_URL=postgresql://neondb_owner:password@host.neon.tech/neondb?sslmode=require

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**CRITICAL**: `BETTER_AUTH_SECRET` must be the same value as `JWT_SECRET` in the backend `.env` file!

### 4. Initialize Better Auth

Create `lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60, // Update session every hour
  },
});
```

### 5. Create Auth Route Handler

Create `app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### 6. Create Auth Client

Create `lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### 7. Create API Client

Create `lib/api-client.ts`:

```typescript
import { authClient } from "./auth-client";
import { redirect } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const session = await authClient.getSession();

  if (!session?.session) {
    redirect("/login");
  }

  const token = session.session.token; // JWT token

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options?.headers,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    redirect("/login?error=session_expired");
  }

  if (response.status === 403) {
    throw new Error("You don't have permission to access this resource");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "An error occurred");
  }

  return response.json();
}
```

### 8. Generate Prisma Schema

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Better Auth tables (auto-managed)
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id         String   @id @default(cuid())
  userId     String
  providerId String
  accountId  String
  password   String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
}
```

### 9. Run Prisma Migration

```bash
# Generate Prisma client
pnpm prisma generate

# Push schema to database
pnpm prisma db push
```

### 10. Run the Application

```bash
# Development mode
pnpm dev
```

## Verification Steps

### 1. Check Auth Routes

Visit http://localhost:3000/api/auth/ok - should return `{ "ok": true }`

### 2. Test Registration

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123",
    "name": "Test User"
  }'
```

### 3. Test Sign In

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

### 4. Test Backend Integration

After signing in, use the JWT token to call the FastAPI backend:

```bash
# Get token from session, then:
curl http://localhost:8000/api/tasks \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Project Structure

```
frontend/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts    # Better Auth handler
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   └── signup/
│   │       └── page.tsx        # Signup page
│   ├── (protected)/
│   │   └── dashboard/
│   │       └── page.tsx        # Protected dashboard
│   ├── layout.tsx
│   └── page.tsx                # Landing page
├── components/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── signup-form.tsx
│   └── ui/                     # Shared UI components
├── lib/
│   ├── auth.ts                 # Better Auth server config
│   ├── auth-client.ts          # Client-side auth utilities
│   └── api-client.ts           # Authenticated fetch wrapper
├── prisma/
│   └── schema.prisma           # Database schema
├── .env.local                  # Environment variables (not committed)
└── package.json
```

## Common Issues

### 1. JWT Secret Mismatch

**Error**: "Invalid token" on backend API calls

**Solution**: Ensure `BETTER_AUTH_SECRET` in frontend matches `JWT_SECRET` in backend exactly.

### 2. CORS Errors

**Error**: "Access-Control-Allow-Origin" errors in browser

**Solution**: Add `http://localhost:3000` to `CORS_ORIGINS` in backend `.env`.

### 3. Database Connection Failed

**Error**: "P1001: Can't reach database server"

**Solution**: Check `DATABASE_URL` in `.env.local`. Ensure Neon database is active and `sslmode=require` is included.

### 4. Session Not Persisting

**Error**: User logged out after page refresh

**Solution**: Check that Better Auth cookies are being set. Verify `BETTER_AUTH_URL` matches the actual application URL.

## Next Steps

After completing this quickstart:

1. Implement login and signup pages (Phase 3 tasks)
2. Create protected route middleware
3. Build task management UI (Spec 3)
4. Deploy to production with proper secrets
