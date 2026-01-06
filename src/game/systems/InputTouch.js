import { useState, useCallback } from 'react'

export function useTouchInput() {
  const [touchControls, setTouchControls] = useState({
    left: false,
    right: false
  })
  
  const handleTouchStart = useCallback((action) => {
    setTouchControls(prev => ({ ...prev, [action]: true }))
  }, [])
  
  const handleTouchEnd = useCallback((action) => {
    setTouchControls(prev => ({ ...prev, [action]: false }))
  }, [])
  
  return {
    touchControls,
    handleTouchStart,
    handleTouchEnd
  }
}

