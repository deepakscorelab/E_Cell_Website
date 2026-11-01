import test from "node:test";
import assert from "node:assert/strict";
import { FireQuality, FrameClock, firePixelRatio } from "../src/components/E-Summit-27/hero/firePerformance.ts";
import { observeMotionActivity } from "../src/components/E-Summit-27/motionActivity.ts";

function sample(quality, delta, frames) {
  const changes = [];
  for (let i = 0; i < frames; i++) {
    const action = quality.sample(delta);
    if (action !== "keep") changes.push([action, quality.tier]);
  }
  return changes;
}

test("desktop tries all quality tiers before disabling fire", () => {
  const quality = new FireQuality(false);
  assert.deepEqual(sample(quality, 60, 135 * 4), [
    ["lower", 1], ["lower", 2], ["lower", 3], ["disable", 3],
  ]);
});

test("intentional mobile 30 fps does not trigger quality reduction", () => {
  const quality = new FireQuality(true);
  assert.deepEqual(sample(quality, 1000 / 30, 1000), []);
  assert.equal(quality.tier, 2);
  assert.deepEqual(sample(quality, 70, 180), [["lower", 3]]);
});

test("a single slow window recovers; later sustained throttling still adapts", () => {
  const quality = new FireQuality(false);
  assert.deepEqual(sample(quality, 16.67, 15), []);
  assert.deepEqual(sample(quality, 40, 60), []);
  assert.deepEqual(sample(quality, 16.67, 600), []);
  assert.deepEqual(sample(quality, 40, 120), [["lower", 1]]);
});

test("resuming resets samples but preserves the reduced tier", () => {
  const quality = new FireQuality(false);
  sample(quality, 60, 135);
  quality.reset();
  assert.equal(quality.tier, 1);
  assert.deepEqual(sample(quality, 1000, 15), []);
  assert.deepEqual(sample(quality, 16.67, 600), []);
});

for (const fps of [30, 60]) {
  test(`${fps} fps cap remains stable on 60/90/120/144 Hz displays`, () => {
    for (const hz of [60, 90, 120, 144]) {
      const clock = new FrameClock(fps);
      let frames = 0;
      for (let i = 0; i < hz * 10; i++) {
        if (clock.advance(i * 1000 / hz) !== null) frames++;
      }
      assert.ok(Math.abs(frames - fps * 10) <= 1, `${hz} Hz rendered ${frames} frames`);
      clock.reset();
      assert.equal(clock.advance(100_000), 1000 / fps);
    }
  });
}

test("retina and ultrawide buffers stay bounded and decrease at every tier", () => {
  for (const [width, height] of [[3840, 2160], [7680, 4320], [390, 844]]) {
    for (const mobile of [false, true]) {
      let previous = Infinity;
      for (let tier = mobile ? 2 : 0; tier < 4; tier++) {
        const ratio = firePixelRatio(width, height, 3, tier, mobile);
        const pixels = width * height * ratio * ratio;
        assert.ok(pixels <= (mobile ? 350_000 : 1_200_000) + 1);
        assert.ok(pixels < previous);
        previous = pixels;
      }
    }
  }
  assert.ok(Number.isFinite(firePixelRatio(0, 0, 0, 0, false)));
});

test("visibility, viewport, reduced motion and cleanup control activity", () => {
  const documentEvents = new Map();
  const mediaEvents = new Map();
  let observe;
  let disconnected = false;
  const media = {
    matches: false,
    addEventListener: (type, fn) => mediaEvents.set(type, fn),
    removeEventListener: (type) => mediaEvents.delete(type),
  };
  globalThis.window = { matchMedia: () => media };
  globalThis.document = {
    hidden: false,
    addEventListener: (type, fn) => documentEvents.set(type, fn),
    removeEventListener: (type) => documentEvents.delete(type),
  };
  globalThis.IntersectionObserver = class {
    constructor(callback) { observe = callback; }
    observe() {}
    disconnect() { disconnected = true; }
  };
  try {
    const states = [];
    const stop = observeMotionActivity({}, (active) => states.push(active));
    observe([{ isIntersecting: true }]);
    document.hidden = true;
    documentEvents.get("visibilitychange")();
    observe([{ isIntersecting: true }]); // cannot restart while hidden
    document.hidden = false;
    documentEvents.get("visibilitychange")();
    media.matches = true;
    mediaEvents.get("change")();
    observe([{ isIntersecting: false }]);
    media.matches = false;
    mediaEvents.get("change")(); // cannot restart off-screen
    observe([{ isIntersecting: true }]);
    stop();
    assert.deepEqual(states, [false, true, false, true, false, true]);
    assert.ok(disconnected);
    assert.equal(documentEvents.size, 0);
    assert.equal(mediaEvents.size, 0);
  } finally {
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.IntersectionObserver;
  }
});
