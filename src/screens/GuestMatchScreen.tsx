import { useEffect, useRef, useState } from "react";
import { useGame } from "../state/gameContext";
import { useMultiplayer } from "../multiplayer/MultiplayerContext";
import { HostMsg, LobbyMsg, MatchSnapshot, OverSummaryData } from "../multiplayer/types";
import { BattingIntent, BowlerLine } from "../types/enums";

const BALL_TIMER_SECS = 6;

function rpoToIntent(rpo: number): BattingIntent {
  if (rpo < 6.5) return BattingIntent.Defensive;
  if (rpo < 9.0) return BattingIntent.Balanced;
  return BattingIntent.Aggressive;
}

const LINE_LABELS: Record<BowlerLine, string> = {
  [BowlerLine.OutsideOff]: "Outside Off",
  [BowlerLine.OnStumps]:   "On Stumps",
  [BowlerLine.OnPads]:     "On Pads",
  [BowlerLine.Short]:      "Short",
  [BowlerLine.Full]:       "Full / Yorker",
};

function ballBadgeStyle(outcome: string) {
  if (outcome === "W") return "bg-red-600 text-white";
  if (outcome === "6") return "bg-yellow-400 text-black";
  if (outcome === "4") return "bg-blue-600 text-white";
  if (outcome === ".")  return "bg-gray-700 text-gray-300";
  return "bg-emerald-700 text-white";
}

// ── Countdown ring ─────────────────────────────────────────────────────────────
function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 20, circ = 2 * Math.PI * r;
  const pct = seconds / total;
  const color = seconds > 3 ? "#10b981" : "#ef4444";
  return (
    <svg width={52} height={52} className="shrink-0">
      <circle cx={26} cy={26} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
      <circle cx={26} cy={26} r={r} fill="none" stroke={color} strokeWidth={4}
              strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round"
              transform="rotate(-90 26 26)" style={{ transition: "stroke-dasharray 0.9s linear" }} />
      <text x={26} y={31} textAnchor="middle" fontSize={14} fontWeight="bold" fill={color}>{seconds}</text>
    </svg>
  );
}

