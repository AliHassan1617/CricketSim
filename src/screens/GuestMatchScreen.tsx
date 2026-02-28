import { useEffect, useRef, useState } from "react";
import { useGame } from "../state/gameContext";
import { useMultiplayer } from "../multiplayer/MultiplayerContext";
import { HostMsg, MatchSnapshot } from "../multiplayer/types";
import { BattingIntent, BowlerLine } from "../types/enums";
import { playerDb } from "../data/playerDb";

// ── Helpers ───────────────────────────────────────────────────────────────────

const LINE_LABELS: Record<BowlerLine, string> = {
  [BowlerLine.OutsideOff]: "Outside Off",
  [BowlerLine.OnStumps]:   "On Stumps",
  [BowlerLine.OnPads]:     "On Pads",
  [BowlerLine.Short]:      "Short",
  [BowlerLine.Full]:       "Full",
};

function rpoToIntent(rpo: number): BattingIntent {
  if (rpo < 6.5) return BattingIntent.Defensive;
  if (rpo < 9.0) return BattingIntent.Balanced;
  return BattingIntent.Aggressive;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GuestMatchScreen() {
  const { dispatch }  = useGame();
  const mp            = useMultiplayer();

  const [snapshot, setSnapshot]     = useState<MatchSnapshot | null>(null);
  const [hostReady, setHostReady]   = useState(false);    // HOST_BALL_READY received
  const [submitted, setSubmitted]   = useState(false);    // waiting for BALL_RESULT
  const [rpo, setRpo]               = useState(7.5);
  const [line, setLine]             = useState<BowlerLine>(BowlerLine.OnStumps);
  const [statusText, setStatusText] = useState("Waiting for host to set up the match…");
  const [matchConfig, setMatchConfig] = useState<{ guestTeamId: string; format: string; stadiumName: string } | null>(null);

  // Need bowler/batsman picks
  const [needBowler, setNeedBowler]   = useState(false);
  const [needBatsman, setNeedBatsman] = useState(false);
  const [eligBowlers, setEligBowlers] = useState<{ id: string; name: string; overs: number; runs: number }[]>([]);
  const [remBatsmen, setRemBatsmen]   = useState<{ id: string; name: string }[]>([]);

  const guestXIRef = useRef<string[]>([]);

  useEffect(() => {
    const unsub = mp.onMessage((raw) => {
      const msg = raw as HostMsg;

      if (msg.t === "MATCH_CONFIG") {
        guestXIRef.current = msg.guestXI;
        setMatchConfig({ guestTeamId: msg.guestTeamId, format: msg.format, stadiumName: msg.stadiumName });
        setStatusText(`Match: ${msg.format} at ${msg.stadiumName} — waiting for toss…`);
      }

      if (msg.t === "TOSS") {
        const batting = msg.hostBatsFirst ? "Host" : "You";
        setStatusText(`Toss: ${batting} batting first. Match starting…`);
      }

      if (msg.t === "HOST_BALL_READY") {
        setHostReady(true);
        setSubmitted(false);
        setStatusText("Your turn — submit your move.");
      }

      if (msg.t === "BALL_RESULT") {
        setSnapshot(msg.snapshot);
        setHostReady(false);
        setSubmitted(false);
        setNeedBowler(msg.snapshot.needsGuestBowler);
        setNeedBatsman(msg.snapshot.needsGuestNextBatsman);
        if (msg.snapshot.needsGuestBowler) {
          setEligBowlers(msg.snapshot.guestEligibleBowlers);
          setStatusText("Pick your next bowler.");
        } else if (msg.snapshot.needsGuestNextBatsman) {
          setRemBatsmen(msg.snapshot.guestRemainingBatsmen);
          setStatusText("Pick your next batsman.");
        } else {
          setStatusText("Waiting for host…");
        }
      }

      if (msg.t === "NEED_GUEST_BOWLER") {
        setNeedBowler(true);
        setEligBowlers(msg.eligible);
        setStatusText("Pick your next bowler.");
      }

      if (msg.t === "NEED_GUEST_NEXT_BATSMAN") {
        setNeedBatsman(true);
        setRemBatsmen(msg.remaining);
        setStatusText("Pick your next batsman.");
      }

      if (msg.t === "MATCH_OVER") {
        setSnapshot(msg.snapshot);
        setHostReady(false);
        setSubmitted(false);
        setStatusText(msg.snapshot.matchResult ?? "Match over!");
      }
    });
    return unsub;
  }, [mp]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const submitBallInput = () => {
    if (!hostReady || submitted) return;
    const guestBatting = snapshot ? !snapshot.hostBatting : false;
    mp.sendMessage({
      t: "GUEST_BALL_INPUT",
      intent: guestBatting ? rpoToIntent(rpo) : undefined,
      line:   guestBatting ? undefined : line,
    });
    setSubmitted(true);
    setHostReady(false);
    setStatusText("Waiting for result…");
  };

  const pickBowler = (id: string) => {
    mp.sendMessage({ t: "GUEST_BOWLER", bowlerId: id });
    setNeedBowler(false);
    setStatusText("Waiting for host…");
  };

  const pickBatsman = (id: string) => {
    mp.sendMessage({ t: "GUEST_NEXT_BATSMAN", batsmanId: id });
    setNeedBatsman(false);
    setStatusText("Waiting for host…");
  };

  const guestBatting = snapshot ? !snapshot.hostBatting : false;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen text-white flex flex-col"
      style={{ background: "linear-gradient(160deg, #050e18 0%, #0a0a0a 50%, #050e18 100%)" }}
    >
      {/* Status bar */}
      <div
        className="flex items-center gap-2 px-4 py-2 text-xs"
        style={{ background: "rgba(99,102,241,0.12)", borderBottom: "1px solid rgba(99,102,241,0.2)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shrink-0" />
        <span className="text-indigo-300">{statusText}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-lg mx-auto w-full">

        {/* Scorecard */}
        {snapshot && (
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Teams + innings */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="uppercase tracking-wider">
                Innings {snapshot.inningsNum} — {snapshot.hostBatting ? snapshot.hostTeamName : snapshot.guestTeamName} batting
              </span>
              {snapshot.target && (
                <span className="text-amber-400 font-semibold">Target: {snapshot.target}</span>
              )}
            </div>

            {/* Score */}
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black tabular-nums">
                {snapshot.runs}/{snapshot.wickets}
              </span>
              <span className="text-gray-400 text-sm mb-1">({snapshot.overs} ov)</span>
            </div>

            {/* Batsmen */}
            {(snapshot.striker || snapshot.nonStriker) && (
              <div className="space-y-1 pt-1 border-t border-white/5">
                {snapshot.striker && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white font-semibold w-4">*</span>
                    <span className="flex-1 text-gray-300">{snapshot.striker.name}</span>
                    <span className="tabular-nums text-white font-bold">{snapshot.striker.runs}</span>
                    <span className="text-gray-600">({snapshot.striker.balls})</span>
                  </div>
                )}
                {snapshot.nonStriker && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-4" />
                    <span className="flex-1 text-gray-400">{snapshot.nonStriker.name}</span>
                    <span className="tabular-nums text-gray-300">{snapshot.nonStriker.runs}</span>
                    <span className="text-gray-600">({snapshot.nonStriker.balls})</span>
                  </div>
                )}
              </div>
            )}

            {/* Bowler */}
            {snapshot.bowler && (
              <div className="flex items-center gap-2 text-xs pt-1 border-t border-white/5">
                <span className="text-gray-500">Bowling:</span>
                <span className="text-gray-300 flex-1">{snapshot.bowler.name}</span>
                <span className="text-gray-400">{snapshot.bowler.overs} ov</span>
                <span className="text-red-400">{snapshot.bowler.runs} runs</span>
                <span className="text-emerald-400">{snapshot.bowler.wickets}w</span>
              </div>
            )}
          </div>
        )}

        {/* Commentary */}
        {snapshot && snapshot.recentCommentary.length > 0 && (
          <div
            className="rounded-2xl p-4 space-y-2"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {snapshot.recentCommentary.slice(-5).reverse().map((c, i) => (
              <p key={i} className={`text-xs leading-relaxed ${i === 0 ? "text-gray-300" : "text-gray-600"}`}>
                {c}
              </p>
            ))}
          </div>
        )}

        {/* Match over result */}
        {snapshot?.isMatchOver && (
          <div
            className="rounded-2xl p-6 text-center space-y-2"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
          >
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-semibold">Match Over</p>
            <p className="text-white font-bold text-lg">{snapshot.matchResult}</p>
            <button
              onClick={() => dispatch({ type: "GO_TO_MAIN_MENU" })}
              className="mt-3 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              style={{ background: "rgba(255,255,255,0.08)", color: "#f4f4f5" }}
            >
              Back to Menu
            </button>
          </div>
        )}

        {/* Bowler picker */}
        {needBowler && (
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Pick Your Bowler</p>
            <div className="space-y-2">
              {eligBowlers.map(b => (
                <button
                  key={b.id}
                  onClick={() => pickBowler(b.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all active:scale-[0.98]"
                  style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)" }}
                >
                  <span className="flex-1 text-left text-white font-semibold">{b.name}</span>
                  <span className="text-gray-400 text-xs">{b.overs} ov · {b.runs} runs</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Next batsman picker */}
        {needBatsman && (
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Send In Next Batsman</p>
            <div className="space-y-2">
              {remBatsmen.map(b => (
                <button
                  key={b.id}
                  onClick={() => pickBatsman(b.id)}
                  className="w-full flex items-center px-4 py-3 rounded-xl text-sm transition-all active:scale-[0.98]"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}
                >
                  <span className="flex-1 text-left text-white font-semibold">{b.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ball input — only when HOST_BALL_READY and no pending picks */}
        {hostReady && !needBowler && !needBatsman && !snapshot?.isMatchOver && (
          <div
            className="rounded-2xl p-4 space-y-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold text-center">
              {guestBatting ? "Set Your Batting Intent" : "Choose Bowling Line"}
            </p>

            {/* Batting: RPO slider */}
            {guestBatting && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Defensive</span>
                  <span className="text-white font-bold text-sm">{rpo.toFixed(1)} RPO</span>
                  <span className="text-gray-500">Aggressive</span>
                </div>
                <input
                  type="range" min={4} max={12} step={0.5}
                  value={rpo}
                  onChange={e => setRpo(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <p className="text-center text-xs text-gray-500">
                  Intent: <span className="text-white font-semibold capitalize">{rpoToIntent(rpo)}</span>
                </p>
              </div>
            )}

            {/* Bowling: line buttons */}
            {!guestBatting && (
              <div className="grid grid-cols-3 gap-2">
                {(Object.values(BowlerLine) as BowlerLine[]).map(l => (
                  <button
                    key={l}
                    onClick={() => setLine(l)}
                    className="py-2 rounded-lg text-[11px] font-semibold transition-all"
                    style={line === l
                      ? { background: "rgba(99,102,241,0.3)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.6)" }
                      : { background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.08)" }
                    }
                  >
                    {LINE_LABELS[l]}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={submitBallInput}
              disabled={submitted}
              className="w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all active:scale-[0.97]"
              style={submitted
                ? { background: "rgba(255,255,255,0.05)", color: "#4b5563" }
                : { background: "#f4f4f5", color: "#09090b" }
              }
            >
              {submitted ? "Submitted…" : guestBatting ? "Play →" : "Bowl →"}
            </button>
          </div>
        )}

        {/* Waiting indicator (no active input needed) */}
        {!hostReady && !needBowler && !needBatsman && !snapshot?.isMatchOver && (
          <div className="flex items-center justify-center gap-2 py-4">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-pulse" />
            <p className="text-xs text-gray-600">Waiting for host…</p>
          </div>
        )}

      </div>
    </div>
  );
}
