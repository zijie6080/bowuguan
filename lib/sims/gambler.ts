// 赌徒谬误:连续 k 次正面之后,下一次是正面的概率仍是 50%。
export interface GamblerResult {
  streaksFound: number; // 找到的"连续 k 次正面"次数
  nextHeads: number; // 其后一次仍为正面的次数
}

/** 抛 flips 次硬币,每当出现连续 streakLen 次正面,记录下一次的结果。 */
export function runGambler(
  flips: number,
  streakLen = 5,
  rand: () => number = Math.random
): GamblerResult {
  let streak = 0;
  let streaksFound = 0;
  let nextHeads = 0;
  let pending = false; // 上一时刻刚好凑满 streak,本次结果需要记录
  for (let i = 0; i < flips; i++) {
    const heads = rand() < 0.5;
    if (pending) {
      streaksFound++;
      if (heads) nextHeads++;
      pending = false;
    }
    streak = heads ? streak + 1 : 0;
    if (streak >= streakLen) {
      pending = true;
      streak = 0; // 不重叠计数,保证各观察独立
    }
  }
  return { streaksFound, nextHeads };
}