export function GuestMatchScreen() {
  const { dispatch }  = useGame();
  const mp            = useMultiplayer();

  const [snap, setSnap]             = useState<MatchSnapshot | null>(null);
  const [hostReady, setHostReady]   = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [rpo, setRpo]               = useState(7.5);
  const [line, setLine]             = useState<BowlerLine>(BowlerLine.OnStumps);

  // Over-modal
  const [overModal, setOverModal]   = useState<OverSummaryData | null>(null);
  const prevTotalOvers              = useRef(-1);

  // Celebration
  const [celebration, setCelebration] = useState<{ type: "six" | "wicket"; text: string } | null>(null);
  const celebTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bowler / batsman picks
  const [needBowler, setNeedBowler] = useState(false);
  const [needBatsman, setNeedBatsman] = useState(false);
  const [eligBowlers, setEligBowlers] = useState<{ id: string; name: string; overs: number; runs: number }[]>([]);
  const [remBatsmen,  setRemBatsmen]  = useState<{ id: string; name: string }[]>([]);

  // 6-second timer
  const [timerSecs, setTimerSecs]   = useState(BALL_TIMER_SECS);
  const timerRef                    = useRef<ReturnType<typeof setInterval> | null>(null);

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
    mp.sendMessage({
      t: "GUEST_BALL_INPUT",
      intent: rpoToIntent(rpo),
      line,
    });
    setSubmitted(true);
    setHostReady(false);
  }

  function showCelebration(type: "six" | "wicket", text: string) {
    if (celebTimer.current) clearTimeout(celebTimer.current);
    setCelebration({ type, text });
    celebTimer.current = setTimeout(() => setCelebration(null), 1800);
  }

  // ── Message listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = mp.onMessage((raw) => {
      // Ignore lobby messages that may still be arriving
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
        setSnap(s);
        setHostReady(false);
        setSubmitted(false);

        // Celebration
        if (s.lastOutcome === "W") showCelebration("wicket", s.lastBatsmanName ? `${s.lastBatsmanName} OUT!` : "WICKET!");
        else if (s.lastOutcome === "6") showCelebration("six", s.lastBowlerName ? `off ${s.lastBowlerName}` : "SIX!");

        // Over modal
        if (s.overJustCompleted && s.totalOvers !== prevTotalOvers.current) {
          prevTotalOvers.current = s.totalOvers;
          setOverModal(s.overJustCompleted);
        }

        // Pending picks
        setNeedBowler(s.needsGuestBowler);
        setNeedBatsman(s.needsGuestNextBatsman);
        if (s.needsGuestBowler)   setEligBowlers(s.guestEligibleBowlers);
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
      line:   guestBatting ? undefined : line,
    });
    setSubmitted(true);
    setHostReady(false);
  };

  const pickBowler  = (id: string) => { mp.sendMessage({ t: "GUEST_BOWLER",       bowlerId: id }); setNeedBowler(false); };
  const pickBatsman = (id: string) => { mp.sendMessage({ t: "GUEST_NEXT_BATSMAN", batsmanId: id }); setNeedBatsman(false); };

  const guestBatting = snap ? !snap.hostBatting : false;
  const needsInput   = hostReady && !needBowler && !needBatsman && !snap?.isMatchOver;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen text-white overflow-hidden"
         style={{ background: "linear-gradient(135deg,#0a0f1e 0%,#0d1117 50%,#0a1628 100%)" }}>

      {/* ── Celebration overlay ── */}
      {celebration && (
        <div style={{ position:"fixed", inset:0, zIndex:70, display:"flex", alignItems:"center",
                      justifyContent:"center", pointerEvents:"none", animation:"celebFade 1.8s ease forwards" }}>
          <div style={{
            position:"absolute", inset:0,
            background: celebration.type === "six"
              ? "radial-gradient(ellipse at center,rgba(234,179,8,0.45) 0%,rgba(234,179,8,0) 65%)"
              : "radial-gradient(ellipse at center,rgba(239,68,68,0.5) 0%,rgba(239,68,68,0) 65%)",
          }} />
          <div className="relative text-center px-10 py-8 rounded-3xl space-y-2" style={{
            background: celebration.type === "six" ? "rgba(30,25,0,0.75)" : "rgba(30,0,0,0.75)",
            border: celebration.type === "six" ? "2px solid rgba(234,179,8,0.6)" : "2px solid rgba(239,68,68,0.6)",
            backdropFilter:"blur(8px)",
          }}>
            <p className="text-5xl font-black" style={{ color: celebration.type === "six" ? "#facc15" : "#f87171" }}>
              {celebration.type === "six" ? "SIX!" : "WICKET!"}
            </p>
            <p className="text-sm font-semibold" style={{ color: celebration.type === "six" ? "#fde68a" : "#fca5a5" }}>
              {celebration.text}
            </p>
          </div>
        </div>
      )}

      {/* ── Over modal ── */}
      {overModal && (
        <div style={{ position:"fixed", inset:0, zIndex:60, display:"flex", alignItems:"center",
                      justifyContent:"center", background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)" }}>
          <div className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden shadow-2xl" style={{ background:"#0d1b12", border:"1px solid rgba(16,185,129,0.3)" }}>
            <div className="flex items-center justify-between px-5 py-3" style={{ background:"rgba(16,185,129,0.12)", borderBottom:"1px solid rgba(16,185,129,0.2)" }}>
              <div>
                <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">End of Over {overModal.over}</p>
                <p className="text-base font-bold text-white mt-0.5">{overModal.runs} runs · {overModal.wickets} wkt{overModal.wickets !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setOverModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 text-lg font-bold">×</button>
            </div>
            <div className="px-5 py-2.5" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-sm font-semibold text-white">{overModal.bowlerName}</p>
            </div>
            <div className="px-5 py-3 space-y-1.5 max-h-52 overflow-y-auto">
              {overModal.balls.map((b, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${ballBadgeStyle(b.outcome)}`}>
                    {b.outcome}
                  </span>
                  <p className="text-[11px] text-gray-400 leading-tight pt-0.5 flex-1">{b.commentary}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-3" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
              <button onClick={() => setOverModal(null)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.97]"
                      style={{ background:"rgba(16,185,129,0.15)", color:"#34d399", border:"1px solid rgba(16,185,129,0.3)" }}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status bar ── */}
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs shrink-0"
           style={{ background:"rgba(99,102,241,0.1)", borderBottom:"1px solid rgba(99,102,241,0.15)" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        <span className="text-indigo-400 font-semibold">GUEST</span>
        <span className="text-gray-600 mx-1">·</span>
        <span className="text-gray-500">vs {snap?.hostTeamName ?? "Host"}</span>
        <span className="ml-auto text-gray-600 font-mono">{mp.roomCode}</span>
      </div>

      {/* ── Score header ── */}
      {snap && (
        <div className="shrink-0 flex flex-col items-center px-4 py-3 gap-0.5"
             style={{ background:"rgba(0,0,0,0.45)", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            <span className="text-base font-extrabold text-white truncate max-w-[110px] text-right">
              {snap.hostBatting ? snap.hostTeamName : snap.guestTeamName}
            </span>
            <span className="text-xs text-gray-500">vs</span>
            <span className="text-base font-extrabold text-gray-400 truncate max-w-[110px]">
              {snap.hostBatting ? snap.guestTeamName : snap.hostTeamName}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xl font-black tabular-nums text-emerald-300">{snap.runs}/{snap.wickets}</span>
            <span className="text-xs text-gray-500">({snap.overs} ov)</span>
            {snap.target && (
              <span className="text-xs font-bold text-amber-400">· Need {snap.target - snap.runs} off {30 - snap.totalBalls} balls</span>
            )}
          </div>
          {/* Ball tracker */}
          {snap.currentOverBalls.length > 0 && (
            <div className="flex gap-1 mt-1">
              {snap.currentOverBalls.slice(-6).map((b, i) => (
                <span key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${ballBadgeStyle(b.outcome)}`}>
                  {b.outcome}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

        {/* Batsmen */}
        {snap && (snap.striker || snap.nonStriker) && (
          <div className="rounded-xl p-3 space-y-1.5"
               style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
            {snap.striker && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-400 font-bold w-3">*</span>
                <span className="flex-1 text-white font-semibold">{snap.striker.name}</span>
                <span className="tabular-nums font-bold text-white">{snap.striker.runs}</span>
                <span className="text-gray-500">({snap.striker.balls})</span>
              </div>
            )}
            {snap.nonStriker && (
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3" />
                <span className="flex-1 text-gray-400">{snap.nonStriker.name}</span>
                <span className="tabular-nums text-gray-300">{snap.nonStriker.runs}</span>
                <span className="text-gray-500">({snap.nonStriker.balls})</span>
              </div>
            )}
            {snap.bowler && (
              <div className="flex items-center gap-1.5 text-xs pt-1.5 border-t border-white/5">
                <span className="text-gray-500 shrink-0">Bowling:</span>
                <span className="flex-1 text-gray-300 truncate">{snap.bowler.name}</span>
                <span className="text-gray-400">{snap.bowler.overs}</span>
                <span className="text-red-400">{snap.bowler.runs}r</span>
                <span className="text-emerald-400">{snap.bowler.wickets}w</span>
              </div>
            )}
          </div>
        )}

        {/* Match over */}
        {snap?.isMatchOver && (
          <div className="rounded-2xl p-6 text-center space-y-3"
               style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)" }}>
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-semibold">Match Over</p>
            <p className="text-white font-bold text-xl">{snap.matchResult}</p>
            <button onClick={() => dispatch({ type: "GO_TO_MAIN_MENU" })}
                    className="mt-2 px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all active:scale-[0.97]"
                    style={{ background:"rgba(255,255,255,0.1)", color:"#f4f4f5" }}>
              Back to Menu
            </button>
          </div>
        )}

        {/* Bowler picker */}
        {needBowler && (
          <div className="rounded-2xl p-4 space-y-3"
               style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Pick Your Bowler</p>
            {eligBowlers.map(b => (
              <button key={b.id} onClick={() => pickBowler(b.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all active:scale-[0.98]"
                      style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.25)" }}>
                <span className="flex-1 text-left text-white font-semibold">{b.name}</span>
                <span className="text-gray-400 text-xs">{b.overs} ov · {b.runs} runs</span>
              </button>
            ))}
          </div>
        )}

        {/* Next batsman picker */}
        {needBatsman && (
          <div className="rounded-2xl p-4 space-y-3"
               style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Send In Next Batsman</p>
            {remBatsmen.map(b => (
              <button key={b.id} onClick={() => pickBatsman(b.id)}
                      className="w-full flex items-center px-4 py-3 rounded-xl text-sm transition-all active:scale-[0.98]"
                      style={{ background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)" }}>
                <span className="flex-1 text-left text-white font-semibold">{b.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Commentary */}
        {snap && snap.recentCommentary.length > 0 && (
          <div className="rounded-xl p-3 space-y-1.5"
               style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
            {snap.recentCommentary.slice(-5).reverse().map((c, i) => (
              <p key={i} className={`text-xs leading-relaxed ${i === 0 ? "text-gray-300" : "text-gray-600"}`}>{c}</p>
            ))}
          </div>
        )}

        {!snap && !hostReady && (
          <div className="flex items-center justify-center gap-2 py-12">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-xs text-gray-500">Waiting for match to start…</p>
          </div>
        )}
      </div>

      {/* ── Fixed input panel at bottom ── */}
      {needsInput && (
        <div className="shrink-0 px-4 pb-4 pt-3 space-y-3"
             style={{ background:"rgba(0,0,0,0.6)", borderTop:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(8px)" }}>

          {/* Timer + label */}
          <div className="flex items-center gap-3">
            <CountdownRing seconds={timerSecs} total={BALL_TIMER_SECS} />
            <div className="flex-1">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                {guestBatting ? "Set Batting Intent" : "Choose Bowling Line"}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {guestBatting
                  ? `${rpo.toFixed(1)} RPO — ${rpoToIntent(rpo)}`
                  : LINE_LABELS[line]}
              </p>
            </div>
          </div>

          {/* Batting: RPO slider */}
          {guestBatting && (
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-gray-600">
                <span>Defensive (4)</span>
                <span>Aggressive (12)</span>
              </div>
              <input type="range" min={4} max={12} step={0.5} value={rpo}
                     onChange={e => setRpo(parseFloat(e.target.value))}
                     className="w-full accent-emerald-500" />
              <div className="flex justify-between text-[9px]">
                <span style={{ color: rpo < 6.5 ? "#3b82f6" : "transparent" }}>CAREFUL</span>
                <span style={{ color: rpo >= 6.5 && rpo < 9 ? "#22c55e" : "transparent" }}>BALANCED</span>
                <span style={{ color: rpo >= 9 ? "#ef4444" : "transparent" }}>ATTACK</span>
              </div>
            </div>
          )}

          {/* Bowling: line buttons */}
          {!guestBatting && (
            <div className="grid grid-cols-3 gap-2">
              {(Object.values(BowlerLine) as BowlerLine[]).map(l => (
                <button key={l} onClick={() => setLine(l)}
                        className="py-2.5 rounded-xl text-[11px] font-semibold transition-all active:scale-[0.97]"
                        style={line === l
                          ? { background:"rgba(16,185,129,0.25)", color:"#34d399", border:"1px solid rgba(16,185,129,0.5)" }
                          : { background:"rgba(255,255,255,0.04)", color:"#6b7280", border:"1px solid rgba(255,255,255,0.08)" }}>
                  {LINE_LABELS[l]}
                </button>
              ))}
            </div>
          )}

          {/* Submit */}
          <button onClick={submitInput} disabled={submitted}
                  className="w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all active:scale-[0.97]"
                  style={submitted
                    ? { background:"rgba(255,255,255,0.05)", color:"#4b5563" }
                    : { background:"#f4f4f5", color:"#09090b" }}>
            {submitted ? "Waiting for result…" : guestBatting ? "Play →" : "Bowl →"}
          </button>
        </div>
      )}

      {/* Waiting indicator */}
      {!needsInput && !needBowler && !needBatsman && snap && !snap.isMatchOver && (
        <div className="shrink-0 flex items-center justify-center gap-2 py-3 border-t"
             style={{ borderColor:"rgba(255,255,255,0.06)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-700 animate-pulse" />
          <p className="text-[11px] text-gray-600">Waiting for host…</p>
        </div>
      )}
    </div>
  );
}
