// 基率谬误:罕见病 + 相当准的检测,阳性结果的真实患病率却低得惊人。
export const BASE_RATE_PARAMS = {
  prevalence: 0.001, // 千分之一患病
  sensitivity: 0.99, // 有病时 99% 阳性
  falsePositive: 0.05, // 没病时 5% 假阳性
};

export interface BaseRateResult {
  n: number;
  sick: number;
  positives: number;
  truePositives: number;
}

export function runBaseRate(n: number, rand: () => number = Math.random): BaseRateResult {
  const p = BASE_RATE_PARAMS;
  let sick = 0;
  let positives = 0;
  let truePositives = 0;
  for (let i = 0; i < n; i++) {
    const isSick = rand() < p.prevalence;
    if (isSick) sick++;
    const positive = isSick ? rand() < p.sensitivity : rand() < p.falsePositive;
    if (positive) {
      positives++;
      if (isSick) truePositives++;
    }
  }
  return { n, sick, positives, truePositives };
}

/** 理论:P(病|阳) = 0.99*0.001 / (0.99*0.001 + 0.05*0.999) ≈ 1.94% */
export function baseRateTheory(): number {
  const p = BASE_RATE_PARAMS;
  const tp = p.sensitivity * p.prevalence;
  return tp / (tp + p.falsePositive * (1 - p.prevalence));
}
