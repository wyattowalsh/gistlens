# Architecture Guidelines

## 🏗️ System Overview

GistLens is a **Next.js 15 full-stack application** with:
- **Frontend**: React 19 with Server Components
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (Vercel Postgres)
- **Authentication**: Auth.js (NextAuth.js v5) with GitHub OAuth
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm with workspaces

## 📐 Architecture Patterns

### 1. Server-First Architecture

**Philosophy**: Render on the server by default, use client components only when necessary.

**Server Components (default):**
```typescript
// app/gists/[id]/page.tsx
import { auth } from '@/lib/auth';
import { getGist } from '@/lib/db';

export default async function GistPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const gist = await getGist(params.id, session?.accessToken);
  
  return <GistViewer gist={gist} />;
}
```

**Client Components (interactive):**
```typescript
'use client';

import { useState } from 'react';

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return <button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</button>;
}
```

### 2. Data Flow Pattern

```
User Request
    ↓
Server Component (fetch data)
    ↓
Client Component (interactivity)
    ↓
API Route (mutations)
    ↓
Database / External API
    ↓
Response
```

### 3. API Route Design

**RESTful conventions:**
- `GET /api/github/gists` - List gists
- `GET /api/github/gist/[id]` - Get single gist
- `POST /api/github/gists` - Create gist
- `PATCH /api/github/gist/[id]` - Update gist
- `DELETE /api/github/gist/[id]` - Delete gist

**Pattern:**
```typescript
// app/api/github/gist/[id]/route.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const gistId = params.id;
    
    // Fetch from GitHub API
    const response = await fetch(
      `https://api.github.com/gists/${gistId}`,
      {
        headers: session?.accessToken
          ? { 'Authorization': `Bearer ${session.accessToken}` }
          : {},
      }
    );
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Gist not found' },
        { status: 404 }
      );
    }
    
    const gist = await response.json();
    return NextResponse.json(gist);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const body = await request.json();
  // Validate body...
  // Update gist...
}
```

## 🗂️ Directory Structure

```
gistlens/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/   # Auth.js endpoints
│   │   └── github/               # GitHub API proxies
│   ├── gists/                    # Gist pages
│   │   └── [id]/page.tsx         # Individual gist page
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── gist-viewer.tsx           # Gist display component
│   ├── code-block.tsx            # Syntax highlighting
│   └── ...
│
├── lib/                          # Utilities and services
│   ├── auth/                     # Authentication
│   │   ├── config.ts             # Auth.js configuration
│   │   └── index.ts              # Auth exports
│   ├── db/                       # Database
│   │   ├── schema.sql            # PostgreSQL schema
│   │   └── index.ts              # Database operations
│   ├── utils.ts                  # General utilities
│   └── ...
│
├── types/                        # TypeScript type definitions
│   ├── next-auth.d.ts            # Auth.js type extensions
│   └── index.ts                  # Custom types
│
├── public/                       # Static assets
│   ├── images/
│   └── icons/
│
├── docs/                         # Documentation site
│   └── (separate Next.js app)
│
└── src/                          # ⚠️ LEGACY CODE - Do not use!
    └── (old Vite/React code)     # Kept for reference only
```

## 🔄 Data Fetching Patterns

### Server Component Data Fetching

```typescript
// Direct fetch in Server Component
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
  
  return <Display data={data} />;
}
```

### Client Component Data Fetching

```typescript
'use client';

import { useEffect, useState } from 'react';

export function ClientData() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return <div>{data}</div>;
}
```

### Mutations via API Routes

```typescript
'use client';

async function createGist(formData: FormData) {
  const response = await fetch('/api/github/gists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: formData.get('description'),
      files: {
        'file.txt': {
          content: formData.get('content'),
        },
      },
      public: true,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create gist');
  }
  
  return response.json();
}
```

## 🎨 Component Composition

### Atomic Design Principles

**Atoms** (`components/ui/`):
- button.tsx
- input.tsx
- label.tsx

**Molecules** (`components/`):
- code-block.tsx (syntax highlighting)
- gist-file-tab.tsx (file tab with icon)

**Organisms** (`components/`):
- gist-viewer.tsx (complete gist display)
- gist-list.tsx (list of gists)

**Templates/Pages** (`app/`):
- app/page.tsx (homepage)
- app/gists/[id]/page.tsx (gist detail)

## 🔌 External Integrations

### GitHub API

**Unauthenticated:**
- Rate limit: 60 requests/hour per IP
- Public gists only

**Authenticated:**
- Rate limit: 5,000 requests/hour
- Private gists accessible
- CRUD operations available

**Best Practice**: Always proxy through API routes
```typescript
// ❌ Don't fetch directly from client
fetch('https://api.github.com/gists/123', {
  headers: { 'Authorization': `Bearer ${token}` }, // Exposes token!
});

// ✅ Use API route
fetch('/api/github/gist/123'); // Token added server-side
```

### PostHog (Optional Telemetry)

```typescript
'use client';

import posthog from 'posthog-js';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        opt_out_capturing_by_default: true, // Privacy-first
      });
    }
  }, []);
  
  return children;
}
```

## 📦 State Management

**Server State**: React Server Components (default)
**Client State**: React hooks (useState, useReducer)
**URL State**: Next.js searchParams and router
**Global Client State**: React Context (if needed)

```typescript
// URL state for filters
export default function GistsPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const filter = searchParams.filter || 'all';
  // Use filter...
}
```

## 🚀 Performance Optimization

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/avatar.png"
  alt="User avatar"
  width={40}
  height={40}
  className="rounded-full"
/>
```

### Code Splitting

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

### Streaming

```typescript
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SlowComponent />
    </Suspense>
  );
}
```

## 🧪 Testing Strategy

- **Unit Tests**: lib/ utilities
- **Integration Tests**: API routes
- **E2E Tests**: Critical user flows
- **Manual Testing**: UI/UX validation

See `agents/testing.md` for detailed testing guidelines.

## 📚 Architecture Decision Records

Key decisions:
1. **Why Next.js 15?** - Server Components, App Router, built-in API routes
2. **Why PostgreSQL?** - Structured data, ACID compliance, Vercel integration
3. **Why Auth.js?** - Industry standard, secure, well-maintained
4. **Why pnpm?** - Faster, stricter, workspace support

## 🔄 Migration Path (v1 → v2)

1. Database setup (PostgreSQL)
2. Auth.js configuration
3. API routes for GitHub operations
4. Port UI components from src/ to components/
5. Update state management
6. Add telemetry (opt-in)
7. Deploy to Vercel

See `docs/content/migration.mdx` for complete migration guide.
