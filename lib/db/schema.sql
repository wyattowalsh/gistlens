-- GistLens Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  github_username TEXT UNIQUE NOT NULL,
  github_id INTEGER UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  public_gists INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for NextAuth
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table for OAuth providers
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_account_id)
);

-- Verification tokens (for email verification if needed)
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- User gist history (optional - for tracking viewed gists)
CREATE TABLE IF NOT EXISTS gist_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  gist_id TEXT NOT NULL,
  gist_owner TEXT,
  gist_description TEXT,
  file_count INTEGER,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, gist_id)
);

-- Custom styles (per user)
CREATE TABLE IF NOT EXISTS custom_styles (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target TEXT NOT NULL,
  css TEXT,
  enabled BOOLEAN DEFAULT false,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, target)
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  telemetry_enabled BOOLEAN DEFAULT false,
  telemetry_api_key TEXT,
  auto_preview_markdown BOOLEAN DEFAULT true,
  default_theme TEXT DEFAULT 'dark',
  show_line_numbers BOOLEAN DEFAULT true,
  font_size TEXT DEFAULT 'medium',
  enable_syntax_highlighting BOOLEAN DEFAULT true,
  auto_load_gists BOOLEAN DEFAULT true,
  history_limit INTEGER DEFAULT 10,
  compact_mode BOOLEAN DEFAULT false,
  enable_animations BOOLEAN DEFAULT true,
  wrap_long_lines BOOLEAN DEFAULT false,
  icon_set TEXT DEFAULT 'lucide',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_gist_history_user_id ON gist_history(user_id);
CREATE INDEX IF NOT EXISTS idx_gist_history_gist_id ON gist_history(gist_id);
CREATE INDEX IF NOT EXISTS idx_custom_styles_user_id ON custom_styles(user_id);
