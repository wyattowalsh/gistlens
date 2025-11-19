/**
 * Example: Server Component with Supabase
 * 
 * This example demonstrates how to use Supabase in Next.js 15 Server Components.
 * Server Components allow you to fetch data on the server before rendering,
 * improving performance and SEO.
 * 
 * Features:
 * - Server-side data fetching
 * - Automatic authentication from cookies
 * - Type-safe queries
 * - Error handling
 */

import { createServerClient } from '@/lib/supabase/server';
import type { GistHistory, UserSettings } from '@/types/supabase';

interface Props {
  userId: string;
}

export async function ServerComponentExample({ userId }: Props) {
  // Create Supabase client (reads auth from cookies automatically)
  const supabase = await createServerClient();

  // Fetch user's gist history
  const { data: history, error: historyError } = await supabase
    .from('gist_history')
    .select('*')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(10);

  // Fetch user settings
  const { data: settings, error: settingsError } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Handle errors
  if (historyError) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-red-800">Failed to load history: {historyError.message}</p>
      </div>
    );
  }

  if (settingsError && settingsError.code !== 'PGRST116') {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-red-800">Failed to load settings: {settingsError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">User Settings</h2>
        {settings ? (
          <div className="mt-2 space-y-1 text-sm">
            <p>Theme: {settings.default_theme}</p>
            <p>Font Size: {settings.font_size}</p>
            <p>Telemetry: {settings.telemetry_enabled ? 'Enabled' : 'Disabled'}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No settings found</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold">Recent Gists</h2>
        {history && history.length > 0 ? (
          <div className="mt-2 space-y-2">
            {history.map((gist) => (
              <div key={gist.id} className="rounded border p-3">
                <div className="font-medium">{gist.gist_id}</div>
                {gist.gist_description && (
                  <p className="text-sm text-gray-600">{gist.gist_description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Viewed {new Date(gist.viewed_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No gists in history</p>
        )}
      </div>
    </div>
  );
}

/**
 * Example: Fetching data with authentication check
 */
export async function AuthenticatedServerComponent() {
  const supabase = await createServerClient();

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4">
        <p className="text-yellow-800">Please sign in to view this content</p>
      </div>
    );
  }

  // User is authenticated, fetch their data
  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Welcome, {user.email}!</h2>
      {settings && (
        <div className="text-sm">
          <p>Your theme preference: {settings.default_theme}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Example: Parallel data fetching
 */
export async function ParallelFetchingExample({ userId }: Props) {
  const supabase = await createServerClient();

  // Fetch multiple resources in parallel
  const [historyResult, settingsResult, stylesResult] = await Promise.all([
    supabase
      .from('gist_history')
      .select('*')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(5),
    supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('custom_styles')
      .select('*')
      .eq('user_id', userId),
  ]);

  const { data: history, error: historyError } = historyResult;
  const { data: settings, error: settingsError } = settingsResult;
  const { data: styles, error: stylesError } = stylesResult;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Dashboard</h2>

      {/* Display all the data */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">History</h3>
          {historyError ? (
            <p className="text-sm text-red-600">{historyError.message}</p>
          ) : (
            <p className="text-2xl font-bold">{history?.length || 0}</p>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Settings</h3>
          {settingsError && settingsError.code !== 'PGRST116' ? (
            <p className="text-sm text-red-600">{settingsError.message}</p>
          ) : (
            <p className="text-sm">{settings ? 'Configured' : 'Default'}</p>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Custom Styles</h3>
          {stylesError ? (
            <p className="text-sm text-red-600">{stylesError.message}</p>
          ) : (
            <p className="text-2xl font-bold">{styles?.length || 0}</p>
          )}
        </div>
      </div>
    </div>
  );
}
