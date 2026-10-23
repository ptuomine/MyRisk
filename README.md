# MyRisk Application

**Play online:** https://ptuomine.github.io/MyRisk/

MyRisk is a JavaScript-based application built with Webpack for efficient bundling and management of assets. This guide provides instructions for setting up, building, and running the app.

---

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (LTS recommended)  
   Download and install from [Node.js Official Website](https://nodejs.org/).

2. **npm** (Comes with Node.js)  
   Verify the installation by running:  
   ```bash
   node -v
   npm -v

## Build and run the app
   npm run build (to build ones)
   
   npm run watch (to keep building when changes are made)

## Change the map
   The map lives in `src/mapdata.js`, which is generated. Edit `tools/genmap.js` (continents, names, bonuses, sea routes), then run:

   node tools/genmap.js
   npm run build

## Publish online (GitHub Pages)
   The game is static files (index.html, css/, dist/bundle.js), so GitHub Pages can host it for free.
   One-time setup: repo Settings → Pages → Build and deployment → Deploy from a branch → `master`, folder `/ (root)` → Save.
   After that, every push to `master` updates https://ptuomine.github.io/MyRisk/ within a minute or two.
   Remember to run `npm run build` before committing source changes, so `dist/bundle.js` is up to date.
