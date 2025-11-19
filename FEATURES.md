# 🚀 GistLens v2.0 - New Features

This document describes the new features added to GistLens v2.0 as part of the latest enhancement.

## 🔥 Supabase Integration (Latest)

GistLens now features a complete integration with Supabase, the modern open-source Firebase alternative, bringing enterprise-grade features and best practices to the application.

### Why Supabase?

Supabase provides several key advantages:
- **Real-time Database**: Live data synchronization via WebSockets
- **Row Level Security (RLS)**: Database-level security policies for data protection
- **Built-in Auth**: Secure authentication with multiple OAuth providers
- **Edge Functions**: Serverless functions at the edge for low latency
- **Storage**: S3-compatible file storage with CDN delivery
- **Vector Database**: pgvector support for AI/ML applications
- **Type Safety**: Excellent TypeScript support and developer experience

### Features Included

#### 1. Server-Side Rendering (SSR) Support
- `@supabase/ssr` package for Next.js 15 compatibility
- Separate client implementations for browser, server, and middleware contexts
- Proper cookie-based session management
- Automatic token refresh via middleware

#### 2. Row Level Security (RLS)
Complete security policies implemented for all tables:
- **Users**: Can only view/update their own profile
- **Settings**: Per-user isolation with automatic enforcement
- **Gist History**: Full CRUD operations only for own history
- **Custom Styles**: Secure style management per user
- **Sessions & Accounts**: Secure OAuth token storage

Benefits:
- Security enforced at the database level
- Even application bugs can't bypass security
- Performance optimized (policies applied in database)
- Real-time subscriptions automatically respect RLS

#### 3. Real-time Subscriptions
Live data updates across browser tabs and devices:
- **Gist History**: Instantly see when gists are viewed
- **User Settings**: Sync settings changes across all sessions
- **Custom Styles**: Live updates when styles are modified
- Generic subscription helper for any table

Example usage:
```typescript
import { subscribeToGistHistory } from '@/lib/supabase/realtime';

const channel = subscribeToGistHistory(
  supabase,
  userId,
  (newGist) => console.log('New gist!', newGist),
  (updated) => console.log('Updated!', updated),
  (deleted) => console.log('Deleted!', deleted)
);

// Cleanup when done
channel.unsubscribe();
```

#### 4. Type-Safe Database Operations
Full TypeScript support throughout:
- Database schema types for all tables
- Row, Insert, and Update types for each table
- Type-safe queries with autocomplete
- Compile-time error checking

Example:
```typescript
import type { GistHistory, UserSettings } from '@/types/supabase';

const { data } = await supabase
  .from('gist_history')
  .select('*')
  .eq('user_id', userId);
// data is properly typed as GistHistory[]
```

#### 5. Database Schema
Complete PostgreSQL schema with:
- All existing tables (users, sessions, accounts, etc.)
- Automatic timestamp triggers (updated_at)
- Proper indexes for performance
- Foreign key constraints
- Unique constraints
- Real-time publication setup

#### 6. Migration Support
Seamless migration from Vercel Postgres:
- Same API surface for database operations
- Both implementations available (`lib/db/index.ts` and `lib/db/supabase.ts`)
- Easy to switch with environment variables
- Data migration tools and instructions

### Setup

See the comprehensive [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md) for:
- Step-by-step setup instructions
- Architecture overview
- Best practices
- Real-time usage examples
- Troubleshooting guide
- Migration from Vercel Postgres

Quick start:
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Add credentials to `.env.local`
3. Run migrations in SQL Editor
4. Start using Supabase features!

### Documentation

