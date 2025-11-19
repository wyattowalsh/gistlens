import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Book, Github, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'GistLens Documentation',
  description: 'Complete documentation for GistLens - Next.js 15, PostgreSQL, and Auth.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                  <Book className="w-6 h-6" />
                  GistLens Docs
                </Link>
                <nav className="hidden md:flex items-center gap-4">
                  <Link href="/getting-started" className="text-sm text-muted-foreground hover:text-foreground">
                    Getting Started
                  </Link>
                  <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                  <Link href="/auth" className="text-sm text-muted-foreground hover:text-foreground">
                    Auth.js
                  </Link>
                  <Link href="/migration" className="text-sm text-muted-foreground hover:text-foreground">
                    Migration
                  </Link>
                  <Link href="/changelog" className="text-sm text-muted-foreground hover:text-foreground">
                    Changelog
                  </Link>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="http://localhost:3000"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">App</span>
                </a>
                <a
                  href="https://github.com/wyattowalsh/gistlens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Github className="w-4 h-4" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t py-6 text-center text-sm text-muted-foreground">
            <div className="max-w-7xl mx-auto px-4">
              GistLens v2.0 - Built with Next.js 15, PostgreSQL, and Auth.js
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
