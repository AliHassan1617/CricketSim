import { useState, useEffect, useRef, useCallback } from "react";
import { useGame } from "../state/gameContext";
import { BallOutcome, BattingIntent, BowlerLine, BowlerType, FieldType } from "../types/enums";
import { BallEvent, Innings } from "../types/match";
import { simulateBall } from "../engine/index";
import {
  getActiveInnings,
  getCurrentBatsmanOnStrike,
  getCurrentBatsmanNonStrike,
  getCurrentBowler,
  getRequiredRate,
  getAvailableBowlers,
  getAllPlayers,
} from "../state/selectors";
import { Player } from "../types/player";
import { BowlerChangeModal } from "../components/BowlerChangeModal";
import { FieldDiagram } from "../components/FieldDiagram";
import { PitchSelector, mapToEngineLine } from "../components/PitchSelector";
import { rpoToIntent } from "../components/RPOSlider";
import type { BowlingLineChoice, BowlingLengthChoice } from "../components/PitchSelector";
import { formatOvers, formatRunRate, formatEconomy } from "../utils/format";
import { useMultiplayer } from "../multiplayer/MultiplayerContext";
import { GuestMsg, MatchSnapshot } from "../multiplayer/types";
import { playCheer, playGroan } from "../utils/sounds";

// ─── Bat icon — shown next to the on-strike batsman ──────────────────────────
function BatIcon({ className }: { className?: string }) {
  return (
    <svg
      width="8"
      height="12"
      viewBox="0 0 8 12"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* Blade */}
      <rect x="0.5" y="0.5" width="7" height="7.5" rx="1.5" />
      {/* Handle */}
      <rect x="2.5" y="8" width="3" height="3.5" rx="1.5" />
    </svg>
  );
}

// ─── tiny helpers ────────────────────────────────────────────────────────────
function findPlayer(all: Player[], id: string) {
  return all.find((p) => p.id === id);
}
function dismissalShort(t?: string) {
  return t === "bowled" ? "b" : t === "caught" ? "c&b" : t === "lbw" ? "lbw"
       : t === "run-out" ? "run out" : t === "stumped" ? "st" : t ? "out" : "";
}
function rrColor(rr: number) {
  return rr < 8 ? "text-emerald-400" : rr < 12 ? "text-yellow-400" : "text-red-400";
}
function confBar(v: number) {
  return v >= 70 ? "bg-emerald-500" : v >= 45 ? "bg-yellow-500" : "bg-red-500";
}
function batsmanStatus(balls: number) {
  return balls < 6 ? "New" : balls < 16 ? "Getting Set" : "Settled";
}
function ballBg(o: BallOutcome) {
  return o === BallOutcome.Wicket ? "bg-red-600 text-white"
       : o === BallOutcome.Four   ? "bg-blue-600 text-white"
       : o === BallOutcome.Six    ? "bg-yellow-400 text-black"
       : o === BallOutcome.Dot    ? "bg-gray-700 text-gray-300"
       :                            "bg-emerald-700 text-white";
}
function ballLabel(o: BallOutcome, runs: number) {
  return o === BallOutcome.Wicket ? "W" : o === BallOutcome.Four ? "4"
       : o === BallOutcome.Six    ? "6" : o === BallOutcome.Dot  ? "·"
       : String(runs);
}
function computePartnership(innings: Innings): { runs: number; balls: number } {
  let lastWicketIdx = -1;
  for (let i = innings.allEvents.length - 1; i >= 0; i--) {
    if (innings.allEvents[i].outcome === BallOutcome.Wicket) { lastWicketIdx = i; break; }
  }
  const evts = innings.allEvents.slice(lastWicketIdx + 1);
  return {
    runs: evts.reduce((s, e) => s + e.runsScored, 0),
    balls: evts.filter(e => !e.isExtra).length,
  };
}

// ─── Per-over run totals (0-indexed by overNumber) ───────────────────────────
function getRunsPerOver(innings: Innings): number[] {
  const byOver: number[] = [];
  for (const ev of innings.allEvents) {
    if (byOver[ev.overNumber] === undefined) byOver[ev.overNumber] = 0;
    byOver[ev.overNumber] += ev.runsScored;
  }
  return byOver;
}

