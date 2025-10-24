# @byteventures/starfield

A customizable, performant 3D starfield scroller animation for web projects. Creates a beautiful space-like background effect with stars moving towards the viewer in 3D space.

## Features

- 🚀 **Lightweight** - Pure JavaScript, no dependencies
- 🎨 **Highly Customizable** - Colors, speed, density, and more
- 📱 **Responsive** - Automatic device detection and optimization
- 🎯 **Framework Agnostic** - Works with any framework or vanilla JS
- 💪 **TypeScript Support** - Full type definitions included
- ⚡ **Performant** - Uses requestAnimationFrame and canvas optimization

## Installation

```bash
npm install @byteventures/starfield
```

Or install locally (for development):

```bash
npm install /path/to/packages/@byteventures/starfield
```

## Quick Start

### ES Modules (Vite, webpack, etc.)

```javascript
import Starfield from '@byteventures/starfield';

// Simple usage with defaults
const starfield = new Starfield('#myCanvas');
```

### HTML + Module Script

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; overflow: hidden; }
    #starfield {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <canvas id="starfield"></canvas>

  <script type="module">
    import Starfield from './node_modules/@byteventures/starfield/dist/index.js';
    new Starfield('#starfield');
  </script>
</body>
</html>
```

## Migration Guide

### Upgrading from v1.x to v2.x

**Breaking Change: Background Gradient Configuration**

Version 2.0.0 changed the background gradient configuration from CSS-based to canvas-native API for proper interaction with the trail effect.

#### Migration Steps:

**If using default gradient:**
No changes needed! Just update the package and the new default gradient will be applied automatically.

**If using custom gradient:**

1. **Old (v1.x):**
```javascript
new Starfield('#canvas', {
  background: {
    gradient: 'radial-gradient(ellipse at center, #ff0000 0%, #0000ff 100%)'
  }
});
```

2. **New (v2.0.0+):**
```javascript
new Starfield('#canvas', {
  background: {
    type: 'radial',
    colors: [
      { stop: 0, color: '#ff0000' },  // center (was 0% in CSS)
      { stop: 1, color: '#0000ff' }   // edge (was 100% in CSS)
    ]
  }
});
```

#### Key Changes:
- `gradient` property replaced with `type` and `colors` structure
- Color stops use decimal values (0-1) instead of percentages (0%-100%)
- Default gradient changed from blue-tinted (#001018 → #000) to purple-tinted (#000000 → #341b6f)

#### If disabling background:
```javascript
// Still works the same in v2.x
background: false
```

For more details, see [CHANGELOG.md](./CHANGELOG.md).

## Configuration Options

All options are optional. The defaults create a colorful starfield with blue-purple stars and a black-to-purple gradient background, optimized for most use cases.

```javascript
const starfield = new Starfield('#myCanvas', {
  // Number of stars or 'auto' for device detection
  starCount: 'auto', // 'auto' | number (default: 'auto')

  // Animation speed (higher = faster)
  speed: 0.6, // number (default: 0.6)

  // 3D perspective depth
  focalLength: 300, // number (default: 300)

  // Star colors
  starColors: {
    hue: [180, 260],      // [min, max] or single number (default: [180, 260])
    saturation: 70,       // 0-100 (default: 70)
    lightness: 90,        // 0-100 (default: 90)
  },

  // Star size range
  starSize: {
    min: 0.5,            // minimum size (default: 0.5)
    max: 2.0,            // maximum size (default: 2.0)
  },

  // Background gradient (v2.0.0+ format)
  background: {
    type: 'radial',                    // gradient type (default: 'radial')
    colors: [
      { stop: 0, color: '#000000' },   // center color (default: black)
      { stop: 1, color: '#341b6f' },   // edge color (default: deep purple)
    ],
  },
  // Or disable background:
  // background: false,

  // Motion blur effect (0-1, higher = more trail)
  trailEffect: 0.3, // number (default: 0.3)

  // Auto-start animation
  autoStart: true, // boolean (default: true)

  // Device-specific star counts when using 'auto'
  deviceDetection: {
    mobile: 200,         // star count for mobile (default: 200)
    desktop: 500,        // star count for desktop (default: 500)
  },

  // Enable debug logging for performance optimization
  debug: false, // boolean (default: false)

  // Maximum star count for auto-optimization
  maxStarCount: 10000, // number (default: 10000)
});
```

## API Methods

### `start()`
Start the animation. Safe to call multiple times.

```javascript
starfield.start();
```

### `stop()`
Stop the animation. Safe to call multiple times.

```javascript
starfield.stop();
```

### `resize()`
Manually resize the canvas. Called automatically on window resize.

```javascript
starfield.resize();
```

### `updateConfig(newConfig)`
Update configuration and restart if running.

```javascript
starfield.updateConfig({
  speed: 1.2,
  starColors: { hue: [0, 60] }, // Red/orange stars
});
```

### `getCurrentFPS()`
Get current frames per second (returns rolling average).

```javascript
const fps = starfield.getCurrentFPS();
console.log(`Current FPS: ${fps}`);
```

### `destroy()`
Clean up and remove all event listeners.

```javascript
starfield.destroy();
```

## Usage Examples

### Custom Colors

```javascript
// Purple/pink starfield
new Starfield('#canvas', {
  starColors: {
    hue: [280, 340],
    saturation: 80,
    lightness: 85,
  },
});

