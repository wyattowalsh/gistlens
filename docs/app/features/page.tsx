import { Metadata } from 'next';
import FeaturesContent from '@/content/features.mdx';

export const metadata: Metadata = {
  title: 'Features - GistLens Documentation',
  description: 'Complete guide to GistLens features including telemetry, authentication, custom stylesheets, and media viewers.',
};

export default function FeaturesPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <FeaturesContent />
    </div>
  );
}
