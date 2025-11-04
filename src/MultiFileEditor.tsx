import { useState } from 'react';
import FileExplorer from './FileExplorer';
import CodeEditor from './CodeEditor';

interface FileContent {
  path: string;
  content: string;
  language?: string;
}

interface MultiFileEditorProps {
  mainCode: string;
  mainLanguage?: string;
  helperFiles?: FileContent[];
}

export default function MultiFileEditor({ mainCode, mainLanguage = 'typescript', helperFiles = [] }: MultiFileEditorProps) {
  const [activeFile, setActiveFile] = useState('main.ts');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  
  // Combine main file with helper files
  const allFiles: FileContent[] = [
    { path: 'main.ts', content: mainCode, language: mainLanguage },
    ...helperFiles,
  ];

  const activeFileContent = allFiles.find(f => f.path === activeFile) || allFiles[0];

  const fileList = allFiles.map(f => ({
    name: f.path.split('/').pop() || f.path,
    path: f.path,
  }));

  const sidebarWidth = isSidebarExpanded ? 200 : 40;

  return (
    <div className="relative h-full overflow-hidden" style={{ position: 'relative' }}>
      {helperFiles.length > 0 && (
        <FileExplorer
          files={fileList}
          onFileSelect={setActiveFile}
          activeFile={activeFile}
          onExpandedChange={setIsSidebarExpanded}
        />
      )}
      <div className="h-full" style={{ marginLeft: helperFiles.length > 0 ? `${sidebarWidth}px` : '0', transition: 'margin-left 0.2s ease-in-out' }}>
        <CodeEditor
          code={activeFileContent.content}
          language={activeFileContent.language || mainLanguage}
          files={allFiles}
          defaultFile={activeFile}
          activeFile={activeFile}
          onFileChange={setActiveFile}
        />
      </div>
    </div>
  );
}

