"use client";

import { useScore } from "@/lib/score";
import { TOTAL_EXHIBITS } from "@/exhibits/meta";

export default function ScoreBadge() {
  const { score } = useScore();
  const attempted = Object.keys(score).length;
  const correct = Object.values(score).filter(Boolean).length;
  return (
    <div
      className="label-card inline-flex items-center gap-4 px-6 py-3"
      style={{ maskImage: "radial-gradient(circle at left center, transparent 7px, black 7.5px), radial-gradient(circle at right center, transparent 7px, black 7.5px)", maskComposite: "intersect" }}
    >
      <span className="font-display text-xs tracking-[0.3em] text-ink-soft">参观券</span>
      <span className="h-8 w-px border-l border-dashed border-ink-soft/40" />
      <span className="text-sm text-ink">
        直觉战绩 <span className="font-display text-xl font-bold text-seal">{correct}</span>
        <span className="text-ink-soft"> 胜 · 已访 {attempted}/{TOTAL_EXHIBITS} 件</span>
      </span>
    </div>
  );
}
