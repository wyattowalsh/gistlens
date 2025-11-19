# Configure Your Supabase Project

Thank you for providing your Supabase project details! To complete the integration, you need to get your **Supabase URL** and **Anon Key** instead of the PostgreSQL connection string.

## 🔑 Getting Your Credentials

Based on your connection string, your Supabase project reference is: `xltcajzbndxnbuaoeigc`

### Step 1: Get Your Supabase URL and Anon Key

1. Go to your Supabase Dashboard: https://app.supabase.com/project/xltcajzbndxnbuaoeigc
2. Click on **Settings** (gear icon in the sidebar)
3. Click on **API** in the settings menu
4. Copy the following values:
   - **Project URL**: `https://xltcajzbndxnbuaoeigc.supabase.co`
   - **Project API keys** → **anon/public key**: (long string starting with `eyJ...`)

### Step 2: Update Your `.env.local` File

Create or update `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://xltcajzbndxnbuaoeigc.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Auth.js (NextAuth.js v5)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GITHUB_REDIRECT_URI="http://localhost:3000/api/auth/callback/github"

# PostHog (Optional)
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Run Database Migrations

You need to run the database schema migration to set up the tables and Row Level Security policies.

#### Option A: Using Supabase Dashboard (Easiest)

1. Go to https://app.supabase.com/project/xltcajzbndxnbuaoeigc/editor
2. Click **SQL Editor** in the sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/20250119000000_initial_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref xltcajzbndxnbuaoeigc

# Push migrations
supabase db push
```

### Step 4: Verify Setup

After running migrations, verify the tables were created:

1. Go to https://app.supabase.com/project/xltcajzbndxnbuaoeigc/editor
2. Click **Table Editor** in the sidebar
3. You should see tables: `users`, `sessions`, `accounts`, `gist_history`, `user_settings`, `custom_styles`, `verification_tokens`

### Step 5: Enable Real-time (Optional)

For real-time features to work:

1. Go to https://app.supabase.com/project/xltcajzbndxnbuaoeigc/database/replication
2. Enable replication for the `gist_history` table (it should already be enabled by the migration)

### Step 6: Start Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit http://localhost:3000 and your app should now be connected to your Supabase project!

## 🔒 Security Notes

**IMPORTANT:**
- Never commit your `.env.local` file to git (it's already in `.gitignore`)
- The PostgreSQL connection string you provided contains your database password - keep it secure!
- Only use the Supabase URL and Anon Key in your application (they're safe for client-side use)
- The Anon Key has Row Level Security protecting your data

## 📚 Additional Resources

- **Complete Guide**: See [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md) for comprehensive documentation
- **Examples**: Check [examples/supabase/](./examples/supabase/) for usage examples
- **Quick Reference**: See [SUPABASE_INTEGRATION_SUMMARY.md](./SUPABASE_INTEGRATION_SUMMARY.md)

## 🆘 Need Help?

If you encounter any issues:

1. Check that your `.env.local` has the correct values
2. Verify migrations ran successfully in the Supabase dashboard
3. Check the browser console and terminal for error messages
4. Review the troubleshooting section in SUPABASE_GUIDE.md

## 🎯 What's Next?

Once configured, you'll have:
- ✅ Real-time database updates
- ✅ Row Level Security protecting your data
- ✅ Type-safe database operations
- ✅ Authentication with GitHub OAuth
- ✅ Cross-tab synchronization

Your GistLens instance will be fully integrated with Supabase!
