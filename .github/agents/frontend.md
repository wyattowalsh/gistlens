# Frontend Development Guidelines

## 🎨 React & Next.js Patterns

### Server vs Client Components

**Default to Server Components** unless you need:
- Browser APIs (localStorage, navigator, etc.)
- Event handlers (onClick, onChange, etc.)
- React hooks (useState, useEffect, etc.)
- Third-party libraries that use browser APIs

```typescript
// ✅ Server Component (default)
async function GistList() {
  const gists = await fetchGists();
  return <div>{/* render gists */}</div>;
}

// ✅ Client Component (when needed)
'use client';

function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

### Component Patterns

**1. Composition Pattern**
```typescript
// Base component
export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {children}
    </div>
  );
}

// Composed components
export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6">{children}</div>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pt-0">{children}</div>;
}

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

**2. Render Props Pattern**
```typescript
interface RenderProps<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  children: (props: { data: T | null; loading: boolean; error: Error | null }) => React.ReactNode;
}

export function DataFetcher<T>({ url, children }: RenderProps<T> & { url: string }) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => setState({ data, loading: false, error: null }))
      .catch(error => setState({ data: null, loading: false, error }));
  }, [url]);
  
  return children(state);
}
```

**3. Compound Component Pattern**
```typescript
// components/gist-viewer.tsx
export function GistViewer({ children }: { children: React.ReactNode }) {
  return <div className="gist-viewer">{children}</div>;
}

GistViewer.Header = function ({ title }: { title: string }) {
  return <div className="gist-header">{title}</div>;
};

GistViewer.File = function ({ file }: { file: File }) {
  return <div className="gist-file">{/* render file */}</div>;
};

// Usage
<GistViewer>
  <GistViewer.Header title="My Gist" />
  <GistViewer.File file={file1} />
  <GistViewer.File file={file2} />
</GistViewer>
```

## 🎭 Styling with Tailwind CSS

### Utility-First Approach

```typescript
// ✅ Good: Use Tailwind utilities
<button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
  Click me
</button>

// ❌ Avoid: Custom CSS for simple styles
<button className="custom-button">Click me</button>
```

### Component Variants with CVA

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

### Responsive Design

```typescript
// Mobile-first approach
<div className="
  flex flex-col         // Mobile: column layout
  sm:flex-row           // Tablet+: row layout
  gap-4                 // All: 1rem gap
  p-4 sm:p-6 lg:p-8     // Responsive padding
">
  {/* content */}
</div>
```

## 📝 Forms and Validation

### React Hook Form + Zod

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createGistSchema = z.object({
  description: z.string().min(1).max(500),
  filename: z.string().min(1).max(255),
  content: z.string().min(1).max(1000000),
  public: z.boolean(),
});

type CreateGistForm = z.infer<typeof createGistSchema>;

export function CreateGistForm() {
  const form = useForm<CreateGistForm>({
    resolver: zodResolver(createGistSchema),
    defaultValues: {
      description: '',
      filename: 'file.txt',
      content: '',
      public: true,
    },
  });
  
  const onSubmit = async (data: CreateGistForm) => {
    const response = await fetch('/api/github/gists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      form.setError('root', {
        message: 'Failed to create gist',
      });
      return;
    }
    
    // Success - redirect or show message
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('description')} />
      {form.formState.errors.description && (
        <p className="text-red-500">{form.formState.errors.description.message}</p>
      )}
      {/* More fields */}
      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Creating...' : 'Create Gist'}
      </button>
    </form>
  );
}
```

## 🖼️ Image and Media Handling

### Next.js Image Component

```typescript
import Image from 'next/image';

// Static image
<Image
  src="/logo.png"
  alt="GistLens Logo"
  width={200}
  height={50}
  priority // Load immediately
/>

// Dynamic image
<Image
  src={user.avatar_url}
  alt={`${user.name}'s avatar`}
  width={40}
  height={40}
  className="rounded-full"
  unoptimized // For external images
