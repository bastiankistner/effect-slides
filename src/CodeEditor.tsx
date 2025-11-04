import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { useEffect, useRef, useState } from 'react';

// Configure Monaco workers for Vite
if (typeof window !== 'undefined' && !(window as any).MonacoEnvironment) {
  (window as any).MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker();
      }
      return new editorWorker();
    },
  };
}

// Global flag to track if types have been loaded
let typesLoaded = false;
let typesLoadingPromise: Promise<boolean> | null = null;

// Load Effect types from local dev server
const loadEffectTypes = async (): Promise<boolean> => {
  if (typesLoaded) {
    return true;
  }
  
  if (typesLoadingPromise) {
    return typesLoadingPromise;
  }
  
  typesLoadingPromise = (async () => {
    try {
      // Fetch lists of all type files
      const [effectFilesRes, platformFilesRes] = await Promise.all([
        fetch('/effect-types-list'),
        fetch('/platform-types-list'),
      ]);

      if (!effectFilesRes.ok || !platformFilesRes.ok) {
        throw new Error('Failed to fetch type file lists');
      }

      const effectFiles: string[] = await effectFilesRes.json();
      const platformFiles: string[] = await platformFilesRes.json();

      // Load all Effect type files
      const effectPromises = effectFiles.map(async (fileName) => {
        const response = await fetch(`/effect-types/${fileName}.d.ts`);
        if (response.ok) {
          const content = await response.text();
          // Use virtual paths that match the actual file structure
          // This allows relative imports like "./Effect.js" to resolve correctly
          const virtualPath = `file:///node_modules/effect/dist/dts/${fileName}.d.ts`;
          monaco.languages.typescript.typescriptDefaults.addExtraLib(content, virtualPath);
        }
      });

      // Load all @effect/platform type files
      const platformPromises = platformFiles.map(async (fileName) => {
        const response = await fetch(`/platform-types/${fileName}.d.ts`);
        if (response.ok) {
          const content = await response.text();
          const virtualPath = `file:///node_modules/@effect/platform/dist/dts/${fileName}.d.ts`;
          monaco.languages.typescript.typescriptDefaults.addExtraLib(content, virtualPath);
        }
      });

      await Promise.all([...effectPromises, ...platformPromises]);

      // Configure TypeScript compiler for proper type resolution
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        lib: ['es2020'],
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        baseUrl: 'file:///',
        allowNonTsExtensions: true,
        noEmit: true,
        esModuleInterop: true,
        skipLibCheck: true,
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        strictFunctionTypes: true,
        strictBindCallApply: true,
        strictPropertyInitialization: true,
        resolveJsonModule: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        // Allow resolving .js imports to .d.ts files
        allowJs: true,
        // Configure paths so that package imports resolve correctly
        paths: {
          'effect': ['node_modules/effect/dist/dts/index.d.ts'],
          'effect/*': ['node_modules/effect/dist/dts/*'],
          '@effect/platform': ['node_modules/@effect/platform/dist/dts/index.d.ts'],
          '@effect/platform/*': ['node_modules/@effect/platform/dist/dts/*'],
        },
      });

      // Enable diagnostics
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        noSuggestionDiagnostics: false,
      });

      typesLoaded = true;
      console.log(`Loaded ${effectFiles.length} Effect type files and ${platformFiles.length} Platform type files`);
      return true;
    } catch (e) {
      console.warn('Could not load Effect types:', e);
      typesLoadingPromise = null;
      return false;
    }
  })();
  
  return typesLoadingPromise;
};

interface CodeEditorProps {
  code: string;
  language?: string;
}

export default function CodeEditor({
  code,
  language = 'typescript',
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [typesReady, setTypesReady] = useState(false);

  // Load types first, before rendering editor
  useEffect(() => {
    let cancelled = false;
    
    loadEffectTypes().then(() => {
      if (!cancelled) {
        // Give Monaco time to process types
        setTimeout(() => {
          if (!cancelled) {
            setTypesReady(true);
          }
        }, 500);
      }
    });
    
    return () => {
      cancelled = true;
    };
  }, []);

  // Create editor only after types are ready
  useEffect(() => {
    if (!containerRef.current || !typesReady) return;

    // Clean up previous editor if it exists
    if (editorRef.current) {
      editorRef.current.dispose();
      editorRef.current = null;
    }

    // Create editor instance
    const editor = monaco.editor.create(containerRef.current, {
      value: code,
      language,
      theme: 'vs-dark',
      readOnly: true,
      minimap: { enabled: false },
      lineNumbers: 'on',
      scrollBeyondLastLine: true,
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
      fontSize: 14,
      lineHeight: 22,
      fontFamily: 'Fira Code, Monaco, Menlo, monospace',
      fontLigatures: true,
      wordWrap: 'on',
      automaticLayout: true,
      padding: {
        top: 4,
        bottom: 4,
        left: 4,
        right: 4,
      },
      // Enable hover tooltips
      hover: {
        enabled: true,
        delay: 300,
        above: true,
      },
      // Enable quick info (IntelliSense)
      quickSuggestions: {
        other: false,
        comments: false,
        strings: false,
      },
      suggestOnTriggerCharacters: false,
      acceptSuggestionOnEnter: 'off',
      // Enable parameter hints
      parameterHints: {
        enabled: true,
      },
    });

    editorRef.current = editor;
    
    // Fix hover positioning to use viewport coordinates when using fixed positioning
    const fixHoverPosition = () => {
      const overlayWidgets = containerRef.current?.querySelector(
        '.monaco-overlayWidgets'
      ) as HTMLElement;
      if (overlayWidgets && containerRef.current) {
        const hover = overlayWidgets.querySelector(
          '.monaco-hover'
        ) as HTMLElement;
        if (hover) {
          // Monaco calculates positions relative to editor, but we need viewport-relative for fixed
          const editorRect = containerRef.current.getBoundingClientRect();
          const currentTop = parseFloat(hover.style.top || '0');
          const currentLeft = parseFloat(hover.style.left || '0');
          
          // Convert editor-relative to viewport-relative
          hover.style.top = `${editorRect.top + currentTop}px`;
          hover.style.left = `${editorRect.left + currentLeft}px`;
        }
      }
    };
    
    // Monitor for hover appearance and fix positioning
    const observer = new MutationObserver(() => {
      setTimeout(fixHoverPosition, 10); // Small delay to let Monaco position it first
    });
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
    }

    // Create model with code
    const modelUri = monaco.Uri.parse(
      `file:///slide-${Date.now()}-${Math.random()}.${
        language === 'typescript' ? 'ts' : 'tsx'
      }`
    );
    const model = monaco.editor.createModel(code, language, modelUri);
    editor.setModel(model);
    
    // Force layout update after a brief delay to ensure container is sized
    setTimeout(() => {
      editor.layout();
    }, 100);

    return () => {
      observer.disconnect();
      model.dispose();
      editor.dispose();
      editorRef.current = null;
    };
  }, [code, language, typesReady]);

  if (!typesReady) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading types...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full relative monaco-editor-container"
      style={{ minHeight: '500px', height: '100%', overflow: 'visible' }}
    />
  );
}
