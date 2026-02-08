# Todo App Frontend

A Next.js 16+ frontend with Better Auth authentication for the Todo Full-Stack Web Application.

## Prerequisites

- Node.js 18+
- npm
- Backend API running (see `../backend/README.md`)
- Neon PostgreSQL database

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.local.example` to `.env.local` and update:
   ```env
   BETTER_AUTH_SECRET=your-secret   # Must match JWT_SECRET in backend
   BETTER_AUTH_URL=http://localhost:3000
   DATABASE_URL=your-neon-connection-string
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Initialize database**
   ```bash
   npx dotenv -e .env.local -- npx prisma generate
   npx dotenv -e .env.local -- npx prisma db push
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open** http://localhost:3000

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Auth pages (login, signup)
│   │   ├── (protected)/      # Protected pages (dashboard)
│   │   ├── api/auth/         # Better Auth API routes
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── auth/             # Auth components
│   │   └── ui/               # UI components
│   ├── lib/
│   │   ├── auth.ts           # Better Auth server config
│   │   ├── auth-client.ts    # Client-side auth utilities
│   │   ├── api-client.ts     # Authenticated API wrapper
│   │   └── api/tasks.ts      # Task API methods
│   └── middleware.ts         # Route protection
├── prisma/
│   └── schema.prisma         # Better Auth database schema
└── .env.local                # Environment variables
```

## Features

- User registration and login
- Session persistence (24h)
- Protected routes
- Authenticated API communication with backend
- Automatic session expiration handling

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_SECRET` | JWT signing secret (must match backend `JWT_SECRET`) |
| `BETTER_AUTH_URL` | Frontend base URL |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXT_PUBLIC_API_URL` | Backend API URL |

## For More Details

See the full quickstart guide at `../specs/002-auth-frontend-integration/quickstart.md`
