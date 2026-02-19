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
  if (rpo < 6.5) return "#3b82f6"; // blue
  if (rpo < 9.0) return "#22c55e"; // green
  return "#ef4444"; // red
}

export function RPOSlider({ value, onChange, disabled }: RPOSliderProps) {
  const zoneColor = getZoneColor(value);
  const zoneLabel = getZoneLabel(value);

  // Position % for the slider thumb label
  const pct = ((value - 4) / (12 - 4)) * 100;

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Est. RPO</span>
        <span className="text-sm font-bold tabular-nums" style={{ color: zoneColor }}>
          {value.toFixed(1)}
        </span>
      </div>

      {/* Slider track */}
      <div className="relative">
        <input
          type="range"
          min={4}
          max={12}
          step={0.5}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right,
              #3b82f6 0%, #3b82f6 32%,
              #22c55e 32%, #22c55e 63%,
              #ef4444 63%, #ef4444 100%)`,
          }}
        />
        {/* Value bubble */}
        <div
          className="absolute -top-6 text-xs font-bold px-1.5 py-0.5 rounded text-white pointer-events-none"
          style={{
            left: `calc(${pct}% - 14px)`,
            backgroundColor: zoneColor,
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
