import { Metadata } from 'next';
import ChangelogContent from '@/content/changelog.mdx';

export const metadata: Metadata = {
  title: 'Changelog - GistLens Documentation',
  description: 'Version history and release notes for GistLens.',
};

export default function ChangelogPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <ChangelogContent />
    </div>
  );
}
