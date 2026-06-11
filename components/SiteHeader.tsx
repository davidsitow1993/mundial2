import Link from "next/link";
import { GROUPS } from "@/lib/data/teams";

export function SiteHeader({ updatedAt }: { updatedAt: string | null }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-data text-xl font-bold tracking-tight text-accent">MUNDIAL26</span>
          <span className="font-data text-xs uppercase tracking-[0.3em] text-muted">IA Predictor</span>
        </Link>
        <nav className="font-data flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-wider text-muted">
          {GROUPS.map((g) => (
            <Link key={g} href={`/grupo/${g}`} className="transition-colors hover:text-accent">
              Grupo {g}
            </Link>
          ))}
        </nav>
      </div>
      {updatedAt && (
        <div className="border-t border-border bg-background/40 px-4 py-1.5 text-center font-data text-[10px] uppercase tracking-[0.2em] text-muted">
          Modelo recalculado: {new Date(updatedAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
        </div>
      )}
    </header>
  );
}
