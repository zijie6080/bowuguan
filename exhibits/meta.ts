// 纯元数据(不含 React 组件),可安全用于服务端组件 / generateStaticParams。
// 新增展品:在这里加一条,再在同名组件文件里 spread 对应 meta。
export interface ExhibitMeta {
  id: string;
  no: number;
  hall: "概率厅" | "统计厅" | "决策厅";
  title: string;
  teaser: string;
}

export const EXHIBIT_META = [
  { id: "monty-hall", no: 1, hall: "概率厅", title: "蒙提霍尔问题", teaser: "你确定换门没用?连数学教授都为此吵翻过天。" },
  { id: "birthday", no: 2, hall: "概率厅", title: "生日悖论", teaser: "一个班 23 个人,就敢跟你赌有人同一天生日?" },
  { id: "simpson", no: 3, hall: "统计厅", title: "辛普森悖论", teaser: "一种疗法在每个分组里都更好,合计起来却更差——这数据没造假。" },
  { id: "survivorship", no: 4, hall: "统计厅", title: "幸存者偏差", teaser: "返航的轰炸机浑身弹孔,唯独发动机干干净净。该给哪里加装甲?" },
  { id: "benford", no: 5, hall: "统计厅", title: "本福特定律", teaser: "随手翻一本账,数字开头是 1 还是 9,居然能查出做假账的人。" },
  { id: "gambler", no: 6, hall: "概率厅", title: "赌徒谬误", teaser: "轮盘连开 5 把红,这把该押黑了吧?蒙特卡洛赌场谢谢你。" },
  { id: "regression", no: 7, hall: "统计厅", title: "均值回归", teaser: "表扬完就退步,批评完就进步?你可能冤枉了表扬。" },
  { id: "base-rate", no: 8, hall: "决策厅", title: "基率谬误", teaser: "检测准确率 99%,你查出阳性——先别慌,你大概率没病。" },
  { id: "small-numbers", no: 9, hall: "统计厅", title: "大数定律 vs 小数定律", teaser: "全国癌症率最低的县,几乎全是小县城。最高的呢?也是。" },
  { id: "coin-patterns", no: 10, hall: "概率厅", title: "硬币模式的等待时间", teaser: "「正正反」和「正反正」概率相同,等到它们的时间却不同——不服来抛。" },
  { id: "secretary", no: 11, hall: "决策厅", title: "秘书问题(37% 法则)", teaser: "100 个候选人只能顺序面试、错过不候,最优策略选中第一名的概率是多少?" },
  { id: "two-children", no: 12, hall: "概率厅", title: "两个孩子问题", teaser: "「我有两个孩子,至少一个是男孩」——另一个也是男孩的概率不是 1/2。" },
  { id: "berkson", no: 13, hall: "统计厅", title: "伯克森悖论", teaser: "为什么好看的明星总被说不会演戏?数据说:这锅是选拔机制的。" },
  { id: "two-envelopes", no: 14, hall: "概率厅", title: "双信封问题", teaser: "「换信封期望多赚 25%」——这个公式看起来无懈可击,但它算错了。" },
  { id: "waiting-time", no: 15, hall: "决策厅", title: "等车悖论(检验悖论)", teaser: "公交平均 10 分钟一班,你却总感觉等了 10 分钟以上。不是错觉。" },
] as const satisfies readonly ExhibitMeta[];

export const HALLS = ["概率厅", "统计厅", "决策厅"] as const;
export const TOTAL_EXHIBITS = EXHIBIT_META.length;
