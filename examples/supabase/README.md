# Supabase Integration Examples

This directory contains example code demonstrating how to use Supabase features in GistLens.

## Examples

### 1. Real-time Gist History

**File:** `gist-history-realtime.tsx`

Demonstrates how to:
- Load initial gist history
- Subscribe to real-time updates
- Handle insertions, updates, and deletions
- Properly cleanup subscriptions

### 2. Settings Sync Across Tabs

**File:** `settings-sync.tsx`

Demonstrates how to:
- Subscribe to user settings changes
- Sync settings across multiple browser tabs
- Handle settings updates in real-time

### 3. Server Component with Supabase

**File:** `server-component-example.tsx`

Demonstrates how to:
- Use Supabase in Next.js Server Components
- Fetch data server-side with proper authentication
- Handle errors gracefully

### 4. Client Component with Mutations

**File:** `client-component-example.tsx`

Demonstrates how to:
- Use Supabase in Client Components
- Perform mutations (insert, update, delete)
- Handle optimistic updates

## Usage

These are example files meant for reference. To use them in your application:

1. Copy the relevant code to your components
2. Adjust imports and types as needed
3. Customize the UI and logic for your use case

## Best Practices

### 1. Always Cleanup Subscriptions

```tsx
useEffect(() => {
  const channel = subscribeToGistHistory(...);
  
  return () => {
    channel.unsubscribe();
  };
}, [dependencies]);
```

### 2. Handle Loading and Error States

```tsx
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
  setData(data);
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}
```

### 3. Use Optimistic Updates

```tsx
// Immediately update UI
setItems(prev => [...prev, newItem]);

// Then sync with database
const { error } = await supabase.from('items').insert(newItem);

// Rollback on error
if (error) {
  setItems(prev => prev.filter(item => item.id !== newItem.id));
  showError(error.message);
}
```

### 4. Respect RLS Policies

All database operations automatically respect Row Level Security policies. You don't need to add WHERE clauses for user_id - the database handles it.

```tsx
// ✅ Good - RLS handles filtering by user
const { data } = await supabase
  .from('gist_history')
  .select('*');

// ❌ Unnecessary - RLS already does this
const { data } = await supabase
  .from('gist_history')
  .select('*')
  .eq('user_id', userId);
```

## Testing

When testing these examples:

1. Ensure your Supabase project is set up
2. Run the migrations
3. Add test data
4. Test in multiple browser tabs to see real-time sync

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
