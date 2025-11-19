import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  Moon, 
  Sun, 
  Copy, 
  Check, 
  FileCode, 
  Download, 
  Github, 
  ExternalLink, 
  Terminal, 
  AlertCircle,
  Clock,
  Code2,
  Menu,
  X,
  Maximize2,
  Minimize2,
  Eye,
  FileText,
  Star,
  Sparkles,
  Zap,
  Home,
  User,
  ChevronRight,
  BookOpen,
  Lightbulb,
  Share2,
  Link2,
  Twitter,
  Facebook,
  Linkedin,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ImageViewer } from '@/components/ImageViewer';
import { VideoPlayer } from '@/components/VideoPlayer';
import { AudioPlayer } from '@/components/AudioPlayer';
import { DataViewer } from '@/components/DataViewer';
import { PDFViewer } from '@/components/PDFViewer';
import { getFileType, isMarkdownFile } from '@/lib/fileTypes';
import { cn } from '@/lib/utils';

/**
 * GistLens - A Modern GitHub Gist Renderer
 * 
 * Enhanced Features:
 * - Tailwind CSS with shadcn/ui components
 * - Enhanced MDX markdown rendering with math support
 * - Beautiful, modern UI with gradient effects
 * - PrismJS Syntax Highlighting
 * - Dark/Light Mode
 * - Local Storage History
 * - Multi-file support with enhanced tabs
 * - File downloading and raw view
 * - URL hash navigation for markdown sections
 */

// --- Utility Functions ---

// SEO and Metadata Management
const updatePageMetadata = (data) => {
  const { title, description, image, url, type = 'website' } = data;
  
  // Update title
  if (title) {
    document.title = title;
  }
  
  // Helper to update or create meta tag
  const updateMeta = (selector, content, property = 'content') => {
    if (!content) return;
    let meta = document.querySelector(selector);
    if (!meta) {
      meta = document.createElement('meta');
      const attr = selector.includes('property=') ? 'property' : 'name';
      const value = selector.match(/"([^"]+)"/)?.[1];
      if (value) meta.setAttribute(attr, value);
      document.head.appendChild(meta);
    }
    meta.setAttribute(property, content);
  };
  
  // Update basic meta tags
  updateMeta('meta[name="description"]', description);
  updateMeta('meta[name="title"]', title);
  
  // Update Open Graph tags
  updateMeta('meta[property="og:title"]', title);
  updateMeta('meta[property="og:description"]', description);
  updateMeta('meta[property="og:image"]', image);
  updateMeta('meta[property="og:url"]', url);
  updateMeta('meta[property="og:type"]', type);
  
  // Update Twitter Card tags
  updateMeta('meta[property="twitter:title"]', title);
  updateMeta('meta[property="twitter:description"]', description);
  updateMeta('meta[property="twitter:image"]', image);
  
  // Update canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (url) {
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }
  
  // Add JSON-LD structured data for gists
  if (data.structuredData) {
    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(data.structuredData);
  }
};

// Sharing utilities
const shareContent = async (data) => {
  const { title, text, url } = data;
  
  // Try native Web Share API first
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return { success: true, method: 'native' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'native', cancelled: true };
      }
    }
  }
  
  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(url);
    return { success: true, method: 'clipboard' };
  } catch (err) {
    return { success: false, method: 'clipboard', error: err };
  }
};

// Generate share URLs for different platforms
const getShareUrls = (url, title, text) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text);
  
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
  };
};

// Curated list of high-quality GitHub users known for excellent gists
const FEATURED_USERS = [
  'gaearon', // React core team
  'addyosmani', // Google Chrome team
  'sindresorhus', // Prolific open source dev
  'paulirish', // Chrome DevTools
  'substack', // Node.js pioneer
  'tj', // Express.js creator
  'mbostock', // D3.js creator
  'defunkt', // GitHub founder
  'holman', // GitHub
  'mojombo', // GitHub co-founder
];

