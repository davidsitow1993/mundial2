// Daily recalculation job: seeds teams/fixtures, runs the prediction model
// for every fixture, and stores results with a timestamp so the dashboard
// can show a history of predictions. Shared by scripts/cron.ts (local) and
// app/api/cron/route.ts (Vercel Cron).
import { getDb } from "../db/client";
import { TEAMS } from "../data/teams";
import { generateFixtures } from "../data/fixtures";
import { predictFixture } from "../model";
import { simulateTournament } from "../model/montecarlo";

function seedTeamsAndFixtures() {
  const db = getDb();

  const insertTeam = db.prepare(
    `INSERT INTO teams (id, name, group_name, attack, defense, is_host)
     VALUES (@id, @name, @group, @attack, @defense, @isHost)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       group_name = excluded.group_name,
       attack = excluded.attack,
       defense = excluded.defense,
       is_host = excluded.is_host`
  );

  const insertFixture = db.prepare(
    `INSERT INTO fixtures (id, group_name, matchday, home_team_id, away_team_id, kickoff)
     VALUES (@id, @group, @matchday, @homeTeamId, @awayTeamId, @kickoff)
     ON CONFLICT(id) DO UPDATE SET
       matchday = excluded.matchday,
       kickoff = excluded.kickoff`
  );

  const seedTransaction = db.transaction(() => {
    for (const team of TEAMS) {
      insertTeam.run({ ...team, isHost: team.isHost ? 1 : 0 });
    }
    for (const fixture of generateFixtures()) {
      insertFixture.run(fixture);
    }
  });

  seedTransaction();
}

function runPredictions() {
  const db = getDb();
  const teams = new Map(TEAMS.map((t) => [t.id, t]));
  const fixtures = generateFixtures();
  const now = new Date().toISOString();

  const insertPrediction = db.prepare(
    `INSERT INTO predictions (fixture_id, created_at, payload) VALUES (?, ?, ?)`
  );

  const transaction = db.transaction(() => {
    for (const fixture of fixtures) {
      const home = teams.get(fixture.homeTeamId)!;
      const away = teams.get(fixture.awayTeamId)!;
      const prediction = predictFixture(home, away);
      insertPrediction.run(fixture.id, now, JSON.stringify(prediction));
    }
  });

  transaction();
  return { fixtures: fixtures.length, timestamp: now };
}

function runTournamentSimulation() {
  const db = getDb();
  const result = simulateTournament(10000);
  const now = new Date().toISOString();

  db.prepare(`INSERT INTO tournament_predictions (created_at, payload) VALUES (?, ?)`).run(
    now,
    JSON.stringify(result)
  );

  return { iterations: result.iterations, timestamp: now };
}

export type RecalculateSummary = {
  fixtures: number;
  iterations: number;
  timestamp: string;
};

export function runDailyRecalculation(): RecalculateSummary {
  seedTeamsAndFixtures();
  const matchResult = runPredictions();
  const tournamentResult = runTournamentSimulation();

  return {
    fixtures: matchResult.fixtures,
    iterations: tournamentResult.iterations,
    timestamp: tournamentResult.timestamp,
  };
}
