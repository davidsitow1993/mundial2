// Pure math, no I/O. Poisson model for match goal projections.

const AVG_GOALS = 1.35; // baseline goals per team per match
const HOME_ADVANTAGE = 1.1;
const MAX_GOALS = 8;

export type MatchInput = {
  homeAttack: number;
  homeDefense: number;
  awayAttack: number;
  awayDefense: number;
  neutralVenue?: boolean;
};

export type ScoreMatrix = number[][]; // [homeGoals][awayGoals] = probability

function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function poissonPmf(lambda: number, k: number): number {
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

export function expectedGoals(input: MatchInput): { homeXg: number; awayXg: number } {
  const homeBoost = input.neutralVenue ? 1 : HOME_ADVANTAGE;
  const homeXg = AVG_GOALS * input.homeAttack * input.awayDefense * homeBoost;
  const awayXg = AVG_GOALS * input.awayAttack * input.homeDefense;
  return { homeXg, awayXg };
}

export function scoreMatrix(homeXg: number, awayXg: number): ScoreMatrix {
  const matrix: ScoreMatrix = [];
  for (let h = 0; h <= MAX_GOALS; h++) {
    const row: number[] = [];
    for (let a = 0; a <= MAX_GOALS; a++) {
      row.push(poissonPmf(homeXg, h) * poissonPmf(awayXg, a));
    }
    matrix.push(row);
  }
  return matrix;
}

export type MatchPrediction = {
  homeXg: number;
  awayXg: number;
  matrix: ScoreMatrix;
  result1x2: { home: number; draw: number; away: number };
  doubleChance: { homeOrDraw: number; homeOrAway: number; drawOrAway: number };
  overUnder: Record<"1.5" | "2.5" | "3.5", { over: number; under: number }>;
  btts: { yes: number; no: number };
  topScorelines: { home: number; away: number; prob: number }[];
  cleanSheet: { home: number; away: number };
};

export function predictMatch(input: MatchInput): MatchPrediction {
  const { homeXg, awayXg } = expectedGoals(input);
  const matrix = scoreMatrix(homeXg, awayXg);

  let home = 0;
  let draw = 0;
  let away = 0;
  let cleanSheetHome = 0;
  let cleanSheetAway = 0;
  const overUnderTotals: Record<string, { over: number; under: number }> = {
    "1.5": { over: 0, under: 0 },
    "2.5": { over: 0, under: 0 },
    "3.5": { over: 0, under: 0 },
  };
  let bttsYes = 0;

  const scorelines: { home: number; away: number; prob: number }[] = [];

  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      const p = matrix[h][a];
      scorelines.push({ home: h, away: a, prob: p });

      if (h > a) home += p;
      else if (h === a) draw += p;
      else away += p;

      if (a === 0) cleanSheetHome += p;
      if (h === 0) cleanSheetAway += p;

      const total = h + a;
      for (const line of ["1.5", "2.5", "3.5"] as const) {
        const lineNum = parseFloat(line);
        if (total > lineNum) overUnderTotals[line].over += p;
        else overUnderTotals[line].under += p;
      }

      if (h > 0 && a > 0) bttsYes += p;
    }
  }

  scorelines.sort((x, y) => y.prob - x.prob);

  return {
    homeXg,
    awayXg,
    matrix,
    result1x2: { home, draw, away },
    doubleChance: {
      homeOrDraw: home + draw,
      homeOrAway: home + away,
      drawOrAway: draw + away,
    },
    overUnder: overUnderTotals as MatchPrediction["overUnder"],
    btts: { yes: bttsYes, no: 1 - bttsYes },
    topScorelines: scorelines.slice(0, 5),
    cleanSheet: { home: cleanSheetHome, away: cleanSheetAway },
  };
}
