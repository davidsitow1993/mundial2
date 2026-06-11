import { GROUPS, teamsByGroup } from "./teams";

export type Fixture = {
  id: string;
  group: string;
  matchday: number;
  homeTeamId: string;
  awayTeamId: string;
  kickoff: string;
};

// Round-robin schedule for a 4-team group, split into 3 matchdays of 2
// matches each (standard World Cup group stage format).
const ROUND_ROBIN: [number, number][][] = [
  [
    [0, 1],
    [2, 3],
  ],
  [
    [0, 2],
    [1, 3],
  ],
  [
    [0, 3],
    [1, 2],
  ],
];

const TOURNAMENT_START = new Date("2026-06-11T18:00:00Z");

export function generateFixtures(): Fixture[] {
  const fixtures: Fixture[] = [];

  GROUPS.forEach((group, groupIndex) => {
    const teams = teamsByGroup(group);

    ROUND_ROBIN.forEach((matchday, matchdayIndex) => {
      matchday.forEach(([homeIdx, awayIdx], pairIndex) => {
        const home = teams[homeIdx];
        const away = teams[awayIdx];
        const dayOffset = matchdayIndex * 4 + Math.floor((groupIndex * 2 + pairIndex) / 3);
        const kickoff = new Date(TOURNAMENT_START);
        kickoff.setUTCDate(kickoff.getUTCDate() + dayOffset);
        kickoff.setUTCHours(15 + ((groupIndex + pairIndex) % 3) * 3);

        fixtures.push({
          id: `${group}-md${matchdayIndex + 1}-${home.id}-${away.id}`,
          group,
          matchday: matchdayIndex + 1,
          homeTeamId: home.id,
          awayTeamId: away.id,
          kickoff: kickoff.toISOString(),
        });
      });
    });
  });

  return fixtures;
}
