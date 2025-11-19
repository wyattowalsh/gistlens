/**
 * Database operations using Supabase client
 * 
 * This module provides the same interface as the Vercel Postgres implementation
 * but uses Supabase under the hood for better features like real-time, RLS, etc.
 */

import { createServerClient } from '@/lib/supabase';

// Database initialization
export async function initializeDatabase() {
  try {
    const supabase = await createServerClient();
    
    // Check if tables exist by querying the users table
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      console.log('Database tables not found. Please run the Supabase migrations.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// User operations
export async function getUserByGithubId(githubId: number) {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('github_id', githubId)
    .single();

  if (error) {
    console.error('Error fetching user by GitHub ID:', error);
    return null;
  }

  return data;
}

export async function createUser(userData: {
  id: string;
  email?: string;
  name?: string;
  githubUsername: string;
  githubId: number;
  avatarUrl?: string;
  bio?: string;
  publicGists?: number;
}) {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userData.id,
      email: userData.email || null,
      name: userData.name || null,
      github_username: userData.githubUsername,
      github_id: userData.githubId,
      avatar_url: userData.avatarUrl || null,
      bio: userData.bio || null,
      public_gists: userData.publicGists || 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  return data;
}

export async function updateUser(userId: string, userData: Partial<{
  email: string;
  name: string;
  avatarUrl: string;
  bio: string;
  publicGists: number;
}>) {
  const supabase = await createServerClient();
  
  const updateData: any = {};
  
  if (userData.email !== undefined) updateData.email = userData.email;
  if (userData.name !== undefined) updateData.name = userData.name;
  if (userData.avatarUrl !== undefined) updateData.avatar_url = userData.avatarUrl;
  if (userData.bio !== undefined) updateData.bio = userData.bio;
  if (userData.publicGists !== undefined) updateData.public_gists = userData.publicGists;
  
  if (Object.keys(updateData).length === 0) return null;
  
  updateData.updated_at = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    return null;
  }

  return data;
}

// Settings operations
export async function getUserSettings(userId: string) {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user settings:', error);
  }

  return data || null;
}

export async function createDefaultSettings(userId: string) {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('user_settings')
    .insert({ user_id: userId })
    .select()
    .single();

  if (error) {
    console.error('Error creating default settings:', error);
    throw error;
  }

  return data;
}

export async function updateUserSettings(userId: string, settings: Record<string, any>) {
  const supabase = await createServerClient();
  
  const allowedFields = [
    'telemetry_enabled', 'telemetry_api_key', 'auto_preview_markdown',
    'default_theme', 'show_line_numbers', 'font_size', 
    'enable_syntax_highlighting', 'auto_load_gists', 'history_limit',
    'compact_mode', 'enable_animations', 'wrap_long_lines', 'icon_set'
  ];

  const updateData: any = {};
  
  for (const [key, value] of Object.entries(settings)) {
    if (allowedFields.includes(key)) {
      updateData[key] = value;
    }
  }

  if (Object.keys(updateData).length === 0) return null;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('user_settings')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user settings:', error);
    return null;
  }

  return data;
}

// Gist history operations
export async function addToGistHistory(historyData: {
  userId: string;
  gistId: string;
  gistOwner?: string;
  gistDescription?: string;
  fileCount?: number;
}) {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('gist_history')
    .upsert({
      user_id: historyData.userId,
      gist_id: historyData.gistId,
      gist_owner: historyData.gistOwner || null,
      gist_description: historyData.gistDescription || null,
      file_count: historyData.fileCount || 0,
      viewed_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,gist_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding to gist history:', error);
    throw error;
  }

  return data;
}

export async function getUserGistHistory(userId: string, limit: number = 10) {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('gist_history')
    .select('*')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching gist history:', error);
    return [];
  }

  return data;
}

// Custom styles operations
export async function getCustomStyles(userId: string, target?: string) {
  const supabase = await createServerClient();
  
  if (target) {
    const { data, error } = await supabase
      .from('custom_styles')
      .select('*')
      .eq('user_id', userId)
      .eq('target', target)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching custom styles:', error);
    }

    return data || null;
  }

  const { data, error } = await supabase
    .from('custom_styles')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching custom styles:', error);
    return [];
  }

  return data;
}

export async function upsertCustomStyle(styleData: {
  userId: string;
  target: string;
  css: string;
  enabled: boolean;
}) {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('custom_styles')
    .upsert({
      user_id: styleData.userId,
      target: styleData.target,
      css: styleData.css,
      enabled: styleData.enabled,
      last_modified: new Date().toISOString(),
    }, {
      onConflict: 'user_id,target',
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting custom style:', error);
    throw error;
  }

  return data;
}

export async function deleteCustomStyle(userId: string, target: string) {
  const supabase = await createServerClient();
  
  const { error } = await supabase
    .from('custom_styles')
    .delete()
    .eq('user_id', userId)
    .eq('target', target);

  if (error) {
    console.error('Error deleting custom style:', error);
    throw error;
  }
}
