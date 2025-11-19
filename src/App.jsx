import { useState, useEffect, useRef } from 'react';
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
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { cn } from '@/lib/utils';

/**
 * GistLens v2.0 - A Modern GitHub Gist Renderer
 * 
 * Enhanced Features:
 * - Tailwind v4 with shadcn/ui components
 * - Enhanced MDX markdown rendering with math support
 * - Beautiful, modern UI with gradient effects
 * - PrismJS Syntax Highlighting
 * - Dark/Light Mode
 * - Local Storage History
 * - Multi-file support with enhanced tabs
 * - File downloading and raw view
 */

// --- Utility Functions ---

const DEFAULT_GIST_ID = 'bb3bbe2ecc3dd810a14942e66fb87094';

const parseGistId = (input) => {
  if (!input) return null;
  const urlMatch = input.match(/gist\.github\.com\/(?:[^/]+\/)?([a-f0-9]+)/i);
  if (urlMatch) return urlMatch[1];
  if (/^[a-f0-9]+$/i.test(input)) return input;
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

const isMarkdownFile = (filename, language) => {
  if (language && language.toLowerCase() === 'markdown') return true;
  return filename && (filename.toLowerCase().endsWith('.md') || filename.toLowerCase().endsWith('.mdx'));
};

// --- Components ---

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-12">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
    </div>
  </div>
);

const ErrorDisplay = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-destructive/10 rounded-xl border border-destructive/20 mx-4 backdrop-blur-sm">
    <div className="bg-destructive/10 p-4 rounded-full mb-4">
      <AlertCircle className="w-8 h-8 text-destructive" />
    </div>
    <h3 className="text-xl font-bold mb-2">Failed to Load Gist</h3>
    <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
    <Button onClick={onRetry} variant="destructive" className="shadow-lg">
      <Zap className="w-4 h-4 mr-2" />
      Try Again
    </Button>
  </div>
);

// --- Main Application ---

export default function GistLens() {
  // State
  const [input, setInput] = useState('');
  const [currentGistId, setCurrentGistId] = useState(DEFAULT_GIST_ID);
  const [gistData, setGistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Effects
  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem('gistlens-theme');
    if (savedTheme === 'light') setDarkMode(false);

    // Load history
    const savedHistory = localStorage.getItem('gistlens-history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

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
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('gistlens-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    fetchGist(currentGistId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGistId]);

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

  // Handlers
  const fetchGist = async (id) => {
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
  };

  const addToHistory = (data) => {
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = parseGistId(input);
    if (id) {
      setCurrentGistId(id);
      if (window.innerWidth < 1024) setSidebarOpen(false);
    } else {
      setError('Invalid Gist URL or ID format.');
    }
  };

  const handleHistoryClick = (id) => {
    setCurrentGistId(id);
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
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-300",
      "bg-gradient-to-br from-background via-background to-muted/20"
    )}>
      
      {/* --- Enhanced Navbar --- */}
      <nav className={cn(
        "sticky top-0 z-30 backdrop-blur-xl border-b px-4 h-16 flex items-center justify-between",
        "bg-background/80 shadow-sm"
      )}>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-primary/10"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-xl blur-md opacity-75"></div>
              <div className="relative p-2 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-xl">
                <Code2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="hidden sm:inline text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              GistLens
            </span>
            <span className="hidden sm:inline px-2 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary rounded-full border border-primary/20">
              v2.0
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 max-w-2xl mx-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste GitHub Gist URL or ID..."
              className={cn(
                "w-full pl-10 pr-20 py-2.5 rounded-xl text-sm font-medium",
                "bg-muted/50 border border-border",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "placeholder:text-muted-foreground",
                "transition-all duration-200"
              )}
            />
            <Button 
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 shadow-md"
            >
              Load
            </Button>
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="hover:bg-primary/10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </Button>
          
          {gistData && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hidden md:flex hover:bg-primary/10"
            >
              <a
                href={gistData.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-5 h-5" />
              </a>
            </Button>
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
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="flex items-center justify-center h-full p-4">
              <ErrorDisplay message={error} onRetry={() => fetchGist(currentGistId)} />
            </div>
          ) : gistData ? (
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
              
              {/* Enhanced Header */}
              <div className={cn(
                "p-6 md:p-8 rounded-2xl border shadow-lg",
                "bg-gradient-to-br from-card via-card to-muted/20",
                "backdrop-blur-sm"
              )}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl blur-md opacity-50"></div>
                      <img 
                        src={gistData.owner?.avatar_url || 'https://github.com/ghost.png'} 
                        alt="Owner" 
                        className="relative w-14 h-14 rounded-xl shadow-lg ring-2 ring-background"
                      />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                        {Object.keys(gistData.files)[0]}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        Created by{' '}
                        <span className="font-semibold text-primary hover:underline cursor-pointer">
                          {gistData.owner?.login || 'Anonymous'}
                        </span>
                        {' • '}
                        Updated {new Date(gistData.updated_at).toLocaleDateString()}
                      </p>
                      {gistData.description && (
                        <div className="mt-4 p-3 rounded-lg bg-muted/50 border-l-4 border-primary">
                          <p className="text-sm italic">
                            {gistData.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button 
                      variant="outline"
                      asChild
                      className="shadow-sm hover:shadow-md transition-shadow"
                    >
                      <a 
                        href={gistData.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in GitHub
                      </a>
                    </Button>
                    <div className="px-4 py-2 text-sm font-mono rounded-lg border bg-muted/50 flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-primary" />
                      {Object.keys(gistData.files).length} File(s)
                    </div>
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
                        {previewMode && isMarkdownFile(file.filename, file.language) ? (
                          <MarkdownRenderer content={file.content} darkMode={darkMode} />
                        ) : (
                          <CodeBlock 
                            content={file.content} 
                            language={file.language} 
                          />
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

            </div>
          ) : null}
        </main>
      </div>
    </div>
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

const FileToolbar = ({ file, isFullscreen, toggleFullscreen, previewMode, setPreviewMode }) => {
  const [copied, setCopied] = useState(false);
  const isMarkdown = isMarkdownFile(file.filename, file.language);

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
          {file.language || 'Text'}
        </span>
        <Separator orientation="vertical" className="h-4" />
        <span>{formatBytes(file.size)}</span>
      </div>

      <div className="flex items-center gap-1">
        {isMarkdown && (
          <Button
            variant={previewMode ? "default" : "ghost"}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="h-8"
          >
            {previewMode ? (
              <>
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Code
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                Preview
              </>
            )}
          </Button>
        )}

        <Button 
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className={cn("h-8", copied && "text-green-500")}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy
            </>
          )}
        </Button>
        
        <Button 
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="h-8"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          <span className="hidden sm:inline">Download</span>
        </Button>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <Button 
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="h-8 w-8"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </div>
  );
};

const CodeBlock = ({ content, language }) => {
  const langClass = language ? `language-${language.toLowerCase()}` : 'language-text';
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current && window.Prism) {
      window.Prism.highlightElement(codeRef.current);
    }
  }, [content, language]);

  return (
    <div className="text-sm font-mono leading-relaxed p-6 bg-muted/20">
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
  );
};
