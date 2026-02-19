import { useState, useEffect, useRef } from "react";
import { useGame } from "../state/gameContext";
import { BallOutcome, BattingIntent, FieldType } from "../types/enums";
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
function getAIIntent(runs: number, wkts: number, overs: number, target?: number): BattingIntent {
  if (target !== undefined) {
    const rr = (10 - overs) > 0 ? (target - runs) / (10 - overs) : 99;
    if (rr > 12) return BattingIntent.Aggressive;
    if (rr > 8)  return Math.random() < 0.6 ? BattingIntent.Aggressive : BattingIntent.Balanced;
    if (rr < 5)  return Math.random() < 0.5 ? BattingIntent.Defensive  : BattingIntent.Balanced;
    return BattingIntent.Balanced;
  }
  if (overs >= 8)  return Math.random() < 0.7 ? BattingIntent.Aggressive : BattingIntent.Balanced;
  if (overs >= 5)  return Math.random() < 0.4 ? BattingIntent.Aggressive : BattingIntent.Balanced;
  if (wkts  >= 3)  return Math.random() < 0.6 ? BattingIntent.Defensive  : BattingIntent.Balanced;
  return BattingIntent.Balanced;
}
function getAIField(wkts: number, overs: number): FieldType {
  if (wkts >= 5)  return FieldType.Defensive;
  if (overs < 3)  return Math.random() < 0.5 ? FieldType.Attacking : FieldType.Balanced;
  if (overs >= 8) return Math.random() < 0.4 ? FieldType.Attacking : FieldType.Balanced;
  return FieldType.Balanced;
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

  const matchTime    = useRef(new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }));
  const innings      = getActiveInnings(state);
  const prevStriker  = useRef<string|null>(null);
  const strikerId    = innings?.batsmen[innings?.currentBatsmanOnStrike]?.playerId ?? null;

  useEffect(() => {
    if (!innings || !state.needsBowlerChange || !innings.isUserBatting) return;
    const avail = getAvailableBowlers(innings);
    if (avail.length > 0) {
      const pick = avail[Math.floor(Math.random() * avail.length)];
      dispatch({ type: "CHANGE_BOWLER", payload: { bowlerId: pick.playerId } });
    }
  }, [state.needsBowlerChange, innings?.isUserBatting]);

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
  const nsAvg     = nonStrikerP
    ? Math.round((nonStrikerP.batting.techniqueVsPace + nonStrikerP.batting.techniqueVsSpin) / 2)
    : 0;
  const nsSR = nonStrike && nonStrike.balls > 0
    ? Math.round((nonStrike.runs / nonStrike.balls) * 100) : null;

  const handleNextBall = () => {
    if (!onStrike || !curBowler || !canPlay) return;
    const bsStats = findPlayer(allPlayers, onStrike.playerId);
    const blStats = findPlayer(allPlayers, curBowler.playerId);
    if (!bsStats || !blStats) return;

    let intent = rpoToIntent(sRpo);
    let ef     = field;
    let line   = undefined;

    if (isBatting) {
      ef = getAIField(innings.totalWickets, innings.totalOvers);
      setAiField(ef);
    } else {
      intent = getAIIntent(innings.totalRuns, innings.totalWickets, innings.totalOvers, innings.target);
      line   = mapToEngineLine(bowlLine, bowlLength);
    }

    let ev = simulateBall(onStrike, curBowler, bsStats, blStats,
      state.pitchType, intent, ef, innings, innings.target, line);

    if (keepStrike && isBatting && innings.ballsInCurrentOver === 5
        && ev.outcome === BallOutcome.Dot && Math.random() < 0.45) {
      ev = { ...ev, outcome: BallOutcome.Single, runsScored: 1 };
    }
    dispatch({ type: "PROCESS_BALL_RESULT", payload: { event: ev } });
  };

  // last 6 events for the tracker (sliding window)
  const trackerEvents = innings.currentOverEvents.slice(-6);

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">

      {/* ══ HEADER ══ */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-950">
        <div>
          <p className="text-base font-bold leading-tight">
            {innings.battingTeamName}
            <span className="text-gray-500 font-normal mx-2">vs</span>
            {innings.bowlingTeamName}
          </p>
          <p className="text-[11px] text-gray-500">
            T10 Match · {isSecond ? "2nd" : "1st"} Innings
            {isBatting ? " · You're batting" : " · You're bowling"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-600">
            Dubai Stadium · {matchTime.current}
          </p>
          <div className="flex items-center gap-2 justify-end mt-0.5">
            <span className="text-white font-bold text-sm tabular-nums">
              {innings.totalRuns}/{innings.totalWickets}
            </span>
            <span className="text-gray-500 text-[11px]">
              ({formatOvers(totalBalls)} ov) · RR {formatRunRate(innings.totalRuns, totalBalls)}
            </span>
            {reqRate !== null && (
              <span className={`text-[11px] font-bold ${rrColor(reqRate)}`}>
                · Need {reqRate.toFixed(1)}/ov
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ══ 2-COLUMN MAIN AREA ══ */}
      <div className="flex flex-1 min-h-0">

        {/* ════ LEFT 60% ════ */}
        <div className="flex flex-col border-r border-gray-800" style={{ width: "60%" }}>

          {/* Tabs */}
          <div className="flex shrink-0 border-b border-gray-800">
            {(["batting","bowling"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                  tab === t
                    ? "bg-gray-800 text-emerald-400 border-b-2 border-emerald-500"
                    : "text-gray-500 hover:text-gray-300"
                }`}>
                {t}
              </button>
            ))}
          </div>

          {/* Content + tracker fill remaining height */}
          <div className="flex flex-col flex-1 min-h-0">

            {/* ── Scorecard (70%) ── */}
            <div className="flex-[7] min-h-0 overflow-y-auto">

              {tab === "batting" && (
                <>
                  {/* Header */}
                  <div className="flex items-center px-3 py-1 bg-gray-900/60 border-b border-gray-800/60 sticky top-0">
                    <span className="flex-1 text-[10px] text-gray-500 font-semibold">Batsman</span>
                    <span className="w-10 text-right text-[10px] text-gray-500">Runs</span>
                    <span className="w-10 text-right text-[10px] text-gray-500">Balls</span>
                    <span className="w-8  text-right text-[10px] text-gray-500">4s</span>
                    <span className="w-8  text-right text-[10px] text-gray-500">6s</span>
                    <span className="w-12 text-right text-[10px] text-gray-500">SR%</span>
                  </div>
                  {/* Rows */}
                  {innings.batsmen.map((bat, i) => {
                    const p   = findPlayer(allPlayers, bat.playerId);
                    const str = i === innings.currentBatsmanOnStrike && !innings.isComplete;
                    const ns  = i === innings.currentBatsmanNonStrike && !innings.isComplete;
                    const sr  = bat.balls > 0 ? Math.round((bat.runs / bat.balls) * 100) : 0;
                    return (
                      <div key={bat.playerId}
                        className={`flex items-center px-3 py-1.5 border-b border-gray-800/30 text-sm transition-colors ${
                          str ? "bg-emerald-950/40 border-l-2 border-l-emerald-500" :
                          ns  ? "bg-gray-800/30  border-l-2 border-l-gray-500" :
                          bat.isOut ? "opacity-40" : ""
                        }`}>
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
                  {/* Extras */}
                  <div className="flex items-center px-3 py-1.5 border-b border-gray-800/30 text-sm">
                    <span className="flex-1 text-gray-500">Extras</span>
                    <span className="text-gray-400 tabular-nums">{extras}</span>
                  </div>
                  {/* Total */}
                  <div className="flex items-center px-3 py-2 bg-gray-900/60 text-sm">
                    <span className="flex-1 text-gray-300 font-semibold">
                      Total ({innings.totalWickets} wkts, {formatOvers(totalBalls)} overs)
                    </span>
                    <span className="text-white font-bold text-base tabular-nums">
                      {innings.totalRuns}
                    </span>
                  </div>
                </>
              )}

              {tab === "bowling" && (
                <>
                  <div className="flex items-center px-3 py-1 bg-gray-900/60 border-b border-gray-800/60 sticky top-0">
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
                          className={`flex items-center px-3 py-1.5 border-b border-gray-800/30 text-sm ${
                            cur ? "bg-red-950/30 border-l-2 border-l-red-500" : ""
                          }`}>
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

            {/* ── Ball-tracker (30%) — exactly 6 fixed-height lines ── */}
            <div className="flex-[3] flex flex-col border-t border-gray-800 min-h-0">
              {/* Title */}
              <div className="shrink-0 flex items-center gap-3 px-3 py-1 bg-gray-900/70 border-b border-gray-800/60">
                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                  ▲ Ball-tracker
                </span>
                <span className="text-[11px] text-gray-600">
                  Over {innings.totalOvers + 1}
                </span>
              </div>
              {/* 6 equal rows */}
              <div className="flex-1 flex flex-col min-h-0">
                {Array.from({ length: 6 }).map((_, i) => {
                  const ev = trackerEvents[i];
                  return (
                    <div key={i}
                      className="flex-1 flex items-center gap-2 px-3 border-b border-gray-800/25 min-h-0">
                      {ev ? (
                        <>
                          <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${ballBg(ev.outcome)}`}>
                            {ballLabel(ev.outcome, ev.runsScored)}
                          </div>
                          <span className="text-[11px] text-gray-400 leading-tight truncate">
                            {ev.commentary}
                          </span>
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
        </div>{/* end left 60% */}

        {/* ════ RIGHT 40% ════ */}
        <div className="flex flex-col min-h-0" style={{ width: "40%" }}>

          {/* ── Bowler card ── */}
          <div className="shrink-0 border-b border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span className="font-bold text-white text-base truncate">
                  {bowlerP?.name ?? "—"}
                </span>
                <span className="text-[11px] text-gray-500 uppercase shrink-0">
                  {bowlerP?.bowling.bowlerType ?? ""}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {curBowler && (
                  <span className="text-[10px] text-gray-600">
                    {curBowler.maxOvers - curBowler.overs}ov left
                  </span>
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
                {/* Stamina bar */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-gray-600 w-14 uppercase tracking-wide shrink-0">Stamina</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${confBar(curBowler.confidence)}`}
                         style={{ width: `${curBowler.confidence}%` }} />
                  </div>
                </div>
                {/* O M R W Econ */}
                <div className="flex gap-5 border-t border-gray-800 pt-2">
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

            {/* Bowling controls — only when user is bowling */}
            {!isBatting && (
              <div className="mt-3 pt-3 border-t border-gray-800 space-y-2">
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
          </div>{/* end bowler card */}

          {/* ── Striker panel (flex-1) ── */}
          <div className="flex-1 flex flex-col border-b border-gray-800 px-4 py-3 min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-emerald-400 font-bold shrink-0">
                  {innings.currentBatsmanOnStrike + 1}
                </span>
                <span className="font-bold text-white text-base truncate">
                  {strikerP?.name ?? "—"}
                </span>
                {onStrike && (
                  <span className="text-[10px] text-gray-500 shrink-0">
                    {batsmanStatus(onStrike.balls)}
                  </span>
                )}
                <span className="text-[10px] text-emerald-500 shrink-0">★</span>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-2xl font-extrabold tabular-nums">{onStrike?.runs ?? 0}</span>
                <span className="text-gray-500 text-sm ml-1">({onStrike?.balls ?? 0})</span>
              </div>
            </div>

            {/* Confidence + SR */}
            {onStrike && (
              <div className="flex items-center gap-2 shrink-0 mb-2 text-[10px]">
                <span className="text-gray-600">Conf</span>
                <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${confBar(onStrike.confidence)}`}
                       style={{ width: `${onStrike.confidence}%` }} />
                </div>
                {onStrike.balls > 0 && (
                  <span className="text-gray-600 ml-1">
                    SR {Math.round((onStrike.runs / onStrike.balls) * 100)}
                    {onStrike.fours > 0 && ` · 4s ${onStrike.fours}`}
                    {onStrike.sixes > 0 && ` · 6s ${onStrike.sixes}`}
                  </span>
                )}
              </div>
            )}

            {flash && (
              <div className="shrink-0 text-[10px] text-yellow-300 bg-yellow-900/20 border border-yellow-700/30 rounded px-2 py-0.5 mb-2">
                ↺ New batsman — aggression reset to Balanced
              </div>
            )}

            {/* Field + slider + keep-strike — fills remaining height */}
            <div className="flex items-center gap-4 flex-1 min-h-0">
              <div className="shrink-0">
                <FieldDiagram fieldType={diagField} size={148} showLabel />
              </div>
              {isBatting ? (
                <>
                  <VerticalAggSlider
                    value={sRpo}
                    onChange={v => onStrike && setRpoFor(onStrike.playerId, v)}
                    disabled={!canPlay}
                    height={143}
                  />
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <span className="text-[9px] text-gray-500 text-center leading-tight">
                      Keep<br />Strike
                    </span>
                    <button
                      onClick={() => setKeepStrike(!keepStrike)}
                      disabled={!canPlay}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded border transition-all ${
                        keepStrike
                          ? "bg-blue-700/50 border-blue-500 text-blue-200"
                          : "bg-gray-800 border-gray-600 text-gray-500"
                      } ${!canPlay ? "opacity-40 cursor-not-allowed" : ""}`}>
                      {keepStrike ? "ON ✓" : "OFF"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-[10px] text-gray-600">
                  <p>Field: <span className="text-white font-medium capitalize">{field}</span></p>
                </div>
              )}
            </div>
          </div>{/* end striker */}

          {/* ── Non-striker panel (flex-1) ── */}
          <div className="flex-1 flex flex-col px-4 py-3 min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-gray-500 font-bold shrink-0">
                  {innings.currentBatsmanNonStrike + 1}
                </span>
                <span className="font-medium text-gray-200 text-base truncate">
                  {nonStrikerP?.name ?? "—"}
                </span>
                {nonStrike && (
                  <span className="text-[10px] text-gray-600 shrink-0">
                    {batsmanStatus(nonStrike.balls)}
                  </span>
                )}
              </div>
              <div className="shrink-0 text-right">
                <span className="text-2xl font-bold tabular-nums text-gray-300">{nonStrike?.runs ?? 0}</span>
                <span className="text-gray-600 text-sm ml-1">({nonStrike?.balls ?? 0})</span>
              </div>
            </div>

            <p className="text-[10px] text-gray-600 shrink-0 mb-2">
              Batting Avg: {nsAvg}
              {nsSR !== null && ` · SR: ${nsSR}`}
              {nonStrikerP && ` · ${nonStrikerP.role}`}
            </p>

            {/* Field + slider */}
            <div className="flex items-center gap-4 flex-1 min-h-0">
              <div className="shrink-0">
                <FieldDiagram fieldType={diagField} size={130} showLabel />
              </div>
              {isBatting && nonStrike && (
                <VerticalAggSlider
                  value={nsRpo}
                  onChange={v => setRpoFor(nonStrike.playerId, v)}
                  disabled={!canPlay}
                  height={125}
                />
              )}
            </div>
          </div>{/* end non-striker */}

        </div>{/* end right 40% */}
      </div>{/* end 2-col */}

      {/* ══ FULL-WIDTH BUTTON at very bottom ══ */}
      <div className="shrink-0 px-4 py-3 border-t border-gray-800 bg-gray-950">
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
