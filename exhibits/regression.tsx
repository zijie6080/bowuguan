"use client";

import { useCallback } from "react";
import type { ExhibitDef, SimulatorProps } from "./types";
import { runRegression, RegressionResult } from "@/lib/sims/regression";
import { useChunkedSim, useCompletionReport } from "@/components/sim/useChunkedSim";
import { RunButton, BigStat } from "@/components/sim/ui";

// 该模拟需要整体排序取前 10%,不宜增量合并;分块时用递增规模重跑
const SIZES = Array.from({ length: 40 }, (_, i) => Math.round(500 + ((20000 - 500) * (i + 1)) / 40));

function Simulator({ onFirstComplete }: SimulatorProps) {
  const init: RegressionResult & { step: number } = { n: 0, popMean: 0, topFirstMean: 0, topSecondMean: 0, step: 0 };
  const chunk = useCallback((p: typeof init) => {
    const size = SIZES[Math.min(p.step, SIZES.length - 1)];
    return { ...runRegression(size), step: p.step + 1 };
  }, []);
  const { state: s, running, done, progress, start } = useChunkedSim(init, chunk, SIZES.length, 50);

  useCompletionReport(
    done,
    () => `第一次考进前 10% 的学生,第一次平均 ${s.topFirstMean.toFixed(1)} 分;第二次没人管他们,平均却掉到了 ${s.topSecondMean.toFixed(1)} 分,吐回了约一半的领先优势。`,
    onFirstComplete
  );

  return (
    <div>
      <p className="mb-4 text-sm text-dim">
        生成 2 万名学生:真实实力固定,每次考试成绩 = 实力 + 当天运气(两次考试的运气互相独立)。选出第一次考试的前 10%,看他们第二次的平均分。
      </p>
      <RunButton onClick={start} running={running} progress={progress}>组织两场考试</RunButton>
      {s.n > 0 && (
        <div className="mt-6">
          <div className="mb-4 font-mono text-sm text-dim">样本 {s.n.toLocaleString()} 人</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <BigStat label="全体平均分" value={s.popMean.toFixed(1)} />
            <BigStat label="尖子组 · 第一次" value={s.topFirstMean.toFixed(1)} sub="第一次考试前 10%" />
            <BigStat label="同一批人 · 第二次" value={s.topSecondMean.toFixed(1)} sub="没批评没表扬,自然回落" />
          </div>
        </div>
      )}
    </div>
  );
}

const def: ExhibitDef = {
  id: "regression",
  no: 7,
  hall: "统计厅",
  title: "均值回归",
  teaser: "表扬完就退步,批评完就进步?你可能冤枉了表扬。",
  question: "两万名学生考两次试(实力不变,每次成绩带点运气)。第一次考进前 10% 的尖子,第二次的平均分会怎样?",
  options: ["和第一次差不多——实力摆在那", "明显回落——但不是因为骄傲", "继续上升——强者恒强"],
  correctIndex: 1,
  Simulator,
  explanation: {
    intuition: (
      <p>第一次考到极端高分的人,多半是「实力不错 + 运气也好」双重加持。第二次运气重新洗牌,实力还在,运气回到平均——分数自然回落。这不是退步,是运气退潮。</p>
    ),
    math: (
      <div className="space-y-2">
        <p>设成绩 = 实力 + 噪声,两者方差相等(本模拟均为 10²)。则两次成绩的相关系数 r = Var(实力)/[Var(实力)+Var(噪声)] = 0.5。</p>
        <p>回归公式:E[第二次 | 第一次] = 均值 + r × (第一次 − 均值)。尖子组第一次高出均值多少,第二次期望只保留其中 50%——模拟里你看到的正是「吐回一半」。</p>
        <p>只要 r &lt; 1(测量含噪声),极端组必然向均值回归。方向反过来也成立:第一次垫底的人,第二次会「自动进步」。</p>
      </div>
    ),
    story: (
      <p>心理学家丹尼尔·卡尼曼在以色列空军讲课时,教官反驳他:「学员被夸后下次必然飞得差,被骂后必然飞得好,可见批评有效表扬有害。」卡尼曼意识到这全是均值回归——飞得极好和极差本就带着运气成分,下一次自然回落或回升,和骂不骂毫无关系。这一顿悟后来写进了《思考,快与慢》。同样的坑:《体育画报》封面魔咒(上封面靠的是巅峰表现,之后必回落)、重金收购去年冠军基金、神药对「病情最重的病人」显示奇效——安慰剂加均值回归就够了。</p>
    ),
  },
};

export default def;
