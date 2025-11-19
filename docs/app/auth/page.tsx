import AuthContent from '@/content/auth.mdx';

export const metadata = {
  title: 'Auth.js Configuration - GistLens Docs',
  description: 'Configure secure GitHub OAuth authentication with Auth.js',
};

export default function AuthPage() {
  return (
    <article className="prose prose-invert max-w-4xl mx-auto px-4 py-8">
      <AuthContent />
    </article>
  );
}
