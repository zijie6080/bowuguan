"use client";

import { useCallback } from "react";
import type { ExhibitDef, SimulatorProps } from "./types";
import { runBenford, BenfordResult, benfordTheory } from "@/lib/sims/benford";
import { useChunkedSim, useCompletionReport } from "@/components/sim/useChunkedSim";
import { RunButton, BarRow, fmtPct } from "@/components/sim/ui";

const TOTAL = 20000;
const STEPS = 50;
const THEORY = benfordTheory();

function Simulator({ onFirstComplete }: SimulatorProps) {
  const init: BenfordResult = { samples: 0, digitCounts: new Array(9).fill(0) };
  const chunk = useCallback((p: BenfordResult): BenfordResult => {
    const r = runBenford(TOTAL / STEPS);
    return { samples: p.samples + r.samples, digitCounts: p.digitCounts.map((x, i) => x + r.digitCounts[i]) };
  }, []);
  const { state: s, running, done, progress, start } = useChunkedSim(init, chunk, STEPS);

  useCompletionReport(
    done,
    () => `首位是 1 的占 ${fmtPct(s.digitCounts[0] / s.samples)},首位是 9 的只占 ${fmtPct(s.digitCounts[8] / s.samples)}——差了 6 倍多,一点都不均匀。`,
    onFirstComplete
  );

  return (
    <div>
      <p className="mb-4 text-sm text-dim">
        生成 2 万个「自然生长」的数:随机本金经历几十期随机涨跌(复利),取最终数值的首位数字。就像现实中的公司营收、城市人口、河流长度。
      </p>
      <RunButton onClick={start} running={running} progress={progress}>生成 2 万个数</RunButton>
      {s.samples > 0 && (
        <div className="mt-6">
          <div className="mb-2 font-mono text-sm text-dim">已统计 {s.samples.toLocaleString()} 个数的首位数字</div>
          {s.digitCounts.map((c, i) => (
            <BarRow key={i} label={`首位是 ${i + 1}`} frac={(c / s.samples) / 0.35} text={fmtPct(c / s.samples)} refLine={THEORY[i] / 0.35} />
          ))}
          <p className="mt-2 text-xs text-dim">细白线为本福特定律理论值 log₁₀(1+1/d);均匀分布应是每条 11.1%</p>
        </div>
      )}
    </div>
  );
}

const def: ExhibitDef = {
  id: "benford",
  no: 5,
  hall: "统计厅",
  title: "本福特定律",
  teaser: "随手翻一本账,数字开头是 1 还是 9,居然能查出做假账的人。",
  question: "把全世界公司的营收、城市人口、河流长度这些自然形成的数摆在一起,看第一位数字(1~9)。它们出现的频率会是什么样?",
  options: ["基本均匀,每个数字约 11%", "1 最多,占 30% 左右,9 最少不到 5%", "中间的 4、5、6 最多,两头少", "完全随机,每次统计都不一样"],
  correctIndex: 1,
  Simulator,
  explanation: {
    intuition: (
      <p>自然的量靠「按比例生长」:从 100 涨到 200 要翻整整一倍,首位才从 1 变成 2;可从 900 到 1000,只需再涨 11%,首位就又回到了 1。数字 1 统治着每个数量级里最长的那段路。</p>
    ),
    math: (
      <div className="space-y-2">
        <p>乘性增长的量,其对数在数轴上近似均匀分布。首位是 d ⟺ log₁₀(x) 的小数部分落在 [log₁₀d, log₁₀(d+1))。</p>
        <p>于是 P(首位 = d) = log₁₀(1 + 1/d):d=1 时 30.1%,d=2 时 17.6%,一路递减到 d=9 的 4.6%。</p>
        <p>关键条件是数据跨越多个数量级、由乘性过程生成。人为编造的数字(以及电话号码、身高这类窄范围数据)不满足条件,于是露馅。</p>
      </div>
    ),
    story: (
      <p>美国的法务会计师用本福特定律筛查报税单和公司账目:编假数的人凭直觉把各数字写得「均匀随机」,首位分布立刻偏离本福特曲线。安然公司倒闭前的财报数字、2009 年伊朗大选的投票数据,都曾被研究者用这条定律揪出异常。希腊加入欧元区时提交的宏观经济数据,事后也被学者检出对本福特定律的显著偏离——那些数字后来果然被证实修饰过。</p>
    ),
  },
};

export default def;
