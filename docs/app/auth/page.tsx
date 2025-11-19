export default function AuthPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Auth.js Configuration</h1>
      
      <div className="prose prose-invert max-w-none space-y-6">
        <p className="text-lg text-muted-foreground">
          GistLens uses Auth.js (formerly NextAuth.js v5) for secure GitHub OAuth authentication.
        </p>

        <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">📝 Note on Branding</h3>
          <p className="text-sm">
            NextAuth.js v5 has been rebranded as <strong>Auth.js</strong>. The package is still <code>next-auth</code> 
            but the official documentation is at <a href="https://authjs.dev" className="text-primary hover:underline">authjs.dev</a>.
          </p>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Architecture</h2>
        
        <div className="bg-muted/50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Authentication Flow</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>User clicks "Sign in with GitHub"</li>
            <li>Redirected to GitHub OAuth page</li>
            <li>User authorizes application</li>
            <li>GitHub redirects to <code>/api/auth/callback/github</code></li>
            <li>Auth.js exchanges code for access token (server-side)</li>
            <li>User created/updated in PostgreSQL database</li>
            <li>Encrypted JWT session stored</li>
            <li>User redirected to application</li>
          </ol>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Configuration Files</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">lib/auth/config.ts</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Main Auth.js configuration with GitHub provider
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm"><code>{`import { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'gist user:email',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Create/update user in database
      // See full implementation in lib/auth/config.ts
    },
    async jwt({ token, account, profile }) {
      // Add access token to JWT
    },
    async session({ session, token }) {
      // Add user data to session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};`}</code></pre>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">app/api/auth/[...nextauth]/route.ts</h3>
            <p className="text-sm text-muted-foreground mb-3">
              API route handler for Auth.js
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm"><code>{`import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;`}</code></pre>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">types/next-auth.d.ts</h3>
            <p className="text-sm text-muted-foreground mb-3">
              TypeScript type extensions for session
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm"><code>{`declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user?: {
      id?: string;
      githubId?: number;
      githubUsername?: string;
    };
  }
}`}</code></pre>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Environment Variables</h2>
        
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto"><code>{`# Auth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# GitHub OAuth
GITHUB_CLIENT_ID="your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"
GITHUB_REDIRECT_URI="http://localhost:3000/api/auth/callback/github"`}</code></pre>

        <h2 className="text-2xl font-bold mt-8 mb-4">Usage in Components</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Server Components</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm"><code>{`import { auth } from '@/lib/auth';

export default async function Page() {
  const session = await auth();
  
  if (!session) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Hello {session.user?.name}</div>;
}`}</code></pre>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Client Components</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm"><code>{`'use client';

import { useSession } from 'next-auth/react';

export default function ClientComponent() {
  const { data: session } = useSession();
  
  if (!session) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Hello {session.user?.name}</div>;
}`}</code></pre>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Sign In/Out</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm"><code>{`import { signIn, signOut } from 'next-auth/react';

// Sign in
<button onClick={() => signIn('github')}>
  Sign in with GitHub
</button>

// Sign out
<button onClick={() => signOut()}>
  Sign out
</button>`}</code></pre>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Security Features</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">✅ Server-Side Secrets</h4>
            <p className="text-sm text-muted-foreground">
              Client secret never sent to browser
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">✅ Encrypted Sessions</h4>
            <p className="text-sm text-muted-foreground">
              JWT encrypted with NEXTAUTH_SECRET
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">✅ CSRF Protection</h4>
            <p className="text-sm text-muted-foreground">
              Built-in CSRF token validation
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">✅ Database Sessions</h4>
            <p className="text-sm text-muted-foreground">
              User data persisted in PostgreSQL
            </p>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-lg mt-8">
          <h3 className="text-xl font-semibold mb-3">📚 Learn More</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <a href="https://authjs.dev" className="text-primary hover:underline">
                Official Auth.js Documentation
              </a>
            </li>
            <li>
              <a href="https://authjs.dev/reference/nextjs" className="text-primary hover:underline">
                Next.js Integration Guide
              </a>
            </li>
            <li>
              <a href="/database" className="text-primary hover:underline">
                Database Schema for Auth
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
