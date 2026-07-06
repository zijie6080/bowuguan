"use client";

import { ReactNode } from "react";

export function RunButton({
  onClick,
  running,
  progress,
  children,
}: {
  onClick: () => void;
  running: boolean;
  progress: number;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={running}
      className="relative w-full sm:w-auto overflow-hidden rounded border border-gold/60 px-8 py-3 font-display text-lg text-gold-2 transition hover:bg-gold/10 disabled:cursor-wait"
    >
      {running && (
        <span
          className="absolute inset-y-0 left-0 bg-gold/20 transition-[width]"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      )}
      <span className="relative">{running ? "运行中…" : children}</span>
    </button>
  );
}

export function BarRow({
  label,
  frac,
  text,
  color = "var(--color-gold)",
  refLine,
}: {
  label: string;
  frac: number; // 0..1 条长
  text: string;
  color?: string;
  refLine?: number; // 理论参考线 0..1
}) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="text-dim">{label}</span>
        <span className="font-mono text-cream">{text}</span>
      </div>
      <div className="relative h-4 rounded-sm bg-black/40">
        <div
          className="h-full rounded-sm transition-[width] duration-200"
          style={{ width: `${Math.min(100, frac * 100)}%`, background: color }}
        />
        {refLine !== undefined && (
          <div
            className="absolute inset-y-[-3px] w-px bg-cream/70"
            style={{ left: `${refLine * 100}%` }}
            title="理论值"
          />
        )}
      </div>
    </div>
  );
}

export function BigStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="plaque rounded p-4 text-center">
      <div className="text-xs text-dim">{label}</div>
      <div className="font-display text-3xl text-gold-2">{value}</div>
      {sub && <div className="mt-1 text-xs text-dim">{sub}</div>}
    </div>
  );
}

export function fmtPct(x: number, digits = 1): string {
  return isFinite(x) ? `${(x * 100).toFixed(digits)}%` : "—";
}
