import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { ProbBar } from "@/components/ProbBar";
import { getLatestTournamentSimulation, getPredictionTimestamp } from "@/lib/db/queries";
import { teamById, GROUPS } from "@/lib/data/teams";

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

  const { championCounts, goldenBootCounts, iterations } = sim.result;

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
        <section className="mb-12">
          <h1 className="font-data text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            ASI PREDICE LA <span className="text-accent">IA</span> EL MUNDIAL 2026
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
            Proyecciones generadas con un modelo de Poisson + simulacion Monte Carlo
            ({iterations.toLocaleString("es-CO")} simulaciones del torneo completo).
            Resultado, goles, tarjetas, corners y goleadores para los 72 partidos de
            la fase de grupos.
          </p>
        </section>

        <section className="mb-12 grid gap-8 lg:grid-cols-2">
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

        <section>
          <h2 className="font-data mb-4 text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Fase de grupos
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {GROUPS.map((g) => (
              <Link
                key={g}
                href={`/grupo/${g}`}
                className="border border-border bg-surface px-4 py-6 text-center transition-colors hover:border-accent hover:text-accent"
              >
                <div className="font-data text-2xl font-bold">{g}</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-muted">Grupo</div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
