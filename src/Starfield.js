import { VERSION, REPO_URL } from './version.js';

/**
 * Starfield - A customizable 3D starfield scroller animation
 * @class
 */
export default class Starfield {
  /**
   * Default configuration options
   * @private
   */
  static defaults = {
    starCount: 'auto', // number or 'auto' for device detection
    maxStarCount: 10000, // maximum stars for auto-optimization
    speed: 0.6,
    focalLength: 300,
    starColors: {
      hue: [180, 260], // hue range [min, max]
      saturation: 70,
      lightness: 90,
    },
    starSize: {
      min: 0.5,
      max: 2.0,
    },
    background: {
      type: 'radial',
      colors: [
        { stop: 0, color: '#000000' },  // Black (center) - RGB(0,0,0)
        { stop: 1, color: '#341b6f' },  // Deep purple (edges) - RGB(52,27,111)
      ],
    },
    trailEffect: 0.3, // opacity for motion blur (0-1)
    autoStart: true,
    debug: false, // enable console logging for calibration/optimization
    deviceDetection: {
      mobile: 200, // star count for mobile devices
      desktop: 500, // star count for desktop devices
    },
  };

  /**
   * Create a new Starfield instance
   * @param {HTMLCanvasElement|string} canvas - Canvas element or selector
   * @param {Object} options - Configuration options
   */
  constructor(canvas, options = {}) {
    // Resolve canvas element
    if (typeof canvas === 'string') {
      this.canvas = document.querySelector(canvas);
      if (!this.canvas) {
        throw new Error(`Canvas element not found: ${canvas}`);
      }
    } else {
      this.canvas = canvas;
    }

    if (!(this.canvas instanceof HTMLCanvasElement)) {
      throw new Error('First argument must be a canvas element or selector');
    }

    // Merge options with defaults
    this.config = this._mergeDeep(Starfield.defaults, options);

    // Validate configuration
    this._validateConfig(this.config);

    // Initialize state
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.animationId = null;
    this.isRunning = false;
    this.backgroundGradient = null; // Cached gradient object

    // Performance tracking for auto-optimization
    this.performanceStats = {
      frameTimestamps: [],
      calibrationStartTime: null,
      initialCalibrationComplete: false,
      targetFPS: 60,
      currentFPS: 0,
      // Initial calibration (aggressive)
      initialCalibrationDuration: 1000, // 1 second for fast initial convergence
      initialCalibrationAttempts: 0,
      maxInitialCalibrationAttempts: 8,
      // Continuous optimization (conservative)
      lastOptimizationTime: null,
      optimizationInterval: 10000, // 10 seconds between adjustments
      continuousOptimizationDuration: 3000, // 3 seconds for stable measurements
    };

    // Determine star count
    this.starCount =
      this.config.starCount === 'auto'
        ? this._detectDeviceCapability()
        : this.config.starCount;

    // Initialize stars
    for (let i = 0; i < this.starCount; i++) {
      this.stars.push(this._createStar());
    }

    // Set up canvas and resize handler
    this._setupCanvas();
    this._boundResize = () => this.resize();
    window.addEventListener('resize', this._boundResize);

    // Display version info
    console.log(`Starfield v${VERSION} - ${REPO_URL}`);

    // Auto-start if configured
    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Deep merge utility for configuration objects
   * @private
   */
  _mergeDeep(target, source) {
    const output = { ...target };
    if (this._isObject(target) && this._isObject(source)) {
      Object.keys(source).forEach((key) => {
        // Handle explicit false/null to allow overriding defaults
        if (source[key] === false || source[key] === null) {
          output[key] = source[key];
        } else if (this._isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this._mergeDeep(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  /**
   * Check if value is a plain object
   * @private
   */
  _isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Validate configuration values
   * @private
   */
  _validateConfig(config) {
    const validate = (value, min, max, name) => {
      if (typeof value !== 'number' || !isFinite(value) || value < min || value > max) {
        throw new Error(`Invalid ${name}: must be a finite number between ${min} and ${max} (got ${value})`);
      }
    };

    if (config.speed !== undefined) {
      validate(config.speed, 0.01, 10, 'speed');
    }

    if (config.focalLength !== undefined) {
      validate(config.focalLength, 50, 1000, 'focalLength');
    }

    if (config.trailEffect !== undefined) {
      validate(config.trailEffect, 0, 1, 'trailEffect');
    }

    if (config.starCount !== undefined && config.starCount !== 'auto') {
      validate(config.starCount, 1, 10000, 'starCount');
    }

    if (config.maxStarCount !== undefined) {
      validate(config.maxStarCount, 100, 50000, 'maxStarCount');
    }

    if (config.starSize) {
      if (config.starSize.min !== undefined) {
        validate(config.starSize.min, 0.1, 10, 'starSize.min');
      }
      if (config.starSize.max !== undefined) {
        validate(config.starSize.max, 0.1, 10, 'starSize.max');
      }
      if (config.starSize.min !== undefined && config.starSize.max !== undefined) {
        if (config.starSize.min > config.starSize.max) {
          throw new Error('starSize.min must be less than or equal to starSize.max');
        }
      }
    }

    if (config.starColors) {
      if (config.starColors.saturation !== undefined) {
        validate(config.starColors.saturation, 0, 100, 'starColors.saturation');
      }
      if (config.starColors.lightness !== undefined) {
        validate(config.starColors.lightness, 0, 100, 'starColors.lightness');
      }
      if (config.starColors.hue !== undefined) {
        if (Array.isArray(config.starColors.hue)) {
          if (config.starColors.hue.length !== 2) {
            throw new Error('starColors.hue array must contain exactly 2 values [min, max]');
          }
          validate(config.starColors.hue[0], 0, 360, 'starColors.hue[0]');
          validate(config.starColors.hue[1], 0, 360, 'starColors.hue[1]');
        } else {
          validate(config.starColors.hue, 0, 360, 'starColors.hue');
        }
      }
    }

    if (config.deviceDetection) {
      if (config.deviceDetection.mobile !== undefined) {
        validate(config.deviceDetection.mobile, 1, 10000, 'deviceDetection.mobile');
      }
      if (config.deviceDetection.desktop !== undefined) {
        validate(config.deviceDetection.desktop, 1, 10000, 'deviceDetection.desktop');
      }
    }
  }

  /**
   * Setup canvas with background gradient if configured
   * @private
   */
  _setupCanvas() {
    this.resize();
  }

  /**
   * Draw background gradient on canvas
   * @private
   */
  _drawBackgroundGradient() {
    if (!this.config.background) return;

    // Create and cache gradient object if not already cached
    if (!this.backgroundGradient) {
      const { type, colors } = this.config.background;

      if (type === 'radial') {
        this.backgroundGradient = this.ctx.createRadialGradient(
          this.centerX,
          this.centerY,
          0,
          this.centerX,
          this.centerY,
          Math.max(this.canvas.width, this.canvas.height)
        );
      }
      // Future: add support for 'linear' and 'conic' gradients

      // Apply color stops
      colors.forEach(({ stop, color }) => {
        this.backgroundGradient.addColorStop(stop, color);
      });
    }

    // Draw the cached gradient
    this.ctx.fillStyle = this.backgroundGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Detect device capability and return appropriate star count
   * @private
   */
  _detectDeviceCapability() {
    // Check for previously calibrated value
    try {
      const cached = localStorage.getItem('starfield-optimized-count');
      if (cached) {
        const count = parseInt(cached, 10);
        if (!isNaN(count) && count >= 100 && count <= this.config.maxStarCount) {
          return count;
        }
      }
    } catch (e) {
      // localStorage not available
    }

    // Fall back to device detection (current simplistic approach)
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const lowEnd =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

    return isMobile || lowEnd
      ? this.config.deviceDetection.mobile
      : this.config.deviceDetection.desktop;
  }

  /**
   * Resize canvas to match window size
   */
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
    // Invalidate cached gradient since canvas size changed
    // Next _drawBackgroundGradient() call will recreate with new dimensions
    this.backgroundGradient = null;
  }

  /**
   * Create a new star object
   * @private
   */
  _createStar() {
    const { starSize, starColors } = this.config;
    const [minHue, maxHue] = Array.isArray(starColors.hue)
      ? starColors.hue
      : [starColors.hue, starColors.hue];

    return {
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      z: Math.random() * 2000,
      baseSize: starSize.min + Math.random() * (starSize.max - starSize.min),
      hue: minHue + Math.random() * (maxHue - minHue),
    };
  }

  /**
   * Project 3D coordinates to 2D canvas space
   * @private
   */
  _project(x, y, z) {
    const scale = this.config.focalLength / (this.config.focalLength + z);
    return {
      x: this.centerX + x * scale,
      y: this.centerY + y * scale,
      scale: scale,
    };
  }

  /**
   * Update star positions
   * @private
   */
  _update() {
    const speed = this.config.speed;
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      star.z -= speed;
      if (star.z <= -200) {
        const newStar = this._createStar();
        star.x = newStar.x;
        star.y = newStar.y;
        star.z = newStar.z;
        star.baseSize = newStar.baseSize;
        star.hue = newStar.hue;
      }
    }
  }

  /**
   * Render stars to canvas
   * @private
   */
  _render() {
    const { trailEffect, starColors } = this.config;

    // Create temporary canvas for previous frame if not exists
    if (!this.tempCanvas) {
      this.tempCanvas = document.createElement('canvas');
      this.tempCtx = this.tempCanvas.getContext('2d');
    }

    // Ensure temp canvas matches size
    if (this.tempCanvas.width !== this.canvas.width || this.tempCanvas.height !== this.canvas.height) {
      this.tempCanvas.width = this.canvas.width;
      this.tempCanvas.height = this.canvas.height;
    }

    // Save current canvas to temp canvas
    this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    this.tempCtx.drawImage(this.canvas, 0, 0);

    // Clear and draw fresh gradient
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this._drawBackgroundGradient();

    // Draw previous frame on top with reduced opacity for trail effect
    if (trailEffect > 0) {
      this.ctx.globalAlpha = trailEffect; // Use trailEffect directly (0=no trails, 1=full trails)
      this.ctx.drawImage(this.tempCanvas, 0, 0);
      this.ctx.globalAlpha = 1.0; // Reset
    }

    // Render each star
    this.stars.forEach((star) => {
      const p = this._project(star.x, star.y, star.z);
      if (p.scale <= 0) return;

      const size = star.baseSize * p.scale;
      const brightness = Math.min(1, p.scale * 0.7);

      this.ctx.fillStyle = `hsla(${star.hue}, ${starColors.saturation}%, ${starColors.lightness}%, ${brightness})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  /**
   * Animation loop
   * @private
   */
  _animate() {
    if (!this.isRunning) return;

    // Track frame timestamp for FPS measurement
    const now = performance.now();
    this.performanceStats.frameTimestamps.push(now);

    // Keep only last 120 frames for rolling FPS calculation (2 seconds at 60 FPS)
    if (this.performanceStats.frameTimestamps.length > 120) {
      this.performanceStats.frameTimestamps.shift();
    }

    // Calculate current FPS continuously from rolling window
    if (this.performanceStats.frameTimestamps.length >= 10) {
      const timestamps = this.performanceStats.frameTimestamps;
      let totalInterval = 0;
      for (let i = 1; i < timestamps.length; i++) {
        totalInterval += timestamps[i] - timestamps[i - 1];
      }
      const avgInterval = totalInterval / (timestamps.length - 1);
      this.performanceStats.currentFPS = Math.round(1000 / avgInterval);
    }

    // Start calibration timer on first frame
    if (!this.performanceStats.calibrationStartTime) {
      this.performanceStats.calibrationStartTime = now;
    }

    // Run optimization (both initial calibration and continuous optimization)
    this._runOptimization(now);

    this._update();
    this._render();
    this.animationId = requestAnimationFrame(() => this._animate());
  }

  /**
   * Run FPS optimization (both initial calibration and continuous optimization)
   * @private
   */
  _runOptimization(now) {
    const stats = this.performanceStats;
    const isInitialPhase = !stats.initialCalibrationComplete;

    // Determine measurement duration based on phase
    const measurementDuration = isInitialPhase
      ? stats.initialCalibrationDuration
      : stats.continuousOptimizationDuration;

    const elapsed = now - stats.calibrationStartTime;

    // Wait for measurement period to complete
    if (elapsed < measurementDuration) {
      return;
    }

    // For continuous optimization, enforce minimum interval between adjustments
    if (!isInitialPhase) {
      if (stats.lastOptimizationTime && (now - stats.lastOptimizationTime) < stats.optimizationInterval) {
        // Reset timer for next measurement window
        stats.calibrationStartTime = now;
        return;
      }
    }

    // Calculate average FPS from collected timestamps
    const timestamps = stats.frameTimestamps;
    if (timestamps.length < 10) return; // Need enough samples

    // Calculate FPS from frame intervals
    let totalInterval = 0;
    for (let i = 1; i < timestamps.length; i++) {
      totalInterval += timestamps[i] - timestamps[i - 1];
    }
    const avgInterval = totalInterval / (timestamps.length - 1);
    const measuredFPS = 1000 / avgInterval;

    const targetFPS = stats.targetFPS;
    const fpsRatio = measuredFPS / targetFPS;
    const maxStars = this.config.maxStarCount;

    if (isInitialPhase) {
      // INITIAL CALIBRATION (aggressive)

      // Check if we've reached max attempts or are within acceptable range
      const isWithinRange = fpsRatio >= 0.9 && fpsRatio <= 1.5;
      const maxAttemptsReached = stats.initialCalibrationAttempts >= stats.maxInitialCalibrationAttempts;

      if (isWithinRange || maxAttemptsReached) {
        // Mark initial calibration complete
        stats.initialCalibrationComplete = true;
        stats.lastOptimizationTime = now;

        if (this.config.debug) {
          if (maxAttemptsReached && !isWithinRange) {
            console.log(
              `Initial calibration: Max attempts reached (${stats.maxInitialCalibrationAttempts}). Final: ${measuredFPS.toFixed(1)} FPS with ${this.starCount} stars. Switching to continuous optimization.`
            );
          } else {
            console.log(
              `Initial calibration complete: ${measuredFPS.toFixed(1)} FPS, ${this.starCount} stars. Continuous optimization active.`
            );
          }
        }

        // Store final value in localStorage for future sessions
        try {
          localStorage.setItem('starfield-optimized-count', this.starCount.toString());
        } catch (e) {
          // localStorage not available
        }

        // Reset timer for continuous optimization
        stats.calibrationStartTime = now;
        return;
      }

      // Continue initial calibration - adjust star count
      stats.initialCalibrationAttempts++;

      // Dynamic multiplier: more aggressive when further from target
      // Formula: 0.75 + (min(fpsRatio, 4) / 20)
      // Results: 1.5x→0.825, 2x→0.85, 3x→0.90, 4x+→0.95
      const aggressiveness = 0.75 + (Math.min(fpsRatio, 4) / 20);
      const newStarCount = Math.round(this.starCount * (fpsRatio * aggressiveness));
      const clampedCount = Math.max(100, Math.min(maxStars, newStarCount));

      // Check if we've hit max stars and can't increase further
      if (clampedCount === maxStars && this.starCount === maxStars && fpsRatio > 1.5) {
        stats.initialCalibrationComplete = true;
        stats.lastOptimizationTime = now;
        if (this.config.debug) {
          console.log(
            `Initial calibration complete: Max star count reached (${maxStars}), ${measuredFPS.toFixed(1)} FPS. Continuous optimization active.`
          );
        }
        try {
          localStorage.setItem('starfield-optimized-count', maxStars.toString());
        } catch (e) {
          // localStorage not available
        }
        stats.calibrationStartTime = now;
        return;
      }

      if (this.config.debug) {
        console.log(
          `Initial calibration (${stats.initialCalibrationAttempts}/${stats.maxInitialCalibrationAttempts}): ${measuredFPS.toFixed(1)} FPS, adjusting ${this.starCount} → ${clampedCount} stars`
        );
      }

      // Reset calibration timer for next measurement (keep timestamps for rolling window)
      stats.calibrationStartTime = now;

      // Apply adjustment (this will restart animation)
      this.updateConfig({ starCount: clampedCount });

    } else {
      // CONTINUOUS OPTIMIZATION (conservative)

      // Wider acceptable range for continuous mode (51-78 FPS for 60 target)
      const isWithinRange = fpsRatio >= 0.85 && fpsRatio <= 1.3;

      if (isWithinRange) {
        // Performance is acceptable, no adjustment needed
        stats.calibrationStartTime = now;
        return;
      }

      // Calculate adjustment with conservative multiplier
      const conservativeMultiplier = 0.9;
      let newStarCount = Math.round(this.starCount * (fpsRatio * conservativeMultiplier));

      // Limit adjustment to ±20% per step to avoid oscillation
      const maxChange = Math.round(this.starCount * 0.2);
      const minStars = this.starCount - maxChange;
      const maxStarsThisStep = this.starCount + maxChange;
      newStarCount = Math.max(minStars, Math.min(maxStarsThisStep, newStarCount));

      const clampedCount = Math.max(100, Math.min(maxStars, newStarCount));

      // Skip if change is too small (< 5%)
      const changePercent = Math.abs((clampedCount - this.starCount) / this.starCount);
      if (changePercent < 0.05) {
        stats.calibrationStartTime = now;
        return;
      }

      if (this.config.debug) {
        console.log(
          `Continuous optimization: ${measuredFPS.toFixed(1)} FPS, adjusting ${this.starCount} → ${clampedCount} stars`
        );
      }

      // Update timers
      stats.calibrationStartTime = now;
      stats.lastOptimizationTime = now;

      // Store updated value
      try {
        localStorage.setItem('starfield-optimized-count', clampedCount.toString());
      } catch (e) {
        // localStorage not available
      }

      // Apply adjustment
      this.updateConfig({ starCount: clampedCount });
    }
  }

  /**
   * Start the animation
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._animate();
  }

  /**
   * Stop the animation
   */
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Update configuration and restart if running
   * @param {Object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    const wasRunning = this.isRunning;
    if (wasRunning) this.stop();

    // Validate new config before merging
    this._validateConfig(newConfig);

    // Merge new config
    this.config = this._mergeDeep(this.config, newConfig);

    // Recalculate star count if changed
    if (newConfig.starCount !== undefined) {
      const oldStarCount = this.starCount;
      this.starCount =
        this.config.starCount === 'auto'
          ? this._detectDeviceCapability()
          : this.config.starCount;

      // Preserve existing stars, only add/remove as needed
      if (this.starCount > oldStarCount) {
        // Increasing: add new stars
        const starsToAdd = this.starCount - oldStarCount;
        for (let i = 0; i < starsToAdd; i++) {
          this.stars.push(this._createStar());
        }
      } else if (this.starCount < oldStarCount) {
        // Decreasing: remove stars from end
        this.stars.splice(this.starCount);
      }
    } else if (newConfig.starColors || newConfig.starSize) {
      // Update existing stars with new colors/sizes
      const { starSize, starColors } = this.config;
      const [minHue, maxHue] = Array.isArray(starColors.hue)
        ? starColors.hue
        : [starColors.hue, starColors.hue];

      this.stars.forEach((star) => {
        if (newConfig.starSize) {
          star.baseSize = starSize.min + Math.random() * (starSize.max - starSize.min);
        }
        if (newConfig.starColors && newConfig.starColors.hue !== undefined) {
          star.hue = minHue + Math.random() * (maxHue - minHue);
        }
      });
    }

    // Invalidate gradient cache if background changed
    if (newConfig.background !== undefined) {
      this.backgroundGradient = null;
    }

    if (wasRunning) this.start();
  }

  /**
   * Clean up and destroy the starfield instance
   */
  destroy() {
    this.stop();
    window.removeEventListener('resize', this._boundResize);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.stars = [];
  }

  /**
   * Get current measured FPS from rolling 120-frame window
   * @returns {number} Current FPS (0 if fewer than 10 frames collected)
   */
  getCurrentFPS() {
    return this.performanceStats.currentFPS;
  }
}
