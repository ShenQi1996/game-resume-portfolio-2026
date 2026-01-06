import { useEffect, useRef } from 'react'

export function useScrollInput(onScroll, isGameView = true) {
  const scrollVelocity = useRef(0) // Negative for down (backward/left), positive for up (forward/right)
  const lastScrollTime = useRef(0)
  
  useEffect(() => {
    const handleWheel = (e) => {
      // Only prevent default and handle scroll input when in game view
      if (isGameView) {
        e.preventDefault()
        
        const now = Date.now()
        const delta = e.deltaY
        
        if (delta > 0) {
          // Scrolling down - move forward (right) - flipped
          scrollVelocity.current = 1
          onScroll('down')
        } else if (delta < 0) {
          // Scrolling up - move backward (left) - flipped
          scrollVelocity.current = -1
          onScroll('up')
        }
        
        lastScrollTime.current = now
        
        // Reset velocity after scroll stops (no scroll for 100ms)
        clearTimeout(scrollVelocity.timeoutId)
        scrollVelocity.timeoutId = setTimeout(() => {
          scrollVelocity.current = 0
        }, 100)
      }
      // If not in game view, allow normal scrolling (don't prevent default)
    }
    
    window.addEventListener('wheel', handleWheel, { passive: !isGameView })
    
    return () => {
      window.removeEventListener('wheel', handleWheel)
      if (scrollVelocity.timeoutId) {
        clearTimeout(scrollVelocity.timeoutId)
      }
    }
  }, [onScroll, isGameView])
  
  return {
    getScrollVelocity: () => scrollVelocity.current,
    isScrolling: () => scrollVelocity.current !== 0
  }
}

