import { useEffect, useRef, useState } from "react";
import { useGame } from "../state/gameContext";
import { useMultiplayer } from "../multiplayer/MultiplayerContext";
import { HostMsg, LobbyMsg, MatchSnapshot, OverSummaryData } from "../multiplayer/types";
import { BattingIntent, BowlerLine, FieldType } from "../types/enums";
import { FieldDiagram } from "../components/FieldDiagram";
import { PitchSelector, mapToEngineLine } from "../components/PitchSelector";
import type { BowlingLineChoice, BowlingLengthChoice } from "../components/PitchSelector";
import { rpoToIntent } from "../components/RPOSlider";
import { formatOvers, formatEconomy } from "../utils/format";
import { playCheer, playGroan } from "../utils/sounds";

const BALL_TIMER_SECS = 6;

// ── Helpers ────────────────────────────────────────────────────────────────────
function ballBg(outcome: string) {
  if (outcome === "W") return "bg-red-600 text-white";
  if (outcome === "6") return "bg-yellow-400 text-black";
  if (outcome === "4") return "bg-blue-600 text-white";
  if (outcome === ".") return "bg-gray-700 text-gray-300";
  return "bg-emerald-700 text-white";
}
function confBar(v: number) {
  return v >= 70 ? "bg-emerald-500" : v >= 45 ? "bg-yellow-500" : "bg-red-500";
}
function batsmanStatus(balls: number) {
  return balls < 6 ? "New" : balls < 16 ? "Getting Set" : "Settled";
}
function dismissalShort(t?: string) {
  return t === "bowled" ? "b" : t === "caught" ? "c&b" : t === "lbw" ? "lbw"
       : t === "run-out" ? "run out" : t === "stumped" ? "st" : t ? "out" : "";
}
function roleLabel(role: string) {
  return role === "batsman" ? "BAT" : role === "wicket-keeper" ? "WK"
       : role === "all-rounder" ? "AR" : "BWL";
}
function roleColor(role: string): [string, string, string] {
  return role === "bowler"
    ? ["#f87171", "rgba(248,113,113,0.3)", "rgba(248,113,113,0.08)"]
    : ["#34d399", "rgba(52,211,153,0.3)", "rgba(52,211,153,0.08)"];
}

// ── Vertical aggression slider (mirrors MatchScreen) ─────────────────────────
function VerticalAggSlider({
  value, onChange, disabled, height = 140,
}: { value: number; onChange: (v: number) => void; disabled?: boolean; height?: number }) {
  const W = 42, H = height;
  const pct = ((value - 4) / 8) * 100;
  const col = pct < 37 ? "#3b82f6" : pct < 63 ? "#22c55e" : "#ef4444";
  const zoneLabel = pct < 37 ? "CAREFUL" : pct < 63 ? "BALANCED" : "ATTACK";
  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0 select-none">
      <span className="text-[8px] font-black text-red-400 uppercase tracking-wide">AGG ▲</span>
      <div className="relative" style={{ width: W, height: H }}>
        <div className="absolute rounded-full"
             style={{ left: 17, right: 17, top: 0, bottom: 0,
               background: "linear-gradient(to top,#3b82f6 0%,#22c55e 48%,#ef4444 100%)", opacity: 0.22 }} />
        <div className="absolute rounded-full transition-all duration-75"
             style={{ left: 17, right: 17, bottom: 0, height: `${pct}%`, backgroundColor: col }} />
        <div className="absolute rounded-full border-2 shadow-lg transition-all duration-75"
             style={{ left: 7, right: 7, height: 16, bottom: `calc(${pct}% - 8px)`,
               borderColor: "rgba(255,255,255,.7)", backgroundColor: col }} />
        <input type="range" min={4} max={12} step={0.5} value={value}
               disabled={disabled}
               onChange={e => onChange(Number(e.target.value))}
               style={{ position: "absolute", width: H, height: W,
                 left: (W - H) / 2, top: (H - W) / 2,
                 transform: "rotate(-90deg)", opacity: 0,
                 cursor: disabled ? "not-allowed" : "pointer", margin: 0, padding: 0 }} />
      </div>
      <span className="text-[8px] font-black text-blue-400 uppercase tracking-wide">▼ DEF</span>
      <span className="text-[9px] font-bold mt-0.5" style={{ color: col }}>{zoneLabel}</span>
    </div>
  );
}

