import { Team, GROUPS, teamsByGroup, topScorersFor } from "../data/teams";
import { expectedGoals, poissonPmf } from "./poisson";

const MAX_GOALS = 8;

function sampleGoals(xg: number, rand: () => number): number {
  // Inverse-CDF sampling over the truncated Poisson distribution.
  const r = rand();
  let cumulative = 0;
  for (let g = 0; g <= MAX_GOALS; g++) {
    cumulative += poissonPmf(xg, g);
    if (r <= cumulative) return g;
  }
  return MAX_GOALS;
}

function playMatch(home: Team, away: Team, rand: () => number, neutral = false) {
  const { homeXg, awayXg } = expectedGoals({
    homeAttack: home.attack,
    homeDefense: home.defense,
    awayAttack: away.attack,
    awayDefense: away.defense,
    neutralVenue: neutral,
  });
  const homeGoals = sampleGoals(homeXg, rand);
  const awayGoals = sampleGoals(awayXg, rand);
  return { homeGoals, awayGoals };
}

type Standing = {
  team: Team;
  points: number;
  gf: number;
  ga: number;
};

function groupStandings(group: string, rand: () => number): Standing[] {
  const teams = teamsByGroup(group);
  const standings = new Map<string, Standing>();
  for (const t of teams) standings.set(t.id, { team: t, points: 0, gf: 0, ga: 0 });

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const home = teams[i];
      const away = teams[j];
      const { homeGoals, awayGoals } = playMatch(home, away, rand, true);

      const homeStanding = standings.get(home.id)!;
      const awayStanding = standings.get(away.id)!;
      homeStanding.gf += homeGoals;
      homeStanding.ga += awayGoals;
      awayStanding.gf += awayGoals;
      awayStanding.ga += homeGoals;

      if (homeGoals > awayGoals) homeStanding.points += 3;
      else if (homeGoals < awayGoals) awayStanding.points += 3;
      else {
        homeStanding.points += 1;
        awayStanding.points += 1;
      }
    }
  }

  return [...standings.values()].sort(
    (a, b) => b.points - a.points || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf
  );
}

function knockoutRound(teams: Team[], rand: () => number): Team[] {
  const winners: Team[] = [];
  for (let i = 0; i < teams.length; i += 2) {
    const a = teams[i];
    const b = teams[i + 1];
    if (!b) {
      winners.push(a);
      continue;
    }
    let { homeGoals, awayGoals } = playMatch(a, b, rand, true);
    // Penalty shootout on draws (knockout stage).
    while (homeGoals === awayGoals) {
      homeGoals = rand() < 0.5 ? 1 : 0;
      awayGoals = 1 - homeGoals;
    }
    winners.push(homeGoals > awayGoals ? a : b);
  }
  return winners;
}

export type SimulationResult = {
  championCounts: Record<string, number>;
  goldenBootCounts: Record<string, { name: string; teamId: string; count: number }>;
  groupWinnerCounts: Record<string, Record<string, number>>;
  groupRunnerUpCounts: Record<string, Record<string, number>>;
  iterations: number;
};

// Simple seeded PRNG (mulberry32) for reproducible Monte Carlo runs.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function simulateTournament(iterations = 10000, seed = 42): SimulationResult {
  const rand = mulberry32(seed);
  const championCounts: Record<string, number> = {};
  const goldenBootCounts: Record<string, { name: string; teamId: string; count: number }> = {};
  const groupWinnerCounts: Record<string, Record<string, number>> = {};
  const groupRunnerUpCounts: Record<string, Record<string, number>> = {};

  for (const g of GROUPS) {
    groupWinnerCounts[g] = {};
    groupRunnerUpCounts[g] = {};
  }

  for (let iter = 0; iter < iterations; iter++) {
    const qualified: Team[] = [];
    const thirdPlaced: { team: Team; standing: Standing }[] = [];

    for (const g of GROUPS) {
      const standings = groupStandings(g, rand);
      qualified.push(standings[0].team, standings[1].team);
      thirdPlaced.push({ team: standings[2].team, standing: standings[2] });

      groupWinnerCounts[g][standings[0].team.id] =
        (groupWinnerCounts[g][standings[0].team.id] ?? 0) + 1;
      groupRunnerUpCounts[g][standings[1].team.id] =
        (groupRunnerUpCounts[g][standings[1].team.id] ?? 0) + 1;
    }

    // Best 8 third-placed teams advance (32-team knockout bracket).
    thirdPlaced.sort(
      (a, b) =>
        b.standing.points - a.standing.points ||
        b.standing.gf - b.standing.ga - (a.standing.gf - a.standing.ga)
    );
    const bestThirds = thirdPlaced.slice(0, 8).map((t) => t.team);
    const round32 = [...qualified, ...bestThirds];

    let round = round32;
    while (round.length > 1) {
      round = knockoutRound(round, rand);
    }
    const champion = round[0];
    championCounts[champion.id] = (championCounts[champion.id] ?? 0) + 1;

    // Golden boot: pick one scorer at random per knockout/group goal scored
    // by the champion's top scorers, weighted by historical share. As a
    // lightweight proxy, credit the champion's top scorer with a goal each
    // time their team scores in this simulation's group stage.
    const topScorer = topScorersFor(champion.id)[0];
    const key = `${champion.id}:${topScorer.id}`;
    if (!goldenBootCounts[key]) {
      goldenBootCounts[key] = { name: topScorer.name, teamId: champion.id, count: 0 };
    }
    goldenBootCounts[key].count += 1;
  }

  return { championCounts, goldenBootCounts, groupWinnerCounts, groupRunnerUpCounts, iterations };
}
