/**
 * Example: Real-time Gist History Component
 * 
 * This example demonstrates how to use Supabase real-time subscriptions
 * to keep the gist history in sync across browser tabs and devices.
 * 
 * Features:
 * - Initial data load from Supabase
 * - Real-time updates when gists are added/updated/deleted
 * - Proper cleanup of subscriptions
 * - Loading and error states
 */

'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { subscribeToGistHistory } from '@/lib/supabase';
import type { GistHistory } from '@/types/supabase';

interface Props {
  userId: string;
}

export function GistHistoryRealtime({ userId }: Props) {
  const [history, setHistory] = useState<GistHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createBrowserClient();

  useEffect(() => {
    // Load initial data
    loadHistory();

    // Subscribe to real-time changes
    const channel = subscribeToGistHistory(
      supabase,
      userId,
      // On INSERT - add new gist to the top
      (newGist) => {
        console.log('New gist added:', newGist);
        setHistory((prev) => [newGist as GistHistory, ...prev]);
      },
      // On UPDATE - update existing gist
      (updatedGist) => {
        console.log('Gist updated:', updatedGist);
        setHistory((prev) =>
          prev.map((g) => (g.id === updatedGist.id ? updatedGist as GistHistory : g))
        );
      },
      // On DELETE - remove gist from list
      (deletedGist) => {
        console.log('Gist deleted:', deletedGist);
        setHistory((prev) => prev.filter((g) => g.id !== deletedGist.id));
      }
    );

    // Cleanup subscription when component unmounts
    return () => {
      console.log('Unsubscribing from gist history changes');
      channel.unsubscribe();
    };
  }, [userId]);

  async function loadHistory() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('gist_history')
        .select('*')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;

      setHistory(data || []);
    } catch (err: any) {
      console.error('Error loading gist history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addToHistory(gistId: string) {
    try {
      const { error } = await supabase
        .from('gist_history')
        .insert([{
          user_id: userId,
          gist_id: gistId,
          viewed_at: new Date().toISOString(),
        }] as any);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error adding to history:', err);
      alert(`Failed to add to history: ${err.message}`);
    }
  }

  async function removeFromHistory(historyId: number) {
    try {
      // Optimistically remove from UI
      setHistory((prev) => prev.filter((g) => g.id !== historyId));

      const { error } = await supabase
        .from('gist_history')
        .delete()
        .eq('id', historyId);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error removing from history:', err);
      // Reload on error to restore correct state
      loadHistory();
      alert(`Failed to remove from history: ${err.message}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-gray-500">Loading history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        <p className="font-medium">Error loading history</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadHistory}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Gists</h2>
        <span className="text-sm text-gray-500">
          {history.length} {history.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Test button to add a random gist */}
      <button
        onClick={() => addToHistory(`test-${Date.now()}`)}
        className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
      >
        Add Test Gist
      </button>

      {history.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">No gists in history yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Visit a gist to add it to your history
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((gist) => (
            <div
              key={gist.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="font-medium">{gist.gist_id}</div>
                {gist.gist_description && (
                  <div className="text-sm text-gray-600">{gist.gist_description}</div>
                )}
                <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                  {gist.gist_owner && <span>by {gist.gist_owner}</span>}
                  {gist.file_count && <span>{gist.file_count} files</span>}
                  <span>{new Date(gist.viewed_at).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => removeFromHistory(gist.id)}
                className="ml-4 rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
