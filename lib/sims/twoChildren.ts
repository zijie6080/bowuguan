// 两个孩子问题:已知"至少有一个男孩",两个都是男孩的概率是 1/3,不是 1/2。
export interface TwoChildrenResult {
  families: number; // 生成的家庭总数
  atLeastOneBoy: number; // 至少一个男孩的家庭
  twoBoys: number; // 其中两个都是男孩的
}

export function runTwoChildren(families: number, rand: () => number = Math.random): TwoChildrenResult {
  let atLeastOneBoy = 0;
  let twoBoys = 0;
  for (let i = 0; i < families; i++) {
    const b1 = rand() < 0.5;
    const b2 = rand() < 0.5;
    if (b1 || b2) {
      atLeastOneBoy++;
      if (b1 && b2) twoBoys++;
    }
  }
  return { families, atLeastOneBoy, twoBoys };
}

export const TWO_CHILDREN_THEORY = 1 / 3;
