/**
 * Configuration for star colors
 */
export interface StarColors {
  /**
   * Hue value(s) for stars. Can be a single number or [min, max] range
   * @default [180, 260]
   */
  hue: number | [number, number];

  /**
   * Saturation percentage (0-100)
   * @default 70
   */
  saturation: number;

  /**
   * Lightness percentage (0-100)
   * @default 90
   */
  lightness: number;
}

/**
 * Configuration for star size
 */
export interface StarSize {
  /**
   * Minimum star size
   * @default 0.5
   */
  min: number;

  /**
   * Maximum star size
   * @default 2.0
   */
  max: number;
}

/**
 * Color stop for background gradient
 */
export interface BackgroundColorStop {
  /**
   * Position in gradient (0-1, where 0 is center and 1 is edge for radial gradients)
   */
  stop: number;

  /**
   * Color at this stop (hex, rgb, rgba, or named CSS color)
   */
  color: string;
}

/**
 * Configuration for background gradient
 * @since 2.0.0 - Breaking change: replaced CSS gradient string with object structure
 */
export interface Background {
  /**
   * Gradient type
   * @default 'radial'
   */
  type: 'radial';

  /**
   * Color stops for the gradient
   * @default [{ stop: 0, color: '#000000' }, { stop: 1, color: '#341b6f' }]
   */
  colors: BackgroundColorStop[];
}

/**
 * Device-specific star count configuration
 */
export interface DeviceDetection {
  /**
   * Star count for mobile devices
   * @default 200
   */
  mobile: number;

  /**
   * Star count for desktop devices
   * @default 500
   */
  desktop: number;
}

/**
 * Starfield configuration options
 */
export interface StarfieldOptions {
  /**
   * Number of stars or 'auto' for device-based detection
   * @default 'auto'
   */
  starCount?: number | 'auto';

  /**
   * Animation speed (higher = faster)
   * @default 0.6
   */
  speed?: number;

  /**
   * 3D perspective focal length
   * @default 300
   */
  focalLength?: number;

  /**
   * Star color configuration
   */
  starColors?: Partial<StarColors>;

  /**
   * Star size range
   */
  starSize?: Partial<StarSize>;

  /**
   * Background gradient configuration
   */
  background?: Partial<Background> | false;

  /**
   * Motion blur trail intensity (0-1, where 0=no trails, 1=long trails)
   * @default 0.3
   */
  trailEffect?: number;

  /**
   * Whether to start animation automatically
   * @default true
   */
  autoStart?: boolean;

  /**
   * Device-specific star count configuration
   */
  deviceDetection?: Partial<DeviceDetection>;

  /**
   * Enable debug logging for performance optimization
   * @default false
   */
  debug?: boolean;

  /**
   * Maximum star count cap for auto-optimization
   * @default 10000
   */
  maxStarCount?: number;
}

/**
 * A customizable 3D starfield scroller animation
 */
export default class Starfield {
  /**
   * The canvas element being rendered to
   */
  readonly canvas: HTMLCanvasElement;

  /**
   * Current configuration
   */
  readonly config: Required<StarfieldOptions>;

  /**
   * Whether the animation is currently running
   */
  readonly isRunning: boolean;

  /**
   * Create a new Starfield instance
   * @param canvas - Canvas element or CSS selector string
   * @param options - Configuration options
   * @throws Error if canvas element is not found or invalid
   */
  constructor(canvas: HTMLCanvasElement | string, options?: StarfieldOptions);

  /**
   * Resize canvas to match window size
   * Called automatically on window resize
   */
  resize(): void;

  /**
   * Start the animation
   * Safe to call multiple times (won't create duplicate animations)
   */
  start(): void;

  /**
   * Stop the animation
   * Safe to call multiple times
   */
  stop(): void;

  /**
   * Update configuration and restart if running
   * @param newConfig - Partial configuration to merge with current config
   */
  updateConfig(newConfig: Partial<StarfieldOptions>): void;

  /**
   * Get current frames per second (FPS)
   * Returns rolling average FPS based on recent frame times
   * @returns Current FPS or 0 if animation is not running
   */
  getCurrentFPS(): number;

  /**
   * Clean up and destroy the starfield instance
   * Removes event listeners and clears canvas
   */
  destroy(): void;
}

export { Starfield };
