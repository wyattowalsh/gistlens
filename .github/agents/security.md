# Security Guidelines for AI Agents

## 🔒 Core Security Principles

### 1. **NEVER Expose Secrets in Code**

**❌ WRONG:**
```typescript
const GITHUB_CLIENT_SECRET = 'd069f942ee3a3fce42622fc740a10148aba80b6a';
```

**✅ CORRECT:**
```typescript
// In server-side code only
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
if (!GITHUB_CLIENT_SECRET) {
  throw new Error('GITHUB_CLIENT_SECRET environment variable is required');
}
```

### 2. **Server-Side Only Secret Access**

Secrets should ONLY be accessed in:
- Server Components (`app/**` pages without `'use client'`)
- API Routes (`app/api/**`)
- Server-side utilities (`lib/` functions called from server)

**❌ NEVER in:**
- Client Components (`'use client'`)
- Frontend utilities accessible to browser
- Any code that gets bundled for the client

### 3. **Legacy Code Warning**

⚠️ **IMPORTANT**: The `src/` directory contains OLD client-side code from the Vite/React version. This code is NOT used in production and exists only for reference during migration.

**Security issues in `src/` directory:**
- `src/lib/github-auth.ts` - Contains OAuth logic but is client-side only
- These files are NOT included in the Next.js build
- Do NOT copy patterns from `src/` - use the new Next.js patterns instead

### 4. **Authentication Token Handling**

**Session-based authentication (Auth.js):**
```typescript
// Server Component - Access session
import { auth } from '@/lib/auth';

export default async function Page() {
  const session = await auth();
  if (!session) {
    redirect('/');
  }
  
  // Use session.accessToken for GitHub API calls
  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
    },
  });
}
```

**API Route - Authenticated requests:**
```typescript
// app/api/github/gists/route.ts
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await auth();
  
  // Token is in session.accessToken (NOT sent to client)
  if (session?.accessToken) {
    // Make authenticated GitHub API call
    const response = await fetch('https://api.github.com/gists', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    return Response.json(await response.json());
  }
  
  // Fall back to public API
  return Response.json([]);
}
```

## 🛡️ Input Validation

### Always Validate User Input

```typescript
import { z } from 'zod';

// Define schema
const GistSchema = z.object({
  description: z.string().max(500),
  files: z.record(z.object({
    content: z.string().max(1000000), // 1MB limit
  })),
  public: z.boolean(),
});

// Validate in API route
export async function POST(request: Request) {
  const body = await request.json();
  
  // Validate throws error if invalid
  const validatedData = GistSchema.parse(body);
  
  // Now safe to use validatedData
}
```

### SQL Injection Prevention

**❌ WRONG:**
```typescript
const query = `SELECT * FROM users WHERE username = '${username}'`;
```

**✅ CORRECT:**
```typescript
import { sql } from '@vercel/postgres';

const result = await sql`
  SELECT * FROM users
  WHERE username = ${username}
`;
```

## 🔐 Environment Variables

### Naming Conventions

- **Server-only secrets:** No prefix
  - `GITHUB_CLIENT_SECRET`
  - `NEXTAUTH_SECRET`
  - `POSTGRES_URL`

- **Public variables:** `NEXT_PUBLIC_` prefix
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_POSTHOG_KEY`

### Validation

Always validate environment variables at startup:

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  POSTGRES_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

## 🚨 Security Checklist

Before committing code, verify:

- [ ] No hardcoded secrets or API keys
- [ ] Environment variables properly validated
- [ ] User input sanitized and validated
- [ ] SQL queries use parameterized statements
- [ ] Authentication required for sensitive operations
- [ ] CSRF protection enabled (Auth.js provides this)
- [ ] Rate limiting considered for public APIs
- [ ] Error messages don't leak sensitive information
- [ ] Secrets only accessed server-side
- [ ] `.env.local` in `.gitignore`

## 🔍 Security Audit Commands

```bash
# Check for hardcoded secrets (common patterns)
grep -r "password.*=.*['\"]" --exclude-dir=node_modules
grep -r "secret.*=.*['\"]" --exclude-dir=node_modules
grep -r "api.*key.*=.*['\"]" --exclude-dir=node_modules

# Check for .env files committed
git ls-files | grep -E "\.env$|\.env\.local$"

# Check dependencies for vulnerabilities
pnpm audit

# Check for outdated dependencies
pnpm outdated
```

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Auth.js Security Best Practices](https://authjs.dev/getting-started/introduction#security)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [Vercel Security Best Practices](https://vercel.com/docs/security/security-checklist)

## 🆘 If You Accidentally Commit a Secret

1. **Immediately rotate the secret** - Generate a new one
2. **Update environment variables** everywhere (Vercel, local, etc.)
3. **Remove from git history** - Use BFG Repo Cleaner or git-filter-repo
4. **Notify the team** if in a team environment
5. **Update documentation** if the secret was documented anywhere

Remember: Once pushed to GitHub, assume the secret is compromised, even if you delete the commit.
