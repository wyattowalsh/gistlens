/**
 * Supabase Client for Browser/Client Components
 * 
 * Uses @supabase/ssr for proper cookie handling in Next.js 15
 * This client is used in Client Components only
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
