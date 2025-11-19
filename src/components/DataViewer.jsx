import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { JsonViewer } from '@textea/json-viewer';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * DataViewer Component
 * Displays data files (CSV, TSV, JSON, XML) with sorting, filtering, and search
 */
export function DataViewer({ file, className }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);

  const fileExtension = file.filename.split('.').pop().toLowerCase();

  useEffect(() => {
    parseData();
  }, [file.content, fileExtension]);

  const parseData = () => {
    setIsLoading(true);
    setError(null);

    try {
      if (fileExtension === 'json') {
        // Parse JSON
        const parsed = JSON.parse(file.content);
        setData({ type: 'json', content: parsed });
      } else if (fileExtension === 'csv' || fileExtension === 'tsv') {
        // Parse CSV/TSV
        const delimiter = fileExtension === 'tsv' ? '\t' : ',';
        Papa.parse(file.content, {
          header: true,
          delimiter,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              setError('Error parsing file: ' + results.errors[0].message);
            } else {
              setData({ type: 'table', content: results.data, fields: results.meta.fields });
            }
            setIsLoading(false);
          },
          error: (error) => {
            setError('Failed to parse file: ' + error.message);
            setIsLoading(false);
          }
        });
        return; // Papa.parse is async
      } else if (fileExtension === 'xml') {
        // Parse XML (simple display)
        setData({ type: 'xml', content: file.content });
      } else if (fileExtension === 'yaml' || fileExtension === 'yml') {
        // Display YAML as formatted text
        setData({ type: 'yaml', content: file.content });
      } else {
        setError('Unsupported data format');
      }
      setIsLoading(false);
    } catch (err) {
      setError('Failed to parse file: ' + err.message);
      setIsLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    if (!data || data.type !== 'table') return [];

    let filtered = data.content;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        // Try to parse as numbers
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // String comparison
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }

    return filtered;
  }, [data, searchTerm, sortColumn, sortDirection]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-muted/20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Parsing data...</p>
        </div>
      </div>
    );
  }

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
    <div className={cn("bg-card", className)}>
      {/* JSON Viewer */}
      {data?.type === 'json' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">JSON Data</h3>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
          <div className="rounded-lg border bg-muted/20 p-4 overflow-auto max-h-[600px]">
            <JsonViewer 
              value={data.content} 
              theme="auto"
              defaultInspectDepth={2}
              displayDataTypes={false}
              displayObjectSize={true}
              enableClipboard={true}
            />
          </div>
        </div>
      )}

      {/* Table Viewer (CSV/TSV) */}
      {data?.type === 'table' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search data..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                {filteredAndSortedData.length} rows
              </div>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <div className="rounded-lg border overflow-auto max-h-[600px]">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0 z-10">
                <tr>
                  {data.fields.map((field, idx) => (
                    <th 
                      key={idx}
                      className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-muted/80 transition-colors group"
                      onClick={() => handleSort(field)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{field}</span>
                        <div className="w-4 h-4">
                          {sortColumn === field ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-4 h-4 text-primary" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-primary" />
                            )
                          ) : (
                            <ArrowUpDown className="w-4 h-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData.map((row, idx) => (
                  <tr 
                    key={idx}
                    className="border-t hover:bg-muted/50 transition-colors"
                  >
                    {data.fields.map((field, fieldIdx) => (
                      <td 
                        key={fieldIdx}
                        className="px-4 py-3"
                      >
                        {row[field] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
                {filteredAndSortedData.length === 0 && (
                  <tr>
                    <td 
                      colSpan={data.fields.length}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* XML/YAML Viewer */}
      {(data?.type === 'xml' || data?.type === 'yaml') && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{data.type.toUpperCase()} Data</h3>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
          <div className="rounded-lg border bg-muted/20 p-4 overflow-auto max-h-[600px]">
            <pre className="text-sm font-mono">
              <code>{data.content}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
