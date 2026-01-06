# Dragon Images

This folder contains dragon images that will replace the programmatically drawn dragon in the game.

## How to Add Dragon Images

1. **Place your dragon image file** in this folder (`/public/images/dragons/`)

2. **Update `src/data/portfolioData.js`** - Add an entry to the `dragonImages` array:

```javascript
dragonImages: [
  {
    id: 'dragon-1',
    imagePath: '/images/dragons/your_dragon_image.png',
    scale: 0.3 // Adjust scale to make dragon bigger/smaller (0.1 = small, 0.5 = large)
  }
]
```

3. **Image Requirements:**
   - Format: PNG (recommended for transparency) or JPG
   - The dragon should face forward or be centered
   - Transparent background works best
   - Recommended size: 200-400px width
   - The image will be centered, so make sure the dragon is centered in the image

4. **Notes:**
   - The dragon image will replace the programmatically drawn dragon
   - The dragon appears on top of the castle (on the center tower)
   - The dragon will have a gentle bobbing animation (up and down movement)
   - The fire breath effect will still appear below the image-based dragon
   - If no dragon image is configured, the game will use the drawn dragon

## Example

If you have a file named `paper_dragon.png`, add this to `portfolioData.js`:

```javascript
dragonImages: [
  {
    id: 'dragon-1',
    imagePath: '/images/dragons/paper_dragon.png',
    scale: 0.3
  }
]
```

