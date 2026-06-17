import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { ProbBar } from "@/components/ProbBar";
import { getLatestTournamentSimulation, getPredictionTimestamp } from "@/lib/db/queries";
import { teamById, GROUPS, teamsByGroup } from "@/lib/data/teams";

export default function Home() {
  const updatedAt = getPredictionTimestamp();
  const sim = getLatestTournamentSimulation();

  if (!sim) {
    return (
      <div className="flex flex-1 flex-col">
        <SiteHeader updatedAt={null} />
        <DisclaimerBanner />
        <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
          <h1 className="font-data text-2xl font-bold text-accent">SIN DATOS AUN</h1>
          <p className="text-muted">
            Corre <code className="font-data text-accent">pnpm cron:run</code> para generar las
            predicciones de los 72 partidos y la simulacion del torneo.
          </p>
        </main>
      </div>
    );
  }

  const { championCounts, goldenBootCounts, groupWinnerCounts, groupRunnerUpCounts, iterations } =
    sim.result;

  const championRanking = Object.entries(championCounts)
    .map(([teamId, count]) => ({ teamId, prob: count / iterations }))
    .sort((a, b) => b.prob - a.prob)
    .slice(0, 10);

  const goldenBootRanking = Object.values(goldenBootCounts)
    .map((entry) => ({ ...entry, prob: entry.count / iterations }))
    .sort((a, b) => b.prob - a.prob)
    .slice(0, 10);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader updatedAt={updatedAt} />
      <DisclaimerBanner />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">

        {/* Hero */}
        <section className="mb-12">
          <h1 className="font-data text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            ASI PREDICE LA <span className="text-accent">IA</span> EL MUNDIAL 2026
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
            Proyecciones generadas con un modelo de Poisson + simulacion Monte Carlo
            ({iterations.toLocaleString("es-CO")} simulaciones). Resultado, goles,
            tarjetas, corners y goleadores para los 72 partidos.
          </p>
        </section>

        {/* Champion + Golden boot */}
        <section className="mb-12 grid gap-6 lg:grid-cols-2">
          <div className="border border-border bg-surface p-5">
            <h2 className="font-data mb-4 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              Proyeccion de campeon
            </h2>
            <div className="flex flex-col gap-2.5">
              {championRanking.map((row) => (
                <ProbBar
                  key={row.teamId}
                  label={teamById(row.teamId)?.name ?? row.teamId}
                  value={row.prob}
                  highlight
                />
              ))}
            </div>
          </div>

          <div className="border border-border bg-surface p-5">
            <h2 className="font-data mb-4 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              Proyeccion bota de oro
            </h2>
            <div className="flex flex-col gap-2.5">
              {goldenBootRanking.map((row) => (
                <ProbBar
                  key={`${row.teamId}-${row.name}`}
                  label={`${row.name} (${teamById(row.teamId)?.name ?? row.teamId})`}
                  value={row.prob}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Grupos con equipos */}
        <section>
          <h2 className="font-data mb-4 text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Fase de grupos
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {GROUPS.map((g) => {
              const teams = teamsByGroup(g);
              const winCounts = groupWinnerCounts[g] ?? {};
              const runnerCounts = groupRunnerUpCounts[g] ?? {};

              const teamRows = teams
                .map((t) => ({
                  team: t,
                  qualifyProb:
                    (winCounts[t.id] ?? 0) / iterations +
                    (runnerCounts[t.id] ?? 0) / iterations,
                }))
                .sort((a, b) => b.qualifyProb - a.qualifyProb);

              return (
                <Link
                  key={g}
                  href={`/grupo/${g}`}
                  className="border border-border bg-surface p-4 transition-colors hover:border-accent"
                >
                  <div className="font-data mb-3 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-accent">GRUPO {g}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted">
                      {teams.length} equipos
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {teamRows.map((row, i) => (
                      <div
                        key={row.team.id}
                        className={`flex items-center justify-between gap-2 ${
                          i >= 2 ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-data text-[10px] font-bold ${
                              i < 2 ? "text-positive" : "text-muted"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="font-data text-sm font-semibold leading-tight">
                            {row.team.name}
                          </span>
                          {row.team.isHost && (
                            <span className="font-data rounded-sm bg-accent px-1 py-0.5 text-[8px] font-bold uppercase text-background">
                              sede
                            </span>
                          )}
                        </div>
                        <span
                          className={`font-data shrink-0 text-xs font-bold ${
                            i < 2 ? "text-positive" : "text-muted"
                          }`}
                        >
                          {Math.round(row.qualifyProb * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
