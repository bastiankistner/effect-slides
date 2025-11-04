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
      const [effectFilesRes, platformFilesRes, aiFilesRes] = await Promise.all([
        fetch('/effect-types-list'),
        fetch('/platform-types-list'),
        fetch('/ai-types-list'),
      ]);

      if (!effectFilesRes.ok || !platformFilesRes.ok || !aiFilesRes.ok) {
        throw new Error('Failed to fetch type file lists');
      }

      const effectFiles: string[] = await effectFilesRes.json();
      const platformFiles: string[] = await platformFilesRes.json();
      const aiFiles: string[] = await aiFilesRes.json();

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

      // Load all @effect/ai type files
      const aiPromises = aiFiles.map(async (fileName) => {
        const response = await fetch(`/ai-types/${fileName}.d.ts`);
        if (response.ok) {
          const content = await response.text();
          const virtualPath = `file:///node_modules/@effect/ai/dist/dts/${fileName}.d.ts`;
          monaco.languages.typescript.typescriptDefaults.addExtraLib(content, virtualPath);
        }
      });

      // Load all @effect/ai-openai type files
      const aiOpenaiFiles = [
        'index', 'OpenAiClient', 'OpenAiConfig', 'OpenAiLanguageModel', 
        'OpenAiEmbeddingModel', 'OpenAiTokenizer', 'OpenAiTool', 
        'OpenAiTelemetry', 'Generated'
      ];
      const aiOpenaiPromises = aiOpenaiFiles.map(async (fileName) => {
        const response = await fetch(`/node_modules/@effect/ai-openai/dist/dts/${fileName}.d.ts`);
        if (response.ok) {
          const content = await response.text();
          const virtualPath = `file:///node_modules/@effect/ai-openai/dist/dts/${fileName}.d.ts`;
          monaco.languages.typescript.typescriptDefaults.addExtraLib(content, virtualPath);
        }
      });

      // Load all @effect/ai-anthropic type files
      const aiAnthropicFiles = [
        'index', 'AnthropicClient', 'AnthropicConfig', 'AnthropicLanguageModel',
        'AnthropicTokenizer', 'AnthropicTool', 'Generated'
      ];
      const aiAnthropicPromises = aiAnthropicFiles.map(async (fileName) => {
        const response = await fetch(`/node_modules/@effect/ai-anthropic/dist/dts/${fileName}.d.ts`);
        if (response.ok) {
          const content = await response.text();
          const virtualPath = `file:///node_modules/@effect/ai-anthropic/dist/dts/${fileName}.d.ts`;
          monaco.languages.typescript.typescriptDefaults.addExtraLib(content, virtualPath);
        }
      });

      await Promise.all([...effectPromises, ...platformPromises, ...aiPromises, ...aiOpenaiPromises, ...aiAnthropicPromises]);

      // Load ES lib types for Error, Promise, Array, etc.
      try {
        const esLibResponse = await fetch('https://unpkg.com/typescript@5.4.5/lib/lib.es2020.d.ts');
        if (esLibResponse.ok) {
          const esLibContent = await esLibResponse.text();
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            esLibContent,
            'file:///lib.es2020.d.ts'
          );
        }
      } catch (e) {
        console.warn('Failed to load ES2020 lib types:', e);
      }

      // Load DOM lib types for console, window, document, etc.
      try {
        const domLibResponse = await fetch('https://unpkg.com/typescript@5.4.5/lib/lib.dom.d.ts');
        if (domLibResponse.ok) {
          const domLibContent = await domLibResponse.text();
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            domLibContent,
            'file:///lib.dom.d.ts'
          );
        }
      } catch (e) {
        console.warn('Failed to load DOM lib types:', e);
      }

      // Load neverthrow types
      try {
        const neverthrowResponse = await fetch('/node_modules/neverthrow/dist/index.d.ts');
        if (neverthrowResponse.ok) {
          const neverthrowContent = await neverthrowResponse.text();
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            neverthrowContent,
            'file:///node_modules/neverthrow/index.d.ts'
          );
        }
      } catch (e) {
        console.warn('Failed to load neverthrow types:', e);
      }

      // Load ts-results types
      try {
        const [tsResultsIndex, tsResultsResult, tsResultsOption] = await Promise.all([
          fetch('/node_modules/ts-results/index.d.ts'),
          fetch('/node_modules/ts-results/result.d.ts'),
          fetch('/node_modules/ts-results/option.d.ts'),
        ]);
        if (tsResultsIndex.ok) {
          const tsResultsContent = await tsResultsIndex.text();
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            tsResultsContent,
            'file:///node_modules/ts-results/index.d.ts'
          );
        }
        if (tsResultsResult.ok) {
          const tsResultsResultContent = await tsResultsResult.text();
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            tsResultsResultContent,
            'file:///node_modules/ts-results/result.d.ts'
          );
        }
        if (tsResultsOption.ok) {
          const tsResultsOptionContent = await tsResultsOption.text();
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            tsResultsOptionContent,
            'file:///node_modules/ts-results/option.d.ts'
          );
        }
      } catch (e) {
        console.warn('Failed to load ts-results types:', e);
      }

      // Configure TypeScript compiler for proper type resolution
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        lib: ['es2020', 'dom', 'esnext'],
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
          '@effect/ai': ['node_modules/@effect/ai/dist/dts/index.d.ts'],
          '@effect/ai/*': ['node_modules/@effect/ai/dist/dts/*'],
          '@effect/ai-openai': ['node_modules/@effect/ai-openai/dist/dts/index.d.ts'],
          '@effect/ai-openai/*': ['node_modules/@effect/ai-openai/dist/dts/*'],
          '@effect/ai-anthropic': ['node_modules/@effect/ai-anthropic/dist/dts/index.d.ts'],
          '@effect/ai-anthropic/*': ['node_modules/@effect/ai-anthropic/dist/dts/*'],
          'neverthrow': ['node_modules/neverthrow/index.d.ts'],
          'ts-results': ['node_modules/ts-results/index.d.ts'],
        },
      });

      // Enable diagnostics
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        noSuggestionDiagnostics: false,
      });

      typesLoaded = true;
      console.log(`Loaded ${effectFiles.length} Effect type files, ${platformFiles.length} Platform type files, and ${aiFiles.length} AI type files`);
      return true;
    } catch (e) {
      console.warn('Could not load Effect types:', e);
      typesLoadingPromise = null;
      return false;
    }
  })();
  
  return typesLoadingPromise;
};

