// 生日悖论:n 个人中至少两人同生日的概率。
export interface BirthdayResult {
  trials: number;
  collisions: number; // 出现同生日的房间数
}

/** 模拟 trials 个 "n 人房间",统计出现同生日的房间比例。 */
export function runBirthday(trials: number, n: number, rand: () => number = Math.random): BirthdayResult {
  let collisions = 0;
  const seen = new Uint8Array(365);
  for (let t = 0; t < trials; t++) {
    seen.fill(0);
    let hit = false;
    for (let i = 0; i < n; i++) {
      const d = Math.floor(rand() * 365);
      if (seen[d]) {
        hit = true;
        break;
      }
      seen[d] = 1;
    }
    if (hit) collisions++;
  }
  return { trials, collisions };
}

/** 理论值:1 - 365/365 * 364/365 * ... */
export function birthdayTheory(n: number): number {
  let pNo = 1;
  for (let i = 0; i < n; i++) pNo *= (365 - i) / 365;
  return 1 - pNo;
}
