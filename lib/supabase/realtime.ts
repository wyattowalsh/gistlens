/**
 * Supabase Real-time Helpers
 * 
 * Provides helper functions for working with Supabase real-time subscriptions
 * in Next.js 15 client components
 */

import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

/**
 * Subscribe to gist history changes for a specific user
 * 
 * @param supabase - Supabase client instance
 * @param userId - The user ID to filter by
 * @param onInsert - Callback when a new gist is added to history
 * @param onUpdate - Callback when a gist history entry is updated
 * @param onDelete - Callback when a gist is removed from history
 * @returns The realtime channel (call .unsubscribe() to cleanup)
 * 
 * @example
 * ```tsx
 * 'use client';
 * 
 * import { useEffect, useState } from 'react';
 * import { createBrowserClient } from '@/lib/supabase/client';
 * import { subscribeToGistHistory } from '@/lib/supabase/realtime';
 * 
 * export function GistHistoryList({ userId }: { userId: string }) {
 *   const [history, setHistory] = useState([]);
 *   const supabase = createBrowserClient();
 * 
 *   useEffect(() => {
 *     // Initial load
 *     loadHistory();
 * 
 *     // Subscribe to changes
 *     const channel = subscribeToGistHistory(
 *       supabase,
 *       userId,
 *       (newGist) => {
 *         setHistory((prev) => [newGist, ...prev]);
 *       },
 *       (updatedGist) => {
 *         setHistory((prev) => 
 *           prev.map((g) => g.id === updatedGist.id ? updatedGist : g)
 *         );
 *       },
 *       (deletedGist) => {
 *         setHistory((prev) => prev.filter((g) => g.id !== deletedGist.id));
 *       }
 *     );
 * 
 *     return () => {
 *       channel.unsubscribe();
 *     };
 *   }, [userId]);
 * 
 *   async function loadHistory() {
 *     const { data } = await supabase
 *       .from('gist_history')
 *       .select('*')
 *       .eq('user_id', userId)
 *       .order('viewed_at', { ascending: false });
 *     setHistory(data || []);
 *   }
 * 
 *   return (
 *     <div>
 *       {history.map((gist) => (
 *         <div key={gist.id}>{gist.gist_id}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function subscribeToGistHistory(
  supabase: SupabaseClient,
  userId: string,
  onInsert?: (payload: any) => void,
  onUpdate?: (payload: any) => void,
  onDelete?: (payload: any) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`gist_history:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'gist_history',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (onInsert) onInsert(payload.new);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'gist_history',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (onUpdate) onUpdate(payload.new);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'gist_history',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (onDelete) onDelete(payload.old);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to user settings changes
 * 
 * @param supabase - Supabase client instance
 * @param userId - The user ID to filter by
 * @param onUpdate - Callback when settings are updated
 * @returns The realtime channel (call .unsubscribe() to cleanup)
 * 
 * @example
 * ```tsx
 * 'use client';
 * 
 * import { useEffect, useState } from 'react';
 * import { createBrowserClient } from '@/lib/supabase/client';
 * import { subscribeToUserSettings } from '@/lib/supabase/realtime';
 * 
 * export function SettingsSync({ userId }: { userId: string }) {
 *   const [settings, setSettings] = useState(null);
 *   const supabase = createBrowserClient();
 * 
 *   useEffect(() => {
 *     // Subscribe to settings changes
 *     const channel = subscribeToUserSettings(
 *       supabase,
 *       userId,
 *       (updatedSettings) => {
 *         console.log('Settings updated:', updatedSettings);
 *         setSettings(updatedSettings);
 *       }
 *     );
 * 
 *     return () => {
 *       channel.unsubscribe();
 *     };
 *   }, [userId]);
 * 
 *   return <div>Settings synced across tabs!</div>;
 * }
 * ```
 */
export function subscribeToUserSettings(
  supabase: SupabaseClient,
  userId: string,
  onUpdate: (payload: any) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`user_settings:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_settings',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to custom styles changes
 * 
 * @param supabase - Supabase client instance
 * @param userId - The user ID to filter by
 * @param onUpdate - Callback when styles are updated
 * @returns The realtime channel (call .unsubscribe() to cleanup)
 */
export function subscribeToCustomStyles(
  supabase: SupabaseClient,
  userId: string,
  onInsert?: (payload: any) => void,
  onUpdate?: (payload: any) => void,
  onDelete?: (payload: any) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`custom_styles:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'custom_styles',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (onInsert) onInsert(payload.new);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'custom_styles',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (onUpdate) onUpdate(payload.new);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'custom_styles',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (onDelete) onDelete(payload.old);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Generic subscription helper for any table
 * 
 * @param supabase - Supabase client instance
 * @param table - Table name to subscribe to
 * @param filter - Optional filter (e.g., 'user_id=eq.123')
 * @param callbacks - Object with insert, update, delete callbacks
 * @returns The realtime channel (call .unsubscribe() to cleanup)
 */
export function subscribeToTable(
  supabase: SupabaseClient,
  table: string,
  filter?: string,
  callbacks?: {
    onInsert?: (payload: any) => void;
    onUpdate?: (payload: any) => void;
    onDelete?: (payload: any) => void;
  }
): RealtimeChannel {
  let channel = supabase.channel(`${table}:${filter || 'all'}`);

  if (callbacks?.onInsert) {
    channel = channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table,
        ...(filter && { filter }),
      },
      (payload) => callbacks.onInsert!(payload.new)
    );
  }

  if (callbacks?.onUpdate) {
    channel = channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table,
        ...(filter && { filter }),
      },
      (payload) => callbacks.onUpdate!(payload.new)
    );
  }

  if (callbacks?.onDelete) {
    channel = channel.on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table,
        ...(filter && { filter }),
      },
      (payload) => callbacks.onDelete!(payload.old)
    );
  }

  return channel.subscribe();
}
