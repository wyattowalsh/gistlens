import { useState } from 'react';
import { Settings, X, Check, Palette, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CustomStyleEditor } from '@/components/CustomStyleEditor';
import { telemetry } from '@/lib/telemetry';

export interface SettingsConfig {
  autoPreviewMarkdown: boolean;
  defaultTheme: 'light' | 'dark' | 'system';
  showLineNumbers: boolean;
  fontSize: 'small' | 'medium' | 'large';
  enableSyntaxHighlighting: boolean;
  autoLoadGists: boolean;
  historyLimit: number;
  compactMode?: boolean;
  enableAnimations?: boolean;
  wrapLongLines?: boolean;
  telemetryEnabled?: boolean;
  telemetryApiKey?: string;
  iconSet?: 'lucide' | 'material' | 'minimal';
}

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsConfig;
  onSave: (settings: SettingsConfig) => void;
}

export function SettingsDialog({ isOpen, onClose, settings, onSave }: SettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<SettingsConfig>(settings);
  const [showStyleEditor, setShowStyleEditor] = useState(false);

  const handleSave = () => {
    // Update telemetry if changed
    if (localSettings.telemetryEnabled !== undefined) {
      telemetry.setEnabled(localSettings.telemetryEnabled);
      if (localSettings.telemetryEnabled && localSettings.telemetryApiKey) {
        const config = {
          enabled: true,
          apiKey: localSettings.telemetryApiKey,
        };
        localStorage.setItem('gistlens-telemetry', JSON.stringify(config));
        telemetry.init(config);
      }
    }
    
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: SettingsConfig = {
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
      telemetryApiKey: '',
      iconSet: 'lucide',
    };
    setLocalSettings(defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Settings</h2>
              <p className="text-sm text-muted-foreground">Customize your GistLens experience</p>
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
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Appearance Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded"></span>
              Appearance
            </h3>
            
            <div className="space-y-3 pl-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-sm">Default Theme</label>
                  <p className="text-xs text-muted-foreground">Choose your preferred color scheme</p>
                </div>
                <select
                  value={localSettings.defaultTheme}
                  onChange={(e) => setLocalSettings({ ...localSettings, defaultTheme: e.target.value as any })}
                  className="px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-sm">Font Size</label>
                  <p className="text-xs text-muted-foreground">Adjust code and text size</p>
                </div>
                <select
                  value={localSettings.fontSize}
                  onChange={(e) => setLocalSettings({ ...localSettings, fontSize: e.target.value as any })}
                  className="px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-sm">Icon Set</label>
                  <p className="text-xs text-muted-foreground">Choose icon style for file types</p>
                </div>
                <select
                  value={localSettings.iconSet || 'lucide'}
                  onChange={(e) => setLocalSettings({ ...localSettings, iconSet: e.target.value as any })}
                  className="px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="lucide">Lucide (Default)</option>
                  <option value="material">Material Design</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>
          </section>

          {/* Editor Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded"></span>
              Editor
            </h3>
            
            <div className="space-y-3 pl-3">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <label className="font-medium text-sm">Show Line Numbers</label>
                  <p className="text-xs text-muted-foreground">Display line numbers in code blocks</p>
                </div>
                <button
                  onClick={() => setLocalSettings({ ...localSettings, showLineNumbers: !localSettings.showLineNumbers })}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    localSettings.showLineNumbers ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform",
                      localSettings.showLineNumbers ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <label className="font-medium text-sm">Syntax Highlighting</label>
                  <p className="text-xs text-muted-foreground">Enable code syntax highlighting</p>
                </div>
                <button
                  onClick={() => setLocalSettings({ ...localSettings, enableSyntaxHighlighting: !localSettings.enableSyntaxHighlighting })}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    localSettings.enableSyntaxHighlighting ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform",
                      localSettings.enableSyntaxHighlighting ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Behavior Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded"></span>
              Behavior
            </h3>
            
            <div className="space-y-3 pl-3">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <label className="font-medium text-sm">Auto-preview Markdown</label>
                  <p className="text-xs text-muted-foreground">Automatically render markdown files</p>
                </div>
                <button
                  onClick={() => setLocalSettings({ ...localSettings, autoPreviewMarkdown: !localSettings.autoPreviewMarkdown })}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    localSettings.autoPreviewMarkdown ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform",
                      localSettings.autoPreviewMarkdown ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <label className="font-medium text-sm">Auto-load Featured Gists</label>
                  <p className="text-xs text-muted-foreground">Load featured gists on homepage</p>
                </div>
                <button
                  onClick={() => setLocalSettings({ ...localSettings, autoLoadGists: !localSettings.autoLoadGists })}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    localSettings.autoLoadGists ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform",
                      localSettings.autoLoadGists ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <label className="font-medium text-sm">Compact Mode</label>
                  <p className="text-xs text-muted-foreground">Reduce spacing for more content</p>
                </div>
                <button
                  onClick={() => setLocalSettings({ ...localSettings, compactMode: !localSettings.compactMode })}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    localSettings.compactMode ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform",
                      localSettings.compactMode ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <label className="font-medium text-sm">Enable Animations</label>
                  <p className="text-xs text-muted-foreground">Show smooth transitions and effects</p>
                </div>
                <button
                  onClick={() => setLocalSettings({ ...localSettings, enableAnimations: !localSettings.enableAnimations })}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    localSettings.enableAnimations ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform",
                      localSettings.enableAnimations ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <label className="font-medium text-sm">Wrap Long Lines</label>
                  <p className="text-xs text-muted-foreground">Wrap code lines instead of scrolling</p>
                </div>
                <button
                  onClick={() => setLocalSettings({ ...localSettings, wrapLongLines: !localSettings.wrapLongLines })}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    localSettings.wrapLongLines ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform",
                      localSettings.wrapLongLines ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-sm">History Limit</label>
                  <p className="text-xs text-muted-foreground">Maximum number of recent gists to store</p>
                </div>
                <select
                  value={localSettings.historyLimit}
                  onChange={(e) => setLocalSettings({ ...localSettings, historyLimit: parseInt(e.target.value) })}
                  className="px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </section>

          {/* Custom Styles Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded"></span>
              Custom Styles
            </h3>
            
            <div className="space-y-3 pl-3">
              <div className="p-3 rounded-lg bg-muted/30 border">
                <p className="text-sm text-muted-foreground mb-3">
                  Customize the appearance of GistLens and content renderers with custom CSS
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowStyleEditor(true)}
                  className="w-full gap-2"
                >
                  <Palette className="w-4 h-4" />
                  Open Style Editor
                </Button>
              </div>
            </div>
          </section>

          {/* Telemetry Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded"></span>
              Analytics & Telemetry
            </h3>
            
            <div className="space-y-3 pl-3">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <label className="font-medium text-sm">Enable Telemetry</label>
                  <p className="text-xs text-muted-foreground">Help improve GistLens by sharing anonymous usage data</p>
                </div>
                <button
                  onClick={() => setLocalSettings({ ...localSettings, telemetryEnabled: !localSettings.telemetryEnabled })}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    localSettings.telemetryEnabled ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform",
                      localSettings.telemetryEnabled ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
              </div>

              {localSettings.telemetryEnabled && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    PostHog API Key (Optional)
                  </label>
                  <input
                    type="text"
                    value={localSettings.telemetryApiKey || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, telemetryApiKey: e.target.value })}
                    placeholder="phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use default analytics. Provide your own PostHog API key for custom tracking.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/20">
          <Button
            variant="outline"
            onClick={handleReset}
            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Check className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Custom Style Editor */}
      {showStyleEditor && (
        <CustomStyleEditor
          isOpen={showStyleEditor}
          onClose={() => setShowStyleEditor(false)}
        />
      )}
    </div>
  );
}
