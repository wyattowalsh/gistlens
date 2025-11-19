# Local Development Guide

Complete guide for setting up and running GistLens locally with Next.js 15, PostgreSQL, and Auth.js.

## Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **PostgreSQL** 14.x or higher (or use a cloud provider)
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/wyattowalsh/gistlens.git
cd gistlens
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database - Choose one of the options below
POSTGRES_URL="postgresql://user:password@localhost:5432/gistlens"
POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/gistlens?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgresql://user:password@localhost:5432/gistlens"

# Auth.js (Auth.js v5)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

# GitHub OAuth
GITHUB_CLIENT_ID="Ov23liI0dV9Eyrz71PPu"
GITHUB_CLIENT_SECRET="d069f942ee3a3fce42622fc740a10148aba80b6a"
GITHUB_REDIRECT_URI="http://localhost:3000/api/auth/callback/github"

# PostHog (Optional - for telemetry)
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set Up Database

#### Option A: Local PostgreSQL

**Install PostgreSQL** (if not already installed):

**macOS (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

**Create database:**
```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE gistlens;
CREATE USER gistlens_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE gistlens TO gistlens_user;
\q
```

**Run database schema:**
```bash
psql postgresql://gistlens_user:your_password@localhost:5432/gistlens -f lib/db/schema.sql
```

#### Option B: Vercel Postgres (Cloud)

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Create a new project or select existing one
3. Go to Storage tab → Create Database → Postgres
4. Copy the connection strings to your `.env.local`
5. Run schema from Vercel dashboard SQL editor or locally:
   ```bash
   psql $POSTGRES_URL -f lib/db/schema.sql
   ```

#### Option C: Supabase (Cloud)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Project Settings → Database
4. Copy connection string (session mode)
5. Update `.env.local` with Supabase URL
6. Run schema in SQL Editor or locally:
   ```bash
   psql $POSTGRES_URL -f lib/db/schema.sql
   ```

#### Option D: Docker (Quick Local Setup)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: gistlens
      POSTGRES_USER: gistlens_user
      POSTGRES_PASSWORD: gistlens_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./lib/db/schema.sql:/docker-entrypoint-initdb.d/schema.sql

volumes:
  postgres_data:
```

Start database:
```bash
docker-compose up -d
```

Connection string:
```
POSTGRES_URL="postgresql://gistlens_user:gistlens_password@localhost:5432/gistlens"
```

### 5. Generate Auth.js Secret

Generate a secure random secret for Auth.js session encryption:

```bash
openssl rand -base64 32
```

Copy the output and set it as `NEXTAUTH_SECRET` in `.env.local`.

### 6. Set Up GitHub OAuth App

To test authentication locally:

1. Go to [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name:** GistLens Local Dev
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy **Client ID** and generate a **Client Secret**
6. Update `.env.local` with your local OAuth credentials

**Note:** For production, use the credentials provided in `.env.example`.

### 7. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Development Workflow

### Directory Structure

```
gistlens/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Auth.js endpoints
│   │   └── github/       # GitHub API proxies
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Homepage
│   └── globals.css       # Global styles
├── lib/                   # Shared libraries
│   ├── auth/             # Auth.js configuration
│   └── db/               # Database operations
├── components/            # React components (to be migrated)
├── types/                # TypeScript type definitions
├── public/               # Static assets
└── docs/                 # Documentation site (optional)
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking

# Database
psql $POSTGRES_URL -f lib/db/schema.sql  # Run migrations
```

### Hot Reload

Next.js has Fast Refresh enabled by default:
- Edit `.tsx` files and see changes instantly
- Server Components refresh automatically
- Client Components preserve state when possible

### Debugging

**VS Code Launch Configuration** (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

**Browser DevTools:**
- React DevTools extension for React 19
- Network tab to inspect API calls
- Application tab to check localStorage/session

### Environment-Specific Configuration

**Development (`.env.local`):**
```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Production (`.env.production`):**
```env
NODE_ENV=production
NEXTAUTH_URL=https://gistlens.w4w.dev
NEXT_PUBLIC_APP_URL=https://gistlens.w4w.dev
```

## Testing

### Manual Testing Checklist

- [ ] Home page loads correctly
- [ ] GitHub OAuth sign-in works
- [ ] User is created in database on first login
- [ ] Session persists across page refreshes
- [ ] API routes require authentication where needed
- [ ] Public gist fetching works without auth
- [ ] Private gist fetching works with auth
- [ ] Sign out clears session

### Database Verification

Check if tables were created:

```bash
psql $POSTGRES_URL -c "\dt"
```

Expected output:
```
                List of relations
 Schema |        Name         | Type  |     Owner      
--------+---------------------+-------+----------------
 public | accounts            | table | gistlens_user
 public | custom_styles       | table | gistlens_user
 public | gist_history        | table | gistlens_user
 public | sessions            | table | gistlens_user
 public | user_settings       | table | gistlens_user
 public | users               | table | gistlens_user
 public | verification_tokens | table | gistlens_user
```

Check user data:

```bash
psql $POSTGRES_URL -c "SELECT id, github_username, email FROM users;"
```

### API Endpoint Testing

**Test public gist fetch:**
```bash
curl http://localhost:3000/api/github/gist/1234567890abcdef
```

**Test authenticated endpoint** (requires session cookie):
```bash
# Sign in first through browser, then:
curl -H "Cookie: next-auth.session-token=..." \
  http://localhost:3000/api/github/gists
```

## Common Issues

### Port Already in Use

If port 3000 is already in use:

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or run on a different port
PORT=3001 npm run dev
```

### Database Connection Issues

**Error: "password authentication failed"**
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env.local`
- Ensure user has correct permissions

**Error: "database does not exist"**
- Create database: `createdb gistlens`
- Run schema: `psql $POSTGRES_URL -f lib/db/schema.sql`

### Auth.js Issues

**Error: "MissingSecret"**
- Generate secret: `openssl rand -base64 32`
- Set `NEXTAUTH_SECRET` in `.env.local`

**Error: "OAuthCallback redirect mismatch"**
- Check GitHub OAuth app callback URL matches your `NEXTAUTH_URL`
- For local dev, use: `http://localhost:3000/api/auth/callback/github`

### Module Resolution Issues

**Error: "Cannot find module '@/...'"**
- Check `tsconfig.json` paths configuration
- Restart TypeScript server in IDE
- Clear `.next` cache: `rm -rf .next`

## Performance Optimization

### Development Mode

Next.js development mode includes:
- Fast Refresh for instant updates
- Source maps for debugging
- Detailed error messages
- No optimization (slower, but better DX)

### Production Build

Before deploying, always test production build locally:

```bash
npm run build
npm run start
```

Production mode includes:
- Code minification
- Dead code elimination
- Image optimization
- Route pre-rendering where possible

### Database Optimization

For better local development performance:

```sql
-- Add indexes if not already present (from schema.sql)
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_gist_history_user_id ON gist_history(user_id);
```

## IDE Setup

### VS Code Extensions

Recommended extensions for development:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "usernamehw.errorlens"
  ]
}
```

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Contributing

### Before Committing

1. Run linter: `npm run lint`
2. Check types: `npm run type-check`
3. Test build: `npm run build`
4. Test locally: `npm run dev`

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Troubleshooting

### Clear All Caches

If you encounter strange issues:

```bash
# Remove all build artifacts and caches
rm -rf .next
rm -rf node_modules
rm -rf .turbo

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

### Reset Database

To start fresh with a clean database:

```bash
# Drop and recreate database
psql postgres -c "DROP DATABASE IF EXISTS gistlens;"
psql postgres -c "CREATE DATABASE gistlens;"

# Run schema
psql $POSTGRES_URL -f lib/db/schema.sql
```

### Check Logs

**Next.js logs:**
Check terminal where `npm run dev` is running

**Database logs:**
```bash
# PostgreSQL logs location varies by OS
# macOS (Homebrew):
tail -f /usr/local/var/log/postgres.log

# Linux:
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

## Next Steps

1. **Build Application Features** - Implement gist viewing, browsing, and management
2. **Add Tests** - Set up Jest and React Testing Library
3. **CI/CD Active** - GitHub Actions workflows already configured
4. **Deploy to Vercel** - Follow deployment guide in documentation

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Auth.js Documentation](https://authjs.dev)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [React 19 Documentation](https://react.dev)

---

For production deployment instructions, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
