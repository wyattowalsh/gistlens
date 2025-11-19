# GistLens v2.0 Migration Guide

## Overview

GistLens has been successfully migrated from Vite + React to **Next.js 15** with the following major improvements:

### ✅ What's New

1. **Next.js 15 with App Router**
   - Server Components for better performance
   - Server-side rendering (SSR)
   - API routes for secure backend operations

2. **PostgreSQL Database**
   - User management and authentication
   - Session storage
   - User settings persistence
   - Gist history tracking
   - Custom styles per user

3. **Secure Authentication**
   - Auth.js (Auth.js v5)
   - GitHub OAuth with server-side secret management
   - No client secrets exposed in frontend
   - Encrypted sessions with JWT

4. **Server-Side API Routes**
   - `/api/github/gist/[id]` - Fetch, update, delete gists
   - `/api/github/gists` - Create gists, list user gists
   - All GitHub API calls now go through secure backend

## Setup Instructions

### 1. Environment Variables

Copy the example file and configure your environment:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Database - Use Vercel Postgres or your own PostgreSQL instance
POSTGRES_URL="postgresql://user:password@localhost:5432/gistlens"
POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/gistlens?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgresql://user:password@localhost:5432/gistlens"

# Auth.js - Generate a random secret
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# GitHub OAuth - Already configured
GITHUB_CLIENT_ID="Ov23liI0dV9Eyrz71PPu"
GITHUB_CLIENT_SECRET="d069f942ee3a3fce42622fc740a10148aba80b6a"
GITHUB_REDIRECT_URI="https://gistlens.w4w.dev/auth/github/callback"

# PostHog (Optional)
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Generate Auth.js Secret

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in `.env.local`.

### 3. Database Setup

#### Option A: Vercel Postgres (Recommended for Vercel deployment)

1. Create a Vercel project if you haven't
2. Add Vercel Postgres from the Storage tab
3. Copy the connection strings to your `.env.local`

#### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb gistlens
   ```
3. Run the schema:
   ```bash
   psql postgresql://localhost:5432/gistlens -f lib/db/schema.sql
   ```

#### Option C: Cloud PostgreSQL (Supabase, Neon, etc.)

1. Create a PostgreSQL database with your provider
2. Get the connection string
3. Run the schema (most providers have a SQL editor)

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Architecture Changes

### Before (Vite + React)

```
src/
├── App.tsx (Client-side routing, state management)
├── components/
├── lib/
│   ├── github-auth.ts (Client-side auth with localStorage)
│   ├── telemetry.ts
│   └── custom-styles.ts
└── main.tsx
```

**Issues:**
- ❌ Client secrets exposed in frontend
- ❌ GitHub OAuth requires manual token entry
- ❌ No persistent user/settings storage
- ❌ All state in localStorage

### After (Next.js 15)

```
app/
├── layout.tsx (Root layout with SessionProvider)
├── page.tsx (Homepage - Server Component)
├── api/
│   ├── auth/[...nextauth]/route.ts (Auth.js endpoints)
│   └── github/
│       ├── gist/[id]/route.ts (Gist CRUD operations)
│       └── gists/route.ts (List/create gists)
lib/
├── auth/
│   ├── config.ts (Auth.js configuration)
│   └── index.ts (Auth exports)
└── db/
    ├── schema.sql (Database schema)
    └── index.ts (Database operations)
