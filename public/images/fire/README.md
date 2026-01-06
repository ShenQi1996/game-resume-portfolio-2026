# Fire Images

This folder contains fire images that will replace the programmatically drawn dragon fire in the game.

## How to Add Fire Images

1. **Place your fire image file** in this folder (`/public/images/fire/`)

2. **Update `src/data/portfolioData.js`** - Add an entry to the `fireImages` array:

```javascript
fireImages: [
  {
    id: 'fire-1',
    imagePath: '/images/fire/your_fire_image.png',
    scale: 0.5 // Adjust scale to make fire bigger/smaller (0.2 = small, 1.0 = large)
  }
]
```

3. **Image Requirements:**
   - Format: PNG (recommended for transparency) or JPG
   - The fire should be vertical (tall, narrow)
   - Transparent background works best
   - Recommended size: 100-200px width, 400-800px height
   - The image will be stretched vertically to reach from the dragon's mouth to the ground

4. **Notes:**
   - The fire image will replace the programmatically drawn fire
   - The fire appears when the dragon is breathing fire (when player is in the kill zone)
   - The fire will be stretched vertically to reach from the dragon's mouth to the ground level
   - The fire will have pulsing animation (slight size variation)
   - If no fire image is configured, the game will use the drawn fire

## Example

If you have a file named `paper_fire.png`, add this to `portfolioData.js`:

```javascript
fireImages: [
  {
    id: 'fire-1',
    imagePath: '/images/fire/paper_fire.png',
    scale: 0.5
  }
]
```

