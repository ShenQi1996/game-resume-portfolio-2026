import './HUD.scss'

export default function HUD({ currentSection, progress, portfolioData }) {
  // Get section name - show current section or first section if none
  const sectionName = currentSection?.name || portfolioData.sections[0]?.name || 'Beginning'
  
  // Calculate reversed color - same colors as background but in reverse order
  // Background: light blue (beginning) → yellow → orange → red → midnight blue (end)
  // HUD: midnight blue (beginning) → red → orange → yellow → light blue (end)
  const sections = portfolioData.sections
  let backgroundColor = 'rgb(13, 27, 42)' // Default midnight blue
  
  if (sections.length > 0) {
    // Reverse the sections array to get opposite order
    const reversedSections = [...sections].reverse()
    
    // Map progress (1-100%) to reversed progress (100-1%)
    // When player is at 1%, HUD shows end color (midnight blue)
    // When player is at 100%, HUD shows beginning color (light blue)
    const reversedProgress = 100 - progress + 1 // 1→100, 100→1
    
    // Find which reversed section we're in
    let currentReversedSection = null
    let nextReversedSection = null
    
    for (let i = 0; i < reversedSections.length; i++) {
      const sectionProgress = 1 + (i / (reversedSections.length - 1)) * 99
      if (reversedProgress >= sectionProgress) {
        currentReversedSection = reversedSections[i]
        if (i < reversedSections.length - 1) {
          nextReversedSection = reversedSections[i + 1]
        }
      } else {
        break
      }
    }
    
    // If before first reversed section, use first reversed section color
    if (!currentReversedSection) {
      currentReversedSection = reversedSections[0]
    }
    
    // If at or after last reversed section, use last reversed section color
    if (!nextReversedSection) {
      const color = currentReversedSection?.bgColor || 0x0D1B2A
      const r = (color >> 16) & 0xFF
      const g = (color >> 8) & 0xFF
      const b = color & 0xFF
      backgroundColor = `rgb(${r}, ${g}, ${b})`
    } else {
      // Interpolate between current and next reversed section colors
      const currentIndex = reversedSections.indexOf(currentReversedSection)
      const nextIndex = reversedSections.indexOf(nextReversedSection)
      const currentProgress = 1 + (currentIndex / (reversedSections.length - 1)) * 99
      const nextProgress = 1 + (nextIndex / (reversedSections.length - 1)) * 99
      const factor = Math.max(0, Math.min(1, (reversedProgress - currentProgress) / (nextProgress - currentProgress)))
      
      const color1 = currentReversedSection?.bgColor || 0x0D1B2A
      const color2 = nextReversedSection?.bgColor || 0x87CEEB
      
      const r1 = (color1 >> 16) & 0xFF
      const g1 = (color1 >> 8) & 0xFF
      const b1 = color1 & 0xFF
      
      const r2 = (color2 >> 16) & 0xFF
      const g2 = (color2 >> 8) & 0xFF
      const b2 = color2 & 0xFF
      
      // Smooth interpolation
      const smoothFactor = factor * factor * (3 - 2 * factor)
      const r = Math.round(r1 + (r2 - r1) * smoothFactor)
      const g = Math.round(g1 + (g2 - g1) * smoothFactor)
      const b = Math.round(b1 + (b2 - b1) * smoothFactor)
      
      backgroundColor = `rgb(${r}, ${g}, ${b})`
    }
  }
  
  // Use fixed notebook paper color (no dynamic background)
  return (
    <div className="hud">
      <div className="hud__section">
        <span className="hud__label">Section:</span>
        <span className="hud__value">{sectionName}</span>
      </div>
      <div className="hud__progress">
        <span className="hud__label">Progress:</span>
        <div className="hud__progress-bar">
          <div 
            className="hud__progress-fill" 
            style={{ width: `${Math.max(1, Math.min(100, Math.round(progress)))}%` }}
          />
        </div>
        <span className="hud__value">{Math.max(1, Math.min(100, Math.round(progress)))}%</span>
      </div>
    </div>
  )
}

