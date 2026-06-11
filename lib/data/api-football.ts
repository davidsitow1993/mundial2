// Lightweight client for API-Football (RapidAPI) with retry and an
// in-memory cache, plus a fallback to football-data.org. Used by the daily
// cron job to refresh team form. Both are optional: if no API key is set,
// the job falls back to the static ratings in lib/data/teams.ts.

const RAPIDAPI_HOST = "api-football-v1.p.rapidapi.com";
const RAPIDAPI_BASE = `https://${RAPIDAPI_HOST}/v3`;
const FOOTBALL_DATA_BASE = "https://api.football-data.org/v4";

const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12h, fits within the free 100 req/day limit

async function fetchWithRetry(url: string, init: RequestInit, retries = 2): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      lastError = new Error(`Request failed with status ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
    }
  }
  throw lastError;
}

async function cachedFetch<T>(key: string, url: string, init: RequestInit): Promise<T> {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data as T;

  const res = await fetchWithRetry(url, init);
  const data = (await res.json()) as T;
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

export type TeamFormStats = {
  teamName: string;
  goalsForAvg: number;
  goalsAgainstAvg: number;
};

/**
 * Fetches recent team statistics from API-Football. Returns null if no
 * RAPIDAPI_KEY is configured or the request fails, so callers can fall
 * back to the static ratings.
 */
export async function fetchTeamFormApiFootball(
  teamApiId: number,
  leagueId: number,
  season: number
): Promise<TeamFormStats | null> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return null;

  try {
    const url = `${RAPIDAPI_BASE}/teams/statistics?team=${teamApiId}&league=${leagueId}&season=${season}`;
    const data = await cachedFetch<{
      response: {
        team: { name: string };
        goals: {
          for: { average: { total: string } };
          against: { average: { total: string } };
        };
      };
    }>(`api-football:${teamApiId}:${leagueId}:${season}`, url, {
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": apiKey,
      },
    });

    return {
      teamName: data.response.team.name,
      goalsForAvg: parseFloat(data.response.goals.for.average.total),
      goalsAgainstAvg: parseFloat(data.response.goals.against.average.total),
    };
  } catch (err) {
    console.warn(`[api-football] fetch failed for team ${teamApiId}:`, err);
    return null;
  }
}

/**
 * Fallback source: football-data.org. Returns recent matches for a team so
 * the cron job can derive a basic form rating without RAPIDAPI_KEY.
 */
export async function fetchTeamFormFootballData(teamId: number): Promise<TeamFormStats | null> {
  const apiKey = process.env.FOOTBALL_DATA_KEY;
  if (!apiKey) return null;

  try {
    const url = `${FOOTBALL_DATA_BASE}/teams/${teamId}/matches?status=FINISHED&limit=10`;
    const data = await cachedFetch<{
      matches: {
        score: { fullTime: { home: number | null; away: number | null } };
        homeTeam: { id: number; name: string };
        awayTeam: { id: number; name: string };
      }[];
    }>(`football-data:${teamId}`, url, {
      headers: { "X-Auth-Token": apiKey },
    });

    if (!data.matches.length) return null;

    let goalsFor = 0;
    let goalsAgainst = 0;
    let teamName = "";

    for (const m of data.matches) {
      const isHome = m.homeTeam.id === teamId;
      teamName = isHome ? m.homeTeam.name : m.awayTeam.name;
      goalsFor += (isHome ? m.score.fullTime.home : m.score.fullTime.away) ?? 0;
      goalsAgainst += (isHome ? m.score.fullTime.away : m.score.fullTime.home) ?? 0;
    }

    return {
      teamName,
      goalsForAvg: goalsFor / data.matches.length,
      goalsAgainstAvg: goalsAgainst / data.matches.length,
    };
  } catch (err) {
    console.warn(`[football-data] fetch failed for team ${teamId}:`, err);
    return null;
  }
}
