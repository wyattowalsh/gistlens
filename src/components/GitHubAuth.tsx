/**
 * GitHub Authentication Components
 */

import { useState, useEffect } from 'react';
import { Github, LogOut, User, Lock, Key, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { githubAuth } from '@/lib/github-auth';
import { cn } from '@/lib/utils';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    login: string;
    avatar_url: string;
    name: string;
    public_gists: number;
  } | null;
  token: string | null;
}

/**
 * GitHub Login/Profile Button
 */
export function GitHubAuthButton() {
  const [authState, setAuthState] = useState<AuthState>(githubAuth.getState());
  const [showMenu, setShowMenu] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = githubAuth.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  const handleLogin = () => {
    // For now, show token input dialog since we don't have a backend
    setShowTokenDialog(true);
  };

  const handleLogout = () => {
    githubAuth.logout();
    setShowMenu(false);
  };

  if (authState.isAuthenticated && authState.user) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMenu(!showMenu)}
          className="relative hover:bg-muted"
        >
          <img
            src={authState.user.avatar_url}
            alt={authState.user.login}
            className="w-8 h-8 rounded-full"
          />
        </Button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl border bg-card shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-purple-500/10">
              <div className="flex items-center gap-3">
                <img
                  src={authState.user.avatar_url}
                  alt={authState.user.login}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{authState.user.name || authState.user.login}</p>
                  <p className="text-sm text-muted-foreground truncate">@{authState.user.login}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{authState.user.public_gists} public gists</span>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-destructive"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {showTokenDialog && (
          <TokenInputDialog
            onClose={() => setShowTokenDialog(false)}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={handleLogin}
        className="gap-2 shadow-sm hover:shadow-md transition-all"
      >
        <Github className="w-4 h-4" />
        <span>Sign in with GitHub</span>
      </Button>

      {showTokenDialog && (
        <TokenInputDialog
          onClose={() => setShowTokenDialog(false)}
        />
      )}
    </>
  );
}

/**
 * Token Input Dialog
 * Allows manual token entry for development
 */
function TokenInputDialog({ onClose }: { onClose: () => void }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await githubAuth.setToken(token);
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError('Invalid token. Please check and try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Github className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">GitHub Authentication</h2>
              <p className="text-sm text-muted-foreground">Enter your personal access token</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-muted/50"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-primary mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-medium">How to create a token:</p>
                <ol className="mt-2 space-y-1 text-muted-foreground list-decimal list-inside">
                  <li>Go to GitHub Settings → Developer settings → Personal access tokens</li>
                  <li>Click "Generate new token (classic)"</li>
                  <li>Select scope: <code className="text-xs bg-background px-1 rounded">gist</code></li>
                  <li>Copy and paste the token below</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="token" className="text-sm font-medium flex items-center gap-2">
              <Key className="w-4 h-4" />
              Personal Access Token
            </label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
              <p className="text-sm text-destructive flex-1">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <p className="text-sm text-green-500 flex-1">Successfully authenticated!</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !token} className="flex-1 gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : success ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Authenticated</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Private Gist Badge
 */
export function PrivateGistBadge() {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-medium">
      <Lock className="w-3 h-3" />
      <span>Private</span>
    </div>
  );
}
