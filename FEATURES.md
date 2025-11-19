# New Features in GistLens

This document describes the new features added to GistLens.

## 1. Telemetry System

GistLens now includes an optional, privacy-focused telemetry system powered by PostHog.

### Features
- **Opt-in analytics**: Users can enable/disable telemetry in settings
- **Privacy-focused**: No session recording, manual event tracking only
- **Custom PostHog instance**: Support for custom PostHog API keys
- **Comprehensive tracking**: Tracks major user interactions including:
  - Gist views and searches
  - File downloads and code copying
  - Theme toggles and preview mode
  - Share actions (native share, clipboard, social media)
  - Settings changes
  - User gist browsing
  - Featured gist interactions
  - History navigation

### Configuration

To enable telemetry:
1. Open Settings (gear icon in top right)
2. Scroll to "Analytics & Telemetry" section
3. Toggle "Enable Telemetry"
4. (Optional) Provide your PostHog API key for custom tracking

### Privacy

- Telemetry is **disabled by default**
- All tracking is done client-side
- No personally identifiable information is collected
- No session recording
- Users have full control via settings

## 2. GitHub Authentication

Authenticate with GitHub to access private gists and manage your content.

### Features
- **GitHub OAuth integration**: Secure authentication flow
- **Private gist access**: View your private gists when authenticated
- **User profile**: Display authenticated user info with avatar
- **Token-based auth**: Manual token entry for development/testing
- **API methods** for:
  - Fetching private gists
  - Creating new gists
  - Updating existing gists
  - Deleting gists
  - Starring/unstarring gists

### How to Authenticate

#### Option 1: Manual Token (Recommended for now)
1. Click "Sign in with GitHub" button in header
2. Create a Personal Access Token on GitHub:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Click "Generate new token (classic)"
   - Select scope: `gist`
   - Copy the generated token
3. Paste the token in the dialog
4. Click "Authenticate"

#### Option 2: OAuth Flow (Requires Backend)
The OAuth flow requires a backend proxy to exchange the authorization code for an access token securely. This is because GitHub doesn't support CORS for the token endpoint, and we cannot expose the client secret in the frontend.

**OAuth Configuration:**
- Client ID: `Ov23liI0dV9Eyrz71PPu`
- Callback URL: `https://gistlens.w4w.dev/auth/github/callback`
- Scopes: `gist`, `user:email`

To implement the OAuth flow, you'll need to:
1. Set up a backend endpoint (e.g., `/api/github/callback`)
2. Exchange the authorization code for an access token using the client secret
3. Return the access token to the frontend
4. The frontend will store it securely in localStorage

### Security Notes
- Tokens are stored in localStorage (secure in HTTPS)
- Tokens are validated on load
- Invalid tokens are automatically cleared
- User can logout anytime to clear tokens

## 3. Custom Stylesheets

Customize the appearance of GistLens with custom CSS.

### Features
- **Multiple style targets**: Apply styles to different parts of the app
  - App: Global application styles
  - Markdown: Markdown renderer styles
  - Code Blocks: Code syntax highlighting styles
  - MDX: MDX content styles
  - RST: reStructuredText styles
  - JSX: JSX preview styles
- **Live editor**: Edit CSS with syntax highlighting
- **Templates**: Pre-built style templates for quick customization
- **Import/Export**: Save and share custom stylesheets
- **Enable/Disable**: Toggle styles on/off per target
- **Auto-apply**: Styles persist across sessions

### How to Use

1. Open Settings (gear icon)
2. Scroll to "Custom Styles" section
3. Click "Open Style Editor"
4. Select a target from the sidebar (e.g., "Markdown")
5. Write or paste your CSS
6. Toggle "Enabled" to activate
7. Click "Save Changes"

### Example: Custom Markdown Styles

```css
/* Make headings colorful */
h1, h2, h3 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Larger code blocks */
code {
  font-size: 1.1rem;
  padding: 0.2rem 0.4rem;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
```

### Templates

The editor includes several built-in templates:
- **Dark Code Theme**: Darker theme for code blocks
- **Large Text**: Increase text size for better readability
- **Custom Font**: Use custom monospace fonts
- **Colorful Headings**: Add gradient colors to headings

### Import/Export

- **Export**: Save all custom styles as a JSON file
- **Import**: Load custom styles from a JSON file
- Great for sharing configurations or backing up your styles

## 4. Enhanced Settings

The settings dialog has been expanded with new options:

### New Settings Sections

1. **Custom Styles**
   - Quick access to style editor
   - Visual indicator for enabled styles

2. **Analytics & Telemetry**
   - Enable/disable telemetry
   - Configure custom PostHog API key
   - Privacy information and controls

### Existing Settings (Enhanced)

- **Appearance**: Theme, font size
- **Editor**: Line numbers, syntax highlighting, line wrapping
- **Behavior**: Auto-preview, animations, compact mode, history limit

## Integration Points

All new features are seamlessly integrated into the existing UI:

- **Header**: GitHub auth button next to settings
- **Settings Dialog**: New sections for telemetry and custom styles
- **Gist Fetching**: Automatically uses authenticated API when logged in
- **Event Tracking**: Non-intrusive telemetry throughout the app

## Technical Details

### Dependencies Added
- `posthog-js`: Analytics and telemetry library

### New Files
- `src/lib/telemetry.ts`: Telemetry service
- `src/lib/github-auth.ts`: GitHub authentication service
- `src/lib/custom-styles.ts`: Custom stylesheet manager
- `src/components/GitHubAuth.tsx`: GitHub login/profile UI
- `src/components/CustomStyleEditor.tsx`: Style editor UI

### Modified Files
- `src/App.tsx`: Integrated all new features
- `src/components/SettingsDialog.tsx`: Added new settings sections

## Future Enhancements

Potential improvements for future releases:

1. **Telemetry**: 
   - More granular event tracking
   - Analytics dashboard
   - A/B testing support

2. **GitHub Auth**:
   - Backend proxy for OAuth flow
   - GitHub organization support
   - Collaborative gist editing

3. **Custom Styles**:
   - CSS preprocessor support (SCSS, Less)
   - Theme marketplace
   - Visual style builder
   - Per-language code themes

4. **Settings**:
   - Keyboard shortcut customization
   - Cloud sync for settings
   - Profile presets

## Support

For issues or questions about these features:
- Check the GitHub Issues page
- Review inline help text in the app
- Consult the main README.md

---

**Note**: All features respect user privacy and provide transparent opt-in/opt-out controls.
