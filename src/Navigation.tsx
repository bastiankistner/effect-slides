interface NavigationProps {
  currentSlide: number;
  totalSlides: number;
  onSlideChange: (slide: number) => void;
}

export default function Navigation({
  currentSlide,
  totalSlides,
  onSlideChange,
}: NavigationProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
      <div className="bg-gray-900/40 backdrop-blur-md border border-gray-700/50 rounded-full px-4 py-2 shadow-2xl flex items-center gap-3">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onSlideChange(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className="p-1.5 hover:bg-gray-700/50 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
          aria-label="Previous slide"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <title>Previous slide</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="flex items-center gap-1.5 px-2">
          {Array.from({ length: totalSlides }, (_, i) => i).map(
            (slideIndex) => (
              <button
                type="button"
                key={`nav-slide-indicator-${slideIndex}`}
                onClick={() => onSlideChange(slideIndex)}
                className={`rounded-full transition-all ${
                  slideIndex === currentSlide
                    ? 'bg-effect-primary w-2 h-2'
                    : 'bg-gray-600/60 hover:bg-gray-500/60 w-1.5 h-1.5'
                }`}
                aria-label={`Go to slide ${slideIndex + 1}`}
              />
            )
          )}
        </div>

        {/* Slide Counter */}
        <div className="text-xs text-gray-400 font-mono px-2 min-w-[3rem] text-center">
          {currentSlide + 1}/{totalSlides}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() =>
            onSlideChange(Math.min(totalSlides - 1, currentSlide + 1))
          }
          disabled={currentSlide === totalSlides - 1}
          className="p-1.5 hover:bg-gray-700/50 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
          aria-label="Next slide"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <title>Next slide</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
