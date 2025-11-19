'use client';

/**
 * GitHub Authentication Button for Next.js with Auth.js
 * Uses Next.js server-side authentication
 */

import { signIn, signOut, useSession } from 'next-auth/react';
import { Github, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GitHubAuthButton() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image && (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sm hidden md:inline">{session.user.name}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => signIn('github')}
      className="gap-2"
      size="sm"
    >
      <Github className="w-4 h-4" />
      Sign in with GitHub
    </Button>
  );
}
