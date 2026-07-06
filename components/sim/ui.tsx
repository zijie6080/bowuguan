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
      className="brass-plate relative w-full overflow-hidden font-display text-lg transition active:translate-y-px sm:w-auto disabled:cursor-wait"
    >
      {running && (
        <span
          className="absolute inset-y-0 left-0 bg-black/25 transition-[width]"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      )}
      <span className="relative">{running ? `运行中 ${Math.round(progress * 100)}%` : children}</span>
    </button>
  );
}

export function BarRow({
  label,
  frac,
  text,
  color = "var(--color-brass-2)",
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
      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span className="text-dim">{label}</span>
        <span className="font-mono text-cream">{text}</span>
      </div>
      <div className="relative h-4 rounded-[2px] bg-black/45 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
        <div
          className="h-full rounded-[2px] transition-[width] duration-200"
          style={{ width: `${Math.min(100, frac * 100)}%`, background: `linear-gradient(180deg, ${color}, color-mix(in srgb, ${color} 72%, black))` }}
        />
        {refLine !== undefined && (
          <div
            className="absolute inset-y-[-3px] w-px bg-cream/80"
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
    <div className="panel p-4 text-center">
      <div className="text-xs text-dim">{label}</div>
      <div className="font-display text-3xl text-brass-2">{value}</div>
      {sub && <div className="mt-1 text-xs text-dim">{sub}</div>}
    </div>
  );
}

export function fmtPct(x: number, digits = 1): string {
  return isFinite(x) ? `${(x * 100).toFixed(digits)}%` : "—";
}
