import { FieldType } from "../types/enums";

/**
 * Top-down cricket field diagram.
 * Coordinate space: viewBox 0 0 100 100, center (50,50).
 * Top = bowler's end, Bottom = batting end (keeper behind stumps).
 * Right = off side (RHB), Left = leg side.
 *
 * 9 fielder dots (green) move between positions based on FieldType.
 * Keeper (amber) and bowler (red) are fixed reference markers.
 */

// [cx, cy] in 0-100 viewBox units
const FIELDER_POSITIONS: Record<FieldType, [number, number][]> = {
  // Close-catching field: slips, gully, short leg, cover/mid-off/mid-on close in
  [FieldType.Attacking]: [
    [57, 70], // 1st slip
    [62, 66], // 2nd slip
    [70, 58], // gully
    [69, 43], // cover (inner)
    [62, 30], // mid-off (close)
    [38, 30], // mid-on (close)
    [31, 44], // short mid-wicket
    [33, 70], // square leg
    [42, 82], // fine leg (saving 1)
  ],
  // Standard T20 set: 1 slip, mid-off/on, cover, point, mid-wicket, sq-leg, fine leg, 3rd man
  [FieldType.Balanced]: [
    [60, 70], // 1 slip
    [75, 51], // point
    [73, 37], // cover
    [63, 21], // mid-off
    [37, 21], // mid-on
    [26, 39], // mid-wicket
    [26, 57], // square leg
    [38, 82], // fine leg
    [65, 82], // third man
  ],
  // All-out boundary field: everyone saving 4
  [FieldType.Defensive]: [
    [86, 50], // deep point
    [80, 27], // deep cover
    [63,  9], // long-off
    [37,  9], // long-on
    [20, 31], // deep mid-wicket
    [16, 54], // deep square leg
    [29, 82], // deep fine leg
    [65, 82], // third man
    [60, 26], // mid-off (one in)
  ],
};

const FIELD_LABEL: Record<FieldType, string> = {
  [FieldType.Attacking]: "Attacking",
  [FieldType.Balanced]: "Balanced",
  [FieldType.Defensive]: "Defensive",
};

const FIELD_COLOR: Record<FieldType, string> = {
  [FieldType.Attacking]: "#ef4444",
  [FieldType.Balanced]: "#6b7280",
  [FieldType.Defensive]: "#3b82f6",
};

interface FieldDiagramProps {
  fieldType: FieldType;
  size?: number;
  showLabel?: boolean;
}

export function FieldDiagram({ fieldType, size = 148, showLabel = true }: FieldDiagramProps) {
  const positions = FIELDER_POSITIONS[fieldType];

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="rounded-full"
        style={{ display: "block" }}
      >
        {/* Outfield */}
        <circle cx={50} cy={50} r={49} fill="#0e2818" />
        {/* Boundary */}
        <circle cx={50} cy={50} r={48} fill="none" stroke="#1a4a28" strokeWidth="1" />
        {/* 30-yard circle */}
        <circle
          cx={50} cy={50} r={28}
          fill="none" stroke="#1a4a28" strokeWidth="0.8"
          strokeDasharray="2.5 2.5"
        />
        {/* Pitch rectangle */}
        <rect
          x={45.5} y={32} width={9} height={36}
          fill="#3d2e10" stroke="#4e3c18" strokeWidth="0.5" rx="0.8"
        />
        {/* Batting crease */}
        <line x1={43} y1={62.5} x2={57} y2={62.5} stroke="#aaa" strokeWidth="0.5" />
        {/* Bowling crease */}
        <line x1={43} y1={37.5} x2={57} y2={37.5} stroke="#aaa" strokeWidth="0.5" />
        {/* Stumps — batting end */}
        <rect x={47.5} y={63} width={5} height={1.5} rx="0.3" fill="#d4be4a" />
        {/* Stumps — bowling end */}
        <rect x={47.5} y={35.5} width={5} height={1.5} rx="0.3" fill="#d4be4a" />

        {/* Batsman (blue dot) */}
        <circle cx={50} cy={65} r={2.2} fill="#60a5fa" />

        {/* Wicket keeper (amber) — fixed */}
        <circle cx={50} cy={75} r={2.8} fill="#f59e0b" />

        {/* Bowler (red) — fixed */}
        <circle cx={50} cy={26} r={2.8} fill="#ef4444" />

        {/* Fielders — transition cx/cy so they slide when field changes */}
        {positions.map(([fx, fy], i) => (
          <circle
            key={i}
            cx={fx}
            cy={fy}
            r={2.8}
            fill="#22c55e"
            style={{ transition: "cx 0.35s ease, cy 0.35s ease" } as React.CSSProperties}
          />
        ))}
      </svg>

      {showLabel && (
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: FIELD_COLOR[fieldType] }} />
          <span className="text-xs font-medium text-gray-400">{FIELD_LABEL[fieldType]}</span>
        </div>
      )}

      {/* Legend (tiny) */}
      <div className="flex items-center gap-2 text-[9px] text-gray-600">
        <span className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Bowl
        </span>
        <span className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> WK
        </span>
        <span className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Field
        </span>
      </div>
    </div>
  );
}
