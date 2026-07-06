"use client";

import Link from "next/link";
import { useScore } from "@/lib/score";
import type { ExhibitDef } from "@/exhibits/types";

export default function ExhibitCard({ def }: { def: Pick<ExhibitDef, "id" | "no" | "title" | "teaser"> }) {
  const { score } = useScore();
  const visited = def.id in score;
  const correct = score[def.id];
  return (
    <Link
      href={`/exhibits/${def.id}/`}
      className="plaque group block rounded-lg p-5 transition hover:-translate-y-0.5 hover:border-gold/50"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-dim">No.{String(def.no).padStart(2, "0")}</span>
        {visited && (
          <span className="text-xs" style={{ color: correct ? "var(--color-right)" : "var(--color-wrong)" }}>
            {correct ? "✓ 直觉猜对" : "✗ 直觉翻车"}
          </span>
        )}
      </div>
      <h3 className="mt-2 font-display text-xl text-cream group-hover:text-gold-2">{def.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-dim">{def.teaser}</p>
    </Link>
  );
}
