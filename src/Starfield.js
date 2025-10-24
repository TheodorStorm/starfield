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
      gradient: 'radial-gradient(ellipse at center, #001018 0%, #000 100%)',
    },
    trailEffect: 0.3, // opacity for motion blur (0-1)
    autoStart: true,
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

    // Apply background gradient if configured
    if (this.config.background && this.config.background.gradient) {
      this.canvas.style.background = this.config.background.gradient;
    }
  }

  /**
   * Detect device capability and return appropriate star count
   * @private
   */
  _detectDeviceCapability() {
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

    // Apply trail effect (motion blur) - inverted so 0=no trails, 1=long trails
    this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - trailEffect})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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

    this._update();
    this._render();
    this.animationId = requestAnimationFrame(() => this._animate());
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
      this.starCount =
        this.config.starCount === 'auto'
          ? this._detectDeviceCapability()
          : this.config.starCount;

      // Recreate stars with new count
      this.stars = [];
      for (let i = 0; i < this.starCount; i++) {
        this.stars.push(this._createStar());
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

    // Reapply background if changed
    if (newConfig.background !== undefined) {
      this._setupCanvas();
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
}
