"use client";

import { useCallback } from "react";
import type { ExhibitDef, SimulatorProps } from "./types";
import { runBirthday, BirthdayResult, birthdayTheory } from "@/lib/sims/birthday";
import { useChunkedSim, useCompletionReport } from "@/components/sim/useChunkedSim";
import { RunButton, BarRow, fmtPct } from "@/components/sim/ui";

const TOTAL = 2000;
const STEPS = 50;
const N = 23;
const THEORY = birthdayTheory(N); // ≈ 0.507

function Simulator({ onFirstComplete }: SimulatorProps) {
  const init: BirthdayResult = { trials: 0, collisions: 0 };
  const chunk = useCallback((p: BirthdayResult): BirthdayResult => {
    const r = runBirthday(TOTAL / STEPS, N);
    return { trials: p.trials + r.trials, collisions: p.collisions + r.collisions };
  }, []);
  const { state: s, running, done, progress, start } = useChunkedSim(init, chunk, STEPS);

  useCompletionReport(
    done,
    () => `2000 个「23 人房间」里,${fmtPct(s.collisions / s.trials)} 出现了同一天生日——大约每两个房间就有一个。`,
    onFirstComplete
  );

  return (
    <div>
      <p className="mb-4 text-sm text-dim">每次随机凑一个 23 人的房间(生日在 365 天中均匀随机),检查有没有两人撞生日。连开 2000 个房间。</p>
      <RunButton onClick={start} running={running} progress={progress}>开 2000 个房间</RunButton>
      {s.trials > 0 && (
        <div className="mt-6">
          <div className="mb-2 font-mono text-sm text-dim">已检查 {s.trials.toLocaleString()} 个房间</div>
          <BarRow label="出现同生日的房间占比" frac={s.collisions / s.trials} text={fmtPct(s.collisions / s.trials)} refLine={THEORY} />
          <p className="mt-2 text-xs text-dim">细白线为理论值 50.7%</p>
        </div>
      )}
    </div>
  );
}

const def: ExhibitDef = {
  id: "birthday",
  no: 2,
  hall: "概率厅",
  title: "生日悖论",
  teaser: "一个班 23 个人,就敢跟你赌有人同一天生日?",
  question: "一个房间里随机来了 23 个人。至少有两人生日是同一天的概率,大概是多少?",
  note: "假设生日在 365 天里均匀分布,不考虑 2 月 29 日。",
  options: ["6% 左右(23/365 那个量级)", "20% 左右", "50% 左右", "80% 以上"],
  correctIndex: 2,
  Simulator,
  explanation: {
    intuition: (
      <p>你直觉算的是「有人和<b>我</b>同生日」,那确实很难。但问题问的是「<b>任意两人</b>撞生日」——23 个人能凑出 253 对组合,每一对都是一次抽奖。买了 253 张彩票,中一次并不稀奇。</p>
    ),
    math: (
      <div className="space-y-2">
        <p>算「谁都不撞」更容易:P(全不同) = 365/365 × 364/365 × … × 343/365 ≈ 49.3%。</p>
        <p>所以 P(至少一对相同) = 1 − 49.3% ≈ <b>50.7%</b>。到 50 人时,这个概率已经是 97%;70 人时 99.9%。</p>
        <p>组合数才是主角:23 人有 C(23,2) = 253 对,概率随对数近似指数逼近 1。</p>
      </div>
    ),
    story: (
      <p>这个效应在密码学里叫「生日攻击」:想找到两份内容不同、哈希值相同的文件,所需的尝试次数不是 2ⁿ 而是大约 2^(n/2)——正是 253 对彩票的逻辑。2017 年谷歌宣布攻破 SHA-1 哈希算法,靠的核心思路就是生日攻击。全世界的证书体系为此连夜搬家。低估「组合爆炸」,连银行的锁都会被撬开。</p>
    ),
  },
};

export default def;
