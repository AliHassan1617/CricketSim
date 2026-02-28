import { useEffect, useRef, useState } from "react";
import { useGame } from "../state/gameContext";
import { useMultiplayer } from "../multiplayer/MultiplayerContext";

type LobbyView = "choose" | "hosting" | "joining";

export function MultiplayerLobbyScreen() {
  const { dispatch }                       = useGame();
  const { createRoom, joinRoom, roomCode, connected, onMessage, disconnect } = useMultiplayer();

  const [view, setView]     = useState<LobbyView>("choose");
  const [joinCode, setCode] = useState("");
  const [error, setError]   = useState("");

  const hasNavigated = useRef(false);

  // Host: once guest connects → proceed to exhibition carousel
  // Guest: once connected, dispatch GO_TO_MULTIPLAYER_GUEST to wait for host's MATCH_CONFIG
  useEffect(() => {
    if (!connected || hasNavigated.current) return;
    hasNavigated.current = true;

    // Host transitions to the normal exhibition flow (picks teams, format, etc.)
    dispatch({ type: view === "hosting" ? "GO_TO_EXHIBITION" : "GO_TO_MULTIPLAYER_GUEST" });
  }, [connected, view, dispatch]);

  // Guest listens for MATCH_CONFIG — handled inside GuestMatchScreen.
  // This screen just establishes the connection.

  const handleCreate = () => {
    setView("hosting");
    createRoom();
  };

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) { setError("Enter the 6-character room code."); return; }
    setError("");
    setView("joining");
    joinRoom(code);
  };

  const handleBack = () => {
    disconnect();
    dispatch({ type: "GO_TO_MAIN_MENU" });
  };

  return (
    <div className="relative min-h-screen text-white flex flex-col items-center justify-center px-6 overflow-hidden">
      <img
        src="/alessandro-bogliari-oDs_AxeR5g4-unsplash.jpg"
        alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ zIndex: 0 }}
      />
      <div
        className="absolute inset-0"
        style={{ zIndex: 1, background: "linear-gradient(to bottom, rgba(3,12,5,0.85) 0%, rgba(3,12,5,0.95) 100%)" }}
      />
      <div className="relative w-full max-w-xs space-y-8" style={{ zIndex: 2 }}>

        {/* Header */}
        <div className="text-center">
          <button
            onClick={handleBack}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors mb-6 block mx-auto"
          >
            ‹ Back
          </button>
          <p className="text-[11px] text-gray-500 uppercase tracking-[0.4em] mb-1">Multiplayer</p>
          <h2 className="text-3xl font-black text-white">Local Match</h2>
          <p className="text-xs text-gray-600 mt-1">Works on same WiFi or any internet connection</p>
        </div>

        {/* Choose view */}
        {view === "choose" && (
          <div className="space-y-4">
            {/* Create */}
            <button
              onClick={handleCreate}
              className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.97]"
              style={{ background: "#f4f4f5", color: "#09090b" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f5"; }}
            >
              Create Match
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              <span className="text-xs text-gray-600">or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Join */}
            <div className="space-y-2">
              <input
                value={joinCode}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                maxLength={8}
                className="w-full px-4 py-3 rounded-xl text-sm text-center font-mono font-bold tracking-widest outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#f4f4f5",
                }}
              />
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              <button
                onClick={handleJoin}
                className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.97]"
                style={{
                  background: "rgba(99,102,241,0.15)",
                  color: "#a5b4fc",
                  border: "1px solid rgba(99,102,241,0.35)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.25)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.15)"; }}
              >
                Join Match
              </button>
            </div>
          </div>
        )}

        {/* Hosting — show code */}
        {view === "hosting" && (
          <div className="text-center space-y-6">
            <div
              className="rounded-2xl p-6 space-y-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-xs text-gray-500 uppercase tracking-widest">Room Code</p>
              <p className="text-5xl font-black tracking-[0.3em] text-white font-mono">
                {roomCode ?? "…"}
              </p>
              <p className="text-xs text-gray-600">Share this code with your opponent</p>
            </div>
            {connected ? (
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <p className="text-sm text-emerald-400 font-semibold">Opponent connected! Starting…</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-sm text-gray-400">Waiting for opponent to join…</p>
              </div>
            )}
          </div>
        )}

        {/* Joining */}
        {view === "joining" && (
          <div className="text-center space-y-6">
            <div
              className="rounded-2xl p-6 space-y-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-xs text-gray-500 uppercase tracking-widest">Connecting to</p>
              <p className="text-4xl font-black tracking-[0.3em] text-white font-mono">
                {joinCode}
              </p>
            </div>
            {connected ? (
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <p className="text-sm text-emerald-400 font-semibold">Connected! Waiting for host…</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <p className="text-sm text-gray-400">Connecting…</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
