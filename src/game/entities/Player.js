export function createPlayer() {
  return {
    x: 0, // Will be set to -1% position in GameRoot
    y: 400, // Adjusted to match new ground level (GROUND_LEVEL - player height)
    width: 32,
    height: 48,
    velocityX: 0,
    velocityY: 0,
    onGround: false
  }
}

