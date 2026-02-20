import { useState, useEffect, useRef } from "react";
import { useGame } from "../state/gameContext";
import { BallOutcome, BattingIntent, BowlerLine, BowlerType, FieldType } from "../types/enums";
import { Innings } from "../types/match";
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
// W=32px wide container, H=height prop tall container.
// Native range rotated -90° sits invisible on top for interaction.
function VerticalAggSlider({
  value, onChange, disabled, height = 140,
}: { value: number; onChange: (v: number) => void; disabled?: boolean; height?: number }) {
  const W   = 32;
  const H   = height;
  const pct = ((value - 4) / 8) * 100;
  const col = pct < 37 ? "#3b82f6" : pct < 63 ? "#22c55e" : "#ef4444";
  return (
    <div className="flex flex-col items-center gap-1 shrink-0 select-none">
      <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide">Agg</span>
      <div className="relative" style={{ width: W, height: H }}>
        {/* track bg */}
        <div className="absolute rounded-full bg-gray-700"
             style={{ left: 12, right: 12, top: 0, bottom: 0 }} />
        {/* fill */}
        <div className="absolute rounded-full transition-all duration-75"
             style={{ left: 12, right: 12, bottom: 0, height: `${pct}%`, backgroundColor: col }} />
        {/* thumb */}
        <div className="absolute rounded-full border-2 shadow transition-all duration-75"
             style={{ left: 4, right: 4, height: 13,
                      bottom: `calc(${pct}% - 6px)`,
                      borderColor: "rgba(255,255,255,.6)", backgroundColor: col }} />
        {/* invisible native range */}
        <input type="range" min={4} max={12} step={0.5} value={value}
               disabled={disabled}
               onChange={(e) => onChange(Number(e.target.value))}
               style={{ position:"absolute", width: H, height: W,
                        left: (W-H)/2, top: (H-W)/2,
                        transform:"rotate(-90deg)", opacity: 0,
                        cursor: disabled ? "not-allowed" : "pointer",
                        margin: 0, padding: 0 }} />
      </div>
      <span className="text-[8px] text-gray-500">Aggression</span>
      <span className="text-[10px] font-bold tabular-nums" style={{ color: col }}>
        {value.toFixed(1)}
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
  const [overSummary, setOverSummary] = useState<{ over: number; runs: number; wickets: number; bowler: string } | null>(null);
  const [milestone, setMilestone]   = useState<string | null>(null);
  const [isPaused, setIsPaused]           = useState(false);
  const [pauseView, setPauseView]         = useState<"menu"|"scorecard"|"worm">("menu");
  const [simOverTarget, setSimOverTarget] = useState<number | null>(null);
  const prevOverRef    = useRef(0);
  const milestoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matchTime       = useRef(new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }));
  const innings         = getActiveInnings(state);
  const prevStriker     = useRef<string|null>(null);
  const strikerId       = innings?.batsmen[innings?.currentBatsmanOnStrike]?.playerId ?? null;
  const handleNextBallRef = useRef<() => void>(() => {});

  // Auto-bowler: fires when a new over starts and an AI-controlled side needs a bowler.
  // Covers: user batting (AI always auto-picks) AND simulate mode (AI picks for user bowling too).
  useEffect(() => {
    if (!innings || !state.needsBowlerChange) return;
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

  // Over summary — detect when totalOvers increments and flash an over card
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
    const bowlerName = lastEv
      ? (getAllPlayers(state).find(p => p.id === lastEv.bowlerId)?.shortName ?? "?")
      : "?";
    setOverSummary({ over: curr, runs: runsInOver, wickets: wktsInOver, bowler: bowlerName });
    const t = setTimeout(() => setOverSummary(null), 3500);
    return () => clearTimeout(t);
  }, [innings?.totalOvers]);

  // Milestones — detect 50/100 for batsmen, 3-for/5-for for bowlers on each ball
  useEffect(() => {
    if (!innings) return;
    const ev = innings.allEvents[innings.allEvents.length - 1];
    if (!ev) return;
    const allP = getAllPlayers(state);
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

  const handleNextBall = () => {
    if (!onStrike || !curBowler || !canPlay) return;
    const bsStats = findPlayer(allPlayers, onStrike.playerId);
    const blStats = findPlayer(allPlayers, curBowler.playerId);
    if (!bsStats || !blStats) return;

    // In simulate mode AI controls everything; otherwise user controls their side
    const aiIntent = getAIIntent(
      innings.totalRuns, innings.totalWickets, innings.totalOvers,
      onStrike.balls, bsStats.batting.power, onStrike.confidence,
      innings.matchOvers,
      innings.target,
    );
    const aiLine = getAIBowlingLine(
      bsStats.batting.power, bsStats.batting.offsideSkill, bsStats.batting.legsideSkill,
      blStats.bowling.bowlerType, innings.totalOvers, innings.matchOvers,
    );

    let intent = !isBatting || state.isSimulating ? aiIntent : rpoToIntent(sRpo);
    let ef     = field;
    let line: BowlerLine | undefined = undefined;

    if (isBatting) {
      // AI is bowling — AI picks field and line
      ef = getAIField(
        innings.totalWickets, innings.totalOvers,
        onStrike.balls, onStrike.confidence,
        innings.matchOvers,
        innings.target, innings.totalRuns,
      );
      setAiField(ef);
      line = aiLine;
    } else {
      // AI is batting — AI picks intent; user picks line (or AI picks in sim mode)
      line = state.isSimulating ? aiLine : mapToEngineLine(bowlLine, bowlLength);
    }

    let ev = simulateBall(onStrike, curBowler, bsStats, blStats,
      state.pitchType, intent, ef, innings, innings.target, line);

    if (keepStrike && isBatting && innings.ballsInCurrentOver === 5
        && ev.outcome === BallOutcome.Dot && Math.random() < 0.45) {
      ev = { ...ev, outcome: BallOutcome.Single, runsScored: 1 };
    }
    dispatch({ type: "PROCESS_BALL_RESULT", payload: { event: ev } });
  };

  // Keep ref pointing at latest handleNextBall (avoids stale closure in simulate loop)
  handleNextBallRef.current = handleNextBall;

  // last 6 events for the tracker (sliding window)
  const trackerEvents = innings.currentOverEvents.slice(-6);

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full text-white overflow-hidden"
         style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1117 50%, #0a1628 100%)" }}>

      {/* ── Over summary popup ── */}
      {overSummary && (
        <div
          style={{
            position: "fixed", top: 64, left: "50%", zIndex: 50,
            transform: "translateX(-50%)",
            animation: "slideDown 0.3s ease",
            background: "rgba(10,25,15,0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(16,185,129,0.35)",
          }}
          className="px-5 py-2.5 rounded-xl shadow-2xl text-center pointer-events-none"
        >
          <p className="text-[10px] text-emerald-500 uppercase tracking-wider mb-0.5">End of Over {overSummary.over}</p>
          <p className="text-lg font-bold text-white">{overSummary.runs} runs · {overSummary.wickets} wkt{overSummary.wickets !== 1 ? "s" : ""}</p>
          <p className="text-[11px] text-gray-400">{overSummary.bowler}</p>
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
                  <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Field</p>
                  {(() => {
                    const ppOvs = innings.matchOvers === 5 ? 1 : innings.matchOvers === 20 ? 6 : 2;
                    const isInPP = innings.totalOvers < ppOvs;
                    return (
                      <>
                        {isInPP && (
                          <p className="text-[8px] text-yellow-600 mb-1">Powerplay — Defensive locked</p>
                        )}
                        <div className="flex gap-1">
                          {([
                            { v: FieldType.Attacking, label:"Attack" },
                            { v: FieldType.Balanced,  label:"Balanced" },
                            { v: FieldType.Defensive, label:"Defend" },
                          ] as const).map(opt => {
                            const ppLocked = isInPP && opt.v === FieldType.Defensive;
                            const isDisabled = !canPlay || ppLocked;
                            return (
                              <button key={opt.v} onClick={() => !ppLocked && setField(opt.v)} disabled={isDisabled}
                                className={`flex-1 py-1 text-[10px] rounded border transition-all ${
                                  isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                                } ${
                                  field === opt.v
                                    ? opt.v === FieldType.Attacking ? "bg-red-700/50 border-red-500 text-red-200"
                                    : opt.v === FieldType.Balanced  ? "bg-gray-700 border-gray-400 text-white"
                                                                    : "bg-blue-800/50 border-blue-500 text-blue-200"
                                    : "bg-gray-800 border-gray-700 text-gray-500"
                                }`}>
                                {opt.label}
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
            <div className="flex items-center gap-2 shrink-0 mb-1.5 text-[9px]">
              {onStrike && <span className="text-gray-500">{batsmanStatus(onStrike.balls)}</span>}
              {onStrike && (
                <>
                  <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${confBar(onStrike.confidence)}`}
                         style={{ width: `${onStrike.confidence}%` }} />
                  </div>
                  {onStrike.balls > 0 && (
                    <span className="text-gray-600">SR {Math.round((onStrike.runs / onStrike.balls) * 100)}</span>
                  )}
                </>
              )}
            </div>
            {flash && (
              <div className="shrink-0 text-[9px] text-yellow-300 bg-yellow-900/20 border border-yellow-700/30 rounded px-2 py-0.5 mb-1">
                ↺ New batsman — aggression reset
              </div>
            )}
            <div className="flex items-center gap-3 flex-1 min-h-0 overflow-hidden">
              <div className="shrink-0">
                <FieldDiagram fieldType={diagField} size={118} showLabel />
              </div>
              {isBatting ? (
                <>
                  <VerticalAggSlider value={sRpo} onChange={v => onStrike && setRpoFor(onStrike.playerId, v)}
                    disabled={!canPlay} height={113} />
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <span className="text-[8px] text-gray-500 text-center leading-tight">Keep<br />Strike</span>
                    <button onClick={() => setKeepStrike(!keepStrike)} disabled={!canPlay}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded border transition-all ${
                        keepStrike ? "bg-blue-700/50 border-blue-500 text-blue-200" : "bg-gray-800 border-gray-600 text-gray-500"
                      } ${!canPlay ? "opacity-40 cursor-not-allowed" : ""}`}>
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
            <div className="flex items-center gap-2 shrink-0 mb-1.5 text-[9px]">
              {nonStrike && <span className="text-gray-500">{batsmanStatus(nonStrike.balls)}</span>}
              {nonStrike && nonStrike.balls > 0 && (
                <span className="text-gray-600">SR {Math.round((nonStrike.runs / nonStrike.balls) * 100)}</span>
              )}
              {nonStrikerP && <span className="text-gray-700 truncate">{nonStrikerP.role}</span>}
            </div>
            <div className="flex items-center gap-3 flex-1 min-h-0 overflow-hidden">
              <FieldDiagram fieldType={diagField} size={108} showLabel />
              {isBatting && nonStrike && (
                <VerticalAggSlider value={nsRpo} onChange={v => setRpoFor(nonStrike.playerId, v)}
                  disabled={!canPlay} height={103} />
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

              {/* Simulate controls */}
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
              <button
                onClick={() => {
                  if (!canPlay) return;
                  dispatch({ type: "SET_SIMULATING", payload: { value: true } });
                  setIsPaused(false);
                }}
                disabled={!canPlay}
                className="w-full py-4 rounded-xl font-bold text-base transition-colors active:scale-[0.98] disabled:opacity-40"
                style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}>
                Simulate Entire Innings
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
