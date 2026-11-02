import test from "node:test";
import assert from "node:assert/strict";
import { summitCountdown, untilNextIndiaDay } from "../src/components/E-Summit-27/sections/countdownTime.ts";

const count = iso => summitCountdown(Date.parse(iso), "2027-01-23", "2027-01-24");
test("countdown uses Indian calendar days rather than a visitor's local time", () => {
  assert.deepEqual(count("2026-11-02T00:00:00+05:30"), {phase:"upcoming",days:82});
  assert.deepEqual(count("2027-01-22T18:29:59Z"), {phase:"upcoming",days:1});
  assert.deepEqual(count("2027-01-22T18:30:00Z"), {phase:"live",days:0});
});
test("both summit dates are live; later dates never produce negative days", () => {
  assert.equal(count("2027-01-24T23:59:59+05:30").phase, "live");
  assert.deepEqual(count("2027-01-25T00:00:00+05:30"), {phase:"finished",days:0});
  assert.deepEqual(count("2028-01-01T00:00:00Z"), {phase:"finished",days:0});
});
test("the next update targets midnight in India, including the UTC date boundary", () => {
  assert.equal(untilNextIndiaDay(Date.parse("2027-01-22T18:29:59Z")), 1050);
  assert.equal(untilNextIndiaDay(Date.parse("2027-01-22T18:30:00Z")), 86_400_050);
});
