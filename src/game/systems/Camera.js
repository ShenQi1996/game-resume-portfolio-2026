import { getGroundLevel } from '../constants'

export class Camera {
  constructor() {
    this.x = 0
    this.y = 0
    this.targetX = 0
    this.targetY = 0
    this.smoothing = 0.1
  }
  
  update(playerX, playerY, viewportWidth, viewportHeight) {
    // Center camera on player horizontally
    this.targetX = playerX - viewportWidth / 2
    
    // Position camera vertically - position camera so ground appears near bottom with some space
    const groundLevel = getGroundLevel(viewportHeight)
    this.targetY = groundLevel - viewportHeight + 30 // Position ground 30px from bottom
    
    // Smooth camera follow
    this.x += (this.targetX - this.x) * this.smoothing
    this.y += (this.targetY - this.y) * this.smoothing
    
    // Clamp camera to not go negative (start at left edge)
    // This ensures the level starts at the left edge of the screen
    this.x = Math.max(0, this.x)
  }
  
  getViewport() {
    return {
      x: this.x,
      y: this.y
    }
  }
}

