"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface StickState {
  x: number;
  y: number;
}

const clampToCircle = (x: number, y: number, r: number): { x: number; y: number } => {
  const distance = Math.hypot(x, y);
  if (distance > r) {
    const scale = r / distance;
    return { x: x * scale, y: y * scale };
  }
  return { x, y };
};

function Joystick({
  position,
  label,
  onReady,
}: {
  position: StickState;
  label: string;
  onReady?: (visualRadius: number) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const containerRadius = Math.min(rect.width, rect.height) / 2;
      // учёт размера ручки (w-8 h-8 -> 32px), но берём её половину через computed style
      const knob = Math.min(rect.width, rect.height) * 0.2; // приблизительно соответствует w-8 при w-20
      const visualRadius = containerRadius - knob / 2;
      if (onReady) onReady(visualRadius);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onReady]);

  return (
    <div
      ref={ref}
      className="relative w-20 h-20 rounded-full bg-gray-600/50 shadow-inner flex items-center justify-center select-none"
    >
      <div className="absolute top-1/2 left-1/2 w-[calc(100%+10px)] h-[calc(100%+10px)] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-50">
        <div className="absolute w-1 h-1 bg-gray-300 rounded-full -top-1.5" />
        <div className="absolute w-1 h-1 bg-gray-300 rounded-full -bottom-1.5" />
        <div className="absolute w-1 h-1 bg-gray-300 rounded-full -left-1.5" />
        <div className="absolute w-1 h-1 bg-gray-300 rounded-full -right-1.5" />
      </div>

      <motion.div
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 100, damping: 30 }}
        className="
            w-8 h-8 rounded-full 
            bg-gray-300 
            shadow-[inset_2px_2px_8px_rgba(255,255,255,0.6),_2px_2px_6px_rgba(0,0,0,0.4)] 
            flex items-center justify-center
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
       "
      >
        <div className="w-6 h-6 rounded-full bg-gradient-radial from-white/70 to-transparent" />
      </motion.div>
    </div>
  );
}

export default function DualJoysticks() {
  const [leftStick, setLeftStick] = useState<StickState>({ x: 0, y: 0 });
  const [rightStick, setRightStick] = useState<StickState>({ x: 0, y: 0 });
  const leftRadiusRef = useRef<number>(0);
  const rightRadiusRef = useRef<number>(0);

  useEffect(() => {
    let animationFrameId: number | null = null;
    let gamepadIndex: number | null = null;

    const loop = () => {
      const gp = gamepadIndex !== null ? navigator.getGamepads()[gamepadIndex] : null;
      if (gp) {
        const lr = leftRadiusRef.current || 20;
        const rr = rightRadiusRef.current || 20;
        const newLeft = clampToCircle(gp.axes[0] * lr, gp.axes[1] * lr, lr);
        const newRight = clampToCircle(gp.axes[2] * rr, gp.axes[3] * rr, rr);
        setLeftStick(newLeft);
        setRightStick(newRight);
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    const handleConnect = (e: GamepadEvent) => {
      gamepadIndex = e.gamepad.index;
      if (!animationFrameId) loop();
    };

    const handleDisconnect = () => {
      gamepadIndex = null;
      setLeftStick({ x: 0, y: 0 });
      setRightStick({ x: 0, y: 0 });
    };

    window.addEventListener("gamepadconnected", handleConnect);
    window.addEventListener("gamepaddisconnected", handleDisconnect);

    const gps = navigator.getGamepads();
    for (let i = 0; i < gps.length; i++) {
      if (gps[i]) {
        gamepadIndex = i;
        loop();
        break;
      }
    }

    return () => {
      window.removeEventListener("gamepadconnected", handleConnect);
      window.removeEventListener("gamepaddisconnected", handleDisconnect);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent, down: boolean) => {
      const lr = leftRadiusRef.current || 20;
      const rr = rightRadiusRef.current || 20;

      setLeftStick((prev) => {
        let { x, y } = prev;
        if (["w", "W"].includes(e.key)) y = down ? -lr : 0;
        if (["s", "S"].includes(e.key)) y = down ? lr : 0;
        if (["a", "A"].includes(e.key)) x = down ? -lr : 0;
        if (["d", "D"].includes(e.key)) x = down ? lr : 0;
        return clampToCircle(x, y, lr);
      });

      setRightStick((prev) => {
        let { x, y } = prev;
        if (e.key === "ArrowUp") y = down ? -rr : 0;
        if (e.key === "ArrowDown") y = down ? rr : 0;
        if (e.key === "ArrowLeft") x = down ? -rr : 0;
        if (e.key === "ArrowRight") x = down ? rr : 0;
        return clampToCircle(x, y, rr);
      });
    };

    const downHandler = (e: KeyboardEvent) => handleKey(e, true);
    const upHandler = (e: KeyboardEvent) => handleKey(e, false);

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []);

  return (
    <div
      className="
        fixed 
        bottom-4 
        left-1/2 
        -translate-x-1/2 
        w-[240px] 
        p-4 
        bg-gray-900/50 
        rounded-full 
        shadow-2xl 
        backdrop-blur-sm
      "
      style={{ zIndex: 1000 }}
    >
      <div className="flex justify-around items-center w-full gap-4">
        <Joystick
          position={leftStick}
          label="Дрон/Направление"
          onReady={(r) => {
            leftRadiusRef.current = r;
          }}
        />
        <Joystick
          position={rightStick}
          label="Камера/Поворот"
          onReady={(r) => {
            rightRadiusRef.current = r;
          }}
        />
      </div>
    </div>
  );
}
