import { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize2, RotateCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GistFile } from '@/types';

interface ImageViewerProps {
  file: GistFile;
  className?: string;
}

/**
 * ImageViewer Component
 * Displays images with pan, zoom, and rotation capabilities
 */
export function ImageViewer({ file, className }: ImageViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get the raw URL first
    if (file.raw_url) {
      setImageUrl(file.raw_url);
      setIsLoading(false);
    } else if (file.content) {
      // If content is available, create a blob URL
      try {
        // Check if content is base64 encoded
        const base64Match = file.content.match(/^data:image\/[a-zA-Z]+;base64,(.+)$/);
        if (base64Match) {
          setImageUrl(file.content);
        } else {
          // Try to decode if it's base64
          try {
            const binary = atob(file.content);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: getMimeType(file.filename) });
            const url = URL.createObjectURL(blob);
            setImageUrl(url);
          } catch (e) {
            // If not base64, just use the raw URL
            setImageUrl(file.raw_url || file.content);
          }
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading image:', err);
        setError('Failed to load image');
        setIsLoading(false);
      }
    } else {
      setError('No image source available');
      setIsLoading(false);
    }

    // Cleanup blob URLs on unmount
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getMimeType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const types: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      bmp: 'image/bmp',
    };
    return types[ext] || 'image/png';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-muted/20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading image...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-muted/20">
        <div className="text-center space-y-2">
          <Maximize2 className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative bg-muted/20", className)}>
      {/* Controls */}
      <TransformWrapper
        initialScale={1}
        minScale={0.1}
        maxScale={8}
        centerOnInit={true}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => zoomIn()}
                className="shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background/90"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => zoomOut()}
                className="shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background/90"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleRotate}
                className="shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background/90"
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => resetTransform()}
                className="shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background/90"
                title="Reset View"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleDownload}
                className="shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background/90"
                title="Download Image"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>

            <TransformComponent
              wrapperClass="!w-full !h-[500px] flex items-center justify-center"
              contentClass="flex items-center justify-center"
            >
              <img
                src={imageUrl || ''}
                alt={file.filename}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  maxWidth: '100%',
                  maxHeight: '500px',
                  objectFit: 'contain',
                  transition: 'transform 0.3s ease',
                }}
                className="select-none"
              />
            </TransformComponent>

            {/* Info Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <div className="bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-xs font-medium">
                {file.filename}
              </div>
              <div className="bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-xs font-medium">
                Drag to pan • Scroll to zoom
              </div>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
