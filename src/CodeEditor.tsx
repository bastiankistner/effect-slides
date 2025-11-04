import { useEffect, useRef } from 'react'
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

interface CodeEditorProps {
  code: string
  language?: string
}

export default function CodeEditor({ code, language = 'typescript' }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

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
        above: true, // Show above when possible, but will show below if not enough space
      },
      // Enable quick info (IntelliSense) - this is what shows hover tooltips
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
      noImplicitAny: false,
    })
    
    // Enable hover provider for TypeScript
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: false,
    })

    // Add basic Effect type definitions for IntelliSense
    const effectTypes = `
// Effect Core Types
declare namespace Effect {
  type Effect<A, E = never, R = never> = {
    readonly _tag: 'Effect'
    readonly _A: A
    readonly _E: E
    readonly _R: R
  }
  
  function gen<A, E, R>(
    f: () => Generator<Effect<any, any, any>, A, any>
  ): Effect<A, E, R>
  
  function succeed<A>(value: A): Effect<A, never, never>
  function fail<E>(error: E): Effect<never, E, never>
  
  function catchTag<K extends string>(
    tag: K,
    f: (error: Extract<any, { _tag: K }>) => Effect<any, any, any>
  ): <A, E, R>(self: Effect<A, E, R>) => Effect<A, Exclude<E, { _tag: K }>, R>
  
  function retry(options: { times: number }): <A, E, R>(self: Effect<A, E, R>) => Effect<A, E, R>
  
  function pipe<A, E, R>(
    self: Effect<A, E, R>,
    ...fns: any[]
  ): Effect<any, any, any>
  
  function log(message: string): Effect<void, never, never>
  function all<A, E, R>(effects: ReadonlyArray<Effect<A, E, R>>): Effect<ReadonlyArray<A>, E, R>
  function provide<R>(service: R): <A, E>(self: Effect<A, E, R>) => Effect<A, E, never>
}

// Data.TaggedError
declare namespace Data {
  class TaggedError<T extends string, A = {}> extends Error {
    readonly _tag: T
    readonly props: A
    constructor(tag: T, props: A)
  }
  
  function TaggedError<T extends string, A = {}>(
    tag: T
  ): new (props: A) => TaggedError<T, A>
}

// Context.Tag
declare namespace Context {
  interface Tag<A> {
    readonly _tag: symbol
    readonly _A: A
  }
  
  function Tag<A>(name: string): Tag<A>
}

// Semaphore
declare namespace Semaphore {
  function make(permits: number): Effect<Semaphore, never, never>
  
  interface Semaphore {
    withPermits(n: number): <A, E, R>(effect: Effect<A, E, R>) => Effect<A, E, R>
  }
}

// Schema
declare namespace Schema {
  namespace Struct {
    function <T extends Record<string, any>>(props: T): any
  }
  
  namespace Number {
    const Number: any
  }
  
  namespace String {
    const String: any
    function pipe(...fns: any[]): any
  }
  
  function pattern(regex: RegExp): (schema: any) => any
}

// TestClock
declare namespace TestClock {
  function adjust(duration: string): Effect<void, never, never>
}

// Import declarations for better IntelliSense
declare module 'effect' {
  export * from 'effect/Effect'
  export * from 'effect/Data'
  export * from 'effect/Context'
  export * from 'effect/Semaphore'
  export * from 'effect/TestClock'
}
`
    
    // Add type definitions
    const libUri = 'file:///effect.d.ts'
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      effectTypes,
      libUri
    )
    
    // Create a unique model for each slide to ensure proper type checking
    const modelUri = monaco.Uri.parse(`file:///slide-${Date.now()}-${Math.random()}.${language === 'typescript' ? 'ts' : 'tsx'}`)
    const model = monaco.editor.createModel(code, language, modelUri)
    
    // Update editor to use the model
    editor.setModel(model)
    
    // Wait a bit for the language service to be ready, then ensure hover is enabled
    setTimeout(() => {
      editor.updateOptions({
        hover: { enabled: true, delay: 300 },
      })
    }, 100)

    return () => {
      observer.disconnect()
      model.dispose()
      editor.dispose()
      editorRef.current = null
    }
  }, [code, language])

  return (
    <div
      ref={containerRef}
      className="h-full w-full relative monaco-editor-container"
      style={{ minHeight: '400px', overflow: 'visible' }}
    />
  )
}

