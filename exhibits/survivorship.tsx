"use client";

import { useCallback } from "react";
import type { ExhibitDef, SimulatorProps } from "./types";
import { runSurvivorship, SurvivorshipResult, PLANE_ZONES } from "@/lib/sims/survivorship";
import { useChunkedSim, useCompletionReport } from "@/components/sim/useChunkedSim";
import { RunButton, BarRow, fmtPct } from "@/components/sim/ui";

const TOTAL = 10000;
const STEPS = 50;

function Simulator({ onFirstComplete }: SimulatorProps) {
  const init: SurvivorshipResult = { planes: 0, returned: 0, hitsAll: [0, 0, 0, 0, 0], hitsReturned: [0, 0, 0, 0, 0] };
  const chunk = useCallback((p: SurvivorshipResult): SurvivorshipResult => {
    const r = runSurvivorship(TOTAL / STEPS, 3);
    return {
      planes: p.planes + r.planes,
      returned: p.returned + r.returned,
      hitsAll: p.hitsAll.map((x, i) => x + r.hitsAll[i]),
      hitsReturned: p.hitsReturned.map((x, i) => x + r.hitsReturned[i]),
    };
  }, []);
  const { state: s, running, done, progress, start } = useChunkedSim(init, chunk, STEPS);

  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  const totalRet = sum(s.hitsReturned);
  const totalAll = sum(s.hitsAll);

  useCompletionReport(
    done,
    () => `返航飞机上发动机弹孔只占 ${fmtPct(s.hitsReturned[3] / totalRet)},但全部飞机(含坠毁)实际有 ${fmtPct(s.hitsAll[3] / totalAll)} 的弹孔打在发动机——弹孔少的地方,恰恰是中弹必死的地方。`,
    onFirstComplete
  );

  return (
    <div>
      <p className="mb-4 text-sm text-dim">
        派出 1 万架轰炸机,每架随机中弹 3 处(按部位面积分布)。打中发动机、驾驶舱的大概率坠毁。对比「机务只能看到的返航飞机」与「上帝视角的全部飞机」的弹孔分布。
      </p>
      <RunButton onClick={start} running={running} progress={progress}>派出 1 万架飞机</RunButton>
      {s.planes > 0 && (
        <div className="mt-6">
          <div className="mb-4 font-mono text-sm text-dim">
            已出击 {s.planes.toLocaleString()} 架,返航 {s.returned.toLocaleString()} 架({fmtPct(s.returned / s.planes)})
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-sm text-cream">返航飞机的弹孔(机务看到的)</div>
              {PLANE_ZONES.map((z, i) => (
                <BarRow key={z} label={z} frac={totalRet ? s.hitsReturned[i] / totalRet : 0} text={fmtPct(totalRet ? s.hitsReturned[i] / totalRet : 0)} />
              ))}
            </div>
            <div>
              <div className="mb-2 text-sm text-cream">全部飞机的真实中弹(上帝视角)</div>
              {PLANE_ZONES.map((z, i) => (
                <BarRow key={z} label={z} frac={totalAll ? s.hitsAll[i] / totalAll : 0} text={fmtPct(totalAll ? s.hitsAll[i] / totalAll : 0)} color="var(--color-wrong)" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const def: ExhibitDef = {
  id: "survivorship",
  no: 4,
  hall: "统计厅",
  title: "幸存者偏差",
  teaser: "返航的轰炸机浑身弹孔,唯独发动机干干净净。该给哪里加装甲?",
  question: "二战时统计返航轰炸机的弹孔:机翼、机身密密麻麻,发动机和驾驶舱几乎没有。要加固装甲,应该加在哪?",
  options: ["加在机翼机身——弹孔多,说明最常挨打", "加在发动机驾驶舱——弹孔少的地方另有隐情", "平均加,数据看不出倾向"],
  correctIndex: 1,
  Simulator,
  explanation: {
    intuition: (
      <p>你看到的只是<b>活着回来</b>的飞机。发动机上没弹孔,不是因为那儿不挨打,而是因为发动机挨了打的飞机压根没能回来给你数弹孔。数据不会说谎,但会缺席。</p>
    ),
    math: (
      <div className="space-y-2">
        <p>这是一个条件分布的问题:你观察到的是 P(弹孔位置 | 返航),想要的却是 P(弹孔位置)。两者之间差一个「生还率」权重:</p>
        <p>P(位置 z | 返航) ∝ P(位置 z) × P(该处中弹仍生还)。要害部位生还率低,它在返航样本中的占比就被系统性压低——模拟里发动机的真实中弹占比约 12%,返航样本里被压到只剩零头。</p>
        <p>正确推断要把选择机制建进模型里:弹孔最稀疏的部位,恰是致死率最高的部位。</p>
      </div>
    ),
    story: (
      <p>这正是统计学家亚伯拉罕·沃尔德 1943 年在哥伦比亚大学统计研究小组给出的著名建议:军方想加固弹孔密集处,沃尔德说反了,该加固没有弹孔的地方。今天它换了马甲继续坑人:「成功人士都辍学」(辍学失败的人没有传记)、「老房子质量就是好」(塌了的老房子你看不见)、「我们的用户满意度 95%」(不满意的早卸载了,不会来填问卷)。凡是只统计幸存者的数据,先问一句:死者呢?</p>
    ),
  },
};

export default def;
