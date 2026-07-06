"use client";

import { useCallback } from "react";
import type { ExhibitDef, SimulatorProps } from "./types";
import { runGambler, GamblerResult } from "@/lib/sims/gambler";
import { useChunkedSim, useCompletionReport } from "@/components/sim/useChunkedSim";
import { RunButton, BarRow, BigStat, fmtPct } from "@/components/sim/ui";

const TOTAL = 1_000_000;
const STEPS = 50;

function Simulator({ onFirstComplete }: SimulatorProps) {
  const init: GamblerResult = { streaksFound: 0, nextHeads: 0 };
  const chunk = useCallback((p: GamblerResult): GamblerResult => {
    const r = runGambler(TOTAL / STEPS, 5);
    return { streaksFound: p.streaksFound + r.streaksFound, nextHeads: p.nextHeads + r.nextHeads };
  }, []);
  const { state: s, running, done, progress, start } = useChunkedSim(init, chunk, STEPS);

  useCompletionReport(
    done,
    () => `找到 ${s.streaksFound.toLocaleString()} 次「连开 5 个正面」,其后一把正面占 ${fmtPct(s.nextHeads / s.streaksFound)}——反面没有半点“该来了”的迹象。`,
    onFirstComplete
  );

  return (
    <div>
      <p className="mb-4 text-sm text-dim">
        抛 100 万次硬币,每当出现「连续 5 次正面」,就记录下一次抛出的结果。看看反面是不是真的「该来了」。
      </p>
      <RunButton onClick={start} running={running} progress={progress}>抛 100 万次硬币</RunButton>
      {s.streaksFound > 0 && (
        <div className="mt-6">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <BigStat label="捕获的 5 连正面" value={s.streaksFound.toLocaleString()} />
            <BigStat label="其后一把仍是正面" value={fmtPct(s.nextHeads / s.streaksFound)} sub="理论值 50%" />
          </div>
          <BarRow label="5 连正面之后 · 下一把正面占比" frac={s.nextHeads / s.streaksFound} text={fmtPct(s.nextHeads / s.streaksFound)} refLine={0.5} />
        </div>
      )}
    </div>
  );
}

const def: ExhibitDef = {
  id: "gambler",
  no: 6,
  hall: "概率厅",
  title: "赌徒谬误",
  teaser: "轮盘连开 5 把红,这把该押黑了吧?蒙特卡洛赌场谢谢你。",
  question: "一枚公平硬币连续抛出了 5 次正面。第 6 次抛出正面的概率是多少?",
  options: ["低于 50%——反面欠了 5 把,该还了", "正好 50%——硬币没有记忆", "高于 50%——正面正当手热"],
  correctIndex: 1,
  Simulator,
  explanation: {
    intuition: (
      <p>硬币没有记忆,也没有账本。「连 5 次正面再接 1 次反面」和「连 6 次正面」的概率一模一样,都是 1/64。让长期比例回到 50% 的从来不是「纠偏」,而是后面海量新抛掷把旧偏差<b>稀释</b>掉。</p>
    ),
    math: (
      <div className="space-y-2">
        <p>独立事件的定义就是 P(第 6 次正面 | 前 5 次全正) = P(正面) = 0.5。模拟里 100 万次抛掷捕获了上万个 5 连正面,后一把正面稳定收敛在 50%。</p>
        <p>大数定律说的是<b>比例</b>收敛:抛 100 万次后正面占比趋近 50%。它对「绝对次数差」没有任何承诺——正反面的次数差反而会随次数增长而波动变大(量级约 √n)。「差额必须还清」是对大数定律最流行的误读。</p>
      </div>
    ),
    story: (
      <p>1913 年 8 月 18 日,蒙特卡洛赌场的轮盘连开了 26 把黑。从第 15 把黑开始,赌客们疯狂加注押红——"红色欠太多了"——一夜之间输掉数百万法郎,这一事件让「赌徒谬误」有了别名「蒙特卡洛谬误」。它的现代变体照样收割:连跌五天的股票「该反弹了」、连生三个女儿「下一胎准是儿子」、彩票买「很久没开出的冷号」。凡是独立事件,过去欠你的,未来一分都不会还。</p>
    ),
  },
};

export default def;