Extensive documentation includes:
- **SUPABASE_GUIDE.md**: 10,000+ word comprehensive guide
- **examples/supabase/**: Working example components
- **Type definitions**: Complete TypeScript types in `types/supabase.ts`
- **Real-time helpers**: Documented subscription functions

### Performance & Scalability

Supabase provides:
- Connection pooling for high traffic
- Edge network for low latency
- Automatic scaling
- Built-in caching
- Efficient query optimization
- Real-time at scale (uses PostgreSQL replication)

### Future Enhancements

Potential features enabled by Supabase:
- **Storage Integration**: File uploads for gist attachments
- **Edge Functions**: Custom API endpoints at the edge
- **Vector Search**: AI-powered semantic gist search with pgvector
- **Real-time Collaboration**: Live gist editing across users
- **Webhooks**: Integrate with external services
- **Database Functions**: Complex queries as stored procedures

## 🎭 Configurable Icon Sets

GistLens now supports multiple icon set styles that users can choose from based on their preference.

### Available Icon Sets

1. **Lucide (Default)** - Modern, clean icons from the Lucide icon library
2. **Material Design** - Google's Material Design style icons
3. **Minimal** - Simple, unified icon style for a cleaner look

### Icon Set Configuration

Users can change their icon set preference in the Settings dialog:
1. Open Settings (gear icon)
2. Navigate to the "Appearance" section
3. Select your preferred icon set from the dropdown
4. Save changes

The icon set preference is automatically:
- Saved to localStorage for immediate persistence
- Synced to the server for authenticated users
- Applied across all file type indicators

### Technical Details

Icon sets are defined in `lib/iconSets.ts` and include icons for:
- Markdown files
- Image files
- Video files
- Audio files
- Data files (CSV, JSON, etc.)
- PDF files
- Code files
- Graph/RDF files

## 🕸️ Knowledge Graph Explorer

GistLens now includes a powerful knowledge graph visualization feature that supports multiple semantic web formats.

### Supported Graph Formats

- **Turtle** (.ttl, .turtle)
- **RDF/XML** (.rdf)
- **JSON-LD** (.jsonld)
- **N3** (.n3)
- **N-Triples** (.nt)
- **N-Quads** (.nq)
- **TriG** (.trig)
- **OWL** (.owl)

### Visualization Modes

#### 2D Mode
- Force-directed graph layout
- Interactive pan and zoom
- Node dragging for custom layouts
- Hover to see node labels
- Click nodes and edges for details

#### 3D Mode
- Immersive 3D graph exploration
- Mouse/touch controls for rotation
- Camera controls for navigation
- Depth perception for complex graphs
- Full 360° viewing angle

### Features

1. **Smart Parsing** - Automatically detects and parses graph formats
2. **Type-based Coloring** - Visual distinction between:
   - Subjects (blue)
   - Objects (purple)
   - Literals (green)
3. **URI Shortening** - Common prefixes (rdf:, rdfs:, foaf:, etc.) are shortened for readability
4. **Node Sizing** - Nodes are sized based on their importance/connections
5. **Fullscreen Mode** - Expand graphs to fill the screen for detailed exploration
6. **Export** - Download the original graph file

### Usage

When viewing a gist containing a graph file:
1. The GraphViewer component automatically activates
2. Choose between 2D or 3D visualization modes
3. Interact with the graph:
   - Drag nodes to reposition
   - Zoom in/out for detail
   - Click nodes to inspect
4. Toggle fullscreen for better viewing
5. Download the original file if needed

### Technical Implementation

- **Parsing**: Uses N3.js for Turtle/N3/N-Triples parsing and jsonld.js for JSON-LD
- **Visualization**: Built on react-force-graph-2d and react-force-graph-3d
- **Performance**: Optimized for graphs with hundreds of nodes and thousands of edges

## 💾 Intelligent Settings Persistence

Settings are now persisted intelligently with a hybrid approach combining server-side storage and local caching.

### How It Works

1. **For Authenticated Users**:
   - Settings are saved to PostgreSQL database
   - Also cached in localStorage for offline access
   - Automatic sync on settings change
   - Settings persist across devices

2. **For Non-Authenticated Users**:
   - Settings stored in localStorage
   - Persists across browser sessions
   - No server sync (privacy-focused)

### Settings Sync Flow

```
User Changes Settings
         ↓
Save to localStorage (immediate)
         ↓
If Authenticated → Save to Server (async)
         ↓
Success → Track telemetry event
```

### Available Settings

All user preferences are persisted including:
- Theme (light/dark/system)
- Icon set preference
- Font size
- Syntax highlighting
- Line numbers
- Auto-preview markdown
- Compact mode
- Animations
- Line wrapping
- History limit
- Telemetry preferences

### API Endpoints

- `GET /api/settings` - Retrieve user settings
- `POST /api/settings` - Save user settings

### Database Schema

Settings are stored in the `user_settings` table with the following fields:
```sql
CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY,
  telemetry_enabled BOOLEAN DEFAULT false,
  auto_preview_markdown BOOLEAN DEFAULT true,
  default_theme TEXT DEFAULT 'dark',
  show_line_numbers BOOLEAN DEFAULT true,
  font_size TEXT DEFAULT 'medium',
  enable_syntax_highlighting BOOLEAN DEFAULT true,
  auto_load_gists BOOLEAN DEFAULT true,
  history_limit INTEGER DEFAULT 10,
  compact_mode BOOLEAN DEFAULT false,
  enable_animations BOOLEAN DEFAULT true,
  wrap_long_lines BOOLEAN DEFAULT false,
  icon_set TEXT DEFAULT 'lucide',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Migration

For existing databases, run the migration:
```bash
psql $POSTGRES_URL -f lib/db/migrations/001_add_icon_set.sql
```

## 📊 Enhanced Telemetry

Comprehensive usage tracking has been added to help improve GistLens while respecting user privacy.

### New Telemetry Events

1. **Icon Set Events**
   - `icon_set_change` - When user changes icon set preference

2. **Graph Viewer Events**
   - `graph_view` - When a graph file is viewed (includes node/edge counts)
   - `graph_view_mode_toggle` - When switching between 2D/3D
   - `graph_node_click` - When a node is clicked
   - `graph_fullscreen_toggle` - When fullscreen is toggled

3. **Settings Persistence Events**
   - `settings_sync_success` - When settings sync to server succeeds
   - `settings_sync_failure` - When settings sync fails
   - `settings_load` - When settings are loaded (source: server/localStorage)

### Privacy Features

- Telemetry is **opt-in** (disabled by default)
- No personal information is collected
- Session recording is disabled
- Anonymous tracking only
- User can disable at any time
- Uses PostHog for analytics (optional)

### Configuration

Users can configure telemetry in Settings:
1. Toggle "Enable Telemetry"
2. Optionally provide custom PostHog API key
3. Settings are persisted per user

## 🛠️ Technical Architecture

### Component Hierarchy

```
FileRenderer (new)
├── MarkdownRenderer
├── ImageViewer
├── VideoPlayer
├── AudioPlayer
├── DataViewer
├── GraphViewer (new)
└── PDFViewer
```

### Module Organization

```
lib/
├── fileTypes.ts (updated - added graph formats)
├── iconSets.ts (new - icon configuration)
├── settings.ts (new - settings persistence)
├── telemetry.ts (updated - new events)
└── db/
    ├── schema.sql (updated - icon_set field)
    └── migrations/
        └── 001_add_icon_set.sql (new)
```

### Dependencies Added

- `react-force-graph-2d` - 2D graph visualization
- `react-force-graph-3d` - 3D graph visualization
- `three` - 3D rendering engine
- `n3` - RDF/Turtle parser
- `jsonld` - JSON-LD processor
- `@types/n3` - TypeScript definitions

## 📈 Performance Considerations

1. **Graph Viewer**
   - Dynamic imports for graph components (code splitting)
   - SSR disabled for graph libraries (client-only)
   - Efficient force simulation algorithms
   - Throttled rendering for large graphs

2. **Settings Persistence**
   - Async server sync (non-blocking)
   - Immediate localStorage updates
   - Cached settings prevent redundant loads
   - Optimistic UI updates

3. **Telemetry**
   - Minimal overhead (event queuing)
   - Batched event sending
   - No impact on user experience
   - Optional and easily disabled

## 🚀 Future Enhancements

Potential future improvements:
- Additional icon set themes
- Graph filtering and search
- Graph export to various formats (PNG, SVG, GraphML)
- Settings import/export
- Advanced graph analytics
- Custom telemetry dashboards
- Graph editing capabilities

## 📝 Migration Guide

### For Existing Users

1. **Update Dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Update Database** (if using PostgreSQL):
   ```bash
   psql $POSTGRES_URL -f lib/db/migrations/001_add_icon_set.sql
   ```

3. **Rebuild Application**:
   ```bash
   npm run build
   # or
   pnpm build
   ```

### For New Installations

Follow the standard installation process in README.md - all new features are included by default.

## 🤝 Contributing

To contribute to these features:
1. Review the code in the respective modules
2. Test with sample graph files
3. Submit PRs with improvements
4. Report bugs or suggest enhancements

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Force Graph Documentation](https://github.com/vasturiano/react-force-graph)
- [N3.js Documentation](https://github.com/rdfjs/N3.js)
- [PostHog Documentation](https://posthog.com/docs)
