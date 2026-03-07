import { useState } from "react";
import { useGame } from "../state/gameContext";
import { getAllTeams } from "../data/teamDb";
import { Team } from "../types/player";
import { BackButton } from "../components/BackButton";

const TEAMS = getAllTeams();

function teamStrengths(team: Team) {
  const batters = team.players.filter(
    p => p.role === "batsman" || p.role === "wicket-keeper" || p.role === "all-rounder",
  );
  const bowlers = team.players.filter(
    p => p.role === "bowler" || p.role === "all-rounder",
  );
  const batAvg = batters.length > 0
    ? Math.round(batters.reduce((s, p) => s + (p.batting.techniqueVsPace + p.batting.techniqueVsSpin) / 2, 0) / batters.length)
    : 0;
  const bowlAvg = bowlers.length > 0
    ? Math.round(bowlers.reduce((s, p) => s + p.bowling.mainSkill, 0) / bowlers.length)
    : 0;
  return { batAvg, bowlAvg };
}

function ArrowBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-11 h-11 rounded-full flex items-center justify-center text-gray-300 shrink-0 text-xl transition-colors"
      style={{ background: "rgba(255,255,255,0.08)" }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.16)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
    >
      {children}
    </button>
  );
}

const WC_FORMATS = [
  { value: "T20", label: "T20", sub: "20 overs per side" },
  { value: "ODI", label: "ODI", sub: "50 overs per side" },
  { value: "T10", label: "T10", sub: "10 overs per side" },
] as const;
type WCFormat = typeof WC_FORMATS[number]["value"];

export function WorldCupSetupScreen() {
  const { dispatch } = useGame();
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * TEAMS.length));
  const [fmtIdx, setFmtIdx] = useState(0);
  const wcFmt: WCFormat = WC_FORMATS[fmtIdx].value;

  const team = TEAMS[idx];
  const { batAvg, bowlAvg } = teamStrengths(team);

  function move(dir: 1 | -1) {
    setIdx(prev => (prev + dir + TEAMS.length) % TEAMS.length);
  }

  return (
    <div className="relative min-h-screen text-white flex flex-col px-4 py-10 overflow-hidden">
      {/* BG */}
      <img
        src="/aksh-yadav-bY4cqxp7vos-unsplash.jpg"
        alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ zIndex: 0 }}
      />
      <div
        className="absolute inset-0"
        style={{ zIndex: 1, background: "linear-gradient(to bottom, rgba(5,14,24,0.82) 0%, rgba(5,14,24,0.93) 100%)" }}
      />

      <div className="relative flex flex-col flex-1 max-w-sm mx-auto w-full" style={{ zIndex: 2 }}>
        {/* Header */}
        <div className="mb-6">
          <BackButton onClick={() => dispatch({ type: "GO_TO_MAIN_MENU" })} style={{ marginBottom: 16 }} />
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em] mb-1 text-center">ICC World Cup</p>
          <h2 className="text-3xl font-black text-white text-center">Pick Your Nation</h2>
          <p className="text-xs text-gray-500 mt-2 text-center">You'll be randomly drawn into a group of 4</p>
        </div>

        {/* Trophy */}
        <div className="text-center text-5xl mb-6">🏆</div>

        {/* Team picker */}
        <div className="flex flex-col items-center gap-5">
          {/* Navigation row */}
          <div className="flex items-center gap-4 w-full">
            <ArrowBtn onClick={() => move(-1)}>‹</ArrowBtn>
            <p className="flex-1 text-center text-xs text-gray-500 tabular-nums">
              {idx + 1} / {TEAMS.length}
            </p>
            <ArrowBtn onClick={() => move(1)}>›</ArrowBtn>
          </div>

          {/* Card */}
          <div
            className="w-full rounded-2xl overflow-hidden"
            style={{ border: `2px solid ${team.color}` }}
          >
            {/* Top strip */}
            <div
              className="px-6 py-6 flex flex-col items-center gap-3"
              style={{ background: `linear-gradient(135deg, ${team.color}55, ${team.color}18)` }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-lg font-extrabold tracking-wide"
                style={{ backgroundColor: team.color }}
              >
                {team.shortName}
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-white">{team.name}</h3>
                <div className="flex gap-2 justify-center mt-1 flex-wrap">
                  {(["batsman", "wicket-keeper", "all-rounder", "bowler"] as const).map(role => {
                    const count = team.players.filter(p => p.role === role).length;
                    const lbl = { batsman: "BAT", "wicket-keeper": "WK", "all-rounder": "AR", bowler: "BWL" }[role];
                    return count > 0 ? (
                      <span key={role} className="text-[10px] text-gray-400">{count} {lbl}</span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            {/* Strength bars */}
            <div className="px-6 py-4 space-y-3" style={{ background: "rgba(255,255,255,0.03)" }}>
              {[
                { label: "Batting",  value: batAvg,  color: "#3b82f6" },
                { label: "Bowling",  value: bowlAvg, color: "#ef4444" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-500 w-14 shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${value}%`, backgroundColor: color }}
                    />
                  </div>
                  <span
                    className="text-[10px] tabular-nums font-bold w-6 text-right shrink-0"
                    style={{ color }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex gap-1.5">
            {TEAMS.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                style={{ backgroundColor: i === idx ? team.color : "rgba(255,255,255,0.2)" }}
              />
            ))}
          </div>
        </div>

        {/* Format picker */}
        <div className="mt-6">
          <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold text-center mb-3">
            Tournament Format
          </p>
          <div className="flex gap-2">
            {WC_FORMATS.map((f, i) => (
              <button
                key={f.value}
                onClick={() => setFmtIdx(i)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.97]"
                style={{
                  background: fmtIdx === i ? team.color : "rgba(255,255,255,0.06)",
                  color: fmtIdx === i ? "#fff" : "rgba(255,255,255,0.5)",
                  border: fmtIdx === i ? `1px solid ${team.color}` : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="text-center text-[10px] text-gray-600 mt-2">
            {WC_FORMATS[fmtIdx].sub}
          </p>
        </div>

        {/* Select button */}
        <div className="mt-4">
          <button
            onClick={() => dispatch({ type: "WC_SELECT_TEAM", payload: { teamId: team.id, format: wcFmt } })}
            className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.97]"
            style={{ background: team.color, color: "#ffffff" }}
          >
            Start Tournament →
          </button>
        </div>
      </div>
    </div>
  );
}
