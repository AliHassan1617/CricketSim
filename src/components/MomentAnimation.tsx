/**
 * MomentAnimation — short (~1.6–1.8s) SVG cricket-moment overlays.
 *
 * Renders for key events:
 *   SIX    → ball arcing over the boundary (night stadium, side view)
 *   BOWLED → ball rolling in, stumps + bails flying (end-on view)
 *   CAUGHT → ball arcing up to fielder's hands (side view)
 *   LBW    → ball hitting pad, umpire raises finger (side view)
 *   RUN-OUT / STUMPED → stumps breaking without ball animation
 */

import { DismissalType } from "../types/enums";

export interface MomentProps {
  type: "six" | "wicket";
  dismissalType?: DismissalType;
}

// ─── Trail dot positions along the SIX parabolic arc ────────────────────────
const SIX_TRAIL: { cx: number; cy: number }[] = [
  { cx: 122, cy: 108 },
  { cx: 140, cy:  90 },
  { cx: 160, cy:  76 },
  { cx: 183, cy:  68 },
  { cx: 206, cy:  74 },
  { cx: 228, cy:  88 },
];

// ─── Scene: SIX — ball arcing over the boundary ─────────────────────────────
function SixScene() {
  return (
    <svg width="280" height="160" viewBox="0 0 280 160" style={{ display: "block" }}>
      <defs>
        <linearGradient id="mc_nightsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050510" />
          <stop offset="100%" stopColor="#0c0320" />
        </linearGradient>
      </defs>

      {/* Night sky */}
      <rect width="280" height="160" fill="url(#mc_nightsky)" />

      {/* Stars */}
      {([
        [30,14],[58,8],[88,21],[128,6],[164,17],[200,9],[240,14],[262,24],[14,30],[252,7],
      ] as [number,number][]).map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="0.9" fill="rgba(255,255,255,0.55)" />
      ))}

      {/* Stadium silhouette */}
      <rect x="0"   y="88" width="54"  height="72" fill="#090c12" />
      <rect x="226" y="88" width="54"  height="72" fill="#090c12" />

      {/* Floodlight poles */}
      <rect x="20"  y="28" width="3" height="64" fill="#111a24" />
      <rect x="257" y="28" width="3" height="64" fill="#111a24" />
      <ellipse cx="21.5"  cy="32" rx="13" ry="5" fill="rgba(255,240,200,0.09)" />
      <ellipse cx="258.5" cy="32" rx="13" ry="5" fill="rgba(255,240,200,0.09)" />

      {/* Crowd rows */}
      <rect x="54"  y="94" width="172" height="7"  fill="#0d1420" />
      <rect x="54"  y="88" width="172" height="7"  fill="#0b1118" />
      {Array.from({ length: 28 }).map((_, i) => (
        <circle
          key={i}
          cx={58 + i * 6.0}
          cy={91 + (i % 3 === 0 ? 0 : i % 3 === 1 ? 4 : 2)}
          r="2"
          fill={`hsl(${200 + i * 7},34%,${22 + (i % 4) * 4}%)`}
          opacity="0.7"
        />
      ))}

      {/* Outfield */}
      <ellipse cx="140" cy="148" rx="112" ry="20" fill="#163e14" />

      {/* Pitch strip */}
      <rect x="90" y="118" width="104" height="37" rx="3" fill="#be8e52" />
      <line x1="94"  y1="130" x2="190" y2="130" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      <line x1="94"  y1="136" x2="190" y2="136" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />

      {/* Far stumps */}
      {[183, 189, 195].map((x, i) => (
        <rect key={i} x={x} y="108" width="3.5" height="25" rx="0.8" fill="#dcc47e" />
      ))}
      <rect x="182.5" y="106" width="16.5" height="3" rx="1.5" fill="#c0a060" />

      {/* Batsman */}
      <circle cx="104" cy="117" r="5"   fill="#1e2e40" />
      <rect   x="99"  y="121" width="10" height="14" rx="3" fill="#1e2e40" />
      <rect   x="100" y="134" width="4"  height="8"  rx="2" fill="#1a2a38" />
      <rect   x="105" y="134" width="4"  height="8"  rx="2" fill="#1a2a38" />

      {/* Bat — pivoting from hand area */}
      <g style={{ transformOrigin: "104px 126px", animation: "mc_batSwing 0.38s ease-out 0.12s both" }}>
        <rect x="102" y="119" width="3.5" height="9"  rx="1.5" fill="#7a5510" />
        <rect x="99"  y="128" width="11"  height="21" rx="2.5" fill="#966818" />
      </g>

      {/* Ball trail dots */}
      {SIX_TRAIL.map(({ cx, cy }, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={2.2 - i * 0.14}
          fill={`rgba(220,80,40,${0.55 - i * 0.05})`}
          style={{ animation: `mc_trailDot 0.55s ease ${0.22 + i * 0.13}s both` }}
        />
      ))}

      {/* Ball — positioned at origin, animated into position via keyframes */}
      <g style={{ animation: "mc_ballArcSix 1.1s ease-out 0.15s both" }}>
        <circle cx="0" cy="0" r="6.5" fill="#c82020" />
        <path d="M-3,1 Q0,-5 3,1" fill="none" stroke="rgba(255,200,200,0.4)" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

