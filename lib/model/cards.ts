// Cards model: regression over historical averages adjusted by match intensity.
// Intensity proxy: how close the two teams' strength ratings are (closer = more cards).

export type CardsInput = {
  homeAttack: number;
  homeDefense: number;
  awayAttack: number;
  awayDefense: number;
};

export type CardsPrediction = {
  expectedCards: number;
  overUnder: { line: number; over: number; under: number };
  redCardProbability: number;
};

const BASE_CARDS = 3.8; // average yellow+red cards per match

export function predictCards(input: CardsInput): CardsPrediction {
  const homeStrength = input.homeAttack - input.homeDefense;
  const awayStrength = input.awayAttack - input.awayDefense;
  const closeness = 1 - Math.min(1, Math.abs(homeStrength - awayStrength) / 2);
  const intensity = 0.85 + closeness * 0.3; // 0.85 - 1.15

  const expectedCards = BASE_CARDS * intensity;

  // Approximate over/under via normal distribution around expectedCards.
  const line = 3.5;
  const stdDev = 1.4;
  const z = (line + 0.5 - expectedCards) / stdDev;
  const under = normalCdf(z);
  const over = 1 - under;

  const redCardProbability = Math.min(0.45, 0.06 + (intensity - 1) * 0.3 + 0.06);

  return {
    expectedCards: Math.round(expectedCards * 100) / 100,
    overUnder: { line, over, under },
    redCardProbability: Math.max(0.04, redCardProbability),
  };
}

function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

function erf(x: number): number {
  // Abramowitz-Stegun approximation
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
