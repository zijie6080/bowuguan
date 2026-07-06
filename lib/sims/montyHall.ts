// 蒙提霍尔问题:3 扇门,1 辆车,主持人(知道答案)打开一扇有山羊的门,问换不换。
export interface MontyHallResult {
  trials: number;
  switchWins: number;
  stayWins: number;
}

/** 运行 n 局蒙提霍尔。每局同时统计"换门"与"不换"两种策略的结果。 */
export function runMontyHall(trials: number, rand: () => number = Math.random): MontyHallResult {
  let switchWins = 0;
  let stayWins = 0;
  for (let i = 0; i < trials; i++) {
    const car = Math.floor(rand() * 3);
    const pick = Math.floor(rand() * 3);
    // 主持人从"非玩家所选、非汽车"的门中开一扇;不换赢 ⇔ 初选即中
    if (pick === car) {
      stayWins++;
    } else {
      // 初选没中时,剩下唯一没开的门必然是汽车,换门必赢
      switchWins++;
    }
  }
  return { trials, switchWins, stayWins };
}

export const MONTY_THEORY = { switchWin: 2 / 3, stayWin: 1 / 3 };
