'use client';

import { getFileType } from '@/lib/fileTypes';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ImageViewer } from './ImageViewer';
import { VideoPlayer } from './VideoPlayer';
import { AudioPlayer } from './AudioPlayer';
import { DataViewer } from './DataViewer';
import { PDFViewer } from './PDFViewer';
import { GraphViewer } from './GraphViewer';
import type { GistFile } from '@/types';

interface FileRendererProps {
  file: GistFile;
  className?: string;
}

/**
 * FileRenderer Component
 * Routes files to the appropriate viewer based on file type
 */
export function FileRenderer({ file, className }: FileRendererProps) {
  const fileType = getFileType(file.filename, file.language);

  switch (fileType) {
    case 'markdown':
      return <MarkdownRenderer content={file.content} className={className} />;
    
    case 'image':
      return <ImageViewer file={file} className={className} />;
    
    case 'video':
      return <VideoPlayer file={file} className={className} />;
    
    case 'audio':
      return <AudioPlayer file={file} className={className} />;
    
    case 'data':
      return <DataViewer file={file} className={className} />;
    
    case 'graph':
      return <GraphViewer file={file} className={className} />;
    
    case 'pdf':
      return <PDFViewer file={file} className={className} />;
    
    case 'code':
    default:
      // For code files, display as formatted code block
      return (
        <div className={className}>
          <pre className="p-6 bg-muted/20 rounded-lg overflow-auto">
            <code className="text-sm">{file.content}</code>
          </pre>
        </div>
      );
  }
}
