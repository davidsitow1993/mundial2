// Splits a team's expected goals among its top scorers based on historical
// goals-per-90 share, then derives anytime / first-goalscorer probabilities.

export type ScorerProjection = {
  id: string;
  name: string;
  share: number;
  expectedGoals: number;
  anytimeProbability: number;
  firstScorerProbability: number;
};

export function predictScorers(
  teamXg: number,
  scorers: { id: string; name: string; share: number }[],
  teamFirstGoalProbability: number
): ScorerProjection[] {
  return scorers.map((s) => {
    const expectedGoals = teamXg * s.share;
    const anytimeProbability = 1 - Math.exp(-expectedGoals);
    // Among the team's own goals, share of being the first scorer mirrors
    // the goal share, scaled by the team's chance of scoring the game's
    // first goal.
    const firstScorerProbability = teamFirstGoalProbability * s.share;
    return {
      ...s,
      expectedGoals: Math.round(expectedGoals * 1000) / 1000,
      anytimeProbability,
      firstScorerProbability,
    };
  });
}
