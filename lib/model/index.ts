import { Team, topScorersFor } from "../data/teams";
import { predictMatch, MatchPrediction } from "./poisson";
import { predictCards, CardsPrediction } from "./cards";
import { predictCorners, CornersPrediction } from "./corners";
import { predictScorers, ScorerProjection } from "./scorers";

export type FullMatchPrediction = {
  match: MatchPrediction;
  cards: CardsPrediction;
  corners: CornersPrediction;
  scorers: {
    home: ScorerProjection[];
    away: ScorerProjection[];
  };
};

export function predictFixture(home: Team, away: Team): FullMatchPrediction {
  const match = predictMatch({
    homeAttack: home.attack,
    homeDefense: home.defense,
    awayAttack: away.attack,
    awayDefense: away.defense,
  });

  const cards = predictCards({
    homeAttack: home.attack,
    homeDefense: home.defense,
    awayAttack: away.attack,
    awayDefense: away.defense,
  });

  const corners = predictCorners({
    homeAttack: home.attack,
    awayAttack: away.attack,
  });

  const homeFirstGoalProb = match.homeXg / (match.homeXg + match.awayXg);
  const awayFirstGoalProb = 1 - homeFirstGoalProb;

  const scorers = {
    home: predictScorers(match.homeXg, topScorersFor(home.id), homeFirstGoalProb),
    away: predictScorers(match.awayXg, topScorersFor(away.id), awayFirstGoalProb),
  };

  return { match, cards, corners, scorers };
}

export * from "./poisson";
export * from "./cards";
export * from "./corners";
export * from "./scorers";
export * from "./montecarlo";
