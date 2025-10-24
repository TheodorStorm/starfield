# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a lightweight, customizable 3D starfield scroller animation library published as `@byteventures/starfield`. It's a pure JavaScript library with TypeScript definitions that creates a performant space-like background effect using HTML5 Canvas and requestAnimationFrame.

## Build and Development Commands

```bash
# Build the library (generates version.js and copies files to dist/)
npm run build

# Run development server with demo (opens demo.html on port 3000)
npm run dev

# Build is automatically run before publishing
npm run prepublishOnly
```

## Architecture

### Core Files

- `src/Starfield.js` - Main class implementation with all animation logic
- `src/index.js` - Module exports (default and named export)
- `src/index.d.ts` - Complete TypeScript type definitions
- `src/version.js` - Auto-generated during build from package.json
- `scripts/build.cjs` - Build script that generates version.js and copies files to dist/

### Build Process

The build script (`scripts/build.cjs`) performs two key operations:
1. Generates `src/version.js` with VERSION and REPO_URL from package.json
2. Copies all `.js` and `.d.ts` files from `src/` to `dist/`

The library is distributed as ES modules (`"type": "module"` in package.json).

### Starfield Class Architecture

The `Starfield` class is a self-contained animation engine with these key systems:

**Initialization & Configuration**
- Deep merging of user options with defaults
- Configuration validation with clear error messages
- Support for both canvas element and CSS selector

**3D Star System**
- Each star has x, y, z coordinates in 3D space
- Stars move forward (decreasing z) and reset when they pass the camera
- 3D-to-2D projection using focal length perspective
- Stars have random hue (within configured range), base size, and position

**Performance Optimization System**
- Two-phase optimization: aggressive initial calibration (1s measurements, up to 8 attempts) followed by conservative continuous optimization (3s measurements every 10s)
- Automatic FPS monitoring using rolling 120-frame window for real-time measurements
- Dynamic star count adjustment based on measured FPS vs 60 FPS target
- localStorage caching of optimized star count for instant adaptation on repeat visits
- Device detection fallback (mobile/desktop) when no cached value exists

**Frame-Rate Independent Animation**
- Uses delta time compensation in `_update()` method
- Normalizes to 60 FPS baseline (16.67ms) for consistent speed across all frame rates
- Prevents speed variation between high refresh (120Hz) and standard (60Hz) displays

**Rendering Pipeline**
1. Save current frame to temporary canvas
2. Clear main canvas and redraw background gradient
3. Draw previous frame with reduced opacity (trail effect)
4. Render all stars with perspective-based size and brightness

**Gradient Caching**
- Background gradients are created once and cached
- Cache is invalidated on resize or config update

## Key Configuration Options

All options are optional with sensible defaults:

- `starCount`: Number or 'auto' for device detection (default: 'auto')
- `speed`: Animation speed multiplier (default: 0.6)
- `focalLength`: 3D perspective depth (default: 300)
- `starColors.hue`: Single number or [min, max] range (default: [180, 260] for blue-purple stars)
- `starColors.saturation`: 0-100 (default: 70)
- `starColors.lightness`: 0-100 (default: 90)
- `starSize.min/max`: Star size range (default: 0.5-2.0)
- `background`: Gradient config object (v2.0.0+: `{ type: 'radial', colors: [{ stop, color }] }`) or false to disable (default: black #000000 center to deep purple #341b6f edges)
- `trailEffect`: Motion blur intensity 0-1 (default: 0.3)
- `autoStart`: Auto-start animation (default: true)
- `deviceDetection.mobile/desktop`: Star counts for device types (default: 200/500)
- `debug`: Enable console logging for performance optimization (default: false)
- `maxStarCount`: Maximum star count cap for auto-optimization (default: 10000)

## Release Process

1. Update version in package.json
2. Build with `npm run build`
3. Commit changes with format: "Release vX.X.X - Brief description"
4. Create git tag
5. Push to GitHub
6. Publish to npm (automated via prepublishOnly hook)

## Important Implementation Details

- The library uses **frame-rate independent animation** - star speed is normalized using delta time to ensure consistent motion at any frame rate
- Star z-position threshold for reset is -200 (in `_update()`)
- Trail effect is implemented by overlaying the previous frame with configurable opacity
- Performance optimization can be monitored by enabling `debug: true` in config
- The `updateConfig()` method preserves animation state and intelligently adds/removes/updates stars
- All validation happens before config merge to ensure atomic updates
