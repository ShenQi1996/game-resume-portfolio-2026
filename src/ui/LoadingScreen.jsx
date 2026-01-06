import { useState, useEffect, useRef } from 'react'
import { portfolioData } from '../data/portfolioData'
import './LoadingScreen.scss'

const LOADING_STEPS = [
  { progress: 20, text: 'Loading game assets...' },
  { progress: 40, text: 'Preparing the world...' },
  { progress: 60, text: 'Setting up characters...' },
  { progress: 80, text: 'Almost ready...' },
  { progress: 95, text: 'Finalizing...' }
]

export default function LoadingScreen({ onComplete, gameReady = false }) {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Initializing...')
  const stepsCompletedRef = useRef(false)
  
  // Progress through loading steps
  useEffect(() => {
    if (stepsCompletedRef.current) return
    
    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < LOADING_STEPS.length) {
        const step = LOADING_STEPS[currentStep]
        setProgress(step.progress)
        setLoadingText(step.text)
        currentStep++
      } else {
        clearInterval(interval)
        stepsCompletedRef.current = true
        // If game is already ready, complete immediately
        if (gameReady) {
          setProgress(100)
          setLoadingText('Welcome to the adventure!')
        }
      }
    }, 500) // Change step every 500ms
    
    return () => clearInterval(interval)
  }, [gameReady])
  
  // When game becomes ready and steps are done, complete loading
  useEffect(() => {
    if (gameReady && stepsCompletedRef.current && progress < 100) {
      setProgress(100)
      setLoadingText('Welcome to the adventure!')
    }
  }, [gameReady, progress])
  
  // Complete loading when at 100%
  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete()
      }, 800) // Wait a bit to show 100%
      
      return () => clearTimeout(timer)
    }
  }, [progress, onComplete])
  
  return (
    <div className="loading-screen">
      <div className="loading-screen__content">
        <div className="loading-screen__header">
          <h1 className="loading-screen__title">{portfolioData.hero.name}</h1>
          <p className="loading-screen__subtitle">{portfolioData.hero.title}</p>
        </div>
        
        <div className="loading-screen__progress-container">
          <div className="loading-screen__progress-bar">
            <div 
              className="loading-screen__progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="loading-screen__text">{loadingText}</p>
          <p className="loading-screen__percentage">{progress}%</p>
        </div>
        
        <div className="loading-screen__hint">
          <p>Use <kbd>A</kbd> / <kbd>D</kbd> to move, <kbd>Space</kbd> to jump</p>
        </div>
      </div>
    </div>
  )
}

