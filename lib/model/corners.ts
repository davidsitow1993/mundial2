// Corners model: regression over historical averages, dynamic line based on
// combined attacking strength of both teams.

export type CornersInput = {
  homeAttack: number;
  awayAttack: number;
};

export type CornersPrediction = {
  expectedCorners: number;
  homeShare: number;
  awayShare: number;
  overUnder: { line: number; over: number; under: number };
};

const BASE_CORNERS = 9.6; // average corners per match

export function predictCorners(input: CornersInput): CornersPrediction {
  const attackIndex = (input.homeAttack + input.awayAttack) / 2 / 1.5; // ~1 for average attack
  const expectedCorners = BASE_CORNERS * attackIndex;

  const homeShare = input.homeAttack / (input.homeAttack + input.awayAttack);
  const awayShare = 1 - homeShare;

  // Dynamic line: round expected corners to nearest .5
  const line = Math.round(expectedCorners * 2) / 2;
  const stdDev = 2.6;
  const z = (line + 0.5 - expectedCorners) / stdDev;
  const under = normalCdf(z);
  const over = 1 - under;

  return {
    expectedCorners: Math.round(expectedCorners * 100) / 100,
    homeShare,
    awayShare,
    overUnder: { line, over, under },
  };
}

function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * Math.abs(x));
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}
