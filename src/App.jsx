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
  FileText
} from 'lucide-react';

/**
 * GistLens - A Modern GitHub Gist Renderer
 * 
 * Features:
 * - Fetches public Gists via GitHub API
 * - PrismJS Syntax Highlighting
 * - Markdown Preview with GitHub Styling
 * - Dark/Light Mode
 * - Local Storage History
 * - Multi-file support
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
  return filename && filename.toLowerCase().endsWith('.md');
};

// --- Components ---

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-12">
    <div className="relative w-12 h-12">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full opacity-25"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
  </div>
);

const ErrorDisplay = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30 mx-4">
    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Failed to Load Gist</h3>
    <p className="text-red-600 dark:text-red-300 mb-6 max-w-md">{message}</p>
    <button 
      onClick={onRetry}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
    >
      Try Again
    </button>
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

    // Inject Scripts (Prism, Marked, DOMPurify) and Styles
    const loadResources = async () => {
      // GitHub Markdown CSS
      if (!document.getElementById('github-markdown-css')) {
        const link = document.createElement('link');
        link.id = 'github-markdown-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css';
        document.head.appendChild(link);
      }

      // Marked (Markdown Parser)
      if (!window.marked) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.2/marked.min.js';
        document.body.appendChild(script);
      }

      // DOMPurify (Sanitizer)
      if (!window.DOMPurify) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js';
        document.body.appendChild(script);
      }

      // PrismJS
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
    loadResources();
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
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* --- Navbar --- */}
      <nav className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 h-16 flex items-center justify-between transition-colors duration-300 ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="p-1.5 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-lg">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">
              GistLens
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 max-w-2xl mx-4 relative">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste GitHub Gist URL or ID..."
              className={`block w-full pl-10 pr-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 focus:ring-2 focus:outline-none ${
                darkMode 
                  ? 'bg-slate-800/50 border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 placeholder-slate-500 text-white' 
                  : 'bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 placeholder-slate-400 text-slate-900 shadow-sm'
              }`}
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button 
                type="submit"
                className="px-3 py-1 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Load
              </button>
            </div>
          </div>
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {gistData && (
             <a
             href={gistData.html_url}
             target="_blank"
             rel="noopener noreferrer"
             className={`hidden md:flex p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
           >
             <Github className="w-5 h-5" />
           </a>
          )}
        </div>
      </nav>

      <div className="flex flex-1 relative overflow-hidden">
        
        {/* --- Sidebar --- */}
        <div 
          className={`
            fixed inset-y-0 left-0 z-20 
            transform transition-all duration-300 ease-in-out
            ${darkMode ? 'bg-slate-900/95 border-r border-slate-800' : 'bg-white/95 border-r border-slate-200'} 
            backdrop-blur-xl pt-16 shadow-2xl
            lg:pt-0 lg:shadow-none lg:transform-none lg:relative
            ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72 lg:w-0 lg:border-r-0'}
            overflow-hidden
          `}
        >
          <div className="p-4 h-full overflow-y-auto w-72">
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Recent History
            </h3>
            <div className="space-y-2">
              {history.length === 0 && (
                <p className="text-sm text-slate-500 italic">No recently viewed Gists.</p>
              )}
              {history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleHistoryClick(item.id)}
                  className={`group relative p-3 rounded-xl cursor-pointer border transition-all duration-200 ${
                    currentGistId === item.id
                      ? (darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200')
                      : (darkMode ? 'bg-slate-800/50 border-transparent hover:bg-slate-800' : 'bg-white border-transparent hover:bg-slate-50')
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                       {item.avatar && <img src={item.avatar} alt={item.owner} className="w-5 h-5 rounded-full" />}
                       <span className={`text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.owner}</span>
                    </div>
                    <button 
                      onClick={(e) => removeHistoryItem(e, item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className={`text-sm font-medium truncate mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {item.description || item.id}
                  </p>
                  <div className={`flex items-center gap-3 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                     <span className="flex items-center gap-1"><FileCode className="w-3 h-3" /> {item.files}</span>
                     <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* --- Main Content --- */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <ErrorDisplay message={error} onRetry={() => fetchGist(currentGistId)} />
            </div>
          ) : gistData ? (
            <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
              
              {/* Header */}
              <div className={`p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img 
                      src={gistData.owner?.avatar_url || 'https://github.com/ghost.png'} 
                      alt="Owner" 
                      className="w-12 h-12 rounded-xl shadow-sm"
                    />
                    <div>
                      <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {Object.keys(gistData.files)[0]}
                      </h1>
                      <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Created by <span className="font-medium text-blue-500 hover:underline cursor-pointer">{gistData.owner?.login || 'Anonymous'}</span>
                        {' • '}
                        Last updated {new Date(gistData.updated_at).toLocaleDateString()}
                      </p>
                      {gistData.description && (
                         <p className={`mt-3 text-sm italic border-l-2 pl-3 ${darkMode ? 'text-slate-300 border-slate-600' : 'text-slate-700 border-slate-300'}`}>
                           {gistData.description}
                         </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a 
                      href={gistData.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        darkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </a>
                    <div className={`px-4 py-2 text-sm font-mono rounded-lg border ${darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                      {Object.keys(gistData.files).length} File(s)
                    </div>
                  </div>
                </div>
              </div>

              {/* File Viewer */}
              <div className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} ${isFullscreen ? 'fixed inset-0 z-50 rounded-none m-0 h-screen' : ''}`}>
                
                {/* Tabs */}
                <div className={`flex items-center overflow-x-auto scrollbar-hide border-b ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  {files.map((file, idx) => (
                    <button
                      key={file.filename}
                      onClick={() => setActiveFileIndex(idx)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                        idx === activeFileIndex
                          ? 'border-blue-500 text-blue-500 bg-blue-50/5 dark:bg-blue-900/10'
                          : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <FileIcon filename={file.filename} />
                      {file.filename}
                    </button>
                  ))}
                </div>

                {/* Toolbar */}
                {activeFile && (
                  <FileToolbar 
                    file={activeFile} 
                    darkMode={darkMode}
                    isFullscreen={isFullscreen}
                    toggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                    previewMode={previewMode}
                    setPreviewMode={setPreviewMode}
                  />
                )}

                {/* Content Area */}
                <div className={`relative overflow-auto ${isFullscreen ? 'h-[calc(100vh-112px)]' : 'min-h-[300px] max-h-[70vh]'}`}>
                  {activeFile && (
                    previewMode && isMarkdownFile(activeFile.filename, activeFile.language) ? (
                      <MarkdownRenderer content={activeFile.content} darkMode={darkMode} />
                    ) : (
                      <CodeBlock 
                        content={activeFile.content} 
                        language={activeFile.language} 
                        filename={activeFile.filename}
                        darkMode={darkMode}
                      />
                    )
                  )}
                </div>
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
    go: 'text-cyan-400',
    rs: 'text-orange-600',
    sql: 'text-pink-400',
  };
  return <FileCode className={`w-4 h-4 ${colorMap[ext] || 'text-slate-400'}`} />;
};

const FileToolbar = ({ file, darkMode, isFullscreen, toggleFullscreen, previewMode, setPreviewMode }) => {
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
    <div className={`flex items-center justify-between px-4 py-2 text-xs font-medium border-b ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" />
          {file.language || 'Text'}
        </span>
        <span className="w-px h-4 bg-slate-300 dark:bg-slate-600"></span>
        <span>{formatBytes(file.size)}</span>
      </div>

      <div className="flex items-center gap-2">
        {isMarkdown && (
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all mr-2 ${
              previewMode
              ? 'bg-blue-500 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {previewMode ? <FileText className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {previewMode ? 'Code' : 'Preview'}
          </button>
        )}

        <button 
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all ${
            copied 
              ? 'bg-green-500/10 text-green-500' 
              : 'hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        
        <button 
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Download File"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Download</span>
        </button>

        <button 
          onClick={toggleFullscreen}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

const MarkdownRenderer = ({ content, darkMode }) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (window.marked && window.DOMPurify) {
      try {
        const rawHtml = window.marked.parse(content);
        const cleanHtml = window.DOMPurify.sanitize(rawHtml);
        setHtml(cleanHtml);
      } catch (e) {
        console.error("Markdown parsing error", e);
        setHtml('<p>Error rendering markdown.</p>');
      }
    } else {
      setHtml('<p>Loading Markdown engine...</p>');
    }
  }, [content]);

  return (
    <div className={`p-8 overflow-y-auto ${darkMode ? 'bg-[#0d1117]' : 'bg-white'}`}>
      {/* Robust GitHub Dark Mode Overrides.
        The github-markdown-css library relies on media queries for dark mode.
        Since we have a manual toggle, we must manually override these variables 
        to force the dark theme when our app is in dark mode.
      */}
      {darkMode && (
        <style>{`
          .markdown-body {
            color-scheme: dark;
            --color-prettylights-syntax-comment: #8b949e;
            --color-prettylights-syntax-constant: #79c0ff;
            --color-prettylights-syntax-entity: #d2a8ff;
            --color-prettylights-syntax-storage-modifier-import: #c9d1d9;
            --color-prettylights-syntax-entity-tag: #7ee787;
            --color-prettylights-syntax-keyword: #ff7b72;
            --color-prettylights-syntax-string: #a5d6ff;
            --color-prettylights-syntax-variable: #ffa657;
            --color-prettylights-syntax-string-regexp: #7ee787;
            
            /* Foreground (Text) */
            --color-fg-default: #c9d1d9;
            --color-fg-muted: #8b949e;
            --color-fg-subtle: #484f58;
            
            /* Backgrounds */
            --color-canvas-default: #0d1117;
            --color-canvas-subtle: #161b22;
            --color-canvas-inset: #010409;
            
            /* Borders */
            --color-border-default: #30363d;
            --color-border-muted: #21262d;
            
            /* Links & Accents */
            --color-accent-fg: #58a6ff;
            --color-accent-emphasis: #1f6feb;
            
            /* Elements */
            --color-neutral-muted: rgba(110,118,129,0.4);
            --color-attention-subtle: rgba(187,128,9,0.15);
            --color-danger-fg: #f85149;
          }
          .markdown-body img {
            background-color: transparent;
          }
        `}</style>
      )}
      <div 
        className="markdown-body" 
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ 
          backgroundColor: 'transparent',
          fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"'
        }} 
      />
    </div>
  );
};

const CodeBlock = ({ content, language, darkMode }) => {
  const langClass = language ? `language-${language.toLowerCase()}` : 'language-text';
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current && window.Prism) {
      window.Prism.highlightElement(codeRef.current);
    }
  }, [content, language, darkMode]);

  return (
    <div className={`text-sm font-mono leading-relaxed p-4 overflow-x-auto ${darkMode ? 'bg-[#1d1f21]' : 'bg-white'}`}>
      <pre 
        className={`${langClass} !m-0 !p-0 !bg-transparent !shadow-none`}
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
