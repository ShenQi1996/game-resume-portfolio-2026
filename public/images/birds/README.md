# Bird Images

This folder contains bird images that will be displayed in the game alongside the programmatic birds.

## How to Add Bird Images

1. **Place your bird image file** in this folder (`/public/images/birds/`)

2. **Update `src/data/portfolioData.js`** - Add an entry to the `birdImages` array:

```javascript
birdImages: [
  {
    id: 'bird-1',
    imagePath: '/images/birds/your_bird_image.png',
    scale: 0.2 // Adjust scale to make bird bigger/smaller (0.1 = small, 0.5 = large)
  },
  {
    id: 'bird-2',
    imagePath: '/images/birds/another_bird.png',
    scale: 0.25
  }
]
```

3. **Image Requirements:**
   - Format: PNG (recommended for transparency) or JPG
   - The bird should face right (or be centered)
   - Transparent background works best
   - Recommended size: 200-400px width

4. **Notes:**
   - Image-based birds will appear alongside the existing programmatic birds
   - Birds will have parallax movement (move slower than camera for depth effect)
   - Birds will bob up and down with animation
   - Each bird image will be randomly selected for different bird instances

## Example

If you have a file named `paper_bird.png`, add this to `portfolioData.js`:

```javascript
birdImages: [
  {
    id: 'bird-1',
    imagePath: '/images/birds/paper_bird.png',
    scale: 0.2
  }
]
```

