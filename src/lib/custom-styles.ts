/**
 * Custom Stylesheet Manager
 * Allows users to apply custom CSS to the app and renderers
 */

import { telemetry } from './telemetry';

export type StyleTarget = 
  | 'app'           // Main application styles
  | 'markdown'      // Markdown renderer
  | 'code'          // Code blocks
  | 'mdx'           // MDX renderer
  | 'rst'           // reStructuredText
  | 'jsx'           // JSX preview
  | 'all';          // All targets

interface CustomStyle {
  target: StyleTarget;
  css: string;
  enabled: boolean;
  lastModified: string;
}

interface CustomStylesStore {
  styles: Record<StyleTarget, CustomStyle>;
  version: number;
}

class CustomStylesManager {
  private store: CustomStylesStore;
  private styleElements: Map<StyleTarget, HTMLStyleElement> = new Map();
  private initialized = false;

  constructor() {
    this.store = this.loadStore();
    this.init();
  }

  /**
   * Initialize custom styles
   */
  private init() {
    if (this.initialized) return;

    // Apply all enabled custom styles
    Object.entries(this.store.styles).forEach(([target, style]) => {
      if (style.enabled && style.css) {
        this.applyStyle(target as StyleTarget, style.css);
      }
    });

    this.initialized = true;
  }

  /**
   * Load styles from localStorage
   */
  private loadStore(): CustomStylesStore {
    const saved = localStorage.getItem('gistlens-custom-styles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('[Custom Styles] Failed to load store:', error);
      }
    }

    // Return default empty store
    return {
      version: 1,
      styles: {
        app: { target: 'app', css: '', enabled: false, lastModified: new Date().toISOString() },
        markdown: { target: 'markdown', css: '', enabled: false, lastModified: new Date().toISOString() },
        code: { target: 'code', css: '', enabled: false, lastModified: new Date().toISOString() },
        mdx: { target: 'mdx', css: '', enabled: false, lastModified: new Date().toISOString() },
        rst: { target: 'rst', css: '', enabled: false, lastModified: new Date().toISOString() },
        jsx: { target: 'jsx', css: '', enabled: false, lastModified: new Date().toISOString() },
        all: { target: 'all', css: '', enabled: false, lastModified: new Date().toISOString() },
      },
    };
  }

  /**
   * Save store to localStorage
   */
  private saveStore() {
    localStorage.setItem('gistlens-custom-styles', JSON.stringify(this.store));
  }

  /**
   * Get all custom styles
   */
  getAll(): Record<StyleTarget, CustomStyle> {
    return { ...this.store.styles };
  }

  /**
   * Get custom style for a specific target
   */
  get(target: StyleTarget): CustomStyle | null {
    return this.store.styles[target] || null;
  }

  /**
   * Set custom style for a target
   */
  set(target: StyleTarget, css: string, enabled: boolean = true) {
    this.store.styles[target] = {
      target,
      css,
      enabled,
      lastModified: new Date().toISOString(),
    };

    this.saveStore();

    // Apply if enabled
    if (enabled) {
      this.applyStyle(target, css);
      telemetry.trackCustomStylesheetEdit(target);
    } else {
      this.removeStyle(target);
    }
  }

  /**
   * Enable/disable custom style for a target
   */
  setEnabled(target: StyleTarget, enabled: boolean) {
    const style = this.store.styles[target];
    if (!style) return;

    style.enabled = enabled;
    this.saveStore();

    if (enabled && style.css) {
      this.applyStyle(target, style.css);
      telemetry.trackCustomStylesheetApply(target);
    } else {
      this.removeStyle(target);
    }
  }

  /**
   * Apply custom CSS to the document
   */
  private applyStyle(target: StyleTarget, css: string) {
    // Remove existing style element if any
    this.removeStyle(target);

    // Create new style element
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-custom-style', target);
    styleEl.textContent = this.wrapCSS(target, css);
    document.head.appendChild(styleEl);

    // Store reference
    this.styleElements.set(target, styleEl);
  }

  /**
   * Remove custom style from document
   */
  private removeStyle(target: StyleTarget) {
    const styleEl = this.styleElements.get(target);
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
      this.styleElements.delete(target);
    }
  }

  /**
   * Wrap CSS with appropriate selectors based on target
   */
  private wrapCSS(target: StyleTarget, css: string): string {
    switch (target) {
      case 'app':
        // Apply to entire app
        return css;
      
      case 'markdown':
        // Apply to markdown renderer
        return `.markdown-renderer { ${css} }`;
      
      case 'code':
        // Apply to code blocks
        return `.code-block, pre code { ${css} }`;
      
      case 'mdx':
        // Apply to MDX content
        return `.mdx-content { ${css} }`;
      
      case 'rst':
        // Apply to RST content
        return `.rst-content { ${css} }`;
      
      case 'jsx':
        // Apply to JSX preview
        return `.jsx-preview { ${css} }`;
      
      case 'all':
        // Apply globally
        return `* { ${css} }`;
      
      default:
        return css;
    }
  }

  /**
   * Reset custom style for a target
   */
  reset(target: StyleTarget) {
    this.store.styles[target] = {
      target,
      css: '',
      enabled: false,
      lastModified: new Date().toISOString(),
    };

    this.saveStore();
    this.removeStyle(target);
    telemetry.trackCustomStylesheetReset(target);
  }

  /**
   * Reset all custom styles
   */
  resetAll() {
    Object.keys(this.store.styles).forEach(target => {
      this.reset(target as StyleTarget);
    });
  }

  /**
   * Export custom styles as JSON
   */
  export(): string {
    return JSON.stringify(this.store, null, 2);
  }

  /**
   * Import custom styles from JSON
   */
  import(json: string): boolean {
    try {
      const imported = JSON.parse(json) as CustomStylesStore;
      
      // Validate structure
      if (!imported.styles || typeof imported.styles !== 'object') {
        throw new Error('Invalid custom styles format');
      }

      this.store = imported;
      this.saveStore();

      // Re-apply all enabled styles
      Object.entries(this.store.styles).forEach(([target, style]) => {
        if (style.enabled && style.css) {
          this.applyStyle(target as StyleTarget, style.css);
        }
      });

      return true;
    } catch (error) {
      console.error('[Custom Styles] Failed to import:', error);
      return false;
    }
  }

  /**
   * Get predefined style templates
   */
  getTemplates(): Record<string, { name: string; description: string; css: string }> {
    return {
      'dark-code': {
        name: 'Dark Code Theme',
        description: 'A darker theme for code blocks',
        css: `
          background-color: #1a1a1a;
          color: #e0e0e0;
          border-radius: 8px;
          padding: 1rem;
        `,
      },
      'large-text': {
        name: 'Large Text',
        description: 'Increase text size for better readability',
        css: `
          font-size: 1.125rem;
          line-height: 1.75;
        `,
      },
      'custom-font': {
        name: 'Custom Font',
        description: 'Use a custom monospace font',
        css: `
          font-family: 'Fira Code', 'Consolas', monospace;
        `,
      },
      'colorful-headings': {
        name: 'Colorful Headings',
        description: 'Add gradient colors to markdown headings',
        css: `
          h1, h2, h3, h4, h5, h6 {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `,
      },
    };
  }
}

// Export singleton instance
export const customStyles = new CustomStylesManager();
