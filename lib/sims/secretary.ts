// 秘书问题:100 位候选人依次出现,拒了就不能回头。
// 最优策略:先看完前 37% 只观察不选,之后遇到"比前面都好"的立刻定下。成功率约 37.1%。
export const SECRETARY_N = 100;

export interface SecretaryResult {
  trials: number;
  strategyWins: number; // 37% 法则选中"全场最佳"的次数
  randomWins: number; // 瞎选一个选中最佳的次数
}

export function runSecretary(
  trials: number,
  n: number = SECRETARY_N,
  cutoff: number = Math.round(n / Math.E),
  rand: () => number = Math.random
): SecretaryResult {
  let strategyWins = 0;
  let randomWins = 0;
  const perm = new Array<number>(n);
  for (let t = 0; t < trials; t++) {
    // Fisher–Yates 洗出候选人质量的随机排列(0..n-1,n-1 为最佳)
    for (let i = 0; i < n; i++) perm[i] = i;
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    // 37% 法则
    let bestSeen = -1;
    for (let i = 0; i < cutoff; i++) if (perm[i] > bestSeen) bestSeen = perm[i];
    let picked = perm[n - 1]; // 一直没遇到更好的就只能要最后一位
    for (let i = cutoff; i < n; i++) {
      if (perm[i] > bestSeen) {
        picked = perm[i];
        break;
      }
    }
    if (picked === n - 1) strategyWins++;
    // 对照:随机选
    if (perm[Math.floor(rand() * n)] === n - 1) randomWins++;
  }
  return { trials, strategyWins, randomWins };
}

/** 理论成功率:(r/n)·Σ_{i=r}^{n-1} 1/i,r 为观察期长度 */
export function secretaryTheory(n = SECRETARY_N, cutoff = Math.round(n / Math.E)): number {
  let s = 0;
  for (let i = cutoff; i < n; i++) s += 1 / i;
  return (cutoff / n) * s;
}
