/**
 * File Type Detection Utilities
 * Categorizes files by their extension and MIME type
 */

// Image file extensions
export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif', 'avif', 'heic', 'heif'] as const;

// Video file extensions
export const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'ogv', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'm4v'] as const;

// Audio file extensions
export const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'oga', 'flac', 'm4a', 'aac', 'wma', 'opus', 'webm'] as const;

// Data file extensions
export const DATA_EXTENSIONS = ['csv', 'tsv', 'json', 'xml', 'yaml', 'yml', 'toml'] as const;

// Graph/RDF file extensions
export const GRAPH_EXTENSIONS = ['ttl', 'turtle', 'rdf', 'jsonld', 'n3', 'nt', 'nq', 'trig', 'owl'] as const;

// PDF file extensions
export const PDF_EXTENSIONS = ['pdf'] as const;

// Markdown file extensions
export const MARKDOWN_EXTENSIONS = ['md', 'mdx', 'markdown'] as const;

export type FileType = 'markdown' | 'image' | 'video' | 'audio' | 'data' | 'pdf' | 'code' | 'graph';

// Get file extension from filename
export const getFileExtension = (filename: string | undefined): string => {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

// Check if file is an image
export const isImageFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return IMAGE_EXTENSIONS.includes(ext as any);
};

// Check if file is a video
export const isVideoFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return VIDEO_EXTENSIONS.includes(ext as any);
};

// Check if file is audio
export const isAudioFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return AUDIO_EXTENSIONS.includes(ext as any);
};

// Check if file is a data file
export const isDataFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return DATA_EXTENSIONS.includes(ext as any);
};

// Check if file is PDF
export const isPDFFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return PDF_EXTENSIONS.includes(ext as any);
};

// Check if file is markdown
export const isMarkdownFile = (filename: string, language?: string): boolean => {
  if (language && language.toLowerCase() === 'markdown') return true;
  const ext = getFileExtension(filename);
  return MARKDOWN_EXTENSIONS.includes(ext as any);
};

// Check if file is a graph/RDF file
export const isGraphFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return GRAPH_EXTENSIONS.includes(ext as any);
};

// Get file type category
export const getFileType = (filename: string, language?: string): FileType => {
  if (isMarkdownFile(filename, language)) return 'markdown';
  if (isImageFile(filename)) return 'image';
  if (isVideoFile(filename)) return 'video';
  if (isAudioFile(filename)) return 'audio';
  if (isGraphFile(filename)) return 'graph';
  if (isDataFile(filename)) return 'data';
  if (isPDFFile(filename)) return 'pdf';
  return 'code';
};

// Get MIME type from extension
export const getMimeType = (filename: string): string => {
  const ext = getFileExtension(filename);
  
  const mimeTypes = {
    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    avif: 'image/avif',
    
    // Videos
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    ogv: 'video/ogg',
    mov: 'video/quicktime',
    
    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    oga: 'audio/ogg',
    flac: 'audio/flac',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    opus: 'audio/opus',
    
    // Data
    csv: 'text/csv',
    tsv: 'text/tab-separated-values',
    json: 'application/json',
    xml: 'application/xml',
    yaml: 'application/x-yaml',
    yml: 'application/x-yaml',
    
    // Graph/RDF
    ttl: 'text/turtle',
    turtle: 'text/turtle',
    rdf: 'application/rdf+xml',
    jsonld: 'application/ld+json',
    n3: 'text/n3',
    nt: 'application/n-triples',
    nq: 'application/n-quads',
    trig: 'application/trig',
    owl: 'application/owl+xml',
    
    // PDF
    pdf: 'application/pdf',
  } as const;
  
  return mimeTypes[ext as keyof typeof mimeTypes] || 'text/plain';
};
