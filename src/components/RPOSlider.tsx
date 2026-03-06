import { useRef } from "react";
import { BattingIntent } from "../types/enums";

interface RPOSliderProps {
  value: number; // 4.0 to 12.0
  onChange: (val: number) => void;
  disabled?: boolean;
}

export function rpoToIntent(rpo: number): BattingIntent {
  if (rpo < 6.5) return BattingIntent.Defensive;
  if (rpo < 9.0) return BattingIntent.Balanced;
  return BattingIntent.Aggressive;
}

function getZoneLabel(rpo: number): string {
  if (rpo < 6.5) return "Conservative";
  if (rpo < 9.0) return "Balanced";
  return "Aggressive";
}

function getZoneColor(rpo: number): string {
  if (rpo < 6.5) return "#3b82f6";
  if (rpo < 9.0) return "#22c55e";
  return "#ef4444";
}

const MIN = 4;
const MAX = 12;
const STEP = 0.5;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function snapToStep(v: number) {
  return Math.round(v / STEP) * STEP;
}

export function RPOSlider({ value, onChange, disabled }: RPOSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const zoneColor = getZoneColor(value);
  const zoneLabel = getZoneLabel(value);
  const pct = ((value - MIN) / (MAX - MIN)) * 100;

  function valueFromClientX(clientX: number): number {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return snapToStep(MIN + ratio * (MAX - MIN));
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    onChange(valueFromClientX(e.clientX));
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    onChange(valueFromClientX(e.clientX));
  }

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Est. RPO</span>
        <span className="text-sm font-bold tabular-nums" style={{ color: zoneColor }}>
          {value.toFixed(1)}
        </span>
      </div>

      {/* Touch target — tall enough to hit reliably on mobile */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        style={{
          position: "relative",
          height: 44,
          display: "flex",
          alignItems: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.4 : 1,
          touchAction: "none", // prevents browser scroll hijack
          userSelect: "none",
        }}
      >
        {/* Track */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 8,
            borderRadius: 9999,
            background: `linear-gradient(to right,
              #3b82f6 0%, #3b82f6 32%,
              #22c55e 32%, #22c55e 63%,
              #ef4444 63%, #ef4444 100%)`,
          }}
        />

        {/* Filled portion overlay */}
        <div
          style={{
            position: "absolute",
            left: 0,
            width: `${pct}%`,
            height: 8,
            borderRadius: 9999,
            background: zoneColor,
            opacity: 0.9,
          }}
        />

        {/* Thumb */}
        <div
          style={{
            position: "absolute",
            left: `calc(${pct}% - 11px)`,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: zoneColor,
            border: "3px solid white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
            transition: "background 0.15s",
          }}
        />

        {/* Value bubble above thumb */}
        <div
          className="pointer-events-none"
          style={{
            position: "absolute",
            bottom: "calc(100% - 6px)",
            left: `calc(${pct}% - 14px)`,
            fontSize: 11,
            fontWeight: 700,
            color: "white",
            background: zoneColor,
            padding: "2px 5px",
            borderRadius: 4,
          }}
        >
          {value.toFixed(1)}
        </div>
      </div>

      {/* Zone labels */}
      <div className="flex justify-between text-xs">
        <span className="text-blue-500">Defensive</span>
        <span className="font-medium" style={{ color: zoneColor }}>{zoneLabel}</span>
        <span className="text-red-500">Aggressive</span>
      </div>
    </div>
  );
}
