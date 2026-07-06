import type { ComponentType, ReactNode } from "react";

export interface SimulatorProps {
  /** 首次完成一轮模拟时回调,参数是"实际发生了什么"的一句话结论 */
  onFirstComplete: (actual: string) => void;
}

export interface ExhibitDef {
  id: string;
  no: number;
  hall: "概率厅" | "统计厅" | "决策厅";
  title: string;
  /** 首页挑衅性引子 */
  teaser: string;
  /** 预测阶段的问题(一句话,不得暗示答案) */
  question: string;
  note?: string;
  options: string[];
  correctIndex: number;
  Simulator: ComponentType<SimulatorProps>;
  explanation: {
    intuition: ReactNode; // 一句话直觉版
    math: ReactNode; // 数学原理版
    story: ReactNode; // 现实中它坑过谁
  };
}
