#!/bin/bash
# Setup script for Supabase integration
# This script helps you set up the database schema on your Supabase project

set -e

echo "🚀 GistLens Supabase Setup"
echo "=========================="
echo ""
echo "Project: bgnptdxskntypobizwiv"
echo "URL: https://bgnptdxskntypobizwiv.supabase.co"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found."
    echo ""
    echo "📦 Please install it first:"
    echo "   npm install -g supabase"
    echo ""
    echo "Or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if already linked
if [ -f ".git/config" ]; then
    echo "📂 Project directory confirmed"
else
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "🔗 Linking to your Supabase project..."
echo ""
echo "When prompted, use project ref: bgnptdxskntypobizwiv"
echo ""

# Link the project
supabase link --project-ref bgnptdxskntypobizwiv

echo ""
echo "📊 Running database migrations..."
echo ""

# Push the migrations
supabase db push

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Verify tables at: https://app.supabase.com/project/bgnptdxskntypobizwiv/editor"
echo "2. Check real-time: https://app.supabase.com/project/bgnptdxskntypobizwiv/database/replication"
echo "3. Run: npm install"
echo "4. Run: npm run dev"
echo ""
echo "🎉 Your GistLens is ready to use with Supabase!"
