# Castle Images

This folder contains castle images that will replace the programmatically drawn castle in the game.

## How to Add Castle Images

1. **Place your castle image file** in this folder (`/public/images/castles/`)

2. **Update `src/data/portfolioData.js`** - Add an entry to the `castleImages` array:

```javascript
castleImages: [
  {
    id: 'castle-1',
    imagePath: '/images/castles/your_castle_image.png',
    scale: 0.3 // Adjust scale to make castle bigger/smaller (0.1 = small, 0.5 = large)
  }
]
```

3. **Image Requirements:**
   - Format: PNG (recommended for transparency) or JPG
   - The castle should be facing forward or centered
   - Transparent background works best
   - Recommended size: 400-800px width (castles are large)
   - The image will be anchored at the bottom center, so make sure the base of the castle is at the bottom of the image

4. **Notes:**
   - The castle image will replace the programmatically drawn castle
   - The castle appears at the end of the level (around 94% progress)
   - The dragon and fire effects will still appear on top of the image-based castle
   - If no castle image is configured, the game will use the drawn castle

## Example

If you have a file named `paper_castle.png`, add this to `portfolioData.js`:

```javascript
castleImages: [
  {
    id: 'castle-1',
    imagePath: '/images/castles/paper_castle.png',
    scale: 0.3
  }
]
```

