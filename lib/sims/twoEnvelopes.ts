// 双信封问题:一封是另一封的两倍。"换信封期望多赚 25%"的推理是错的——换与不换拿到的钱一样多。
export interface TwoEnvelopesResult {
  rounds: number;
  stayTotal: number; // 坚持不换累计拿到的钱
  switchTotal: number; // 每次都换累计拿到的钱
}

/** 每轮:底额 x 均匀取自 [1,100],两封为 (x, 2x),随机递给你其中一封。 */
export function runTwoEnvelopes(rounds: number, rand: () => number = Math.random): TwoEnvelopesResult {
  let stayTotal = 0;
  let switchTotal = 0;
  for (let i = 0; i < rounds; i++) {
    const x = 1 + rand() * 99;
    const gotSmall = rand() < 0.5;
    const mine = gotSmall ? x : 2 * x;
    const other = gotSmall ? 2 * x : x;
    stayTotal += mine;
    switchTotal += other;
  }
  return { rounds, stayTotal, switchTotal };
}

// 理论:两种策略期望都是 E[1.5x] = 75.75(x~U[1,100]),比值为 1。
export const TWO_ENVELOPES_THEORY = { meanEach: 1.5 * (1 + 100) / 2, ratio: 1 };
