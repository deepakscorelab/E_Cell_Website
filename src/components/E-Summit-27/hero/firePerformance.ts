export const QUALITY = [
  { name: "high", octaves: 4, embers: 1000, shards: 32, renderScale: 0.75 },
  { name: "medium", octaves: 3, embers: 550, shards: 16, renderScale: 0.6 },
  { name: "low", octaves: 3, embers: 260, shards: 0, renderScale: 0.5 },
  { name: "minimal", octaves: 2, embers: 150, shards: 0, renderScale: 0.45 },
] as const;

/** Bound fragment shader work even on a retina / ultrawide display. */
export function firePixelRatio(width: number, height: number, dpr: number, tier: number, mobile: boolean) {
  const initialScale = mobile ? QUALITY[2].renderScale : QUALITY[0].renderScale;
  const budget = (mobile ? 350_000 : 1_200_000) * (QUALITY[tier].renderScale / initialScale) ** 2;
  return Math.min(
    (mobile ? 1 : Math.min(dpr || 1, 1.5)) * QUALITY[tier].renderScale,
    Math.sqrt(budget / Math.max(1, width * height)),
  );
}

/** Pace rendering without speeding up the animation on 90/120/144 Hz screens. */
export class FrameClock {
  interval: number;
  private next = 0;
  private last: number | null = null;
  constructor(fps: number) { this.interval = 1000 / fps; }
  reset() { this.next = 0; this.last = null; }
  advance(now: number): number | null {
    if (this.last !== null && now + 0.5 < this.next) return null;
    const delta = this.last === null ? this.interval : now - this.last;
    this.last = now;
    // Preserve the deadline's phase, but never catch up missed frames in a burst.
    this.next = this.next ? this.next + this.interval : now + this.interval;
    if (this.next <= now + 0.5) this.next = now + this.interval;
    return delta;
  }
}

/** Keep checking for sustained slowdown, including thermal throttling later on. */
export class FireQuality {
  tier: number;
  private warmup = 15;
  private sum = 0;
  private count = 0;
  private slowWindows = 0;
  private budget: number;
  constructor(mobile: boolean) {
    this.tier = mobile ? 2 : 0;
    this.budget = (1000 / (mobile ? 30 : 60)) * 1.35;
  }
  reset() {
    this.warmup = 15;
    this.sum = this.count = this.slowWindows = 0;
  }
  sample(delta: number): "keep" | "lower" | "disable" {
    if (this.warmup > 0) { this.warmup--; return "keep"; }
    this.sum += Math.min(delta, 100);
    if (++this.count < 60) return "keep";
    this.slowWindows = this.sum / this.count > this.budget ? this.slowWindows + 1 : 0;
    this.sum = this.count = 0;
    if (this.slowWindows < 2) return "keep";
    if (this.tier === QUALITY.length - 1) return "disable";
    this.tier++;
    this.reset();
    return "lower";
  }
}
