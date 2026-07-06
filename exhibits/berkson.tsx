"use client";

import { useCallback } from "react";
import type { ExhibitDef, SimulatorProps } from "./types";
import { runBerkson, BerksonResult, BERKSON_THRESHOLD } from "@/lib/sims/berkson";
import { useChunkedSim, useCompletionReport } from "@/components/sim/useChunkedSim";
import { RunButton, BigStat } from "@/components/sim/ui";

// 相关系数不便增量合并,采用递增样本量整体重算
const SIZES = Array.from({ length: 40 }, (_, i) => Math.round(1000 + ((60000 - 1000) * (i + 1)) / 40));

function Scatter({ pts, highlight }: { pts: [number, number][]; highlight?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="aspect-square w-full rounded bg-black/40">
      <line x1={BERKSON_THRESHOLD * 100 - 100} y1="0" x2="100" y2={BERKSON_THRESHOLD * 100 - 100} stroke="var(--color-line)" strokeDasharray="3 3" transform="scale(1,-1) translate(0,-100)" />
      {pts.slice(0, 500).map((p, i) => (
        <circle key={i} cx={p[0] * 100} cy={100 - p[1] * 100} r="0.9" fill={highlight ? "var(--color-brass-2)" : "var(--color-dim)"} opacity="0.6" />
      ))}
    </svg>
  );
}

function Simulator({ onFirstComplete }: SimulatorProps) {
  const init: BerksonResult & { step: number } = {
    n: 0, corrAll: 0, corrSelected: 0, selected: 0, pointsAll: [], pointsSelected: [], step: 0,
  };
  const chunk = useCallback((p: typeof init) => {
    const size = SIZES[Math.min(p.step, SIZES.length - 1)];
    return { ...runBerkson(size), step: p.step + 1 };
  }, []);
  const { state: s, running, done, progress, start } = useChunkedSim(init, chunk, SIZES.length, 50);

  useCompletionReport(
    done,
    () => `全体人群中颜值与演技相关系数 ${s.corrAll.toFixed(3)}(≈0,互不相干),但在出道的明星里相关系数是 ${s.corrSelected.toFixed(2)}——强烈负相关,凭空被"选"出来的。`,
    onFirstComplete
  );

  return (
    <div>
      <p className="mb-4 text-sm text-dim">
        生成 6 万个人,颜值与演技各自独立随机。行业规则:颜值 + 演技足够高(越过虚线)才能出道。分别计算全体和出道者中两者的相关系数。
      </p>
      <RunButton onClick={start} running={running} progress={progress}>海选 6 万人</RunButton>
      {s.n > 0 && (
        <div className="mt-6">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <BigStat label="全体人群 · 相关系数" value={s.corrAll.toFixed(3)} sub={`${s.n.toLocaleString()} 人`} />
            <BigStat label="出道明星 · 相关系数" value={s.corrSelected.toFixed(3)} sub={`${s.selected.toLocaleString()} 人入选`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 text-center text-xs text-dim">全体(横:颜值 纵:演技)</div>
              <Scatter pts={s.pointsAll} />
            </div>
            <div>
              <div className="mb-1 text-center text-xs text-dim">仅出道者</div>
              <Scatter pts={s.pointsSelected} highlight />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const def: ExhibitDef = {
  id: "berkson",
  no: 13,
  hall: "统计厅",
  title: "伯克森悖论",
  teaser: "为什么好看的明星总被说不会演戏?数据说:这锅是选拔机制的。",
  question: "假设在全人类中,颜值和演技完全互不相关。娱乐圈的门槛是「颜值 + 演技」的总分要够高。那么在出道的明星中,颜值和演技的关系会是?",
  options: ["依然不相关——选拔不会凭空制造关系", "正相关——优秀的人处处优秀", "负相关——越好看的越显得不会演"],
  correctIndex: 2,
  Simulator,
  explanation: {
    intuition: (
      <p>门槛是一条斜线:「总分够高」意味着颜值平平的人必须演技爆表才能挤进来,盛世美颜的人演技平平也能出道。把右下和左上的人留下、左下角整片删掉,剩下的点自然排成一条向下的斜带——负相关是被门槛「裁剪」出来的。</p>
    ),
    math: (
      <div className="space-y-2">
        <p>设 X ⊥ Y,条件在事件 S = {`{X + Y > c}`} 上,则 Cov(X, Y | S) &lt; 0:固定和的约束下,X 大就挤占 Y 的空间。本模拟中全体相关系数 ≈ 0,入选者约 −0.5。</p>
        <p>因果图语言:X → S ← Y,S 是「对撞变量」(collider)。对对撞变量做条件化(只看入选者),会在本无关联的 X、Y 之间制造出虚假关联。这也是「对撞偏倚」「入院率偏倚」的统一数学结构。</p>
      </div>
    ),
    story: (
      <p>1946 年流行病学家约瑟夫·伯克森发现:用住院病人做研究,两种疾病之间总能测出诡异的负相关——因为得两种病的都住院了,一种都不得的根本不在医院里。现代版本遍地都是:「好吃的餐厅服务差」(又难吃服务又差的早倒闭了)、「帅的人不靠谱」(帅又靠谱的早就脱单退出了你的可选池)、新冠期间多篇论文声称吸烟保护感染者——用住院样本分析,伯克森在坟墓里摇头。凡是研究对象经过了某道门槛,先画因果图看看门槛是不是对撞变量。</p>
    ),
  },
};

export default def;
