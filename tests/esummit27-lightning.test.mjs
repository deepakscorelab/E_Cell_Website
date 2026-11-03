import test from "node:test";
import assert from "node:assert/strict";
import { LightningStrikes, MAX_LIGHTNING_STRIKES, LIGHTNING_STRIKE_LIFE } from "../src/components/E-Summit-27/hero/lightningStrikes.ts";

const buffers = () => [new Float32Array(MAX_LIGHTNING_STRIKES * 4), new Float32Array(MAX_LIGHTNING_STRIKES * 4)];
const point = seed => ({ x: seed / 10, y: 0.3, reach: 1.7, seed });

test("rapid taps keep only the four newest strikes", () => {
  const pool = new LightningStrikes();
  const [strikes, info] = buffers();
  for (let i = 1; i <= 9; i++) pool.add(point(i), i);
  pool.writeUniforms(10, strikes, info);
  const seeds = [0, 4, 8, 12].map(i => info[i]).sort((a, b) => a - b);
  assert.deepEqual(seeds, [6, 7, 8, 9]);
  assert.equal([3, 7, 11, 15].filter(i => strikes[i] > 0).length, MAX_LIGHTNING_STRIKES);
});

test("the leader reaches the tap and every strike expires without stale GPU data", () => {
  const pool = new LightningStrikes();
  const [strikes, info] = buffers();
  pool.add(point(1), 100);
  pool.writeUniforms(100, strikes, info);
  assert.ok(Math.abs(strikes[2] - 1.7) < 0.00001);
  assert.equal(info[2], 0);
  assert.ok(pool.writeUniforms(210, strikes, info) > 0);
  assert.equal(strikes[2], 0);
  assert.equal(info[2], 1);
  assert.equal(pool.hasActive(100 + LIGHTNING_STRIKE_LIFE - 1), true);
  assert.equal(pool.hasActive(100 + LIGHTNING_STRIKE_LIFE), false);
  assert.equal(pool.writeUniforms(100 + LIGHTNING_STRIKE_LIFE, strikes, info), 0);
  assert.ok([...strikes, ...info].every(value => value === 0));
});

test("clearing on hidden, reduced motion or context loss prevents old strikes returning", () => {
  const pool = new LightningStrikes();
  const [strikes, info] = buffers();
  pool.add(point(1), 0);
  pool.writeUniforms(120, strikes, info);
  pool.clear();
  assert.equal(pool.hasActive(121), false);
  assert.equal(pool.writeUniforms(121, strikes, info), 0);
  assert.ok([...strikes, ...info].every(value => value === 0));
  pool.add(point(2), 150);
  pool.writeUniforms(151, strikes, info);
  assert.equal(info[0], 2);
  assert.equal(pool.hasActive(151), true);
});
