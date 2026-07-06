import { describe, it, expect } from "vitest";
import { runMontyHall, MONTY_THEORY } from "@/lib/sims/montyHall";
import { runBirthday, birthdayTheory } from "@/lib/sims/birthday";
import { runSimpson, simpsonTheoryOverall, SIMPSON_PARAMS } from "@/lib/sims/simpson";
import { runSurvivorship, SURVIVOR_PARAMS } from "@/lib/sims/survivorship";
import { runBenford, benfordTheory, firstDigit } from "@/lib/sims/benford";
import { runGambler } from "@/lib/sims/gambler";
import { runRegression } from "@/lib/sims/regression";
import { runBaseRate, baseRateTheory } from "@/lib/sims/baseRate";
import { runSmallNumbers, extremeDayTheory, HOSPITAL_PARAMS } from "@/lib/sims/smallNumbers";
import { runCoinPattern, COIN_PATTERN_THEORY } from "@/lib/sims/coinPatterns";
import { runSecretary, secretaryTheory } from "@/lib/sims/secretary";
import { runTwoChildren, TWO_CHILDREN_THEORY } from "@/lib/sims/twoChildren";
import { runBerkson } from "@/lib/sims/berkson";
import { runTwoEnvelopes } from "@/lib/sims/twoEnvelopes";
import { runWaitingTime, WAITING_THEORY, BUS_MEAN_GAP } from "@/lib/sims/waitingTime";

// 简单可复现的 LCG,让测试不因偶发波动闪烁
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

describe("蒙提霍尔", () => {
  it("换门赢率收敛到 2/3,不换收敛到 1/3", () => {
    const r = runMontyHall(200_000, makeRng(1));
    expect(r.switchWins / r.trials).toBeCloseTo(MONTY_THEORY.switchWin, 2);
    expect(r.stayWins / r.trials).toBeCloseTo(MONTY_THEORY.stayWin, 2);
    expect(r.switchWins + r.stayWins).toBe(r.trials);
  });
});

describe("生日悖论", () => {
  it("23 人同生日概率 ≈ 50.7%", () => {
    const theory = birthdayTheory(23);
    expect(theory).toBeCloseTo(0.5073, 3);
    const r = runBirthday(100_000, 23, makeRng(2));
    expect(r.collisions / r.trials).toBeCloseTo(theory, 2);
  });
  it("50 人 ≈ 97%", () => {
    const r = runBirthday(50_000, 50, makeRng(3));
    expect(r.collisions / r.trials).toBeCloseTo(birthdayTheory(50), 2);
  });
});

describe("辛普森悖论", () => {
  it("分组 A 均更优,合计 B 反超,与理论一致", () => {
    const r = runSimpson(500_000, makeRng(4));
    const rate = (s: number, t: number) => s / t;
    // 分组:A 均高于 B
    expect(rate(r.small.aSuccess, r.small.aTreated)).toBeGreaterThan(rate(r.small.bSuccess, r.small.bTreated));
    expect(rate(r.large.aSuccess, r.large.aTreated)).toBeGreaterThan(rate(r.large.bSuccess, r.large.bTreated));
    // 合计:B 高于 A
    const aAll = rate(r.small.aSuccess + r.large.aSuccess, r.small.aTreated + r.large.aTreated);
    const bAll = rate(r.small.bSuccess + r.large.bSuccess, r.small.bTreated + r.large.bTreated);
    expect(bAll).toBeGreaterThan(aAll);
    const th = simpsonTheoryOverall();
    expect(aAll).toBeCloseTo(th.a, 2);
    expect(bAll).toBeCloseTo(th.b, 2);
    // 分组成功率收敛到参数值
    expect(rate(r.small.aSuccess, r.small.aTreated)).toBeCloseTo(SIMPSON_PARAMS.successA.small, 2);
  });
});

describe("幸存者偏差", () => {
  it("返航飞机的要害部位弹孔占比远低于全体真实占比", () => {
    const r = runSurvivorship(200_000, 3, makeRng(5));
    const total = (a: number[]) => a.reduce((s, x) => s + x, 0);
    // 全部飞机各部位中弹占比 ≈ 命中概率
    const allFrac = r.hitsAll.map((h) => h / total(r.hitsAll));
    SURVIVOR_PARAMS.hitProb.forEach((p, i) => expect(allFrac[i]).toBeCloseTo(p, 2));
    // 返航样本中发动机、驾驶舱占比被严重低估
    const retFrac = r.hitsReturned.map((h) => h / total(r.hitsReturned));
    expect(retFrac[3]).toBeLessThan(allFrac[3] * 0.5);
    expect(retFrac[4]).toBeLessThan(allFrac[4] * 0.5);
    // 机翼占比被高估
    expect(retFrac[0]).toBeGreaterThan(allFrac[0]);
  });
});

