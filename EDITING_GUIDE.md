# Editing Guide

This guide shows you exactly what to edit to customize your portfolio.

## 1. Change Your Name and Intro

**File:** `src/data/portfolioData.js`

**Location:** `hero` object (lines 3-7)

```javascript
hero: {
  name: "Your Name",                    // ← Change this
  title: "Senior Frontend Engineer",    // ← Change this
  tagline: "Building interactive experiences with code"  // ← Change this
}
```

## 2. Change Section Order

**File:** `src/data/portfolioData.js`

**Location:** `sections` array (near the end of the file)

```javascript
sections: [
  { id: "intro", name: "Introduction", x: 200 },
  { id: "about", name: "About", x: 800 },
  { id: "skills", name: "Skills", x: 1400 },
  { id: "experience", name: "Experience", x: 2000 },
  { id: "projects", name: "Projects", x: 2600 },
  { id: "education", name: "Education", x: 3200 },
  { id: "awards", name: "Awards", x: 3800 },
  { id: "contact", name: "Contact", x: 4400 }
]
```

**To reorder:**
1. Rearrange the array items
2. Adjust `x` values to space them out (each section needs ~600px spacing)
3. Keep `id` values matching: `intro`, `about`, `skills`, `experience`, `projects`, `education`, `awards`, `contact`

**Example - Remove Awards, reorder:**
```javascript
sections: [
  { id: "intro", name: "Introduction", x: 200 },
  { id: "projects", name: "Projects", x: 800 },      // Moved up
  { id: "experience", name: "Experience", x: 1400 },  // Moved up
  { id: "skills", name: "Skills", x: 2000 },
  { id: "about", name: "About", x: 2600 },
  { id: "education", name: "Education", x: 3200 },
  { id: "contact", name: "Contact", x: 3800 }
  // Awards section removed
]
```

## 3. Edit Projects and Experience

### Projects

**File:** `src/data/portfolioData.js`

**Location:** `projects` array

```javascript
projects: [
  {
    title: "Interactive Portfolio",           // ← Project name
    description: "A game-style portfolio...", // ← Description
    tech: ["React", "PixiJS", "SCSS"],       // ← Technologies used
    links: {
      live: "https://example.com",           // ← Live demo URL
      github: "https://github.com/example"    // ← GitHub URL
    }
  },
  // Add more projects here...
]
```

**To add a project:**
```javascript
{
  title: "My New Project",
  description: "Description of what it does...",
  tech: ["React", "Node.js"],
  links: {
    live: "https://myproject.com",
    github: "https://github.com/me/myproject"
  }
}
```

### Experience

**File:** `src/data/portfolioData.js`

**Location:** `experience` array

```javascript
experience: [
  {
    company: "Tech Company Inc",              // ← Company name
    role: "Senior Frontend Engineer",        // ← Your role
    period: "2021 - Present",                // ← Time period
    description: "Led development of...",    // ← Job description
    achievements: [                          // ← Key achievements
      "Built interactive portfolio experiences",
      "Optimized rendering performance by 40%"
    ]
  }
]
```

**To add experience:**
```javascript
{
  company: "New Company",
  role: "Frontend Developer",
  period: "2019 - 2021",
  description: "Developed web applications...",
  achievements: [
    "Achievement 1",
    "Achievement 2"
  ]
}
```

## 4. Change Colors and Fonts

### Colors

**File:** `src/data/portfolioData.js`

**Location:** `theme.colors` and `theme.tileColors`

```javascript
theme: {
  colors: {
    primary: "#4A90E2",      // ← Main accent (buttons, links)
    secondary: "#50C878",   // ← Secondary accent
    accent: "#FF6B6B",      // ← Highlight color
    background: "#1A1A2E",  // ← Background color
    surface: "#16213E",     // ← Panel/surface color
    text: "#FFFFFF",        // ← Main text color
    textSecondary: "#B0B0B0" // ← Secondary text
  },
  tileColors: {
    ground: "#2D5A3D",      // ← Ground tiles in game
    platform: "#4A7C59",   // ← Platform tiles
    sign: "#E8B923",        // ← Section sign color
    marker: "#FF6B6B"       // ← Section marker color
  }
}
```

**To change colors:**
1. Use hex color codes (e.g., `#FF0000` for red)
2. Or use named colors (e.g., `"blue"`, `"red"`)
3. Update both `colors` and `tileColors` for game elements

### Fonts

**File:** `src/styles/variables.scss`

**Location:** `:root` CSS variables

```scss
:root {
  --font-primary: 'Arial', sans-serif;  // ← Change this
  
  --font-size-base: 16px;
  --font-size-small: 14px;
  --font-size-large: 20px;
  --font-size-xl: 24px;
  --font-size-xxl: 32px;
}
```

**To change font:**
```scss
--font-primary: 'Roboto', 'Helvetica', sans-serif;
```

**Note:** Make sure to import the font in `index.html` if using a web font:
```html
<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
```

## 5. Adjust Game Constants

**File:** `src/game/constants.js`

You can modify game behavior by editing constants:

```javascript
// Level configuration
export const LEVEL_WIDTH = 5000  // Total level width

// Dragon/Castle checkpoints (as percentages of level progress)
export const KILL_DRAGON_START = 0.82  // 82% - can start killing dragon
export const KILL_DRAGON_END = 0.92    // 92% - last chance to kill dragon
export const STOP_CHECKPOINT = 0.95    // 95% - player gets blocked here
export const CASTLE_POSITION = 0.94     // 94% - castle position

// Ground positioning
export const GROUND_OFFSET = 10  // Distance from bottom of screen
```

## Quick Reference

| What to Change | File | Section |
|---------------|------|---------|
| Name/Title/Tagline | `portfolioData.js` | `hero` |
| Section Order | `portfolioData.js` | `sections` |
| Projects | `portfolioData.js` | `projects` |
| Experience | `portfolioData.js` | `experience` |
| Skills | `portfolioData.js` | `skills` |
| Education | `portfolioData.js` | `education` |
| Awards | `portfolioData.js` | `awards` |
| Contact Info | `portfolioData.js` | `contact` |
| Colors | `portfolioData.js` | `theme.colors` |
| Game Tile Colors | `portfolioData.js` | `theme.tileColors` |
| Fonts | `variables.scss` | `--font-primary` |
| Level Width | `constants.js` | `LEVEL_WIDTH` |
| Dragon Checkpoints | `constants.js` | `KILL_DRAGON_START/END` |

## Tips

1. **Always test after changes**: Run `npm run dev` to see your changes
2. **Keep section IDs consistent**: Don't change `id` values in sections array
3. **Spacing sections**: Keep at least 600px between section `x` values
4. **Color contrast**: Ensure text is readable on your chosen backgrounds
5. **Save your resume PDF**: Place it in `public/` and update `resumePdfUrl` in `contact`
6. **Loading screen**: The loading screen automatically shows your name and title from `portfolioData.js`
7. **Background colors**: Each section can have a `bgColor` property for smooth color transitions
8. **Quest system**: Players must defeat the dragon (press Space in kill zone) to complete the quest

