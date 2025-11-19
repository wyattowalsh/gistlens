-- GistLens Supabase Migration
-- Initial schema with Row Level Security (RLS) enabled

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists public.users (
  id text primary key,
  email text unique,
  name text,
  github_username text unique not null,
  github_id integer unique not null,
  avatar_url text,
  bio text,
  public_gists integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sessions table for NextAuth
create table if not exists public.sessions (
  id text primary key,
  session_token text unique not null,
  user_id text not null references public.users(id) on delete cascade,
  expires timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Accounts table for OAuth providers
create table if not exists public.accounts (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  type text not null,
  provider text not null,
  provider_account_id text not null,
  refresh_token text,
  access_token text,
  expires_at integer,
  token_type text,
  scope text,
  id_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(provider, provider_account_id)
);

-- Verification tokens (for email verification if needed)
create table if not exists public.verification_tokens (
  identifier text not null,
  token text unique not null,
  expires timestamp with time zone not null,
  primary key (identifier, token)
);

-- User gist history (tracking viewed gists)
create table if not exists public.gist_history (
  id serial primary key,
  user_id text references public.users(id) on delete cascade,
  gist_id text not null,
  gist_owner text,
  gist_description text,
  file_count integer,
  viewed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, gist_id)
);

-- Custom styles (per user)
create table if not exists public.custom_styles (
  id serial primary key,
  user_id text not null references public.users(id) on delete cascade,
  target text not null,
  css text,
  enabled boolean default false,
  last_modified timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, target)
);

-- User settings
create table if not exists public.user_settings (
  user_id text primary key references public.users(id) on delete cascade,
  telemetry_enabled boolean default false,
  telemetry_api_key text,
  auto_preview_markdown boolean default true,
  default_theme text default 'dark',
  show_line_numbers boolean default true,
  font_size text default 'medium',
  enable_syntax_highlighting boolean default true,
  auto_load_gists boolean default true,
  history_limit integer default 10,
  compact_mode boolean default false,
  enable_animations boolean default true,
  wrap_long_lines boolean default false,
  icon_set text default 'lucide',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_sessions_user_id on public.sessions(user_id);
create index if not exists idx_sessions_token on public.sessions(session_token);
create index if not exists idx_accounts_user_id on public.accounts(user_id);
create index if not exists idx_gist_history_user_id on public.gist_history(user_id);
create index if not exists idx_gist_history_gist_id on public.gist_history(gist_id);
create index if not exists idx_custom_styles_user_id on public.custom_styles(user_id);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.accounts enable row level security;
alter table public.verification_tokens enable row level security;
alter table public.gist_history enable row level security;
alter table public.custom_styles enable row level security;
alter table public.user_settings enable row level security;

-- RLS Policies for users table
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid()::text = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid()::text = id);

-- RLS Policies for sessions table
create policy "Users can view their own sessions"
  on public.sessions for select
  using (auth.uid()::text = user_id);

create policy "Users can delete their own sessions"
  on public.sessions for delete
  using (auth.uid()::text = user_id);

-- RLS Policies for accounts table
create policy "Users can view their own accounts"
  on public.accounts for select
  using (auth.uid()::text = user_id);

-- RLS Policies for gist_history table
create policy "Users can view their own gist history"
  on public.gist_history for select
  using (auth.uid()::text = user_id);

create policy "Users can insert into their own gist history"
  on public.gist_history for insert
  with check (auth.uid()::text = user_id);

create policy "Users can update their own gist history"
  on public.gist_history for update
  using (auth.uid()::text = user_id);

create policy "Users can delete their own gist history"
  on public.gist_history for delete
  using (auth.uid()::text = user_id);

-- RLS Policies for custom_styles table
create policy "Users can view their own custom styles"
  on public.custom_styles for select
  using (auth.uid()::text = user_id);

create policy "Users can insert their own custom styles"
  on public.custom_styles for insert
  with check (auth.uid()::text = user_id);

create policy "Users can update their own custom styles"
  on public.custom_styles for update
  using (auth.uid()::text = user_id);

create policy "Users can delete their own custom styles"
  on public.custom_styles for delete
  using (auth.uid()::text = user_id);

-- RLS Policies for user_settings table
create policy "Users can view their own settings"
  on public.user_settings for select
  using (auth.uid()::text = user_id);

create policy "Users can insert their own settings"
  on public.user_settings for insert
  with check (auth.uid()::text = user_id);

create policy "Users can update their own settings"
  on public.user_settings for update
  using (auth.uid()::text = user_id);

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers to automatically update updated_at
create trigger handle_users_updated_at
  before update on public.users
  for each row
  execute function public.handle_updated_at();

create trigger handle_accounts_updated_at
  before update on public.accounts
  for each row
  execute function public.handle_updated_at();

create trigger handle_user_settings_updated_at
  before update on public.user_settings
  for each row
  execute function public.handle_updated_at();

-- Enable realtime for gist_history (optional but recommended)
alter publication supabase_realtime add table public.gist_history;

-- Grant necessary permissions to authenticated users
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
