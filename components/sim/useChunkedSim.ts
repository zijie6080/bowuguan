"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 分块跑模拟做出"逐步累积"的动画感:
 * 把总量拆成 steps 个批次,每 tick 调一次 merge 合并进状态。
 */
/** 模拟完成时向外汇报一次"实际发生了什么"(在 effect 中调用,避免渲染期 setState)。 */
export function useCompletionReport(done: boolean, report: () => string, cb: (s: string) => void) {
  const reportRef = useRef(report);
  reportRef.current = report;
  useEffect(() => {
    if (done) cb(reportRef.current());
  }, [done, cb]);
}

export function useChunkedSim<S>(initial: S, chunk: (prev: S) => S, steps = 50, tickMs = 35) {
  const [state, setState] = useState<S>(initial);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const start = useCallback(() => {
    stop();
    setState(initial);
    setProgress(0);
    setRunning(true);
    setDone(false);
    let i = 0;
    let cur = initial;
    timer.current = setInterval(() => {
      cur = chunk(cur);
      i++;
      setState(cur);
      setProgress(i / steps);
      if (i >= steps) {
        stop();
        setRunning(false);
        setDone(true);
      }
    }, tickMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chunk, steps, tickMs, stop]);

  useEffect(() => stop, [stop]);

  return { state, running, done, progress, start };
}
