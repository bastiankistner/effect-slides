import CodeEditor from './CodeEditor'
import MultiFileEditor from './MultiFileEditor'

interface FileContent {
  path: string
  content: string
  language?: string
}

interface SlideData {
  title: string
  subtitle?: string
  content: React.ReactNode
  code?: string
  language?: string
  helperFiles?: FileContent[]
}

interface SlideProps {
  slide: SlideData
  slideKey?: string | number
}

export default function Slide({ slide, slideKey }: SlideProps) {
  const hasCode = !!slide.code
  
  return (
    <div className="flex-1 flex flex-col items-start justify-start p-3 sm:p-4 md:p-6 slide-enter overflow-hidden">
      <div className={`w-full flex-1 flex flex-col min-h-0 ${hasCode ? 'max-w-[98%] xl:max-w-[95%]' : 'max-w-6xl'}`}>
        {/* Header */}
        <div className="mb-3 md:mb-4 flex-shrink-0">
          {slide.subtitle && (
            <div className="text-effect-primary text-lg font-medium mb-2">
              {slide.subtitle}
            </div>
          )}
          <h1 className="text-4xl font-bold mb-3 md:mb-4 leading-tight">
            {slide.title.split('😭').map((part, i, arr) => 
              i < arr.length - 1 ? (
                <span key={i}>
                  <span className="bg-gradient-to-r from-effect-primary to-effect-secondary bg-clip-text text-transparent">{part}</span>
                  <span className="text-white">😭</span>
                </span>
              ) : (
                <span key={i} className="bg-gradient-to-r from-effect-primary to-effect-secondary bg-clip-text text-transparent">{part}</span>
              )
            )}
          </h1>
        </div>

        {/* Content Layout */}
        {hasCode ? (
          <div className="grid grid-cols-[1fr_2fr] gap-4 md:gap-6 items-stretch flex-1 min-h-0 overflow-hidden">
            {/* Left column: Text content (1fr) */}
            <div className="space-y-4 min-w-0 overflow-y-auto">
              {slide.content}
            </div>
            
            {/* Right column: Code (2fr) - Contains sidebar, hover tooltips use fixed positioning */}
            <div className="relative overflow-hidden flex flex-col min-h-0">
              {/* Outer container with rounded corners - clips direct children */}
              <div className="rounded-xl overflow-hidden border border-gray-700 shadow-2xl bg-[#1e1e1e] flex flex-col relative h-full min-h-0" style={{ isolation: 'isolate' }}>
                <div className="bg-gray-800 px-2 py-1 border-b border-gray-700 flex items-center gap-2 flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-4 text-xs text-gray-400 font-mono">
                    {slide.language || 'typescript'}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">
                    Hover for type info
                  </span>
                </div>
                <div className="flex-1 overflow-auto min-h-0">
                  {slide.helperFiles && slide.helperFiles.length > 0 ? (
                    <MultiFileEditor
                      key={`editor-${slideKey || slide.title}`}
                      mainCode={slide.code || ''}
                      mainLanguage={slide.language || 'typescript'}
                      helperFiles={slide.helperFiles}
                    />
                  ) : (
                    <CodeEditor key={`editor-${slideKey || slide.title}`} code={slide.code || ''} language={slide.language || 'typescript'} />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {slide.content}
          </div>
        )}
      </div>
    </div>
  )
}

