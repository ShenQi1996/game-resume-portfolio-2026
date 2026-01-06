import { useEffect, useRef } from 'react'

export function useKeyboardInput(onInput) {
  const keys = useRef(new Set())
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default for arrow keys and space to avoid scrolling
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault()
      }
      
      let key = e.key
      if (key === ' ') {
        key = ' '
      } else if (key === 'ArrowLeft') {
        key = 'arrowleft'
      } else if (key === 'ArrowRight') {
        key = 'arrowright'
      } else if (key === 'ArrowUp') {
        key = 'arrowup'
      } else if (key === 'ArrowDown') {
        key = 'arrowdown'
      } else {
        key = key.toLowerCase()
      }
      
      keys.current.add(key)
      onInput('keydown', key)
    }
    
    const handleKeyUp = (e) => {
      let key = e.key
      if (key === ' ') {
        key = ' '
      } else if (key === 'ArrowLeft') {
        key = 'arrowleft'
      } else if (key === 'ArrowRight') {
        key = 'arrowright'
      } else if (key === 'ArrowUp') {
        key = 'arrowup'
      } else if (key === 'ArrowDown') {
        key = 'arrowdown'
      } else {
        key = key.toLowerCase()
      }
      
      keys.current.delete(key)
      onInput('keyup', key)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onInput])
  
  return {
    isPressed: (key) => {
      // Handle space key
      if (key === ' ') {
        return keys.current.has(' ')
      }
      // Handle arrow keys
      if (key.toLowerCase() === 'arrowleft' || key === 'ArrowLeft') {
        return keys.current.has('arrowleft')
      }
      if (key.toLowerCase() === 'arrowright' || key === 'ArrowRight') {
        return keys.current.has('arrowright')
      }
      // Handle regular keys
      return keys.current.has(key.toLowerCase())
    },
    getPressed: () => Array.from(keys.current)
  }
}

