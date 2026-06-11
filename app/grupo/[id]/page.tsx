import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { GROUPS, teamsByGroup, teamById } from "@/lib/data/teams";
import { generateFixtures } from "@/lib/data/fixtures";
import { getLatestPrediction, getPredictionTimestamp } from "@/lib/db/queries";

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

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader updatedAt={updatedAt} />
      <DisclaimerBanner />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <h1 className="font-data mb-1 text-3xl font-bold">
          GRUPO <span className="text-accent">{group}</span>
        </h1>
        <p className="mb-8 text-sm text-muted">
          {teams.map((t) => t.name).join(" / ")}
        </p>

        <h2 className="font-data mb-4 text-xs font-bold uppercase tracking-[0.3em] text-accent">
          Partidos y proyeccion 1X2
        </h2>
        <div className="flex flex-col gap-2">
          {fixtures.map((fixture) => {
            const home = teamById(fixture.homeTeamId)!;
            const away = teamById(fixture.awayTeamId)!;
            const prediction = getLatestPrediction(fixture.id);
            const result = prediction?.match.result1x2;

            return (
              <Link
                key={fixture.id}
                href={`/partido/${fixture.id}`}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border border-border bg-surface px-4 py-3 transition-colors hover:border-accent"
              >
                <div className="font-data text-[10px] uppercase tracking-wider text-muted">
                  J{fixture.matchday}
                  <br />
                  {new Date(fixture.kickoff).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
                <div className="font-data text-sm font-semibold sm:text-base">
                  {home.name} <span className="text-muted">vs</span> {away.name}
                </div>
                {result ? (
                  <div className="font-data flex gap-3 text-xs sm:text-sm">
                    <span className="text-accent">{Math.round(result.home * 100)}%</span>
                    <span className="text-muted">{Math.round(result.draw * 100)}%</span>
                    <span>{Math.round(result.away * 100)}%</span>
                  </div>
                ) : (
                  <div className="font-data text-xs text-muted">sin datos</div>
                )}
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
