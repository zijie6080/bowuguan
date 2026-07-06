"use client";

import { useCallback } from "react";
import type { ExhibitDef, SimulatorProps } from "./types";
import { runCoinPattern, COIN_PATTERN_THEORY } from "@/lib/sims/coinPatterns";
import { useChunkedSim, useCompletionReport } from "@/components/sim/useChunkedSim";
import { RunButton, BarRow, BigStat } from "@/components/sim/ui";

const TOTAL = 20000;
const STEPS = 50;

interface S {
  hhtRuns: number;
  hhtFlips: number;
  hthRuns: number;
  hthFlips: number;
}

function Simulator({ onFirstComplete }: SimulatorProps) {
  const init: S = { hhtRuns: 0, hhtFlips: 0, hthRuns: 0, hthFlips: 0 };
  const chunk = useCallback((p: S): S => {
    const a = runCoinPattern(TOTAL / STEPS, "HHT");
    const b = runCoinPattern(TOTAL / STEPS, "HTH");
    return {
      hhtRuns: p.hhtRuns + a.runs,
      hhtFlips: p.hhtFlips + a.totalFlips,
      hthRuns: p.hthRuns + b.runs,
      hthFlips: p.hthFlips + b.totalFlips,
    };
  }, []);
  const { state: s, running, done, progress, start } = useChunkedSim(init, chunk, STEPS);

  useCompletionReport(
    done,
    () => `等到「正正反」平均只要 ${(s.hhtFlips / s.hhtRuns).toFixed(2)} 次,等「正反正」却要 ${(s.hthFlips / s.hthRuns).toFixed(2)} 次——明明出现概率都是 1/8。`,
    onFirstComplete
  );

  return (
    <div>
      <p className="mb-4 text-sm text-dim">
        各做 2 万轮实验:从零开始抛硬币,分别数一数第一次凑齐「正正反」和第一次凑齐「正反正」平均各需要抛多少次。
      </p>
      <RunButton onClick={start} running={running} progress={progress}>各跑 2 万轮</RunButton>
      {s.hhtRuns > 0 && (
        <div className="mt-6">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <BigStat label="等到「正正反」平均需" value={(s.hhtFlips / s.hhtRuns).toFixed(2)} sub={`理论值 ${COIN_PATTERN_THEORY.HHT} 次`} />
            <BigStat label="等到「正反正」平均需" value={(s.hthFlips / s.hthRuns).toFixed(2)} sub={`理论值 ${COIN_PATTERN_THEORY.HTH} 次`} />
          </div>
          <BarRow label="正正反 · 平均等待" frac={s.hhtFlips / s.hhtRuns / 12} text={`${(s.hhtFlips / s.hhtRuns).toFixed(2)} 次`} refLine={8 / 12} />
          <BarRow label="正反正 · 平均等待" frac={s.hthFlips / s.hthRuns / 12} text={`${(s.hthFlips / s.hthRuns).toFixed(2)} 次`} color="var(--color-wrong)" refLine={10 / 12} />
        </div>
      )}
    </div>
  );
}

const def: ExhibitDef = {
  id: "coin-patterns",
  no: 10,
  hall: "概率厅",
  title: "硬币模式的等待时间",
  teaser: "「正正反」和「正反正」概率相同,等到它们的时间却不同——不服来抛。",
  question: "不停抛一枚公平硬币,直到出现目标模式为止。等「正正反」(HHT)和等「正反正」(HTH),平均需要的抛掷次数——",
  note: "任意连抛三次,出现 HHT 和出现 HTH 的概率都是 1/8。",
  options: ["一样长,概率相同等待自然相同", "等 HHT 更快", "等 HTH 更快"],
  correctIndex: 1,
  Simulator,
  explanation: {
    intuition: (
      <p>关键看「失败后能留下多少家底」。等 HHT 时攒到 HH,就算下一把又是 H 也不亏——HH 还在手里,迟早等来 T。等 HTH 时攒到 HT,一旦下一把是 T,前功尽弃得从零再来。会「自我重叠」的模式(HTH 的头尾都是 H)反而更难等。</p>
    ),
    math: (
      <div className="space-y-2">
        <p>用 Conway 首尾重叠法(或鞅方法)可算出平均等待:E[HHT] = <b>8</b> 次,E[HTH] = <b>10</b> 次。HTH 的首尾都是 H,存在长度 1 和 3 的自重叠,等待时间 2³ + 2¹ = 10;HHT 只有长度 3 的平凡重叠,等待 2³ = 8。</p>
        <p>更妙的推论(Penney 游戏):两人各选一个三连模式比谁先出现,这个游戏没有最强模式——任何模式都存在克制它的选择,像石头剪刀布。比如你选 HHT,我选 THH,我赢的概率是 3/4。</p>
      </div>
    ),
    story: (
      <p>「概率相同 ⇒ 等待相同、对赌公平」是量化交易新手的经典亏钱姿势:两个「等概率」的市场形态,等待时间和先后到达的概率结构完全可以不对称。Penney 游戏更是酒吧骗局的常客——庄家让你先挑模式,自己再挑一个克制你的,胜率最高可达 87.5%,而你还以为这是公平游戏。凡是让你「先选」的赌局,先想想蒙提霍尔和 Penney。</p>
    ),
  },
};

export default def;