interface FileContent {
  path: string;
  content: string;
  language?: string;
}

interface CodeEditorProps {
  code: string;
  language?: string;
  files?: FileContent[];
  defaultFile?: string;
  activeFile?: string;
  onFileChange?: (path: string) => void;
}

export default function CodeEditor({
  code,
  language = 'typescript',
  files = [],
  defaultFile,
  activeFile: externalActiveFile,
  onFileChange,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const modelsRef = useRef<Map<string, monaco.editor.ITextModel>>(new Map());
  const observerRef = useRef<MutationObserver | null>(null);
  const [typesReady, setTypesReady] = useState(false);
  const [internalActiveFile, setInternalActiveFile] = useState(defaultFile || 'main.ts');
  const activeFile = externalActiveFile || internalActiveFile;

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

    let cancelled = false;

    // Use async function to handle cleanup delays
    const initializeEditor = async () => {
      // Clean up previous editor if it exists
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }

      // Create editor instance
      const editor = monaco.editor.create(containerRef.current!, {
      value: code,
      language,
      theme: 'vs-dark',
      readOnly: false,
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

      // Register all files in Monaco's file system
      // IMPORTANT: Helper files must be registered BEFORE main file for imports to resolve
      const allFiles = [
        ...files, // Helper files first
        { path: defaultFile || 'main.ts', content: code, language },
      ];

      // Use a consistent base path for all files to ensure proper relative import resolution
      const basePath = 'file:///src';
      
      // Clear modelsRef at the start - we'll repopulate it with new models
      // Dispose all old models from previous slides first
      const oldModels = Array.from(modelsRef.current.values());
      
      // Clear all diagnostics for old models before disposing
      oldModels.forEach((model) => {
        try {
          monaco.editor.setModelMarkers(model, 'typescript', []);
        } catch (e) {
          // Ignore errors
        }
      });
      
      modelsRef.current.clear();
      
      // Dispose all old models
      oldModels.forEach((model) => {
        try {
          model.dispose();
        } catch (e) {
          // Ignore errors if already disposed
        }
      });
      
      // Also dispose any orphaned models in Monaco that match our file patterns
      const allMonacoModels = monaco.editor.getModels();
      allMonacoModels.forEach((model) => {
        const uri = model.uri.toString();
        // Dispose any models from our slides that aren't in the new set
        if (uri.startsWith('file:///src/')) {
          const fileName = uri.replace('file:///src/', '');
          const fileExists = allFiles.some(f => f.path === fileName);
          if (!fileExists) {
            try {
              // Clear all markers/diagnostics before disposing
              monaco.editor.setModelMarkers(model, 'typescript', []);
              model.dispose();
            } catch (e) {
              // Ignore errors if already disposed
            }
          }
        }
      });
      
      // Clear all diagnostics for all remaining models to prevent bleeding between slides
      // This is aggressive but necessary
      monaco.editor.getModels().forEach((model) => {
        if (model.uri.toString().startsWith('file:///src/')) {
          monaco.editor.setModelMarkers(model, 'typescript', []);
        }
      });
      
      // Small delay to ensure cleanup is complete before creating new models
      // This helps prevent diagnostics from bleeding between slides
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (cancelled) return;

      // Create models for all files - helper files first so imports resolve
      // Always create fresh models to avoid stale diagnostics
      allFiles.forEach((file) => {
        const fileUri = monaco.Uri.parse(`${basePath}/${file.path}`);
        // Check if model already exists - if so, dispose it first
        const existingModel = monaco.editor.getModel(fileUri);
        if (existingModel) {
          try {
            existingModel.dispose();
          } catch (e) {
            // Ignore errors
          }
        }
        
        // Create fresh model
        const model = monaco.editor.createModel(
          file.content,
          file.language || language,
          fileUri
        );
        modelsRef.current.set(file.path, model);
      });

      // Set the active file model - should already be in modelsRef from above
      const activeModel = modelsRef.current.get(activeFile);
      
      if (!activeModel) {
        // Fallback: create if somehow missing (shouldn't happen)
        const activeFileContent = allFiles.find(f => f.path === activeFile);
        const activeFileUri = monaco.Uri.parse(`${basePath}/${activeFile}`);
        const newModel = monaco.editor.createModel(
          activeFileContent?.content || code,
          activeFileContent?.language || language,
          activeFileUri
        );
        modelsRef.current.set(activeFile, newModel);
        editor.setModel(newModel);
      } else {
        // Set model before any layout operations
        editor.setModel(activeModel);
      }
      
      // Clear any existing markers on the active model to ensure clean state
      monaco.editor.setModelMarkers(activeModel, 'typescript', []);
      
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
      
      // Monitor for hover appearance and fix positioning - delay setup to avoid interfering with initial render
      setTimeout(() => {
        if (cancelled) return;
        observerRef.current = new MutationObserver(() => {
          setTimeout(fixHoverPosition, 10); // Small delay to let Monaco position it first
        });
        if (containerRef.current) {
          observerRef.current.observe(containerRef.current, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class'],
          });
        }
      }, 200); // Delay observer setup to let editor fully initialize
      
      // Force layout update after a brief delay to ensure container is sized
      // This also ensures the language service is ready
      setTimeout(() => {
        if (cancelled) return;
        // Clear markers again after a delay to catch any that were set during initialization
        monaco.editor.setModelMarkers(activeModel, 'typescript', []);
        editor.layout();
        // Ensure hover is properly configured after layout
        editor.updateOptions({ hover: { enabled: true, delay: 300, above: true } });
      }, 200);
    };

    initializeEditor();

    return () => {
      cancelled = true;
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      
      // Dispose all models we created
      modelsRef.current.forEach((model) => {
        try {
          model.dispose();
        } catch (e) {
          // Ignore errors if model already disposed
        }
      });
      modelsRef.current.clear();
      
      // Dispose editor
      if (editorRef.current) {
        try {
          editorRef.current.dispose();
        } catch (e) {
          // Ignore errors
        }
        editorRef.current = null;
      }
    };
  }, [code, language, typesReady, files, activeFile, defaultFile]);

  // Update editor model when activeFile changes externally
  useEffect(() => {
    if (editorRef.current && activeFile && typesReady) {
      // Find the model from our ref by path
      const model = modelsRef.current.get(activeFile);
      if (model && editorRef.current.getModel() !== model) {
        editorRef.current.setModel(model);
      }
    }
  }, [activeFile, typesReady]);

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
      style={{ height: '100%', overflow: 'visible' }}
    />
  );
}