// ─── Scene: BOWLED — stumps shattered ────────────────────────────────────────
function BowledScene() {
  return (
    <svg width="280" height="160" viewBox="0 0 280 160" style={{ display: "block" }}>
      <rect width="280" height="160" fill="#050810" />

      {/* Ground */}
      <ellipse cx="140" cy="152" rx="118" ry="18" fill="#153d18" />

      {/* Pitch end-on */}
      <rect x="72" y="100" width="136" height="58" rx="8" fill="#b07848" />
      <line x1="78" y1="115" x2="202" y2="115" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />

      {/* Ball rolling down from top */}
      <g style={{ animation: "mc_ballDown 0.42s ease-in both" }}>
        <circle cx="140" cy="55" r="8" fill="#c82020" />
        <path d="M136,54 Q140,62 144,54" fill="none" stroke="rgba(255,200,200,0.4)" strokeWidth="1.3" />
      </g>

      {/* Stumps — pivot at ground level (y=152), fly on impact (delay = 0.42s) */}
      <g transform="translate(122,152)">
        <rect x="-3" y="-46" width="6" height="46" rx="1" fill="#dcc47e"
          style={{ animation: "mc_stump1 0.65s ease-out 0.42s both" }} />
      </g>
      <g transform="translate(140,152)">
        <rect x="-3" y="-46" width="6" height="46" rx="1" fill="#dcc47e"
          style={{ animation: "mc_stump2 0.70s ease-out 0.42s both" }} />
      </g>
      <g transform="translate(158,152)">
        <rect x="-3" y="-46" width="6" height="46" rx="1" fill="#dcc47e"
          style={{ animation: "mc_stump3 0.65s ease-out 0.42s both" }} />
      </g>

      {/* Bails */}
      <g style={{ animation: "mc_bail1 0.55s ease-out 0.44s both" }}>
        <rect x="119" y="104" width="20" height="3.5" rx="1.75" fill="#b89048" />
      </g>
      <g style={{ animation: "mc_bail2 0.55s ease-out 0.44s both" }}>
        <rect x="137" y="104" width="20" height="3.5" rx="1.75" fill="#b89048" />
      </g>
    </svg>
  );
}

