import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { ProbBar } from "@/components/ProbBar";
import { generateFixtures } from "@/lib/data/fixtures";
import { teamById } from "@/lib/data/teams";
import { getLatestPrediction, getPredictionTimestamp } from "@/lib/db/queries";

export function generateStaticParams() {
  return generateFixtures().map((f) => ({ id: f.id }));
}

export default async function MatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ captura?: string }>;
}) {
  const { id } = await params;
  const { captura } = await searchParams;
  const modoCaptura = captura === "1";
  const fixture = generateFixtures().find((f) => f.id === id);
  if (!fixture) notFound();

  const home = teamById(fixture.homeTeamId)!;
  const away = teamById(fixture.awayTeamId)!;
  const prediction = getLatestPrediction(fixture.id);
  const updatedAt = getPredictionTimestamp();

  if (!prediction) {
    return (
      <div className="flex flex-1 flex-col">
        <SiteHeader updatedAt={updatedAt} />
        <DisclaimerBanner />
        <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
          <h1 className="font-data text-2xl font-bold text-accent">SIN DATOS AUN</h1>
          <p className="text-muted">
            Corre <code className="font-data text-accent">pnpm cron:run</code> para generar las
            predicciones.
          </p>
        </main>
      </div>
    );
  }

  const { match, cards, corners, scorers } = prediction;

  return (
    <div className="flex flex-1 flex-col">
      {!modoCaptura && <SiteHeader updatedAt={updatedAt} />}
      {!modoCaptura && <DisclaimerBanner />}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        {!modoCaptura && (
          <div className="mb-4 flex items-center justify-between">
            <Link
              href={`/grupo/${fixture.group}`}
              className="font-data inline-block text-xs uppercase tracking-wider text-muted hover:text-accent"
            >
              &larr; Grupo {fixture.group} / Jornada {fixture.matchday}
            </Link>
            <Link
              href={`/partido/${fixture.id}?captura=1`}
              className="font-data inline-block text-xs uppercase tracking-wider text-muted hover:text-accent"
            >
              Modo captura &rarr;
            </Link>
          </div>
        )}
        {modoCaptura && (
          <div className="font-data mb-4 text-center text-[10px] uppercase tracking-[0.3em] text-accent">
            MUNDIAL26 // IA PREDICTOR
          </div>
        )}

        <div className="mb-10 grid grid-cols-3 items-center gap-4 border border-border bg-surface py-8 text-center">
          <div>
            <div className="font-data text-lg font-bold sm:text-2xl">{home.name}</div>
            <div className="font-data mt-2 text-3xl font-bold text-accent sm:text-5xl">
              {match.homeXg.toFixed(2)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted">xG esperado</div>
          </div>
          <div className="font-data text-sm text-muted sm:text-base">vs</div>
          <div>
            <div className="font-data text-lg font-bold sm:text-2xl">{away.name}</div>
            <div className="font-data mt-2 text-3xl font-bold text-accent sm:text-5xl">
              {match.awayXg.toFixed(2)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted">xG esperado</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Resultado 1X2">
            <ProbBar label={home.name} value={match.result1x2.home} highlight />
            <ProbBar label="Empate" value={match.result1x2.draw} />
            <ProbBar label={away.name} value={match.result1x2.away} />
          </Section>

          <Section title="Doble oportunidad">
            <ProbBar label="1X" value={match.doubleChance.homeOrDraw} />
            <ProbBar label="12" value={match.doubleChance.homeOrAway} highlight />
            <ProbBar label="X2" value={match.doubleChance.drawOrAway} />
          </Section>

          <Section title="Total de goles">
            {(["1.5", "2.5", "3.5"] as const).map((line) => (
              <div key={line} className="flex flex-col gap-1.5">
                <span className="font-data text-[10px] uppercase tracking-wider text-muted">
                  Linea {line}
                </span>
                <ProbBar label="Over" value={match.overUnder[line].over} highlight />
                <ProbBar label="Under" value={match.overUnder[line].under} />
              </div>
            ))}
          </Section>

          <Section title="Ambos marcan (BTTS)">
            <ProbBar label="Si" value={match.btts.yes} highlight />
            <ProbBar label="No" value={match.btts.no} />
          </Section>

          <Section title="Marcador exacto (top 5)">
            {match.topScorelines.map((s, i) => (
              <ProbBar
                key={i}
                label={`${s.home} - ${s.away}`}
                value={s.prob}
                highlight={i === 0}
              />
            ))}
          </Section>

          <Section title="Porteria a cero">
            <ProbBar label={home.name} value={match.cleanSheet.home} />
            <ProbBar label={away.name} value={match.cleanSheet.away} />
          </Section>

          <Section title="Tarjetas">
            <div className="font-data mb-1 text-2xl font-bold">
              {cards.expectedCards} <span className="text-xs font-normal text-muted">esperadas</span>
            </div>
            <ProbBar label={`Over ${cards.overUnder.line}`} value={cards.overUnder.over} highlight />
            <ProbBar label={`Under ${cards.overUnder.line}`} value={cards.overUnder.under} />
            <ProbBar label="Roja (alguna)" value={cards.redCardProbability} />
          </Section>

          <Section title="Corners">
            <div className="font-data mb-1 text-2xl font-bold">
              {corners.expectedCorners} <span className="text-xs font-normal text-muted">esperados</span>
            </div>
            <ProbBar label={`Over ${corners.overUnder.line}`} value={corners.overUnder.over} highlight />
            <ProbBar label={`Under ${corners.overUnder.line}`} value={corners.overUnder.under} />
            <ProbBar label={home.name} value={corners.homeShare} />
            <ProbBar label={away.name} value={corners.awayShare} />
          </Section>

          <Section title={`Goleadores ${home.name}`}>
            {scorers.home.map((s) => (
              <ProbBar key={s.id} label={s.name} value={s.anytimeProbability} highlight />
            ))}
          </Section>

          <Section title={`Goleadores ${away.name}`}>
            {scorers.away.map((s) => (
              <ProbBar key={s.id} label={s.name} value={s.anytimeProbability} />
            ))}
          </Section>
        </div>

        {modoCaptura && (
          <div className="mt-8 text-center font-data text-[10px] uppercase tracking-wider text-muted">
            Analisis estadistico de entretenimiento. No es asesoria de apuestas.
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-surface p-5">
      <h2 className="font-data mb-4 text-xs font-bold uppercase tracking-[0.3em] text-accent">
        {title}
      </h2>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}
