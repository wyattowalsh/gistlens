export default function GettingStartedPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Getting Started</h1>
      
      <div className="prose prose-invert max-w-none space-y-6">
        <p className="text-lg text-muted-foreground">
          This guide will help you set up GistLens locally for development.
        </p>

        <div className="bg-muted/50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Prerequisites</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Node.js</strong> 20.x or higher</li>
            <li><strong>npm</strong> 10.x or higher</li>
            <li><strong>PostgreSQL</strong> 14.x or higher (or use cloud provider)</li>
            <li><strong>Git</strong></li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Quick Start</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">1. Clone and Install</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto"><code>{`git clone https://github.com/wyattowalsh/gistlens.git
cd gistlens
npm install`}</code></pre>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">2. Environment Setup</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto"><code>{`cp .env.example .env.local
openssl rand -base64 32  # Generate Auth.js secret`}</code></pre>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">3. Database Setup</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto"><code>{`# Option A: Local PostgreSQL
createdb gistlens
psql postgresql://localhost:5432/gistlens -f lib/db/schema.sql

# Option B: Docker
docker-compose up -d

# Option C: Vercel Postgres
# Use Vercel dashboard to create and initialize`}</code></pre>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">4. Run Development Server</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto"><code>npm run dev</code></pre>
            <p className="mt-2 text-sm text-muted-foreground">
              Open <a href="http://localhost:3000" className="text-primary hover:underline">http://localhost:3000</a> in your browser
            </p>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-lg mt-8">
          <h3 className="text-xl font-semibold mb-3">📚 Detailed Guide</h3>
          <p>
            For complete step-by-step instructions including troubleshooting, see{' '}
            <a href="https://github.com/wyattowalsh/gistlens/blob/main/LOCAL_DEVELOPMENT.md" className="text-primary hover:underline">
              LOCAL_DEVELOPMENT.md
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
