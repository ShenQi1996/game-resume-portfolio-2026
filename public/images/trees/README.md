# Tree Images

This folder contains the tree images that appear in the game world.

## How to Add Tree Images

1. **Place your image file** in this folder (`/public/images/trees/`)
   - Supported formats: PNG, JPG, JPEG, WebP
   - Recommended: PNG with transparent background
   - Recommended size: 200-400px width/height (will be scaled automatically)

2. **Update the configuration** in `/src/data/portfolioData.js`:
   - Open `portfolioData.js`
   - Find the `treeImages` array
   - Update the `imagePath` to match your image filename:

```javascript
treeImages: [
  {
    id: 'tree-1',
    imagePath: '/images/trees/your-tree-image.png', // Your image filename
    scale: 0.3 // Scale factor (adjust based on image size)
  }
]
```

## Tips

- The system uses the first tree image in the array for all trees in the game (both checkpoint trees and forest trees)
- Adjust `scale` based on your image size (larger images need smaller scale values)
- Trees are anchored at the bottom center, so they sit on the ground properly
- Each forest tree can have a random scale variation (0.8-1.2x) for visual variety

## Current Image

Place your tree image here and name it `tree-1.png` (or update the path in `portfolioData.js`).