// ── Countdown ring ─────────────────────────────────────────────────────────────
function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 20, circ = 2 * Math.PI * r;
  const color = seconds > 3 ? "#10b981" : "#ef4444";
  return (
    <svg width={52} height={52} className="shrink-0">
      <circle cx={26} cy={26} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
      <circle cx={26} cy={26} r={r} fill="none" stroke={color} strokeWidth={4}
              strokeDasharray={`${circ * (seconds / total)} ${circ}`} strokeLinecap="round"
              transform="rotate(-90 26 26)" style={{ transition: "stroke-dasharray 0.9s linear" }} />
      <text x={26} y={31} textAnchor="middle" fontSize={14} fontWeight="bold" fill={color}>{seconds}</text>
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function GuestMatchScreen() {
  const { dispatch } = useGame();
  const mp = useMultiplayer();

  const [snap, setSnap] = useState<MatchSnapshot | null>(null);
  const [hostReady, setHostReady] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rpo, setRpo] = useState(7.5);
  const [bowlLine, setBowlLine] = useState<BowlingLineChoice>("middle");
  const [bowlLength, setBowlLength] = useState<BowlingLengthChoice>("good");
  const [tab, setTab] = useState<"batting" | "bowling">("batting");
  const [mobileTab, setMobileTab] = useState<"score" | "controls">("controls");
  const [keepStrike, setKeepStrike] = useState(false);

  // Over modal
  const [overModal, setOverModal] = useState<OverSummaryData | null>(null);
  const prevTotalOvers = useRef(-1);

  // Celebration
  const [celebration, setCelebration] = useState<{ type: "six" | "wicket"; text: string } | null>(null);
  const celebTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bowler / batsman picks
  const [needBowler, setNeedBowler] = useState(false);
  const [needBatsman, setNeedBatsman] = useState(false);
  const [eligBowlers, setEligBowlers] = useState<{ id: string; name: string; overs: number; runs: number }[]>([]);
  const [remBatsmen, setRemBatsmen] = useState<{ id: string; name: string }[]>([]);

  // 6-second timer
  const [timerSecs, setTimerSecs] = useState(BALL_TIMER_SECS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // hold latest rpo/line in refs so autoSubmit always sees fresh values
  const rpoRef = useRef(rpo);
  const lineRef = useRef<{ l: BowlingLineChoice; len: BowlingLengthChoice }>({ l: bowlLine, len: bowlLength });
  rpoRef.current = rpo;
  lineRef.current = { l: bowlLine, len: bowlLength };

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerSecs(BALL_TIMER_SECS);
    timerRef.current = setInterval(() => {
      setTimerSecs(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          autoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function autoSubmit() {
    const guestBat = snapRef.current ? !snapRef.current.hostBatting : false;
    mp.sendMessage({
      t: "GUEST_BALL_INPUT",
      intent: guestBat ? rpoToIntent(rpoRef.current) : undefined,
      line:   guestBat ? undefined : mapToEngineLine(lineRef.current.l, lineRef.current.len),
    });
    setSubmitted(true);
    setHostReady(false);
  }

  const snapRef = useRef<MatchSnapshot | null>(null);

  function showCelebration(type: "six" | "wicket", text: string) {
    if (celebTimer.current) clearTimeout(celebTimer.current);
    setCelebration({ type, text });
    celebTimer.current = setTimeout(() => setCelebration(null), 1800);
  }

  // ── Message listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = mp.onMessage((raw) => {
      const msg = raw as (HostMsg | LobbyMsg);
      if ("t" in msg && (msg.t === "LOBBY_TEAM_UPDATE" || msg.t === "LOBBY_TEAM_LOCK" || msg.t === "LOBBY_XI_LOCK" || msg.t === "LOBBY_READY")) return;
      const hmsg = msg as HostMsg;

      if (hmsg.t === "HOST_BALL_READY") {
        setHostReady(true);
        setSubmitted(false);
        startTimer();
      }

      if (hmsg.t === "BALL_RESULT" || hmsg.t === "MATCH_OVER") {
        stopTimer();
        const s = hmsg.snapshot;
        snapRef.current = s;
        setSnap(s);
        setHostReady(false);
        setSubmitted(false);

        const gb = !s.hostBatting; // true = guest is batting this ball
        if (s.lastOutcome === "W") {
          showCelebration("wicket", s.lastBatsmanName ? `${s.lastBatsmanName} OUT!` : "WICKET!");
          if (gb) playGroan(); else playCheer();
        } else if (s.lastOutcome === "6") {
          showCelebration("six", s.lastBowlerName ? `off ${s.lastBowlerName}` : "SIX!");
          if (gb) playCheer(); else playGroan();
        }

        if (s.overJustCompleted && s.totalOvers !== prevTotalOvers.current) {
          prevTotalOvers.current = s.totalOvers;
          setOverModal(s.overJustCompleted);
        }

        setNeedBowler(s.needsGuestBowler);
        setNeedBatsman(s.needsGuestNextBatsman);
        if (s.needsGuestBowler)      setEligBowlers(s.guestEligibleBowlers);
        if (s.needsGuestNextBatsman) setRemBatsmen(s.guestRemainingBatsmen);
      }

      if (hmsg.t === "NEED_GUEST_BOWLER") {
        setNeedBowler(true);
        setEligBowlers(hmsg.eligible);
      }
      if (hmsg.t === "NEED_GUEST_NEXT_BATSMAN") {
        setNeedBatsman(true);
        setRemBatsmen(hmsg.remaining);
      }
    });
    return () => { unsub(); stopTimer(); };
  }, [mp]);

  const submitInput = () => {
    if (!hostReady || submitted) return;
    stopTimer();
    const guestBatting = snap ? !snap.hostBatting : false;
    mp.sendMessage({
      t: "GUEST_BALL_INPUT",
      intent: guestBatting ? rpoToIntent(rpo) : undefined,
      line:   guestBatting ? undefined : mapToEngineLine(bowlLine, bowlLength),
    });
    setSubmitted(true);
    setHostReady(false);
  };

  const pickBowler  = (id: string) => { mp.sendMessage({ t: "GUEST_BOWLER",       bowlerId: id  }); setNeedBowler(false); };
  const pickBatsman = (id: string) => { mp.sendMessage({ t: "GUEST_NEXT_BATSMAN", batsmanId: id }); setNeedBatsman(false); };

  const guestBatting = snap ? !snap.hostBatting : false;
  const canInput     = hostReady && !needBowler && !needBatsman && !snap?.isMatchOver;
  const diagField    = (snap?.fieldType ?? "balanced") as FieldType;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full text-white overflow-hidden"
         style={{ background: "linear-gradient(135deg,#0a0f1e 0%,#0d1117 50%,#0a1628 100%)" }}>

      {/* ── Celebration overlay ── */}
      {celebration && (
        <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex",
          alignItems: "center", justifyContent: "center", pointerEvents: "none",
          animation: "celebFade 1.6s ease forwards" }}>
          <div style={{
            position: "absolute", inset: 0,
            background: celebration.type === "six"
              ? "radial-gradient(ellipse at center,rgba(234,179,8,0.45) 0%,rgba(234,179,8,0) 65%)"
              : "radial-gradient(ellipse at center,rgba(239,68,68,0.5) 0%,rgba(239,68,68,0) 65%)",
          }} />
          <div className="relative text-center px-10 py-8 rounded-3xl space-y-2" style={{
            background:      celebration.type === "six" ? "rgba(30,25,0,0.75)" : "rgba(30,0,0,0.75)",
            border:          celebration.type === "six" ? "2px solid rgba(234,179,8,0.6)" : "2px solid rgba(239,68,68,0.6)",
            backdropFilter:  "blur(8px)",
            boxShadow:       celebration.type === "six" ? "0 0 60px rgba(234,179,8,0.35)" : "0 0 60px rgba(239,68,68,0.35)",
          }}>
            <p className="text-5xl font-black tracking-tight" style={{
              color:      celebration.type === "six" ? "#facc15" : "#f87171",
              textShadow: celebration.type === "six" ? "0 0 30px rgba(234,179,8,0.8)" : "0 0 30px rgba(239,68,68,0.8)",
            }}>{celebration.type === "six" ? "SIX!" : "WICKET!"}</p>
            <p className="text-sm font-semibold" style={{ color: celebration.type === "six" ? "#fde68a" : "#fca5a5" }}>
              {celebration.text}
            </p>
          </div>
        </div>
      )}

      {/* ── Over modal ── */}
      {overModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden shadow-2xl"
               style={{ background: "#0d1b12", border: "1px solid rgba(16,185,129,0.3)" }}>
            <div className="flex items-center justify-between px-5 py-3"
                 style={{ background: "rgba(16,185,129,0.12)", borderBottom: "1px solid rgba(16,185,129,0.2)" }}>
              <div>
                <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">End of Over {overModal.over}</p>
                <p className="text-base font-bold text-white mt-0.5">
                  {overModal.runs} runs · {overModal.wickets} wkt{overModal.wickets !== 1 ? "s" : ""}
                </p>
              </div>
              <button onClick={() => setOverModal(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 text-lg font-bold">×</button>
            </div>
            <div className="px-5 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-sm font-semibold text-white">{overModal.bowlerName}</p>
            </div>
            <div className="px-5 py-3 space-y-1.5 max-h-52 overflow-y-auto">
              {overModal.balls.map((b, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${ballBg(b.outcome)}`}>
                    {b.outcome}
                  </span>
                  <p className="text-[11px] text-gray-400 leading-tight pt-0.5 flex-1">{b.commentary}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button onClick={() => setOverModal(null)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider"
                      style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bowler picker modal ── */}
      {needBowler && (
        <div style={{ position: "fixed", inset: 0, zIndex: 55, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden shadow-2xl"
               style={{ background: "#0d1117", border: "1px solid rgba(99,102,241,0.3)" }}>
            <div className="px-5 py-3" style={{ background: "rgba(99,102,241,0.12)", borderBottom: "1px solid rgba(99,102,241,0.2)" }}>
              <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">New Over</p>
              <p className="text-base font-bold text-white mt-0.5">Pick Your Bowler</p>
            </div>
            <div className="px-4 py-3 space-y-2 max-h-72 overflow-y-auto">
              {eligBowlers.map(b => (
                <button key={b.id} onClick={() => pickBowler(b.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all active:scale-[0.98]"
                        style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)" }}>
                  <span className="flex-1 text-left text-white font-semibold">{b.name}</span>
                  <span className="text-gray-400 text-xs">{b.overs} ov · {b.runs} runs</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Next batsman picker modal ── */}
      {needBatsman && (
        <div style={{ position: "fixed", inset: 0, zIndex: 55, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden shadow-2xl"
               style={{ background: "#0d1117", border: "1px solid rgba(16,185,129,0.3)" }}>
            <div className="px-5 py-3" style={{ background: "rgba(16,185,129,0.08)", borderBottom: "1px solid rgba(16,185,129,0.15)" }}>
              <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">Wicket!</p>
              <p className="text-base font-bold text-white mt-0.5">Send In Next Batsman</p>
            </div>
            <div className="px-4 py-3 space-y-2 max-h-72 overflow-y-auto">
              {remBatsmen.map(b => (
                <button key={b.id} onClick={() => pickBatsman(b.id)}
                        className="w-full flex items-center px-4 py-3 rounded-xl text-sm transition-all active:scale-[0.98]"
                        style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
                  <span className="flex-1 text-left text-white font-semibold">{b.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Status bar ── */}
      <div className="flex items-center gap-2 px-3 py-1 text-xs shrink-0"
           style={{ background: "rgba(99,102,241,0.1)", borderBottom: "1px solid rgba(99,102,241,0.15)" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        <span className="text-indigo-400 font-semibold">GUEST</span>
        <span className="text-gray-600 mx-1">·</span>
        <span className="text-gray-500">vs {snap?.hostTeamName ?? "Host"}</span>
        {mp.roomCode && <span className="ml-auto text-gray-600 font-mono">{mp.roomCode}</span>}
      </div>

      {/* ── Score header ── */}
      {snap && (
        <div className="shrink-0 flex flex-col items-center justify-center px-4 py-3 md:py-4 gap-1"
             style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(255,255,255,0.09)" }}>
          <div className="flex items-center gap-3 md:gap-5">
            <span className="text-base md:text-2xl font-extrabold tracking-tight text-white truncate max-w-[120px] md:max-w-none text-right">
              {snap.hostBatting ? snap.hostTeamName : snap.guestTeamName}
            </span>
            <span className="text-xs md:text-sm text-gray-500 font-medium shrink-0">vs</span>
            <span className="text-base md:text-2xl font-extrabold tracking-tight text-gray-400 truncate max-w-[120px] md:max-w-none">
              {snap.hostBatting ? snap.guestTeamName : snap.hostTeamName}
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3 mt-0.5">
            <span className="text-lg md:text-3xl font-black tabular-nums text-emerald-300 leading-none">
              {snap.runs}/{snap.wickets}
            </span>
            <span className="text-xs md:text-sm text-gray-500 tabular-nums">({snap.overs} ov)</span>
            {snap.target && (
              <span className="text-xs md:text-sm font-bold text-amber-400">
                · Need {snap.target - snap.runs} off {snap.matchOvers * 6 - snap.totalBalls} balls
              </span>
            )}
          </div>
          {/* Powerplay badge */}
          {(() => {
            const ppOvers = snap.matchOvers === 5 ? 1 : snap.matchOvers === 20 ? 6 : 2;
            const isInPP  = snap.currentOverNumber < ppOvers;
            return isInPP ? (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                   style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24" }}>
                ⚡ Powerplay · {ppOvers - snap.currentOverNumber} ov left
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* ── Mobile tab bar ── */}
      <div className="md:hidden flex shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        {(["score", "controls"] as const).map(t => (
          <button key={t} onClick={() => setMobileTab(t)}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    mobileTab === t ? "text-emerald-400 border-b-2 border-emerald-500 bg-white/5" : "text-gray-500"
                  }`}>
            {t === "score" ? "📊 Scorecard" : "🎮 Controls"}
          </button>
        ))}
      </div>

      {/* ══ Main 2-column area ══ */}
      <div className="flex flex-1 min-h-0 md:gap-7 md:py-4 md:px-10">

        {/* ════ LEFT: Scorecard + Ball tracker ════ */}
        <div className={`flex flex-col overflow-hidden w-full md:flex-[6] rounded-none md:rounded-xl ${mobileTab !== "score" ? "max-md:hidden" : ""}`}
             style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.09)" }}>

          {/* Tabs */}
          <div className="flex shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {(["batting", "bowling"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                      className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                        tab === t ? "bg-white/5 text-emerald-400 border-b-2 border-emerald-500" : "text-gray-500"
                      }`}>
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-col flex-1 min-h-0">
            <div className="overflow-y-auto" style={{ maxHeight: "63%" }}>

              {/* ── Batting scorecard ── */}
              {tab === "batting" && snap && (
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
                  {snap.allBatsmen.map((bat, i) => {
                    const sr = bat.balls > 0 ? Math.round((bat.runs / bat.balls) * 100) : 0;
                    return (
                      <div key={i}
                           className={`flex items-center px-3 py-1.5 text-sm ${
                             bat.isOnStrike ? "border-l-2 border-l-emerald-500" :
                             bat.isNonStrike ? "border-l-2 border-l-gray-500" :
                             bat.isOut ? "opacity-40" : ""
                           }`}
                           style={{
                             borderBottom: "1px solid rgba(255,255,255,0.04)",
                             background: bat.isOnStrike ? "rgba(16,185,129,0.1)" : bat.isNonStrike ? "rgba(255,255,255,0.03)" : "transparent",
                           }}>
                        <div className="flex-1 min-w-0">
                          <span className={`truncate font-medium ${bat.isOnStrike || bat.isNonStrike ? "text-white" : bat.isOut ? "text-gray-500" : "text-gray-300"}`}>
                            {bat.name}
                          </span>
                          {bat.isOut && <span className="text-[10px] text-gray-600 ml-1">({dismissalShort(bat.dismissalType)})</span>}
                        </div>
                        <span className={`w-10 text-right tabular-nums font-medium ${bat.runs >= 50 ? "text-yellow-300 font-bold" : bat.runs >= 30 ? "text-emerald-300" : "text-gray-300"}`}>
                          {bat.isOut || bat.balls > 0 ? bat.runs : "—"}
                        </span>
                        <span className="w-10 text-right tabular-nums text-gray-500">{bat.balls > 0 ? bat.balls : ""}</span>
                        <span className="w-8  text-right tabular-nums text-gray-500">{bat.fours > 0 ? bat.fours : ""}</span>
                        <span className="w-8  text-right tabular-nums text-gray-500">{bat.sixes > 0 ? bat.sixes : ""}</span>
                        <span className="w-12 text-right tabular-nums text-gray-500">{bat.balls > 0 ? sr : ""}</span>
                      </div>
                    );
                  })}
                  <div className="flex items-center px-3 py-1.5 text-sm"
                       style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span className="flex-1 text-gray-500">Extras</span>
                    <span className="text-gray-400 tabular-nums">{snap.extras}</span>
                  </div>
                  <div className="flex items-center px-3 py-2 text-sm" style={{ background: "rgba(0,0,0,0.25)" }}>
                    <span className="flex-1 text-gray-300 font-semibold">
                      Total ({snap.wickets} wkts, {snap.overs} overs)
                    </span>
                    <span className="text-white font-bold text-base tabular-nums">{snap.runs}/{snap.wickets}</span>
                  </div>
                </>
              )}

              {/* ── Bowling scorecard ── */}
              {tab === "bowling" && snap && (
                <>
                  <div className="flex items-center px-3 py-1 sticky top-0"
                       style={{ background: "rgba(0,0,0,0.35)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="flex-1 text-[10px] text-gray-500 font-semibold">Bowler</span>
                    <span className="w-8  text-right text-[10px] text-gray-500">O</span>
                    <span className="w-10 text-right text-[10px] text-gray-500">R</span>
                    <span className="w-8  text-right text-[10px] text-gray-500">W</span>
                    <span className="w-16 text-right text-[10px] text-gray-500">Econ</span>
                  </div>
                  {snap.allBowlers.map((b, i) => (
                    <div key={i}
                         className={`flex items-center px-3 py-1.5 text-sm ${b.isCurrent ? "border-l-2 border-l-red-500" : ""}`}
                         style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: b.isCurrent ? "rgba(239,68,68,0.08)" : "transparent" }}>
                      <span className={`flex-1 truncate font-medium ${b.isCurrent ? "text-white" : "text-gray-300"}`}>{b.name}</span>
                      <span className="w-8  text-right tabular-nums text-gray-500">{formatOvers(b.balls)}</span>
                      <span className="w-10 text-right tabular-nums text-gray-500">{b.runs}</span>
                      <span className={`w-8 text-right tabular-nums font-bold ${b.wickets >= 3 ? "text-red-400" : b.wickets > 0 ? "text-orange-400" : "text-gray-500"}`}>
                        {b.wickets}
                      </span>
                      <span className="w-16 text-right tabular-nums text-gray-500">
                        {b.balls > 0 ? formatEconomy(b.runs, b.balls) : "—"}
                      </span>
                    </div>
                  ))}
                  {snap.allBowlers.length === 0 && (
                    <p className="text-sm text-gray-600 italic p-4">No overs bowled yet</p>
                  )}
                </>
              )}
            </div>

            {/* ── Ball tracker ── */}
            <div className="flex-1 flex flex-col min-h-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="shrink-0 flex items-center gap-3 px-3 py-1"
                   style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">▲ Ball-tracker</span>
                <span className="text-[11px] text-gray-600">Over {(snap?.currentOverNumber ?? 0) + 1}</span>
              </div>
              <div className="flex-1 flex flex-col min-h-0">
                {Array.from({ length: 6 }).map((_, i) => {
                  const b = snap?.currentOverBalls[i];
                  return (
                    <div key={i} className="flex-1 flex items-center gap-2 px-3 min-h-0"
                         style={{ borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      {b ? (
                        <>
                          <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${ballBg(b.outcome)}`}>
                            {b.outcome}
                          </div>
                          <span className="text-[11px] text-gray-400 leading-tight truncate">{b.commentary ?? ""}</span>
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
          </div>
        </div>

        {/* ════ RIGHT: Controls ════ */}
        <div className={`flex flex-col gap-2 p-2 overflow-y-auto md:overflow-hidden w-full md:flex-[4] rounded-none md:rounded-xl ${mobileTab !== "controls" ? "max-md:hidden" : ""}`}
             style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.09)" }}>

          {/* ── Bowler sub-card ── */}
          <div className="shrink-0 rounded-lg px-3 py-2.5"
               style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span className="font-bold text-white text-base truncate">{snap?.bowler?.name ?? "—"}</span>
                <span className="text-[11px] text-gray-500 uppercase shrink-0">{snap?.bowlerType ?? ""}</span>
              </div>
              {snap?.bowler && snap.bowlerMaxOvers > 0 && (
                <span className="text-[10px] text-gray-600 shrink-0">
                  {snap.bowlerMaxOvers - parseInt(snap.bowler.overs.split(".")[0])} ov left
                </span>
              )}
            </div>

            {snap?.bowler && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-gray-600 w-14 uppercase tracking-wide shrink-0">Stamina</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${confBar(snap.bowlerConfidence)}`}
                         style={{ width: `${snap.bowlerConfidence}%` }} />
                  </div>
                </div>
                <div className="flex gap-5 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  {[
                    { label: "O", value: snap.bowler.overs },
                    { label: "R", value: String(snap.bowler.runs) },
                    { label: "W", value: String(snap.bowler.wickets) },
                    { label: "Econ", value: (() => {
                      const bs = parseInt(snap.bowler!.overs.split(".")[0]) * 6 + parseInt(snap.bowler!.overs.split(".")[1] ?? "0");
                      return bs > 0 ? formatEconomy(snap.bowler!.runs, bs) : "—";
                    })() },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-[9px] text-gray-600 uppercase">{label}</p>
                      <p className={`text-sm font-bold tabular-nums ${label === "W" && Number(value) > 0 ? "text-red-400" : "text-white"}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* PitchSelector when guest is bowling */}
            {!guestBatting && (
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <PitchSelector
                  selectedLine={bowlLine}
                  selectedLength={bowlLength}
                  onSelect={(l, len) => { setBowlLine(l); setBowlLength(len); }}
                  disabled={!canInput}
                />
              </div>
            )}
          </div>

          {/* ── Striker sub-card ── */}
          {snap?.striker && (() => {
            const striker = snap.allBatsmen.find(b => b.isOnStrike);
            const sr = striker && striker.balls > 0 ? Math.round((striker.runs / striker.balls) * 100) : 0;
            const [roleCol, roleBorder, roleBg] = striker ? roleColor(striker.role) : ["#34d399", "rgba(52,211,153,0.3)", "rgba(52,211,153,0.08)"];
            return (
              <div className="shrink-0 md:flex-1 flex flex-col rounded-lg px-3 py-2 min-h-0 overflow-hidden"
                   style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div className="flex items-center justify-between shrink-0 mb-1">
                  <span className="font-bold text-white text-sm truncate">{snap.striker.name}</span>
                  <div className="shrink-0 text-right ml-2">
                    <span className="text-lg font-extrabold tabular-nums">{snap.striker.runs}</span>
                    <span className="text-gray-500 text-xs ml-1">({snap.striker.balls})</span>
                  </div>
                </div>

                {striker && (
                  <div className="flex items-center gap-2 shrink-0 mb-1.5">
                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0"
                          style={{ color: roleCol, borderColor: roleBorder, background: roleBg }}>
                      {roleLabel(striker.role)}
                    </span>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="w-14 h-1.5 bg-gray-800 rounded-full overflow-hidden shrink-0">
                        <div className={`h-full rounded-full ${confBar(striker.confidence)}`}
                             style={{ width: `${striker.confidence}%` }} />
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-wide shrink-0 ${
                        striker.confidence >= 70 ? "text-emerald-400" : striker.confidence >= 45 ? "text-yellow-400" : "text-red-400"
                      }`}>
                        {striker.confidence >= 70 ? "HOT" : striker.confidence >= 45 ? "OK" : "COLD"}
                      </span>
                      <span className="text-[9px] text-gray-600 shrink-0">{batsmanStatus(striker.balls)}</span>
                      {striker.balls > 0 && (
                        <span className="text-[9px] text-gray-500 ml-auto shrink-0">
                          SR <span className="text-gray-300 font-semibold">{sr}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 flex-1 min-h-0 overflow-hidden">
                  <div className="shrink-0">
                    <FieldDiagram fieldType={diagField} size={148} showLabel />
                  </div>
                  {guestBatting ? (
                    <>
                      <VerticalAggSlider value={rpo} onChange={setRpo} disabled={!canInput} height={113} />
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <span className="text-[8px] text-gray-500 text-center leading-tight uppercase tracking-wide">Keep<br />Strike</span>
                        <button
                          onClick={() => setKeepStrike(!keepStrike)}
                          disabled={!canInput}
                          className={`px-3 py-2 text-[10px] font-black rounded-lg border-2 transition-all ${
                            keepStrike ? "bg-blue-700/40 border-blue-500 text-blue-200" : "bg-gray-800/60 border-gray-600/60 text-gray-500"
                          } ${!canInput ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          {keepStrike ? "ON ✓" : "OFF"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-[9px] text-gray-500">
                      Field: <span className="text-gray-300 capitalize">{diagField}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── Partnership strip ── */}
          {snap?.partnership && snap.striker && snap.nonStriker && (
            <div className="shrink-0 flex items-center justify-center gap-3 py-1.5 rounded-lg text-[11px]"
                 style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-gray-500 uppercase tracking-wider text-[9px]">Partnership</span>
              <span className="font-bold text-white tabular-nums">
                {snap.partnership.runs}
                <span className="text-gray-500 font-normal ml-1">({snap.partnership.balls})</span>
              </span>
            </div>
          )}

          {/* ── Non-striker sub-card ── */}
          {snap?.nonStriker && (() => {
            const ns = snap.allBatsmen.find(b => b.isNonStrike);
            const sr = ns && ns.balls > 0 ? Math.round((ns.runs / ns.balls) * 100) : 0;
            return (
              <div className="shrink-0 rounded-lg px-3 py-2"
                   style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-200 text-sm truncate">{snap.nonStriker.name}</span>
                  <div className="shrink-0 text-right ml-2">
                    <span className="text-lg font-bold tabular-nums text-gray-300">{snap.nonStriker.runs}</span>
                    <span className="text-gray-600 text-xs ml-1">({snap.nonStriker.balls})</span>
                  </div>
                </div>
                {ns && (
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0"
                          style={{ color: "#9ca3af", borderColor: "rgba(156,163,175,0.2)", background: "rgba(156,163,175,0.05)" }}>
                      {roleLabel(ns.role)}
                    </span>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="w-14 h-1.5 bg-gray-800 rounded-full overflow-hidden shrink-0">
                        <div className={`h-full rounded-full ${confBar(ns.confidence)}`}
                             style={{ width: `${ns.confidence}%` }} />
                      </div>
                      <span className="text-[9px] text-gray-600 shrink-0">{batsmanStatus(ns.balls)}</span>
                      {ns.balls > 0 && (
                        <span className="text-[9px] text-gray-500 ml-auto shrink-0">
                          SR <span className="text-gray-300 font-semibold">{sr}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Match over card ── */}
          {snap?.isMatchOver && (
            <div className="shrink-0 rounded-2xl p-6 text-center space-y-3"
                 style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <p className="text-emerald-400 text-xs uppercase tracking-widest font-semibold">Match Over</p>
              <p className="text-white font-bold text-xl">{snap.matchResult}</p>
              <button onClick={() => dispatch({ type: "GO_TO_MAIN_MENU" })}
                      className="mt-2 px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all active:scale-[0.97]"
                      style={{ background: "rgba(255,255,255,0.1)", color: "#f4f4f5" }}>
                Back to Menu
              </button>
            </div>
          )}

          {/* ── Waiting / no snap ── */}
          {!snap && (
            <div className="flex items-center justify-center gap-2 py-12">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-xs text-gray-500">Waiting for match to start…</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Fixed bottom bar: timer + submit ── */}
      {canInput && (
        <div className="shrink-0 flex items-center gap-3 px-4 py-3"
             style={{ background: "rgba(0,0,0,0.75)", borderTop: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
          <CountdownRing seconds={timerSecs} total={BALL_TIMER_SECS} />
          <div className="flex-1">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
              {guestBatting
                ? `Batting intent · ${rpoToIntent(rpo)}`
                : `Bowling · ${bowlLine} / ${bowlLength}`}
            </p>
            <button onClick={submitInput} disabled={submitted}
                    className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all active:scale-[0.97]"
                    style={submitted
                      ? { background: "rgba(255,255,255,0.05)", color: "#4b5563" }
                      : { background: "#f4f4f5", color: "#09090b" }}>
              {submitted ? "Waiting for result…" : guestBatting ? "Play →" : "Bowl →"}
            </button>
          </div>
        </div>
      )}

      {/* Waiting indicator */}
      {!canInput && !needBowler && !needBatsman && snap && !snap.isMatchOver && (
        <div className="shrink-0 flex items-center justify-center gap-2 py-3 border-t"
             style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-700 animate-pulse" />
          <p className="text-[11px] text-gray-600">Waiting for host…</p>
        </div>
      )}
    </div>
  );
}
