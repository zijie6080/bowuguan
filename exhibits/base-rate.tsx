"use client";

import { useCallback } from "react";
import type { ExhibitDef, SimulatorProps } from "./types";
import { runBaseRate, BaseRateResult, baseRateTheory } from "@/lib/sims/baseRate";
import { useChunkedSim, useCompletionReport } from "@/components/sim/useChunkedSim";
import { RunButton, BarRow, BigStat, fmtPct } from "@/components/sim/ui";

const TOTAL = 1_000_000;
const STEPS = 50;
const THEORY = baseRateTheory(); // ≈ 0.0194

function Simulator({ onFirstComplete }: SimulatorProps) {
  const init: BaseRateResult = { n: 0, sick: 0, positives: 0, truePositives: 0 };
  const chunk = useCallback((p: BaseRateResult): BaseRateResult => {
    const r = runBaseRate(TOTAL / STEPS);
    return {
      n: p.n + r.n,
      sick: p.sick + r.sick,
      positives: p.positives + r.positives,
      truePositives: p.truePositives + r.truePositives,
    };
  }, []);
  const { state: s, running, done, progress, start } = useChunkedSim(init, chunk, STEPS);

  useCompletionReport(
    done,
    () => `${s.positives.toLocaleString()} 个阳性里,真正患病的只有 ${s.truePositives.toLocaleString()} 人(${fmtPct(s.truePositives / s.positives)})——阳性≈虚惊,因为假阳性大军人多势众。`,
    onFirstComplete
  );

  return (
    <div>
      <p className="mb-4 text-sm text-dim">
        给 100 万人做筛查:患病率 0.1%,有病者 99% 呈阳性,无病者也有 5% 假阳性。数一数阳性人群里到底几个真病人。
      </p>
      <RunButton onClick={start} running={running} progress={progress}>筛查 100 万人</RunButton>
      {s.n > 0 && (
        <div className="mt-6">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <BigStat label="已筛查" value={s.n.toLocaleString()} sub={`其中真病人 ${s.sick.toLocaleString()}`} />
            <BigStat label="检出阳性" value={s.positives.toLocaleString()} />
            <BigStat label="阳性中的真病人" value={fmtPct(s.positives ? s.truePositives / s.positives : 0)} sub="理论值 1.9%" />
          </div>
          <BarRow
            label="拿到阳性报告后真患病的概率"
            frac={s.positives ? s.truePositives / s.positives : 0}
            text={fmtPct(s.positives ? s.truePositives / s.positives : 0)}
            refLine={THEORY}
          />
        </div>
      )}
    </div>
  );
}

const def: ExhibitDef = {
  id: "base-rate",
  no: 8,
  hall: "决策厅",
  title: "基率谬误",
  teaser: "检测准确率 99%,你查出阳性——先别慌,你大概率没病。",
  question: "某病患病率 0.1%。检测很灵:有病 99% 查得出,没病也只有 5% 会误报阳性。你的报告是阳性。你真的患病的概率是多少?",
  options: ["95% 以上——检测这么准", "70% 左右", "30% 左右", "5% 以下"],
  correctIndex: 3,
  Simulator,
  explanation: {
    intuition: (
      <p>病人太稀有了。100 万人里真病人只有 1000 个,而 99.9 万健康人中 5% 误报,就是近 5 万个假阳性。阳性大军里,真病人是 1000 对 5 万——被淹没得干干净净。检测再准,也架不住基数悬殊。</p>
    ),
    math: (
      <div className="space-y-2">
        <p>贝叶斯定理:P(病|阳) = P(阳|病)·P(病) / [P(阳|病)·P(病) + P(阳|无病)·P(无病)]</p>
        <p>= 0.99×0.001 / (0.99×0.001 + 0.05×0.999) ≈ <b>1.9%</b>。</p>
        <p>直觉错在只看 P(阳|病) = 99%,却把它偷换成了 P(病|阳)。这两个条件概率方向相反,数值可以差 50 倍。先验(基率)越低,阳性的含金量越低——这就是为什么罕见病筛查阳性后,医生做的第一件事是复检。</p>
      </div>
    ),
    story: (
      <p>这道题曾被拿去考哈佛医学院的师生(Casscells 1978),近半数人答「95%」。现实代价真实存在:乳腺癌筛查中大量假阳性带来不必要的活检与恐慌,多国因此上调了推荐筛查的起始年龄;机场安检、反恐名单、招聘测谎仪也一样——筛查一个极低基率的目标,系统再准,抓出来的绝大多数都是无辜者。任何「命中率 99%」的宣传,都请先问一句:基率是多少?</p>
    ),
  },
};

export default def;