describe("本福特定律", () => {
  it("firstDigit 正确", () => {
    expect(firstDigit(123)).toBe(1);
    expect(firstDigit(0.0092)).toBe(9);
    expect(firstDigit(7)).toBe(7);
  });
  it("增长型数据首位数字逼近 log10(1+1/d)", () => {
    const r = runBenford(200_000, makeRng(6));
    const th = benfordTheory();
    for (let d = 0; d < 9; d++) {
      expect(r.digitCounts[d] / r.samples).toBeCloseTo(th[d], 1.5);
    }
    // 数字 1 明显多于均匀分布的 1/9
    expect(r.digitCounts[0] / r.samples).toBeGreaterThan(0.25);
  });
});

describe("赌徒谬误", () => {
  it("连续 5 个正面后,下一次仍约 50% 正面", () => {
    const r = runGambler(3_000_000, 5, makeRng(7));
    expect(r.streaksFound).toBeGreaterThan(10_000);
    expect(r.nextHeads / r.streaksFound).toBeCloseTo(0.5, 2);
  });
});

describe("均值回归", () => {
  it("第一次前 10% 的人第二次平均回落约一半", () => {
    const r = runRegression(200_000, makeRng(8));
    const gap1 = r.topFirstMean - r.popMean;
    const gap2 = r.topSecondMean - r.popMean;
    expect(gap1).toBeGreaterThan(10); // 尖子组确实拔尖
    expect(gap2 / gap1).toBeCloseTo(0.5, 1); // 回归一半(corr = 0.5)
  });
});

describe("基率谬误", () => {
  it("阳性者真患病比例 ≈ 1.9%", () => {
    const th = baseRateTheory();
    expect(th).toBeCloseTo(0.0194, 3);
    const r = runBaseRate(2_000_000, makeRng(9));
    expect(r.truePositives / r.positives).toBeCloseTo(th, 2);
  });
});

describe("小数定律(医院问题)", () => {
  it("小医院极端日比例更高,且各自逼近精确二项概率", () => {
    const { smallBirths, largeBirths, threshold } = HOSPITAL_PARAMS;
    const thSmall = extremeDayTheory(smallBirths, threshold);
    const thLarge = extremeDayTheory(largeBirths, threshold);
    expect(thSmall).toBeGreaterThan(thLarge * 2);
    const r = runSmallNumbers(200_000, makeRng(10));
    expect(r.smallExtremeDays / r.days).toBeCloseTo(thSmall, 2);
    expect(r.largeExtremeDays / r.days).toBeCloseTo(thLarge, 2);
  });
});

describe("硬币模式等待时间", () => {
  it("HHT 平均 8 次,HTH 平均 10 次", () => {
    const a = runCoinPattern(200_000, "HHT", makeRng(11));
    const b = runCoinPattern(200_000, "HTH", makeRng(12));
    expect(a.totalFlips / a.runs).toBeCloseTo(COIN_PATTERN_THEORY.HHT, 1);
    expect(b.totalFlips / b.runs).toBeCloseTo(COIN_PATTERN_THEORY.HTH, 1);
  });
});

describe("秘书问题", () => {
  it("37% 法则成功率 ≈ 37.1%,随机选 ≈ 1%", () => {
    const th = secretaryTheory();
    expect(th).toBeCloseTo(0.371, 2);
    const r = runSecretary(100_000, undefined, undefined, makeRng(13));
    expect(r.strategyWins / r.trials).toBeCloseTo(th, 2);
    expect(r.randomWins / r.trials).toBeCloseTo(0.01, 2);
  });
});

describe("两个孩子问题", () => {
  it("已知至少一个男孩,两个男孩概率 ≈ 1/3", () => {
    const r = runTwoChildren(1_000_000, makeRng(14));
    expect(r.atLeastOneBoy / r.families).toBeCloseTo(0.75, 2);
    expect(r.twoBoys / r.atLeastOneBoy).toBeCloseTo(TWO_CHILDREN_THEORY, 2);
  });
});

describe("伯克森悖论", () => {
  it("全体不相关,入选者显著负相关", () => {
    const r = runBerkson(300_000, makeRng(15));
    expect(Math.abs(r.corrAll)).toBeLessThan(0.02);
    expect(r.corrSelected).toBeLessThan(-0.3);
  });
});

describe("双信封问题", () => {
  it("总换与不换的长期收益相同(比值 → 1)", () => {
    const r = runTwoEnvelopes(1_000_000, makeRng(16));
    expect(r.switchTotal / r.stayTotal).toBeCloseTo(1, 2);
    expect(r.stayTotal / r.rounds).toBeCloseTo(75.75, 0);
  });
});

describe("等车悖论", () => {
  it("平均班距 10 分钟,乘客平均等 10 分钟(不是 5),体感班距 20 分钟", () => {
    const r = runWaitingTime(200_000, makeRng(17));
    expect(r.meanGapAllBuses).toBeCloseTo(BUS_MEAN_GAP, 0);
    expect(r.totalWait / r.riders).toBeCloseTo(WAITING_THEORY.meanWait, 0);
    expect(r.totalGapSeen / r.riders).toBeCloseTo(WAITING_THEORY.riderGap, 0);
  });
});
