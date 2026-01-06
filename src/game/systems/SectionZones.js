export class SectionZones {
  constructor(sections) {
    this.sections = sections
    this.currentSection = null
  }
  
  checkSection(playerX) {
    // Find the section the player is closest to
    // Section detection matches the beginning (left edge) of the yellow sign box
    // section.x is the left edge of the sign (sign is 60px wide)
    let closestSection = null
    let minDistance = Infinity
    
    for (const section of this.sections) {
      // Check distance from player to section.x (left edge of yellow sign)
      const distance = Math.abs(playerX - section.x)
      // Detection zone: 300px radius from the left edge of the sign
      if (distance < 300 && distance < minDistance) {
        minDistance = distance
        closestSection = section
      }
    }
    
    if (closestSection && closestSection.id !== this.currentSection?.id) {
      this.currentSection = closestSection
      return closestSection
    }
    
    return this.currentSection
  }
  
  getCurrentSection() {
    return this.currentSection
  }
  
  getProgress(playerX, levelStart, levelEnd) {
    // Progress starts at 1% and goes to 100% at the end
    // Player can move between levelStart (1%) and levelEnd (100%)
    if (playerX <= levelStart) {
      return 1
    }
    if (playerX >= levelEnd) {
      return 100
    }
    // Calculate progress: 1% + (position / total distance) * 99%
    const progress = 1 + ((playerX - levelStart) / (levelEnd - levelStart)) * 99
    return Math.min(100, Math.max(1, progress))
  }
  
  getLevelBounds() {
    if (this.sections.length === 0) {
      return { start: 50, end: 5000, startWall: 0, endWall: 5100 }
    }
    const firstSection = this.sections[0] // Introduction section
    const levelStartX = firstSection ? firstSection.x : 50 // Introduction section (1% position)
    const lastSection = this.sections[this.sections.length - 1]
    const end = lastSection.x + 400 // End at 100% position
    const levelWidth = end - levelStartX
    const WALL_WIDTH = 50
    const onePercentDistance = levelWidth / 99
    const minusOnePercentX = levelStartX - onePercentDistance // -1% position
    const startWall = minusOnePercentX - WALL_WIDTH // Wall before -1%
    const endWall = end + onePercentDistance // 101% position
    // Return -1% as the actual start position for player movement
    return { start: minusOnePercentX, end, startWall, endWall, levelStartX }
  }
}

