"use client";

import { useCallback } from "react";
import type { ExhibitDef, SimulatorProps } from "./types";
import { runMontyHall, MontyHallResult } from "@/lib/sims/montyHall";
import { useChunkedSim, useCompletionReport } from "@/components/sim/useChunkedSim";
import { RunButton, BarRow, fmtPct } from "@/components/sim/ui";

const TOTAL = 3000;
const STEPS = 60;

function Simulator({ onFirstComplete }: SimulatorProps) {
  const init: MontyHallResult = { trials: 0, switchWins: 0, stayWins: 0 };
  const chunk = useCallback((p: MontyHallResult): MontyHallResult => {
    const r = runMontyHall(TOTAL / STEPS);
    return { trials: p.trials + r.trials, switchWins: p.switchWins + r.switchWins, stayWins: p.stayWins + r.stayWins };
  }, []);
  const { state: s, running, done, progress, start } = useChunkedSim(init, chunk, STEPS);

  const begin = () => start();
  useCompletionReport(
    done,
    () => `换门赢了 ${fmtPct(s.switchWins / s.trials)},不换只赢 ${fmtPct(s.stayWins / s.trials)}——换门的胜率整整高一倍。`,
    onFirstComplete
  );

  return (
    <div>
      <p className="mb-4 text-sm text-dim">
        每一局:汽车随机藏进三扇门,你随机选一扇,主持人(知道答案)打开一扇有山羊的门。我们同时记录「坚持不换」和「换到另一扇」两种策略的胜负。
      </p>
      <RunButton onClick={begin} running={running} progress={progress}>玩 3000 局</RunButton>
      {s.trials > 0 && (
        <div className="mt-6">
          <div className="mb-2 font-mono text-sm text-dim">已进行 {s.trials.toLocaleString()} 局</div>
          <BarRow label="换门 · 胜率" frac={s.switchWins / s.trials} text={fmtPct(s.switchWins / s.trials)} refLine={2 / 3} />
          <BarRow label="不换 · 胜率" frac={s.stayWins / s.trials} text={fmtPct(s.stayWins / s.trials)} color="var(--color-wrong)" refLine={1 / 3} />
          <p className="mt-2 text-xs text-dim">细白线为理论值(66.7% / 33.3%)</p>
        </div>
      )}
    </div>
  );
}

const def: ExhibitDef = {
  id: "monty-hall",
  no: 1,
  hall: "概率厅",
  title: "蒙提霍尔问题",
  teaser: "你确定换门没用?连数学教授都为此吵翻过天。",
  question: "三扇门,一扇后面是汽车。你选了 1 号门,主持人(知道汽车在哪)打开了 3 号门——是只山羊。现在给你机会换到 2 号门。换,还是不换?",
  options: ["换不换无所谓,反正剩两扇门,各 50%", "应该换,换了赢面更大", "不该换,第一感觉往往是对的"],
  correctIndex: 1,
  Simulator,
  explanation: {
    intuition: (
      <p>你最初选中汽车的概率只有 1/3——这件事不会因为主持人开了一扇门而改变。所以「汽车在另外两扇门里」的 2/3 概率,在山羊门被排除后,全部灌进了剩下那一扇。换门,就是用 1/3 换 2/3。</p>
    ),
    math: (
      <div className="space-y-2">
        <p>设你初选是 1 号门。P(车在 1 号) = 1/3,P(车在 2 或 3 号) = 2/3。</p>
        <p>关键在于主持人不是随机开门:他<b>永远只开有山羊的门</b>。当车在 2 号时他必开 3 号,车在 3 号时他必开 2 号——他的动作把 2/3 的概率完整地"搬运"到了那扇没开的门上。</p>
        <p>形式化:P(车在 2 号 | 主持人开 3 号) = P(开 3 号 | 车在 2 号)·P(车在 2 号) / P(开 3 号) = (1 × 1/3) / (1/2) = 2/3。</p>
        <p>模拟里你也看到了:换门胜率收敛到 66.7%,不换 33.3%。</p>
      </div>
    ),
    story: (
      <p>1990 年,专栏作家玛丽莲·沃斯·莎凡特在《Parade》上给出"应该换"的答案后,收到了上万封抗议信,其中近千封来自拥有博士学位的读者,不乏数学教授言辞激烈地要求她"承认错误,挽救公众的数学素养"。连传奇数学家保罗·埃尔德什都不服,直到有人给他跑了一遍计算机模拟——和你刚才做的一模一样——他才闭嘴。直觉的顽固,可见一斑。</p>
    ),
  },
};

export default def;
