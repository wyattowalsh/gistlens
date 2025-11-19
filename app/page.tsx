import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Github, Lock, Database, Shield } from 'lucide-react';

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <nav className="border-b bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-xl">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              GistLens
            </span>
          </div>

          <div className="flex items-center gap-2">
            {session ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {session.user?.name || session.user?.email}
                </span>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/api/auth/signin"
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                Sign in with GitHub
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            GistLens v2.0
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Now powered by Next.js 15, PostgreSQL, and secure server-side authentication
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="p-6 rounded-2xl border bg-card">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure OAuth</h3>
            <p className="text-sm text-muted-foreground">
              GitHub OAuth with server-side secret management. No client secrets exposed.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">PostgreSQL</h3>
            <p className="text-sm text-muted-foreground">
              Database-backed sessions, user settings, and gist history.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Private Gists</h3>
            <p className="text-sm text-muted-foreground">
              Access your private gists with authenticated API routes.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4">
              <Github className="w-6 h-6 text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Full CRUD</h3>
            <p className="text-sm text-muted-foreground">
              Create, read, update, and delete gists through secure API routes.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-8">
          <h2 className="text-2xl font-bold mb-4">Migration Complete! 🎉</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              GistLens has been successfully migrated from Vite + React to Next.js 15 with the following improvements:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Next.js 15 App Router with Server Components</li>
              <li>NextAuth.js v5 for secure authentication</li>
              <li>PostgreSQL database with Vercel Postgres</li>
              <li>Server-side API routes for GitHub operations</li>
              <li>Environment variables for all secrets</li>
              <li>No client secrets exposed in frontend</li>
              <li>Database schema for users, sessions, settings, and history</li>
            </ul>
            
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Setup Required:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Copy <code className="bg-background px-1 rounded">.env.example</code> to <code className="bg-background px-1 rounded">.env.local</code></li>
                <li>Configure PostgreSQL database connection</li>
                <li>Run database schema: <code className="bg-background px-1 rounded">psql $POSTGRES_URL -f lib/db/schema.sql</code></li>
                <li>Generate NextAuth secret: <code className="bg-background px-1 rounded">openssl rand -base64 32</code></li>
                <li>Run <code className="bg-background px-1 rounded">npm run dev</code> to start development server</li>
              </ol>
            </div>

            {session && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                  ✓ You&apos;re authenticated!
                </h3>
                <p className="text-sm">
                  Logged in as <strong>{session.user?.name || session.user?.email}</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
