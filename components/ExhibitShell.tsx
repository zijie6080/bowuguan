"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ExhibitDef } from "@/exhibits/types";
import { useScore } from "@/lib/score";

type Phase = "predict" | "simulate" | "revealed";

const STEPS = [
  { key: "壹", name: "押注直觉" },
  { key: "贰", name: "亲手模拟" },
  { key: "叁", name: "当面对质" },
  { key: "肆", name: "听讲解" },
];

function PhaseRail({ reached }: { reached: number }) {
  return (
    <ol className="mb-8 flex items-center gap-0 text-xs" aria-label="参观进度">
      {STEPS.map((s, i) => (
        <li key={s.key} className="flex flex-1 items-center">
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border font-display transition-colors duration-500 ${
              i <= reached ? "border-brass-2 bg-brass/20 text-brass-2" : "border-line text-dim/60"
            }`}
          >
            {s.key}
          </span>
          <span className={`ml-2 hidden whitespace-nowrap sm:inline ${i <= reached ? "text-cream" : "text-dim/60"}`}>{s.name}</span>
          {i < STEPS.length - 1 && (
            <span className={`mx-2 h-px flex-1 transition-colors duration-500 sm:mx-3 ${i < reached ? "bg-brass/60" : "bg-line"}`} />
          )}
        </li>
      ))}
    </ol>
  );
}

export default function ExhibitShell({ def }: { def: ExhibitDef }) {
  const [phase, setPhase] = useState<Phase>("predict");
  const [choice, setChoice] = useState<number | null>(null);
  const [actual, setActual] = useState<string>("");
  const [openLayer, setOpenLayer] = useState<number>(0);
  const { record } = useScore();
  const simRef = useRef<HTMLElement>(null);
  const compareRef = useRef<HTMLElement>(null);

  const confirm = () => {
    if (choice === null) return;
    setPhase("simulate");
  };

  useEffect(() => {
    if (phase === "simulate") simRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (phase === "revealed") setTimeout(() => compareRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  }, [phase]);

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
  const reached = phase === "predict" ? 0 : phase === "simulate" ? 1 : 3;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-7">
      <nav className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-dim">
        <Link href="/" className="transition hover:text-brass-2">← 展馆大厅</Link>
        <span className="text-line">|</span>
        <span className="brass-plate !py-[0.15em] font-display text-xs">{def.hall}</span>
        <span className="font-mono text-xs tracking-widest">馆藏编号 {String(def.no).padStart(3, "0")}</span>
      </nav>

      <h1 className="font-display text-3xl font-bold text-cream sm:text-[2.6rem] sm:leading-tight">{def.title}</h1>
      <hr className="brass-rule mb-7 mt-5" />

      <PhaseRail reached={reached} />

      {/* 壹 · 预测 */}
      <section className="panel p-5 sm:p-7">
        <h2 className="font-display text-sm tracking-[0.3em] text-brass">壹 · 先押上你的直觉</h2>
        <p className="mt-4 text-lg leading-relaxed text-cream">{def.question}</p>
        {def.note && <p className="mt-2 text-sm text-dim">{def.note}</p>}
        <div className="mt-5 grid gap-2.5" role="radiogroup" aria-label="你的预测">
          {def.options.map((opt, i) => {
            const chosen = choice === i;
            const locked = phase !== "predict";
            const showMark = phase === "revealed" && (chosen || i === def.correctIndex);
            return (
              <button
                key={i}
                disabled={locked}
                role="radio"
                aria-checked={chosen}
                onClick={() => setChoice(i)}
                className={`rounded-[3px] border px-4 py-3 text-left transition-all duration-150 ${
                  chosen
                    ? "border-brass-2 bg-brass/10 text-cream shadow-[inset_0_0_0_1px_var(--color-brass)]"
                    : "border-line text-dim"
                } ${locked ? "cursor-default" : "hover:border-brass/70 hover:bg-brass/5 hover:text-cream active:translate-y-px"}`}
              >
                {opt}
                {showMark && i === def.correctIndex && (
                  <span className="ml-2 text-sm" style={{ color: "var(--color-right)" }}>✓ 事实如此</span>
                )}
                {showMark && chosen && i !== def.correctIndex && (
                  <span className="ml-2 text-sm" style={{ color: "var(--color-wrong)" }}>✗ 你的直觉</span>
                )}
              </button>
            );
          })}
        </div>
        {phase === "predict" ? (
          <button
            onClick={confirm}
            disabled={choice === null}
            className="brass-plate mt-5 font-display text-base transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-35"
          >
            落子无悔,就赌这个
          </button>
        ) : (
          choice !== null && (
            <p className="mt-4 text-sm text-dim">已封存你的预测:「{def.options[choice]}」。现在,亲手验证它。</p>
          )
        )}
      </section>

      {/* 贰 · 模拟 */}
      {phase !== "predict" && (
        <section ref={simRef} className="panel rise-in mt-6 scroll-mt-6 p-5 sm:p-7">
          <h2 className="mb-5 font-display text-sm tracking-[0.3em] text-brass">贰 · 亲手跑一遍现实</h2>
          <def.Simulator onFirstComplete={onFirstComplete} />
        </section>
      )}

      {/* 叁 · 对比 */}
      {phase === "revealed" && (
        <section ref={compareRef} className="panel rise-in mt-6 scroll-mt-6 p-5 sm:p-7">
          <h2 className="mb-5 font-display text-sm tracking-[0.3em] text-brass">叁 · 你猜的 vs 实际发生的</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[3px] border border-line bg-black/20 px-4 py-3">
              <div className="text-xs text-dim">你猜的</div>
              <div className="mt-1 text-cream">{choice !== null ? def.options[choice] : "—"}</div>
            </div>
            <div className="rounded-[3px] border border-brass/50 bg-brass/5 px-4 py-3">
              <div className="text-xs text-dim">实际发生的</div>
              <div className="mt-1 text-cream">{actual}</div>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <span className="seal seal--stamp text-[13px]">{correct ? "直觉不虚" : "直觉已碎"}</span>
            <p className="text-sm leading-relaxed text-dim">
              {correct
                ? "本馆为你的直觉盖章存档。能从这里全身而退的参观者,一只手数得过来。"
                : "别难过——本馆的每件藏品,都是用无数聪明人的这一下换来的。"}
            </p>
          </div>
        </section>
      )}

      {/* 肆 · 解释 */}
      {phase === "revealed" && (
        <section className="panel rise-in mt-6 p-5 sm:p-7">
          <h2 className="mb-4 font-display text-sm tracking-[0.3em] text-brass">肆 · 讲解员时间</h2>
          {[
            { t: "一句话直觉版", c: def.explanation.intuition },
            { t: "数学原理版", c: def.explanation.math },
            { t: "现实中它坑过谁", c: def.explanation.story },
          ].map((l, i) => (
            <div key={i} className="border-b border-line last:border-0">
              <button
                onClick={() => setOpenLayer(openLayer === i ? -1 : i)}
                aria-expanded={openLayer === i}
                className="flex w-full items-center justify-between py-3.5 text-left font-display text-cream transition hover:text-brass-2"
              >
                {l.t}
                <span className="text-dim" aria-hidden>{openLayer === i ? "−" : "+"}</span>
              </button>
              {openLayer === i && <div className="rise-in pb-5 leading-relaxed text-cream/90">{l.c}</div>}
            </div>
          ))}
          <div className="mt-7 text-center">
            <Link href="/" className="font-display text-brass transition hover:text-brass-2">
              → 回大厅,看看下一件藏品
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
