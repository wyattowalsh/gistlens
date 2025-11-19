import { Metadata } from 'next';
import MigrationContent from '@/content/migration.mdx';

export const metadata: Metadata = {
  title: 'Migration Guide - GistLens Documentation',
  description: 'Complete guide for migrating to GistLens v2.0 with Next.js 15, PostgreSQL, and Auth.js.',
};

export default function MigrationPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <MigrationContent />
    </div>
  );
}
