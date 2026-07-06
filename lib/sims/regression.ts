// 均值回归:成绩 = 实力 + 运气。第一次考试的尖子,第二次平均会退步——不是因为骄傲。
export interface RegressionResult {
  n: number;
  popMean: number; // 总体平均分
  topFirstMean: number; // 第一次前 10% 的第一次平均分
  topSecondMean: number; // 同一批人第二次的平均分
}

/** 实力 ~ N(70,10),每次运气 ~ N(0,10) 独立。用 12 个均匀随机数近似正态。 */
export function runRegression(n: number, rand: () => number = Math.random): RegressionResult {
  const gauss = () => {
    let s = 0;
    for (let i = 0; i < 12; i++) s += rand();
    return s - 6; // 近似 N(0,1)
  };
  const talent = new Float64Array(n);
  const t1 = new Float64Array(n);
  const t2 = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    talent[i] = 70 + 10 * gauss();
    t1[i] = talent[i] + 10 * gauss();
    t2[i] = talent[i] + 10 * gauss();
  }
  const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => t1[b] - t1[a]);
  const top = idx.slice(0, Math.max(1, Math.floor(n * 0.1)));
  const mean = (arr: ArrayLike<number>, ids?: number[]) => {
    let s = 0;
    if (ids) {
      for (const i of ids) s += arr[i];
      return s / ids.length;
    }
    for (let i = 0; i < arr.length; i++) s += arr[i];
    return s / arr.length;
  };
  return {
    n,
    popMean: mean(t1),
    topFirstMean: mean(t1, top),
    topSecondMean: mean(t2, top),
  };
}

// 理论:corr(t1,t2)=Var(实力)/(Var(实力)+Var(运气))=0.5,
// 所以 E[t2|t1] = 70 + 0.5*(t1-70):尖子组第二次的期望恰好回一半。
export const REGRESSION_THEORY = { shrink: 0.5 };
