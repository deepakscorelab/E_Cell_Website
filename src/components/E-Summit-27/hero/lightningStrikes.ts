/** React Bits click-strike timing, held in a bounded pool to cap shader work. */
export const MAX_LIGHTNING_STRIKES = 4;
export const LIGHTNING_STRIKE_LIFE = 1300;
const LEADER = 0.11;

interface Strike { x: number; y: number; born: number; seed: number; reach: number }
type NewStrike = Omit<Strike, "born">;

const smootherstep = (value: number) => {
  const t = Math.min(1, Math.max(0, value));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

export class LightningStrikes {
  private strikes: Strike[] = Array.from({ length: MAX_LIGHTNING_STRIKES }, () =>
    ({ x: 0, y: 0, born: -Infinity, seed: 0, reach: 2 }));
  private next = 0;

  add(strike: NewStrike, now: number) {
    Object.assign(this.strikes[this.next], strike, { born: now });
    this.next = (this.next + 1) % MAX_LIGHTNING_STRIKES;
  }

  clear() {
    for (const strike of this.strikes) strike.born = -Infinity;
    this.next = 0;
  }

  hasActive(now: number) {
    return this.strikes.some(strike => now >= strike.born && now - strike.born < LIGHTNING_STRIKE_LIFE);
  }

  /** Fill reusable GPU buffers and return the original strike flash envelope. */
  writeUniforms(now: number, strikeData: Float32Array, infoData: Float32Array) {
    let flash = 0;
    for (let j = 0; j < MAX_LIGHTNING_STRIKES; j++) {
      const strike = this.strikes[j];
      const age = (now - strike.born) / 1000;
      const base = j * 4;
      if (age < 0 || age >= LIGHTNING_STRIKE_LIFE / 1000) {
        strikeData.fill(0, base, base + 4);
        infoData.fill(0, base, base + 4);
        continue;
      }
      const progress = Math.min(1, age / LEADER);
      const since = age - LEADER;
      let envelope = 0.45 + 0.35 * progress;
      if (since >= 0) {
        envelope = 1.8 * Math.exp(-since * 5.5) * (0.85 + 0.2 * Math.sin(since * 70));
        if (since > 0.17) envelope += Math.exp(-(since - 0.17) * 9);
        if (since > 0.33) envelope += 0.7 * Math.exp(-(since - 0.33) * 10);
        flash += 0.5 * Math.exp(-since * 9);
        if (since > 0.17) flash += 0.25 * Math.exp(-(since - 0.17) * 12);
      }
      envelope *= 1 - smootherstep((age - 0.9) / 0.4);
      strikeData[base] = strike.x;
      strikeData[base + 1] = strike.y;
      strikeData[base + 2] = strike.reach * (1 - progress ** 1.6);
      strikeData[base + 3] = envelope;
      infoData[base] = strike.seed;
      infoData[base + 1] = strike.reach;
      infoData[base + 2] = since >= 0 ? 1 : 0;
      infoData[base + 3] = 0;
    }
    return Math.min(1, flash);
  }
}
