"use client";

import { useCallback } from "react";
import type { ExhibitDef, SimulatorProps } from "./types";
import { runTwoChildren, TwoChildrenResult, TWO_CHILDREN_THEORY } from "@/lib/sims/twoChildren";
import { useChunkedSim, useCompletionReport } from "@/components/sim/useChunkedSim";
import { RunButton, BarRow, BigStat, fmtPct } from "@/components/sim/ui";

const TOTAL = 100000;
const STEPS = 50;

function Simulator({ onFirstComplete }: SimulatorProps) {
  const init: TwoChildrenResult = { families: 0, atLeastOneBoy: 0, twoBoys: 0 };
  const chunk = useCallback((p: TwoChildrenResult): TwoChildrenResult => {
    const r = runTwoChildren(TOTAL / STEPS);
    return {
      families: p.families + r.families,
      atLeastOneBoy: p.atLeastOneBoy + r.atLeastOneBoy,
      twoBoys: p.twoBoys + r.twoBoys,
    };
  }, []);
  const { state: s, running, done, progress, start } = useChunkedSim(init, chunk, STEPS);

  useCompletionReport(
    done,
    () => `在 ${s.atLeastOneBoy.toLocaleString()} 个「至少有一个男孩」的家庭里,两个都是男孩的只有 ${fmtPct(s.twoBoys / s.atLeastOneBoy)}——是 1/3,不是 1/2。`,
    onFirstComplete
  );

  return (
    <div>
      <p className="mb-4 text-sm text-dim">
        随机生成 10 万个两孩家庭(每个孩子独立、男女各半),筛出「至少有一个男孩」的家庭,数其中「两个都是男孩」的比例。
      </p>
      <RunButton onClick={start} running={running} progress={progress}>走访 10 万个家庭</RunButton>
      {s.families > 0 && (
        <div className="mt-6">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <BigStat label="两孩家庭" value={s.families.toLocaleString()} />
            <BigStat label="至少一个男孩" value={s.atLeastOneBoy.toLocaleString()} sub={`占 ${fmtPct(s.atLeastOneBoy / s.families)}(理论 75%)`} />
            <BigStat label="其中两个男孩" value={fmtPct(s.atLeastOneBoy ? s.twoBoys / s.atLeastOneBoy : 0)} sub="理论 33.3%" />
          </div>
          <BarRow
            label="「至少一个男孩」家庭中两个男孩的占比"
            frac={s.atLeastOneBoy ? s.twoBoys / s.atLeastOneBoy : 0}
            text={fmtPct(s.atLeastOneBoy ? s.twoBoys / s.atLeastOneBoy : 0)}
            refLine={TWO_CHILDREN_THEORY}
          />
        </div>
      )}
    </div>
  );
}

const def: ExhibitDef = {
  id: "two-children",
  no: 12,
  hall: "概率厅",
  title: "两个孩子问题",
  teaser: "「我有两个孩子,至少一个是男孩」——另一个也是男孩的概率不是 1/2。",
  question: "一位家长有两个孩子。已知其中至少有一个是男孩。两个都是男孩的概率是多少?",
  options: ["1/2——另一个孩子男女各半,天经地义", "1/3", "1/4", "2/3"],
  correctIndex: 1,
  Simulator,
  explanation: {
    intuition: (
      <p>两孩家庭本有四种等可能组合:男男、男女、女男、女女。「至少一个男孩」只踢掉了女女,剩下男男、男女、女男三种各占其一——男男只是三分之一。「至少有一个男孩」说的不是某个特定的孩子,这正是陷阱所在。</p>
    ),
    math: (
      <div className="space-y-2">
        <p>P(两男 | 至少一男) = P(两男) / P(至少一男) = (1/4) / (3/4) = <b>1/3</b>。</p>
        <p>对比另一个问题:「<b>老大</b>是男孩,两个都是男孩的概率?」——这时踢掉的是女男和女女,剩男男、男女各半,答案是 1/2。信息指向「特定孩子」还是「任一孩子」,条件化的集合完全不同。</p>
        <p>更妖的变体:「至少一个男孩<b>且生于星期二</b>」,答案变成 13/27 ≈ 0.481——附加细节改变了被条件化的样本空间,越具体越接近 1/2。</p>
      </div>
    ),
    story: (
      <p>这道题由马丁·加德纳 1959 年在《科学美国人》上发布,随后他自己承认题目表述有歧义(取决于信息是怎么获得的),引发的争论至今没停。它是所有「条件概率写反」bug 的祖师爷:法庭上检察官把 P(证据|无辜) 当成 P(无辜|证据) 用(著名的萨莉·克拉克冤案,母亲因两个孩子相继夭折被误判谋杀),医疗 AI 把「筛选后的数据」当成随机样本训练——都是没想清楚「条件是怎么来的」。</p>
    ),
  },
};

export default def;
