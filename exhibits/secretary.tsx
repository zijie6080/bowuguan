"use client";

import { useCallback } from "react";
import type { ExhibitDef, SimulatorProps } from "./types";
import { runSecretary, SecretaryResult, secretaryTheory } from "@/lib/sims/secretary";
import { useChunkedSim, useCompletionReport } from "@/components/sim/useChunkedSim";
import { RunButton, BarRow, fmtPct } from "@/components/sim/ui";

const TOTAL = 10000;
const STEPS = 50;
const THEORY = secretaryTheory(); // ≈ 0.371

function Simulator({ onFirstComplete }: SimulatorProps) {
  const init: SecretaryResult = { trials: 0, strategyWins: 0, randomWins: 0 };
  const chunk = useCallback((p: SecretaryResult): SecretaryResult => {
    const r = runSecretary(TOTAL / STEPS);
    return {
      trials: p.trials + r.trials,
      strategyWins: p.strategyWins + r.strategyWins,
      randomWins: p.randomWins + r.randomWins,
    };
  }, []);
  const { state: s, running, done, progress, start } = useChunkedSim(init, chunk, STEPS);

  useCompletionReport(
    done,
    () => `「先看 37 个再出手」拿下全场最佳的概率是 ${fmtPct(s.strategyWins / s.trials)},瞎选只有 ${fmtPct(s.randomWins / s.trials)}——一个门槛规则把胜率放大了三十多倍。`,
    onFirstComplete
  );

  return (
    <div>
      <p className="mb-4 text-sm text-dim">
        每轮 100 位候选人随机顺序出现,拒绝后不可回头。策略:前 37 位只面不聘,之后一遇到「比之前所有人都强」的立刻拍板。跑 1 万轮,统计选中「全场最佳」的比例,对照组是闭眼随机选。
      </p>
      <RunButton onClick={start} running={running} progress={progress}>面试 1 万轮</RunButton>
      {s.trials > 0 && (
        <div className="mt-6">
          <div className="mb-2 font-mono text-sm text-dim">已完成 {s.trials.toLocaleString()} 轮招聘</div>
          <BarRow label="37% 法则 · 选中全场最佳" frac={s.strategyWins / s.trials / 0.5} text={fmtPct(s.strategyWins / s.trials)} refLine={THEORY / 0.5} />
          <BarRow label="随机选一个 · 选中全场最佳" frac={s.randomWins / s.trials / 0.5} text={fmtPct(s.randomWins / s.trials)} color="var(--color-dim)" refLine={0.01 / 0.5} />
          <p className="mt-2 text-xs text-dim">细白线为理论值 37.1% 与 1%</p>
        </div>
      )}
    </div>
  );
}

const def: ExhibitDef = {
  id: "secretary",
  no: 11,
  hall: "决策厅",
  title: "秘书问题(37% 法则)",
  teaser: "100 个候选人只能顺序面试、错过不候,最优策略选中第一名的概率是多少?",
  question: "100 位候选人依次出现,面完必须当场决定要不要,拒了就再也叫不回来。用最聪明的策略,选中「全场第一名」的概率能有多高?",
  options: ["1% 上下——跟瞎选差不多,顺序太吃亏了", "10% 左右", "35% 以上", "超过 60%"],
  correctIndex: 2,
  Simulator,
  explanation: {
    intuition: (
      <p>前 37 个人不是浪费,是<b>免费的市场调研</b>:他们帮你校准「什么叫优秀」。之后第一个越过这条线的人,大概率就是顶尖水平。你放弃了「最佳恰好在前 37 个」的可能,换来了一把精准的尺子。</p>
    ),
    math: (
      <div className="space-y-2">
        <p>观察前 r 个、之后选第一个破纪录者,成功概率为 (r/n)·Σ<sub>i=r</sub><sup>n−1</sup>(1/i)。对它求极值,最优 r = n/e ≈ 37%,成功率也恰好趋近 1/e ≈ <b>36.8%</b>(n=100 时精确值约 37.1%)。</p>
        <p>神奇之处:n 是 100 还是 100 万,成功率都稳在 37% 附近,不随规模衰减。而随机策略是 1/n,n 越大越绝望。</p>
      </div>
    ),
    story: (
      <p>这套「最优停止」理论在现实中被广泛套用:租房旺季看房(看过头 37% 的房源后果断下手)、卖房接 offer、甚至天文学家开普勒 1611 年丧偶后系统性地面试了 11 位续弦候选人——他记录详尽,后来被数学家当成秘书问题的活案例反复分析。它也是「过早承诺 vs 过度挑剔」的定量解:before 37% 下手太早,after 拖太久最佳早已被别人签走。人生很多只许一次的选择,数学给的建议是:先看三分之一,再全力出手。</p>
    ),
  },
};

export default def;
