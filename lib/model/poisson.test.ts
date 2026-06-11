import { describe, it, expect } from "vitest";
import { predictMatch } from "./poisson";

describe("predictMatch", () => {
  it("produces probabilities that sum to ~1 across 1X2", () => {
    const result = predictMatch({
      homeAttack: 1.5,
      homeDefense: 0.9,
      awayAttack: 1.2,
      awayDefense: 1.0,
    });

    const total = result.result1x2.home + result.result1x2.draw + result.result1x2.away;
    expect(total).toBeCloseTo(1, 2);
  });

  it("favors the stronger team at home", () => {
    const result = predictMatch({
      homeAttack: 2.0,
      homeDefense: 0.7,
      awayAttack: 0.9,
      awayDefense: 1.5,
    });

    expect(result.result1x2.home).toBeGreaterThan(result.result1x2.away);
  });

  it("over and under add up to 1 for each line", () => {
    const result = predictMatch({
      homeAttack: 1.3,
      homeDefense: 1.1,
      awayAttack: 1.1,
      awayDefense: 1.2,
    });

    for (const line of ["1.5", "2.5", "3.5"] as const) {
      expect(result.overUnder[line].over + result.overUnder[line].under).toBeCloseTo(1, 2);
    }
  });

  it("btts probabilities sum to 1", () => {
    const result = predictMatch({
      homeAttack: 1.4,
      homeDefense: 1.0,
      awayAttack: 1.3,
      awayDefense: 1.1,
    });

    expect(result.btts.yes + result.btts.no).toBeCloseTo(1, 5);
  });
});
