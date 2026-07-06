"use client";

import { useScore } from "@/lib/score";
import { TOTAL_EXHIBITS } from "@/exhibits/meta";

export default function ScoreBadge() {
  const { score } = useScore();
  const attempted = Object.keys(score).length;
  const correct = Object.values(score).filter(Boolean).length;
  return (
    <div className="plaque inline-flex items-baseline gap-2 rounded-full px-5 py-2 text-sm">
      <span className="text-dim">直觉得分</span>
      <span className="font-display text-xl text-gold-2">{correct}</span>
      <span className="text-dim">/ {attempted} 猜过 · 共 {TOTAL_EXHIBITS} 件展品</span>
    </div>
  );
}
