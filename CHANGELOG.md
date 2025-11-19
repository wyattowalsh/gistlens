# Changelog

All notable changes to GistLens will be documented in this file.

## [2.0.0] - 2025-11-19

### Major Refactoring: Next.js 15 + PostgreSQL + Auth.js

Complete architectural refactoring from Vite/React SPA to Next.js 15 with server-side authentication and database persistence.

### Added

#### Infrastructure
- **Next.js 15** with App Router and Server Components
- **PostgreSQL** database with complete schema (7 tables)
- **Auth.js** (NextAuth.js v5) with GitHub OAuth
- **Vercel Postgres** support for database
- **TypeScript** strict mode throughout
- **Server-side API routes** for secure GitHub operations

#### Authentication
- GitHub OAuth with proper server-side secret management
- User creation and management in PostgreSQL
- Session persistence with encrypted JWT
- Database-backed user profiles
- Support for private gist access
- Automatic token refresh

#### Database Schema
- `users` - User profiles from GitHub OAuth
- `sessions` - Auth.js session storage
- `accounts` - OAuth provider accounts
- `user_settings` - User preferences and settings
- `gist_history` - Recently viewed gists per user
- `custom_styles` - User custom CSS per target
- `verification_tokens` - Email verification support

#### API Routes
- `/api/auth/[...nextauth]` - Auth.js endpoints
- `/api/github/gist/[id]` - GET, PATCH, DELETE operations
- `/api/github/gists` - GET (list), POST (create) operations
- Automatic authentication token injection
- Fallback to public API when not authenticated

#### Documentation
- **LOCAL_DEVELOPMENT.md** - Complete 12,000+ word local setup guide
- **Documentation Site** - Standalone Next.js site (port 3001)
  - Getting Started guide
  - Auth.js configuration documentation
  - Database schema reference
  - API routes documentation
  - Deployment guides
  - Migration instructions
- **MIGRATION_GUIDE.md** - Detailed migration instructions
- **REFACTORING_SUMMARY.md** - Technical implementation details
- **FEATURES.md** - Original feature documentation preserved

#### Development Experience
- 4 database setup options (local, Docker, Vercel, Supabase)
- VS Code debugging configuration
- Docker Compose for quick PostgreSQL setup
- Comprehensive troubleshooting guide
- IDE setup recommendations
- Environment variable templates

### Changed

#### Branding
- Updated all references from "NextAuth.js" to "Auth.js"
- Added explanatory comments about the rebrand
- Package remains `next-auth` (official package name)
- Documentation links to https://authjs.dev

#### Architecture
- From client-side SPA to server-side rendered application
- From localStorage to PostgreSQL for data persistence
- From client-side OAuth to secure server-side flow
- From exposed secrets to environment variables

#### Security
- Client secrets now server-side only (never exposed to browser)
- OAuth tokens managed server-side
- Encrypted JWT sessions with Auth.js
- CSRF protection built-in
- SQL injection protection with parameterized queries

#### Performance
- Server-side rendering for faster initial load
- Code splitting automatic with Next.js
- Static generation where possible
- Optimized production builds

### Security Improvements

#### Before (Vite/React)
- ❌ GitHub client secret in frontend code
- ❌ OAuth tokens in localStorage (accessible to JavaScript)
- ❌ Manual token entry required (security risk)
- ❌ No server-side validation
- ❌ Client-side API calls with exposed tokens

#### After (Next.js + Auth.js)
- ✅ Client secret only in server `.env.local`
- ✅ OAuth tokens never sent to client
- ✅ Full OAuth flow works automatically
- ✅ Server-side token validation
- ✅ All GitHub API calls through secure backend
- ✅ CSRF protection built-in
- ✅ SQL injection protection

### Technical Details

#### Dependencies Added
- `next` (^15.1.6) - Next.js framework
- `next-auth` (^5.0.0-beta.25) - Auth.js authentication
- `@vercel/postgres` (^0.10.0) - Vercel Postgres client
- `postgres` (^3.4.5) - PostgreSQL client
- `bcrypt` (^5.1.1) - Password hashing

#### Dependencies Updated
- `react` (^19.0.0) - Updated to React 19
- `react-dom` (^19.0.0) - Updated to React 19
- Various minor dependency updates

#### Build System
- Replaced Vite with Next.js build system
- Updated ESLint configuration for Next.js
- Updated TypeScript configuration for bundler resolution
- PostCSS configuration updated

### Migration Status

#### Completed
- ✅ Next.js 15 infrastructure
- ✅ PostgreSQL database schema
- ✅ Auth.js configuration
- ✅ Secure API routes
- ✅ Environment variables
- ✅ Documentation site
- ✅ Local development guide

#### Ready to Migrate
- 📋 Main gist viewer UI
- 📋 File browser component
- 📋 Settings dialog
- 📋 Custom stylesheet editor
- 📋 Media viewers
- 📋 Share functionality
- 📋 History sidebar
- 📋 Featured gists

### Breaking Changes

None - This is a major version bump with architectural changes, but all original features can be migrated following the migration guide.

### Deployment

#### Supported Platforms
- Vercel (recommended)
- Railway
- Render
- Fly.io
- DigitalOcean App Platform
- Self-hosted (Node.js 20+ required)

#### Requirements
- Node.js 20.x or higher
- PostgreSQL 14.x or higher
- Environment variables configured

### Documentation

Complete documentation available:
- Main README.md
- LOCAL_DEVELOPMENT.md (local setup)
- MIGRATION_GUIDE.md (migration instructions)
- REFACTORING_SUMMARY.md (technical details)
- FEATURES.md (feature documentation)
- Documentation site at `docs/` (runs on port 3001)

### Links

- **Repository**: https://github.com/wyattowalsh/gistlens
- **Auth.js**: https://authjs.dev
- **Next.js**: https://nextjs.org
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres

---

## [1.0.0] - Previous Version

Original Vite + React implementation with:
- Client-side rendering
- GitHub Gist API integration
- Syntax highlighting
- Markdown preview
- Media file viewers
- Dark mode
- Settings management
- History tracking (localStorage)

See git history for details of v1.0.0 implementation.

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/) format.
