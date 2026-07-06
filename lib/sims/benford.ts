// 本福特定律:自然增长的数据,首位数字 1 出现约 30.1%,而不是均匀的 11.1%。
export interface BenfordResult {
  samples: number;
  digitCounts: number[]; // index 0 → 数字 1
}

/**
 * 模拟"复利增长型"数据:初始金额随机,经历随机期数的随机增长,取最终值首位数字。
 * 这种乘性过程在对数尺度上近似均匀,首位数字服从本福特分布。
 */
export function runBenford(samples: number, rand: () => number = Math.random): BenfordResult {
  const digitCounts = new Array(9).fill(0);
  for (let i = 0; i < samples; i++) {
    // log10(值) 在一个很宽的区间均匀分布 → 严格服从本福特
    // 用乘性随机游走生成:x = 初值 * Π(1+r_k)
    let x = 1 + rand() * 9;
    const periods = 30 + Math.floor(rand() * 40);
    for (let k = 0; k < periods; k++) {
      x *= 1 + (rand() * 0.4 - 0.1); // 每期 -10% ~ +30%
    }
    const first = firstDigit(x);
    digitCounts[first - 1]++;
  }
  return { samples, digitCounts };
}

export function firstDigit(x: number): number {
  const l = Math.log10(Math.abs(x));
  return Math.floor(Math.pow(10, l - Math.floor(l)));
}

/** 理论:P(d) = log10(1 + 1/d) */
export function benfordTheory(): number[] {
  return Array.from({ length: 9 }, (_, i) => Math.log10(1 + 1 / (i + 1)));
}
