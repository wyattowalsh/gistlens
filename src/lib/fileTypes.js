/**
 * File Type Detection Utilities
 * Categorizes files by their extension and MIME type
 */

// Image file extensions
export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif', 'avif', 'heic', 'heif'];

// Video file extensions
export const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'ogv', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'm4v'];

// Audio file extensions
export const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'oga', 'flac', 'm4a', 'aac', 'wma', 'opus', 'webm'];

// Data file extensions
export const DATA_EXTENSIONS = ['csv', 'tsv', 'json', 'xml', 'yaml', 'yml', 'toml'];

// PDF file extensions
export const PDF_EXTENSIONS = ['pdf'];

// Markdown file extensions
export const MARKDOWN_EXTENSIONS = ['md', 'mdx', 'markdown'];

// Get file extension from filename
export const getFileExtension = (filename) => {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

// Check if file is an image
export const isImageFile = (filename) => {
  const ext = getFileExtension(filename);
  return IMAGE_EXTENSIONS.includes(ext);
};

// Check if file is a video
export const isVideoFile = (filename) => {
  const ext = getFileExtension(filename);
  return VIDEO_EXTENSIONS.includes(ext);
};

// Check if file is audio
export const isAudioFile = (filename) => {
  const ext = getFileExtension(filename);
  return AUDIO_EXTENSIONS.includes(ext);
};

// Check if file is a data file
export const isDataFile = (filename) => {
  const ext = getFileExtension(filename);
  return DATA_EXTENSIONS.includes(ext);
};

// Check if file is PDF
export const isPDFFile = (filename) => {
  const ext = getFileExtension(filename);
  return PDF_EXTENSIONS.includes(ext);
};

// Check if file is markdown
export const isMarkdownFile = (filename, language) => {
  if (language && language.toLowerCase() === 'markdown') return true;
  const ext = getFileExtension(filename);
  return MARKDOWN_EXTENSIONS.includes(ext);
};

// Get file type category
export const getFileType = (filename, language) => {
  if (isMarkdownFile(filename, language)) return 'markdown';
  if (isImageFile(filename)) return 'image';
  if (isVideoFile(filename)) return 'video';
  if (isAudioFile(filename)) return 'audio';
  if (isDataFile(filename)) return 'data';
  if (isPDFFile(filename)) return 'pdf';
  return 'code';
};

// Get MIME type from extension
export const getMimeType = (filename) => {
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
    
    // PDF
    pdf: 'application/pdf',
  };
  
  return mimeTypes[ext] || 'text/plain';
};