// Get a diverse set of gists using an intelligent algorithm
const getSmartFeaturedGists = (allGists) => {
  if (!allGists || allGists.length === 0) return [];
  
  // Score each gist based on multiple factors
  const scoredGists = allGists.map(gist => {
    let score = 0;
    const fileCount = Object.keys(gist.files).length;
    const hasDescription = !!gist.description;
    const updatedDate = new Date(gist.updated_at);
    const daysSinceUpdate = (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // More files = more comprehensive (but not too many)
    score += Math.min(fileCount * 10, 30);
    
    // Has description = better documentation
    if (hasDescription) score += 20;
    
    // Longer description = more effort
    if (gist.description) {
      score += Math.min(gist.description.length / 10, 20);
    }
    
    // Recent updates are good (within last year)
    if (daysSinceUpdate < 365) {
      score += Math.max(0, 20 - daysSinceUpdate / 18.25);
    }
    
    // Public gists get a boost
    if (gist.public) score += 10;
    
    // Variety boost: check file types
    const fileTypes = new Set(
      Object.values(gist.files).map(f => 
        f.filename.split('.').pop()?.toLowerCase() || 'txt'
      )
    );
    score += fileTypes.size * 5;
    
    return { ...gist, score };
  });
  
  // Sort by score and return top results
  return scoredGists
    .sort((a, b) => b.score - a.score)
    .slice(0, 6); // Get top 6 for diversity
};

// Fallback featured gists (used if API fails or while loading)
const DEFAULT_FEATURED_GISTS = [
  {
    id: 'bb3bbe2ecc3dd810a14942e66fb87094',
    title: 'React Hooks Cheatsheet',
    description: 'Comprehensive guide to React Hooks with examples',
    category: 'Tutorial',
    icon: BookOpen,
  },
  {
    id: '4e83c70abf3fe294bbdf',
    title: 'CSS Grid Layout Guide',
    description: 'Modern CSS Grid techniques and patterns',
    category: 'Tutorial',
    icon: Lightbulb,
  },
  {
    id: 'a2a8e8e6d7f1a3b2c4d5',
    title: 'JavaScript Tips & Tricks',
    description: 'Useful JavaScript snippets and best practices',
    category: 'Code',
    icon: Sparkles,
  },
];

const parseInput = (input) => {
  if (!input) return null;
  
  // Try to parse as gist URL (with ID)
  const gistUrlMatch = input.match(/gist\.github\.com\/(?:[^/]+\/)?([a-f0-9]+)/i);
  if (gistUrlMatch) return { type: 'gist', value: gistUrlMatch[1] };
  
  // Try to parse as user URL (https://gist.github.com/username)
  const userUrlMatch = input.match(/gist\.github\.com\/([^/]+)\/?$/i);
  if (userUrlMatch) return { type: 'user', value: userUrlMatch[1] };
  
  // Try to parse as just gist ID (hex string)
  if (/^[a-f0-9]+$/i.test(input)) return { type: 'gist', value: input };
  
  // Assume it's a username if it's alphanumeric with hyphens/underscores
  if (/^[a-z0-9_-]+$/i.test(input)) return { type: 'user', value: input };
  
  return null;
};

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// --- Components ---

const LoadingSkeleton = () => (
  <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
    {/* Animated Loading Indicator */}
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">Loading gist...</p>
    </div>
    {/* Header Skeleton */}
    <div className="p-6 md:p-8 rounded-2xl border bg-card animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-muted to-muted/50"></div>
        <div className="flex-1 space-y-3">
          <div className="h-8 bg-gradient-to-r from-muted to-muted/50 rounded w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded w-1/2"></div>
        </div>
      </div>
    </div>
    {/* Content Skeleton */}
    <div className="rounded-2xl border bg-card p-6 space-y-4 animate-pulse">
      <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded w-full"></div>
      <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded w-5/6"></div>
      <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded w-4/6"></div>
      <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded w-3/4"></div>
    </div>
  </div>
);

const ErrorDisplay = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-destructive/10 rounded-xl border border-destructive/20 mx-4 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
    <div className="relative mb-4">
      <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse"></div>
      <div className="relative bg-destructive/10 p-4 rounded-full">
        <AlertCircle className="w-8 h-8 text-destructive animate-pulse" />
      </div>
    </div>
    <h3 className="text-xl font-bold mb-2">Failed to Load Gist</h3>
    <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
    <Button onClick={onRetry} variant="destructive" className="shadow-lg hover:scale-105 transition-transform group">
      <Zap className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
      Try Again
    </Button>
  </div>
);

