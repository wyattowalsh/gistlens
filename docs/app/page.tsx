import Link from 'next/link';
import { BookOpen, Database, Lock, Code, Rocket, Settings } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          GistLens Documentation
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Complete guide for developing, deploying, and extending GistLens with Next.js 15, PostgreSQL, and Auth.js
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <Link href="/getting-started" className="group p-6 rounded-2xl border hover:border-primary transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Rocket className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
          <p className="text-sm text-muted-foreground">
            Set up your local development environment and run GistLens in minutes
          </p>
        </Link>

        <Link href="/auth" className="group p-6 rounded-2xl border hover:border-primary transition-colors">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Lock className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Auth.js Setup</h3>
          <p className="text-sm text-muted-foreground">
            Configure secure GitHub OAuth authentication with Auth.js (NextAuth v5)
          </p>
        </Link>

        <Link href="/database" className="group p-6 rounded-2xl border hover:border-primary transition-colors">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Database className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Database Schema</h3>
          <p className="text-sm text-muted-foreground">
            PostgreSQL database structure, tables, and relationships explained
          </p>
        </Link>

        <Link href="/api" className="group p-6 rounded-2xl border hover:border-primary transition-colors">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Code className="w-6 h-6 text-pink-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">API Routes</h3>
          <p className="text-sm text-muted-foreground">
            Secure server-side API endpoints for GitHub operations
          </p>
        </Link>

        <Link href="/deployment" className="group p-6 rounded-2xl border hover:border-primary transition-colors">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Rocket className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Deployment</h3>
          <p className="text-sm text-muted-foreground">
            Deploy to Vercel, Railway, or self-hosted infrastructure
          </p>
        </Link>

        <Link href="/migration" className="group p-6 rounded-2xl border hover:border-primary transition-colors">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Settings className="w-6 h-6 text-cyan-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Migration Guide</h3>
          <p className="text-sm text-muted-foreground">
            Migrate UI components from the original Vite/React application
          </p>
        </Link>
      </div>

      {/* Features */}
      <div className="bg-muted/50 rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">What's in GistLens v2.0</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Next.js 15 App Router</h4>
              <p className="text-sm text-muted-foreground">Server Components, streaming, and React 19</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Auth.js (NextAuth v5)</h4>
              <p className="text-sm text-muted-foreground">Secure GitHub OAuth with server-side secrets</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">PostgreSQL Database</h4>
              <p className="text-sm text-muted-foreground">User data, sessions, settings, and history</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Secure API Routes</h4>
              <p className="text-sm text-muted-foreground">Server-side GitHub API proxies</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">TypeScript</h4>
              <p className="text-sm text-muted-foreground">Fully typed codebase with strict mode</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Production Ready</h4>
              <p className="text-sm text-muted-foreground">Optimized builds, security best practices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-card rounded-2xl border p-8">
        <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Clone and Install</h4>
            <pre className="text-sm"><code>git clone https://github.com/wyattowalsh/gistlens.git
cd gistlens
npm install</code></pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. Configure Environment</h4>
            <pre className="text-sm"><code>cp .env.example .env.local
# Edit .env.local with your credentials</code></pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. Set Up Database</h4>
            <pre className="text-sm"><code>psql $POSTGRES_URL -f lib/db/schema.sql</code></pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">4. Run Development Server</h4>
            <pre className="text-sm"><code>npm run dev</code></pre>
          </div>
        </div>

        <div className="mt-6">
          <Link href="/getting-started" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <BookOpen className="w-4 h-4" />
            Full Setup Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
