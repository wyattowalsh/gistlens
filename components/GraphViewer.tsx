'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Download, Maximize2, Minimize2, Network, Box, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GistFile } from '@/types';
import { Parser as N3Parser, Store as N3Store } from 'n3';
// @ts-ignore - jsonld types are incomplete
import * as jsonld from 'jsonld';

// Dynamically import graph components (client-side only)
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

interface GraphViewerProps {
  file: GistFile;
  className?: string;
}

interface GraphNode {
  id: string;
  name: string;
  type?: string;
  val?: number;
  color?: string;
}

interface GraphLink {
  source: string;
  target: string;
  label?: string;
  value?: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * GraphViewer Component
 * Displays knowledge graphs from RDF, Turtle, JSON-LD, and other graph formats
 * Supports both 2D and 3D visualization modes
 */
export function GraphViewer({ file, className }: GraphViewerProps) {
  const [data, setData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fileExtension = file.filename.split('.').pop()?.toLowerCase() || '';

  useEffect(() => {
    parseGraphData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.content, fileExtension]);

  const parseGraphData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let graphData: GraphData = { nodes: [], links: [] };

      if (fileExtension === 'jsonld') {
        graphData = await parseJsonLD(file.content);
      } else if (['ttl', 'turtle', 'n3', 'nt'].includes(fileExtension)) {
        graphData = await parseTurtle(file.content);
      } else if (fileExtension === 'rdf') {
        graphData = await parseRDF(file.content);
      } else {
        setError('Unsupported graph format');
        setIsLoading(false);
        return;
      }

      setData(graphData);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Failed to parse graph: ' + errorMessage);
      setIsLoading(false);
    }
  };

  const parseJsonLD = async (content: string): Promise<GraphData> => {
    try {
      const doc = JSON.parse(content);
      const normalized = await jsonld.normalize(doc, {
        algorithm: 'URDNA2015',
        format: 'application/n-quads',
      });

      return parseTurtle(normalized);
    } catch (error) {
      console.error('JSON-LD parsing error:', error);
      throw new Error('Failed to parse JSON-LD');
    }
  };

  const parseTurtle = async (content: string): Promise<GraphData> => {
    return new Promise((resolve, reject) => {
      const parser = new N3Parser();
      const store = new N3Store();
      const nodes = new Map<string, GraphNode>();
      const links: GraphLink[] = [];

      parser.parse(content, (error, quad, prefixes) => {
        if (error) {
          reject(error);
          return;
        }

        if (quad) {
          store.addQuad(quad);

          // Extract subject node
          const subjectId = quad.subject.value;
          if (!nodes.has(subjectId)) {
            nodes.set(subjectId, {
              id: subjectId,
              name: shortenUri(subjectId),
              type: 'subject',
              color: '#3b82f6',
              val: 5,
            });
          }

          // Extract object node
          const objectId = quad.object.value;
          if (quad.object.termType === 'NamedNode') {
            if (!nodes.has(objectId)) {
              nodes.set(objectId, {
                id: objectId,
                name: shortenUri(objectId),
                type: 'object',
                color: '#8b5cf6',
                val: 3,
              });
            }

            // Add link
            links.push({
              source: subjectId,
              target: objectId,
              label: shortenUri(quad.predicate.value),
              value: 1,
            });
          } else if (quad.object.termType === 'Literal') {
            // Create a literal node for display
            const literalId = `${subjectId}_${quad.predicate.value}_literal`;
            if (!nodes.has(literalId)) {
              nodes.set(literalId, {
                id: literalId,
                name: truncateString(objectId, 30),
                type: 'literal',
                color: '#10b981',
                val: 2,
              });
            }

            links.push({
              source: subjectId,
              target: literalId,
              label: shortenUri(quad.predicate.value),
              value: 1,
            });
          }
        } else {
          // Parsing complete
          resolve({
            nodes: Array.from(nodes.values()),
            links,
          });
        }
      });
    });
  };

  const parseRDF = async (content: string): Promise<GraphData> => {
    // For RDF/XML, we'll use N3 parser with format specification
    return parseTurtle(content);
  };

  const shortenUri = (uri: string): string => {
    const prefixes: Record<string, string> = {
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#': 'rdf:',
      'http://www.w3.org/2000/01/rdf-schema#': 'rdfs:',
      'http://www.w3.org/2002/07/owl#': 'owl:',
      'http://xmlns.com/foaf/0.1/': 'foaf:',
      'http://purl.org/dc/terms/': 'dct:',
      'http://schema.org/': 'schema:',
    };

    for (const [full, short] of Object.entries(prefixes)) {
      if (uri.startsWith(full)) {
        return uri.replace(full, short);
      }
    }

    // Extract last part of URI
    const parts = uri.split(/[/#]/);
    return parts[parts.length - 1] || uri;
  };

  const truncateString = (str: string, maxLen: number): string => {
    if (str.length <= maxLen) return str;
    return str.substring(0, maxLen - 3) + '...';
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

  const handleNodeClick = useCallback((node: any) => {
    console.log('Node clicked:', node);
    // Could show a modal with node details
  }, []);

  const handleLinkClick = useCallback((link: any) => {
    console.log('Link clicked:', link);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Parsing graph data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/20">
        <div className="text-center space-y-2">
          <Network className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/20">
        <div className="text-center space-y-2">
          <Network className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <p className="text-sm text-muted-foreground">No graph data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-card", className)}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold">Knowledge Graph</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>{data.nodes.length} nodes, {data.links.length} edges</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === '2d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('2d')}
            >
              <Network className="w-4 h-4 mr-2" />
              2D
            </Button>
            <Button
              variant={viewMode === '3d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('3d')}
            >
              <Box className="w-4 h-4 mr-2" />
              3D
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Graph Visualization */}
        <div
          className={cn(
            'rounded-lg border bg-black/90 overflow-hidden',
            isFullscreen ? 'fixed inset-4 z-50' : 'h-[600px]'
          )}
        >
          {viewMode === '2d' ? (
            <ForceGraph2D
              graphData={data}
              nodeLabel="name"
              nodeColor="color"
              nodeVal="val"
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = node.color || '#999';
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.val || 5, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.fillText(label, node.x, node.y + (node.val || 5) + fontSize);
              }}
              linkLabel="label"
              linkDirectionalArrowLength={3}
              linkDirectionalArrowRelPos={1}
              linkColor={() => '#888'}
              backgroundColor="#000000"
              onNodeClick={handleNodeClick}
              onLinkClick={handleLinkClick}
              enableNodeDrag={true}
              enableZoomInteraction={true}
              enablePanInteraction={true}
            />
          ) : (
            <ForceGraph3D
              graphData={data}
              nodeLabel="name"
              nodeColor="color"
              nodeVal="val"
              linkLabel="label"
              linkDirectionalArrowLength={3}
              linkDirectionalArrowRelPos={1}
              linkColor={() => '#888'}
              backgroundColor="#000000"
              onNodeClick={handleNodeClick}
              onLinkClick={handleLinkClick}
              enableNodeDrag={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
