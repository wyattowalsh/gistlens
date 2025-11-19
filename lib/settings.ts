/**
 * Settings Management
 * Handles intelligent persistence of user settings between localStorage and server
 */

import type { SettingsConfig } from '@/components/SettingsDialog';
import { telemetry } from './telemetry';

const SETTINGS_KEY = 'gistlens-settings';

/**
 * Get default settings
 */
export function getDefaultSettings(): SettingsConfig {
  return {
    autoPreviewMarkdown: true,
    defaultTheme: 'dark',
    showLineNumbers: true,
    fontSize: 'medium',
    enableSyntaxHighlighting: true,
    autoLoadGists: true,
    historyLimit: 10,
    compactMode: false,
    enableAnimations: true,
    wrapLongLines: false,
    telemetryEnabled: false,
    iconSet: 'lucide',
  };
}

/**
 * Load settings from localStorage
 */
export function loadSettingsFromLocalStorage(): SettingsConfig {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      telemetry.trackSettingsLoad('localStorage');
      return { ...getDefaultSettings(), ...parsed };
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
  }
  return getDefaultSettings();
}

/**
 * Save settings to localStorage
 */
export function saveSettingsToLocalStorage(settings: SettingsConfig): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
}

/**
 * Load settings from server (for authenticated users)
 */
export async function loadSettingsFromServer(): Promise<SettingsConfig | null> {
  try {
    const response = await fetch('/api/settings');
    if (response.ok) {
      const settings = await response.json();
      telemetry.trackSettingsLoad('server');
      return settings;
    }
    return null;
  } catch (error) {
    console.error('Failed to load settings from server:', error);
    return null;
  }
}

/**
 * Save settings to server (for authenticated users)
 */
export async function saveSettingsToServer(settings: SettingsConfig): Promise<boolean> {
  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (response.ok) {
      telemetry.trackSettingsSyncSuccess();
      return true;
    }
    
    telemetry.trackSettingsSyncFailure('Server returned error');
    return false;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    telemetry.trackSettingsSyncFailure(errorMsg);
    console.error('Failed to save settings to server:', error);
    return false;
  }
}

/**
 * Load settings intelligently (try server first for authenticated users, fallback to localStorage)
 */
export async function loadSettings(isAuthenticated: boolean): Promise<SettingsConfig> {
  if (isAuthenticated) {
    const serverSettings = await loadSettingsFromServer();
    if (serverSettings) {
      // Sync to localStorage as backup
      saveSettingsToLocalStorage(serverSettings);
      return serverSettings;
    }
  }
  
  // Fallback to localStorage
  return loadSettingsFromLocalStorage();
}

/**
 * Save settings intelligently (save to both server and localStorage)
 */
export async function saveSettings(
  settings: SettingsConfig,
  isAuthenticated: boolean
): Promise<void> {
  // Always save to localStorage first for immediate persistence
  saveSettingsToLocalStorage(settings);
  
  // If authenticated, also sync to server
  if (isAuthenticated) {
    await saveSettingsToServer(settings);
  }
}