// ─── Worm chart — cumulative run progression ──────────────────────────────────
function WormChart({ innings, firstInnings, matchOvers }: {
  innings: Innings; firstInnings?: Innings | null; matchOvers: number;
}) {
  const W = 272, H = 88, padL = 26, padB = 16, padR = 6, padT = 6;
  const cW = W - padL - padR, cH = H - padT - padB;

  function buildWorm(inns: Innings) {
    const byOver = getRunsPerOver(inns);
    const pts: { x: number; y: number }[] = [{ x: 0, y: 0 }];
    let cum = 0;
    for (let i = 0; i < inns.totalOvers; i++) { cum += byOver[i] ?? 0; pts.push({ x: i + 1, y: cum }); }
    if (inns.ballsInCurrentOver > 0) {
      cum += byOver[inns.totalOvers] ?? 0;
      pts.push({ x: inns.totalOvers + inns.ballsInCurrentOver / 6, y: cum });
    }
    return pts;
  }

  const curr = buildWorm(innings);
  const first = firstInnings ? buildWorm(firstInnings) : null;
  const maxRuns = Math.max(...curr.map(p => p.y), first ? Math.max(...first.map(p => p.y)) : 0, 40);

  const toX = (ov: number) => padL + (ov / matchOvers) * cW;
  const toY = (r: number)  => padT + cH - (r / maxRuns) * cH;
  const path = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.x).toFixed(1)} ${toY(p.y).toFixed(1)}`).join(" ");

  const yTicks = [0, Math.round(maxRuns / 2), maxRuns];
  const step = matchOvers <= 5 ? 1 : matchOvers <= 10 ? 2 : 5;
  const xTicks: number[] = [];
  for (let i = 0; i <= matchOvers; i += step) xTicks.push(i);

  return (
    <svg width={W} height={H}>
      {yTicks.map(v => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={toY(v)} y2={toY(v)} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
          <text x={padL - 3} y={toY(v) + 3} fill="#6b7280" fontSize={7} textAnchor="end">{v}</text>
        </g>
      ))}
      {xTicks.map(v => (
        <text key={v} x={toX(v)} y={H - 2} fill="#6b7280" fontSize={7} textAnchor="middle">{v}</text>
      ))}
      {first && first.length > 1 && (
        <path d={path(first)} fill="none" stroke="#6b7280" strokeWidth={1.5} strokeDasharray="3,2" strokeLinejoin="round" />
      )}
      {curr.length > 1 && (
        <path d={path(curr)} fill="none" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {curr.length > 0 && (
        <circle cx={toX(curr[curr.length-1].x)} cy={toY(curr[curr.length-1].y)} r={3} fill="#10b981" />
      )}
    </svg>
  );
}

// ─── Runs per over bar chart ──────────────────────────────────────────────────
function RPOChart({ innings }: { innings: Innings }) {
  const byOver = getRunsPerOver(innings);
  const wicketsByOver = innings.allEvents.reduce((acc, ev) => {
    if (ev.outcome === BallOutcome.Wicket) acc[ev.overNumber] = true;
    return acc;
  }, {} as Record<number, boolean>);

  const overs = Array.from({ length: innings.totalOvers }, (_, i) => ({
    runs: byOver[i] ?? 0,
    wkt: wicketsByOver[i] ?? false,
  }));

  if (overs.length === 0) return (
    <p className="text-[11px] text-gray-600 text-center py-4">No completed overs yet</p>
  );

  const maxR = Math.max(...overs.map(o => o.runs), 10);
  const W = 272, H = 72;
  const gap = 1;
  const barW = Math.max(3, (W - 8) / overs.length - gap);

  return (
    <svg width={W} height={H + 14}>
      {overs.map((o, i) => {
        const bH = Math.max(2, (o.runs / maxR) * H);
        const x  = 4 + i * (barW + gap);
        const col = o.wkt ? "#ef4444" : o.runs >= 12 ? "#fbbf24" : o.runs >= 8 ? "#10b981" : o.runs >= 5 ? "#6b7280" : "#374151";
        return (
          <g key={i}>
            <rect x={x} y={H - bH} width={barW} height={bH} rx={1} fill={col} opacity={0.85} />
            {overs.length <= 20 && (
              <text x={x + barW / 2} y={H + 11} fill="#4b5563" fontSize={6.5} textAnchor="middle">{i + 1}</text>
            )}
            {o.runs > 0 && bH > 12 && (
              <text x={x + barW / 2} y={H - bH + 9} fill="rgba(255,255,255,0.7)" fontSize={7} textAnchor="middle">{o.runs}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function computeWinProb(runs: number, target: number, totalBalls: number, matchOvers: number, wickets: number): number {
  const remaining = target - runs;
  const remainingBalls = matchOvers * 6 - totalBalls;
  if (remaining <= 0) return 100;
  if (remainingBalls <= 0 || wickets >= 10) return 0;
  const reqRate = (remaining / remainingBalls) * 6;
  const wicketsInHand = 10 - wickets;
  const rateFactor   = Math.max(0, Math.min(1, (14 - reqRate) / 11));
  const wicketFactor = wicketsInHand / 10;
  return Math.round(Math.min(95, Math.max(5, rateFactor * 65 + wicketFactor * 35)));
}
/**
 * AI batting intent — per-ball decision using match situation + player character.
 * batsmanBalls / batsmanPower / batsmanConfidence give individual flavour.
 */
function getAIIntent(
  runs: number, wkts: number, overs: number,
  batsmanBalls: number, batsmanPower: number, batsmanConfidence: number,
  matchOvers: number,
  target?: number,
): BattingIntent {
  // New batsman: be cautious for the first 3 balls no matter what
  if (batsmanBalls < 3) return BattingIntent.Defensive;
  // Still settling (balls 3-7, low confidence): stay balanced
  if (batsmanBalls < 7 && batsmanConfidence < 55) return BattingIntent.Balanced;

  // naturalAgg: high-power player is innately more aggressive (0–1 scale)
  const naturalAgg = batsmanPower / 100;

  if (target !== undefined) {
    // CHASING — use per-ball required run rate for precision
    const remainingBalls = matchOvers * 6 - overs * 6;
    const reqRPO = remainingBalls > 0 ? ((target - runs) / remainingBalls) * 6 : 99;

    // With few wickets left, dial back aggression even in a desperate chase —
    // throwing the last batsmen away achieves nothing.
    const wicketsLeft = 10 - wkts;
    const wktScale = wicketsLeft <= 2 ? 0.50 : wicketsLeft <= 4 ? 0.75 : 1.0;

    // Raised thresholds vs old code: reqRPO 9-10 is tough but chaseable —
    // no need to swing for six from ball one.
    if (reqRPO > 15) return BattingIntent.Aggressive;
    if (reqRPO > 12) return Math.random() < 0.80 * wktScale ? BattingIntent.Aggressive : BattingIntent.Balanced;
    if (reqRPO > 10) return Math.random() < 0.60 * wktScale ? BattingIntent.Aggressive : BattingIntent.Balanced;
    if (reqRPO > 8)  return Math.random() < 0.42 * wktScale ? BattingIntent.Aggressive : BattingIntent.Balanced;
    if (reqRPO > 6.5) return Math.random() < 0.28 * wktScale ? BattingIntent.Aggressive : BattingIntent.Balanced;
    // Comfortable chase — rotate strike, stay calm
    return Math.random() < 0.18 * wktScale ? BattingIntent.Aggressive : BattingIntent.Balanced;
  }

  // FIRST INNINGS — build a big total
  if (overs >= matchOvers - 1) return BattingIntent.Aggressive; // last over: always swing

  if (overs >= matchOvers - 3) {
    // Death overs: near-always aggressive unless pure tail
    if (wkts >= 8) return BattingIntent.Balanced;
    return Math.random() < (0.80 + naturalAgg * 0.15) ? BattingIntent.Aggressive : BattingIntent.Balanced;
  }

  if (overs >= matchOvers - 5) {
    // Mid-late: push hard — even after wickets, keep scoring
    if (wkts >= 7) return Math.random() < 0.55 ? BattingIntent.Aggressive : BattingIntent.Balanced;
    if (wkts >= 4) return Math.random() < (0.52 + naturalAgg * 0.2) ? BattingIntent.Aggressive : BattingIntent.Balanced;
    return Math.random() < (0.58 + naturalAgg * 0.2) ? BattingIntent.Aggressive : BattingIntent.Balanced;
  }

  // Early/middle overs — no longer go defensive on wickets; keep scoring
  if (wkts >= 5) return Math.random() < 0.40 ? BattingIntent.Aggressive : BattingIntent.Balanced;
  if (wkts >= 3) return Math.random() < (0.38 + naturalAgg * 0.18) ? BattingIntent.Aggressive : BattingIntent.Balanced;

  // Set batsman + confident: start accelerating
  if (batsmanBalls > 10 && batsmanConfidence > 62)
    return Math.random() < (0.38 + naturalAgg * 0.22) ? BattingIntent.Aggressive : BattingIntent.Balanced;

  // Early, fresh, wickets in hand
  return Math.random() < (0.22 + naturalAgg * 0.15) ? BattingIntent.Aggressive : BattingIntent.Balanced;
}

/**
 * AI fielding choice — reacts to batsman freshness, match phase, and chase context.
 */
function getAIField(
  wkts: number, overs: number,
  strikerBalls: number, strikerConfidence: number,
  matchOvers: number,
  target?: number, currentRuns?: number,
): FieldType {
  // New batsman is always most vulnerable — always attack
  if (strikerBalls < 5) return FieldType.Attacking;

  // Tail is exposed — pack the field to save runs, not chase wickets
  if (wkts >= 8) return FieldType.Defensive;

  // Death overs: press for wickets or protect a big lead
  if (overs >= matchOvers - 2) {
    if (target !== undefined && currentRuns !== undefined) {
      const rem = matchOvers * 6 - overs * 6;
      const reqRPO = rem > 0 ? ((target - currentRuns) / rem) * 6 : 99;
      if (reqRPO < 4.5) return FieldType.Defensive; // user is comfortably ahead
    }
    return Math.random() < 0.68 ? FieldType.Attacking : FieldType.Balanced;
  }

  // Powerplay: aggressive to take wickets early
  if (overs < 3) return Math.random() < 0.62 ? FieldType.Attacking : FieldType.Balanced;

  // Very settled, dominant batsman → concede singles, block boundaries
  if (strikerBalls > 22 && strikerConfidence > 72)
    return Math.random() < 0.50 ? FieldType.Defensive : FieldType.Balanced;

  // Settled batsman: try to break them with attacking field
  if (strikerBalls > 12 && strikerConfidence > 60)
    return Math.random() < 0.42 ? FieldType.Attacking : FieldType.Balanced;

  return FieldType.Balanced;
}

/**
 * AI bowling line — targets the batsman's weaker side and varies for pace/spin/death.
 */
function getAIBowlingLine(
  batsmanPower: number, batsmanOffside: number, batsmanLegside: number,
  bowlerType: BowlerType, overs: number, matchOvers: number,
): BowlerLine {
  // Target weaker side
  if (batsmanOffside < batsmanLegside - 12)
    return Math.random() < 0.65 ? BowlerLine.OutsideOff : BowlerLine.OnStumps;
  if (batsmanLegside < batsmanOffside - 12)
    return Math.random() < 0.55 ? BowlerLine.OnPads : BowlerLine.OnStumps;

  // Death overs: vary length aggressively to disrupt timing
  if (overs >= matchOvers - 2) {
    const r = Math.random();
    if (r < 0.30) return BowlerLine.Short;
    if (r < 0.50) return BowlerLine.Full;
    if (r < 0.80) return BowlerLine.OnStumps;
    return BowlerLine.OutsideOff;
  }

  // Spinners: attack the stumps, draw the batsman forward
  if (bowlerType === BowlerType.Spin) {
    const r = Math.random();
    if (r < 0.40) return BowlerLine.OnStumps;
    if (r < 0.65) return BowlerLine.OutsideOff;
    if (r < 0.82) return BowlerLine.OnPads;
    return BowlerLine.Full;
  }

  // High-power batsman: mix short + full to disrupt rhythm
  if (batsmanPower > 70) {
    const r = Math.random();
    if (r < 0.25) return BowlerLine.Short;
    if (r < 0.45) return BowlerLine.Full;
    if (r < 0.78) return BowlerLine.OnStumps;
    return BowlerLine.OutsideOff;
  }

  // Standard pace: stay on/outside off stump
  const r = Math.random();
  if (r < 0.42) return BowlerLine.OnStumps;
  if (r < 0.72) return BowlerLine.OutsideOff;
  if (r < 0.87) return BowlerLine.Full;
  return BowlerLine.Short;
}

// ─── Vertical aggression slider ───────────────────────────────────────────────
// W=42px wide container, H=height prop tall container.
// Native range rotated -90° sits invisible on top for interaction.
function VerticalAggSlider({
  value, onChange, disabled, height = 140,
}: { value: number; onChange: (v: number) => void; disabled?: boolean; height?: number }) {
  const W   = 42;
  const H   = height;
  const pct = ((value - 4) / 8) * 100;
  const col       = pct < 37 ? "#3b82f6" : pct < 63 ? "#22c55e" : "#ef4444";
  const zoneLabel = pct < 37 ? "CAREFUL" : pct < 63 ? "BALANCED" : "ATTACK";
  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0 select-none">
      {/* Top: aggressive end */}
      <span className="text-[8px] font-black text-red-400 uppercase tracking-wide">AGG ▲</span>
      <div className="relative" style={{ width: W, height: H }}>
        {/* Gradient track bg */}
        <div
          className="absolute rounded-full"
          style={{
            left: 17, right: 17, top: 0, bottom: 0,
            background: "linear-gradient(to top, #3b82f6 0%, #22c55e 48%, #ef4444 100%)",
            opacity: 0.22,
          }}
        />
        {/* Colored fill */}
        <div
          className="absolute rounded-full transition-all duration-75"
          style={{ left: 17, right: 17, bottom: 0, height: `${pct}%`, backgroundColor: col }}
        />
        {/* Thumb */}
        <div
          className="absolute rounded-full border-2 shadow-lg transition-all duration-75"
          style={{
            left: 7, right: 7, height: 16,
            bottom: `calc(${pct}% - 8px)`,
            borderColor: "rgba(255,255,255,.7)", backgroundColor: col,
          }}
        />
        {/* Invisible native range for interaction */}
        <input
          type="range" min={4} max={12} step={0.5} value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute", width: H, height: W,
            left: (W - H) / 2, top: (H - W) / 2,
            transform: "rotate(-90deg)", opacity: 0,
            cursor: disabled ? "not-allowed" : "pointer",
            margin: 0, padding: 0,
          }}
        />
      </div>
      {/* Bottom: defensive end */}
      <span className="text-[8px] font-black text-blue-400 uppercase tracking-wide">▼ DEF</span>
      {/* Current zone label */}
      <span className="text-[9px] font-bold mt-0.5" style={{ color: col }}>
        {zoneLabel}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function MatchScreen() {
  const { state, dispatch } = useGame();

  const [playerRpo, setPlayerRpo]   = useState<Record<string, number>>({});
  const [field, setField]           = useState(FieldType.Balanced);
  const [aiField, setAiField]       = useState(FieldType.Balanced);
  const [bowlLine, setBowlLine]     = useState<BowlingLineChoice>("middle");
  const [bowlLength, setBowlLength] = useState<BowlingLengthChoice>("good");
  const [keepStrike, setKeepStrike] = useState(false);
  const [flash, setFlash]           = useState(false);
  const [tab, setTab]               = useState<"batting"|"bowling">("batting");
  const [mobileTab, setMobileTab]   = useState<"score"|"controls">("controls");
  const [overSummary, setOverSummary] = useState<{
    over: number; runs: number; wickets: number;
    bowlerName: string; spellOvers: number; spellRuns: number; spellWickets: number;
    events: BallEvent[];
  } | null>(null);
  const [celebration, setCelebration] = useState<{ type: "six" | "wicket"; text: string } | null>(null);
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [milestone, setMilestone]   = useState<string | null>(null);
  const [isPaused, setIsPaused]                   = useState(false);
  const [pauseView, setPauseView]                 = useState<"menu"|"scorecard"|"worm">("menu");
  const [simOverTarget, setSimOverTarget]         = useState<number | null>(null);
  const [openerStrikerId, setOpenerStrikerId]     = useState<string | null>(null);
  const [openerNonStrikerId, setOpenerNonStrikerId] = useState<string | null>(null);
  const prevOverRef    = useRef(0);
  const milestoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matchTime       = useRef(new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }));
  const innings         = getActiveInnings(state);
  const prevStriker     = useRef<string|null>(null);

  // ── Multiplayer ────────────────────────────────────────────────────────────
  const mp               = useMultiplayer();
  const isHost           = mp.role === "host";
  const isMultiplayer    = mp.role !== null;
  const [mpWaiting, setMpWaiting] = useState(false);  // waiting for guest's ball input
  const pendingHostInput = useRef<{ intent?: BattingIntent; line?: BowlerLine } | null>(null);
  const prevBallCount    = useRef(0);
  const strikerId       = innings?.batsmen[innings?.currentBatsmanOnStrike]?.playerId ?? null;
  const handleNextBallRef = useRef<() => void>(() => {});

  // Auto-bowler: fires when a new over starts and an AI-controlled side needs a bowler.
  // Covers: user batting (AI always auto-picks) AND simulate mode (AI picks for user bowling too).
  // In multiplayer host mode: when user is batting (guest is bowling), ask guest to pick instead.
  useEffect(() => {
    if (!innings || !state.needsBowlerChange) return;

    // Multiplayer host: guest's team is bowling (isBatting=true) → ask guest to pick
    if (isHost && innings.isUserBatting) {
      const avail = getAvailableBowlers(innings);
      const allP  = getAllPlayers(state);
      const eligible = avail.map(b => {
        const p = allP.find(pl => pl.id === b.playerId);
        return { id: b.playerId, name: p?.shortName ?? b.playerId, overs: b.overs, runs: b.runsConceded };
      });
      mp.sendMessage({ t: "NEED_GUEST_BOWLER", eligible });
      return;
    }

    if (!innings.isUserBatting && !state.isSimulating) return;
    const avail = getAvailableBowlers(innings);
    if (avail.length === 0) return;
    const players = getAllPlayers(state);
    const isDeath = innings.totalOvers >= 8;
    // Score bowlers by situation: death overs favour deathBowling + variation
    const scored = avail.map(b => {
      const p = players.find(pl => pl.id === b.playerId);
      if (!p) return { b, score: 0 };
      const { mainSkill, control, variation, deathBowling, lineDiscipline } = p.bowling;
      const score = isDeath
        ? mainSkill + deathBowling * 1.5 + variation * 0.7
        : mainSkill + control * 0.8 + lineDiscipline * 0.5 + variation * 0.4;
      return { b, score };
    });
    scored.sort((a, z) => z.score - a.score);
    // Pick from top 2 to stay unpredictable
    const topN = scored.slice(0, Math.min(2, scored.length));
    const pick = topN[Math.floor(Math.random() * topN.length)];
    dispatch({ type: "CHANGE_BOWLER", payload: { bowlerId: pick.b.playerId } });
  }, [state.needsBowlerChange, innings?.isUserBatting, state.isSimulating]);

  useEffect(() => {
    const prev = prevStriker.current;
    prevStriker.current = strikerId;
    if (prev !== null && strikerId !== prev) {
      setKeepStrike(false);
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 2500);
      return () => clearTimeout(t);
    }
  }, [strikerId]);

  // Over summary — detect when totalOvers increments and show a closeable modal
  useEffect(() => {
    const curr = innings?.totalOvers ?? 0;
    const prev = prevOverRef.current;
    prevOverRef.current = curr;
    if (curr <= prev || curr === 0) return;
    // Gather events from the over that just ended (overNumber === prev)
    const overEvts = innings?.allEvents.filter(e => e.overNumber === prev) ?? [];
    const runsInOver = overEvts.reduce((s, e) => s + e.runsScored, 0);
    const wktsInOver = overEvts.filter(e => e.outcome === BallOutcome.Wicket).length;
    const lastEv = overEvts[overEvts.length - 1];
    const bowlerSpell = innings?.bowlers.find(b => b.playerId === lastEv?.bowlerId);
    const bowlerName = lastEv
      ? (getAllPlayers(state).find(p => p.id === lastEv.bowlerId)?.shortName ?? "?")
      : "?";
    setOverSummary({
      over: curr,
      runs: runsInOver,
      wickets: wktsInOver,
      bowlerName,
      spellOvers: bowlerSpell?.overs ?? 0,
      spellRuns: bowlerSpell?.runsConceded ?? runsInOver,
      spellWickets: bowlerSpell?.wickets ?? wktsInOver,
      events: overEvts,
    });
    // In simulate mode auto-dismiss so the game keeps flowing
    if (state.isSimulating) {
      const t = setTimeout(() => setOverSummary(null), 1800);
      return () => clearTimeout(t);
    }
  }, [innings?.totalOvers]);

  // Milestones — detect 50/100 for batsmen, 3-for/5-for for bowlers, + celebration flashes
  useEffect(() => {
    if (!innings) return;
    const ev = innings.allEvents[innings.allEvents.length - 1];
    if (!ev) return;
    const allP = getAllPlayers(state);

    // ── Celebration flash (SIX / WICKET) + crowd sounds ──────────────────
    if (ev.outcome === BallOutcome.Six) {
      if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
      const batsmanP = allP.find(pl => pl.id === ev.batsmanId);
      setCelebration({ type: "six", text: batsmanP?.shortName ?? "SIX!" });
      celebrationTimer.current = setTimeout(() => setCelebration(null), 1600);
      if (isBatting) playCheer(); else playGroan();
    } else if (ev.outcome === BallOutcome.Wicket) {
      if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
      const bowlerP = allP.find(pl => pl.id === ev.bowlerId);
      const batsmanP = allP.find(pl => pl.id === ev.batsmanId);
      setCelebration({ type: "wicket", text: batsmanP ? `${batsmanP.shortName} OUT!` : "WICKET!" });
      celebrationTimer.current = setTimeout(() => setCelebration(null), 1800);
      if (isBatting) playGroan(); else playCheer();
    }

    const bat = innings.batsmen.find(b => b.playerId === ev.batsmanId);
    if (bat && !bat.isOut) {
      const p = allP.find(pl => pl.id === bat.playerId);
      if (p) {
        if (bat.runs === 50)  { showMs(`FIFTY! ${p.shortName} reaches 50!`); }
        if (bat.runs === 100) { showMs(`CENTURY! ${p.shortName} hits 100!`); }
      }
    }
    if (ev.outcome === BallOutcome.Wicket) {
      const bowl = innings.bowlers.find(b => b.playerId === ev.bowlerId);
      const p = allP.find(pl => pl.id === ev.bowlerId);
      if (bowl && p) {
        if (bowl.wickets === 3) { showMs(`3-for! ${p.shortName} takes 3 wickets!`); }
        if (bowl.wickets === 5) { showMs(`FIVE-FOR! ${p.shortName} takes 5 wickets!`); }
      }
    }
  }, [innings?.allEvents.length]);

  function showMs(msg: string) {
    if (milestoneTimer.current) clearTimeout(milestoneTimer.current);
    setMilestone(msg);
    milestoneTimer.current = setTimeout(() => setMilestone(null), 3200);
  }

  // Simulate loop — fires handleNextBall as fast as React can process when active
  useEffect(() => {
    if (!state.isSimulating) return;
    if (state.pendingBatsmanSelection) return;
    if (overSummary) return; // pause while over-summary modal is open (auto-dismissed in sim mode)
    const inns = getActiveInnings(state);
    if (!inns || inns.isComplete || state.needsBowlerChange) return;
    if (!getCurrentBatsmanOnStrike(inns) || !getCurrentBowler(inns)) return;
    // Stop when simulating a single over and the target over is reached
    if (simOverTarget !== null && inns.totalOvers >= simOverTarget) {
      dispatch({ type: "SET_SIMULATING", payload: { value: false } });
      setSimOverTarget(null);
      return;
    }
    const t = setTimeout(() => { handleNextBallRef.current(); }, 8);
    return () => clearTimeout(t);
  }, [state, simOverTarget]);

  if (!innings) return null;

  const allPlayers    = getAllPlayers(state);
  const onStrike      = getCurrentBatsmanOnStrike(innings);
  const nonStrike     = getCurrentBatsmanNonStrike(innings);
  const curBowler     = getCurrentBowler(innings);
  const reqRate       = getRequiredRate(innings);
  const isSecond      = state.currentInnings === 2;
  const totalBalls    = innings.totalOvers * 6 + innings.ballsInCurrentOver;
  const isBatting     = innings.isUserBatting;

  const strikerP    = onStrike  ? findPlayer(allPlayers, onStrike.playerId)  : undefined;
  const nonStrikerP = nonStrike ? findPlayer(allPlayers, nonStrike.playerId) : undefined;
  const bowlerP     = curBowler ? findPlayer(allPlayers, curBowler.playerId) : undefined;
  const bowlerBalls = curBowler ? curBowler.overs * 6 + curBowler.ballsInCurrentOver : 0;
  const canPlay     = !innings.isComplete && !state.needsBowlerChange && !!onStrike && !!curBowler;

  const getRpo    = (id: string) => playerRpo[id] ?? 6.5;
  const setRpoFor = (id: string, v: number) => setPlayerRpo(p => ({ ...p, [id]: v }));
  const sRpo      = onStrike  ? getRpo(onStrike.playerId)  : 6.5;
  const nsRpo     = nonStrike ? getRpo(nonStrike.playerId) : 6.5;
  const diagField = isBatting ? aiField : field;
  const extras    = innings.extras.wides + innings.extras.noBalls;

  // Run ball with explicit inputs (used in both single-player and multiplayer)
  const runBall = useCallback((
    hostIntent: BattingIntent,
    hostLine:   BowlerLine | undefined,
    guestIntent: BattingIntent | undefined,
    guestLine:   BowlerLine | undefined,
    _isBatting: boolean,
    _innings: Innings,
  ) => {
    if (!onStrike || !curBowler) return;
    const bsStats = findPlayer(getAllPlayers(state), onStrike.playerId);
    const blStats = findPlayer(getAllPlayers(state), curBowler.playerId);
    if (!bsStats || !blStats) return;

    let intent: BattingIntent;
    let ef: FieldType;
    let line: BowlerLine | undefined;

    if (_isBatting) {
      // Host batting: host sets intent, guest/AI sets line+field
      intent = hostIntent;
      ef = getAIField(
        _innings.totalWickets, _innings.totalOvers,
        onStrike.balls, onStrike.confidence,
        _innings.matchOvers, _innings.target, _innings.totalRuns,
      );
      setAiField(ef);
      line = isMultiplayer ? guestLine : getAIBowlingLine(
        bsStats.batting.power, bsStats.batting.offsideSkill, bsStats.batting.legsideSkill,
        blStats.bowling.bowlerType, _innings.totalOvers, _innings.matchOvers,
      );
    } else {
      // Host bowling: host sets line, guest/AI sets intent
      intent = isMultiplayer ? (guestIntent ?? BattingIntent.Balanced) : hostIntent;
      ef = field;
      line = hostLine;
    }

    let ev = simulateBall(onStrike, curBowler, bsStats, blStats,
      state.pitchType, intent, ef, _innings, _innings.target, line);

    if (keepStrike && _isBatting && _innings.ballsInCurrentOver === 5
        && ev.outcome === BallOutcome.Dot && Math.random() < 0.45) {
      ev = { ...ev, outcome: BallOutcome.Single, runsScored: 1 };
    }
    dispatch({ type: "PROCESS_BALL_RESULT", payload: { event: ev } });
  }, [onStrike, curBowler, state, field, keepStrike, isMultiplayer, dispatch]);

  const handleNextBall = () => {
    if (!onStrike || !curBowler || !canPlay) return;
    const bsStats = findPlayer(allPlayers, onStrike.playerId);
    const blStats = findPlayer(allPlayers, curBowler.playerId);
    if (!bsStats || !blStats) return;

    const aiIntent = getAIIntent(
      innings.totalRuns, innings.totalWickets, innings.totalOvers,
      onStrike.balls, bsStats.batting.power, onStrike.confidence,
      innings.matchOvers, innings.target,
    );
    const aiLine = getAIBowlingLine(
      bsStats.batting.power, bsStats.batting.offsideSkill, bsStats.batting.legsideSkill,
      blStats.bowling.bowlerType, innings.totalOvers, innings.matchOvers,
    );

    // ── Multiplayer host: submit input, wait for guest ────────────────────
    if (isHost && !state.isSimulating) {
      const myIntent = isBatting ? rpoToIntent(sRpo) : aiIntent;
      const myLine   = isBatting ? undefined : mapToEngineLine(bowlLine, bowlLength);
      pendingHostInput.current = { intent: myIntent, line: myLine };
      mp.sendMessage({ t: "HOST_BALL_READY" });
      setMpWaiting(true);
      return;  // wait for GUEST_BALL_INPUT before running
    }

    // ── Single-player / simulate mode ────────────────────────────────────
    const intent = !isBatting || state.isSimulating ? aiIntent : rpoToIntent(sRpo);
    const chosenLine = isBatting ? aiLine : (state.isSimulating ? aiLine : mapToEngineLine(bowlLine, bowlLength));
    const ef = isBatting
      ? (() => {
          const f = getAIField(innings.totalWickets, innings.totalOvers, onStrike.balls,
            onStrike.confidence, innings.matchOvers, innings.target, innings.totalRuns);
          setAiField(f); return f;
        })()
      : field;

    let ev = simulateBall(onStrike, curBowler, bsStats, blStats,
      state.pitchType, intent, ef, innings, innings.target, chosenLine);

    if (keepStrike && isBatting && innings.ballsInCurrentOver === 5
        && ev.outcome === BallOutcome.Dot && Math.random() < 0.45) {
      ev = { ...ev, outcome: BallOutcome.Single, runsScored: 1 };
    }
    dispatch({ type: "PROCESS_BALL_RESULT", payload: { event: ev } });
  };

  // Keep ref pointing at latest handleNextBall (avoids stale closure in simulate loop)
  handleNextBallRef.current = handleNextBall;

  // ── Multiplayer: listen for guest messages ──────────────────────────────
  useEffect(() => {
    if (!isHost) return;
    const unsub = mp.onMessage((raw) => {
      const msg = raw as GuestMsg;

      if (msg.t === "GUEST_BALL_INPUT" && pendingHostInput.current) {
        const hi = pendingHostInput.current;
        pendingHostInput.current = null;
        setMpWaiting(false);
        // Pull fresh innings/flags via ref
        const freshInnings = getActiveInnings(state);
        const freshIsBatting = freshInnings?.isUserBatting ?? isBatting;
        if (freshInnings) {
          runBall(
            hi.intent ?? BattingIntent.Balanced,
            hi.line,
            msg.intent,
            msg.line,
            freshIsBatting,
            freshInnings,
          );
        }
      }

      if (msg.t === "GUEST_BOWLER") {
        dispatch({ type: "CHANGE_BOWLER", payload: { bowlerId: msg.bowlerId } });
      }

      if (msg.t === "GUEST_NEXT_BATSMAN") {
        dispatch({ type: "SELECT_NEXT_BATSMAN", payload: { batsmanId: msg.batsmanId } });
      }
    });
    return unsub;
  }, [isHost, mp, runBall, state, isBatting, dispatch]);

  // ── Multiplayer: 6s auto-submit if guest doesn't respond ───────────────
  useEffect(() => {
    if (!isHost || !mpWaiting) return;
    const t = setTimeout(() => {
      const hi = pendingHostInput.current;
      if (!hi) return;
      pendingHostInput.current = null;
      setMpWaiting(false);
      const freshInnings  = getActiveInnings(state);
      const freshIsBatting = freshInnings?.isUserBatting ?? isBatting;
      if (freshInnings) {
        // Use balanced defaults for the guest who didn't respond in time
        runBall(
          hi.intent ?? BattingIntent.Balanced,
          hi.line,
          freshIsBatting ? BattingIntent.Balanced : undefined,
          freshIsBatting ? undefined : BowlerLine.OnStumps,
          freshIsBatting,
          freshInnings,
        );
      }
    }, 6000);
    return () => clearTimeout(t);
  }, [mpWaiting, isHost]);

  // ── Multiplayer: send snapshot after each ball ──────────────────────────
  useEffect(() => {
    if (!isHost || !innings) return;
    const ballCount = innings.allEvents.length;
    if (ballCount <= prevBallCount.current) return;
    prevBallCount.current = ballCount;

    // Build snapshot
    const allP    = getAllPlayers(state);
    const striker = onStrike  ? (() => { const p = findPlayer(allP, onStrike.playerId);  return p ? { name: p.shortName, runs: onStrike.runs,  balls: onStrike.balls  } : null; })() : null;
    const nStrike = nonStrike ? (() => { const p = findPlayer(allP, nonStrike.playerId); return p ? { name: p.shortName, runs: nonStrike.runs, balls: nonStrike.balls } : null; })() : null;
    const bowler  = curBowler ? (() => { const p = findPlayer(allP, curBowler.playerId); return p ? { name: p.shortName, overs: formatOvers(curBowler.overs * 6 + curBowler.ballsInCurrentOver), runs: curBowler.runsConceded, wickets: curBowler.wickets } : null; })() : null;

    const availBowlers = getAvailableBowlers(innings).map(b => {
      const p = allP.find(pl => pl.id === b.playerId);
      return { id: b.playerId, name: p?.shortName ?? b.playerId, overs: b.overs, runs: b.runsConceded };
    });

    const isOver = innings.isComplete || state.phase === "final-scorecard" || state.phase === "innings-summary";
    const matchResult = innings.isComplete
      ? (innings.target && innings.totalRuns >= innings.target
          ? `${state.opponentTeam?.name ?? "Guest"} won!`
          : `${state.userTeam?.name ?? "Host"} won!`)
      : undefined;

    // Last ball info for celebrations + current-over ball tracker
    const lastEv = innings.allEvents[innings.allEvents.length - 1];
    const lastOutcome = lastEv
      ? (lastEv.outcome === BallOutcome.Wicket ? "W"
         : lastEv.outcome === BallOutcome.Six  ? "6"
         : lastEv.outcome === BallOutcome.Four ? "4"
         : lastEv.outcome === BallOutcome.Dot  ? "." : String(lastEv.runsScored))
      : null;
    const lastBatsmanName = lastEv ? (allP.find(p => p.id === lastEv.batsmanId)?.shortName ?? null) : null;
    const lastBowlerName  = lastEv ? (allP.find(p => p.id === lastEv.bowlerId)?.shortName ?? null) : null;

    const currentOverBalls = innings.currentOverEvents.map(ev => ({
      outcome: ev.outcome === BallOutcome.Wicket ? "W"
             : ev.outcome === BallOutcome.Six    ? "6"
             : ev.outcome === BallOutcome.Four   ? "4"
             : ev.outcome === BallOutcome.Dot    ? "." : String(ev.runsScored),
      runs: ev.runsScored,
      commentary: ev.commentary,
    }));

    // Detect over-just-completed (when ballsInCurrentOver resets to 0 after an over)
    const prevOver = prevBallCount.current > 0
      ? Math.floor((prevBallCount.current - 1) / 6) : -1;
    const overJustEnded = innings.ballsInCurrentOver === 0 && innings.totalOvers > 0
      && innings.totalOvers > prevOver;
    let overJustCompleted = null;
    if (overJustEnded) {
      const completedOverIdx = innings.totalOvers - 1;
      const overEvts = innings.allEvents.filter(e => e.overNumber === completedOverIdx);
      const bowlerOfOver = overEvts[overEvts.length - 1]
        ? (allP.find(p => p.id === overEvts[overEvts.length - 1].bowlerId)?.shortName ?? "?")
        : "?";
      overJustCompleted = {
        over: innings.totalOvers,
        runs: overEvts.reduce((s, e) => s + e.runsScored, 0),
        wickets: overEvts.filter(e => e.outcome === BallOutcome.Wicket).length,
        bowlerName: bowlerOfOver,
        balls: overEvts.map(ev => ({
          outcome: ev.outcome === BallOutcome.Wicket ? "W"
                 : ev.outcome === BallOutcome.Six    ? "6"
                 : ev.outcome === BallOutcome.Four   ? "4"
                 : ev.outcome === BallOutcome.Dot    ? "." : String(ev.runsScored),
          runs: ev.runsScored,
          commentary: ev.commentary,
        })),
      };
    }

    const snap: MatchSnapshot = {
      inningsNum:   state.currentInnings as 1 | 2,
      hostTeamName: state.userTeam?.name ?? "Host",
      guestTeamName: state.opponentTeam?.name ?? "Guest",
      hostBatting:  innings.isUserBatting,
      runs:         innings.totalRuns,
      wickets:      innings.totalWickets,
      totalBalls:   innings.allEvents.length,
      totalOvers:   innings.totalOvers,
      overs:        formatOvers(innings.totalOvers * 6 + innings.ballsInCurrentOver),
      target:       innings.target,
      striker,
      nonStriker:   nStrike,
      bowler,
      recentCommentary: innings.allEvents.slice(-8).map(e => e.commentary),
      currentOverBalls,
      lastOutcome,
      lastBatsmanName,
      lastBowlerName,
      overJustCompleted,
      guestXI:            state.opponentTeam?.players.slice(0, 11).map(p => p.id) ?? [],
      guestBattingOrder:  innings.isUserBatting ? [] : innings.battingOrder,
      needsGuestBowler:   innings.isUserBatting && state.needsBowlerChange,
      guestEligibleBowlers: innings.isUserBatting && state.needsBowlerChange ? availBowlers : [],
      needsGuestNextBatsman: false,
      guestRemainingBatsmen: [],
      allBatsmen: innings.batsmen.map((bat, bi) => {
        const p = allP.find(pl => pl.id === bat.playerId);
        return {
          name: p?.shortName ?? bat.playerId,
          runs: bat.runs, balls: bat.balls, fours: bat.fours, sixes: bat.sixes,
          isOut: bat.isOut, dismissalType: bat.dismissalType,
          isOnStrike: bi === innings.currentBatsmanOnStrike && !innings.isComplete,
          isNonStrike: bi === innings.currentBatsmanNonStrike && !innings.isComplete,
          confidence: bat.confidence, role: p?.role ?? "batsman",
        };
      }),
      allBowlers: innings.bowlers
        .filter(b => b.overs > 0 || b.ballsInCurrentOver > 0)
        .map(b => {
          const p = allP.find(pl => pl.id === b.playerId);
          return {
            name: p?.shortName ?? b.playerId,
            balls: b.overs * 6 + b.ballsInCurrentOver,
            runs: b.runsConceded, wickets: b.wickets,
            isCurrent: b.playerId === curBowler?.playerId,
            confidence: b.confidence,
          };
        }),
      fieldType: isBatting ? (aiField as string) : (field as string),
      extras: innings.extras.wides + innings.extras.noBalls,
      matchOvers: innings.matchOvers,
      currentOverNumber: innings.totalOvers,
      partnership: (() => {
        let lastWicketIdx = -1;
        for (let pi = innings.allEvents.length - 1; pi >= 0; pi--) {
          if (innings.allEvents[pi].outcome === BallOutcome.Wicket) { lastWicketIdx = pi; break; }
        }
        const pEvts = innings.allEvents.slice(lastWicketIdx + 1);
        return { runs: pEvts.reduce((s, e) => s + e.runsScored, 0), balls: pEvts.filter(e => !e.isExtra).length };
      })(),
      bowlerType: bowlerP?.bowling.bowlerType ?? "",
      bowlerMaxOvers: curBowler?.maxOvers ?? 0,
      bowlerConfidence: curBowler?.confidence ?? 70,
      isMatchOver:  isOver,
      matchResult,
    };

    if (isOver) {
      mp.sendMessage({ t: "MATCH_OVER", snapshot: snap });
    } else {
      mp.sendMessage({ t: "BALL_RESULT", snapshot: snap });
    }
  }, [innings?.allEvents.length, isHost]);

  // ── Multiplayer: send MATCH_CONFIG + TOSS on first innings mount ────────
  useEffect(() => {
    if (!isHost || state.currentInnings !== 1) return;
    const opp = state.opponentTeam;
    if (!opp) return;
    const guestXI = opp.players.slice(0, 11).map(p => p.id);
    mp.sendMessage({
      t: "MATCH_CONFIG",
      guestTeamId:  opp.id,
      format:       state.format,
      pitchType:    state.pitchType,
      stadiumName:  state.stadium?.name ?? "Unknown Stadium",
      guestXI,
    });
    mp.sendMessage({ t: "TOSS", hostBatsFirst: state.userBatsFirst });
  }, []); // fires once on mount

  // last 6 events for the tracker (sliding window)
  const trackerEvents = innings.currentOverEvents.slice(-6);

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full text-white overflow-hidden"
         style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1117 50%, #0a1628 100%)" }}>

      {/* Multiplayer waiting overlay */}
      {isHost && mpWaiting && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 60,
            background: "rgba(5,14,24,0.85)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            className="text-center px-8 py-6 rounded-2xl space-y-3"
            style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)" }}
          >
            <span className="block w-3 h-3 rounded-full bg-indigo-400 animate-pulse mx-auto" />
            <p className="text-indigo-300 font-semibold text-sm">
              Waiting for opponent…
            </p>
            <p className="text-gray-500 text-xs">
              {isBatting ? "Opponent is choosing their bowling line" : "Opponent is setting their batting intent"}
            </p>
          </div>
        </div>
      )}

      {/* Multiplayer status bar */}
      {isMultiplayer && (
        <div
          className="flex items-center gap-2 px-3 py-1 text-xs shrink-0"
          style={{ background: "rgba(99,102,241,0.1)", borderBottom: "1px solid rgba(99,102,241,0.15)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span className="text-indigo-400 font-semibold">{isHost ? "HOST" : "GUEST"}</span>
          <span className="text-gray-600 mx-1">·</span>
          <span className="text-gray-500">vs {state.opponentTeam?.shortName}</span>
          {mp.roomCode && <span className="ml-auto text-gray-600 font-mono">{mp.roomCode}</span>}
        </div>
      )}

      {/* ── Celebration overlay (SIX / WICKET) ── */}
      {celebration && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 70,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
            animation: "celebFade 1.6s ease forwards",
          }}
        >
          {/* Coloured radial burst */}
          <div style={{
            position: "absolute", inset: 0,
            background: celebration.type === "six"
              ? "radial-gradient(ellipse at center, rgba(234,179,8,0.45) 0%, rgba(234,179,8,0.0) 65%)"
              : "radial-gradient(ellipse at center, rgba(239,68,68,0.5) 0%, rgba(239,68,68,0.0) 65%)",
          }} />
          <div className="relative text-center px-10 py-8 rounded-3xl space-y-2" style={{
            background: celebration.type === "six"
              ? "rgba(30,25,0,0.75)"
              : "rgba(30,0,0,0.75)",
            border: celebration.type === "six"
              ? "2px solid rgba(234,179,8,0.6)"
              : "2px solid rgba(239,68,68,0.6)",
            backdropFilter: "blur(8px)",
            boxShadow: celebration.type === "six"
              ? "0 0 60px rgba(234,179,8,0.35)"
              : "0 0 60px rgba(239,68,68,0.35)",
          }}>
            <p className="text-5xl font-black tracking-tight" style={{
              color: celebration.type === "six" ? "#facc15" : "#f87171",
              textShadow: celebration.type === "six"
                ? "0 0 30px rgba(234,179,8,0.8)"
                : "0 0 30px rgba(239,68,68,0.8)",
            }}>
              {celebration.type === "six" ? "SIX!" : "WICKET!"}
            </p>
            <p className="text-sm font-semibold" style={{
              color: celebration.type === "six" ? "#fde68a" : "#fca5a5",
            }}>
              {celebration.text}
            </p>
          </div>
        </div>
      )}

      {/* ── Over summary modal ── */}
      {overSummary && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 60,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "#0d1b12", border: "1px solid rgba(16,185,129,0.3)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3"
                 style={{ background: "rgba(16,185,129,0.12)", borderBottom: "1px solid rgba(16,185,129,0.2)" }}>
              <div>
                <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">
                  End of Over {overSummary.over}
                </p>
                <p className="text-base font-bold text-white mt-0.5">
                  {overSummary.runs} runs · {overSummary.wickets} wkt{overSummary.wickets !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setOverSummary(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-lg font-bold"
              >
                ×
              </button>
            </div>

            {/* Bowler info */}
            <div className="px-5 py-2.5 flex items-center gap-3"
                 style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-emerald-900 text-emerald-400 shrink-0">
                {overSummary.bowlerName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{overSummary.bowlerName}</p>
                <p className="text-[11px] text-gray-500">
                  {overSummary.spellOvers}-0-{overSummary.spellRuns}-{overSummary.spellWickets}
                  &nbsp;·&nbsp;
                  Econ {overSummary.spellOvers > 0
                    ? (overSummary.spellRuns / overSummary.spellOvers).toFixed(1)
                    : "—"}
                </p>
              </div>
            </div>

            {/* Ball-by-ball */}
            <div className="px-5 py-3 space-y-1.5 max-h-52 overflow-y-auto">
              {overSummary.events.map((ev, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  {/* Ball badge */}
                  <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    ev.outcome === BallOutcome.Wicket ? "bg-red-600 text-white"
                    : ev.outcome === BallOutcome.Six   ? "bg-yellow-400 text-black"
                    : ev.outcome === BallOutcome.Four  ? "bg-blue-600 text-white"
                    : ev.outcome === BallOutcome.Dot   ? "bg-gray-700 text-gray-400"
                    : "bg-emerald-700 text-white"
                  }`}>
                    {ev.outcome === BallOutcome.Wicket ? "W"
                     : ev.outcome === BallOutcome.Six  ? "6"
                     : ev.outcome === BallOutcome.Four ? "4"
                     : ev.outcome === BallOutcome.Dot  ? "·"
                     : String(ev.runsScored)}
                  </span>
                  <p className="text-[11px] text-gray-400 leading-tight pt-0.5 flex-1">{ev.commentary}</p>
                </div>
              ))}
            </div>

            {/* Continue button */}
            <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={() => setOverSummary(null)}
                className="w-full py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.97]"
                style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.25)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.15)"; }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Milestone popup ── */}
      {milestone && (
        <div
          style={{
            position: "fixed", top: overSummary ? 136 : 64, left: "50%", zIndex: 51,
            transform: "translateX(-50%)",
            animation: "slideDown 0.3s ease",
            background: "rgba(30,20,5,0.96)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(250,204,21,0.4)",
          }}
          className="px-5 py-2.5 rounded-xl shadow-2xl text-center pointer-events-none"
        >
          <p className="text-base font-bold text-yellow-300">{milestone}</p>
        </div>
      )}

      {/* ══ HEADER ══ */}
      <div className="shrink-0 flex flex-col items-center justify-center px-4 py-3 md:py-4 gap-1"
           style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(255,255,255,0.09)" }}>

        {/* Venue + time — desktop only, above the names */}
        <p className="hidden md:block text-[10px] text-gray-600 tracking-wide uppercase">
          Dubai Stadium · {matchTime.current} · {state.format} · {isSecond ? "2nd" : "1st"} Innings
        </p>

        {/* Team names — centred, big */}
        <div className="flex items-center gap-3 md:gap-5">
          <span className="text-base md:text-2xl font-extrabold tracking-tight text-white truncate max-w-[120px] md:max-w-none text-right">
            {innings.battingTeamName}
          </span>
          <span className="text-xs md:text-sm text-gray-500 font-medium shrink-0">vs</span>
          <span className="text-base md:text-2xl font-extrabold tracking-tight text-gray-400 truncate max-w-[120px] md:max-w-none">
            {innings.bowlingTeamName}
          </span>
        </div>

        {/* Score line — centred below names */}
        <div className="flex items-center gap-2 md:gap-3 mt-0.5">
          <span className="text-lg md:text-3xl font-black tabular-nums text-emerald-300 leading-none">
            {innings.totalRuns}/{innings.totalWickets}
          </span>
          <span className="text-xs md:text-sm text-gray-500 tabular-nums">
            ({formatOvers(totalBalls)} ov)
          </span>
          <span className="hidden md:inline text-xs text-gray-600">
            · RR {formatRunRate(innings.totalRuns, totalBalls)}
          </span>
          {reqRate !== null && (
            <span className={`text-xs md:text-sm font-bold ${rrColor(reqRate)}`}>
              · Need {reqRate.toFixed(1)}/ov
            </span>
          )}
          <span className="md:hidden text-[10px] text-gray-500">
            {isBatting ? "Batting" : "Bowling"}
          </span>
        </div>

        {/* PowerPlay badge */}
        {(() => {
          const ppOvers = innings.matchOvers === 5 ? 1
                        : innings.matchOvers === 20 ? 6 : 2;
          const isInPP = innings.totalOvers < ppOvers;
          return isInPP ? (
            <div
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24" }}
            >
              ⚡ Powerplay · {ppOvers - innings.totalOvers} ov left
            </div>
          ) : null;
        })()}

        {/* Win probability bar — 2nd innings only */}
        {isSecond && innings.target !== undefined && (() => {
          const winProb = computeWinProb(innings.totalRuns, innings.target, totalBalls, innings.matchOvers, innings.totalWickets);
          return (
            <div className="flex items-center gap-2 w-full max-w-[280px] mx-auto mt-1">
              <span className="text-[9px] text-gray-500 shrink-0 w-12 text-right truncate">{innings.battingTeamName.slice(0, 5)}</span>
              <div className="flex-1 relative h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{
                    width: `${winProb}%`,
                    background: winProb > 60
                      ? "linear-gradient(90deg,#10b981,#34d399)"
                      : winProb > 40
                      ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                      : "linear-gradient(90deg,#ef4444,#f87171)",
                  }}
                />
              </div>
              <span className="text-[9px] font-bold tabular-nums shrink-0"
                    style={{ color: winProb > 60 ? "#34d399" : winProb > 40 ? "#fbbf24" : "#f87171" }}>
                {winProb}%
              </span>
            </div>
          );
        })()}
      </div>

      {/* ══ MOBILE TAB BAR (hidden on desktop) ══ */}
      <div className="md:hidden flex shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        {(["score","controls"] as const).map(t => (
          <button key={t} onClick={() => setMobileTab(t)}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              mobileTab === t
                ? "text-emerald-400 border-b-2 border-emerald-500 bg-white/5"
                : "text-gray-500"
            }`}>
            {t === "score" ? "📊 Scorecard" : "🎮 Controls"}
          </button>
        ))}
      </div>

      {/* ══ 2-COLUMN MAIN AREA ══ */}
      <div className="flex flex-1 min-h-0 md:gap-7 md:py-4 md:px-10">

        {/* ════ LEFT GLASS CARD ════ */}
        <div className={`flex flex-col overflow-hidden w-full md:flex-[6] rounded-none md:rounded-xl ${mobileTab !== "score" ? "max-md:hidden" : ""}`}
             style={{
               background: "rgba(255,255,255,0.04)",
               backdropFilter: "blur(10px)",
               WebkitBackdropFilter: "blur(10px)",
               border: "1px solid rgba(255,255,255,0.09)",
             }}>

          {/* Tabs */}
          <div className="flex shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {(["batting","bowling"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                  tab === t
                    ? "bg-white/5 text-emerald-400 border-b-2 border-emerald-500"
                    : "text-gray-500 hover:text-gray-300"
                }`}>
                {t}
              </button>
            ))}
          </div>

          {/* Content + tracker fill remaining height */}
          <div className="flex flex-col flex-1 min-h-0">

            {/* ── Scorecard — natural height, no empty gap after Total ── */}
            <div className="overflow-y-auto" style={{ maxHeight: "63%" }}>

              {tab === "batting" && (
                <>
                  <div className="flex items-center px-3 py-1 sticky top-0"
                       style={{ background: "rgba(0,0,0,0.35)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="flex-1 text-[10px] text-gray-500 font-semibold">Batsman</span>
                    <span className="w-10 text-right text-[10px] text-gray-500">Runs</span>
                    <span className="w-10 text-right text-[10px] text-gray-500">Balls</span>
                    <span className="w-8  text-right text-[10px] text-gray-500">4s</span>
                    <span className="w-8  text-right text-[10px] text-gray-500">6s</span>
                    <span className="w-12 text-right text-[10px] text-gray-500">SR%</span>
                  </div>
                  {innings.batsmen.map((bat, i) => {
                    const p   = findPlayer(allPlayers, bat.playerId);
                    const str = i === innings.currentBatsmanOnStrike && !innings.isComplete;
                    const ns  = i === innings.currentBatsmanNonStrike && !innings.isComplete;
                    const sr  = bat.balls > 0 ? Math.round((bat.runs / bat.balls) * 100) : 0;
                    return (
                      <div key={bat.playerId}
                        className={`flex items-center px-3 py-1.5 text-sm transition-colors ${
                          str ? "border-l-2 border-l-emerald-500" :
                          ns  ? "border-l-2 border-l-gray-500" :
                          bat.isOut ? "opacity-40" : ""
                        }`}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          background: str ? "rgba(16,185,129,0.1)" : ns ? "rgba(255,255,255,0.03)" : "transparent",
                        }}>
                        <div className="flex-1 min-w-0">
                          <span className={`truncate font-medium ${
                            str || ns ? "text-white" : bat.isOut ? "text-gray-500" : "text-gray-300"
                          }`}>
                            {p?.shortName ?? "—"}
                          </span>
                          {str && <BatIcon className="text-emerald-400 ml-1 shrink-0 inline-block" />}
                          {bat.isOut && (
                            <span className="text-[10px] text-gray-600 ml-1">
                              ({dismissalShort(bat.dismissalType)})
                            </span>
                          )}
                        </div>
                        <span className={`w-10 text-right tabular-nums font-medium ${
                          bat.runs >= 50 ? "text-yellow-300 font-bold" :
                          bat.runs >= 30 ? "text-emerald-300" : "text-gray-300"
                        }`}>
                          {bat.isOut || bat.balls > 0 ? bat.runs : "—"}
                        </span>
                        <span className="w-10 text-right tabular-nums text-gray-500">
                          {bat.balls > 0 ? bat.balls : ""}
                        </span>
                        <span className="w-8 text-right tabular-nums text-gray-500">
                          {bat.fours > 0 ? bat.fours : ""}
                        </span>
                        <span className="w-8 text-right tabular-nums text-gray-500">
                          {bat.sixes > 0 ? bat.sixes : ""}
                        </span>
                        <span className="w-12 text-right tabular-nums text-gray-500">
                          {bat.balls > 0 ? sr : ""}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex items-center px-3 py-1.5 text-sm"
                       style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span className="flex-1 text-gray-500">Extras</span>
                    <span className="text-gray-400 tabular-nums">{extras}</span>
                  </div>
                  <div className="flex items-center px-3 py-2 text-sm"
                       style={{ background: "rgba(0,0,0,0.25)" }}>
                    <span className="flex-1 text-gray-300 font-semibold">
                      Total ({innings.totalWickets} wkts, {formatOvers(totalBalls)} overs)
                    </span>
                    <span className="text-white font-bold text-base tabular-nums">
                      {innings.totalRuns}/{innings.totalWickets}
                    </span>
                  </div>
                </>
              )}

              {tab === "bowling" && (
                <>
                  <div className="flex items-center px-3 py-1 sticky top-0"
                       style={{ background: "rgba(0,0,0,0.35)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="flex-1 text-[10px] text-gray-500 font-semibold">Bowler</span>
                    <span className="w-8  text-right text-[10px] text-gray-500">O</span>
                    <span className="w-10 text-right text-[10px] text-gray-500">R</span>
                    <span className="w-8  text-right text-[10px] text-gray-500">W</span>
                    <span className="w-16 text-right text-[10px] text-gray-500">Econ</span>
                  </div>
                  {innings.bowlers
                    .filter(b => b.overs > 0 || b.ballsInCurrentOver > 0)
                    .map(b => {
                      const p    = findPlayer(allPlayers, b.playerId);
                      const bs   = b.overs * 6 + b.ballsInCurrentOver;
                      const cur  = b.playerId === curBowler?.playerId;
                      return (
                        <div key={b.playerId}
                          className={`flex items-center px-3 py-1.5 text-sm ${cur ? "border-l-2 border-l-red-500" : ""}`}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            background: cur ? "rgba(239,68,68,0.08)" : "transparent",
                          }}>
                          <span className={`flex-1 truncate font-medium ${cur ? "text-white" : "text-gray-300"}`}>
                            {p?.shortName ?? b.playerId}
                          </span>
                          <span className="w-8  text-right tabular-nums text-gray-500">{formatOvers(bs)}</span>
                          <span className="w-10 text-right tabular-nums text-gray-500">{b.runsConceded}</span>
                          <span className={`w-8 text-right tabular-nums font-bold ${
                            b.wickets >= 3 ? "text-red-400" : b.wickets > 0 ? "text-orange-400" : "text-gray-500"
                          }`}>{b.wickets}</span>
                          <span className="w-16 text-right tabular-nums text-gray-500">
                            {bs > 0 ? formatEconomy(b.runsConceded, bs) : "—"}
                          </span>
                        </div>
                      );
                    })}
                  {innings.bowlers.filter(b => b.overs > 0 || b.ballsInCurrentOver > 0).length === 0 && (
                    <p className="text-sm text-gray-600 italic p-4">No overs bowled yet</p>
                  )}
                </>
              )}
            </div>

            {/* ── Ball-tracker — fills all remaining space below scorecard ── */}
            <div className="flex-1 flex flex-col min-h-0"
                 style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="shrink-0 flex items-center gap-3 px-3 py-1"
                   style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">▲ Ball-tracker</span>
                <span className="text-[11px] text-gray-600">Over {innings.totalOvers + 1}</span>
              </div>
              <div className="flex-1 flex flex-col min-h-0">
                {Array.from({ length: 6 }).map((_, i) => {
                  const ev = trackerEvents[i];
                  return (
                    <div key={i} className="flex-1 flex items-center gap-2 px-3 min-h-0"
                         style={{ borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      {ev ? (
                        <>
                          <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${ballBg(ev.outcome)}`}
                               style={i === trackerEvents.length - 1 ? { animation: "ballPop 0.25s ease" } : undefined}>
                            {ballLabel(ev.outcome, ev.runsScored)}
                          </div>
                          <span className="text-[11px] text-gray-400 leading-tight truncate">{ev.commentary}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 rounded-full shrink-0 border border-dashed border-gray-700" />
                          <span className="text-[11px] text-gray-700">Ball {i + 1}</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>{/* end flex-1 content+tracker */}
        </div>{/* end left glass card */}

        {/* ════ RIGHT GLASS CARD ════ */}
        <div className={`flex flex-col gap-2 p-2 overflow-y-auto md:overflow-hidden w-full md:flex-[4] rounded-none md:rounded-xl ${mobileTab !== "controls" ? "max-md:hidden" : ""}`}
             style={{
               background: "rgba(255,255,255,0.04)",
               backdropFilter: "blur(10px)",
               WebkitBackdropFilter: "blur(10px)",
               border: "1px solid rgba(255,255,255,0.09)",
             }}>

          {/* ── Bowler sub-card ── */}
          <div className="shrink-0 rounded-lg px-3 py-2.5"
               style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span className="font-bold text-white text-base truncate">{bowlerP?.name ?? "—"}</span>
                <span className="text-[11px] text-gray-500 uppercase shrink-0">{bowlerP?.bowling.bowlerType ?? ""}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {curBowler && (
                  <span className="text-[10px] text-gray-600">{curBowler.maxOvers - curBowler.overs}ov left</span>
                )}
                {!isBatting && (
                  <button
                    onClick={() => dispatch({ type:"CHANGE_BOWLER", payload:{ bowlerId: curBowler?.playerId ?? "" } })}
                    className="text-[11px] text-gray-200 bg-gray-700 hover:bg-gray-600 border border-gray-500 px-2.5 py-0.5 rounded transition-colors">
                    Change
                  </button>
                )}
              </div>
            </div>
            {curBowler && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-gray-600 w-14 uppercase tracking-wide shrink-0">Stamina</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${confBar(curBowler.confidence)}`}
                         style={{ width: `${curBowler.confidence}%` }} />
                  </div>
                </div>
                <div className="flex gap-5 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  {[
                    { label:"O",    value: formatOvers(bowlerBalls) },
                    { label:"M",    value: "0" },
                    { label:"R",    value: String(curBowler.runsConceded) },
                    { label:"W",    value: String(curBowler.wickets) },
                    { label:"Econ", value: bowlerBalls > 0 ? formatEconomy(curBowler.runsConceded, bowlerBalls) : "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-[9px] text-gray-600 uppercase">{label}</p>
                      <p className={`text-sm font-bold tabular-nums ${
                        label==="W" && Number(value) > 0 ? "text-red-400" : "text-white"
                      }`}>{value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            {!isBatting && (
              <div className="mt-3 pt-3 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <PitchSelector selectedLine={bowlLine} selectedLength={bowlLength}
                  onSelect={(l,len) => { setBowlLine(l); setBowlLength(len); }}
                  disabled={!canPlay} />
                <div>
                  <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1.5">Field Setting</p>
                  {(() => {
                    const ppOvs = innings.matchOvers === 5 ? 1 : innings.matchOvers === 20 ? 6 : 2;
                    const isInPP = innings.totalOvers < ppOvs;
                    return (
                      <>
                        {isInPP && (
                          <p className="text-[8px] text-yellow-600 mb-1.5">⚡ Powerplay — Defensive locked</p>
                        )}
                        <div className="grid grid-cols-3 gap-1.5">
                          {([
                            { v: FieldType.Attacking, label: "Attack",   sub: "Close field", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
                            { v: FieldType.Balanced,  label: "Balanced", sub: "Standard",    color: "#9ca3af", bg: "rgba(156,163,175,0.10)" },
                            { v: FieldType.Defensive, label: "Defend",   sub: "Boundary",    color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
                          ] as const).map(opt => {
                            const ppLocked = isInPP && opt.v === FieldType.Defensive;
                            const isDisabled = !canPlay || ppLocked;
                            const isActive = field === opt.v;
                            return (
                              <button
                                key={opt.v}
                                onClick={() => !ppLocked && setField(opt.v)}
                                disabled={isDisabled}
                                className={`flex flex-col items-center py-2.5 px-1 rounded-xl border-2 transition-all ${
                                  isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                                }`}
                                style={{
                                  borderColor: isActive ? opt.color : "rgba(255,255,255,0.08)",
                                  background:  isActive ? opt.bg   : "rgba(255,255,255,0.03)",
                                }}
                              >
                                <span
                                  className="text-[11px] font-bold leading-tight"
                                  style={{ color: isActive ? opt.color : "#6b7280" }}
                                >
                                  {opt.label}
                                </span>
                                <span className="text-[8px] text-gray-600 mt-0.5">{opt.sub}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>{/* end bowler sub-card */}

          {/* ── Striker sub-card ── */}
          <div className="shrink-0 md:flex-1 flex flex-col rounded-lg px-3 py-2 min-h-0 overflow-hidden"
               style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <div className="flex items-center justify-between shrink-0 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs text-emerald-400 font-bold shrink-0">{innings.currentBatsmanOnStrike + 1}</span>
                <span className="font-bold text-white text-sm truncate">{strikerP?.name ?? "—"}</span>
                <BatIcon className="text-emerald-500 shrink-0" />
              </div>
              <div className="shrink-0 text-right ml-2">
                <span className="text-lg font-extrabold tabular-nums">{onStrike?.runs ?? 0}</span>
                <span className="text-gray-500 text-xs ml-1">({onStrike?.balls ?? 0})</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 mb-1.5">
              {/* Role badge */}
              {strikerP && (
                <span
                  className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0"
                  style={{
                    color: strikerP.role === "bowler" ? "#f87171" : "#34d399",
                    borderColor: strikerP.role === "bowler" ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.3)",
                    background: strikerP.role === "bowler" ? "rgba(248,113,113,0.08)" : "rgba(52,211,153,0.08)",
                  }}
                >
                  {strikerP.role === "batsman" ? "BAT"
                   : strikerP.role === "wicket-keeper" ? "WK"
                   : strikerP.role === "all-rounder" ? "AR" : "BWL"}
                </span>
              )}
              {/* Form bar + HOT/OK/COLD label */}
              {onStrike && (
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="w-14 h-1.5 bg-gray-800 rounded-full overflow-hidden shrink-0">
                    <div className={`h-full rounded-full ${confBar(onStrike.confidence)}`}
                         style={{ width: `${onStrike.confidence}%` }} />
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-wide shrink-0 ${
                    onStrike.confidence >= 70 ? "text-emerald-400"
                    : onStrike.confidence >= 45 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {onStrike.confidence >= 70 ? "HOT" : onStrike.confidence >= 45 ? "OK" : "COLD"}
                  </span>
                  <span className="text-[9px] text-gray-600 shrink-0">{batsmanStatus(onStrike.balls)}</span>
                  {onStrike.balls > 0 && (
                    <span className="text-[9px] text-gray-500 ml-auto shrink-0">
                      SR <span className="text-gray-300 font-semibold">{Math.round((onStrike.runs / onStrike.balls) * 100)}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
            {flash && (
              <div className="shrink-0 text-[9px] text-yellow-300 bg-yellow-900/20 border border-yellow-700/30 rounded px-2 py-0.5 mb-1">
                ↺ New batsman — aggression reset
              </div>
            )}
            <div className="flex items-center gap-3 flex-1 min-h-0 overflow-hidden">
              <div className="shrink-0">
                <FieldDiagram fieldType={diagField} size={148} showLabel />
              </div>
              {isBatting ? (
                <>
                  <VerticalAggSlider value={sRpo} onChange={v => onStrike && setRpoFor(onStrike.playerId, v)}
                    disabled={!canPlay} height={113} />
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <span className="text-[8px] text-gray-500 text-center leading-tight uppercase tracking-wide">Keep<br />Strike</span>
                    <button
                      onClick={() => setKeepStrike(!keepStrike)}
                      disabled={!canPlay}
                      className={`px-3 py-2 text-[10px] font-black rounded-lg border-2 transition-all ${
                        keepStrike
                          ? "bg-blue-700/40 border-blue-500 text-blue-200"
                          : "bg-gray-800/60 border-gray-600/60 text-gray-500"
                      } ${!canPlay ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      {keepStrike ? "ON ✓" : "OFF"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-[9px] text-gray-500">
                  Field: <span className="text-gray-300 capitalize">{field}</span>
                </div>
              )}
            </div>
          </div>{/* end striker sub-card */}

          {/* ── Partnership strip ── */}
          {onStrike && nonStrike && (() => {
            const p = computePartnership(innings);
            return (
              <div
                className="shrink-0 flex items-center justify-center gap-3 py-1.5 rounded-lg text-[11px]"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <span className="text-gray-500 uppercase tracking-wider text-[9px]">Partnership</span>
                <span className="font-bold text-white tabular-nums">
                  {p.runs}
                  <span className="text-gray-500 font-normal ml-1">({p.balls})</span>
                </span>
              </div>
            );
          })()}

          {/* ── Non-striker sub-card ── */}
          <div className="shrink-0 md:flex-1 flex flex-col rounded-lg px-3 py-2 min-h-0 overflow-hidden"
               style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between shrink-0 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs text-gray-500 font-bold shrink-0">{innings.currentBatsmanNonStrike + 1}</span>
                <span className="font-medium text-gray-200 text-sm truncate">{nonStrikerP?.name ?? "—"}</span>
              </div>
              <div className="shrink-0 text-right ml-2">
                <span className="text-lg font-bold tabular-nums text-gray-300">{nonStrike?.runs ?? 0}</span>
                <span className="text-gray-600 text-xs ml-1">({nonStrike?.balls ?? 0})</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 mb-2">
              {/* Role badge */}
              {nonStrikerP && (
                <span
                  className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0"
                  style={{
                    color: nonStrikerP.role === "bowler" ? "#f87171" : "#9ca3af",
                    borderColor: "rgba(156,163,175,0.2)",
                    background: "rgba(156,163,175,0.06)",
                  }}
                >
                  {nonStrikerP.role === "batsman" ? "BAT"
                   : nonStrikerP.role === "wicket-keeper" ? "WK"
                   : nonStrikerP.role === "all-rounder" ? "AR" : "BWL"}
                </span>
              )}
              <span className="text-[9px] text-gray-600 shrink-0">
                {nonStrike ? batsmanStatus(nonStrike.balls) : ""}
              </span>
              {nonStrike && nonStrike.balls > 0 && (
                <span className="text-[9px] text-gray-500 ml-auto shrink-0">
                  SR <span className="text-gray-300 font-semibold">{Math.round((nonStrike.runs / nonStrike.balls) * 100)}</span>
                </span>
              )}
            </div>
            {/* Body: batting stats + aggression slider */}
            <div className="flex items-start gap-3 flex-1 min-h-0 overflow-hidden">
              {/* Mini batting stat bars replacing the duplicate field diagram */}
              {nonStrikerP && (
                <div className="flex-1 space-y-1.5 py-1">
                  {[
                    { label: "Technique", value: Math.round((nonStrikerP.batting.techniqueVsPace + nonStrikerP.batting.techniqueVsSpin) / 2), color: "#3b82f6" },
                    { label: "Power",     value: nonStrikerP.batting.power,       color: "#f59e0b" },
                    { label: "Tempermt", value: nonStrikerP.batting.temperament, color: "#a78bfa" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className="text-[8px] text-gray-600 w-12 shrink-0">{label}</span>
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
                      </div>
                      <span className="text-[8px] tabular-nums font-semibold w-5 text-right shrink-0" style={{ color }}>{value}</span>
                    </div>
                  ))}
                  {/* Non-striker form */}
                  {nonStrike && (
                    <div className="flex items-center gap-1.5 pt-1.5 mt-0.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${confBar(nonStrike.confidence)}`}
                             style={{ width: `${nonStrike.confidence}%` }} />
                      </div>
                      <span className={`text-[8px] font-black uppercase shrink-0 ${
                        nonStrike.confidence >= 70 ? "text-emerald-400"
                        : nonStrike.confidence >= 45 ? "text-yellow-400" : "text-red-400"
                      }`}>
                        {nonStrike.confidence >= 70 ? "HOT" : nonStrike.confidence >= 45 ? "OK" : "COLD"}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {/* Aggression slider */}
              {isBatting && nonStrike && (
                <VerticalAggSlider value={nsRpo} onChange={v => setRpoFor(nonStrike.playerId, v)}
                  disabled={!canPlay} height={110} />
              )}
            </div>
          </div>{/* end non-striker sub-card */}

        </div>{/* end right glass card */}
      </div>{/* end 2-col */}

      {/* ══ PER-OVER MOMENTUM STRIP ══ */}
      <div className="shrink-0 px-3 pt-2 pb-1 flex gap-[2px]"
           style={{ background: "rgba(0,0,0,0.25)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {Array.from({ length: innings.matchOvers }, (_, i) => {
          const evts    = innings.allEvents.filter(e => e.overNumber === i);
          const runs    = evts.reduce((s, e) => s + e.runsScored, 0);
          const hasWkt  = evts.some(e => e.outcome === BallOutcome.Wicket);
          const done    = i < innings.totalOvers;
          const current = i === innings.totalOvers;
          const bg = !done && !current ? "rgba(255,255,255,0.06)"
                   : current           ? "rgba(255,255,255,0.28)"
                   : hasWkt            ? "#ef4444"
                   : runs >= 12        ? "#fbbf24"
                   : runs >= 8         ? "#10b981"
                   : runs >= 5         ? "#4b5563"
                   :                    "#1f2937";
          return (
            <div key={i} title={done ? `Over ${i+1}: ${runs}${hasWkt?" W":""}` : current ? "In progress" : ""}
                 style={{ flex: 1, height: 5, borderRadius: 2, backgroundColor: bg, transition: "background-color 0.3s" }} />
          );
        })}
      </div>


      {/* ══ BOTTOM ACTION BAR ══ */}
      <div className="shrink-0 px-3 pt-2.5 flex items-center gap-2"
           style={{
             borderTop: "1px solid rgba(255,255,255,0.07)",
             background: "rgba(0,0,0,0.35)",
             paddingBottom: "max(10px, env(safe-area-inset-bottom, 10px))",
           }}>

        {/* Pause button */}
        <button
          onClick={() => {
            if (state.isSimulating) dispatch({ type: "SET_SIMULATING", payload: { value: false } });
            setSimOverTarget(null);
            setIsPaused(true);
            setPauseView("menu");
          }}
          className="flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all bg-white/[0.06] text-gray-300 border border-white/10 hover:text-white hover:bg-white/10">
          ⏸ Pause
        </button>

        {/* Primary action */}
        <button
          onClick={handleNextBall}
          disabled={!canPlay}
          className={`flex-[2.5] py-3.5 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${
            canPlay
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 active:scale-[0.97]"
              : "bg-gray-800 text-gray-600 cursor-not-allowed"
          }`}>
          {innings.isComplete        ? "Complete"
           : state.needsBowlerChange ? "Bowler…"
           : isBatting               ? "Next Ball"
                                     : "Bowl"}
        </button>
      </div>

      {/* Bowler change modal */}
      {state.needsBowlerChange && !isBatting && (
        <BowlerChangeModal
          availableBowlers={getAvailableBowlers(innings)}
          players={allPlayers}
          onSelect={id => dispatch({ type:"CHANGE_BOWLER", payload:{ bowlerId: id } })}
        />
      )}

      {/* ── Opener selection modal ── */}
      {state.pendingBatsmanSelection === "openers" && isBatting && (
        <div className="fixed inset-0 z-50 flex flex-col text-white"
             style={{ background: "#09090b" }}>
          <div className="shrink-0 px-4 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <h2 className="text-lg font-bold text-white text-center">Select Your Openers</h2>
            <p className="text-xs text-gray-500 text-center mt-0.5">Tap a player to assign them</p>
          </div>

          {/* Slots */}
          <div className="px-4 py-4 grid grid-cols-2 gap-3 shrink-0">
            {[
              { label: "Faces First Ball", id: openerStrikerId, clear: () => setOpenerStrikerId(null) },
              { label: "Opening Partner",  id: openerNonStrikerId, clear: () => setOpenerNonStrikerId(null) },
            ].map(({ label, id, clear }) => (
              <div
                key={label}
                className="rounded-xl p-3 flex flex-col items-center gap-1 cursor-pointer transition-colors"
                style={{
                  background: id ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${id ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"}`,
                  minHeight: 72,
                }}
                onClick={() => id && clear()}
              >
                <p className="text-[9px] uppercase tracking-widest text-gray-500">{label}</p>
                {id ? (
                  <>
                    <p className="text-sm font-bold text-emerald-300">
                      {allPlayers.find(p => p.id === id)?.shortName ?? id}
                    </p>
                    <p className="text-[9px] text-gray-500">tap to clear</p>
                  </>
                ) : (
                  <p className="text-xs text-gray-600 italic">not selected</p>
                )}
              </div>
            ))}
          </div>

          {/* Player list */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {state.selectedXI.map(pid => {
              const p = allPlayers.find(pl => pl.id === pid);
              if (!p) return null;
              const isStrike    = openerStrikerId === pid;
              const isNonStrike = openerNonStrikerId === pid;
              const isTaken     = isStrike || isNonStrike;
              return (
                <button
                  key={pid}
                  disabled={isTaken}
                  onClick={() => {
                    if (!openerStrikerId)    { setOpenerStrikerId(pid); return; }
                    if (!openerNonStrikerId) { setOpenerNonStrikerId(pid); return; }
                  }}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors text-left"
                  style={{
                    background: isTaken ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isTaken ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.07)"}`,
                    opacity: isTaken ? 0.6 : 1,
                    cursor: isTaken ? "not-allowed" : "pointer",
                  }}
                >
                  <span
                    className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
                    style={{
                      background: p.role === "batsman" || p.role === "wicket-keeper"
                        ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                      color: p.role === "batsman" || p.role === "wicket-keeper"
                        ? "#4ade80" : "#fca5a5",
                    }}
                  >
                    {p.role === "wicket-keeper" ? "WK" : p.role === "all-rounder" ? "AR"
                      : p.role === "bowler" ? "BWL" : "BAT"}
                  </span>
                  <span className="text-sm font-medium text-white">{p.shortName}</span>
                  {isStrike    && <span className="ml-auto text-[9px] text-emerald-400 font-bold">STRIKER</span>}
                  {isNonStrike && <span className="ml-auto text-[9px] text-blue-400 font-bold">NON-STRIKER</span>}
                </button>
              );
            })}
          </div>

          {/* Start button */}
          <div className="shrink-0 px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <button
              disabled={!openerStrikerId || !openerNonStrikerId}
              onClick={() => {
                if (!openerStrikerId || !openerNonStrikerId) return;
                dispatch({ type: "SELECT_OPENERS", payload: { strikerId: openerStrikerId, nonStrikerId: openerNonStrikerId } });
                setOpenerStrikerId(null);
                setOpenerNonStrikerId(null);
              }}
              className="w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#f4f4f5", color: "#09090b" }}
            >
              Start Innings
            </button>
          </div>
        </div>
      )}

      {/* ── Next batsman modal ── */}
      {state.pendingBatsmanSelection === "next" && isBatting && (() => {
        const usedIds = new Set(innings.battingOrder);
        const remaining = state.selectedXI.filter(id => !usedIds.has(id));
        return (
          <div className="fixed inset-0 z-50 flex flex-col text-white"
               style={{ background: "#09090b" }}>
            <div className="shrink-0 px-4 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <h2 className="text-lg font-bold text-white text-center">Wicket!</h2>
              <p className="text-xs text-gray-500 text-center mt-0.5">Who comes in next?</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {remaining.map(pid => {
                const p = allPlayers.find(pl => pl.id === pid);
                if (!p) return null;
                return (
                  <button
                    key={pid}
                    onClick={() => dispatch({ type: "SELECT_NEXT_BATSMAN", payload: { batsmanId: pid } })}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 transition-colors text-left"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                  >
                    <span
                      className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
                      style={{
                        background: p.role === "batsman" || p.role === "wicket-keeper"
                          ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                        color: p.role === "batsman" || p.role === "wicket-keeper"
                          ? "#4ade80" : "#fca5a5",
                      }}
                    >
                      {p.role === "wicket-keeper" ? "WK" : p.role === "all-rounder" ? "AR"
                        : p.role === "bowler" ? "BWL" : "BAT"}
                    </span>
                    <span className="text-sm font-medium text-white">{p.shortName}</span>
                    <span className="ml-auto text-gray-500 text-xs capitalize">{p.role}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ══ PAUSE OVERLAY ══ */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex flex-col text-white"
             style={{ background: "linear-gradient(135deg,#0a0f1e 0%,#0d1117 50%,#0a1628 100%)" }}>

          {/* Overlay header */}
          <div className="shrink-0 flex items-center gap-3 px-4 py-4"
               style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <button
              onClick={() => pauseView === "menu" ? setIsPaused(false) : setPauseView("menu")}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-lg">
              {pauseView === "menu" ? "✕" : "←"}
            </button>
            <h2 className="flex-1 text-center font-bold text-white">
              {pauseView === "menu" ? "Paused" : pauseView === "scorecard" ? "Scorecard" : "Score Progression"}
            </h2>
            <div className="w-9" />{/* spacer to centre the title */}
          </div>

          {/* ── Pause menu ── */}
          {pauseView === "menu" && (
            <div className="flex-1 flex flex-col p-5 gap-3 overflow-y-auto">

              {/* Live score summary */}
              <div className="rounded-xl p-4 text-center mb-1"
                   style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                  {innings.battingTeamName} vs {innings.bowlingTeamName}
                </p>
                <p className="text-3xl font-black text-emerald-300 tabular-nums">
                  {innings.totalRuns}/{innings.totalWickets}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {formatOvers(totalBalls)} overs
                  {reqRate !== null && (
                    <span className={`ml-2 font-bold ${rrColor(reqRate)}`}>
                      · Need {reqRate.toFixed(1)}/ov
                    </span>
                  )}
                </p>
              </div>

              {/* Resume */}
              <button
                onClick={() => setIsPaused(false)}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-colors active:scale-[0.98]">
                ▶ Resume
              </button>

              {/* View screens */}
              <button
                onClick={() => setPauseView("scorecard")}
                className="w-full py-4 rounded-xl text-white font-bold text-base transition-colors active:scale-[0.98]"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
                Scorecard
              </button>
              <button
                onClick={() => setPauseView("worm")}
                className="w-full py-4 rounded-xl text-white font-bold text-base transition-colors active:scale-[0.98]"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
                Score Progression / Worm
              </button>

              <div className="h-px my-1" style={{ background: "rgba(255,255,255,0.08)" }} />

              {/* Simulate 1 Over — exhibition only, not in multiplayer */}
              {!isMultiplayer && (
                <button
                  onClick={() => {
                    if (!canPlay) return;
                    setSimOverTarget(innings.totalOvers + 1);
                    dispatch({ type: "SET_SIMULATING", payload: { value: true } });
                    setIsPaused(false);
                  }}
                  disabled={!canPlay}
                  className="w-full py-4 rounded-xl font-bold text-base transition-colors active:scale-[0.98] disabled:opacity-40"
                  style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}>
                  Simulate 1 Over
                </button>
              )}

              <div className="h-px my-1" style={{ background: "rgba(255,255,255,0.06)" }} />

              {/* Quit */}
              <button
                onClick={() => dispatch({ type: "GO_TO_MAIN_MENU" })}
                className="w-full py-4 rounded-xl font-bold text-base transition-colors active:scale-[0.98]"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                Quit to Menu
              </button>
            </div>
          )}

          {/* ── Full scorecard ── */}
          {pauseView === "scorecard" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* Batting card */}
              <div className="rounded-xl overflow-hidden"
                   style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-emerald-400"
                     style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  Batting — {innings.battingTeamName}
                </div>
                <div className="flex items-center px-4 py-1.5"
                     style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="flex-1 text-[10px] text-gray-500">Batsman</span>
                  <span className="w-10 text-right text-[10px] text-gray-500">R</span>
                  <span className="w-10 text-right text-[10px] text-gray-500">B</span>
                  <span className="w-8 text-right text-[10px] text-gray-500">4s</span>
                  <span className="w-8 text-right text-[10px] text-gray-500">6s</span>
                  <span className="w-12 text-right text-[10px] text-gray-500">SR</span>
                </div>
                {innings.batsmen.map((bat, i) => {
                  const p   = findPlayer(allPlayers, bat.playerId);
                  const str = i === innings.currentBatsmanOnStrike && !innings.isComplete;
                  const ns  = i === innings.currentBatsmanNonStrike && !innings.isComplete;
                  const sr  = bat.balls > 0 ? Math.round((bat.runs / bat.balls) * 100) : 0;
                  return (
                    <div key={bat.playerId}
                         className="flex items-center px-4 py-2"
                         style={{ borderBottom: "1px solid rgba(255,255,255,0.04)",
                                  background: str ? "rgba(16,185,129,0.1)" : "transparent" }}>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${str ? "text-emerald-300" : bat.isOut ? "text-gray-500" : "text-gray-200"}`}>
                          {p?.name ?? "—"}
                        </span>
                        {str && <span className="text-emerald-500 ml-1 text-xs">*</span>}
                        {ns  && <span className="text-gray-400 ml-1 text-xs">†</span>}
                        {bat.isOut && (
                          <span className="text-[10px] text-gray-600 ml-1">({dismissalShort(bat.dismissalType)})</span>
                        )}
                      </div>
                      <span className={`w-10 text-right text-sm tabular-nums font-bold ${bat.runs >= 50 ? "text-yellow-300" : "text-gray-300"}`}>
                        {bat.isOut || bat.balls > 0 ? bat.runs : "—"}
                      </span>
                      <span className="w-10 text-right text-sm tabular-nums text-gray-500">{bat.balls > 0 ? bat.balls : ""}</span>
                      <span className="w-8 text-right text-sm tabular-nums text-gray-500">{bat.fours > 0 ? bat.fours : ""}</span>
                      <span className="w-8 text-right text-sm tabular-nums text-gray-500">{bat.sixes > 0 ? bat.sixes : ""}</span>
                      <span className="w-12 text-right text-sm tabular-nums text-gray-500">{bat.balls > 0 ? sr : ""}</span>
                    </div>
                  );
                })}
                <div className="flex items-center px-4 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span className="flex-1 text-gray-500 text-sm">Extras</span>
                  <span className="text-gray-400 text-sm tabular-nums">{extras}</span>
                </div>
                <div className="flex items-center px-4 py-3" style={{ background: "rgba(0,0,0,0.2)" }}>
                  <span className="flex-1 text-white font-semibold text-sm">Total</span>
                  <span className="text-white font-bold text-base tabular-nums">
                    {innings.totalRuns}/{innings.totalWickets} ({formatOvers(totalBalls)} ov)
                  </span>
                </div>
              </div>

              {/* Bowling card */}
              <div className="rounded-xl overflow-hidden"
                   style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-red-400"
                     style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  Bowling — {innings.bowlingTeamName}
                </div>
                <div className="flex items-center px-4 py-1.5"
                     style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="flex-1 text-[10px] text-gray-500">Bowler</span>
                  <span className="w-8  text-right text-[10px] text-gray-500">O</span>
                  <span className="w-10 text-right text-[10px] text-gray-500">R</span>
                  <span className="w-8  text-right text-[10px] text-gray-500">W</span>
                  <span className="w-16 text-right text-[10px] text-gray-500">Econ</span>
                </div>
                {innings.bowlers.filter(b => b.overs > 0 || b.ballsInCurrentOver > 0).map(b => {
                  const p   = findPlayer(allPlayers, b.playerId);
                  const bs  = b.overs * 6 + b.ballsInCurrentOver;
                  const cur = b.playerId === curBowler?.playerId;
                  return (
                    <div key={b.playerId}
                         className="flex items-center px-4 py-2.5"
                         style={{ borderBottom: "1px solid rgba(255,255,255,0.04)",
                                  background: cur ? "rgba(239,68,68,0.08)" : "transparent" }}>
                      <span className={`flex-1 text-sm font-medium ${cur ? "text-white" : "text-gray-300"}`}>
                        {p?.name ?? b.playerId}
                      </span>
                      <span className="w-8  text-right text-sm tabular-nums text-gray-500">{formatOvers(bs)}</span>
                      <span className="w-10 text-right text-sm tabular-nums text-gray-500">{b.runsConceded}</span>
                      <span className={`w-8 text-right text-sm tabular-nums font-bold ${b.wickets >= 3 ? "text-red-400" : b.wickets > 0 ? "text-orange-400" : "text-gray-500"}`}>
                        {b.wickets}
                      </span>
                      <span className="w-16 text-right text-sm tabular-nums text-gray-500">
                        {bs > 0 ? formatEconomy(b.runsConceded, bs) : "—"}
                      </span>
                    </div>
                  );
                })}
                {innings.bowlers.filter(b => b.overs > 0 || b.ballsInCurrentOver > 0).length === 0 && (
                  <p className="text-sm text-gray-600 italic p-4">No overs bowled yet</p>
                )}
              </div>

              {/* Win probability — 2nd innings only */}
              {isSecond && innings.target !== undefined && (() => {
                const wp = computeWinProb(innings.totalRuns, innings.target, totalBalls, innings.matchOvers, innings.totalWickets);
                return (
                  <div className="rounded-xl p-4"
                       style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Win Probability</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                             style={{ width: `${wp}%`, background: wp > 60 ? "linear-gradient(90deg,#10b981,#34d399)" : wp > 40 ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#ef4444,#f87171)" }} />
                      </div>
                      <span className="text-3xl font-black tabular-nums shrink-0"
                            style={{ color: wp > 60 ? "#34d399" : wp > 40 ? "#fbbf24" : "#f87171" }}>
                        {wp}%
                      </span>
                    </div>
                    <div className="flex justify-between mt-2 text-[11px] text-gray-600">
                      <span>Need {innings.target - innings.totalRuns} runs</span>
                      <span>{innings.matchOvers * 6 - totalBalls} balls left · {10 - innings.totalWickets} wkts</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── Score progression / worm ── */}
          {pauseView === "worm" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="rounded-xl p-4"
                   style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Score Progression</p>
                  {isSecond && state.firstInnings && (
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-0.5 rounded bg-emerald-400" />
                        <span className="text-[10px] text-gray-400">{innings.battingTeamName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 border-t-2 border-dashed border-gray-500" />
                        <span className="text-[10px] text-gray-400">{state.firstInnings.battingTeamName}</span>
                      </div>
                    </div>
                  )}
                </div>
                <WormChart innings={innings} firstInnings={isSecond ? state.firstInnings : null} matchOvers={innings.matchOvers} />
              </div>

              <div className="rounded-xl p-4"
                   style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Runs Per Over</p>
                <RPOChart innings={innings} />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
