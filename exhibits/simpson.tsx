"use client";

import { useCallback } from "react";
import type { ExhibitDef, SimulatorProps } from "./types";
import { runSimpson, SimpsonResult } from "@/lib/sims/simpson";
import { useChunkedSim, useCompletionReport } from "@/components/sim/useChunkedSim";
import { RunButton, BarRow, fmtPct } from "@/components/sim/ui";

const TOTAL = 20000;
const STEPS = 50;

function merge(a: SimpsonResult, b: SimpsonResult): SimpsonResult {
  const g = (x: SimpsonResult["small"], y: SimpsonResult["small"]) => ({
    aTreated: x.aTreated + y.aTreated,
    aSuccess: x.aSuccess + y.aSuccess,
    bTreated: x.bTreated + y.bTreated,
    bSuccess: x.bSuccess + y.bSuccess,
  });
  return { small: g(a.small, b.small), large: g(a.large, b.large) };
}

function Simulator({ onFirstComplete }: SimulatorProps) {
  const init: SimpsonResult = {
    small: { aTreated: 0, aSuccess: 0, bTreated: 0, bSuccess: 0 },
    large: { aTreated: 0, aSuccess: 0, bTreated: 0, bSuccess: 0 },
  };
  const chunk = useCallback((p: SimpsonResult) => merge(p, runSimpson(TOTAL / STEPS)), []);
  const { state: s, running, done, progress, start } = useChunkedSim(init, chunk, STEPS);

  const rate = (su: number, t: number) => (t > 0 ? su / t : 0);
  const aAll = rate(s.small.aSuccess + s.large.aSuccess, s.small.aTreated + s.large.aTreated);
  const bAll = rate(s.small.bSuccess + s.large.bSuccess, s.small.bTreated + s.large.bTreated);
  const total = s.small.aTreated + s.small.bTreated + s.large.aTreated + s.large.bTreated;

  useCompletionReport(
    done,
    () => `A 疗法在小结石组和大结石组都赢了 B,但合计成功率反而输了(A ${fmtPct(aAll)} vs B ${fmtPct(bAll)})。`,
    onFirstComplete
  );

  return (
    <div>
      <p className="mb-4 text-sm text-dim">
        按真实医院的分诊习惯生成 2 万名肾结石病人:重症(大结石)多被派给 A 疗法(开放手术),轻症多用 B 疗法(微创)。分别统计各组和合计的成功率。
      </p>
      <RunButton onClick={start} running={running} progress={progress}>收治 2 万名病人</RunButton>
      {total > 0 && (
        <div className="mt-6 space-y-5">
          <div className="mb-2 font-mono text-sm text-dim">已收治 {total.toLocaleString()} 人</div>
          <div>
            <div className="mb-2 text-sm text-cream">小结石病人</div>
            <BarRow label={`A 疗法(${s.small.aTreated} 人)`} frac={rate(s.small.aSuccess, s.small.aTreated)} text={fmtPct(rate(s.small.aSuccess, s.small.aTreated))} />
            <BarRow label={`B 疗法(${s.small.bTreated} 人)`} frac={rate(s.small.bSuccess, s.small.bTreated)} text={fmtPct(rate(s.small.bSuccess, s.small.bTreated))} color="var(--color-dim)" />
          </div>
          <div>
            <div className="mb-2 text-sm text-cream">大结石病人</div>
            <BarRow label={`A 疗法(${s.large.aTreated} 人)`} frac={rate(s.large.aSuccess, s.large.aTreated)} text={fmtPct(rate(s.large.aSuccess, s.large.aTreated))} />
            <BarRow label={`B 疗法(${s.large.bTreated} 人)`} frac={rate(s.large.bSuccess, s.large.bTreated)} text={fmtPct(rate(s.large.bSuccess, s.large.bTreated))} color="var(--color-dim)" />
          </div>
          <div>
            <div className="mb-2 text-sm" style={{ color: "var(--color-gold-2)" }}>全部病人合计</div>
            <BarRow label="A 疗法" frac={aAll} text={fmtPct(aAll)} />
            <BarRow label="B 疗法" frac={bAll} text={fmtPct(bAll)} color="var(--color-dim)" />
          </div>
        </div>
      )}
    </div>
  );
}

const def: ExhibitDef = {
  id: "simpson",
  no: 3,
  hall: "统计厅",
  title: "辛普森悖论",
  teaser: "一种疗法在每个分组里都更好,合计起来却更差——这数据没造假。",
  question: "A 疗法治小结石比 B 强,治大结石也比 B 强。那把所有病人加在一起算总成功率,结果会怎样?",
  options: ["A 一定还是比 B 强,分组都赢了,总和不可能输", "总和大概率打平", "总和有可能反过来,B 比 A 强"],
  correctIndex: 2,
  Simulator,
  explanation: {
    intuition: (
      <p>因为两种疗法接的「病人盘子」不一样:A 疗法专门被派去啃大结石这种硬骨头,B 疗法接的多是轻症。合计成功率比的不是医术,是病人的难易搭配。</p>
    ),
    math: (
      <div className="space-y-2">
        <p>合计成功率是各组成功率的<b>加权平均</b>,权重是各疗法在两组病人中的分布。本展品的生成参数(取自 Charig 1986 经典研究的近似):A 疗法成功率小结石 93%、大结石 73%;B 疗法为 87%、69%——A 组组占优。</p>
        <p>但 A 的病人约 77% 是大结石,B 的病人约 76% 是小结石。于是合计:A ≈ 78%,B ≈ 83%,大小关系翻转。</p>
        <p>教训:比较两组时,若存在与分组相关的混杂变量(这里是病情严重度),合计数可以和每个分层的结论完全相反。该信哪个?取决于因果结构——这里应信分层结论。</p>
      </div>
    ),
    story: (
      <p>1973 年伯克利大学被告性别歧视:全校研究生录取率男 44%、女 35%。但逐系一看,大多数系对女生的录取率反而更高。真相是女生更多申请了竞争惨烈的文科系,男生扎堆在录取率高的工科系。类似的反转每年都在公司报表里上演:每条产品线的利润率都在涨,总利润率却在跌——只因低毛利产品卖得越来越多。看合计数做决策的人,常常在给混杂变量打工。</p>
    ),
  },
};

export default def;
