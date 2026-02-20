import { BowlerLine } from "../types/enums";

export type BowlingLineChoice = "off" | "middle" | "leg";
export type BowlingLengthChoice = "full" | "good" | "short";

interface PitchSelectorProps {
  selectedLine: BowlingLineChoice;
  selectedLength: BowlingLengthChoice;
  onSelect: (line: BowlingLineChoice, length: BowlingLengthChoice) => void;
  disabled?: boolean;
}

export function mapToEngineLine(line: BowlingLineChoice, length: BowlingLengthChoice): BowlerLine {
  if (length === "short") return BowlerLine.Short;
  if (length === "full")  return BowlerLine.Full;
  if (line === "off")     return BowlerLine.OutsideOff;
  if (line === "leg")     return BowlerLine.OnPads;
  return BowlerLine.OnStumps;
}

const LINES: BowlingLineChoice[] = ["off", "middle", "leg"];

const LINE_LABEL: Record<BowlingLineChoice, string> = {
  off: "Off", middle: "Mid", leg: "Leg",
};
const LENGTH_LABEL: Record<BowlingLengthChoice, string> = {
  full: "Full", good: "Good", short: "Short",
};

// ── Perspective trapezoid: top = bowler end (narrow), bottom = batsman end (wide) ──
const TOP_Y = 22, BOT_Y = 168;
const TOP_L = 56, TOP_R = 124; // narrower at bowler end
const BOT_L = 22, BOT_R = 158; // wider at batsman end

const SVG_W = 180;
const SVG_H = 210; // includes stump area below BOT_Y

const BAND_H = (BOT_Y - TOP_Y) / 3;

// Length bands: Short at top (near bowler), Full at bottom (near stumps)
const LENGTH_BANDS: { len: BowlingLengthChoice; y1: number; y2: number }[] = [
  { len: "short", y1: TOP_Y,              y2: TOP_Y + BAND_H },
  { len: "good",  y1: TOP_Y + BAND_H,     y2: TOP_Y + 2 * BAND_H },
  { len: "full",  y1: TOP_Y + 2 * BAND_H, y2: BOT_Y },
];

function xLeft(y: number) {
  return TOP_L + (BOT_L - TOP_L) * (y - TOP_Y) / (BOT_Y - TOP_Y);
}
function xRight(y: number) {
  return TOP_R + (BOT_R - TOP_R) * (y - TOP_Y) / (BOT_Y - TOP_Y);
}

function cellPoints(y1: number, y2: number, col: number): string {
  const xl1 = xLeft(y1),  xr1 = xRight(y1);
  const xl2 = xLeft(y2),  xr2 = xRight(y2);
  const w1 = xr1 - xl1,   w2 = xr2 - xl2;
  const a = xl1 + (col / 3) * w1;
  const b = xl1 + ((col + 1) / 3) * w1;
  const c = xl2 + ((col + 1) / 3) * w2;
  const d = xl2 + (col / 3) * w2;
  return `${a.toFixed(1)},${y1.toFixed(1)} ${b.toFixed(1)},${y1.toFixed(1)} ${c.toFixed(1)},${y2.toFixed(1)} ${d.toFixed(1)},${y2.toFixed(1)}`;
}

// Zone tint: slightly different greens to hint at length danger
const ZONE_BASE: Record<BowlingLengthChoice, string> = {
  short: "rgba(22,163,74,0.06)",
  good:  "rgba(22,163,74,0.12)",
  full:  "rgba(22,163,74,0.09)",
};

