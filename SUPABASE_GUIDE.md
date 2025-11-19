# Supabase Integration Guide for GistLens

GistLens now supports Supabase as the primary database backend, providing advanced features like real-time subscriptions, Row Level Security (RLS), and a powerful authentication system.

## 🚀 Why Supabase?

Supabase provides several advantages over traditional PostgreSQL:

- **Real-time Database**: Live updates via WebSockets for collaborative features
- **Row Level Security (RLS)**: Database-level security policies for data protection
- **Built-in Authentication**: Secure auth with multiple OAuth providers
- **Edge Functions**: Serverless functions at the edge for low latency
- **Storage**: S3-compatible file storage with CDN delivery
- **Vector Database**: pgvector support for AI/ML applications
- **Modern DX**: Excellent TypeScript support and developer experience

## 📦 Installation

### 1. Install Dependencies

The required packages are already included in `package.json`:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Fill in your project details:
   - Name: `gistlens`
   - Database Password: (generate a strong password)
   - Region: (choose closest to your users)
4. Wait for the project to be provisioned (~2 minutes)

### 3. Get Your Supabase Credentials

1. Go to Project Settings → API
2. Copy the following values:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon/Public Key**: Your public anon key (safe for client-side)

### 4. Configure Environment Variables

Create or update `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Keep existing Auth.js and GitHub OAuth settings
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Optional: PostHog for analytics
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 5. Run Database Migrations

#### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click "New Query"
4. Copy the contents of `supabase/migrations/20250119000000_initial_schema.sql`
5. Paste and click "Run"

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## 🏗️ Architecture

### Client Architecture

GistLens uses different Supabase clients for different contexts:

```
┌─────────────────────────────────────────┐
│         Client Components               │
│  (Browser - uses cookie-based auth)     │
│                                         │
│  lib/supabase/client.ts                 │
│  → createBrowserClient()                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│       Server Components / API           │
│  (Server - reads cookies from request)  │
│                                         │
│  lib/supabase/server.ts                 │
│  → createServerClient()                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           Middleware                    │
│  (Refreshes auth tokens on requests)    │
│                                         │
│  lib/supabase/middleware.ts             │
│  → updateSession()                      │
└─────────────────────────────────────────┘
```

### Database Layer

The database operations are abstracted in two implementations:

- **`lib/db/index.ts`**: Original Vercel Postgres implementation (legacy)
- **`lib/db/supabase.ts`**: New Supabase implementation (recommended)

Both provide the same API surface, making migration seamless.

## 🔐 Row Level Security (RLS)

Supabase uses RLS policies to secure data at the database level. Our schema includes policies for:

### Users Table
- Users can view and update their own profile
- No user can view other users' private data

### Settings Table
- Users can only access their own settings
- Automatic enforcement of user_id matching

### Gist History
- Complete CRUD operations only for own history
- Real-time subscriptions available

### Custom Styles
- Per-user isolation
- Secure style management

### Benefits of RLS

1. **Security by Default**: Even if there's a bug in application code, the database enforces access control
2. **Performance**: Policies are applied at the database level, not in application code
3. **Simplicity**: No need to add WHERE clauses to every query
4. **Real-time Safe**: Subscriptions automatically respect RLS policies

## 📊 Real-time Features

Supabase provides real-time database subscriptions. Example usage:

```typescript
import { createBrowserClient } from '@/lib/supabase/client';

// In a client component
const supabase = createBrowserClient();

// Subscribe to gist history changes
const channel = supabase
  .channel('gist_history_changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'gist_history',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('Change received!', payload);
      // Update UI with new data
    }
  )
  .subscribe();

// Cleanup when component unmounts
return () => {
  supabase.removeChannel(channel);
};
```

## 🔄 Migration from Vercel Postgres

If you're migrating from Vercel Postgres:

1. **Export existing data** (if any):
   ```bash
   pg_dump $POSTGRES_URL > backup.sql
   ```

2. **Update environment variables** to use Supabase

3. **Run Supabase migrations**

4. **Import data** (if needed):
   ```bash
   psql $NEXT_PUBLIC_SUPABASE_URL < backup.sql
   ```

5. **Update code** to use Supabase client (if needed)

## 🎯 Best Practices

### 1. Always Use Type-Safe Queries

```typescript
// Good - type-safe
const { data, error } = await supabase
  .from('users')
  .select('id, name, email')
  .eq('github_id', githubId)
  .single();

// Handle errors
if (error) {
  console.error('Error:', error);
  return null;
}
```

### 2. Use Server Components for Data Fetching

```typescript
// app/profile/page.tsx
import { createServerClient } from '@/lib/supabase';

export default async function ProfilePage() {
  const supabase = await createServerClient();
  const { data: user } = await supabase.auth.getUser();
  
  return <div>Welcome {user?.email}</div>;
}
```

### 3. Use Client Components for Interactivity

```typescript
'use client';

import { createBrowserClient } from '@/lib/supabase/client';

export function InteractiveComponent() {
  const supabase = createBrowserClient();
  // Use for real-time, mutations, etc.
}
```

### 4. Handle Errors Gracefully

```typescript
const { data, error } = await supabase
  .from('users')
  .select('*');

if (error) {
  console.error('Database error:', error);
  // Show user-friendly message
  return { error: 'Failed to load data' };
}
```

### 5. Use Middleware for Auth

The middleware automatically refreshes tokens and manages sessions. No additional code needed!

## 🧪 Testing

### Local Development

```bash
# Start Supabase locally (optional)
supabase start

# Your app will use local Supabase instance
npm run dev
```

### Testing Database Operations

```typescript
import { getUserByGithubId } from '@/lib/db/supabase';

// Test fetching user
const user = await getUserByGithubId(12345);
console.log(user);
```

## 🚀 Production Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - All other existing variables
4. Deploy!

### Other Platforms

1. Set environment variables in your platform
2. Build: `npm run build`
3. Start: `npm start`

## 🔍 Monitoring and Debugging

### Supabase Dashboard

- **Logs**: View real-time logs for queries, auth, and functions
- **Database**: Browse tables and run SQL queries
- **Auth**: Manage users and auth providers
- **Storage**: View and manage uploaded files

### Enable Query Logging (Development)

Add to your Supabase client creation:

```typescript
const supabase = createClient(url, key, {
  global: {
    headers: { 'x-client-info': 'gistlens' }
  },
  // Enable debug logging in development
  ...(process.env.NODE_ENV === 'development' && {
    auth: { debug: true }
  })
});
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/server-side)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

## 🆘 Troubleshooting

### Issue: "relation does not exist"
**Solution**: Run the migrations in the Supabase SQL Editor

### Issue: "JWT expired"
**Solution**: Middleware should handle this automatically. Check that middleware.ts is configured correctly.

### Issue: "Row Level Security policy violation"
**Solution**: Ensure the user is authenticated and the policy allows the operation.

### Issue: "Invalid API key"
**Solution**: Verify your environment variables are correct and deployed.

## 🔮 Future Enhancements

Potential features to implement with Supabase:

- **Storage Integration**: Upload gist attachments and images
- **Edge Functions**: Custom API endpoints at the edge
- **Vector Search**: AI-powered gist search
- **Real-time Collaboration**: Live gist editing
- **Webhooks**: Integrate with external services
- **Database Functions**: Complex queries as stored procedures

---

**Need Help?** Check the [Supabase Discord](https://discord.supabase.com) or [GitHub Issues](https://github.com/wyattowalsh/gistlens/issues)
