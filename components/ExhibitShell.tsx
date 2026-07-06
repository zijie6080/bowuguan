"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { ExhibitDef } from "@/exhibits/types";
import { useScore } from "@/lib/score";

type Phase = "predict" | "simulate" | "revealed";

export default function ExhibitShell({ def }: { def: ExhibitDef }) {
  const [phase, setPhase] = useState<Phase>("predict");
  const [choice, setChoice] = useState<number | null>(null);
  const [actual, setActual] = useState<string>("");
  const [openLayer, setOpenLayer] = useState<number>(0);
  const { record } = useScore();

  const confirm = () => {
    if (choice === null) return;
    setPhase("simulate");
  };

  const onFirstComplete = useCallback(
    (actualText: string) => {
      setActual(actualText);
      setPhase((p) => {
        if (p === "simulate") {
          record(def.id, choice === def.correctIndex);
          return "revealed";
        }
        return p;
      });
    },
    [choice, def.id, def.correctIndex, record]
  );

  const correct = choice === def.correctIndex;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <nav className="mb-6 text-sm text-dim">
        <Link href="/" className="hover:text-gold-2">← 返回展馆大厅</Link>
        <span className="mx-2">·</span>
        {def.hall} · 展品 No.{String(def.no).padStart(2, "0")}
      </nav>

      <h1 className="font-display text-3xl text-gold-2 sm:text-4xl">{def.title}</h1>
      <div className="gold-rule my-5" />

      {/* 1. 预测 */}
      <section className="plaque rounded-lg p-5 sm:p-6">
        <h2 className="mb-1 font-display text-sm tracking-widest text-gold">壹 · 先押上你的直觉</h2>
        <p className="mt-3 text-lg leading-relaxed">{def.question}</p>
        {def.note && <p className="mt-2 text-sm text-dim">{def.note}</p>}
        <div className="mt-4 grid gap-2">
          {def.options.map((opt, i) => {
            const chosen = choice === i;
            const locked = phase !== "predict";
            const showMark = phase === "revealed" && (chosen || i === def.correctIndex);
            return (
              <button
                key={i}
                disabled={locked}
                onClick={() => setChoice(i)}
                className={`rounded border px-4 py-3 text-left transition ${
                  chosen ? "border-gold bg-gold/10 text-cream" : "border-line text-dim hover:border-gold/50 hover:text-cream"
                } ${locked ? "cursor-default" : ""}`}
              >
                {opt}
                {showMark && i === def.correctIndex && <span className="ml-2 text-right text-sm text-right" style={{ color: "var(--color-right)" }}>✓ 事实如此</span>}
                {showMark && chosen && i !== def.correctIndex && <span className="ml-2 text-sm" style={{ color: "var(--color-wrong)" }}>✗ 你的直觉</span>}
              </button>
            );
          })}
        </div>
        {phase === "predict" && (
          <button
            onClick={confirm}
            disabled={choice === null}
            className="mt-4 rounded bg-gold px-6 py-2 font-display text-ink transition hover:bg-gold-2 disabled:opacity-30"
          >
            就赌这个
          </button>
        )}
        {phase !== "predict" && choice !== null && (
          <p className="mt-3 text-sm text-dim">已记录你的预测:「{def.options[choice]}」。现在,亲手验证它。</p>
        )}
      </section>

      {/* 2. 模拟 */}
      {phase !== "predict" && (
        <section className="plaque rise-in mt-6 rounded-lg p-5 sm:p-6">
          <h2 className="mb-4 font-display text-sm tracking-widest text-gold">贰 · 亲手跑一遍现实</h2>
          <def.Simulator onFirstComplete={onFirstComplete} />
        </section>
      )}

      {/* 3. 对比 */}
      {phase === "revealed" && (
        <section className="plaque rise-in mt-6 rounded-lg p-5 sm:p-6">
          <h2 className="mb-4 font-display text-sm tracking-widest text-gold">叁 · 你猜的 vs 实际发生的</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded border px-4 py-3" style={{ borderColor: correct ? "var(--color-right)" : "var(--color-wrong)" }}>
              <div className="text-xs text-dim">你猜的</div>
              <div className="mt-1">{choice !== null ? def.options[choice] : "—"}</div>
            </div>
            <div className="rounded border border-gold/50 px-4 py-3">
              <div className="text-xs text-dim">实际发生的</div>
              <div className="mt-1">{actual}</div>
            </div>
          </div>
          <p className="mt-4 font-display text-lg" style={{ color: correct ? "var(--color-right)" : "var(--color-wrong)" }}>
            {correct ? "✓ 你的直觉这次站住了脚。这在本馆并不常见。" : "✗ 直觉又输了一局——别难过,几乎所有人都在这里翻车。"}
          </p>
        </section>
      )}

      {/* 4. 解释 */}
      {phase === "revealed" && (
        <section className="plaque rise-in mt-6 rounded-lg p-5 sm:p-6">
          <h2 className="mb-4 font-display text-sm tracking-widest text-gold">肆 · 讲解员时间</h2>
          {[
            { t: "一句话直觉版", c: def.explanation.intuition },
            { t: "数学原理版", c: def.explanation.math },
            { t: "现实中它坑过谁", c: def.explanation.story },
          ].map((l, i) => (
            <div key={i} className="border-b border-line last:border-0">
              <button
                onClick={() => setOpenLayer(openLayer === i ? -1 : i)}
                className="flex w-full items-center justify-between py-3 text-left font-display text-cream hover:text-gold-2"
              >
                {l.t}
                <span className="text-dim">{openLayer === i ? "−" : "+"}</span>
              </button>
              {openLayer === i && <div className="rise-in pb-4 leading-relaxed text-cream/90">{l.c}</div>}
            </div>
          ))}
          <div className="mt-6 text-center">
            <Link href="/" className="font-display text-gold hover:text-gold-2">→ 回大厅,看看下一件展品</Link>
          </div>
        </section>
      )}
    </main>
  );
}
