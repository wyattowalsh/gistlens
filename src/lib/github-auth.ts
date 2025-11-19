/**
 * GitHub OAuth Authentication Service
 * Handles GitHub OAuth flow and authenticated API requests
 */

import { telemetry } from './telemetry';

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = 'Ov23liI0dV9Eyrz71PPu';
const GITHUB_REDIRECT_URI = 'https://gistlens.w4w.dev/auth/github/callback';
const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_API_BASE = 'https://api.github.com';

interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  email: string;
  bio?: string;
  public_gists: number;
  html_url: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
}

class GitHubAuthService {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
  };

  private listeners: Array<(state: AuthState) => void> = [];

  constructor() {
    // Load auth state from localStorage
    this.loadAuthState();
  }

  /**
   * Load authentication state from localStorage
   */
  private loadAuthState() {
    const saved = localStorage.getItem('gistlens-github-auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.state = parsed;
        
        // Validate token is still valid
        if (this.state.token) {
          this.validateToken().catch(() => {
            // Token invalid, clear auth
            this.logout();
          });
        }
      } catch (error) {
        console.error('[GitHub Auth] Failed to load state:', error);
      }
    }
  }

  /**
   * Save authentication state to localStorage
   */
  private saveAuthState() {
    localStorage.setItem('gistlens-github-auth', JSON.stringify(this.state));
    this.notifyListeners();
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    // Call immediately with current state
    listener(this.state);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Get current authentication state
   */
  getState(): AuthState {
    return { ...this.state };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated && !!this.state.token;
  }

  /**
   * Get current user
   */
  getUser(): GitHubUser | null {
    return this.state.user;
  }

  /**
   * Get access token
   */
  getToken(): string | null {
    return this.state.token;
  }

  /**
   * Initiate GitHub OAuth flow
   */
  login() {
    telemetry.trackLoginAttempt();
    
    // Generate random state for CSRF protection
    const state = this.generateRandomState();
    sessionStorage.setItem('github_oauth_state', state);

    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: GITHUB_REDIRECT_URI,
      scope: 'gist,user:email', // Request gist access and user email
      state: state,
    });

    // Redirect to GitHub OAuth
    window.location.href = `${GITHUB_OAUTH_URL}?${params.toString()}`;
  }

  /**
   * Handle OAuth callback
   * Note: This requires a backend proxy to exchange code for token
   * For now, we'll use a client-side flow with limitations
   */
  async handleCallback(code: string, state: string): Promise<boolean> {
    try {
      // Verify state matches
      const savedState = sessionStorage.getItem('github_oauth_state');
      if (savedState !== state) {
        throw new Error('Invalid state parameter');
      }
      sessionStorage.removeItem('github_oauth_state');

      // Exchange code for token
      // Note: This requires a backend proxy since GitHub doesn't support CORS
      // For demo purposes, we'll show how this would work
      const tokenResponse = await this.exchangeCodeForToken(code);
      
      if (!tokenResponse.access_token) {
        throw new Error('No access token received');
      }

      // Store token
      this.state.token = tokenResponse.access_token;

      // Fetch user info
      const user = await this.fetchUser();
      this.state.user = user;
      this.state.isAuthenticated = true;

      // Save state
      this.saveAuthState();

      // Track successful login
      telemetry.trackLoginSuccess(user.login);

      return true;
    } catch (error) {
      console.error('[GitHub Auth] Callback error:', error);
      telemetry.trackLoginFailure(error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Exchange authorization code for access token
   * Note: This is a placeholder - requires backend proxy
   */
  private async exchangeCodeForToken(code: string): Promise<{ access_token: string }> {
    // In production, this would call a backend endpoint that exchanges the code
    // Backend would use the client secret to get the token
    // For now, we'll return a placeholder
    throw new Error('Token exchange requires backend proxy. Please set up a backend endpoint.');
  }

  /**
   * Manual token entry (for development/testing)
   */
  async setToken(token: string): Promise<boolean> {
    try {
      this.state.token = token;
      
      // Validate token and fetch user
      const user = await this.fetchUser();
      this.state.user = user;
      this.state.isAuthenticated = true;

      // Save state
      this.saveAuthState();

      // Track successful login
      telemetry.trackLoginSuccess(user.login);

      return true;
    } catch (error) {
      console.error('[GitHub Auth] Failed to set token:', error);
      this.state.token = null;
      this.state.user = null;
      this.state.isAuthenticated = false;
      telemetry.trackLoginFailure(error instanceof Error ? error.message : 'Invalid token');
      return false;
    }
  }

  /**
   * Logout user
   */
  logout() {
    telemetry.trackLogout();
    
    this.state = {
      isAuthenticated: false,
      user: null,
      token: null,
    };
    
    localStorage.removeItem('gistlens-github-auth');
    this.notifyListeners();
  }

  /**
   * Validate current token
   */
  private async validateToken(): Promise<boolean> {
    try {
      await this.fetchUser();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fetch authenticated user info
   */
  private async fetchUser(): Promise<GitHubUser> {
    const response = await this.authenticatedRequest('/user');
    return response;
  }

  /**
   * Make authenticated request to GitHub API
   */
  async authenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.state.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.state.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        this.logout();
        throw new Error('Authentication expired');
      }
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch user's gists (including private if authenticated)
   */
  async fetchUserGists(username?: string): Promise<any[]> {
    const user = username || this.state.user?.login;
    if (!user) {
      throw new Error('No username provided');
    }

    // If authenticated and fetching own gists, use /gists endpoint to include private
    if (this.isAuthenticated() && user === this.state.user?.login) {
      return this.authenticatedRequest('/gists');
    }

    // Otherwise fetch public gists
    const response = await fetch(`${GITHUB_API_BASE}/users/${user}/gists`);
    if (!response.ok) {
      throw new Error('Failed to fetch gists');
    }
    return response.json();
  }

  /**
   * Fetch a specific gist (including private if authenticated and owned)
   */
  async fetchGist(gistId: string): Promise<any> {
    if (this.isAuthenticated()) {
      try {
        return await this.authenticatedRequest(`/gists/${gistId}`);
      } catch (error) {
        // Fall back to public API if authenticated request fails
        console.warn('[GitHub Auth] Falling back to public API for gist:', gistId);
      }
    }

    // Public API
    const response = await fetch(`${GITHUB_API_BASE}/gists/${gistId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch gist');
    }
    return response.json();
  }

  /**
   * Create a new gist (requires authentication)
   */
  async createGist(data: {
    description: string;
    files: Record<string, { content: string }>;
    public: boolean;
  }): Promise<any> {
    if (!this.isAuthenticated()) {
      throw new Error('Must be authenticated to create gists');
    }

    const result = await this.authenticatedRequest('/gists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    telemetry.trackGistCreate(result.id, Object.keys(data.files).length, data.public);
    return result;
  }

  /**
   * Update an existing gist (requires authentication and ownership)
   */
  async updateGist(gistId: string, data: {
    description?: string;
    files?: Record<string, { content: string } | null>;
  }): Promise<any> {
    if (!this.isAuthenticated()) {
      throw new Error('Must be authenticated to update gists');
    }

    const result = await this.authenticatedRequest(`/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    telemetry.trackGistEdit(gistId);
    return result;
  }

  /**
   * Delete a gist (requires authentication and ownership)
   */
  async deleteGist(gistId: string): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Must be authenticated to delete gists');
    }

    await this.authenticatedRequest(`/gists/${gistId}`, {
      method: 'DELETE',
    });

    telemetry.trackGistDelete(gistId);
  }

  /**
   * Star a gist (requires authentication)
   */
  async starGist(gistId: string): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Must be authenticated to star gists');
    }

    await this.authenticatedRequest(`/gists/${gistId}/star`, {
      method: 'PUT',
    });
  }

  /**
   * Unstar a gist (requires authentication)
   */
  async unstarGist(gistId: string): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Must be authenticated to unstar gists');
    }

    await this.authenticatedRequest(`/gists/${gistId}/star`, {
      method: 'DELETE',
    });
  }

  /**
   * Check if a gist is starred (requires authentication)
   */
  async isGistStarred(gistId: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const response = await fetch(`${GITHUB_API_BASE}/gists/${gistId}/star`, {
        headers: {
          'Authorization': `Bearer ${this.state.token}`,
        },
      });
      return response.status === 204;
    } catch {
      return false;
    }
  }

  /**
   * Generate random state for OAuth
   */
  private generateRandomState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Export singleton instance
export const githubAuth = new GitHubAuthService();
