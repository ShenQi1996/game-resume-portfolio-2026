# How to Run

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)

## Installation

1. Navigate to the project directory:
   ```bash
   cd game-resume-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Development Server

```bash
npm run dev
```

The application will start and automatically open in your browser at `http://localhost:3000`

**Note:** You'll see a loading screen first while the game initializes. Wait for it to complete before interacting with the game.

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## Troubleshooting

- **Port already in use**: Change the port in `vite.config.js` or kill the process using port 3000
- **Dependencies fail**: Delete `node_modules` and `package-lock.json`, then run `npm install` again
- **Game doesn't render**: Check browser console for WebGL errors. The app will fallback to Scroll View automatically.
- **Loading screen stuck**: Ensure all image assets are in `public/images/` directories. Check browser console for asset loading errors.
- **Controls not responding**: Wait for the loading screen to complete. Make sure the game canvas has focus (click on it).

