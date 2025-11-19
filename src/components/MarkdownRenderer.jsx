import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Enhanced Markdown Renderer with MDX support
 * Features:
 * - GitHub-flavored markdown
 * - Math rendering (KaTeX)
 * - Syntax highlighting (Prism)
 * - Auto-linked headings
 * - Tables, task lists, and more
 */
export function MarkdownRenderer({ content, darkMode, className }) {
  const [html, setHtml] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);

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
        const [{ unified }, { default: remarkParse }, { default: remarkGfm }, { default: remarkMath }, { default: remarkRehype }, { default: rehypeKatex }, { default: rehypeSlug }, { default: rehypeAutolinkHeadings }, { default: rehypePrism }, { default: rehypeStringify }, { default: rehypeSanitize }] = await Promise.all([
          import('unified'),
          import('remark-parse'),
          import('remark-gfm'),
          import('remark-math'),
          import('remark-rehype'),
          import('rehype-katex'),
          import('rehype-slug'),
          import('rehype-autolink-headings'),
          import('rehype-prism-plus'),
          import('rehype-stringify'),
          import('rehype-sanitize')
        ]);

        const processor = unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkMath)
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
          .use(rehypeSanitize)
          .use(rehypeStringify);

        const result = await processor.process(content);
        setHtml(String(result));
      } catch (error) {
        console.error('Markdown processing error:', error);
        setHtml(`<div class="error-message">
          <p><strong>Error rendering markdown:</strong></p>
          <p>${error.message}</p>
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
        }
        .markdown-renderer .anchor-link:hover {
          opacity: 0.8;
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
      `}</style>
      <div 
        dangerouslySetInnerHTML={{ __html: html }}
        className="p-6"
      />
    </div>
  );
}
