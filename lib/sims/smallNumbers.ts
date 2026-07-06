// 小数定律(医院问题):小医院每天 15 个新生儿,大医院 45 个。
// 哪家更常出现"某天男婴超过 60%"?——样本越小,越容易极端。
export const HOSPITAL_PARAMS = { smallBirths: 15, largeBirths: 45, threshold: 0.6 };

export interface SmallNumbersResult {
  days: number;
  smallExtremeDays: number;
  largeExtremeDays: number;
}

export function runSmallNumbers(days: number, rand: () => number = Math.random): SmallNumbersResult {
  const { smallBirths, largeBirths, threshold } = HOSPITAL_PARAMS;
  let smallExtremeDays = 0;
  let largeExtremeDays = 0;
  for (let d = 0; d < days; d++) {
    let bs = 0;
    for (let i = 0; i < smallBirths; i++) if (rand() < 0.5) bs++;
    let bl = 0;
    for (let i = 0; i < largeBirths; i++) if (rand() < 0.5) bl++;
    if (bs / smallBirths > threshold) smallExtremeDays++;
    if (bl / largeBirths > threshold) largeExtremeDays++;
  }
  return { days, smallExtremeDays, largeExtremeDays };
}

/** 精确二项概率 P(X/n > threshold) */
export function extremeDayTheory(n: number, threshold: number): number {
  // 累加 P(X=k), k > n*threshold
  const logFact: number[] = [0];
  for (let i = 1; i <= n; i++) logFact.push(logFact[i - 1] + Math.log(i));
  let p = 0;
  for (let k = Math.floor(n * threshold) + 1; k <= n; k++) {
    const logC = logFact[n] - logFact[k] - logFact[n - k];
    p += Math.exp(logC + n * Math.log(0.5));
  }
  return p;
}
