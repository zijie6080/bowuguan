// 辛普森悖论:经典肾结石数据结构。
// 疗法 A(开放手术)在小结石、大结石两组中成功率都更高,但合计成功率反而更低,
// 因为 A 更多被用于难治的大结石。
export interface SimpsonGroup {
  aTreated: number;
  aSuccess: number;
  bTreated: number;
  bSuccess: number;
}
export interface SimpsonResult {
  small: SimpsonGroup;
  large: SimpsonGroup;
}

// 生成过程参数(成功率取自经典 Charig 1986 研究的近似值)
export const SIMPSON_PARAMS = {
  // 病人是小结石的概率
  pSmall: 0.51,
  // 小结石病人被分到 A 疗法的概率(A 多用于重症,轻症多用 B)
  pAgivenSmall: 0.25,
  pAgivenLarge: 0.77,
  successA: { small: 0.93, large: 0.73 },
  successB: { small: 0.87, large: 0.69 },
};

export function runSimpson(patients: number, rand: () => number = Math.random): SimpsonResult {
  const p = SIMPSON_PARAMS;
  const res: SimpsonResult = {
    small: { aTreated: 0, aSuccess: 0, bTreated: 0, bSuccess: 0 },
    large: { aTreated: 0, aSuccess: 0, bTreated: 0, bSuccess: 0 },
  };
  for (let i = 0; i < patients; i++) {
    const small = rand() < p.pSmall;
    const g = small ? res.small : res.large;
    const useA = rand() < (small ? p.pAgivenSmall : p.pAgivenLarge);
    const pSucc = useA
      ? (small ? p.successA.small : p.successA.large)
      : (small ? p.successB.small : p.successB.large);
    const succ = rand() < pSucc;
    if (useA) {
      g.aTreated++;
      if (succ) g.aSuccess++;
    } else {
      g.bTreated++;
      if (succ) g.bSuccess++;
    }
  }
  return res;
}

/** 理论合计成功率 */
export function simpsonTheoryOverall(): { a: number; b: number } {
  const p = SIMPSON_PARAMS;
  // P(成功|A) = Σ P(结石类型|A) * 成功率
  const aSmall = p.pSmall * p.pAgivenSmall;
  const aLarge = (1 - p.pSmall) * p.pAgivenLarge;
  const bSmall = p.pSmall * (1 - p.pAgivenSmall);
  const bLarge = (1 - p.pSmall) * (1 - p.pAgivenLarge);
  return {
    a: (aSmall * p.successA.small + aLarge * p.successA.large) / (aSmall + aLarge),
    b: (bSmall * p.successB.small + bLarge * p.successB.large) / (bSmall + bLarge),
  };
}
