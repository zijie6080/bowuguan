// 等车悖论(检验悖论):公交平均 10 分钟一班(泊松到达),
// 你随机到站,平均要等的不是 5 分钟,而是整整 10 分钟。
export const BUS_MEAN_GAP = 10;

export interface WaitingTimeResult {
  riders: number;
  totalWait: number; // 乘客累计等待(分钟)
  totalGapSeen: number; // 乘客所落入班距的累计长度
  meanGapAllBuses: number; // 时刻表统计的平均班距
}

/** 生成一天长的指数间隔班次,再撒下随机到站的乘客。 */
export function runWaitingTime(riders: number, rand: () => number = Math.random): WaitingTimeResult {
  // 生成足够长的时间线
  const horizon = riders * 2 * BUS_MEAN_GAP + 1000;
  const arrivals: number[] = [];
  let t = 0;
  let gapSum = 0;
  let gapCount = 0;
  while (t < horizon) {
    const gap = -BUS_MEAN_GAP * Math.log(1 - rand()); // Exp(1/10)
    t += gap;
    arrivals.push(t);
    gapSum += gap;
    gapCount++;
  }
  let totalWait = 0;
  let totalGapSeen = 0;
  for (let i = 0; i < riders; i++) {
    const arrive = rand() * (arrivals[arrivals.length - 1] - 1);
    // 二分找下一班
    let lo = 0, hi = arrivals.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (arrivals[mid] > arrive) hi = mid;
      else lo = mid + 1;
    }
    totalWait += arrivals[lo] - arrive;
    const prev = lo === 0 ? 0 : arrivals[lo - 1];
    totalGapSeen += arrivals[lo] - prev;
  }
  return { riders, totalWait, totalGapSeen, meanGapAllBuses: gapSum / gapCount };
}

// 理论:泊松班次下乘客平均等待 = 平均班距 = 10 分钟;乘客眼中的班距期望 = 20 分钟。
export const WAITING_THEORY = { meanWait: BUS_MEAN_GAP, riderGap: 2 * BUS_MEAN_GAP };
