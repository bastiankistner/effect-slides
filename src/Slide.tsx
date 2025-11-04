import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface SlideData {
  title: string
  subtitle?: string
  content: React.ReactNode
  code?: string
  language?: string
}

interface SlideProps {
  slide: SlideData
}

export default function Slide({ slide }: SlideProps) {
  const hasCode = !!slide.code
  
  return (
    <div className="flex-1 flex items-center justify-center p-12 slide-enter overflow-y-auto">
      <div className={`w-full ${hasCode ? 'max-w-7xl' : 'max-w-6xl'}`}>
        {/* Header */}
        <div className="mb-8">
          {slide.subtitle && (
            <div className="text-effect-primary text-lg font-medium mb-2">
              {slide.subtitle}
            </div>
          )}
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-effect-primary to-effect-secondary bg-clip-text text-transparent leading-tight">
            {slide.title}
          </h1>
        </div>

        {/* Content Layout */}
        {hasCode ? (
          <div className="flex gap-8 items-start">
            {/* Left column: Text content (1/3) */}
            <div className="flex-1 space-y-6 min-w-0">
              {slide.content}
            </div>
            
            {/* Right column: Code (2/3) */}
            <div className="flex-[2] rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
              <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-xs text-gray-400 font-mono">
                  {slide.language || 'typescript'}
                </span>
              </div>
              <SyntaxHighlighter
                language={slide.language || 'typescript'}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1.5rem',
                  background: '#1e1e1e',
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                  maxHeight: '70vh',
                  overflow: 'auto',
                }}
                showLineNumbers
              >
                {slide.code}
              </SyntaxHighlighter>
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