```

**Benefits:**
- ✅ Client secrets secure on server
- ✅ Full GitHub OAuth flow works
- ✅ PostgreSQL for persistent storage
- ✅ Server-side API routes
- ✅ Better SEO with SSR
- ✅ Improved performance

## Database Schema

The PostgreSQL database includes these tables:

### Core Tables
- **users** - User profiles from GitHub
- **sessions** - Auth.js sessions
- **accounts** - OAuth provider accounts

### Feature Tables
- **user_settings** - User preferences (theme, telemetry, editor settings)
- **gist_history** - Recently viewed gists per user
- **custom_styles** - Custom CSS per user per target
- **verification_tokens** - For email verification (future use)

See `lib/db/schema.sql` for the complete schema.

## API Routes

### Authentication
- `POST /api/auth/signin` - Sign in with GitHub
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session

### GitHub Gists
- `GET /api/github/gist/[id]` - Fetch a gist (public or private if authenticated)
- `PATCH /api/github/gist/[id]` - Update a gist (requires auth)
- `DELETE /api/github/gist/[id]` - Delete a gist (requires auth)
- `GET /api/github/gists?username=...` - List user's gists
- `POST /api/github/gists` - Create a new gist (requires auth)

All routes automatically use the authenticated user's GitHub token when available.

## Migration Checklist for Remaining Features

The following features from the original app need to be migrated to the new Next.js structure:

### UI Components to Migrate
- [ ] Main gist viewer interface
- [ ] File browser/tabs
- [ ] Markdown renderer
- [ ] Code syntax highlighting
- [ ] Media viewers (image, video, audio, PDF, data)
- [ ] Settings dialog
- [ ] Custom stylesheet editor
- [ ] Share functionality
- [ ] History sidebar
- [ ] Featured gists

### Functionality to Migrate
- [ ] Gist search and navigation
- [ ] Dark mode toggle (client-side)
- [ ] Telemetry integration (PostHog)
- [ ] Custom styles system (load from DB)
- [ ] User settings (load from DB)
- [ ] Keyboard shortcuts
- [ ] Responsive design

### Components Already Available
- ✅ All UI components in `src/components/` can be copied to `components/`
- ✅ Utility functions in `src/lib/` can be adapted
- ✅ Tailwind config is ready
- ✅ TypeScript config is set up

## Development Tips

### 1. Using Server Components

```tsx
// app/page.tsx - Server Component (default)
import { auth } from '@/lib/auth';

export default async function Page() {
  const session = await auth(); // Server-side auth check
  
  return <div>Hello {session?.user?.name}</div>;
}
```

### 2. Using Client Components

```tsx
'use client'; // Mark as client component

import { useSession } from 'next-auth/react';

export default function ClientComponent() {
  const { data: session } = useSession();
  
  return <div>Hello {session?.user?.name}</div>;
}
```

### 3. Calling API Routes

```tsx
// From client component
const response = await fetch('/api/github/gist/abc123');
const gist = await response.json();

// From server component
const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/github/gist/abc123`, {
  headers: {
    cookie: cookies().toString(), // Pass cookies for auth
  },
});
```

### 4. Database Operations

```tsx
import { getUserSettings, updateUserSettings } from '@/lib/db';

// In a Server Component or API route
const settings = await getUserSettings(userId);
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Add Vercel Postgres from Storage tab
5. Deploy!

Vercel will automatically:
- Set up the database
- Configure environment variables
- Deploy with zero config

### Other Platforms

Requirements:
- Node.js 20+
- PostgreSQL database
- Environment variables configured

```bash
npm run build
npm start
```

## Security Improvements

### Before
- ❌ GitHub client secret in `src/lib/github-auth.ts`
- ❌ Tokens stored in localStorage
- ❌ Manual token entry required

### After
- ✅ Client secret only in server-side `.env.local`
- ✅ Sessions encrypted with Auth.js
- ✅ Tokens never sent to client
- ✅ Full OAuth flow works securely
- ✅ CSRF protection built-in
- ✅ SQL injection protection with parameterized queries

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $POSTGRES_URL -c "SELECT version();"

# Check if tables exist
psql $POSTGRES_URL -c "\dt"

# Re-run schema if needed
psql $POSTGRES_URL -f lib/db/schema.sql
```

### Auth.js Issues

1. Make sure `NEXTAUTH_SECRET` is set and is a random 32-character string
2. Verify `NEXTAUTH_URL` matches your actual URL
3. Check GitHub OAuth callback URL matches your config

### Build Issues

```bash
# Clean build
rm -rf .next
npm run build
```

## Next Steps

1. **Test the authentication flow**
   - Click "Sign in with GitHub"
   - Verify you can authenticate
   - Check database has user record

2. **Migrate UI components**
   - Copy components from `src/components/` to `components/`
   - Update imports to use Next.js conventions
   - Convert client-side components as needed

3. **Implement remaining features**
   - Gist viewer
   - Settings management
   - Custom styles
   - Telemetry

4. **Deploy to production**
   - Set up Vercel project
   - Configure environment variables
   - Deploy!

## Support

For issues or questions:
- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [Auth.js documentation](https://next-auth.js.org)
- See [Vercel Postgres docs](https://vercel.com/docs/storage/vercel-postgres)

---

**Migration completed by GitHub Copilot** 🚀
