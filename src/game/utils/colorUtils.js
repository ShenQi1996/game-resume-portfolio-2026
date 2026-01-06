/**
 * Color utility functions for game rendering
 */

/**
 * Interpolate between two hex colors
 * @param {number} color1 - First color as hex number (e.g., 0xFF0000)
 * @param {number} color2 - Second color as hex number (e.g., 0x0000FF)
 * @param {number} factor - Interpolation factor (0 to 1)
 * @returns {number} Interpolated color as hex number
 */
export const interpolateColor = (color1, color2, factor) => {
  // Extract RGB components
  const r1 = (color1 >> 16) & 0xFF
  const g1 = (color1 >> 8) & 0xFF
  const b1 = color1 & 0xFF
  
  const r2 = (color2 >> 16) & 0xFF
  const g2 = (color2 >> 8) & 0xFF
  const b2 = color2 & 0xFF
  
  // Interpolate each component
  const r = Math.round(r1 + (r2 - r1) * factor)
  const g = Math.round(g1 + (g2 - g1) * factor)
  const b = Math.round(b1 + (b2 - b1) * factor)
  
  // Combine back into hex color
  return (r << 16) | (g << 8) | b
}

/**
 * Apply smoothstep interpolation to factor for smoother transitions
 * @param {number} factor - Input factor (0 to 1)
 * @returns {number} Smoothed factor
 */
export const smoothstep = (factor) => {
  return factor * factor * (3 - 2 * factor)
}

