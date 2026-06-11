"use client";

import { motion } from "framer-motion";

type ProbBarProps = {
  label: string;
  value: number; // 0-1
  highlight?: boolean;
};

export function ProbBar({ label, value, highlight }: ProbBarProps) {
  const pct = Math.round(value * 1000) / 10;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-xs uppercase tracking-wider text-muted">{label}</span>
      <div className="bar-track h-2 flex-1 overflow-hidden rounded-none">
        <motion.div
          className={highlight ? "bar-fill h-full" : "h-full bg-border"}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="font-data w-14 shrink-0 text-right text-sm font-semibold">{pct.toFixed(1)}%</span>
    </div>
  );
}
