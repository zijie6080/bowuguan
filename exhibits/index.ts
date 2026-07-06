"use client";

// 完整展品注册表(含 React 组件),仅供客户端组件使用。
// 服务端(首页列表、generateStaticParams)请使用 ./meta。
import type { ExhibitDef } from "./types";
import montyHall from "./monty-hall";
import birthday from "./birthday";
import simpson from "./simpson";
import survivorship from "./survivorship";
import benford from "./benford";
import gambler from "./gambler";
import regression from "./regression";
import baseRate from "./base-rate";
import smallNumbers from "./small-numbers";
import coinPatterns from "./coin-patterns";
import secretary from "./secretary";
import twoChildren from "./two-children";
import berkson from "./berkson";
import twoEnvelopes from "./two-envelopes";
import waitingTime from "./waiting-time";

/** 新增展品:写好组件后在这里追加一行,并在 meta.ts 登记元数据 */
export const EXHIBITS: ExhibitDef[] = [
  montyHall,
  birthday,
  simpson,
  survivorship,
  benford,
  gambler,
  regression,
  baseRate,
  smallNumbers,
  coinPatterns,
  secretary,
  twoChildren,
  berkson,
  twoEnvelopes,
  waitingTime,
];

export function getExhibit(id: string): ExhibitDef | undefined {
  return EXHIBITS.find((e) => e.id === id);
}
