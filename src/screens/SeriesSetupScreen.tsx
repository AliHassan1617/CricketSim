import { useState } from "react";
import { useGame } from "../state/gameContext";
import { getAllTeams } from "../data/teamDb";
import { MatchFormat } from "../types/enums";
import { BackButton } from "../components/BackButton";

const TEAMS = getAllTeams();
const FORMATS = [MatchFormat.T10, MatchFormat.T20, MatchFormat.ODI, MatchFormat.Test] as const;
const FORMAT_LABELS: Record<string, string> = { T10: "T10", T20: "T20", ODI: "ODI", Test: "Test" };

function initIndices(): [number, number] {
  const a = Math.floor(Math.random() * TEAMS.length);
  const b = (a + 1 + Math.floor(Math.random() * (TEAMS.length - 1))) % TEAMS.length;
  return [a, b];
}

export function SeriesSetupScreen() {
  const { dispatch } = useGame();
  const [init] = useState(initIndices);
  const [userTeamIdx, setUserTeamIdx] = useState(init[0]);
  const [oppTeamIdx,  setOppTeamIdx]  = useState(init[1]);
  const [format,      setFormat]      = useState<MatchFormat>(MatchFormat.T20);
  const [totalMatches, setTotal]      = useState<3 | 5>(3);

  const userTeam = TEAMS[userTeamIdx];
  const oppTeam  = TEAMS[oppTeamIdx];

  function start() {
    dispatch({
      type: "SERIES_INIT",
      payload: {
        totalMatches, format,
        userTeamId: userTeam.id, oppTeamId: oppTeam.id,
        userTeamName: userTeam.name, oppTeamName: oppTeam.name,
      },
    });
  }

  return (
    <div className="min-h-screen text-white flex flex-col px-5 py-6 gap-5"
         style={{ background: "linear-gradient(160deg,#05101a 0%,#0a0a0a 100%)" }}>
      <BackButton onClick={() => dispatch({ type: "GO_TO_MAIN_MENU" })} />

      <div className="text-center">
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mb-1">Series</p>
        <h2 className="text-2xl font-black text-white">Setup</h2>
      </div>

      {/* Series length */}
      <div className="space-y-2">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Series Length</p>
        <div className="grid grid-cols-2 gap-3">
          {([3, 5] as const).map(n => (
            <button key={n} onClick={() => setTotal(n)}
              className="py-4 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={totalMatches === n
                ? { background: "rgba(245,158,11,0.2)", border: "1.5px solid #f59e0b", color: "#fbbf24" }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#6b7280" }}>
              Best of {n}
            </button>
          ))}
        </div>
      </div>

      {/* Format */}
      <div className="space-y-2">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Format</p>
        <div className="grid grid-cols-4 gap-2">
          {FORMATS.map(f => (
            <button key={f} onClick={() => setFormat(f)}
              className="py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={format === f
                ? { background: "rgba(245,158,11,0.2)", border: "1.5px solid #f59e0b", color: "#fbbf24" }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#6b7280" }}>
              {FORMAT_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-3">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Your Team</p>
        <div className="flex items-center gap-3">
          <button onClick={() => setUserTeamIdx(i => { let n = (i - 1 + TEAMS.length) % TEAMS.length; if (n === oppTeamIdx) n = (n - 1 + TEAMS.length) % TEAMS.length; return n; })}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-300"
            style={{ background: "rgba(255,255,255,0.08)" }}>‹</button>
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl"
               style={{ background: `linear-gradient(90deg,${userTeam.color}33,${userTeam.color}11)`, border: `1px solid ${userTeam.color}44` }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black"
                 style={{ background: userTeam.color, color: "#fff" }}>{userTeam.shortName}</div>
            <p className="text-sm font-bold text-white">{userTeam.name}</p>
          </div>
          <button onClick={() => setUserTeamIdx(i => { let n = (i + 1) % TEAMS.length; if (n === oppTeamIdx) n = (n + 1) % TEAMS.length; return n; })}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-300"
            style={{ background: "rgba(255,255,255,0.08)" }}>›</button>
        </div>

        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Opponent</p>
        <div className="flex items-center gap-3">
          <button onClick={() => setOppTeamIdx(i => { let n = (i - 1 + TEAMS.length) % TEAMS.length; if (n === userTeamIdx) n = (n - 1 + TEAMS.length) % TEAMS.length; return n; })}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-300"
            style={{ background: "rgba(255,255,255,0.08)" }}>‹</button>
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl"
               style={{ background: `linear-gradient(90deg,${oppTeam.color}33,${oppTeam.color}11)`, border: `1px solid ${oppTeam.color}44` }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black"
                 style={{ background: oppTeam.color, color: "#fff" }}>{oppTeam.shortName}</div>
            <p className="text-sm font-bold text-white">{oppTeam.name}</p>
          </div>
          <button onClick={() => setOppTeamIdx(i => { let n = (i + 1) % TEAMS.length; if (n === userTeamIdx) n = (n + 1) % TEAMS.length; return n; })}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-300"
            style={{ background: "rgba(255,255,255,0.08)" }}>›</button>
        </div>
      </div>

      <button onClick={start}
        className="w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest active:scale-[0.97] transition-transform mt-auto"
        style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#09090b" }}>
        Start Series →
      </button>
    </div>
  );
}
