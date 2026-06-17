import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { GROUPS, teamsByGroup, teamById } from "@/lib/data/teams";
import { generateFixtures } from "@/lib/data/fixtures";
import {
  getLatestPrediction,
  getPredictionTimestamp,
  getLatestTournamentSimulation,
} from "@/lib/db/queries";

export function generateStaticParams() {
  return GROUPS.map((id) => ({ id }));
}

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = id.toUpperCase();

  if (!GROUPS.includes(group)) notFound();

  const teams = teamsByGroup(group);
  const fixtures = generateFixtures().filter((f) => f.group === group);
  const updatedAt = getPredictionTimestamp();
  const sim = getLatestTournamentSimulation();

  const winnerCounts = sim?.result.groupWinnerCounts[group] ?? {};
  const runnerUpCounts = sim?.result.groupRunnerUpCounts[group] ?? {};
  const iterations = sim?.result.iterations ?? 1;

  // Sort teams by projected points (P(1st)*9 + P(2nd)*6 proxy for ranking display)
  const teamStats = teams
    .map((t) => {
      const winProb = (winnerCounts[t.id] ?? 0) / iterations;
      const runnerUpProb = (runnerUpCounts[t.id] ?? 0) / iterations;
      const qualifyProb = winProb + runnerUpProb;
      return { team: t, winProb, runnerUpProb, qualifyProb };
    })
    .sort((a, b) => b.qualifyProb - a.qualifyProb);

  // Matchday labels
  const byMatchday = [1, 2, 3].map((md) => ({
    md,
    fixtures: fixtures.filter((f) => f.matchday === md),
  }));

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader updatedAt={updatedAt} />
      <DisclaimerBanner />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <Link
          href="/"
          className="font-data mb-6 inline-block text-xs uppercase tracking-wider text-muted hover:text-accent"
        >
          &larr; Inicio
        </Link>

        <h1 className="font-data mb-8 text-4xl font-bold sm:text-6xl">
          GRUPO <span className="text-accent">{group}</span>
        </h1>

        {/* Tabla de clasificacion proyectada */}
        <section className="mb-10">
          <h2 className="font-data mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Clasificacion proyectada
          </h2>
          <div className="border border-border">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_repeat(3,_auto)] gap-x-4 border-b border-border bg-surface-2 px-4 py-2 font-data text-[10px] uppercase tracking-wider text-muted">
              <span>#</span>
              <span>Seleccion</span>
              <span className="w-16 text-right">1ro</span>
              <span className="w-16 text-right">2do</span>
              <span className="w-20 text-right">Clasifica</span>
            </div>
            {teamStats.map((row, i) => (
              <div
                key={row.team.id}
                className={`grid grid-cols-[auto_1fr_repeat(3,_auto)] items-center gap-x-4 border-b border-border px-4 py-3 last:border-0 ${
                  i < 2 ? "bg-surface" : "bg-background opacity-70"
                }`}
              >
                <span className="font-data w-4 text-sm font-bold text-muted">{i + 1}</span>
                <div className="flex items-center gap-2">
                  <span className="font-data font-semibold">{row.team.name}</span>
                  {row.team.isHost && (
                    <span className="font-data rounded-sm bg-accent px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-background">
                      sede
                    </span>
                  )}
                  {i < 2 && (
                    <span className="font-data rounded-sm border border-positive px-1 py-0.5 text-[9px] uppercase tracking-wide text-positive">
                      clasifica
                    </span>
                  )}
                </div>
                <span className="font-data w-16 text-right text-sm font-bold text-accent">
                  {Math.round(row.winProb * 100)}%
                </span>
                <span className="font-data w-16 text-right text-sm text-muted">
                  {Math.round(row.runnerUpProb * 100)}%
                </span>
                <span
                  className={`font-data w-20 text-right text-sm font-bold ${
                    i < 2 ? "text-positive" : "text-negative"
                  }`}
                >
                  {Math.round(row.qualifyProb * 100)}%
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 font-data text-[10px] text-muted">
            Basado en {iterations.toLocaleString("es-CO")} simulaciones Monte Carlo del torneo completo.
          </p>
        </section>

        {/* Partidos por jornada */}
        <section>
          <h2 className="font-data mb-4 text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Partidos
          </h2>
          <div className="flex flex-col gap-6">
            {byMatchday.map(({ md, fixtures: mdFixtures }) => (
              <div key={md}>
                <div className="font-data mb-2 text-[11px] uppercase tracking-wider text-muted">
                  Jornada {md}
                </div>
                <div className="flex flex-col gap-2">
                  {mdFixtures.map((fixture) => {
                    const home = teamById(fixture.homeTeamId)!;
                    const away = teamById(fixture.awayTeamId)!;
                    const prediction = getLatestPrediction(fixture.id);
                    const result = prediction?.match.result1x2;
                    const xg = prediction?.match;

                    return (
                      <Link
                        key={fixture.id}
                        href={`/partido/${fixture.id}`}
                        className="grid grid-cols-[1fr_auto] items-stretch border border-border bg-surface transition-colors hover:border-accent"
                      >
                        <div className="px-4 py-3">
                          <div className="font-data mb-2 text-sm font-semibold">
                            {home.name}{" "}
                            <span className="text-muted">vs</span>{" "}
                            {away.name}
                          </div>
                          {result && (
                            <div className="flex items-center gap-3">
                              {/* Mini prob bars */}
                              {[
                                { label: home.name.split(" ")[0], val: result.home },
                                { label: "X", val: result.draw },
                                { label: away.name.split(" ")[0], val: result.away },
                              ].map(({ label, val }) => (
                                <div key={label} className="flex items-center gap-1.5">
                                  <div className="bar-track h-1 w-16 overflow-hidden">
                                    <div
                                      className="bar-fill h-full"
                                      style={{ width: `${val * 100}%` }}
                                    />
                                  </div>
                                  <span className="font-data text-[11px] text-muted">
                                    {label} {Math.round(val * 100)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-center justify-center border-l border-border px-4 text-center">
                          {xg ? (
                            <>
                              <div className="font-data text-lg font-bold text-accent leading-none">
                                {xg.homeXg.toFixed(1)}
                                <span className="text-muted text-sm"> - </span>
                                {xg.awayXg.toFixed(1)}
                              </div>
                              <div className="font-data mt-1 text-[9px] uppercase tracking-wider text-muted">
                                xG
                              </div>
                            </>
                          ) : (
                            <span className="font-data text-xs text-muted">ver</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
