/**
 * Client-side GitHub utilities for GistLens
 * Uses Next.js API routes for secure server-side GitHub operations
 */

/**
 * Placeholder for client-side GitHub operations
 * All actual GitHub API calls should go through /api/github/* routes
 * which handle authentication server-side
 */

export const githubClient = {
  // Placeholder - components should use fetch to /api/github/gists
  getGists: async () => {
    throw new Error('Use /api/github/gists endpoint instead');
  },
  
  // Placeholder - components should use fetch to /api/github/gist/[id]
  getGist: async (id: string) => {
    throw new Error(`Use /api/github/gist/${id} endpoint instead`);
  },
};

// Re-export for compatibility with old components
export const githubAuth = githubClient;
