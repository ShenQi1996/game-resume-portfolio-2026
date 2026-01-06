# Princess Images

This folder contains princess images that will replace the programmatically drawn princess in the game.

## How to Add Princess Images

1. **Place your princess image file** in this folder (`/public/images/princesses/`)

2. **Update `src/data/portfolioData.js`** - Add an entry to the `princessImages` array:

```javascript
princessImages: [
  {
    id: 'princess-1',
    imagePath: '/images/princesses/your_princess_image.png',
    scale: 0.3 // Adjust scale to make princess bigger/smaller (0.1 = small, 0.5 = large)
  }
]
```

3. **Image Requirements:**
   - Format: PNG (recommended for transparency) or JPG
   - The princess should face forward or be centered
   - Transparent background works best
   - Recommended size: 200-400px width
   - The image will be anchored at the bottom center, so make sure the base of the princess is at the bottom of the image

4. **Notes:**
   - The princess image will replace the programmatically drawn princess
   - The princess appears at the end of the level (after the castle, saved from the dragon)
   - The princess will have a gentle bobbing animation (up and down movement)
   - If no princess image is configured, the game will use the drawn princess

## Example

If you have a file named `paper_princess.png`, add this to `portfolioData.js`:

```javascript
princessImages: [
  {
    id: 'princess-1',
    imagePath: '/images/princesses/paper_princess.png',
    scale: 0.3
  }
]
```

