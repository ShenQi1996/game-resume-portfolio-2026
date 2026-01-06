// Game constants - change these values to adjust game behavior

// ============================================
// LEVEL CONFIGURATION
// ============================================
export const LEVEL_WIDTH = 5000

// Dragon/Castle checkpoints (as percentages of level progress)
export const KILL_DRAGON_START = 0.82  // 82% - can start killing dragon
export const KILL_DRAGON_END = 0.92    // 92% - last chance to kill dragon
export const STOP_CHECKPOINT = 0.95    // 95% - player gets blocked here
export const CASTLE_POSITION = 0.94    // 94% - castle position

// ============================================
// GROUND AND PLAYER POSITIONING
// ============================================
// To adjust ground position, change GROUND_OFFSET:
// - Increase to move ground DOWN (further from bottom)
// - Decrease to move ground UP (closer to bottom)
export const GROUND_OFFSET = 10

// Calculate ground level Y coordinate (where ground platform top is)
export const getGroundLevel = (viewportHeight) => {
  return viewportHeight - GROUND_OFFSET
}

// Calculate player Y position when standing on ground
// Player's bottom edge will align with ground level
export const getPlayerYOnGround = (viewportHeight, playerHeight) => {
  return getGroundLevel(viewportHeight) - playerHeight
}

