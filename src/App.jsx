import { useState, useEffect, useCallback } from 'react'
import GameRoot from './game/GameRoot'
import Nav from './ui/Nav'
import HUD from './ui/HUD'
import Panel from './ui/Panel'
import ScrollView from './ui/ScrollView'
import TouchControls from './ui/TouchControls'
import LoadingScreen from './ui/LoadingScreen'
import { useKeyboardInput } from './game/systems/InputKeyboard'
import { useTouchInput } from './game/systems/InputTouch'
import { useScrollInput } from './game/systems/InputScroll'
import { portfolioData } from './data/portfolioData'
import './styles/App.scss'

function App() {
  const [isLoading, setIsLoading] = useState(true) // Show loading screen initially
  const [gameReady, setGameReady] = useState(false) // Track when game is ready
  const [viewMode, setViewMode] = useState('game') // 'game' or 'scroll'
  const [currentSection, setCurrentSection] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [progress, setProgress] = useState(1) // Start at 1%
  const [pixiFailed, setPixiFailed] = useState(false)
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })
  
  const handleInput = useCallback((type, key) => {
    // Handle input events if needed
  }, [])
  
  const handleScroll = useCallback((direction) => {
    // Handle scroll events if needed
  }, [])
  
  const keyboardInput = useKeyboardInput(handleInput)
  const scrollInput = useScrollInput(handleScroll, viewMode === 'game')
  const { touchControls, handleTouchStart, handleTouchEnd } = useTouchInput()
  
  // Handle viewport resize
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Check if mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                   window.innerWidth < 768
  
  const handleSectionDetected = useCallback((section) => {
    setCurrentSection(section)
    // Progress is now calculated based on player position, not section
  }, [])
  
  const handleProgressUpdate = useCallback((newProgress) => {
    setProgress(newProgress)
  }, [])
  
  const handleClosePanel = useCallback(() => {
    setSelectedSection(null)
  }, [])
  
  const handleRestart = useCallback(() => {
    setCurrentSection(null)
    setSelectedSection(null)
    setProgress(0)
    // Game will reset when remounted
    window.location.reload()
  }, [])
  
  const handleToggleView = useCallback(() => {
    setViewMode(prev => prev === 'game' ? 'scroll' : 'game')
  }, [])
  
  const handleQuestCompleteSpacePress = useCallback(() => {
    // Switch to scroll view when space is pressed after quest complete
    setViewMode('scroll')
  }, [])
  
  const handleDownloadResume = useCallback(() => {
    if (portfolioData.contact.resumePdfUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a')
      link.href = portfolioData.contact.resumePdfUrl
      link.download = 'Resume.pdf' // Suggested filename for download
      link.target = '_blank' // Fallback: open in new tab if download fails
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert('Resume PDF URL not configured. Please update portfolioData.js')
    }
  }, [])
  
  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false)
  }, [])
  
  const handleGameReady = useCallback(() => {
    // Game is ready, notify loading screen
    setGameReady(true)
  }, [])
  
  // Auto-switch to scroll view if Pixi fails
  useEffect(() => {
    if (pixiFailed && viewMode === 'game') {
      setViewMode('scroll')
    }
  }, [pixiFailed, viewMode])
  
  // Update body class to control scrolling
  useEffect(() => {
    if (viewMode === 'game') {
      document.body.classList.add('game-view')
      document.documentElement.classList.add('game-view')
    } else {
      document.body.classList.remove('game-view')
      document.documentElement.classList.remove('game-view')
    }
    
    return () => {
      document.body.classList.remove('game-view')
      document.documentElement.classList.remove('game-view')
    }
  }, [viewMode])
  
  return (
    <div className="app">
      {isLoading && (
        <LoadingScreen 
          onComplete={handleLoadingComplete} 
          gameReady={gameReady}
        />
      )}
      
      {/* Render game in background while loading */}
      {viewMode === 'game' && (
        <div style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
          <GameRoot
            onSectionDetected={handleSectionDetected}
            keyboardInput={keyboardInput}
            scrollInput={scrollInput}
            touchControls={touchControls}
            viewportWidth={viewportSize.width}
            viewportHeight={viewportSize.height}
            onPixiError={() => setPixiFailed(true)}
            onProgressUpdate={handleProgressUpdate}
            onGameReady={handleGameReady}
            onQuestCompleteSpacePress={handleQuestCompleteSpacePress}
          />
        </div>
      )}
      
      {!isLoading && (
        <>
          <Nav
            onRestart={handleRestart}
            viewMode={viewMode}
            onToggleView={handleToggleView}
            onDownloadResume={handleDownloadResume}
          />
          
          {viewMode === 'game' ? (
            <>
              <HUD
                currentSection={currentSection}
                progress={progress}
                portfolioData={portfolioData}
              />
              {isMobile && (
                <TouchControls
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                />
              )}
            </>
          ) : (
            <ScrollView onDownloadResume={handleDownloadResume} />
          )}
          
          <Panel
            section={selectedSection}
            onClose={handleClosePanel}
          />
        </>
      )}
    </div>
  )
}

export default App

