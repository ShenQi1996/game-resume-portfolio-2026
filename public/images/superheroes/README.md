# Superhero Images

This folder contains the superhero images that appear in the game following the player.

## How to Add Images

1. **Place your image file** in this folder (`/public/images/superheroes/`)
   - Supported formats: PNG, JPG, JPEG, WebP
   - Recommended: PNG with transparent background
   - Recommended size: 200-400px width/height (will be scaled automatically)

2. **Update the configuration** in `/src/data/portfolioData.js`:
   - Open `portfolioData.js`
   - Find the `superheroImages` array
   - Add a new entry with your image details:

```javascript
{
  id: 'superhero-2', // Unique ID
  imagePath: '/images/superheroes/your-image-name.png', // Path to your image
  heightAboveGround: 150, // Height above ground (adjust as needed)
  offsetXSpeed: 2, // Horizontal floating speed
  offsetYSpeed: 1.5, // Vertical floating speed
  scale: 0.5 // Scale factor (0.3-1.0 recommended)
}
```

3. **Example configuration**:
```javascript
superheroImages: [
  {
    id: 'superhero-1',
    imagePath: '/images/superheroes/superhero-1.png',
    heightAboveGround: 150,
    offsetXSpeed: 2,
    offsetYSpeed: 1.5,
    scale: 0.5
  },
  {
    id: 'superhero-2',
    imagePath: '/images/superheroes/superhero-2.png',
    heightAboveGround: 160,
    offsetXSpeed: 1.8,
    offsetYSpeed: 1.3,
    scale: 0.6
  }
]
```

## Tips

- The system will randomly select one image from the available images when the game starts
- Adjust `scale` based on your image size (larger images need smaller scale values)
- Adjust `heightAboveGround` to position the superhero higher or lower
- Adjust `offsetXSpeed` and `offsetYSpeed` to change the floating animation speed

## Current Image

Place your first superhero image here and name it `superhero-1.png` (or update the path in `portfolioData.js`).

