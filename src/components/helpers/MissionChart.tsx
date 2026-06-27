"use client";

import { useEffect } from "react";
import { useMissionStore } from "@/store/missionStore";
import { useLogStore } from "@/store/useLogStore";
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import { Input } from "../ui/input";

type MissionChartProps = {
  height?: number;
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const {t} = useTranslation();
  
  const rth = useMissionStore((s) => s.rth);

  const altitude = payload[0]?.value as number;
  const isHigher = altitude > rth;


  return (
    <div className="rounded-md bg-neutral-900/90 border border-neutral-600 px-3 py-2 shadow-lg">
      <p className="text-xs text-neutral-200">{t('point')} {label}</p>
      <p className={`text-sm font-bold ${isHigher ? "text-yellow-500" : "text-teal-400"}`}>
        {t('alt')}: {altitude} {t('meter')} {isHigher ? t('althigher') : ""}
      </p>
    </div>
  );
}

export function MissionChart({ height }: MissionChartProps) {
  const {t} = useTranslation();
  const points = useMissionStore((s) => s.points);
  
  const rth = useMissionStore((s) => s.rth);
const setRth = useMissionStore((s) => s.setRth);
  const addLog = useLogStore((s) => s.addLog);
  const data = points.map((p, idx) => ({
    index: idx + 1,
    altitude: p.altitude,
  }));

  useEffect(() => {
    points.forEach((p, idx) => {
      if (p.altitude > rth) {
        addLog(`${t('point')} ${idx + 1} ${t('althigher')} (${p.altitude} ${t('meter')})`,"warn");
      }
    });
  }, [points, rth, addLog]);

  return (
    <Card className="p-4 relative bg-neutral-800/75 backdrop-blur-xs 
                     border border-neutral-100/35 
                     rounded-lg shadow-xl gap-3">
      <div className="flex justify-between">
        <div className="font-bold  text-sm text-neutral-200">{t('alt')}</div>
        <div className="flex items-center gap-2">
  <span className="font-bold text-sm text-teal-400">
    {t("rth")}
  </span>
  

  <div className="flex items-center rounded-md border border-neutral-600 overflow-hidden">
    <button
      type="button"
      onClick={() => setRth(Math.max(0, rth - 1))}
      className="w-7 h-7 flex items-center justify-center
                bg-trasnparent hover:bg-neutral-600
                 transition-colors text-neutral-200"
    >
      −
    </button>

    <input
      type="text"
      inputMode="numeric"
      value={rth}
      min={5}
      onChange={(e) => {
        const value = Number(e.target.value);
        if (!Number.isNaN(value)) {
          setRth(Math.max(0, value));
        }
      }}
      className="w-12 h-7 bg-neutral-800 text-center
                 text-sm font-bold text-teal-400
                 outline-none border-x border-neutral-600"
    />

    <button
      type="button"
      onClick={() => setRth(rth + 1)}
      className="w-7 h-7 flex items-center justify-center
                 bg-trasnparent hover:bg-neutral-600
                 transition-colors text-neutral-200"
    >
      +
    </button>
  </div>

  <span className="text-sm text-teal-400">
    {t("meter")}
  </span>
</div>
      </div>

      <ResponsiveContainer height={height} >
        <AreaChart data={data} >
          <defs>
            <linearGradient id="colorAltitude" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  className="text-teal-500" stopColor="currentColor" stopOpacity={0.8} />
              <stop offset="95%" className="text-teal-400" stopColor="currentColor" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <XAxis dataKey="index" />
          <YAxis hide={true} />

          <Tooltip content={<CustomTooltip rth={rth} />} />

          <Area
            type="monotone"
            dataKey="altitude"
            className="text-teal-500"
            stroke="currentColor"
            fill="url(#colorAltitude)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
