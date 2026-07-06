"use client";

import { useCallback } from "react";
import type { ExhibitDef, SimulatorProps } from "./types";
import { runSmallNumbers, SmallNumbersResult, extremeDayTheory, HOSPITAL_PARAMS } from "@/lib/sims/smallNumbers";
import { useChunkedSim, useCompletionReport } from "@/components/sim/useChunkedSim";
import { RunButton, BarRow, fmtPct } from "@/components/sim/ui";

const TOTAL = 20000;
const STEPS = 50;
const TH_SMALL = extremeDayTheory(HOSPITAL_PARAMS.smallBirths, HOSPITAL_PARAMS.threshold);
const TH_LARGE = extremeDayTheory(HOSPITAL_PARAMS.largeBirths, HOSPITAL_PARAMS.threshold);

function Simulator({ onFirstComplete }: SimulatorProps) {
  const init: SmallNumbersResult = { days: 0, smallExtremeDays: 0, largeExtremeDays: 0 };
  const chunk = useCallback((p: SmallNumbersResult): SmallNumbersResult => {
    const r = runSmallNumbers(TOTAL / STEPS);
    return {
      days: p.days + r.days,
      smallExtremeDays: p.smallExtremeDays + r.smallExtremeDays,
      largeExtremeDays: p.largeExtremeDays + r.largeExtremeDays,
    };
  }, []);
  const { state: s, running, done, progress, start } = useChunkedSim(init, chunk, STEPS);

  useCompletionReport(
    done,
    () => `小医院有 ${fmtPct(s.smallExtremeDays / s.days)} 的日子男婴超 60%,大医院只有 ${fmtPct(s.largeExtremeDays / s.days)}——小样本天生爱走极端。`,
    onFirstComplete
  );

  const scale = 0.35;
  return (
    <div>
      <p className="mb-4 text-sm text-dim">
        两家医院并排运营 2 万天:小医院每天 15 个新生儿,大医院 45 个,男女各半。统计各自「男婴超过 60%」的天数占比。
      </p>
      <RunButton onClick={start} running={running} progress={progress}>运营 2 万天</RunButton>
      {s.days > 0 && (
        <div className="mt-6">
          <div className="mb-2 font-mono text-sm text-dim">已模拟 {s.days.toLocaleString()} 天</div>
          <BarRow label="小医院(每天 15 个)· 极端日占比" frac={s.smallExtremeDays / s.days / scale} text={fmtPct(s.smallExtremeDays / s.days)} refLine={TH_SMALL / scale} />
          <BarRow label="大医院(每天 45 个)· 极端日占比" frac={s.largeExtremeDays / s.days / scale} text={fmtPct(s.largeExtremeDays / s.days)} color="var(--color-dim)" refLine={TH_LARGE / scale} />
          <p className="mt-2 text-xs text-dim">细白线为精确二项概率:{fmtPct(TH_SMALL)} vs {fmtPct(TH_LARGE)}</p>
        </div>
      )}
    </div>
  );
}

const def: ExhibitDef = {
  id: "small-numbers",
  no: 9,
  hall: "统计厅",
  title: "大数定律 vs 小数定律",
  teaser: "全国癌症率最低的县,几乎全是小县城。最高的呢?也是。",
  question: "小医院每天接生 15 个婴儿,大医院 45 个。一年下来,哪家医院「男婴超过 60%」的天数更多?",
  options: ["大医院——人多,出现的怪事也多", "两家差不多——男女比例都是 50%", "小医院——虽然说不清为什么"],
  correctIndex: 2,
  Simulator,
  explanation: {
    intuition: (
      <p>抛 4 次硬币出 3 个正面稀松平常,抛 400 次出 300 个正面近乎不可能。样本越小,离 50% 的「随机晃动」越剧烈。大医院的 45 个婴儿把波动摊平了,小医院没这个待遇。</p>
    ),
    math: (
      <div className="space-y-2">
        <p>男婴比例的标准差 ≈ √(0.25/n):n=15 时约 12.9%,n=45 时约 7.5%。超过 60% 意味着偏离均值 10 个百分点——对小医院不到 1 个标准差,对大医院要 1.3 个以上。</p>
        <p>精确二项计算:P(15 人中男婴 &gt; 60%) = P(X ≥ 10) ≈ {`15.1%`};P(45 人中男婴 &gt; 60%) = P(X ≥ 28) ≈ {`6.8%`}。差出一倍多。</p>
        <p>大数定律只保证大样本收敛;「小样本也该长得像总体」是心理学家戏称的「小数定律」——一个人人都信、但并不存在的定律。</p>
      </div>
    ),
    story: (
      <p>这道医院题出自卡尼曼和特沃斯基 1972 年的经典实验,多数受访者(包括统计学者)答「差不多」。更贵的教训:美国曾依据「小县城肾癌率最低」推动小额医疗拨款,可肾癌率最高的也是小县城——纯粹是小样本波动。盖茨基金会资助过「小规模学校」运动,依据是尖子学校多为小学校;后来发现垫底学校也多为小学校,数亿美元花在了统计噪声上。看到「小而美」的排行榜,先看样本量。</p>
    ),
  },
};

export default def;
