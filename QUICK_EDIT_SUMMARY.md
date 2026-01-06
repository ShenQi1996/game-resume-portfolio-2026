# Quick Edit Summary

## What to Edit for Common Changes

### 1. Change Your Name and Intro

**File:** `src/data/portfolioData.js`

**Lines 3-7:**
```javascript
hero: {
  name: "Your Name",                    // ← Edit this
  title: "Senior Frontend Engineer",   // ← Edit this  
  tagline: "Your tagline here"         // ← Edit this
}
```

---

### 2. Change Section Order

**File:** `src/data/portfolioData.js`

**Find the `sections` array (near end of file):**
```javascript
sections: [
  { id: "intro", name: "Introduction", x: 200 },
  { id: "about", name: "About", x: 800 },
  { id: "skills", name: "Skills", x: 1400 },
  // ... etc
]
```

**To reorder:**
- Rearrange the array items
- Adjust `x` values (keep ~600px spacing between sections)
- Keep `id` values as: `intro`, `about`, `skills`, `experience`, `projects`, `education`, `awards`, `contact`

---

### 3. Edit Projects and Experience

**File:** `src/data/portfolioData.js`

**Projects (find `projects` array):**
```javascript
projects: [
  {
    title: "Project Name",              // ← Edit
    description: "Description...",      // ← Edit
    tech: ["React", "TypeScript"],      // ← Edit
    links: {
      live: "https://example.com",      // ← Edit
      github: "https://github.com/..."  // ← Edit
    }
  }
]
```

**Experience (find `experience` array):**
```javascript
experience: [
  {
    company: "Company Name",           // ← Edit
    role: "Your Role",                  // ← Edit
    period: "2021 - Present",          // ← Edit
    description: "Job description...",  // ← Edit
    achievements: [                      // ← Edit
      "Achievement 1",
      "Achievement 2"
    ]
  }
]
```

---

### 4. Change Colors and Fonts

**File:** `src/data/portfolioData.js`

**Colors (find `theme` object):**
```javascript
theme: {
  colors: {
    primary: "#4A90E2",      // ← Main color
    secondary: "#50C878",    // ← Secondary
    accent: "#FF6B6B",       // ← Highlight
    background: "#1A1A2E",  // ← Background
    surface: "#16213E",      // ← Panels
    text: "#FFFFFF",         // ← Text
    textSecondary: "#B0B0B0" // ← Secondary text
  },
  tileColors: {
    ground: "#2D5A3D",      // ← Game ground
    platform: "#4A7C59",    // ← Game platforms
    sign: "#E8B923",        // ← Section signs
    marker: "#FF6B6B"       // ← Section markers
  }
}
```

**File:** `src/styles/variables.scss`

**Fonts (find `:root` section):**
```scss
:root {
  --font-primary: 'Arial', sans-serif;  // ← Change this
  // ... other font sizes
}
```

---

## File Locations Quick Reference

| Change | File | Object/Array |
|--------|------|--------------|
| Name/Title | `src/data/portfolioData.js` | `hero` |
| Section Order | `src/data/portfolioData.js` | `sections` |
| Projects | `src/data/portfolioData.js` | `projects` |
| Experience | `src/data/portfolioData.js` | `experience` |
| Skills | `src/data/portfolioData.js` | `skills` |
| Education | `src/data/portfolioData.js` | `education` |
| Awards | `src/data/portfolioData.js` | `awards` |
| Contact | `src/data/portfolioData.js` | `contact` |
| Colors | `src/data/portfolioData.js` | `theme.colors` |
| Game Colors | `src/data/portfolioData.js` | `theme.tileColors` |
| Fonts | `src/styles/variables.scss` | `--font-primary` |

---

## After Making Changes

1. Save the file
2. The dev server will auto-reload (if running)
3. Check your browser to see changes
4. If issues occur, check browser console for errors

