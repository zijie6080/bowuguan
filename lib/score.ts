"use client";

import { useEffect, useState, useCallback } from "react";

const KEY = "museum-intuition-score-v1";

export type ScoreMap = Record<string, boolean>; // exhibitId -> 是否猜对(仅首次预测计入)

export function loadScore(): ScoreMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function recordGuess(id: string, correct: boolean): ScoreMap {
  const m = loadScore();
  if (!(id in m)) {
    m[id] = correct;
    localStorage.setItem(KEY, JSON.stringify(m));
  }
  return m;
}

export function useScore() {
  const [score, setScore] = useState<ScoreMap>({});
  useEffect(() => {
    setScore(loadScore());
    const onStorage = () => setScore(loadScore());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const record = useCallback((id: string, correct: boolean) => {
    setScore({ ...recordGuess(id, correct) });
  }, []);
  return { score, record };
}
