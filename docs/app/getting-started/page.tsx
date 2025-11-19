import GettingStartedContent from '@/content/getting-started.mdx';

export const metadata = {
  title: 'Getting Started - GistLens Docs',
  description: 'Set up your local development environment and run GistLens',
};

export default function GettingStartedPage() {
  return (
    <article className="prose prose-invert max-w-4xl mx-auto px-4 py-8">
      <GettingStartedContent />
    </article>
  );
}
