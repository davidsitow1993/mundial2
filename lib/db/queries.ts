import { getDb } from "./client";
import { FullMatchPrediction } from "../model";
import { SimulationResult } from "../model/montecarlo";

export type FixtureRow = {
  id: string;
  group_name: string;
  matchday: number;
  home_team_id: string;
  away_team_id: string;
  kickoff: string;
};

export type TeamRow = {
  id: string;
  name: string;
  group_name: string;
  attack: number;
  defense: number;
  is_host: number;
};

export function getAllTeams(): TeamRow[] {
  return getDb().prepare(`SELECT * FROM teams ORDER BY group_name, name`).all() as TeamRow[];
}

export function getFixturesByGroup(group: string): FixtureRow[] {
  return getDb()
    .prepare(`SELECT * FROM fixtures WHERE group_name = ? ORDER BY matchday, kickoff`)
    .all(group) as FixtureRow[];
}

export function getAllFixtures(): FixtureRow[] {
  return getDb().prepare(`SELECT * FROM fixtures ORDER BY kickoff`).all() as FixtureRow[];
}

export function getFixture(id: string): FixtureRow | undefined {
  return getDb().prepare(`SELECT * FROM fixtures WHERE id = ?`).get(id) as
    | FixtureRow
    | undefined;
}

export function getLatestPrediction(fixtureId: string): FullMatchPrediction | null {
  const row = getDb()
    .prepare(
      `SELECT payload FROM predictions WHERE fixture_id = ? ORDER BY created_at DESC LIMIT 1`
    )
    .get(fixtureId) as { payload: string } | undefined;

  return row ? (JSON.parse(row.payload) as FullMatchPrediction) : null;
}

export function getLatestTournamentSimulation(): {
  result: SimulationResult;
  createdAt: string;
} | null {
  const row = getDb()
    .prepare(`SELECT payload, created_at FROM tournament_predictions ORDER BY created_at DESC LIMIT 1`)
    .get() as { payload: string; created_at: string } | undefined;

  return row ? { result: JSON.parse(row.payload) as SimulationResult, createdAt: row.created_at } : null;
}

export function getPredictionTimestamp(): string | null {
  const row = getDb()
    .prepare(`SELECT created_at FROM predictions ORDER BY created_at DESC LIMIT 1`)
    .get() as { created_at: string } | undefined;
  return row?.created_at ?? null;
}
