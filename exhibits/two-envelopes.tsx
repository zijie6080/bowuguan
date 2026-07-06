"use client";

import { useCallback } from "react";
import type { ExhibitDef, SimulatorProps } from "./types";
import { runTwoEnvelopes, TwoEnvelopesResult } from "@/lib/sims/twoEnvelopes";
import { useChunkedSim, useCompletionReport } from "@/components/sim/useChunkedSim";
import { RunButton, BarRow, BigStat } from "@/components/sim/ui";

const TOTAL = 100000;
const STEPS = 50;

function Simulator({ onFirstComplete }: SimulatorProps) {
  const init: TwoEnvelopesResult = { rounds: 0, stayTotal: 0, switchTotal: 0 };
  const chunk = useCallback((p: TwoEnvelopesResult): TwoEnvelopesResult => {
    const r = runTwoEnvelopes(TOTAL / STEPS);
    return {
      rounds: p.rounds + r.rounds,
      stayTotal: p.stayTotal + r.stayTotal,
      switchTotal: p.switchTotal + r.switchTotal,
    };
  }, []);
  const { state: s, running, done, progress, start } = useChunkedSim(init, chunk, STEPS);

  useCompletionReport(
    done,
    () => `10 万轮下来,坚持不换平均每轮拿 ${(s.stayTotal / s.rounds).toFixed(2)} 元,逢信封必换平均拿 ${(s.switchTotal / s.rounds).toFixed(2)} 元——一分钱便宜都没占到。`,
    onFirstComplete
  );

  return (
    <div>
      <p className="mb-4 text-sm text-dim">
        每轮装两个信封:一个的金额是另一个的两倍(底额随机),随机递给你一个。同时记账两种人生:「从来不换」和「每次都换」,跑 10 万轮比较平均所得。
      </p>
      <RunButton onClick={start} running={running} progress={progress}>拆 10 万轮信封</RunButton>
      {s.rounds > 0 && (
        <div className="mt-6">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <BigStat label="从来不换 · 平均每轮" value={(s.stayTotal / s.rounds).toFixed(2)} sub="元" />
            <BigStat label="每次都换 · 平均每轮" value={(s.switchTotal / s.rounds).toFixed(2)} sub="元" />
          </div>
          <BarRow label="换 / 不换 收益比" frac={(s.switchTotal / s.stayTotal) / 2} text={(s.switchTotal / s.stayTotal).toFixed(4)} refLine={0.5} />
          <p className="mt-2 text-xs text-dim">细白线为理论比值 1.0(那个「换了赚 25%」的公式预言这里应该是 1.25)</p>
        </div>
      )}
    </div>
  );
}

const def: ExhibitDef = {
  id: "two-envelopes",
  no: 14,
  hall: "概率厅",
  title: "双信封问题",
  teaser: "「换信封期望多赚 25%」——这个公式看起来无懈可击,但它算错了。",
  question: "两个信封,一个金额是另一个的两倍,随机给你一个。有人推理:「设我手里是 X,另一个要么 2X 要么 X/2,各半,期望 1.25X,所以该换!」每次都换,长期收益会怎样?",
  options: ["确实多赚约 25%,推理没毛病", "多赚一点,但不到 25%", "和不换一模一样,推理有个隐蔽的坑"],
  correctIndex: 2,
  Simulator,
  explanation: {
    intuition: (
      <p>那个公式偷偷让 X 一词二用:说「另一封是 2X」时,X 是较小的金额;说「另一封是 X/2」时,X 又成了较大的金额。同一个字母在一次计算里代表两个不同的量,得出的 1.25X 自然是海市蜃楼。两封信的总额从头到尾没变,换只是换个位置。</p>
    ),
    math: (
      <div className="space-y-2">
        <p>正确算法:设两封为 (Y, 2Y)。你拿到小的或大的各 1/2,期望 = ½·Y + ½·2Y = 1.5Y;换过去期望 = ½·2Y + ½·Y = 1.5Y。完全相等——模拟里比值精确收敛到 1。</p>
        <p>错误公式 E[另一封] = ½·2X + ½·(X/2) = 1.25X 的问题:它假定「无论我手里是多少,另一封更大更小各半」。要让这对<b>所有</b> X 成立,金额的先验分布必须在 (0, ∞) 上「均匀」——这样的分布不存在(不可归一化)。对任何真实的分布,看到手中金额后「是小封」的后验概率不是处处 1/2。</p>
      </div>
    ),
    story: (
      <p>双信封问题在决策论期刊上吵了几十年,连萨缪尔森都下场写过文章。它的现实影子是一切「对称机会看起来稳赚」的错觉:换股票、换基金、换赛道时,人们常做出「我换过去的上涨空间比下跌空间大」的估算——却忘了对面的人用同样的公式也能证明该换到你这边。凡是一个论证对双方同时成立、结论却是「双方都占便宜」,一定有个变量被偷换了定义。查清楚你的 X 到底指什么,是读任何研报前的基本功。</p>
    ),
  },
};

export default def;
