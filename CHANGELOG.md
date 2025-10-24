# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.2] - 2025-10-24

### Fixed
- Fixed localStorage namespace collision by changing key from `starfield-optimized-count` to `@byteventures/starfield:optimized-count`

## [2.0.1] - 2025-10-24

### Fixed
- Fixed frame-rate dependent speed with delta time compensation for consistent animation speed across different refresh rates (60Hz, 120Hz, etc.)

## [2.0.0] - 2025-10-24

### BREAKING CHANGES

**Background Gradient Configuration**

The background gradient configuration structure has changed from CSS-based to canvas-native API for proper interaction with the trail effect.

**Old (v1.x):**
```javascript
background: {
  gradient: 'radial-gradient(ellipse at center, #001018 0%, #000 100%)'
}
```

**New (v2.0.0+):**
```javascript
background: {
  type: 'radial',
  colors: [
    { stop: 0, color: '#001018' },
    { stop: 1, color: '#000000' }
  ]
}
```

**Migration Instructions:**

1. If you're using the default gradient, no changes needed - just update the library
2. If you have custom gradient configuration:
   - Change `gradient: 'radial-gradient(...)'` to the new object structure
   - Convert your CSS gradient string to `{ type, colors }` format
   - Extract color stops from your CSS gradient string

**Example Migration:**
```javascript
// Before (v1.x)
const starfield = new Starfield('#canvas', {
  background: {
    gradient: 'radial-gradient(circle, #ff0000 0%, #0000ff 100%)'
  }
});

// After (v2.0.0+)
const starfield = new Starfield('#canvas', {
  background: {
    type: 'radial',
    colors: [
      { stop: 0, color: '#ff0000' },
      { stop: 1, color: '#0000ff' }
    ]
  }
});
```

### Changed
- Default gradient changed from blue-tinted (#001018 to #000000) to purple-tinted (#000000 to #341b6f)
- Background gradient now drawn directly on canvas instead of using CSS

### Added
- Automatic FPS-based performance optimization system with two-phase approach:
  - Initial aggressive calibration (1s measurements, up to 8 attempts)
  - Conservative continuous optimization (3s measurements every 10s)
- localStorage caching of optimized star count for instant adaptation on repeat visits
- `debug` configuration option to enable console logging for performance optimization (default: `false`)
- `maxStarCount` configuration option to cap maximum stars during auto-optimization (default: `10000`)
- `getCurrentFPS()` method to check real-time performance

### Fixed
- Gradient now properly interacts with trail effect (previously gradient was CSS-based and didn't blend with canvas trails)

## [1.0.3] - 2024-10-XX

### Fixed
- Minor bug fixes and stability improvements

## [1.0.2] - 2024-10-XX

### Fixed
- Performance optimizations

## [1.0.1] - 2024-10-XX

### Fixed
- Initial release bug fixes

## [1.0.0] - 2024-10-XX

### Added
- Initial release
- 3D starfield animation with HTML5 Canvas
- Configurable star count, speed, colors, and size
- Background gradient support
- Trail effect (motion blur)
- Auto-start capability
- Device detection (mobile/desktop)
- Framework integration examples (Astro, React, Vue, Svelte)
- TypeScript support with full type definitions
- ES Module distribution

[2.0.2]: https://github.com/byteventures/starfield/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/byteventures/starfield/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/byteventures/starfield/compare/v1.0.3...v2.0.0
[1.0.3]: https://github.com/byteventures/starfield/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/byteventures/starfield/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/byteventures/starfield/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/byteventures/starfield/releases/tag/v1.0.0
