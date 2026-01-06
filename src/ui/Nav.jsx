import { useState } from 'react'
import { motion } from 'framer-motion'
import './Nav.scss'

export default function Nav({ 
  onRestart, 
  viewMode, 
  onToggleView,
  onDownloadResume 
}) {
  return (
    <nav className="nav">
      <div className="nav__group">
        <button 
          className="nav__button" 
          onClick={onRestart}
          aria-label="Restart game"
        >
          ↻ Restart
        </button>
        <button 
          className="nav__button" 
          onClick={onToggleView}
          aria-label="Toggle view"
        >
          {viewMode === 'game' ? '📜 Scroll View' : '🎮 Game View'}
        </button>
      </div>
      <div className="nav__group">
        <button 
          className="nav__button nav__button--primary" 
          onClick={onDownloadResume}
          aria-label="Download resume"
        >
          📄 Download Resume
        </button>
      </div>
    </nav>
  )
}

