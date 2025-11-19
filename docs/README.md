# GistLens Documentation Site

Interactive documentation site for GistLens built with Next.js 15.

## Running the Docs Site

### Development

```bash
cd docs
npm install
npm run dev
```

The documentation site will be available at [http://localhost:3001](http://localhost:3001)

### Production Build

```bash
npm run build
npm run start
```

## Structure

```
docs/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx             # Homepage
│   ├── getting-started/     # Getting started guide
│   ├── auth/                # Auth.js documentation
│   ├── database/            # Database schema docs
│   ├── api/                 # API routes documentation
│   ├── deployment/          # Deployment guides
│   └── migration/           # Migration guide
├── components/              # Shared components
├── public/                  # Static assets
└── package.json            # Dependencies
```

## Features

- 📚 **Comprehensive Guides**: Setup, Auth.js, Database, API Routes, Deployment
- 🎨 **Dark Mode**: Built-in dark theme matching main app
- 🚀 **Fast Navigation**: Client-side routing with Next.js
- 📱 **Responsive**: Mobile-friendly documentation
- 🔍 **Type-Safe**: Full TypeScript support

## Content

The documentation covers:

1. **Getting Started** - Local development setup
2. **Auth.js Setup** - GitHub OAuth configuration
3. **Database Schema** - PostgreSQL tables and relationships
4. **API Routes** - Secure server-side endpoints
5. **Deployment** - Vercel, Railway, self-hosted options
6. **Migration** - Porting UI components from Vite/React

## Adding New Pages

Create a new directory and `page.tsx` in `app/`:

```tsx
// app/new-page/page.tsx
export default function NewPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">New Page</h1>
      {/* Content */}
    </div>
  );
}
```

Add navigation link in `app/layout.tsx`.

## Deployment

### Static Export

The docs site can be exported as static HTML:

```bash
npm run build
```

Output will be in `out/` directory.

### Deploy to Vercel

```bash
vercel --cwd docs
```

### Deploy to GitHub Pages

Add to main project's `.github/workflows/docs.yml`:

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd docs && npm install && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/out
```

## Development

- Run main app: `npm run dev` (port 3000)
- Run docs: `cd docs && npm run dev` (port 3001)
- Both can run simultaneously for cross-reference

## Styling

Uses Tailwind CSS with dark mode. Theme matches main application for consistency.

## License

Same as main GistLens project.
