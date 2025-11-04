import { useEffect, useRef, useState } from 'react'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

// Configure Monaco workers for Vite
if (typeof window !== 'undefined' && !(window as any).MonacoEnvironment) {
  ;(window as any).MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker()
      }
      return new editorWorker()
    },
  }
}

// Global flag to track if Effect types have been loaded
let effectTypesLoaded = false
let effectTypesLoadingPromise: Promise<boolean> | null = null

// Load Effect types globally (once for all editor instances)
const loadEffectTypesGlobal = async (): Promise<boolean> => {
  if (effectTypesLoaded) {
    return true
  }
  
  if (effectTypesLoadingPromise) {
    return effectTypesLoadingPromise
  }
  
  effectTypesLoadingPromise = (async () => {
    try {
      // Load all type files in parallel
      const [effectIndexResponse, effectModuleResponse, dataModuleResponse, contextModuleResponse] = await Promise.all([
        fetch('/effect-types/index.d.ts'),
        fetch('/effect-types/Effect.d.ts'),
        fetch('/effect-types/Data.d.ts'),
        fetch('/effect-types/Context.d.ts').catch(() => ({ ok: false } as Response)), // Context might not exist
      ])
      
      if (effectIndexResponse.ok) {
        const effectIndexTypes = await effectIndexResponse.text()
        
        // Load dependencies FIRST - index.d.ts references them as "./Effect.js", "./Data.js", etc.
        // These MUST be loaded before index.d.ts so relative imports can resolve
        if (effectModuleResponse.ok) {
          const effectModuleTypes = await effectModuleResponse.text()
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            effectModuleTypes,
            'file:///node_modules/effect/Effect.js.d.ts'
          )
        }
        
        if (dataModuleResponse.ok) {
          const dataModuleTypes = await dataModuleResponse.text()
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            dataModuleTypes,
            'file:///node_modules/effect/Data.js.d.ts'
          )
        }
        
        if (contextModuleResponse.ok) {
          const contextModuleTypes = await contextModuleResponse.text()
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            contextModuleTypes,
            'file:///node_modules/effect/Context.js.d.ts'
          )
        }
        
        // Configure module resolution
        const currentOptions = monaco.languages.typescript.typescriptDefaults.getCompilerOptions()
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          ...currentOptions,
          baseUrl: 'file:///',
          paths: {
            ...(currentOptions.paths || {}),
            'effect': ['node_modules/effect/index.d.ts'],
            'effect/*': ['node_modules/effect/*.js.d.ts']
          },
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          resolveJsonModule: true,
        })
        
        // Load index.d.ts as a regular library file first (for relative import resolution)
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          effectIndexTypes,
          'file:///node_modules/effect/index.d.ts'
        )
        
        // CRITICAL: Transform relative imports to absolute paths, then wrap in module declaration
        // When we wrap index.d.ts, relative imports like "./Effect.js" break
        // So we transform them to absolute paths that Monaco can resolve
        const transformedIndexTypes = effectIndexTypes.replace(
          /from\s+["'](\.\/[^"']+)["']/g,
          (match, relativePath) => {
            // Transform "./Effect.js" to "file:///node_modules/effect/Effect.js.d.ts"
            const moduleName = relativePath.replace(/^\.\//, '').replace(/\.js$/, '.js.d.ts')
            return `from 'file:///node_modules/effect/${moduleName}'`
          }
        )
        
        const wrappedIndexTypes = `declare module 'effect' {\n${transformedIndexTypes}\n}`
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          wrappedIndexTypes,
          'file:///effect-module.d.ts'
        )
        
        // Force Monaco to reload all extra libraries
        // This ensures the module declaration is properly recognized
        const allModels = monaco.editor.getModels()
        allModels.forEach(model => {
          if (model.getLanguageId() === 'typescript' || model.getLanguageId() === 'typescriptreact') {
            const currentValue = model.getValue()
            model.setValue('')
            setTimeout(() => model.setValue(currentValue), 0)
          }
        })
        
        console.log('Effect types loaded successfully', {
          effectModule: effectModuleResponse.ok,
          dataModule: dataModuleResponse.ok,
          contextModule: contextModuleResponse.ok,
          indexTypes: effectIndexTypes.length
        })
        effectTypesLoaded = true
        return true
      } else {
        throw new Error('Could not fetch Effect types')
      }
    } catch (e) {
      console.warn('Could not load Effect types:', e)
      effectTypesLoadingPromise = null
      return false
    }
  })()
  
  return effectTypesLoadingPromise
}

