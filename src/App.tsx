import { useState, useEffect } from 'react'
import { slides } from './slides'
import Slide from './Slide'
import Navigation from './Navigation'

function App() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentSlide((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Home') {
        e.preventDefault()
        setCurrentSlide(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        setCurrentSlide(slides.length - 1)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="h-full flex flex-col">
        <Slide slide={slides[currentSlide]} />
        <Navigation 
          currentSlide={currentSlide}
          totalSlides={slides.length}
          onSlideChange={setCurrentSlide}
        />
      </div>
    </div>
  )
}

export default App