// Monochrome white stars
new Starfield('#canvas', {
  starColors: {
    hue: 0,
    saturation: 0,
    lightness: 100,
  },
});
```

### Performance Optimization

```javascript
// Lighter version for mobile
new Starfield('#canvas', {
  starCount: 150,
  trailEffect: 0.2, // Shorter trails = better performance
});

// High-quality for desktop
new Starfield('#canvas', {
  starCount: 1000,
  speed: 0.4,
  trailEffect: 0.8, // Longer trails = smoother look
});
```

### No Background Gradient

```javascript
// Transparent starfield over existing background
new Starfield('#canvas', {
  background: false,
  trailEffect: 0.1, // Short trails for crisp look
});
```

### Astro Framework

```astro
---
// Starfield.astro
---

<canvas id="starfield"></canvas>

<style>
  #starfield {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
</style>

<script>
  import Starfield from '@byteventures/starfield';

  const canvas = document.getElementById('starfield');
  if (canvas) {
    new Starfield(canvas, {
      starColors: { hue: [180, 260] },
      speed: 0.6,
    });
  }
</script>
```

### React

```jsx
import { useEffect, useRef } from 'react';
import Starfield from '@byteventures/starfield';

function StarfieldBackground() {
  const canvasRef = useRef(null);
  const starfieldRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      starfieldRef.current = new Starfield(canvasRef.current);
    }

    return () => {
      starfieldRef.current?.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
```

### Vue

```vue
<template>
  <canvas ref="canvas" class="starfield"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Starfield from '@byteventures/starfield';

const canvas = ref(null);
let starfield = null;

onMounted(() => {
  if (canvas.value) {
    starfield = new Starfield(canvas.value);
  }
});

onUnmounted(() => {
  starfield?.destroy();
});
</script>

<style scoped>
.starfield {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style>
```

## Browser Support

Works in all modern browsers that support:
- HTML5 Canvas
- ES6 modules
- `requestAnimationFrame`

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance & Optimization

### Automatic FPS Optimization (v2.0.0+)

The library includes an intelligent auto-optimization system that automatically adjusts star count to maintain smooth 60 FPS animation:

**Two-Phase Optimization:**
1. **Initial Calibration** (1-second measurements, up to 8 attempts)
   - Aggressively finds optimal star count on first load
   - Quickly adapts to device capabilities

2. **Continuous Optimization** (3-second measurements every 10 seconds)
   - Conservatively adjusts during runtime
   - Maintains performance as conditions change

**localStorage Caching:**
The optimized star count is cached in localStorage for instant adaptation on repeat visits. Each domain/path gets its own cached value.

**Debug Mode:**
Enable debug logging to monitor optimization in action:

```javascript
new Starfield('#canvas', {
  debug: true,  // Logs FPS measurements and star count adjustments
});
```

**Frame-Rate Independence (v2.0.1+):**
Animation speed is normalized using delta time compensation, ensuring consistent motion across different refresh rates (60Hz, 120Hz, 144Hz, etc.).

### Performance Tips

1. **Use Auto Star Count**: Set `starCount: 'auto'` (default) to let the library optimize automatically
2. **Monitor Performance**: Enable `debug: true` to see real-time FPS and optimization decisions
3. **Trail Effect**: Lower `trailEffect` values improve performance but reduce visual smoothness
4. **Manual Override**: Set specific `starCount` if you need consistent visuals across all devices
5. **Background Gradient**: Set `background: false` if you have your own background to reduce rendering overhead
6. **Max Star Cap**: Adjust `maxStarCount` if you want to limit the maximum number of stars (default: 10000)

## License

MIT License - Copyright (c) 2025 Theodor Storm / Byte Ventures IO AB

## Author

**Theodor Storm**
Email: theodor@byteventures.se
Website: [byteventures.se](https://byteventures.se)
