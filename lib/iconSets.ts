/**
 * Icon Set Configuration for File Types
 * Allows users to choose different icon styles for file type indicators
 */

import { LucideIcon, FileText, FileImage, FileVideo, FileAudio, FileJson, FileSpreadsheet, FileCode, FileType as FileTypeIcon, Database, Network, Braces, Sheet } from 'lucide-react';

export type IconSetName = 'lucide' | 'material' | 'minimal';

export interface FileTypeIcons {
  markdown: LucideIcon;
  image: LucideIcon;
  video: LucideIcon;
  audio: LucideIcon;
  data: LucideIcon;
  pdf: LucideIcon;
  code: LucideIcon;
  json: LucideIcon;
  csv: LucideIcon;
  graph: LucideIcon;
}

// Lucide icon set (default)
export const lucideIconSet: FileTypeIcons = {
  markdown: FileText,
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  data: Database,
  pdf: FileTypeIcon,
  code: FileCode,
  json: Braces,
  csv: Sheet,
  graph: Network,
};

// Material-style icon set (using lucide icons that match material design)
export const materialIconSet: FileTypeIcons = {
  markdown: FileText,
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  data: FileSpreadsheet,
  pdf: FileTypeIcon,
  code: FileCode,
  json: FileJson,
  csv: FileSpreadsheet,
  graph: Network,
};

// Minimal icon set (simpler, unified look)
export const minimalIconSet: FileTypeIcons = {
  markdown: FileText,
  image: FileText,
  video: FileText,
  audio: FileText,
  data: FileText,
  pdf: FileText,
  code: FileCode,
  json: FileCode,
  csv: FileText,
  graph: FileText,
};

export const iconSets: Record<IconSetName, FileTypeIcons> = {
  lucide: lucideIconSet,
  material: materialIconSet,
  minimal: minimalIconSet,
};

export const iconSetLabels: Record<IconSetName, string> = {
  lucide: 'Lucide (Default)',
  material: 'Material Design',
  minimal: 'Minimal',
};

export function getIconSet(iconSetName: IconSetName): FileTypeIcons {
  return iconSets[iconSetName] || lucideIconSet;
}

export function getFileTypeIcon(fileType: string, iconSetName: IconSetName = 'lucide'): LucideIcon {
  const iconSet = getIconSet(iconSetName);
  
  // Map file types to icon keys
  const iconKey = fileType as keyof FileTypeIcons;
  return iconSet[iconKey] || iconSet.code;
}
