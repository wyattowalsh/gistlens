/**
 * Telemetry Service for GistLens
 * Tracks user interactions while respecting privacy
 */

import posthog from 'posthog-js';

interface TelemetryConfig {
  enabled: boolean;
  apiKey?: string;
  apiHost?: string;
}

class TelemetryService {
  private initialized = false;
  private enabled = false;

  /**
   * Initialize telemetry service
   */
  init(config: TelemetryConfig) {
    if (this.initialized) return;

    this.enabled = config.enabled;

    if (config.enabled && config.apiKey) {
      try {
        posthog.init(config.apiKey, {
          api_host: config.apiHost || 'https://app.posthog.com',
          autocapture: false, // We'll manually capture events
          capture_pageview: false, // Manual page tracking
          disable_session_recording: true, // Privacy-focused
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') {
              posthog.debug(); // Enable debug mode in development
            }
          },
        });
        this.initialized = true;
        console.log('[Telemetry] Initialized successfully');
      } catch (error) {
        console.error('[Telemetry] Failed to initialize:', error);
        this.enabled = false;
      }
    }
  }

  /**
   * Enable or disable telemetry
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled && !this.initialized) {
      // Re-initialize if needed
      const config = this.getConfig();
      if (config.apiKey) {
        this.init(config);
      }
    } else if (!enabled && this.initialized) {
      posthog.opt_out_capturing();
    } else if (enabled && this.initialized) {
      posthog.opt_in_capturing();
    }
  }

  /**
   * Check if telemetry is enabled
   */
  isEnabled(): boolean {
    return this.enabled && this.initialized;
  }

  /**
   * Get telemetry configuration from localStorage
   */
  private getConfig(): TelemetryConfig {
    const saved = localStorage.getItem('gistlens-telemetry');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { enabled: false };
      }
    }
    return { enabled: false };
  }

  /**
   * Track a custom event
   */
  track(eventName: string, properties?: Record<string, any>) {
    if (!this.isEnabled()) return;

    try {
      posthog.capture(eventName, properties);
      console.log('[Telemetry] Tracked:', eventName, properties);
    } catch (error) {
      console.error('[Telemetry] Failed to track event:', error);
    }
  }

  /**
   * Identify a user (for authenticated users)
   */
  identify(userId: string, traits?: Record<string, any>) {
    if (!this.isEnabled()) return;

    try {
      posthog.identify(userId, traits);
      console.log('[Telemetry] Identified user:', userId);
    } catch (error) {
      console.error('[Telemetry] Failed to identify user:', error);
    }
  }

  /**
   * Reset user identification (on logout)
   */
  reset() {
    if (!this.isEnabled()) return;

    try {
      posthog.reset();
      console.log('[Telemetry] Reset user identification');
    } catch (error) {
      console.error('[Telemetry] Failed to reset:', error);
    }
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, properties?: Record<string, any>) {
    this.track('page_view', { page: pageName, ...properties });
  }

  // Predefined event trackers for major user interactions

  trackSearch(query: string, resultType: 'gist' | 'user') {
    this.track('search', { query, result_type: resultType });
  }

  trackGistView(gistId: string, owner?: string, fileCount?: number) {
    this.track('gist_view', { gist_id: gistId, owner, file_count: fileCount });
  }

  trackGistShare(gistId: string, shareMethod: string) {
    this.track('gist_share', { gist_id: gistId, share_method: shareMethod });
  }

  trackFileDownload(gistId: string, filename: string) {
    this.track('file_download', { gist_id: gistId, filename });
  }

  trackCopyCode(gistId: string, filename: string) {
    this.track('copy_code', { gist_id: gistId, filename });
  }

  trackThemeToggle(theme: 'light' | 'dark') {
    this.track('theme_toggle', { theme });
  }

  trackPreviewToggle(filename: string, enabled: boolean) {
    this.track('preview_toggle', { filename, enabled });
  }

  trackFullscreenToggle(enabled: boolean) {
    this.track('fullscreen_toggle', { enabled });
  }

  trackUserGistsBrowse(username: string, gistCount: number) {
    this.track('user_gists_browse', { username, gist_count: gistCount });
  }

  trackHistoryItemClick(gistId: string) {
    this.track('history_item_click', { gist_id: gistId });
  }

  trackFeaturedGistClick(gistId: string, category: string) {
    this.track('featured_gist_click', { gist_id: gistId, category });
  }

  trackSettingsOpen() {
    this.track('settings_open');
  }

  trackSettingsSave(settings: Record<string, any>) {
    this.track('settings_save', { settings });
  }

  // GitHub Auth events
  trackLoginAttempt() {
    this.track('login_attempt');
  }

  trackLoginSuccess(username: string) {
    this.track('login_success', { username });
    this.identify(username);
  }

  trackLoginFailure(error: string) {
    this.track('login_failure', { error });
  }

  trackLogout() {
    this.track('logout');
    this.reset();
  }

  trackGistCreate(gistId: string, fileCount: number, isPublic: boolean) {
    this.track('gist_create', { gist_id: gistId, file_count: fileCount, is_public: isPublic });
  }

  trackGistEdit(gistId: string) {
    this.track('gist_edit', { gist_id: gistId });
  }

  trackGistDelete(gistId: string) {
    this.track('gist_delete', { gist_id: gistId });
  }

  // Custom stylesheet events
  trackCustomStylesheetApply(target: string) {
    this.track('custom_stylesheet_apply', { target });
  }

  trackCustomStylesheetEdit(target: string) {
    this.track('custom_stylesheet_edit', { target });
  }

  trackCustomStylesheetReset(target: string) {
    this.track('custom_stylesheet_reset', { target });
  }

  // Icon set events
  trackIconSetChange(iconSet: string) {
    this.track('icon_set_change', { icon_set: iconSet });
  }

  // Graph viewer events
  trackGraphView(gistId: string, filename: string, graphFormat: string, nodeCount: number, edgeCount: number) {
    this.track('graph_view', {
      gist_id: gistId,
      filename,
      graph_format: graphFormat,
      node_count: nodeCount,
      edge_count: edgeCount,
    });
  }

  trackGraphViewModeToggle(mode: '2d' | '3d') {
    this.track('graph_view_mode_toggle', { mode });
  }

  trackGraphNodeClick(nodeId: string, nodeType: string) {
    this.track('graph_node_click', { node_id: nodeId, node_type: nodeType });
  }

  trackGraphFullscreenToggle(enabled: boolean) {
    this.track('graph_fullscreen_toggle', { enabled });
  }

  // Settings persistence events
  trackSettingsSyncSuccess() {
    this.track('settings_sync_success');
  }

  trackSettingsSyncFailure(error: string) {
    this.track('settings_sync_failure', { error });
  }

  trackSettingsLoad(source: 'server' | 'localStorage') {
    this.track('settings_load', { source });
  }
}

// Export singleton instance
export const telemetry = new TelemetryService();

// Initialize telemetry on module load
const config = localStorage.getItem('gistlens-telemetry');
if (config) {
  try {
    const parsed = JSON.parse(config);
    if (parsed.enabled) {
      telemetry.init(parsed);
    }
  } catch (error) {
    console.error('[Telemetry] Failed to load config:', error);
  }
}
