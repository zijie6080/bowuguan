// 幸存者偏差:轰炸机中弹。中弹部位均匀随机,但打中要害(发动机/驾驶舱)大概率坠毁。
// 只统计返航飞机,会看到要害部位"几乎没有弹孔"。
export const PLANE_ZONES = ["机翼", "机身", "尾翼", "发动机", "驾驶舱"] as const;
export type PlaneZone = (typeof PLANE_ZONES)[number];

// 每个部位被击中的概率(按面积)与被击中后坠毁概率
export const SURVIVOR_PARAMS = {
  hitProb: [0.35, 0.3, 0.15, 0.12, 0.08],
  downProb: [0.05, 0.1, 0.15, 0.8, 0.9],
};

export interface SurvivorshipResult {
  planes: number;
  returned: number;
  hitsAll: number[]; // 全部飞机各部位实际中弹数
  hitsReturned: number[]; // 仅返航飞机各部位中弹数
}

/** 每架飞机中弹 hitsPerPlane 次;任一中弹按部位坠毁概率判定,全部躲过才返航。 */
export function runSurvivorship(
  planes: number,
  hitsPerPlane = 3,
  rand: () => number = Math.random
): SurvivorshipResult {
  const { hitProb, downProb } = SURVIVOR_PARAMS;
  const cum: number[] = [];
  hitProb.reduce((s, p) => {
    cum.push(s + p);
    return s + p;
  }, 0);
  const hitsAll = new Array(hitProb.length).fill(0);
  const hitsReturned = new Array(hitProb.length).fill(0);
  let returned = 0;
  for (let i = 0; i < planes; i++) {
    const zones: number[] = [];
    let down = false;
    for (let h = 0; h < hitsPerPlane; h++) {
      const r = rand();
      let z = cum.findIndex((c) => r < c);
      if (z < 0) z = hitProb.length - 1;
      zones.push(z);
      hitsAll[z]++;
      if (rand() < downProb[z]) down = true;
    }
    if (!down) {
      returned++;
      for (const z of zones) hitsReturned[z]++;
    }
  }
  return { planes, returned, hitsAll, hitsReturned };
}
