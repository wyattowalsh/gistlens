/**
 * Shared TypeScript type definitions for GistLens
 */

export interface GistFile {
  filename: string;
  type: string;
  language?: string;
  raw_url?: string;
  size: number;
  content: string;
}

export interface GistOwner {
  login: string;
  avatar_url: string;
  html_url?: string;
}

export interface GistData {
  id: string;
  description?: string;
  public: boolean;
  owner?: GistOwner;
  files: Record<string, GistFile>;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface HistoryItem {
  id: string;
  description: string;
  owner: string;
  avatar?: string;
  files: number;
  date: string;
}

export interface FeaturedGist {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}
