# Getting Started with GistLens Documentation

This documentation site provides comprehensive guides for developing, deploying, and extending GistLens.

## Accessing the Documentation

The documentation site runs separately from the main application and can be accessed in two ways:

### Option 1: Run Locally

```bash
# From the project root
cd docs
npm install
npm run dev
```

The docs will be available at [http://localhost:3001](http://localhost:3001)

### Option 2: View on GitHub

All documentation is also available as markdown files in the repository:
- [LOCAL_DEVELOPMENT.md](../LOCAL_DEVELOPMENT.md) - Complete local setup guide
- [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) - Migration instructions
- [REFACTORING_SUMMARY.md](../REFACTORING_SUMMARY.md) - Technical details

## Documentation Structure

### Getting Started
Complete guide for setting up your local development environment including:
- Prerequisites and installation
- Database setup (4 options: local, Docker, Vercel, Supabase)
- Environment configuration
- Running the development server

### Auth.js Setup
Detailed guide on authentication including:
- Architecture and authentication flow
- Configuration files explained
- Usage in Server and Client Components
- Security features
- Environment variables

### Database Schema
Documentation on the PostgreSQL database:
- Table structures
- Relationships
- Indexes
- Migration scripts

### API Routes
Reference for secure server-side API endpoints:
- GitHub gist operations
- Authentication requirements
- Request/response formats
- Error handling

### Deployment
Guides for deploying to various platforms:
- Vercel (recommended)
- Railway
- Self-hosted options
- Environment setup for production

### Migration Guide
Instructions for porting UI components from the original Vite/React app to Next.js.

## Running Both App and Docs

You can run the main application and documentation site simultaneously:

**Terminal 1 - Main Application:**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Documentation Site:**
```bash
cd docs
npm run dev
# Runs on http://localhost:3001
```

This allows you to reference the documentation while developing.

## Contributing to Documentation

To add or improve documentation:

1. Edit markdown files directly in the repository
2. Or add pages to the docs site in `docs/app/`
3. Follow the existing structure and formatting
4. Test locally before committing

## Features

- 📚 **Comprehensive**: Covers all aspects of development
- 🎨 **Dark Mode**: Matches the main application theme
- 🔍 **Searchable**: Easy navigation between topics
- 📱 **Responsive**: Works on all device sizes
- 🚀 **Fast**: Built with Next.js 15 for optimal performance

## Technology

The documentation site is built with:
- Next.js 15 (App Router)
- React 19
- Tailwind CSS
- TypeScript

It uses static site generation for fast loading and can be deployed independently of the main application.

## Need Help?

If you can't find what you're looking for:
1. Check the [LOCAL_DEVELOPMENT.md](../LOCAL_DEVELOPMENT.md) for detailed setup instructions
2. Review the inline code comments in the repository
3. Open an issue on GitHub
4. Check the [Auth.js documentation](https://authjs.dev) for authentication questions

---

**GistLens v2.0** - Built with Next.js 15, PostgreSQL, and Auth.js
