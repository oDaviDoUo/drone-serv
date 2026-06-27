"use client";

import { useEffect, useRef } from "react";
import { useLogStore } from "@/store/useLogStore";

export function LogInterceptor() {
  const addLog = useLogStore((s) => s.addLog);

  // тип console.log
  const original = useRef<((...args: any[]) => void) | null>(null);

  useEffect(() => {
    // сохранить оригинальный логгер
    original.current = console.log;

    console.log = (...args: any[]) => {
      addLog(args.map(String).join(" "));
      original.current?.(...args);
    };

    return () => {
      // восстановить при размонтировании
      if (original.current) console.log = original.current;
    };
  }, [addLog]);

  return null;
}
