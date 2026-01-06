# Deployment Guide - Vercel

This guide will help you deploy your game portfolio to Vercel.

## Prerequisites

- A GitHub account (you already have this)
- A Vercel account (free tier is fine)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit [https://vercel.com](https://vercel.com)
   - Sign up or log in with your GitHub account

2. **Import Your Repository**
   - Click "Add New..." → "Project"
   - Find and select `game-resume-portfolio-2026` from your GitHub repositories
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist` (should auto-detect)
   - **Install Command**: `npm install` (should auto-detect)

4. **Environment Variables**
   - No environment variables needed for this project
   - Click "Deploy"

5. **Wait for Deployment**
   - Vercel will build and deploy your project
   - This usually takes 1-2 minutes

6. **Your Site is Live!**
   - Vercel will provide you with a URL like: `https://game-resume-portfolio-2026.vercel.app`
   - You can also add a custom domain later

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd game-resume-portfolio
   vercel
   ```

4. **Follow the prompts**
   - Link to existing project or create new
   - Confirm settings
   - Deploy!

## Automatic Deployments

Once connected to GitHub, Vercel will automatically:
- Deploy every push to `main` branch
- Create preview deployments for pull requests
- Rebuild on every commit

## Custom Domain (Optional)

1. Go to your project settings on Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Build Configuration

The project includes a `vercel.json` file with optimal settings:
- Framework: Vite
- Output: `dist` directory
- SPA routing: All routes redirect to `index.html`

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure Node.js version is 16+ (Vercel uses Node 18 by default)
- Check build logs in Vercel dashboard

### Assets Not Loading
- Ensure all assets are in `public/` directory
- Check that file paths use relative paths (e.g., `/image.png` not `./image.png`)

### 404 Errors on Refresh
- The `vercel.json` already includes SPA routing configuration
- All routes should redirect to `index.html`

## Performance Tips

- Vercel automatically optimizes images
- Static assets are served from CDN
- The build is optimized for production

## Support

If you encounter issues:
1. Check Vercel build logs
2. Verify your GitHub repository is connected
3. Ensure `package.json` has correct build scripts