// ─── Scene: CAUGHT — high catch ──────────────────────────────────────────────
function CaughtScene() {
  return (
    <svg width="280" height="160" viewBox="0 0 280 160" style={{ display: "block" }}>
      <defs>
        <linearGradient id="mc_sky_c" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050510" />
          <stop offset="100%" stopColor="#0c0320" />
        </linearGradient>
      </defs>
      <rect width="280" height="160" fill="url(#mc_sky_c)" />

      {/* Outfield */}
      <ellipse cx="140" cy="152" rx="118" ry="18" fill="#153d18" />

      {/* Fielder silhouette */}
      <circle cx="140" cy="32" r="9"  fill="#1e2e40" />
      <rect x="132"  y="40" width="16" height="24" rx="5" fill="#1e2e40" />
      {/* Left arm reaching up */}
      <rect
        x="117" y="34" width="18" height="5" rx="2.5" fill="#1e2e40"
        style={{ transform: "rotate(-35deg)", transformOrigin: "128px 36px" }}
      />
      {/* Right arm reaching up */}
      <rect
        x="145" y="34" width="18" height="5" rx="2.5" fill="#1e2e40"
        style={{ transform: "rotate(35deg)", transformOrigin: "152px 36px" }}
      />
      {/* Gloves */}
      <circle cx="114" cy="30" r="5" fill="#2a4055" />
      <circle cx="166" cy="30" r="5" fill="#2a4055" />

      {/* Ball arcing upward — starts at bottom, ends at fielder's hands */}
      <g style={{ animation: "mc_ballUp 1.05s ease-out 0.15s both" }}>
        <circle cx="140" cy="148" r="7" fill="#c82020" />
        <path d="M136,147 Q140,155 144,147" fill="none" stroke="rgba(255,200,200,0.4)" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

// ─── Scene: LBW — umpire raises finger ───────────────────────────────────────
function LBWScene() {
  return (
    <svg width="280" height="160" viewBox="0 0 280 160" style={{ display: "block" }}>
      <rect width="280" height="160" fill="#050810" />

      {/* Outfield */}
      <ellipse cx="140" cy="152" rx="118" ry="18" fill="#153d18" />

      {/* Pitch */}
      <rect x="68" y="95" width="144" height="62" rx="4" fill="#b07848" />
      <line x1="72" y1="110" x2="208" y2="110" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

      {/* Batting pad */}
      <rect x="122" y="92" width="22" height="62" rx="8" fill="#e0d8c0" />
      <line x1="127" y1="110" x2="140" y2="110" stroke="rgba(180,160,120,0.4)" strokeWidth="1" />
      <line x1="127" y1="122" x2="140" y2="122" stroke="rgba(180,160,120,0.4)" strokeWidth="1" />
      <line x1="127" y1="134" x2="140" y2="134" stroke="rgba(180,160,120,0.4)" strokeWidth="1" />
      {/* Impact flash */}
      <rect x="122" y="92" width="22" height="62" rx="8" fill="rgba(255,200,60,0)"
        style={{ animation: "mc_padHit 0.55s ease 0.35s both" }} />

      {/* Ball coming from left */}
      <g style={{ animation: "mc_ballSide 0.38s ease-in both" }}>
        <circle cx="72" cy="122" r="7.5" fill="#c82020" />
        <path d="M69,121 Q72,129 75,121" fill="none" stroke="rgba(255,200,200,0.4)" strokeWidth="1.3" />
      </g>

      {/* Stumps (behind pad, muted) */}
      {[178, 185, 192].map((x, i) => (
        <rect key={i} x={x} y="96" width="4" height="58" rx="1" fill="#dcc47e" opacity="0.5" />
      ))}
      <rect x="177.5" y="94" width="19.5" height="3" rx="1.5" fill="#c0a060" opacity="0.5" />

      {/* Umpire body */}
      <rect   x="220" y="96"  width="16" height="42" rx="5"   fill="#2a3848" />
      <circle cx="228" cy="89" r="9"                           fill="#2a3848" />
      {/* Hat */}
      <rect x="220" y="80" width="16" height="4" rx="1"   fill="#1a2530" />
      <rect x="216" y="84" width="24" height="3" rx="1.5" fill="#1a2530" />

      {/* Arm + finger raising — pivot from shoulder */}
      <g style={{ transformOrigin: "222px 98px", animation: "mc_fingerRaise 0.65s ease-out 0.4s both" }}>
        <rect x="200" y="95" width="22" height="6" rx="3" fill="#2a3848" />
        <rect x="194" y="86" width="6"  height="15" rx="3" fill="#2a3848" />
      </g>
    </svg>
  );
}

// ─── Scene: RUN-OUT / STUMPED — stumps break (no approaching ball) ────────────
function StumpsBreakScene() {
  return (
    <svg width="280" height="160" viewBox="0 0 280 160" style={{ display: "block" }}>
      <rect width="280" height="160" fill="#050810" />
      <ellipse cx="140" cy="152" rx="118" ry="18" fill="#153d18" />
      <rect x="72" y="100" width="136" height="58" rx="8" fill="#b07848" />
      <line x1="78" y1="115" x2="202" y2="115" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />

      <g transform="translate(122,152)">
        <rect x="-3" y="-46" width="6" height="46" rx="1" fill="#dcc47e"
          style={{ animation: "mc_stump1 0.65s ease-out 0.1s both" }} />
      </g>
      <g transform="translate(140,152)">
        <rect x="-3" y="-46" width="6" height="46" rx="1" fill="#dcc47e"
          style={{ animation: "mc_stump2 0.70s ease-out 0.1s both" }} />
      </g>
      <g transform="translate(158,152)">
        <rect x="-3" y="-46" width="6" height="46" rx="1" fill="#dcc47e"
          style={{ animation: "mc_stump3 0.65s ease-out 0.1s both" }} />
      </g>
      <g style={{ animation: "mc_bail1 0.55s ease-out 0.12s both" }}>
        <rect x="119" y="104" width="20" height="3.5" rx="1.75" fill="#b89048" />
      </g>
      <g style={{ animation: "mc_bail2 0.55s ease-out 0.12s both" }}>
        <rect x="137" y="104" width="20" height="3.5" rx="1.75" fill="#b89048" />
      </g>
    </svg>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function MomentAnimation({ type, dismissalType }: MomentProps) {
  const scene =
    type === "six"                                               ? <SixScene />
    : dismissalType === DismissalType.Caught                    ? <CaughtScene />
    : dismissalType === DismissalType.LBW                       ? <LBWScene />
    : dismissalType === DismissalType.RunOut
      || dismissalType === DismissalType.Stumped                ? <StumpsBreakScene />
    : /* Bowled or unknown */                                      <BowledScene />;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 68,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          borderRadius: 14,
          overflow: "hidden",
          border: `1px solid ${type === "six" ? "rgba(234,179,8,0.3)" : "rgba(239,68,68,0.3)"}`,
          boxShadow: type === "six"
            ? "0 0 28px rgba(234,179,8,0.15)"
            : "0 0 28px rgba(239,68,68,0.15)",
          animation: "celebFade 1.65s ease both",
        }}
      >
        {scene}
      </div>
    </div>
  );
}
