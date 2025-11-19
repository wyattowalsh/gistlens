import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  darkMode?: boolean;
  className?: string;
}

/**
 * Enhanced Markdown Renderer with MDX support
 * Features:
 * - GitHub-flavored markdown
 * - Math rendering (KaTeX)
 * - Syntax highlighting (Prism)
 * - Auto-linked headings
 * - Tables, task lists, and more
 * - Emoji support
 * - Footnotes
 * - Directives (custom containers)
 * - Table of contents
 * - External link handling
 * - Better line breaks
 */
export function MarkdownRenderer({ content, darkMode, className }: MarkdownRendererProps) {
  const [html, setHtml] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  useEffect(() => {
    // Load KaTeX CSS
    if (!document.getElementById('katex-css')) {
      const link = document.createElement('link');
      link.id = 'katex-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      document.head.appendChild(link);
    }

    const processMarkdown = async () => {
      if (!content) {
        setHtml('');
        setIsProcessing(false);
        return;
      }

      try {
        // Dynamic import for better performance
        const [
          { unified },
          { default: remarkParse },
          { default: remarkGfm },
          { default: remarkMath },
          { default: remarkEmoji },
          { default: remarkDirective },
          { default: remarkBreaks },
          { default: remarkUnwrapImages },
          { default: remarkRehype },
          { default: rehypeKatex },
          { default: rehypeSlug },
          { default: rehypeAutolinkHeadings },
          { default: rehypePrism },
          { default: rehypeExternalLinks },
          { default: rehypeStringify },
          { default: rehypeSanitize }
        ] = await Promise.all([
          import('unified'),
          import('remark-parse'),
          import('remark-gfm'),
          import('remark-math'),
          import('remark-emoji'),
          import('remark-directive'),
          import('remark-breaks'),
          import('remark-unwrap-images'),
          import('remark-rehype'),
          import('rehype-katex'),
          import('rehype-slug'),
          import('rehype-autolink-headings'),
          import('rehype-prism-plus'),
          import('rehype-external-links'),
          import('rehype-stringify'),
          import('rehype-sanitize')
        ]);

        const processor = unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkMath)
          .use(remarkEmoji)
          .use(remarkDirective)
          .use(remarkBreaks)
          .use(remarkUnwrapImages)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeKatex)
          .use(rehypeSlug)
          .use(rehypeAutolinkHeadings, {
            behavior: 'wrap',
            properties: {
              className: ['anchor-link']
            }
          })
          .use(rehypePrism, { 
            ignoreMissing: true,
            showLineNumbers: true
          })
          .use(rehypeExternalLinks, {
            target: '_blank',
            rel: ['noopener', 'noreferrer'],
            properties: {
              className: ['external-link']
            }
          })
          .use(rehypeSanitize)
          .use(rehypeStringify);

        const result = await processor.process(content);
        setHtml(String(result));
      } catch (error) {
        console.error('Markdown processing error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setHtml(`<div class="error-message">
          <p><strong>Error rendering markdown:</strong></p>
          <p>${errorMessage}</p>
        </div>`);
      } finally {
        setIsProcessing(false);
      }
    };

    setIsProcessing(true);
    processMarkdown();
  }, [content]);

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn(
      "markdown-renderer prose prose-slate dark:prose-invert max-w-none",
      "prose-headings:scroll-mt-20 prose-headings:font-bold",
      "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
      "prose-code:before:content-none prose-code:after:content-none",
      "prose-pre:bg-muted prose-pre:border prose-pre:border-border",
      "prose-img:rounded-lg prose-img:shadow-lg",
      "prose-table:border prose-table:border-border",
      "prose-th:bg-muted prose-td:border prose-td:border-border",
      "prose-blockquote:border-l-primary prose-blockquote:border-l-4",
      "prose-hr:border-border",
      darkMode && "prose-invert",
      className
    )}>
      <style>{`
        .markdown-renderer .anchor-link {
          text-decoration: none;
          color: inherit;
          position: relative;
        }
        .markdown-renderer .anchor-link:hover {
          opacity: 0.8;
        }
        .markdown-renderer .anchor-link:target {
          animation: highlight-section 2s ease-in-out;
        }
        @keyframes highlight-section {
          0%, 100% { background-color: transparent; }
          50% { background-color: rgba(59, 130, 246, 0.1); }
        }
        .markdown-renderer .task-list-item {
          list-style: none;
        }
        .markdown-renderer .task-list-item input[type="checkbox"] {
          margin-right: 0.5rem;
        }
        .markdown-renderer table {
          display: block;
          overflow-x: auto;
          width: 100%;
        }
        .markdown-renderer pre {
          position: relative;
          overflow-x: auto;
        }
        .markdown-renderer pre code {
          display: block;
          padding: 1rem;
          line-height: 1.5;
        }
        .markdown-renderer .line-numbers-rows {
          position: absolute;
          pointer-events: none;
          top: 0;
          left: 0;
          padding: 1rem 0;
          border-right: 1px solid rgba(128, 128, 128, 0.2);
          user-select: none;
        }
        .markdown-renderer .line-numbers-rows > span {
          display: block;
          counter-increment: linenumber;
        }
        .markdown-renderer .line-numbers-rows > span:before {
          content: counter(linenumber);
          color: #999;
          display: block;
          padding-right: 0.8em;
          text-align: right;
        }
        .markdown-renderer .external-link::after {
          content: "↗";
          font-size: 0.8em;
          margin-left: 0.2em;
          opacity: 0.7;
        }
        .markdown-renderer .footnotes {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 2px solid var(--border);
          font-size: 0.9em;
        }
        .markdown-renderer .footnotes li {
          margin-bottom: 0.5rem;
        }
        .markdown-renderer sup {
          line-height: 0;
        }
        .markdown-renderer .directive {
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 0.5rem;
          border-left: 4px solid;
        }
        .markdown-renderer .directive-note {
          background-color: rgba(59, 130, 246, 0.1);
          border-color: rgb(59, 130, 246);
        }
        .markdown-renderer .directive-warning {
          background-color: rgba(234, 179, 8, 0.1);
          border-color: rgb(234, 179, 8);
        }
        .markdown-renderer .directive-danger {
          background-color: rgba(239, 68, 68, 0.1);
          border-color: rgb(239, 68, 68);
        }
        .markdown-renderer .directive-tip {
          background-color: rgba(34, 197, 94, 0.1);
          border-color: rgb(34, 197, 94);
        }
      `}</style>
      <div 
        dangerouslySetInnerHTML={{ __html: html }}
        className="p-6"
      />
    </div>
  );
}
