import { useState } from 'react';

interface File {
  name: string;
  path: string;
  isActive?: boolean;
}

interface FileExplorerProps {
  files: File[];
  onFileSelect: (path: string) => void;
  activeFile: string;
  onExpandedChange?: (expanded: boolean) => void;
}

export default function FileExplorer({ files, onFileSelect, activeFile, onExpandedChange }: FileExplorerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandedChange?.(newExpanded);
  };

  return (
    <div 
      className="bg-gray-900 border-r border-gray-700 flex flex-col absolute left-0 top-0 bottom-0 z-10" 
      style={{ width: isExpanded ? '200px' : '40px', transition: 'width 0.2s ease-in-out' }}
    >
      {/* Collapse/Expand Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="p-2 hover:bg-gray-800 border-b border-gray-700 flex items-center justify-center"
        aria-label={isExpanded ? 'Collapse explorer' : 'Expand explorer'}
      >
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isExpanded ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          )}
        </svg>
      </button>

      {isExpanded && (
        <div className="flex-1 overflow-auto py-2">
          <div className="px-2 text-xs text-gray-500 uppercase mb-2">Files</div>
          {files.map((file) => (
            <button
              key={file.path}
              type="button"
              onClick={() => onFileSelect(file.path)}
              className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors ${
                activeFile === file.path
                  ? 'bg-gray-800 text-effect-primary border-r-2 border-effect-primary'
                  : 'text-gray-300'
              }`}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="truncate">{file.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