// Share Button Component with dropdown menu
const ShareButton = ({ url, title, description, compact = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShare = async () => {
    const result = await shareContent({ title, text: description, url });
    if (result.success && result.method === 'native') {
      setShowMenu(false);
    } else if (result.success && result.method === 'clipboard') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setShowMenu(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareUrls = getShareUrls(url, title, description || title);

  return (
    <div className="relative" ref={menuRef}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size={compact ? "icon" : "default"}
            onClick={handleShare}
            className={cn(
              "shadow-sm hover:shadow-md transition-all",
              "hover:scale-105 active:scale-95",
              compact ? "h-9 w-9" : ""
            )}
          >
            {copied ? (
              <Check className={cn("text-green-500", compact ? "w-4 h-4" : "w-4 h-4 mr-2")} />
            ) : (
              <Share2 className={cn(compact ? "w-4 h-4" : "w-4 h-4 mr-2")} />
            )}
            {!compact && <span>{copied ? 'Copied!' : 'Share'}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Share this content</p>
        </TooltipContent>
      </Tooltip>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-card shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-2 space-y-1">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
            >
              <Link2 className="w-4 h-4" />
              <span>Copy Link</span>
            </button>
            <a
              href={shareUrls.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <Twitter className="w-4 h-4" />
              <span>Twitter</span>
            </a>
            <a
              href={shareUrls.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </a>
            <a
              href={shareUrls.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
            <a
              href={shareUrls.email}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Application ---

export default function GistLens() {
  // State
  const [input, setInput] = useState('');
  const [currentGistId, setCurrentGistId] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [view, setView] = useState('home'); // 'home', 'gist', 'user'
  const [gistData, setGistData] = useState(null);
  const [userGists, setUserGists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start minimized on homepage
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [featuredGists, setFeaturedGists] = useState(DEFAULT_FEATURED_GISTS);
  const [loadingFeatured, setLoadingFeatured] = useState(false);

  // Handlers (defined early to avoid hoisting issues)
  const addToHistory = useCallback((data) => {
    setHistory(prev => {
      const newEntry = {
        id: data.id,
        description: data.description || 'No description',
        owner: data.owner?.login || 'Anonymous',
        avatar: data.owner?.avatar_url,
        files: Object.keys(data.files).length,
        date: new Date().toISOString()
      };
      const filtered = prev.filter(h => h.id !== data.id);
      const updated = [newEntry, ...filtered].slice(0, 10);
      localStorage.setItem('gistlens-history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const fetchGist = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    setActiveFileIndex(0);
    
    try {
      const response = await fetch(`https://api.github.com/gists/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) throw new Error('Gist not found. Check the ID or URL.');
        if (response.status === 403) throw new Error('API Rate limit exceeded. Please try again later.');
        throw new Error('Failed to fetch Gist data.');
      }

      const data = await response.json();
      setGistData(data);
      addToHistory(data);
      setInput(`https://gist.github.com/${data.owner?.login || 'anonymous'}/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [addToHistory]);

  const fetchUserGists = useCallback(async (username) => {
    setLoading(true);
    setError(null);
    setUserGists([]);
    
    try {
      const response = await fetch(`https://api.github.com/users/${username}/gists`);
      
      if (!response.ok) {
        if (response.status === 404) throw new Error('User not found. Check the username.');
        if (response.status === 403) throw new Error('API Rate limit exceeded. Please try again later.');
        throw new Error('Failed to fetch user gists.');
      }

      const data = await response.json();
      setUserGists(data);
      setInput(`https://gist.github.com/${username}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch featured gists using smart algorithm with variety on each visit
  const fetchFeaturedGists = useCallback(async () => {
    setLoadingFeatured(true);
    try {
      // Use timestamp-based randomization for variety on each visit
      const seed = Date.now();
      const shuffleWithSeed = (array, seedValue) => {
        const arr = [...array];
        let currentIndex = arr.length;
        let randomValue = seedValue;
        
        // Simple seeded random function
        const seededRandom = () => {
          randomValue = (randomValue * 9301 + 49297) % 233280;
          return randomValue / 233280;
        };
        
        while (currentIndex !== 0) {
          const randomIndex = Math.floor(seededRandom() * currentIndex);
          currentIndex--;
          [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
        }
        return arr;
      };
      
      // Fetch gists from multiple featured users - pick different users each time
      const randomUsers = shuffleWithSeed(FEATURED_USERS, seed).slice(0, 4); // Pick 4 for more variety
      
      const gistPromises = randomUsers.map(user =>
        fetch(`https://api.github.com/users/${user}/gists?per_page=30`)
          .then(res => res.ok ? res.json() : [])
          .catch(() => [])
      );
      
      const results = await Promise.all(gistPromises);
      const allGists = results.flat();
      
      // Shuffle all gists for more variety
      const shuffledGists = shuffleWithSeed(allGists, seed + 1000);
      
      // Use smart algorithm to select best gists
      const smartSelection = getSmartFeaturedGists(shuffledGists);
      
      // Convert to display format
      const featured = smartSelection.slice(0, 3).map((gist) => {
        const firstFile = Object.values(gist.files)[0];
        const ext = firstFile?.filename.split('.').pop()?.toLowerCase();
        
        // Determine category and icon based on file type
        let category = 'Code';
        let icon = Sparkles;
        
        if (ext === 'md' || ext === 'mdx') {
          category = 'Tutorial';
          icon = BookOpen;
        } else if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
          category = 'Code';
          icon = Sparkles;
        } else if (['css', 'scss', 'html'].includes(ext)) {
          category = 'Design';
          icon = Lightbulb;
        }
        
        return {
          id: gist.id,
          title: gist.description || firstFile?.filename || 'Untitled Gist',
          description: gist.description || `By ${gist.owner.login}`,
          category,
          icon,
        };
      });
      
      if (featured.length > 0) {
        setFeaturedGists(featured);
      }
    } catch (err) {
      console.error('Failed to fetch featured gists:', err);
      // Keep default gists on error
    } finally {
      setLoadingFeatured(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem('gistlens-theme');
    if (savedTheme === 'light') setDarkMode(false);

    // Load history
    const savedHistory = localStorage.getItem('gistlens-history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    // Fetch featured gists on mount
    fetchFeaturedGists();

    // Inject PrismJS for fallback syntax highlighting
    const loadPrism = async () => {
      if (!window.Prism) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
        script.async = true;
        script.onload = () => {
          const langs = ['javascript', 'typescript', 'python', 'css', 'html', 'json', 'bash', 'sql', 'markdown', 'jsx', 'tsx', 'yaml', 'go', 'rust', 'java'];
          langs.forEach(lang => {
            const lScript = document.createElement('script');
            lScript.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`;
            document.head.appendChild(lScript);
          });
        };
        document.body.appendChild(script);
      }
    };
    loadPrism();
  }, [fetchFeaturedGists]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('gistlens-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (currentGistId && view === 'gist') {
      fetchGist(currentGistId);
    }
  }, [currentGistId, view, fetchGist]);

  useEffect(() => {
    if (currentUsername && view === 'user') {
      fetchUserGists(currentUsername);
    }
  }, [currentUsername, view, fetchUserGists]);

  useEffect(() => {
    // Reset preview mode when switching files or gists
    setPreviewMode(false);
  }, [activeFileIndex, currentGistId]);

  useEffect(() => {
    if (gistData && !loading && window.Prism && !previewMode) {
      // Short delay to ensure DOM is ready
      setTimeout(() => window.Prism.highlightAll(), 0);
    }
  }, [gistData, loading, activeFileIndex, previewMode]);

  // Dynamic metadata updates based on current view
  useEffect(() => {
    const baseUrl = window.location.origin;
    const currentUrl = window.location.href;
    
    if (view === 'home') {
      updatePageMetadata({
        title: 'GistLens - Beautiful GitHub Gist Viewer',
        description: 'View GitHub gists beautifully with syntax highlighting, markdown preview, user gist browsing, and more. Modern UI with dark mode support.',
        image: `${baseUrl}/icon.png`,
        url: baseUrl,
        type: 'website'
      });
    } else if (view === 'gist' && gistData) {
      const firstFile = Object.values(gistData.files)[0];
      const fileName = firstFile?.filename || 'Gist';
      const description = gistData.description || `View ${fileName} on GistLens`;
      const owner = gistData.owner?.login || 'Anonymous';
      
      updatePageMetadata({
        title: `${fileName} by ${owner} - GistLens`,
        description: description,
        image: gistData.owner?.avatar_url || `${baseUrl}/icon.png`,
        url: currentUrl,
        type: 'article',
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          'name': fileName,
          'description': description,
          'author': {
            '@type': 'Person',
            'name': owner,
            'url': `https://github.com/${owner}`
          },
          'dateModified': gistData.updated_at,
          'codeRepository': gistData.html_url,
          'programmingLanguage': firstFile?.language || 'Code'
        }
      });
    } else if (view === 'user' && currentUsername) {
      updatePageMetadata({
        title: `${currentUsername}'s Gists - GistLens`,
        description: `Browse all public gists by ${currentUsername} on GistLens with beautiful syntax highlighting and markdown preview.`,
        image: userGists[0]?.owner?.avatar_url || `${baseUrl}/icon.png`,
        url: currentUrl,
        type: 'profile'
      });
    }
  }, [view, gistData, currentUsername, userGists]);

  // Handle URL hash for markdown section navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && previewMode) {
        // Short delay to ensure markdown is rendered
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    };

    // Handle initial hash on load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [previewMode, gistData, activeFileIndex]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseInput(input);
    if (parsed) {
      if (parsed.type === 'gist') {
        setCurrentGistId(parsed.value);
        setCurrentUsername(null);
        setView('gist');
      } else if (parsed.type === 'user') {
        setCurrentUsername(parsed.value);
        setCurrentGistId(null);
        setView('user');
      }
      if (window.innerWidth < 1024) setSidebarOpen(false);
    } else {
      setError('Invalid input. Enter a gist ID, gist URL, username, or user URL.');
    }
  };

  const handleFeaturedGistClick = (gistId) => {
    setCurrentGistId(gistId);
    setCurrentUsername(null);
    setView('gist');
    // Open sidebar on desktop when viewing a gist for history access
    if (window.innerWidth >= 1024) setSidebarOpen(true);
    else setSidebarOpen(false);
  };

  const handleUserGistClick = (gistId) => {
    setCurrentGistId(gistId);
    setView('gist');
    // Open sidebar on desktop when viewing a gist for history access
    if (window.innerWidth >= 1024) setSidebarOpen(true);
    else setSidebarOpen(false);
  };

  const handleBackToHome = useCallback(() => {
    setView('home');
    setCurrentGistId(null);
    setCurrentUsername(null);
    setGistData(null);
    setUserGists([]);
    setError(null);
    // Close sidebar when going back to home
    setSidebarOpen(false);
  }, []);

  // Keyboard shortcuts - placed after handleBackToHome is defined
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input[type="text"]')?.focus();
      }
      // Cmd/Ctrl + H to go home
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        handleBackToHome();
      }
      // Cmd/Ctrl + D to toggle dark mode
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        setDarkMode(prev => !prev);
      }
      // Escape to close sidebar on mobile
      if (e.key === 'Escape' && sidebarOpen && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sidebarOpen, handleBackToHome]);

  const handleHistoryClick = (id) => {
    setCurrentGistId(id);
    setCurrentUsername(null);
    setView('gist');
    // Keep sidebar open on desktop, close on mobile
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const removeHistoryItem = (e, id) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem('gistlens-history', JSON.stringify(newHistory));
  };

  const files = gistData ? Object.values(gistData.files) : [];
  const activeFile = files[activeFileIndex];

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn(
        "min-h-screen flex flex-col transition-colors duration-300",
        "bg-gradient-to-br from-background via-background to-muted/20"
      )}>
        
        {/* --- Enhanced Navbar --- */}
        <nav className={cn(
          "sticky top-0 z-30 backdrop-blur-xl border-b px-2 sm:px-4 h-16 flex items-center justify-between gap-2",
          "bg-background/80 shadow-sm"
        )}>
          <div className="flex items-center gap-2 sm:gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hover:bg-primary/10 shrink-0"
                  aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{sidebarOpen ? "Close sidebar" : "Open sidebar"} (Esc)</p>
              </TooltipContent>
            </Tooltip>
          {view !== 'home' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleBackToHome}
                  className="hover:bg-primary/10 shrink-0"
                >
                  <Home className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Return to homepage (⌘H)</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group/logo" onClick={handleBackToHome}>
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-xl blur-md opacity-50 group-hover/logo:opacity-75 transition-opacity"></div>
                  <div className="relative p-1.5 sm:p-2 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-xl group-hover/logo:scale-105 transition-transform">
                    <img 
                      src="/icon.svg" 
                      alt="GistLens Logo" 
                      className="w-5 h-5 sm:w-6 sm:h-6"
                    />
                  </div>
                </div>
                <span className="hidden sm:inline text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent group-hover/logo:scale-105 transition-transform">
                  GistLens
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Go to homepage</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 max-w-2xl mx-2 sm:mx-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste Gist URL/ID, Username, or User URL..."
              className={cn(
                "w-full pl-10 pr-16 sm:pr-20 py-2.5 rounded-xl text-sm font-medium",
                "bg-muted/50 border border-border",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "placeholder:text-muted-foreground",
                "transition-all duration-200"
              )}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 shadow-md"
                >
                  Load
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Load gist or user (⌘K to focus)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </form>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="hover:bg-primary/10 relative overflow-hidden group shrink-0"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle theme (⌘D)</p>
            </TooltipContent>
          </Tooltip>
          
          {gistData && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hidden md:flex hover:bg-primary/10 shrink-0"
                >
                  <a
                    href={gistData.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View on GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View on GitHub</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </nav>

      <div className="flex flex-1 relative overflow-hidden">
        
        {/* --- Enhanced Sidebar --- */}
        <div 
          className={cn(
            "fixed inset-y-0 left-0 z-20 pt-16",
            "transform transition-all duration-300 ease-in-out",
            "backdrop-blur-xl shadow-2xl border-r",
            "bg-card/95",
            "lg:pt-0 lg:shadow-none lg:relative",
            sidebarOpen ? "translate-x-0 w-80" : "-translate-x-full w-80 lg:w-0 lg:border-r-0",
            "overflow-hidden"
          )}
        >
          <ScrollArea className="h-full">
            <div className="p-6 w-80">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent History
                </h3>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="space-y-3">
                {history.length === 0 && (
                  <div className="text-center py-8">
                    <div className="bg-muted/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <FileCode className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground italic">No recently viewed Gists.</p>
                  </div>
                )}
                {history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleHistoryClick(item.id)}
                    className={cn(
                      "group relative p-4 rounded-xl cursor-pointer border transition-all duration-200",
                      "hover:shadow-lg hover:scale-[1.02]",
                      currentGistId === item.id
                        ? "bg-primary/10 border-primary/30 shadow-md"
                        : "bg-card/50 border-border/50 hover:bg-card hover:border-border"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {item.avatar && (
                          <img 
                            src={item.avatar} 
                            alt={item.owner} 
                            className="w-6 h-6 rounded-full ring-2 ring-background" 
                          />
                        )}
                        <span className="text-xs font-semibold">{item.owner}</span>
                      </div>
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={(e) => removeHistoryItem(e, item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium truncate mb-3">
                      {item.description || item.id}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileCode className="w-3 h-3" /> 
                        {item.files}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* --- Main Content --- */}
        <main className="flex-1 overflow-y-auto relative">
          {view === 'home' ? (
            <HomePage 
              onFeaturedGistClick={handleFeaturedGistClick}
              featuredGists={featuredGists}
              loadingFeatured={loadingFeatured}
            />
          ) : loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="flex items-center justify-center h-full p-4">
              <ErrorDisplay 
                message={error} 
                onRetry={() => view === 'gist' ? fetchGist(currentGistId) : fetchUserGists(currentUsername)} 
              />
            </div>
          ) : view === 'user' && userGists.length > 0 ? (
            <UserGistsView 
              username={currentUsername}
              gists={userGists}
              onGistClick={handleUserGistClick}
            />
          ) : gistData ? (
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
              
              {/* Enhanced Header */}
              <div className={cn(
                "p-4 sm:p-6 md:p-8 rounded-2xl border shadow-lg",
                "bg-gradient-to-br from-card via-card to-muted/20",
                "backdrop-blur-sm"
              )}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6">
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl blur-md opacity-50"></div>
                      <img 
                        src={gistData.owner?.avatar_url || 'https://github.com/ghost.png'} 
                        alt="Owner" 
                        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl shadow-lg ring-2 ring-background"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text truncate">
                        {Object.keys(gistData.files)[0]}
                      </h1>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Created by{' '}
                        <span className="font-semibold text-primary hover:underline cursor-pointer">
                          {gistData.owner?.login || 'Anonymous'}
                        </span>
                        {' • '}
                        Updated {new Date(gistData.updated_at).toLocaleDateString()}
                      </p>
                      {gistData.description && (
                        <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-muted/50 border-l-4 border-primary">
                          <p className="text-xs sm:text-sm italic">
                            {gistData.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <ShareButton
                      url={window.location.href}
                      title={`${Object.keys(gistData.files)[0]} by ${gistData.owner?.login || 'Anonymous'}`}
                      description={gistData.description || `Check out this gist on GistLens!`}
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline"
                          asChild
                          className="shadow-sm hover:shadow-md transition-all hover:scale-105 text-xs sm:text-sm group"
                        >
                          <a 
                            href={gistData.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 group-hover:rotate-12 transition-transform" />
                            <span className="hidden sm:inline">Open in GitHub</span>
                            <span className="sm:hidden">GitHub</span>
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Open in GitHub</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-mono rounded-lg border bg-primary/5 border-primary/20 flex items-center gap-1.5 sm:gap-2 hover:bg-primary/10 transition-colors cursor-help">
                          <FileCode className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          {Object.keys(gistData.files).length} File{Object.keys(gistData.files).length !== 1 ? 's' : ''}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Number of files in this gist</p>
                      </TooltipContent>
                    </Tooltip>
                    {gistData.public !== undefined && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-mono rounded-lg border bg-muted/50 flex items-center gap-1.5 cursor-help">
                            {gistData.public ? (
                              <>
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                                <span className="hidden sm:inline">Public</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                                <span className="hidden sm:inline">Private</span>
                              </>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This gist is {gistData.public ? 'publicly' : 'privately'} visible</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced File Viewer */}
              <div className={cn(
                "rounded-2xl border shadow-lg overflow-hidden",
                "bg-card backdrop-blur-sm",
                isFullscreen && "fixed inset-0 z-50 rounded-none m-0 h-screen"
              )}>
                
                {/* Enhanced Tabs */}
                <Tabs 
                  value={activeFileIndex.toString()} 
                  onValueChange={(v) => setActiveFileIndex(parseInt(v))}
                  className="w-full"
                >
                  <div className="bg-muted/30 border-b px-2">
                    <TabsList className="h-auto bg-transparent p-0 gap-1">
                      {files.map((file, idx) => (
                        <TabsTrigger
                          key={file.filename}
                          value={idx.toString()}
                          className={cn(
                            "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                            "px-4 py-3 rounded-t-lg gap-2"
                          )}
                        >
                          <FileIcon filename={file.filename} />
                          <span className="text-sm font-medium">{file.filename}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  {/* Enhanced Toolbar */}
                  {activeFile && (
                    <FileToolbar 
                      file={activeFile} 
                      isFullscreen={isFullscreen}
                      toggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                      previewMode={previewMode}
                      setPreviewMode={setPreviewMode}
                      gistData={gistData}
                    />
                  )}

                  {/* Content Area */}
                  {files.map((file, idx) => (
                    <TabsContent 
                      key={file.filename} 
                      value={idx.toString()}
                      className="m-0"
                    >
                      <div className={cn(
                        "overflow-auto",
                        isFullscreen ? "h-[calc(100vh-140px)]" : "min-h-[400px] max-h-[70vh]"
                      )}>
                        <FileContentRenderer 
                          file={file}
                          previewMode={previewMode}
                          darkMode={darkMode}
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

            </div>
          ) : null}
        </main>

        {/* Back to Top Button */}
        {(view === 'gist' || view === 'user') && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={cn(
                  "fixed bottom-6 right-6 z-40 rounded-full shadow-2xl",
                  "hover:scale-110 transition-all duration-300",
                  "bg-gradient-to-tr from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                )}
              >
                <ChevronRight className="w-5 h-5 rotate-[-90deg]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Back to top</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
}

// --- Sub-components ---

const FileIcon = ({ filename }) => {
  const ext = filename.split('.').pop().toLowerCase();
  const colorMap = {
    js: 'text-yellow-400',
    jsx: 'text-blue-400',
    ts: 'text-blue-500',
    tsx: 'text-blue-500',
    html: 'text-orange-500',
    css: 'text-blue-300',
    py: 'text-green-400',
    json: 'text-yellow-200',
    md: 'text-purple-400',
    mdx: 'text-purple-500',
    go: 'text-cyan-400',
    rs: 'text-orange-600',
    sql: 'text-pink-400',
  };
  return <FileCode className={cn("w-4 h-4", colorMap[ext] || 'text-muted-foreground')} />;
};

const FileToolbar = ({ file, isFullscreen, toggleFullscreen, previewMode, setPreviewMode, gistData }) => {
  const [copied, setCopied] = useState(false);
  const fileType = getFileType(file.filename, file.language);
  const isMarkdown = fileType === 'markdown';
  const isMediaFile = ['image', 'video', 'audio', 'pdf', 'data'].includes(fileType);

  const handleCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = file.content;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const handleDownload = () => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b">
      <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" />
          {isMediaFile ? fileType.charAt(0).toUpperCase() + fileType.slice(1) : (file.language || 'Text')}
        </span>
        <Separator orientation="vertical" className="h-4" />
        <span>{formatBytes(file.size)}</span>
      </div>

      <div className="flex items-center gap-1">
        <div className="mr-1">
          <ShareButton
            url={file.raw_url || window.location.href}
            title={file.filename}
            description={`View ${file.filename} from ${gistData?.owner?.login || 'a gist'} on GistLens`}
            compact={true}
          />
        </div>
        {isMarkdown && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={previewMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="h-8"
              >
                {previewMode ? (
                  <>
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Code</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Preview</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{previewMode ? "View code" : "Preview markdown"}</p>
            </TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className={cn("h-8", copied && "text-green-500")}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy to clipboard</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-8"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download file</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

// FileContentRenderer - Routes to appropriate viewer based on file type
const FileContentRenderer = ({ file, previewMode, darkMode }) => {
  const fileType = getFileType(file.filename, file.language);

  // Markdown preview
  if (previewMode && fileType === 'markdown') {
    return <MarkdownRenderer content={file.content} darkMode={darkMode} />;
  }

  // Image viewer
  if (fileType === 'image') {
    return <ImageViewer file={file} />;
  }

  // Video player
  if (fileType === 'video') {
    return <VideoPlayer file={file} />;
  }

  // Audio player
  if (fileType === 'audio') {
    return <AudioPlayer file={file} />;
  }

  // Data viewer
  if (fileType === 'data') {
    return <DataViewer file={file} />;
  }

  // PDF viewer
  if (fileType === 'pdf') {
    return <PDFViewer file={file} />;
  }

  // Default to code block
  return <CodeBlock content={file.content} language={file.language} />;
};

const CodeBlock = ({ content, language }) => {
  const langClass = language ? `language-${language.toLowerCase()}` : 'language-text';
  const codeRef = useRef(null);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const lines = content.split('\n');

  useEffect(() => {
    if (codeRef.current && window.Prism) {
      window.Prism.highlightElement(codeRef.current);
    }
  }, [content, language]);

  return (
    <div className="relative group">
      {/* Line Numbers Toggle */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLineNumbers(!showLineNumbers)}
          className="h-7 text-xs bg-muted/90 backdrop-blur-sm"
        >
          <Terminal className="w-3 h-3 mr-1.5" />
          {showLineNumbers ? 'Hide' : 'Show'} Lines
        </Button>
      </div>
      
      <div className="flex text-xs sm:text-sm font-mono leading-relaxed bg-muted/20 overflow-x-auto">
        {showLineNumbers && (
          <div className="select-none py-4 pl-4 pr-3 bg-muted/30 border-r border-border/50 text-muted-foreground/50">
            {lines.map((_, idx) => (
              <div key={idx} className="text-right leading-relaxed">
                {idx + 1}
              </div>
            ))}
          </div>
        )}
        <div className="flex-1 p-4 sm:p-6">
          <pre 
            className={cn(
              langClass,
              "!m-0 !p-0 !bg-transparent !shadow-none !border-0"
            )}
            style={{ 
              fontFamily: '"Fira Code", "JetBrains Mono", Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
              tabSize: 4 
            }}
          >
            <code ref={codeRef} className={langClass}>
              {content}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

// --- HomePage Component ---
const HomePage = ({ onFeaturedGistClick, featuredGists, loadingFeatured }) => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      {/* Compact Hero Section */}
      <div className="text-center space-y-3 sm:space-y-4 py-6 sm:py-8 md:py-12">
        <div className="relative inline-block px-4">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-3xl opacity-20 animate-pulse"></div>
          <h1 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            GistLens
          </h1>
        </div>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto px-4">
          View and share GitHub gists with syntax highlighting and markdown preview
        </p>
      </div>

      {/* Featured Gists Section - Now Primary */}
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 sm:gap-3">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-yellow-500 fill-yellow-500 animate-pulse" />
            Featured Gists
          </h2>
          <div className="flex items-center gap-2">
            {loadingFeatured && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                <span className="hidden sm:inline">Loading...</span>
              </div>
            )}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {featuredGists.map((gist) => (
            <FeaturedGistCard
              key={gist.id}
              gist={gist}
              onClick={() => onFeaturedGistClick(gist.id)}
            />
          ))}
        </div>
      </div>

      {/* Quick Usage Guide */}
      <div className="bg-gradient-to-br from-card via-card to-muted/20 rounded-2xl border p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          Quick Start
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <QuickActionCard
            icon={FileCode}
            title="View Gist"
            description="Paste gist URL or ID in the search bar above"
            shortcut="Ctrl+K"
          />
          <QuickActionCard
            icon={User}
            title="Browse User"
            description="Enter a GitHub username to explore their gists"
            shortcut="@username"
          />
          <QuickActionCard
            icon={Download}
            title="Download Files"
            description="Download individual files or entire gists"
            shortcut="Click ↓"
          />
          <QuickActionCard
            icon={Share2}
            title="Share"
            description="Share gists, files, or code snippets easily"
            shortcut="Click 🔗"
          />
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border p-4 sm:p-5 space-y-3">
        <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
          <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Keyboard Shortcuts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <ShortcutBadge keys="Ctrl+K" description="Focus search" />
          <ShortcutBadge keys="Ctrl+H" description="Go home" />
          <ShortcutBadge keys="Ctrl+D" description="Toggle theme" />
          <ShortcutBadge keys="Esc" description="Close sidebar" />
        </div>
      </div>

      {/* Advanced Features */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <CompactFeatureCard
          icon={Eye}
          title="Preview"
          description="Live markdown rendering"
        />
        <CompactFeatureCard
          icon={Code2}
          title="Syntax"
          description="15+ languages supported"
        />
        <CompactFeatureCard
          icon={Clock}
          title="History"
          description="Recently viewed gists"
        />
        <CompactFeatureCard
          icon={Moon}
          title="Dark Mode"
          description="Eye-friendly themes"
        />
      </div>
    </div>
  );
};

const FeaturedGistCard = ({ gist, onClick }) => {
  const Icon = gist.icon;
  return (
    <div
      onClick={onClick}
      className="group relative p-4 sm:p-6 rounded-2xl border bg-card cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative space-y-3 sm:space-y-4">
        <div className="flex items-start justify-between">
          <div className="p-2 sm:p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="px-2 sm:px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary group-hover:bg-primary/20 transition-colors">
            {gist.category}
          </div>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 group-hover:text-primary transition-colors">
            {gist.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {gist.description}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-primary font-medium">
          <span>View Gist</span>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-2 transition-transform duration-300" />
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ icon: Icon, title, description, shortcut }) => (
  <div className="group relative p-3 sm:p-4 rounded-xl border bg-card hover:bg-muted/50 transition-all duration-200 hover:scale-[1.01] overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="relative space-y-2">
      <div className="flex items-center justify-between">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:scale-110 transition-transform" />
        {shortcut && (
          <span className="text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {shortcut}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-xs sm:text-sm font-bold mb-0.5">{title}</h4>
        <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

const ShortcutBadge = ({ keys, description }) => (
  <div className="flex flex-col gap-1 p-2 rounded-lg bg-card/50 border border-border/50">
    <kbd className="text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-muted text-foreground text-center">
      {keys}
    </kbd>
    <span className="text-[9px] sm:text-[10px] text-muted-foreground text-center leading-tight">
      {description}
    </span>
  </div>
);

const CompactFeatureCard = ({ icon: Icon, title, description }) => (
  <div className="group relative p-3 sm:p-4 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="relative space-y-2">
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
      <div>
        <h4 className="text-xs sm:text-sm font-bold mb-0.5 group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-[10px] sm:text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
);

// --- UserGistsView Component ---
const UserGistsView = ({ username, gists, onGistClick }) => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      {/* User Header */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl border shadow-lg bg-gradient-to-br from-card via-card to-muted/20">
        <div className="flex items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {gists[0]?.owner?.avatar_url && (
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl blur-md opacity-50"></div>
                <img
                  src={gists[0].owner.avatar_url}
                  alt={username}
                  className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl shadow-lg ring-2 ring-background"
                />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2">
                <User className="w-6 h-6 sm:w-7 sm:h-7 text-primary shrink-0" />
                <span className="truncate">{username}</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {gists.length} Public Gist{gists.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <ShareButton
              url={window.location.href}
              title={`${username}'s Gists`}
              description={`Browse ${gists.length} public gists by ${username} on GistLens`}
            />
          </div>
        </div>
      </div>

      {/* Gists Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {gists.map((gist) => (
          <UserGistCard key={gist.id} gist={gist} onClick={() => onGistClick(gist.id)} />
        ))}
      </div>
    </div>
  );
};

const UserGistCard = ({ gist, onClick }) => {
  const files = Object.values(gist.files);
  const fileCount = files.length;
  const firstFile = files[0];

  return (
    <div
      onClick={onClick}
      className="group relative p-4 sm:p-5 rounded-xl border bg-card cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative space-y-2 sm:space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileCode className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="font-semibold text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
              {firstFile?.filename || 'Untitled'}
            </h3>
          </div>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all duration-300 shrink-0" />
        </div>
        
        {gist.description && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {gist.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <span className="flex items-center gap-1">
            <FileCode className="w-3 h-3" />
            {fileCount} file{fileCount !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(gist.updated_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};