/>
```

### Video/Audio Components

```typescript
'use client';

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export function VideoPlayer({ src, poster }: VideoPlayerProps) {
  return (
    <video
      controls
      className="w-full rounded-lg"
      poster={poster}
      preload="metadata"
    >
      <source src={src} />
      Your browser does not support video playback.
    </video>
  );
}
```

## 🎯 Code Syntax Highlighting

### Using Prism or Highlight.js

```typescript
'use client';

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/github-dark.css';
import { useEffect, useRef } from 'react';

hljs.registerLanguage('javascript', javascript);

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);
  
  return (
    <pre className="rounded-lg overflow-x-auto">
      <code ref={codeRef} className={`language-${language}`}>
        {code}
      </code>
    </pre>
  );
}
```

## 🔔 Toast Notifications

```typescript
'use client';

import { Toaster, toast } from 'sonner';

// In layout
<Toaster position="bottom-right" />

// Usage
toast.success('Gist created successfully!');
toast.error('Failed to create gist');
toast.loading('Creating gist...', { id: 'create-gist' });
toast.success('Done!', { id: 'create-gist' }); // Replaces loading
```

## ♿ Accessibility

### Semantic HTML

```typescript
// ✅ Good: Semantic elements
<nav>
  <ul>
    <li><a href="/gists">Gists</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Gist Title</h1>
    <section>{/* content */}</section>
  </article>
</main>

// ❌ Avoid: Divs for everything
<div className="nav">
  <div className="nav-item">Gists</div>
</div>
```

### ARIA Attributes

```typescript
<button
  aria-label="Copy code to clipboard"
  aria-pressed={copied}
  onClick={handleCopy}
>
  {copied ? <Check /> : <Copy />}
</button>

<dialog
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
>
  <h2 id="dialog-title">Settings</h2>
  {/* content */}
</dialog>
```

### Keyboard Navigation

```typescript
'use client';

export function NavigableList({ items }: { items: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + items.length) % items.length);
        break;
      case 'Enter':
        // Select item
        break;
    }
  };
  
  return (
    <ul onKeyDown={handleKeyDown} tabIndex={0}>
      {items.map((item, i) => (
        <li
          key={item}
          className={i === selectedIndex ? 'bg-accent' : ''}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

## 🚀 Performance Best Practices

### 1. Lazy Loading

```typescript
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // Don't render on server
});
```

### 2. Memoization

```typescript
import { useMemo, useCallback } from 'react';

function ExpensiveComponent({ items }: { items: Item[] }) {
  // Memoize expensive computation
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);
  
  // Memoize callback
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);
  
  return <div>{/* render */}</div>;
}
```

### 3. Virtualization for Long Lists

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: string[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  });
  
  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {items[virtualRow.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🎨 Dark Mode

```typescript
// Use Tailwind's dark mode
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content
</div>

// Toggle with next-themes
'use client';

import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle theme
    </button>
  );
}
```

## 📱 Mobile-First Development

### Touch-Friendly Targets

```typescript
// Minimum 44x44px for touch targets
<button className="min-h-[44px] min-w-[44px] p-2">
  <Icon />
</button>
```

### Responsive Navigation

```typescript
'use client';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <Menu />
      </button>
      
      {/* Desktop nav */}
      <nav className="hidden lg:flex gap-4">
        <a href="/gists">Gists</a>
        <a href="/about">About</a>
      </nav>
      
      {/* Mobile nav */}
      {isOpen && (
        <nav className="lg:hidden">
          <a href="/gists">Gists</a>
          <a href="/about">About</a>
        </nav>
      )}
    </>
  );
}
```

## 🧩 Component Library Standards

Follow **shadcn/ui** patterns:
- Headless UI primitives (Radix UI)
- Fully customizable with Tailwind
- Copy/paste components (not npm packages)
- Accessible by default

See: https://ui.shadcn.com/