export function PitchSelector({
  selectedLine, selectedLength, onSelect, disabled,
}: PitchSelectorProps) {
  // Ball marker position
  const selBand  = LENGTH_BANDS.find(b => b.len === selectedLength)!;
  const selCol   = LINES.indexOf(selectedLine);
  const ballY    = (selBand.y1 + selBand.y2) / 2;
  const ballXL   = xLeft(ballY), ballXR = xRight(ballY);
  const ballX    = ballXL + ((selCol + 0.5) / 3) * (ballXR - ballXL);

  // Stumps
  const stumpY1  = BOT_Y + 6, stumpH = 18;
  const stumpXL  = xLeft(BOT_Y), stumpXR = xRight(BOT_Y);
  const stumpW   = stumpXR - stumpXL;
  const stumpFracs = [0.32, 0.5, 0.68];

  return (
    <div>
      <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">Bowling Target</p>

      <div
        style={{
          background: "#081a0e",
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ width: "100%", height: "auto", maxHeight: 160, display: "block" }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* ── Background field ── */}
          <rect width={SVG_W} height={SVG_H} fill="#081a0e" />
          <ellipse
            cx={SVG_W / 2} cy={SVG_H / 2 - 10}
            rx={SVG_W * 0.46} ry={(SVG_H - 40) * 0.5}
            fill="#0d2414" stroke="rgba(255,255,255,0.04)" strokeWidth="1"
          />

          {/* ── Pitch outline (trapezoid) ── */}
          <polygon
            points={`${TOP_L},${TOP_Y} ${TOP_R},${TOP_Y} ${BOT_R},${BOT_Y} ${BOT_L},${BOT_Y}`}
            fill="#0f2a17"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1"
          />

          {/* ── 9 clickable cells ── */}
          {LENGTH_BANDS.map(({ len, y1, y2 }) =>
            LINES.map((line, col) => {
              const isSel = selectedLine === line && selectedLength === len;
              return (
                <polygon
                  key={`${line}-${len}`}
                  points={cellPoints(y1, y2, col)}
                  fill={isSel ? "rgba(220,38,38,0.38)" : ZONE_BASE[len]}
                  stroke={isSel ? "rgba(239,68,68,0.75)" : "rgba(255,255,255,0.07)"}
                  strokeWidth={isSel ? 1.5 : 0.5}
                  onClick={() => !disabled && onSelect(line, len)}
                  style={{ cursor: disabled ? "not-allowed" : "pointer" }}
                />
              );
            })
          )}

          {/* ── Dashed band dividers ── */}
          {LENGTH_BANDS.slice(0, 2).map(({ y2 }) => (
            <line
              key={y2}
              x1={xLeft(y2)} y1={y2} x2={xRight(y2)} y2={y2}
              stroke="rgba(255,255,255,0.13)" strokeWidth={1} strokeDasharray="3,2"
            />
          ))}

          {/* ── Red ball on selected cell ── */}
          <circle cx={ballX} cy={ballY} r={10} fill="rgba(220,38,38,0.15)" />
          <circle cx={ballX} cy={ballY} r={6.5} fill="#dc2626" stroke="#fca5a5" strokeWidth={1.2} />
          {/* seam curves */}
          <path
            d={`M ${(ballX - 2.5).toFixed(1)} ${(ballY - 4.5).toFixed(1)} Q ${(ballX + 3).toFixed(1)} ${ballY.toFixed(1)} ${(ballX - 2.5).toFixed(1)} ${(ballY + 4.5).toFixed(1)}`}
            fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={0.9}
          />
          <path
            d={`M ${(ballX + 2.5).toFixed(1)} ${(ballY - 4.5).toFixed(1)} Q ${(ballX - 3).toFixed(1)} ${ballY.toFixed(1)} ${(ballX + 2.5).toFixed(1)} ${(ballY + 4.5).toFixed(1)}`}
            fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={0.9}
          />

          {/* ── Crease lines ── */}
          <line
            x1={TOP_L - 4} y1={TOP_Y} x2={TOP_R + 4} y2={TOP_Y}
            stroke="rgba(255,255,255,0.18)" strokeWidth={1}
          />
          <line
            x1={BOT_L - 4} y1={BOT_Y} x2={BOT_R + 4} y2={BOT_Y}
            stroke="rgba(255,255,255,0.18)" strokeWidth={1}
          />

          {/* ── Stumps ── */}
          {stumpFracs.map((f, i) => {
            const sx = stumpXL + f * stumpW;
            return (
              <rect key={i} x={sx - 2.2} y={stumpY1} width={4.4} height={stumpH} rx={1.2} fill="#b8882a" />
            );
          })}
          {/* Bails */}
          <line
            x1={stumpXL + stumpFracs[0] * stumpW - 2}
            y1={stumpY1}
            x2={stumpXL + stumpFracs[2] * stumpW + 2}
            y2={stumpY1}
            stroke="#b8882a" strokeWidth={2.2}
          />

          {/* ── Length labels (right side) ── */}
          {LENGTH_BANDS.map(({ len, y1, y2 }) => (
            <text
              key={len}
              x={xRight((y1 + y2) / 2) + 6}
              y={(y1 + y2) / 2 + 3.5}
              fill="#4ade80" fontSize={8.5} fontWeight="600"
            >
              {LENGTH_LABEL[len]}
            </text>
          ))}

          {/* ── Line labels (top, above crease) ── */}
          {LINES.map((line, col) => {
            const xl = xLeft(TOP_Y), xr = xRight(TOP_Y);
            const cx = xl + ((col + 0.5) / 3) * (xr - xl);
            return (
              <text
                key={line}
                x={cx.toFixed(1)} y={TOP_Y - 7}
                fill="#86efac" fontSize={8} textAnchor="middle" fontWeight="500"
              >
                {LINE_LABEL[line]}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Selected zone label */}
      <p className="text-center text-[10px] mt-1.5 font-semibold text-emerald-400">
        {LENGTH_LABEL[selectedLength]} · {LINE_LABEL[selectedLine]} side
      </p>
    </div>
  );
}
