# House Images

This folder contains the house images that appear in the game world.

## How to Add House Images

1. **Place your image file** in this folder (`/public/images/houses/`)
   - Supported formats: PNG, JPG, JPEG, WebP
   - Recommended: PNG with transparent background
   - Recommended size: 200-400px width/height (will be scaled automatically)

2. **Update the configuration** in `/src/data/portfolioData.js`:
   - Open `portfolioData.js`
   - Find the `houseImages` array
   - Update the `imagePath` to match your image filename:

```javascript
houseImages: [
  {
    id: 'house-1',
    imagePath: '/images/houses/your-house-image.png', // Your image filename
    scale: 0.5 // Scale factor (adjust based on image size)
  }
]
```

## Tips

- The system uses the first house image in the array for all houses in the game
- Adjust `scale` based on your image size (larger images need smaller scale values)
- Houses are anchored at the bottom center, so they sit on the ground properly
- Each house can have a random scale variation (0.9-1.1x) for visual variety

## Current Image

Place your house image here and name it `house-1.png` (or update the path in `portfolioData.js`).

