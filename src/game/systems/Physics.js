import { getGroundLevel, getPlayerYOnGround } from '../constants'

export class Physics {
  constructor(viewportHeight = 600) {
    this.gravity = 0.8
    this.jumpPower = -15
    this.maxFallSpeed = 20
    this.friction = 0.85
    this.groundLevel = getGroundLevel(viewportHeight)
  }
  
  setGroundLevel(level) {
    this.groundLevel = level
  }
  
  update(player, platforms, deltaTime) {
    // Apply gravity
    if (!player.onGround) {
      player.velocityY += this.gravity * deltaTime
      player.velocityY = Math.min(player.velocityY, this.maxFallSpeed)
    }
    
    // Update position
    player.x += player.velocityX * deltaTime
    player.y += player.velocityY * deltaTime
    
    // Check collisions
    this.checkCollisions(player, platforms)
    
    // Apply friction on ground (after collision check, only if not actively moving)
    // Note: Friction is handled by stopHorizontal when keys are released
  }
  
  checkCollisions(player, platforms) {
    player.onGround = false
    
    for (const platform of platforms) {
      if (this.isColliding(player, platform)) {
        // Top collision (landing) - check if player is above platform and falling
        if (player.velocityY >= 0 && player.y + player.height <= platform.y + 2) {
          player.y = platform.y - player.height
          player.velocityY = 0
          player.onGround = true
        }
        // Bottom collision (hitting ceiling) - only if moving up
        else if (player.velocityY < 0 && player.y >= platform.y + platform.height - 10) {
          player.y = platform.y + platform.height
          player.velocityY = 0
        }
        // Side collisions - handle walls with directional blocking
        // Moving right (forward)
        if (player.velocityX > 0 && player.x < platform.x && player.x + player.width > platform.x - 5) {
          if (player.y + player.height > platform.y && player.y < platform.y + platform.height) {
            // Start wall doesn't block rightward movement - player can move forward past it
            if (!platform.isStartWall) {
              // Regular platform blocks from left
              player.x = platform.x - player.width
              player.velocityX = 0
            }
          }
        }
        // Moving left (backward) - check if hitting start wall
        else if (player.velocityX < 0 && player.x > platform.x + platform.width && player.x < platform.x + platform.width + 5) {
          if (player.y + player.height > platform.y && player.y < platform.y + platform.height) {
            // Start wall only blocks leftward (backward) movement
            if (platform.isStartWall) {
              player.x = platform.x + platform.width
              player.velocityX = 0
            } else {
              // Regular platform blocks from right
              player.x = platform.x + platform.width
              player.velocityX = 0
            }
          }
        }
      }
    }
    
    // Ground level - use centralized calculation
    const groundLevel = getGroundLevel(window.innerHeight)
    // Ensure player sits exactly on the ground
    if (player.y + player.height >= groundLevel) {
      player.y = getPlayerYOnGround(window.innerHeight, player.height)
      player.velocityY = 0
      player.onGround = true
    }
  }
  
  isColliding(player, platform) {
    return (
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y < platform.y + platform.height &&
      player.y + player.height > platform.y
    )
  }
  
  jump(player) {
    if (player.onGround) {
      player.velocityY = this.jumpPower
      player.onGround = false
    }
  }
  
  move(player, direction) {
    const speed = 8 // Increased speed for better responsiveness
    if (direction === 'left') {
      player.velocityX = -speed
    } else if (direction === 'right') {
      player.velocityX = speed
    }
  }
  
  stopHorizontal(player) {
    // Apply friction to slow down gradually
    // Only apply friction if player is not actively moving
    if (player.onGround) {
      player.velocityX *= this.friction
      if (Math.abs(player.velocityX) < 0.1) {
        player.velocityX = 0
      }
    } else {
      // In air, allow some momentum but reduce it
      player.velocityX *= 0.95
    }
  }
}

