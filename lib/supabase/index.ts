/**
 * Supabase Client Exports
 * 
 * Provides unified exports for Supabase clients across the application
 */

export { createClient as createBrowserClient } from './client';
export { createClient as createServerClient } from './server';
export { updateSession } from './middleware';
