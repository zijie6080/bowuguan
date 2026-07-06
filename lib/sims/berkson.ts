// 伯克森悖论:颜值与演技本不相关,但"能出道"要求两者之和够高,
// 于是在明星群体里,颜值和演技呈现负相关。
export interface BerksonResult {
  n: number;
  corrAll: number; // 全体人群的相关系数
  corrSelected: number; // 入选者(和 > 阈值)的相关系数
  selected: number;
  // 采样点用于散点图(最多各 800 个)
  pointsAll: [number, number][];
  pointsSelected: [number, number][];
}

export const BERKSON_THRESHOLD = 1.2; // 两个 [0,1] 均匀分之和的入选门槛

export function runBerkson(n: number, rand: () => number = Math.random): BerksonResult {
  const xs: number[] = [];
  const ys: number[] = [];
  const sel: boolean[] = [];
  let selected = 0;
  for (let i = 0; i < n; i++) {
    const x = rand();
    const y = rand();
    xs.push(x);
    ys.push(y);
    const s = x + y > BERKSON_THRESHOLD;
    sel.push(s);
    if (s) selected++;
  }
  const corr = (filter: (i: number) => boolean) => {
    let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, m = 0;
    for (let i = 0; i < n; i++) {
      if (!filter(i)) continue;
      m++;
      sx += xs[i]; sy += ys[i]; sxx += xs[i] * xs[i]; syy += ys[i] * ys[i]; sxy += xs[i] * ys[i];
    }
    if (m < 2) return 0;
    const cov = sxy / m - (sx / m) * (sy / m);
    const vx = sxx / m - (sx / m) ** 2;
    const vy = syy / m - (sy / m) ** 2;
    return cov / Math.sqrt(vx * vy);
  };
  const sample = (filter: (i: number) => boolean, cap: number): [number, number][] => {
    const pts: [number, number][] = [];
    for (let i = 0; i < n && pts.length < cap; i++) if (filter(i)) pts.push([xs[i], ys[i]]);
    return pts;
  };
  return {
    n,
    corrAll: corr(() => true),
    corrSelected: corr((i) => sel[i]),
    selected,
    pointsAll: sample(() => true, 800),
    pointsSelected: sample((i) => sel[i], 800),
  };
}
