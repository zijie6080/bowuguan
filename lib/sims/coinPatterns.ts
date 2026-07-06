// 抛硬币等待时间:等到 HHT 平均要 8 次,等到 HTH 却要 10 次——虽然两者出现概率都是 1/8。
export type CoinPattern = "HHT" | "HTH";

export interface CoinPatternResult {
  runs: number;
  totalFlips: number; // 累计等待的抛掷次数
}

/** 重复 runs 轮:每轮从零开始抛,直到 pattern 首次出现,记录用了几次。 */
export function runCoinPattern(
  runs: number,
  pattern: CoinPattern,
  rand: () => number = Math.random
): CoinPatternResult {
  const target = pattern.split("").map((c) => (c === "H" ? 1 : 0));
  let totalFlips = 0;
  for (let r = 0; r < runs; r++) {
    const buf: number[] = [];
    let flips = 0;
    for (;;) {
      buf.push(rand() < 0.5 ? 1 : 0);
      flips++;
      if (buf.length > 3) buf.shift();
      if (buf.length === 3 && buf[0] === target[0] && buf[1] === target[1] && buf[2] === target[2]) break;
    }
    totalFlips += flips;
  }
  return { runs, totalFlips };
}

// 理论期望等待:HHT = 8,HTH = 10(Conway 领先数字/自重叠结构决定)
export const COIN_PATTERN_THEORY: Record<CoinPattern, number> = { HHT: 8, HTH: 10 };
