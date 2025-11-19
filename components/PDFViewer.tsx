import { useState } from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GistFile } from '@/types';

interface PDFViewerProps {
  file: GistFile;
  className?: string;
}

/**
 * PDFViewer Component
 * Displays PDF files using browser's native PDF viewer
 */
export function PDFViewer({ file, className }: PDFViewerProps) {
  const [error, setError] = useState<string | null>(null);
  const pdfUrl = file.raw_url || file.content;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-muted/20">
        <div className="text-center space-y-2">
          <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative bg-muted/20", className)}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleOpenInNewTab}
          className="shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background/90"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in New Tab
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownload}
          className="shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background/90"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      {/* PDF Embed */}
      <div className="w-full h-[700px]">
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0"
          title={file.filename}
          onError={() => setError('Failed to load PDF')}
        />
      </div>

      {/* Filename */}
      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-sm font-medium">
        {file.filename}
      </div>
    </div>
  );
}
