export function createSign(x, y, text, color = 0xE8B923) {
  return {
    x,
    y: y - 80,
    width: 60,
    height: 80,
    text: text || '?',
    color
  }
}

