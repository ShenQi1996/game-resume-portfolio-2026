# Game-Style Resume Portfolio

An interactive, side-scrolling platformer-style resume portfolio built with React, PixiJS, and Framer Motion.

## Features

- 🎮 **Interactive Game Experience**: Navigate through your portfolio as a platformer game
- 📱 **Mobile Support**: Touch controls for mobile devices
- 🎨 **Customizable**: Easy-to-edit data file for all content
- 📜 **Scroll View Fallback**: Traditional scrollable view if game fails to load
- ⏳ **Loading Screen**: Beautiful loading screen with progress indicator
- 🏆 **Quest System**: Complete the quest by defeating the dragon and unlock scroll view
- ♿ **Accessible**: Keyboard navigation and screen reader support

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   The app will automatically open at `http://localhost:3000`

## Controls

### Desktop
- **A** or **←** : Move left
- **D** or **→** : Move right
- **Space** : Jump / Defeat dragon (when in kill zone) / Switch to scroll view (after quest complete)
- **Mouse Scroll** : Alternative movement control (scroll up/down to move)
- **E** : Interact with section markers
- **Escape** : Close panel

### Mobile
- Touch buttons appear at the bottom of the screen
- Left/Right arrows for movement
- Up arrow for jump
- E button for interaction

### Quest Complete
- After completing the quest (defeating the dragon), press **Space** to switch to scroll view

## Project Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Main app component
├── data/
│   └── portfolioData.js  # All portfolio content (EDIT THIS!)
├── game/
│   ├── GameRoot.jsx      # Main game component
│   ├── constants.js       # Game constants (level width, checkpoints, etc.)
│   ├── systems/           # Game systems (Physics, Camera, etc.)
│   │   ├── Camera.js
│   │   ├── InputKeyboard.js
│   │   ├── InputScroll.js
│   │   ├── InputTouch.js
│   │   ├── Parallax.js
│   │   ├── Physics.js
│   │   └── SectionZones.js
│   ├── entities/          # Game entities (Player, Platform, etc.)
│   │   ├── Marker.js
│   │   ├── Platform.js
│   │   ├── Player.js
│   │   └── Sign.js
│   └── utils/             # Utility functions
│       ├── colorUtils.js       # Color interpolation utilities
│       ├── backgroundUtils.js  # Background color calculation
│       └── sectionContent.js   # Section content formatting
├── ui/                    # React UI components
│   ├── Nav.jsx            # Navigation buttons
│   ├── HUD.jsx            # Heads-up display
│   ├── Panel.jsx           # Section detail panel
│   ├── ScrollView.jsx      # Fallback scroll view
│   ├── TouchControls.jsx   # Mobile touch controls
│   └── LoadingScreen.jsx  # Loading screen component
└── styles/                # SCSS stylesheets
    ├── App.scss
    ├── globals.scss
    ├── index.scss
    └── variables.scss
```

## Editing Your Content

All portfolio content is stored in `src/data/portfolioData.js`. This is the **only file you need to edit** to customize your portfolio.

### 1. Change Your Name and Intro

Edit the `hero` object:

```javascript
hero: {
  name: "Your Name",
  title: "Your Title",
  tagline: "Your tagline here"
}
```

### 2. Change Section Order

Edit the `sections` array. Each section has an `id`, `name`, and `x` position:

```javascript
sections: [
  { id: "intro", name: "Introduction", x: 200 },
  { id: "about", name: "About", x: 800 },
  // ... add or reorder sections
]
```

**Important:** 
- The `id` must match one of the section types: `intro`, `about`, `skills`, `experience`, `projects`, `education`, `awards`, `contact`
- The `x` value determines the horizontal position in the game level
- Adjust `x` values to space sections appropriately

### 3. Edit Projects and Experience

**Projects:**
```javascript
projects: [
  {
    title: "Project Name",
    description: "Project description...",
    tech: ["React", "TypeScript"],
    links: {
      live: "https://example.com",
      github: "https://github.com/example"
    }
  }
]
```

**Experience:**
```javascript
experience: [
  {
    company: "Company Name",
    role: "Your Role",
    period: "2021 - Present",
    description: "Job description...",
    achievements: [
      "Achievement 1",
      "Achievement 2"
    ]
  }
]
```

### 4. Change Colors and Fonts

Edit the `theme` object:

```javascript
theme: {
  colors: {
    primary: "#4A90E2",      // Main accent color
    secondary: "#50C878",    // Secondary accent
    accent: "#FF6B6B",       // Highlight color
    background: "#1A1A2E",    // Background
    surface: "#16213E",      // Panel/surface color
    text: "#FFFFFF",         // Main text
    textSecondary: "#B0B0B0" // Secondary text
  },
  tileColors: {
    ground: "#2D5A3D",       // Ground tiles
    platform: "#4A7C59",     // Platform tiles
    sign: "#E8B923",         // Sign color
    marker: "#FF6B6B"        // Section marker color
  }
}
```

**To change fonts**, edit `src/styles/variables.scss`:

```scss
:root {
  --font-primary: 'Your Font', sans-serif;
  // ... other font variables
}
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Adding Your Resume PDF

1. Place your resume PDF in the `public/` directory
2. Update `portfolioData.js`:

```javascript
contact: {
  // ...
  resumePdfUrl: "/resume.pdf"  // Path relative to public/
}
```

## Troubleshooting

### Game doesn't load
- Check browser console for errors
- The app will automatically switch to Scroll View if PixiJS fails to initialize
- Ensure your browser supports WebGL
- Wait for the loading screen to complete before interacting

### Loading screen stuck
- Check browser console for errors
- Ensure all image assets are properly placed in `public/images/` directories
- Verify WebGL is supported in your browser

### Sections not appearing
- Check that section `id` values match the expected types
- Verify `x` positions are positive numbers
- Ensure section data exists in `portfolioData.js`

### Controls not working
- Make sure the game canvas has focus (click on it)
- Check browser console for JavaScript errors
- On mobile, ensure touch events are not being blocked
- Wait for loading screen to complete before using controls

### Quest complete message not showing
- Ensure you've reached the end of the level (past the castle)
- Check that the dragon was defeated (press Space when in the kill zone)
- Verify `STOP_CHECKPOINT` constant in `src/game/constants.js` is set correctly

## Customization Tips

1. **Level Width**: Adjust `LEVEL_WIDTH` in `src/game/constants.js` if you add many sections
2. **Dragon Checkpoints**: Modify `KILL_DRAGON_START` and `KILL_DRAGON_END` in `src/game/constants.js` to change when players can defeat the dragon
3. **Physics**: Tweak gravity, jump power, and friction in `src/game/systems/Physics.js`
4. **Camera Smoothing**: Adjust `smoothing` value in `src/game/systems/Camera.js`
5. **Parallax Speed**: Modify layer speeds in the parallax initialization
6. **Background Colors**: Edit section `bgColor` values in `portfolioData.js` to customize the time-of-day color transitions

## License

This project is open source and available for personal and commercial use.

