/**
 * Custom Stylesheet Editor Component
 */

import { useState, useEffect } from 'react';
import { Palette, Save, RotateCcw, Download, Upload, Eye, EyeOff, Code, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { customStyles, type StyleTarget } from '@/lib/custom-styles';
import { cn } from '@/lib/utils';

interface CustomStyleEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

const STYLE_TARGETS: Array<{ value: StyleTarget; label: string; description: string }> = [
  { value: 'app', label: 'Application', description: 'Global app styles' },
  { value: 'markdown', label: 'Markdown', description: 'Markdown renderer styles' },
  { value: 'code', label: 'Code Blocks', description: 'Code syntax highlighting styles' },
  { value: 'mdx', label: 'MDX', description: 'MDX content styles' },
  { value: 'rst', label: 'reStructuredText', description: 'RST content styles' },
  { value: 'jsx', label: 'JSX', description: 'JSX preview styles' },
];

export function CustomStyleEditor({ isOpen, onClose }: CustomStyleEditorProps) {
  const [activeTab, setActiveTab] = useState<StyleTarget>('markdown');
  const [cssContent, setCssContent] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Load current style when tab changes
  useEffect(() => {
    const style = customStyles.get(activeTab);
    if (style) {
      setCssContent(style.css);
      setEnabled(style.enabled);
    } else {
      setCssContent('');
      setEnabled(false);
    }
  }, [activeTab]);

  const handleSave = () => {
    try {
      customStyles.set(activeTab, cssContent, enabled);
      setSaved(true);
      setError(null);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save styles');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset this stylesheet?')) {
      customStyles.reset(activeTab);
      setCssContent('');
      setEnabled(false);
    }
  };

  const handleExport = () => {
    const data = customStyles.export();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gistlens-custom-styles.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const success = customStyles.import(content);
          if (success) {
            // Reload current style
            const style = customStyles.get(activeTab);
            if (style) {
              setCssContent(style.css);
              setEnabled(style.enabled);
            }
            alert('Custom styles imported successfully!');
          } else {
            alert('Failed to import custom styles. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleTemplateSelect = (template: { css: string }) => {
    setCssContent(template.css);
    setShowTemplates(false);
  };

  if (!isOpen) return null;

  const templates = customStyles.getTemplates();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Custom Stylesheets</h2>
              <p className="text-sm text-muted-foreground">Customize the appearance of GistLens</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImport}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-muted/50"
            >
              <Code className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-200px)]">
          {/* Sidebar with tabs */}
          <div className="w-64 border-r bg-muted/20 overflow-y-auto">
            <div className="p-4 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Style Targets
              </h3>
              {STYLE_TARGETS.map((target) => {
                const style = customStyles.get(target.value);
                return (
                  <button
                    key={target.value}
                    onClick={() => setActiveTab(target.value)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg transition-colors',
                      activeTab === target.value
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{target.label}</span>
                      {style?.enabled && (
                        <Eye className="w-3 h-3" />
                      )}
                    </div>
                    <p className="text-xs opacity-70">{target.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="border-b p-4 flex items-center justify-between bg-muted/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEnabled(!enabled)}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors',
                    enabled ? 'bg-primary' : 'bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform',
                      enabled ? 'left-5' : 'left-0.5'
                    )}
                  />
                </button>
                <label className="text-sm font-medium">
                  {enabled ? 'Enabled' : 'Disabled'}
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="gap-2"
                >
                  <Palette className="w-4 h-4" />
                  Templates
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Templates Panel */}
            {showTemplates && (
              <div className="border-b p-4 bg-muted/5 space-y-2">
                <h4 className="text-sm font-semibold mb-2">Style Templates</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(templates).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left p-3 rounded-lg border hover:bg-muted transition-colors"
                    >
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CSS Editor */}
            <div className="flex-1 p-4 overflow-hidden">
              <textarea
                value={cssContent}
                onChange={(e) => setCssContent(e.target.value)}
                placeholder="/* Enter your custom CSS here */&#10;&#10;/* Example: */&#10;.markdown-renderer h1 {&#10;  color: #667eea;&#10;  font-size: 2rem;&#10;}"
                className="w-full h-full px-4 py-3 rounded-lg border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                spellCheck={false}
              />
            </div>

            {/* Status Messages */}
            {error && (
              <div className="mx-4 mb-4 flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                <p className="text-sm text-destructive flex-1">{error}</p>
              </div>
            )}

            {saved && (
              <div className="mx-4 mb-4 flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <p className="text-sm text-green-500 flex-1">Styles saved successfully!</p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t p-4 flex items-center justify-between bg-muted/20">
              <p className="text-sm text-muted-foreground">
                {cssContent.length} characters • {cssContent.split('\n').length} lines
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
