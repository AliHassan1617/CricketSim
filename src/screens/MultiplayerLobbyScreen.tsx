import { useEffect, useRef, useState } from "react";
import { useGame } from "../state/gameContext";
import { useMultiplayer } from "../multiplayer/MultiplayerContext";
import { LobbyMsg, MPMsg } from "../multiplayer/types";
import { getAllTeams, getTeam } from "../data/teamDb";
import { Team, Player } from "../types/player";
import { STADIUMS } from "../data/stadiums";
import { MatchFormat } from "../types/enums";

const TEAMS = getAllTeams();
const LOBBY_TIMER_SECS = 30;

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(active: boolean, seconds: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (!active) { setRemaining(seconds); expiredRef.current = false; return; }
    expiredRef.current = false;
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!expiredRef.current) { expiredRef.current = true; onExpire(); }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active]);

  return remaining;
}

// ─── Team card (compact) ─────────────────────────────────────────────────────
function MiniTeamCard({ team, pending }: { team: Team | null; pending?: boolean }) {
  if (!team) return (
    <div className="rounded-xl h-24 flex items-center justify-center border"
         style={{ border: "1px dashed rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
      <span className="text-gray-600 text-xs">{pending ? "Waiting…" : "—"}</span>
    </div>
  );
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${team.color}44` }}>
      <div className="px-3 py-2 flex items-center gap-2"
           style={{ background: `linear-gradient(90deg,${team.color}44,${team.color}11)` }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
             style={{ background: team.color, color: "#fff" }}>
          {team.shortName}
        </div>
        <div>
          <p className="text-xs font-bold text-white truncate">{team.name}</p>
          <p className="text-[9px] text-gray-400">{team.players.length} players</p>
        </div>
      </div>
    </div>
  );
}

// ─── Player tile (squad selection) ──────────────────────────────────────────
function PlayerTile({ player, selected, onToggle }: {
  player: Player; selected: boolean; onToggle: () => void;
}) {
  const roleColor = {
    batsman: "#3b82f6",
    "wicket-keeper": "#a78bfa",
    "all-rounder": "#f59e0b",
    bowler: "#ef4444",
  }[player.role] ?? "#6b7280";

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all active:scale-[0.97]"
      style={selected
        ? { background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)" }
        : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
      }
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-black shrink-0"
        style={{ background: selected ? "#10b981" : roleColor + "33", color: selected ? "#fff" : roleColor }}
      >
        {selected ? "✓" : player.role === "wicket-keeper" ? "WK" : player.role === "all-rounder" ? "AR" : player.role === "bowler" ? "B" : "BT"}
      </div>
      <span className="flex-1 text-xs font-semibold text-white truncate">{player.shortName}</span>
      <span className="text-[9px] shrink-0" style={{ color: roleColor }}>
        {player.role === "wicket-keeper" ? "WK" : player.role === "all-rounder" ? "AR" : player.role === "bowler" ? "BWL" : "BAT"}
      </span>
    </button>
  );
}

type Phase = "choose" | "hosting" | "joining" | "team-pick" | "squad-pick" | "waiting";

// ─── Main component ───────────────────────────────────────────────────────────
export function MultiplayerLobbyScreen() {
  const { dispatch } = useGame();
  const { createRoom, joinRoom, roomCode, connected, onMessage, sendMessage, disconnect } = useMultiplayer();

  const [phase, setPhase] = useState<Phase>("choose");
  const [joinCode, setCode] = useState("");
  const [error, setError]   = useState("");
  const isHost = useRef(false);

  // Team-pick state
  const [myTeamIdx,   setMyTeamIdx]   = useState(0);
  const [oppTeamIdx,  setOppTeamIdx]  = useState<number | null>(null);
  const [myTeamLocked,  setMyTeamLocked]  = useState(false);
  const [oppTeamLocked, setOppTeamLocked] = useState(false);
  const myTeamLockedRef  = useRef(false);
  const oppTeamLockedRef = useRef(false);

  // Squad-pick state
  const [myXI, setMyXI]             = useState<string[]>([]);
  const [myXILocked, setMyXILocked] = useState(false);
  const [oppXILocked, setOppXILocked] = useState(false);
  const guestXIRef = useRef<string[]>([]);
  const guestTeamIdRef = useRef<string>("");

  const hasNavigated = useRef(false);

  // ── Timers ─────────────────────────────────────────────────────────────────
  const teamPickActive  = phase === "team-pick"  && !myTeamLocked;
  const squadPickActive = phase === "squad-pick" && !myXILocked;

  const teamTimeLeft  = useCountdown(teamPickActive,  LOBBY_TIMER_SECS, () => {
    // Auto-lock on timer expiry
    if (!myTeamLockedRef.current) lockTeam();
  });
  const squadTimeLeft = useCountdown(squadPickActive, LOBBY_TIMER_SECS, () => {
    if (!myXILocked) lockXI();
  });

  // ── Connect handling ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!connected || hasNavigated.current) return;
    hasNavigated.current = true;
    // Both move into team-pick phase. Pick opposite starting teams.
    if (isHost.current) {
      setMyTeamIdx(0);
      setOppTeamIdx(1);  // default until guest updates
    } else {
      setMyTeamIdx(1);
      setOppTeamIdx(0);  // default until host updates
    }
    setPhase("team-pick");
    // Announce initial team to opponent
    setTimeout(() => {
      sendMessage({ t: "LOBBY_TEAM_UPDATE", teamId: TEAMS[isHost.current ? 0 : 1].id } as MPMsg);
    }, 300);
  }, [connected]);

  // ── Message handler ────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onMessage((raw) => {
      const msg = raw as LobbyMsg;

      if (msg.t === "LOBBY_TEAM_UPDATE") {
        const idx = TEAMS.findIndex(t => t.id === msg.teamId);
        if (idx >= 0) setOppTeamIdx(idx);
      }

      if (msg.t === "LOBBY_TEAM_LOCK") {
        const idx = TEAMS.findIndex(t => t.id === msg.teamId);
        if (idx >= 0) setOppTeamIdx(idx);
        setOppTeamLocked(true);
        oppTeamLockedRef.current = true;
        if (isHost.current) { guestTeamIdRef.current = msg.teamId; }
        // If both locked → squad-pick
        if (myTeamLockedRef.current) {
          setPhase("squad-pick");
          setMyXI([]);
        }
      }

      if (msg.t === "LOBBY_XI_LOCK") {
        setOppXILocked(true);
        if (isHost.current) {
          guestXIRef.current = msg.xi;
          // If host already locked → start match
          if (myXILocked) startMatch(msg.xi);
        } else {
          // Guest: wait for LOBBY_READY from host
        }
      }

      if (msg.t === "LOBBY_READY") {
        // Guest: start match
        dispatch({ type: "GO_TO_MULTIPLAYER_GUEST" });
      }
    });
    return unsub;
  }, [onMessage, myXILocked]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleCreate = () => {
    isHost.current = true;
    setPhase("hosting");
    createRoom();
  };

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) { setError("Enter the 6-character room code."); return; }
    setError("");
    isHost.current = false;
    setPhase("joining");
    joinRoom(code);
  };

  const handleBack = () => {
    disconnect();
    dispatch({ type: "GO_TO_MAIN_MENU" });
  };

  function lockTeam() {
    if (myTeamLockedRef.current) return;
    myTeamLockedRef.current = true;
    setMyTeamLocked(true);
    const teamId = TEAMS[myTeamIdx].id;
    sendMessage({ t: "LOBBY_TEAM_LOCK", teamId } as MPMsg);
    if (isHost.current) { /* host team is myTeamIdx */ }
    else { guestTeamIdRef.current = teamId; }
    // If opponent already locked → move to squad-pick
    if (oppTeamLockedRef.current) {
      setPhase("squad-pick");
      setMyXI([]);
    }
  }

  function lockXI() {
    // Auto-fill to 11 if not enough selected
    let xi = [...myXI];
    const team = TEAMS[myTeamIdx];
    if (xi.length < 11) {
      const remaining = team.players.filter(p => !xi.includes(p.id));
      xi = [...xi, ...remaining.map(p => p.id)].slice(0, 11);
    }
    setMyXI(xi);
    setMyXILocked(true);
    sendMessage({ t: "LOBBY_XI_LOCK", xi } as MPMsg);

    if (isHost.current) {
      // If guest already locked → start
      if (guestXIRef.current.length > 0) {
        startMatch(guestXIRef.current);
      }
      // else wait for LOBBY_XI_LOCK from guest
    }
    // Guest: wait for LOBBY_READY
    setPhase("waiting");
  }

  function startMatch(guestXI: string[]) {
    // Host only: set up the full game state then go to toss
    const myTeam = TEAMS[myTeamIdx];
    const guestTeam = getTeam(guestTeamIdRef.current) ?? TEAMS[1];

    // Reorder guest team so their chosen XI are the first 11 players
    const xiSet = new Set(guestXI);
    const xiPlayers   = guestXI.map(id => guestTeam.players.find(p => p.id === id)!).filter(Boolean);
    const restPlayers = guestTeam.players.filter(p => !xiSet.has(p.id));
    const reorderedGuestTeam: Team = { ...guestTeam, players: [...xiPlayers, ...restPlayers] };

    dispatch({ type: "PICK_TEAM",       payload: { userTeam: myTeam, opponentTeam: reorderedGuestTeam } });
    dispatch({ type: "SET_SELECTED_XI", payload: { playerIds: myXI.length === 11 ? myXI : myTeam.players.slice(0, 11).map(p => p.id) } });
    dispatch({ type: "SET_FORMAT",      payload: { format: MatchFormat.T5 } });
    dispatch({ type: "SET_STADIUM",     payload: { stadium: STADIUMS[0] } });
    dispatch({ type: "UNLOCK_TACTICS" });
    dispatch({ type: "GO_TO_TOSS" });

    // Tell guest to start
    sendMessage({ t: "LOBBY_READY" } as MPMsg);
  }

  function togglePlayer(id: string) {
    setMyXI(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 11) return prev;
      return [...prev, id];
    });
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  const myTeam  = TEAMS[myTeamIdx];
  const oppTeam = oppTeamIdx !== null ? TEAMS[oppTeamIdx] : null;

  return (
    <div className="relative min-h-screen text-white flex flex-col items-center justify-center px-6 overflow-hidden">
      <img src="/alessandro-bogliari-oDs_AxeR5g4-unsplash.jpg" alt="" aria-hidden
           className="absolute inset-0 w-full h-full object-cover object-center" style={{ zIndex: 0 }} />
      <div className="absolute inset-0"
           style={{ zIndex: 1, background: "linear-gradient(to bottom, rgba(3,12,5,0.88) 0%, rgba(3,12,5,0.97) 100%)" }} />

      <div className="relative w-full max-w-sm space-y-6 py-8" style={{ zIndex: 2 }}>

        {/* ── Phase: choose ── */}
        {phase === "choose" && (
          <>
            <div className="text-center">
              <button onClick={handleBack} className="text-xs text-gray-500 hover:text-gray-300 transition-colors mb-6 block mx-auto">
                ‹ Back
              </button>
              <p className="text-[11px] text-gray-500 uppercase tracking-[0.4em] mb-1">Multiplayer</p>
              <h2 className="text-3xl font-black text-white">Online Match</h2>
              <p className="text-xs text-gray-600 mt-1">T5 · Both players pick their squad</p>
            </div>
            <div className="space-y-4">
              <button onClick={handleCreate}
                      className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.97]"
                      style={{ background: "#f4f4f5", color: "#09090b" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f5"; }}>
                Create Match
              </button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                <span className="text-xs text-gray-600">or</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              </div>
              <div className="space-y-2">
                <input value={joinCode} onChange={e => setCode(e.target.value.toUpperCase())}
                       placeholder="Enter room code" maxLength={8}
                       className="w-full px-4 py-3 rounded-xl text-sm text-center font-mono font-bold tracking-widest outline-none"
                       style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#f4f4f5" }} />
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                <button onClick={handleJoin}
                        className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.97]"
                        style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.35)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.25)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.15)"; }}>
                  Join Match
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Phase: hosting / joining (waiting for connection) ── */}
        {(phase === "hosting" || phase === "joining") && (
          <div className="text-center space-y-6">
            <button onClick={handleBack} className="text-xs text-gray-500 hover:text-gray-300 transition-colors block mx-auto">
              ‹ Back
            </button>
            <div className="rounded-2xl p-6 space-y-3"
                 style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs text-gray-500 uppercase tracking-widest">{phase === "hosting" ? "Room Code" : "Connecting to"}</p>
              <p className="text-5xl font-black tracking-[0.3em] text-white font-mono">
                {phase === "hosting" ? (roomCode ?? "…") : joinCode}
              </p>
              {phase === "hosting" && <p className="text-xs text-gray-600">Share this code with your opponent</p>}
            </div>
            {connected
              ? <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <p className="text-sm text-emerald-400 font-semibold">Connected! Picking teams…</p>
                </div>
              : <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <p className="text-sm text-gray-400">{phase === "hosting" ? "Waiting for opponent…" : "Connecting…"}</p>
                </div>
            }
          </div>
        )}

        {/* ── Phase: team-pick ── */}
        {phase === "team-pick" && (
          <>
            {/* Timer bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest">
                <span>Pick Your Team</span>
                <span className={teamTimeLeft <= 10 ? "text-red-400 font-bold" : ""}>{teamTimeLeft}s</span>
              </div>
              <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                     style={{ width: `${(teamTimeLeft / LOBBY_TIMER_SECS) * 100}%`,
                              background: teamTimeLeft > 10 ? "#10b981" : "#ef4444" }} />
              </div>
            </div>

            {/* Your team carousel */}
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Your Team</p>
              {myTeamLocked ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                     style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <span className="text-emerald-400 text-xs">✓ Locked in:</span>
                  <span className="text-white text-xs font-bold">{myTeam.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                            const next = (myTeamIdx - 1 + TEAMS.length) % TEAMS.length;
                            setMyTeamIdx(next);
                            sendMessage({ t: "LOBBY_TEAM_UPDATE", teamId: TEAMS[next].id } as MPMsg);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 shrink-0"
                          style={{ background: "rgba(255,255,255,0.08)" }}>‹</button>
                  <div className="flex-1"><MiniTeamCard team={myTeam} /></div>
                  <button onClick={() => {
                            const next = (myTeamIdx + 1) % TEAMS.length;
                            setMyTeamIdx(next);
                            sendMessage({ t: "LOBBY_TEAM_UPDATE", teamId: TEAMS[next].id } as MPMsg);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 shrink-0"
                          style={{ background: "rgba(255,255,255,0.08)" }}>›</button>
                </div>
              )}
            </div>

            {/* Opponent team (read-only) */}
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Opponent's Team</p>
              <div className="flex items-center gap-2">
                <div className="w-8 shrink-0" />
                <div className="flex-1">
                  <MiniTeamCard team={oppTeam} pending={!oppTeamLocked && oppTeam === null} />
                  {oppTeamLocked && <p className="text-[9px] text-emerald-500 mt-1 pl-1">✓ Locked in</p>}
                </div>
                <div className="w-8 shrink-0" />
              </div>
            </div>

            {!myTeamLocked && (
              <button onClick={lockTeam}
                      className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.97]"
                      style={{ background: "#f4f4f5", color: "#09090b" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f5"; }}>
                Lock In {myTeam.name}
              </button>
            )}
            {myTeamLocked && !oppTeamLocked && (
              <div className="flex items-center justify-center gap-2 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-xs text-gray-500">Waiting for opponent to pick…</p>
              </div>
            )}
          </>
        )}

        {/* ── Phase: squad-pick ── */}
        {phase === "squad-pick" && (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest">
                <span>Pick Your XI ({myXI.length}/11)</span>
                <span className={squadTimeLeft <= 10 ? "text-red-400 font-bold" : ""}>{squadTimeLeft}s</span>
              </div>
              <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                     style={{ width: `${(squadTimeLeft / LOBBY_TIMER_SECS) * 100}%`,
                              background: squadTimeLeft > 10 ? "#10b981" : "#ef4444" }} />
              </div>
            </div>

            {/* Player list */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {myTeam.players.map(p => (
                <PlayerTile key={p.id} player={p}
                            selected={myXI.includes(p.id)}
                            onToggle={() => !myXILocked && togglePlayer(p.id)} />
              ))}
            </div>

            {!myXILocked && (
              <button onClick={lockXI} disabled={myXI.length !== 11}
                      className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.97] disabled:opacity-40"
                      style={{ background: myXI.length === 11 ? "#f4f4f5" : "rgba(255,255,255,0.06)", color: myXI.length === 11 ? "#09090b" : "#4b5563" }}
                      onMouseEnter={e => { if (myXI.length === 11) (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
                      onMouseLeave={e => { if (myXI.length === 11) (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f5"; }}>
                {myXI.length === 11 ? "Confirm XI →" : `Select ${11 - myXI.length} more`}
              </button>
            )}
          </>
        )}

        {/* ── Phase: waiting (squads confirmed, match starting) ── */}
        {phase === "waiting" && (
          <div className="text-center space-y-4 py-8">
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-white font-bold">Get Ready!</p>
            <p className="text-gray-500 text-xs">Match is about to start…</p>
          </div>
        )}

      </div>
    </div>
  );
}
