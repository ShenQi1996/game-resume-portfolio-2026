/**
 * Background color calculation utilities
 */

import { interpolateColor, smoothstep } from './colorUtils'

/**
 * Calculate smooth background color based on player position
 * @param {number} playerX - Player's X position
 * @param {Array} sections - Array of section objects with x and bgColor properties
 * @returns {number} Background color as hex number
 */
export const calculateBackgroundColor = (playerX, sections) => {
  if (sections.length === 0) return 0x1A1A2E
  
  // Find current and next section
  let currentSection = null
  let nextSection = null
  let currentIndex = -1
  
  for (let i = 0; i < sections.length; i++) {
    if (playerX >= sections[i].x) {
      currentSection = sections[i]
      currentIndex = i
    } else {
      nextSection = sections[i]
      break
    }
  }
  
  // If player is before first section, use morning color (light blue)
  if (!currentSection) {
    const firstSection = sections[0]
    if (firstSection.bgColor !== null && firstSection.bgColor !== undefined) {
      return firstSection.bgColor
    }
    return 0x87CEEB // Light blue for beginning
  }
  
  // If player is at or after last section, use last section color
  if (!nextSection) {
    if (currentSection.bgColor !== null && currentSection.bgColor !== undefined) {
      return currentSection.bgColor
    }
    return 0x1A1A2E
  }
  
  // Get colors for interpolation
  let color1 = 0x1A1A2E // Default night color
  let color2 = 0x1A1A2E
  
  if (currentSection.bgColor !== null && currentSection.bgColor !== undefined) {
    color1 = currentSection.bgColor
  }
  
  if (nextSection.bgColor !== null && nextSection.bgColor !== undefined) {
    color2 = nextSection.bgColor
  }
  
  // Calculate interpolation factor (0 to 1) based on position between sections
  const sectionDistance = nextSection.x - currentSection.x
  const playerDistance = playerX - currentSection.x
  const factor = Math.max(0, Math.min(1, playerDistance / sectionDistance))
  
  // Use smoothstep for smoother transition
  const smoothFactor = smoothstep(factor)
  
  return interpolateColor(color1, color2, smoothFactor)
}

