"use client";

import { useCallback } from "react";
import type { ExhibitDef, SimulatorProps } from "./types";
import { runWaitingTime, WaitingTimeResult, BUS_MEAN_GAP } from "@/lib/sims/waitingTime";
import { useChunkedSim, useCompletionReport } from "@/components/sim/useChunkedSim";
import { RunButton, BigStat } from "@/components/sim/ui";

const TOTAL = 50000;
const STEPS = 50;

interface S {
  riders: number;
  totalWait: number;
  totalGapSeen: number;
  gapSum: number;
  gapN: number;
}

function Simulator({ onFirstComplete }: SimulatorProps) {
  const init: S = { riders: 0, totalWait: 0, totalGapSeen: 0, gapSum: 0, gapN: 0 };
  const chunk = useCallback((p: S): S => {
    const r: WaitingTimeResult = runWaitingTime(TOTAL / STEPS);
    return {
      riders: p.riders + r.riders,
      totalWait: p.totalWait + r.totalWait,
      totalGapSeen: p.totalGapSeen + r.totalGapSeen,
      gapSum: p.gapSum + r.meanGapAllBuses,
      gapN: p.gapN + 1,
    };
  }, []);
  const { state: s, running, done, progress, start } = useChunkedSim(init, chunk, STEPS);

  useCompletionReport(
    done,
    () => `时刻表上平均班距确实是 ${(s.gapSum / s.gapN).toFixed(1)} 分钟,但乘客平均等了 ${(s.totalWait / s.riders).toFixed(1)} 分钟——不是 5 分钟,是整整一班的时间。`,
    onFirstComplete
  );

  return (
    <div>
      <p className="mb-4 text-sm text-dim">
        公交按泊松流发车(平均 10 分钟一班,但有疏有密)。撒下 5 万名随机时刻到站的乘客,统计他们的实际等待,以及他们各自落入的那个班距有多长。
      </p>
      <RunButton onClick={start} running={running} progress={progress}>派 5 万名乘客去等车</RunButton>
      {s.riders > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <BigStat label="时刻表平均班距" value={`${s.gapN ? (s.gapSum / s.gapN).toFixed(1) : "—"} 分钟`} sub="全部班次统计" />
          <BigStat label="乘客平均等待" value={`${(s.totalWait / s.riders).toFixed(1)} 分钟`} sub="理论值 10 分钟" />
          <BigStat label="乘客眼中的平均班距" value={`${(s.totalGapSeen / s.riders).toFixed(1)} 分钟`} sub="理论值 20 分钟" />
        </div>
      )}
    </div>
  );
}

const def: ExhibitDef = {
  id: "waiting-time",
  no: 15,
  hall: "决策厅",
  title: "等车悖论(检验悖论)",
  teaser: "公交平均 10 分钟一班,你却总感觉等了 10 分钟以上。不是错觉。",
  question: "公交车平均每 10 分钟一班,但发车间隔时密时疏(随机)。你在随机时刻走到站台,平均要等多久?",
  options: ["5 分钟——平均班距的一半,对半开", "7 分钟左右", "10 分钟——和整个班距一样长", "超过 15 分钟"],
  correctIndex: 2,
  Simulator,
  explanation: {
    intuition: (
      <p>你不是随机掉进「某一班」,而是随机掉进「某一段时间」——而长的班距占据了更多的时间。20 分钟的大空窗抓住你的概率是 2 分钟小空窗的 10 倍。你总是更容易掉进长空窗,所以等待比想象的长。</p>
    ),
    math: (
      <div className="space-y-2">
        <p>随机到达的乘客落入某班距的概率与其<b>长度成正比</b>(长度偏置抽样)。乘客体验到的班距期望 = E[L²]/E[L],比 E[L] 多出一项方差:E[L²]/E[L] = E[L] + Var(L)/E[L]。</p>
        <p>泊松发车时班距服从指数分布,Var = E[L]²,于是体验班距 = 2×10 = 20 分钟;落点在班距内均匀,平均等待 = 10 分钟——恰好等于全部班距的平均,而非一半。这也是指数分布「无记忆性」的另一面:等了 5 分钟后,期望剩余等待仍是 10 分钟。</p>
        <p>只有班距分毫不差(方差为 0)时,平均等待才是 5 分钟。方差越大,等待越久。</p>
      </div>
    ),
    story: (
      <p>它的学名是「检验悖论」(inspection paradox),出没之处远超公交站:调查「你们班多少人」时算出的平均班级人数总是偏大——大班的学生人数多,被抽中的概率也大;「朋友悖论」——你的朋友平均比你朋友多,因为社交达人更容易出现在别人的朋友列表里;健身房做会员调查会高估平均使用频率(常来的人才被问得到)。运营公交的人也从中学到:降低「等待体验」的关键不是加密班次,而是把班距的<b>方差</b>压下去——准点比高频更能安抚站台上的人心。</p>
    ),
  },
};

export default def;
