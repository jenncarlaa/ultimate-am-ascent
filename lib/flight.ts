/**
 * Shared, mutable flight state for the Ascent hero.
 * Written by ScrollTrigger / pointer handlers, read every frame by the
 * R3F scene and the DOM overlay. Kept outside React state on purpose:
 * it changes every frame and must not trigger re-renders.
 */
export const flight = {
  /** scroll progress through the hero track, 0..1 (target) */
  target: 0,
  /** smoothed progress used for rendering */
  p: 0,
  /** pointer, -1..1 (target and smoothed) */
  tmx: 0,
  tmy: 0,
  mx: 0,
  my: 0,
  /** scroll velocity from Lenis, used for chromatic aberration */
  velocity: 0,
  /** viewport width of the stage, for framing */
  width: 1440,
  reduced: false,
};

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ss = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

type Stop = [number, string];
const hexRgb = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
];
export function mixHex(stops: Stop[], p: number): [number, number, number] {
  let i = 0;
  while (i < stops.length - 2 && p > stops[i + 1][0]) i++;
  const a = stops[i];
  const b = stops[i + 1];
  const t = ss(a[0], b[0], p);
  const A = hexRgb(a[1]);
  const B = hexRgb(b[1]);
  return [lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)];
}

/** Sky palette, adapted to the ultimate.am teal range (turquoise → teal → deep teal → near-black). */
export const SKY_TOP: Stop[] = [[0, '#9FD8D6'], [0.18, '#9FD8D6'], [0.34, '#12959D'], [0.5, '#064449'], [0.64, '#031A1E'], [1, '#020C0E']];
export const SKY_BOTTOM: Stop[] = [[0, '#E6F4F3'], [0.18, '#D9EFEE'], [0.34, '#63B7B7'], [0.5, '#0A5C63'], [0.64, '#05292E'], [1, '#042227']];

/** Rocket altitude (world units) for a given progress. Slows down through separation. */
export function altitude(p: number) {
  if (p < 0.08) return 0;
  const k = clamp((p - 0.08) / 0.62, 0, 1);
  let y = Math.pow(k, 2.1) * 560;
  if (p > 0.7) y = 560 + (p - 0.7) * 260;
  return y;
}

/** Camera keyframes relative to the rocket: [progress, offset, look-at]. */
const CAM_KEYS: [number, [number, number, number], [number, number, number]][] = [
  [0.0, [9.5, 3.6, 23], [0, 4.4, 0]],
  [0.08, [9.0, 3.2, 21], [0, 4.6, 0]],
  [0.22, [7.0, -5.0, 15], [0, 6.0, 0]],
  [0.42, [5.0, -9.0, 14], [0, 7.0, 0]],
  [0.56, [18.0, 6.0, 34], [0, 3.0, 0]],
  [0.72, [7.0, 1.0, 15], [0, 4.0, 0]],
  [0.86, [5.5, -3.0, 12], [0, 2.0, 0]],
  [1.0, [0.6, -14.0, 3.5], [0, -2.0, 0]],
];
export function camAt(p: number) {
  let i = 0;
  while (i < CAM_KEYS.length - 2 && p > CAM_KEYS[i + 1][0]) i++;
  const a = CAM_KEYS[i];
  const b = CAM_KEYS[i + 1];
  const t = ss(a[0], b[0], p);
  return {
    off: [lerp(a[1][0], b[1][0], t), lerp(a[1][1], b[1][1], t), lerp(a[1][2], b[1][2], t)],
    look: [lerp(a[2][0], b[2][0], t), lerp(a[2][1], b[2][1], t), lerp(a[2][2], b[2][2], t)],
  };
}

/** Chapter windows for the overlay copy. */
export const PHASES = ['Ignition', 'Liftoff', 'Clouds', 'Orbit', 'Separation'];
export const phaseIndex = (p: number) => (p < 0.08 ? 0 : p < 0.2 ? 1 : p < 0.44 ? 2 : p < 0.72 ? 3 : 4);
