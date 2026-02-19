import { useState, useEffect, useRef } from "react";
import { useGame } from "../state/gameContext";
import { BallOutcome, BattingIntent, BowlerLine, BowlerType, FieldType } from "../types/enums";
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
/**
 * AI batting intent — per-ball decision using match situation + player character.
 * batsmanBalls / batsmanPower / batsmanConfidence give individual flavour.
 */
function getAIIntent(
  runs: number, wkts: number, overs: number,
  batsmanBalls: number, batsmanPower: number, batsmanConfidence: number,
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
    const remainingBalls = 60 - overs * 6;
    const reqRPO = remainingBalls > 0 ? ((target - runs) / remainingBalls) * 6 : 99;

    if (reqRPO > 14) return BattingIntent.Aggressive;
    if (reqRPO > 11) return BattingIntent.Aggressive;
    if (reqRPO > 9)  return Math.random() < 0.85 ? BattingIntent.Aggressive : BattingIntent.Balanced;
    if (reqRPO > 7)  return Math.random() < 0.60 ? BattingIntent.Aggressive : BattingIntent.Balanced;
    if (reqRPO > 5.5) return Math.random() < 0.38 ? BattingIntent.Aggressive : BattingIntent.Balanced;
    // Comfortable chase — keep rotating strike, never go fully defensive
    return Math.random() < 0.28 ? BattingIntent.Aggressive : BattingIntent.Balanced;
  }

  // FIRST INNINGS — build a big total
  if (overs >= 9) return BattingIntent.Aggressive; // last over: always swing

  if (overs >= 7) {
    // Death overs: near-always aggressive unless pure tail
    if (wkts >= 8) return BattingIntent.Balanced;
    return Math.random() < (0.80 + naturalAgg * 0.15) ? BattingIntent.Aggressive : BattingIntent.Balanced;
  }

  if (overs >= 5) {
    // Mid-late: push hard — even after wickets, keep scoring
    if (wkts >= 7) return Math.random() < 0.55 ? BattingIntent.Aggressive : BattingIntent.Balanced;
    if (wkts >= 4) return Math.random() < (0.52 + naturalAgg * 0.2) ? BattingIntent.Aggressive : BattingIntent.Balanced;
    return Math.random() < (0.58 + naturalAgg * 0.2) ? BattingIntent.Aggressive : BattingIntent.Balanced;
  }

  // Overs 2–5: middle powerplay — no longer go defensive on wickets; keep scoring
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
  target?: number, currentRuns?: number,
): FieldType {
  // New batsman is always most vulnerable — always attack
  if (strikerBalls < 5) return FieldType.Attacking;

  // Tail is exposed — pack the field to save runs, not chase wickets
  if (wkts >= 8) return FieldType.Defensive;

  // Death overs: press for wickets or protect a big lead
  if (overs >= 8) {
    if (target !== undefined && currentRuns !== undefined) {
      const rem = 60 - overs * 6;
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
  bowlerType: BowlerType, overs: number,
): BowlerLine {
  // Target weaker side
  if (batsmanOffside < batsmanLegside - 12)
    return Math.random() < 0.65 ? BowlerLine.OutsideOff : BowlerLine.OnStumps;
  if (batsmanLegside < batsmanOffside - 12)
    return Math.random() < 0.55 ? BowlerLine.OnPads : BowlerLine.OnStumps;

  // Death overs: vary length aggressively to disrupt timing
  if (overs >= 8) {
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

  // Simulate loop — fires handleNextBall as fast as React can process when active
  useEffect(() => {
    if (!state.isSimulating) return;
    const inns = getActiveInnings(state);
    if (!inns || inns.isComplete || state.needsBowlerChange) return;
    if (!getCurrentBatsmanOnStrike(inns) || !getCurrentBowler(inns)) return;
    const t = setTimeout(() => { handleNextBallRef.current(); }, 8);
    return () => clearTimeout(t);
  }, [state]);

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
      innings.target,
    );
    const aiLine = getAIBowlingLine(
      bsStats.batting.power, bsStats.batting.offsideSkill, bsStats.batting.legsideSkill,
      blStats.bowling.bowlerType, innings.totalOvers,
    );

    let intent = isBatting || state.isSimulating ? aiIntent : rpoToIntent(sRpo);
    let ef     = field;
    let line: BowlerLine | undefined = undefined;

    if (isBatting) {
      // AI is bowling — AI picks field and line
      ef = getAIField(
        innings.totalWickets, innings.totalOvers,
        onStrike.balls, onStrike.confidence,
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

      {/* ══ HEADER ══ */}
      <div className="shrink-0 flex flex-col items-center justify-center px-4 py-3 md:py-4 gap-1"
           style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(255,255,255,0.09)" }}>

        {/* Venue + time — desktop only, above the names */}
        <p className="hidden md:block text-[10px] text-gray-600 tracking-wide uppercase">
          Dubai Stadium · {matchTime.current} · T10 · {isSecond ? "2nd" : "1st"} Innings
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
          {/* Simulate button — testing tool */}
          <button
            onClick={() => dispatch({ type: "SET_SIMULATING", payload: { value: !state.isSimulating } })}
            className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide transition-colors ${
              state.isSimulating
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                : "bg-gray-700/60 text-gray-400 border border-gray-600/40 hover:text-white"
            }`}
          >
            {state.isSimulating ? "⏹ Stop" : "⚡ Sim"}
          </button>
        </div>
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
                          {str && <span className="text-emerald-400 text-xs ml-1">★</span>}
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
                          <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${ballBg(ev.outcome)}`}>
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
                  <div className="flex gap-1">
                    {([
                      { v: FieldType.Attacking, label:"Attack" },
                      { v: FieldType.Balanced,  label:"Balanced" },
                      { v: FieldType.Defensive, label:"Defend" },
                    ] as const).map(opt => (
                      <button key={opt.v} onClick={() => setField(opt.v)} disabled={!canPlay}
                        className={`flex-1 py-1 text-[10px] rounded border transition-all ${
                          !canPlay ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                        } ${
                          field === opt.v
                            ? opt.v === FieldType.Attacking ? "bg-red-700/50 border-red-500 text-red-200"
                            : opt.v === FieldType.Balanced  ? "bg-gray-700 border-gray-400 text-white"
                                                            : "bg-blue-800/50 border-blue-500 text-blue-200"
                            : "bg-gray-800 border-gray-700 text-gray-500"
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
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
                <span className="text-[9px] text-emerald-500 shrink-0">★</span>
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

      {/* ══ FULL-WIDTH BUTTON at very bottom ══ */}
      <div className="shrink-0 px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.35)" }}>
        <button
          onClick={handleNextBall}
          disabled={!canPlay}
          className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
            canPlay
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 active:scale-[0.98]"
              : "bg-gray-800 text-gray-600 cursor-not-allowed"
          }`}>
          {innings.isComplete      ? "Innings Complete"
           : state.needsBowlerChange ? "Select Bowler…"
           : isBatting              ? "▶  Next Ball"
                                    : "Bowl ▶"}
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
    </div>
  );
}
