# AI Agent Instructions for GistLens

This document provides comprehensive instructions for AI coding agents (GitHub Copilot, Cursor, Claude, etc.) working on the GistLens project.

## 🚨 CRITICAL: Security Notice

⚠️ **The `src/` directory contains OLD client-side code from the Vite/React version and should NOT be used as a reference for new code.**

- This directory exists only for reference during migration
- It is excluded from the Next.js build
- **DO NOT copy patterns from `src/` - use the new Next.js patterns in `app/`, `components/`, and `lib/` instead**
- Security issues in old code (like exposed secrets) do NOT affect the new Next.js version

## 📚 Specialized Agent Guides

For detailed guidance on specific topics, see the **`agents/`** directory:

- **[agents/security.md](agents/security.md)** - Security best practices, secret management, validation patterns
- **[agents/architecture.md](agents/architecture.md)** - System architecture, design patterns, data flow
- **[agents/frontend.md](agents/frontend.md)** - React/Next.js patterns, styling, components
- **[agents/README.md](agents/README.md)** - Overview of all specialized guides

**This document provides a quick-start overview. For deep dives, consult the specialized guides.**

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Development Environment](#development-environment)
- [Code Standards](#code-standards)
- [Common Tasks](#common-tasks)
- [Testing Guidelines](#testing-guidelines)
- [Security Best Practices](#security-best-practices)
- [Documentation Standards](#documentation-standards)
- [Agent-Specific Guidelines](#agent-specific-guidelines)

## Project Overview

**GistLens** is a Next.js 15 application for viewing and managing GitHub Gists with rich media support, syntax highlighting, and private gist access through GitHub OAuth.

### Technology Stack

- **Framework**: Next.js 15.1.6+ (App Router)
- **Runtime**: React 19.0.0
- **Language**: TypeScript 5.9.3+ (strict mode)
- **Database**: PostgreSQL (Vercel Postgres)
- **Authentication**: Auth.js (NextAuth.js v5)
- **Styling**: Tailwind CSS 3.4+ with custom design system
- **Package Manager**: pnpm 10.22.0+
- **Deployment**: Vercel (primary), supports Railway, Render, etc.

### Project Structure

```
gistlens/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── auth/             # Auth.js endpoints
│   │   └── github/           # GitHub API proxies
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage
├── components/               # React components
│   └── ui/                   # Shadcn UI components
├── lib/                      # Utilities and services
│   ├── auth/                 # Auth.js configuration
│   ├── db/                   # Database operations
│   └── *.ts                  # Utility modules
├── docs/                     # Documentation site (separate Next.js app)
│   ├── app/                  # Docs pages
│   └── content/              # MDX content files
├── types/                    # TypeScript type definitions
├── public/                   # Static assets
└── .github/                  # GitHub configuration
    ├── workflows/            # CI/CD workflows
    ├── ISSUE_TEMPLATE/       # Issue templates
    └── AGENTS.md             # This file
```

## Architecture

### Design Patterns

- **Server Components First**: Use React Server Components by default
- **Client Components**: Only for interactivity (mark with `'use client'`)
- **API Routes**: Server-side only, never expose secrets
- **Database Access**: Only in Server Components or API Routes
- **Type Safety**: Strict TypeScript everywhere

### Data Flow

1. **Authentication**: Auth.js handles GitHub OAuth → creates user in DB
2. **API Requests**: Client → API Route → GitHub API (with auth token)
3. **Database**: Server Components → Database operations → PostgreSQL
4. **State Management**: React hooks for client state, server components for data fetching

## Development Environment

### Prerequisites

```bash
# Required versions
node >= 20.0.0
pnpm >= 10.0.0
postgresql >= 14.0
```

### Setup Commands

```bash
# Clone and install
git clone https://github.com/wyattowalsh/gistlens.git
cd gistlens
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
psql $POSTGRES_URL -f lib/db/schema.sql

# Run development server
pnpm dev        # Main app on :3000
pnpm docs:dev   # Docs on :3001
```

### Environment Variables

**Required:**
- `POSTGRES_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Auth.js secret (generate with `openssl rand -base64 32`)
- `GITHUB_CLIENT_ID` - GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth app client secret

**Optional:**
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog analytics key
- `NEXT_PUBLIC_APP_URL` - Public app URL

## Code Standards

### TypeScript

```typescript
// ✅ DO: Use strict types
interface GistFile {
  filename: string;
  content: string;
  language: string | null;
  size: number;
}

// ✅ DO: Export types for reuse
export type { GistFile };

// ❌ DON'T: Use 'any'
function processData(data: any) { } // Bad

// ✅ DO: Use proper types
function processData(data: GistFile[]) { } // Good

// ✅ DO: Use type inference when obvious
const count = 42; // Type inferred as number

// ✅ DO: Explicit return types for functions
function fetchGist(id: string): Promise<Gist> {
  // ...
}
```

### React Components

```typescript
// ✅ DO: Server Component (default)
export default async function GistPage({ params }: { params: { id: string } }) {
  const gist = await fetchGist(params.id);
  return <GistViewer gist={gist} />;
}

// ✅ DO: Client Component (when needed)
'use client';

export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ✅ DO: Use TypeScript interfaces for props
interface GistViewerProps {
  gist: Gist;
  showControls?: boolean;
}

export function GistViewer({ gist, showControls = true }: GistViewerProps) {
  // ...
}

// ❌ DON'T: Mix server and client logic
'use client';
import { db } from '@/lib/db'; // Bad - no DB access in client

// ✅ DO: Use API routes for data mutations
async function updateGist(id: string, data: Partial<Gist>) {
  const response = await fetch(`/api/github/gist/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### File Naming

- **Components**: PascalCase - `GistViewer.tsx`, `SettingsDialog.tsx`
- **Utilities**: camelCase - `formatDate.ts`, `fetchGist.ts`
- **API Routes**: kebab-case - `route.ts` in appropriate folder
- **Types**: PascalCase - `Gist.ts`, `User.ts`
- **Constants**: UPPER_SNAKE_CASE - `API_ENDPOINTS.ts`

### Import Order

```typescript
// 1. React/Next.js
import { useState } from 'react';
import Link from 'next/link';

// 2. External libraries
import { clsx } from 'clsx';
import { format } from 'date-fns';

// 3. Internal modules (absolute imports)
import { Button } from '@/components/ui/button';
import { fetchGist } from '@/lib/github';
import type { Gist } from '@/types/gist';

// 4. Relative imports
import { GistFile } from './GistFile';
import styles from './GistViewer.module.css';
```

### Styling

```typescript
// ✅ DO: Use Tailwind CSS utility classes
<div className="flex items-center gap-4 p-4 rounded-lg bg-background">
  <h2 className="text-2xl font-bold">Title</h2>
</div>

// ✅ DO: Use clsx for conditional classes
import { clsx } from 'clsx';

<button className={clsx(
  'px-4 py-2 rounded',
  isPrimary ? 'bg-primary text-primary-foreground' : 'bg-secondary',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>
  Button
</button>

// ✅ DO: Use CSS variables for theming
// Defined in app/globals.css
<div className="bg-[var(--background)] text-[var(--foreground)]">
  Content
</div>

// ❌ DON'T: Use inline styles (except for dynamic values)
<div style={{ padding: '1rem' }}> // Bad

// ✅ DO: Use Tailwind classes
<div className="p-4"> // Good
```

## Common Tasks

### Adding a New Page

```typescript
// app/gists/[id]/page.tsx
import { notFound } from 'next/navigation';
import { fetchGist } from '@/lib/github';
import { GistViewer } from '@/components/GistViewer';

export default async function GistPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const gist = await fetchGist(params.id);
  
  if (!gist) {
    notFound();
  }
  
  return (
    <main className="container mx-auto py-8">
      <GistViewer gist={gist} />
    </main>
  );
}

// Generate static params for static generation
export async function generateStaticParams() {
  // Return array of { id: string } objects
  return [];
}

// Add metadata
export async function generateMetadata({ params }: { params: { id: string } }) {
  const gist = await fetchGist(params.id);
  return {
    title: gist?.description || 'Gist',
    description: 'View this gist on GistLens',
  };
}
```

### Creating an API Route

```typescript
// app/api/github/gist/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Fetch gist
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const token = session?.accessToken;
    
    const response = await fetch(
      `https://api.github.com/gists/${params.id}`,
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
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
    console.error('Error fetching gist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gist' },
      { status: 500 }
    );
  }
}

// PATCH - Update gist (requires authentication)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    const response = await fetch(
      `https://api.github.com/gists/${params.id}`,
      {
        method: 'PATCH',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to update gist' },
        { status: response.status }
      );
    }
    
    const gist = await response.json();
    return NextResponse.json(gist);
  } catch (error) {
    console.error('Error updating gist:', error);
    return NextResponse.json(
      { error: 'Failed to update gist' },
      { status: 500 }
    );
  }
}
```

### Database Operations

```typescript
// lib/db/operations.ts
import { sql } from '@vercel/postgres';
import type { User, UserSettings } from '@/types/database';

export async function createUser(githubData: {
  githubId: string;
  username: string;
  email: string | null;
  avatarUrl: string | null;
}): Promise<User> {
  const { rows } = await sql`
    INSERT INTO users (github_id, username, email, avatar_url)
    VALUES (${githubData.githubId}, ${githubData.username}, ${githubData.email}, ${githubData.avatarUrl})
    ON CONFLICT (github_id) DO UPDATE
    SET username = EXCLUDED.username,
        email = EXCLUDED.email,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW()
    RETURNING *
  `;
  
  return rows[0] as User;
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { rows } = await sql`
    SELECT * FROM user_settings
    WHERE user_id = ${userId}
  `;
  
  return rows[0] as UserSettings || null;
}

export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<UserSettings> {
  const { rows } = await sql`
    INSERT INTO user_settings (user_id, theme, telemetry_enabled, font_size, show_line_numbers)
    VALUES (
      ${userId},
      ${settings.theme || 'dark'},
      ${settings.telemetryEnabled || false},
      ${settings.fontSize || 'medium'},
      ${settings.showLineNumbers !== false}
    )
    ON CONFLICT (user_id) DO UPDATE
    SET theme = COALESCE(${settings.theme}, user_settings.theme),
        telemetry_enabled = COALESCE(${settings.telemetryEnabled}, user_settings.telemetry_enabled),
        font_size = COALESCE(${settings.fontSize}, user_settings.font_size),
        show_line_numbers = COALESCE(${settings.showLineNumbers}, user_settings.show_line_numbers),
        updated_at = NOW()
    RETURNING *
  `;
  
  return rows[0] as UserSettings;
}
```

### Adding Authentication Check

```typescript
// Server Component
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  return <div>Protected content for {session.user?.name}</div>;
}

// Client Component
'use client';

import { useSession } from 'next-auth/react';
import { signIn, signOut } from 'next-auth/react';

export function AuthButton() {
  const { data: session } = useSession();
  
  if (session) {
    return (
      <div>
        Signed in as {session.user?.email}
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }
  
  return <button onClick={() => signIn('github')}>Sign in with GitHub</button>;
}
```

## Testing Guidelines

### Unit Tests (to be added)

```typescript
// __tests__/lib/formatDate.test.ts
import { formatDate } from '@/lib/formatDate';

describe('formatDate', () => {
  it('formats dates correctly', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    expect(formatDate(date)).toBe('Jan 15, 2024');
  });
  
  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('Unknown');
  });
});
```

### Integration Tests (to be added)

```typescript
// __tests__/api/gist.test.ts
import { GET } from '@/app/api/github/gist/[id]/route';

describe('/api/github/gist/[id]', () => {
  it('fetches public gist', async () => {
    const request = new Request('http://localhost:3000/api/github/gist/abc123');
    const response = await GET(request, { params: { id: 'abc123' } });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('id');
  });
  
  it('returns 404 for non-existent gist', async () => {
    const request = new Request('http://localhost:3000/api/github/gist/invalid');
    const response = await GET(request, { params: { id: 'invalid' } });
    
    expect(response.status).toBe(404);
  });
});
```

### Manual Testing

```bash
# Test main app
pnpm dev
# Visit http://localhost:3000
# Test: Navigation, gist viewing, authentication, settings

# Test docs site
pnpm docs:dev
# Visit http://localhost:3001
# Test: Navigation, content rendering, links

# Test build
pnpm build
pnpm start
# Verify production build works
```

## Security Best Practices

### Never Expose Secrets

```typescript
// ❌ DON'T: Expose secrets in client components
'use client';
const API_KEY = process.env.GITHUB_CLIENT_SECRET; // Bad!

// ✅ DO: Use secrets only in API routes or Server Components
// app/api/github/route.ts
const clientSecret = process.env.GITHUB_CLIENT_SECRET; // Good - server-side only
```

### Validate User Input

```typescript
// ✅ DO: Validate and sanitize input
function validateGistId(id: string): boolean {
  return /^[a-f0-9]{32}$/i.test(id);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!validateGistId(params.id)) {
    return NextResponse.json(
      { error: 'Invalid gist ID' },
      { status: 400 }
    );
  }
  // ...
}
```

### Use Parameterized Queries

```typescript
// ✅ DO: Use parameterized queries (prevents SQL injection)
await sql`
  SELECT * FROM users WHERE github_id = ${githubId}
`;

// ❌ DON'T: Concatenate user input
await sql.query(`SELECT * FROM users WHERE github_id = '${githubId}'`); // Bad!
```

### Handle Errors Safely

```typescript
// ✅ DO: Don't expose internal errors to users
try {
  await someOperation();
} catch (error) {
  console.error('Internal error:', error); // Log for debugging
  return NextResponse.json(
    { error: 'An error occurred' }, // Generic message for user
    { status: 500 }
  );
}
```

## Documentation Standards

### Code Comments

```typescript
/**
 * Fetches a gist from the GitHub API
 * 
 * @param id - The gist ID
 * @param token - Optional GitHub access token for private gists
 * @returns The gist data or null if not found
 * @throws Error if the API request fails
 */
export async function fetchGist(
  id: string,
  token?: string
): Promise<Gist | null> {
  // Implementation
}

// ✅ DO: Comment complex logic
// Calculate the optimal page size based on available viewport height
// and estimated item height (64px per item + 8px gap)
const itemsPerPage = Math.floor((viewportHeight - 200) / 72);

// ❌ DON'T: Comment obvious code
const count = 0; // Initialize count to zero

// ✅ DO: Use TODO comments with context
// TODO: Add caching to reduce API calls (GitHub rate limit: 60/hour unauthenticated)
```

### README Files

Each major component/feature should have a README:

```markdown
# Component Name

Brief description of what this component does.

## Usage

\`\`\`typescript
import { ComponentName } from '@/components/ComponentName';

<ComponentName prop1="value" prop2={42} />
\`\`\`

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| prop1 | string | Yes | - | Description |
| prop2 | number | No | 0 | Description |

## Examples

### Basic Usage

\`\`\`typescript
<ComponentName prop1="example" />
\`\`\`

### Advanced Usage

\`\`\`typescript
<ComponentName 
  prop1="example" 
  prop2={42}
  onAction={handleAction}
/>
\`\`\`
```

### Commit Messages

Follow conventional commits:

```bash
# Format: <type>(<scope>): <description>

feat(auth): add GitHub OAuth login
fix(api): handle rate limit errors gracefully
docs(readme): update setup instructions
style(ui): improve button hover states
refactor(db): optimize user query performance
test(api): add gist endpoint tests
chore(deps): update Next.js to 15.1.6
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Agent-Specific Guidelines

### When Creating New Features

1. **Read existing code** in similar components first
2. **Follow established patterns** (Server Components, API routes, etc.)
3. **Add TypeScript types** for all new interfaces
4. **Update documentation** if adding user-facing features
5. **Test thoroughly** before considering complete
6. **Check build** with `pnpm build` to catch errors

### When Fixing Bugs

1. **Understand the root cause** before making changes
2. **Check for similar issues** in other parts of the codebase
3. **Add tests** to prevent regression (if test infrastructure exists)
4. **Verify the fix** doesn't break other functionality
5. **Update comments** if the fix clarifies intent

### When Refactoring

1. **Make small, incremental changes** - easier to review and debug
2. **Maintain backward compatibility** unless explicitly breaking
3. **Update tests** to match new structure
4. **Run full build** to ensure no regressions
5. **Document breaking changes** in CHANGELOG.md

### Best Practices for AI Agents

1. **Ask for clarification** if requirements are ambiguous
2. **Suggest alternatives** if there's a better approach
3. **Highlight trade-offs** when making architectural decisions
4. **Warn about potential issues** (performance, security, etc.)
5. **Reference documentation** when explaining complex features
6. **Provide complete examples** that can be copied and used
7. **Test your suggestions** mentally or through static analysis
8. **Consider edge cases** and error handling
9. **Think about accessibility** and user experience
10. **Be consistent** with existing code style and patterns

## Common Pitfalls to Avoid

### ❌ Using Client Components Unnecessarily

```typescript
// Bad - makes entire component tree client-side
'use client';
export default function Page() {
  const data = await fetchData(); // This won't work in client components!
  return <div>{data}</div>;
}

// Good - keep Server Component for data fetching
export default async function Page() {
  const data = await fetchData();
  return <ClientComponent data={data} />;
}
```

### ❌ Exposing Secrets

```typescript
// Bad - NEVER do this
const secret = process.env.GITHUB_CLIENT_SECRET;
return <div data-secret={secret}>Content</div>;

// Good - secrets stay on server
// Use them only in API routes or server-side code
```

### ❌ Direct Database Access in Client Components

```typescript
// Bad
'use client';
import { sql } from '@vercel/postgres';

export function UserList() {
  const users = await sql`SELECT * FROM users`; // Won't work!
  // ...
}

// Good - use API route or Server Component
export async function UserList() {
  const users = await sql`SELECT * FROM users`; // Server Component
  return <UserListClient users={users} />;
}
```

### ❌ Ignoring TypeScript Errors

```typescript
// Bad
// @ts-ignore
const result = somethingUnsafe();

// Good - fix the type or use proper typing
const result: SomeType = somethingUnsafe() as SomeType;
// Or better: fix the root cause
```

### ❌ Not Handling Errors

```typescript
// Bad
const data = await fetch('/api/data').then(r => r.json());

// Good
try {
  const response = await fetch('/api/data');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  console.error('Failed to fetch data:', error);
  // Handle error appropriately
}
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Auth.js Documentation](https://authjs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [React Documentation](https://react.dev)
- [pnpm Documentation](https://pnpm.io)

## Questions?

If you're unsure about something:
1. Check this document first
2. Look at existing code for similar patterns
3. Check the main documentation in `/docs`
4. Review LOCAL_DEVELOPMENT.md for setup issues
5. Ask for clarification in a comment

## Version

**AGENTS.md Version**: 1.0.0
**Last Updated**: 2024-11-19
**GistLens Version**: 2.0.0

---

_This document is maintained by the GistLens team and should be updated when significant architectural or process changes occur._
