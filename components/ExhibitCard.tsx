"use client";

import Link from "next/link";
import { useScore } from "@/lib/score";
import type { ExhibitMeta } from "@/exhibits/meta";

export default function ExhibitCard({ def }: { def: Pick<ExhibitMeta, "id" | "no" | "title" | "teaser"> }) {
  const { score } = useScore();
  const visited = def.id in score;
  const correct = score[def.id];
  return (
    <Link href={`/exhibits/${def.id}/`} className="label-card group block p-5 pb-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-widest text-ink-soft">馆藏编号 {String(def.no).padStart(3, "0")}</span>
      </div>
      <h3 className="mt-2 font-display text-xl font-bold text-ink">{def.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{def.teaser}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-ink-soft/70 opacity-0 transition group-hover:opacity-100">进入展位 →</span>
        {visited && (
          <span className="seal !h-[2.6em] !w-[2.6em] text-[11px]" aria-label={correct ? "直觉猜对" : "直觉翻车"}>
            {correct ? "直觉不虚" : "直觉已碎"}
          </span>
        )}
      </div>
    </Link>
  );
}
