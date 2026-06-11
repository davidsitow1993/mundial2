// CLI entry point for the daily recalculation job. Run with `pnpm cron:run`.
import { runDailyRecalculation } from "../lib/jobs/recalculate";

function main() {
  console.log("[cron] Seeding teams, fixtures and recalculating predictions...");
  const summary = runDailyRecalculation();
  console.log(`[cron] Stored predictions for ${summary.fixtures} fixtures.`);
  console.log(`[cron] Simulated ${summary.iterations} tournament runs.`);
  console.log("[cron] Done at", summary.timestamp);
}

main();