interface CodeEditorProps {
  code: string
  language?: string
}

export default function CodeEditor({ code, language = 'typescript' }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [typesReady, setTypesReady] = useState(false)

  // Load types first, before rendering editor
  useEffect(() => {
    let cancelled = false
    
    loadEffectTypesGlobal().then(() => {
      if (!cancelled) {
        // Give Monaco time to process types
        setTimeout(() => {
          if (!cancelled) {
            setTypesReady(true)
          }
        }, 200)
      }
    })
    
    return () => {
      cancelled = true
    }
  }, [])

  // Create editor only after types are ready
  useEffect(() => {
    if (!containerRef.current || !typesReady) return

    // Clean up previous editor if it exists
    if (editorRef.current) {
      editorRef.current.dispose()
      editorRef.current = null
    }

    // Create editor instance
    const editor = monaco.editor.create(containerRef.current, {
      value: code,
      language,
      theme: 'vs-dark',
      readOnly: true,
      minimap: { enabled: false },
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineHeight: 22,
      fontFamily: 'Fira Code, Monaco, Menlo, monospace',
      fontLigatures: true,
      wordWrap: 'on',
      automaticLayout: true,
      padding: {
        top: 20,
        bottom: 20,
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
    })

    editorRef.current = editor
    
    // Fix hover positioning to use viewport coordinates when using fixed positioning
    const fixHoverPosition = () => {
      const overlayWidgets = containerRef.current?.querySelector('.monaco-overlayWidgets') as HTMLElement
      if (overlayWidgets && containerRef.current) {
        const hover = overlayWidgets.querySelector('.monaco-hover') as HTMLElement
        if (hover) {
          // Monaco calculates positions relative to editor, but we need viewport-relative for fixed
          const editorRect = containerRef.current.getBoundingClientRect()
          const currentTop = parseFloat(hover.style.top || '0')
          const currentLeft = parseFloat(hover.style.left || '0')
          
          // Convert editor-relative to viewport-relative
          hover.style.top = `${editorRect.top + currentTop}px`
          hover.style.left = `${editorRect.left + currentLeft}px`
        }
      }
    }
    
    // Monitor for hover appearance and fix positioning
    const observer = new MutationObserver(() => {
      setTimeout(fixHoverPosition, 10) // Small delay to let Monaco position it first
    })
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      })
    }

    // Add Effect type definitions for better IntelliSense
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
      // Enable strict type checking for better hover info
      strict: true,
      noImplicitAny: true, // Enable to catch type issues
      strictNullChecks: true,
      strictFunctionTypes: true,
      strictBindCallApply: true,
      strictPropertyInitialization: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
    })
    
    // Enable hover provider for TypeScript
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: false,
    })

    // Create model with code - types are already loaded
    const modelUri = monaco.Uri.parse(`file:///slide-${Date.now()}-${Math.random()}.${language === 'typescript' ? 'ts' : 'tsx'}`)
    const model = monaco.editor.createModel(code, language, modelUri)
    editor.setModel(model)

    return () => {
      observer.disconnect()
      model.dispose()
      editor.dispose()
      editorRef.current = null
    }
  }, [code, language, typesReady])

  if (!typesReady) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading types...</div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full relative monaco-editor-container"
      style={{ minHeight: '400px', overflow: 'visible' }}
    />
  )
}

