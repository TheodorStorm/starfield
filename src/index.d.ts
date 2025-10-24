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
 * Configuration for background gradient
 */
export interface Background {
  /**
   * CSS gradient string or false to disable
   * @default 'radial-gradient(ellipse at center, #001018 0%, #000 100%)'
   */
  gradient: string | false;
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
   * Clean up and destroy the starfield instance
   * Removes event listeners and clears canvas
   */
  destroy(): void;
}

export { Starfield };
