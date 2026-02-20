import { useState } from "react";
import { useGame } from "../state/gameContext";
import { getAllTeams } from "../data/teamDb";
import { Team } from "../types/player";

const TEAMS = getAllTeams();

// ── Helpers ────────────────────────────────────────────────────────────────────

function teamStats(team: Team) {
  const batters = team.players.filter(
    p => p.role === "batsman" || p.role === "wicket-keeper" || p.role === "all-rounder"
  );
  const bowlers = team.players.filter(
    p => p.role === "bowler" || p.role === "all-rounder"
  );
  const batAvg = batters.length > 0
    ? Math.round(batters.reduce((s, p) => s + (p.batting.techniqueVsPace + p.batting.techniqueVsSpin) / 2, 0) / batters.length)
    : 0;
  const bowlAvg = bowlers.length > 0
    ? Math.round(bowlers.reduce((s, p) => s + p.bowling.mainSkill, 0) / bowlers.length)
    : 0;
  const fieldAvg = team.players.length > 0
    ? Math.round(team.players.reduce((s, p) => s + p.batting.runningBetweenWickets, 0) / team.players.length)
    : 0;
  return { batAvg, bowlAvg, fieldAvg };
}

// ── Team card ─────────────────────────────────────────────────────────────────

function TeamCard({ team }: { team: Team }) {
  const { batAvg, bowlAvg, fieldAvg } = teamStats(team);

  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{ border: `1.5px solid ${team.color}55` }}
    >
      {/* Colored top strip */}
      <div
        className="px-4 py-4 flex items-center gap-3"
        style={{
          background: `linear-gradient(90deg, ${team.color}55, ${team.color}22, transparent)`,
          borderBottom: `1px solid ${team.color}30`,
        }}
      >
        {/* Badge */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold tracking-wide shrink-0"
          style={{ backgroundColor: team.color }}
        >
          {team.shortName}
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white leading-tight truncate">{team.name}</h2>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            {(["batsman", "wicket-keeper", "all-rounder", "bowler"] as const).map(role => {
              const count = team.players.filter(p => p.role === role).length;
              const lbl = { batsman: "BAT", "wicket-keeper": "WK", "all-rounder": "AR", bowler: "BWL" }[role];
              return count > 0 ? (
                <span key={role} className="text-[8px] text-gray-400">{count} {lbl}</span>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Strength bars */}
      <div
        className="px-4 py-4 space-y-3"
        style={{ background: "rgba(255,255,255,0.03)" }}
      >
        {[
          { label: "Batting",  value: batAvg,  color: "#3b82f6" },
          { label: "Bowling",  value: bowlAvg, color: "#ef4444" },
          { label: "Fielding", value: fieldAvg, color: "#a78bfa" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-[9px] text-gray-500 w-12 shrink-0">{label}</span>
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${value}%`, backgroundColor: color }}
              />
            </div>
            <span
              className="text-[9px] tabular-nums font-bold w-5 text-right shrink-0"
              style={{ color }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Arrow button ───────────────────────────────────────────────────────────────

function ArrowBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 shrink-0 text-base transition-colors"
      style={{ background: "rgba(255,255,255,0.08)" }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.16)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
    >
      {children}
    </button>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export function ExhibitionCarouselScreen() {
  const { dispatch } = useGame();
  const [userIdx, setUserIdx] = useState(0);
  const [oppIdx,  setOppIdx]  = useState(1);

  function moveUser(dir: 1 | -1) {
    setUserIdx(prev => {
      let next = (prev + dir + TEAMS.length) % TEAMS.length;
      if (next === oppIdx) next = (next + dir + TEAMS.length) % TEAMS.length;
      return next;
    });
  }

  function moveOpp(dir: 1 | -1) {
    setOppIdx(prev => {
      let next = (prev + dir + TEAMS.length) % TEAMS.length;
      if (next === userIdx) next = (next + dir + TEAMS.length) % TEAMS.length;
      return next;
    });
  }

  const handleProceed = () => {
    dispatch({
      type: "PICK_TEAM",
      payload: { userTeam: TEAMS[userIdx], opponentTeam: TEAMS[oppIdx] },
    });
  };

  return (
    <div
      className="min-h-screen text-white flex flex-col px-4 py-10"
      style={{ background: "linear-gradient(160deg, #050e18 0%, #0a0a0a 50%, #050e18 100%)" }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.4em] mb-1">Exhibition</p>
        <h2 className="text-3xl font-black text-white">Pick Teams</h2>
      </div>

      {/* Side-by-side carousels — cards are the main focus */}
      <div className="flex-1 flex items-center">
        <div className="w-full flex items-start gap-3">

          {/* User column */}
          <div className="flex-1 flex flex-col gap-3">
            <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold text-center">
              Your Team
            </p>
            <div className="flex items-center gap-2">
              <ArrowBtn onClick={() => moveUser(-1)}>‹</ArrowBtn>
              <span className="flex-1 text-[11px] text-gray-300 text-center font-semibold truncate">
                {TEAMS[userIdx].name}
              </span>
              <ArrowBtn onClick={() => moveUser(1)}>›</ArrowBtn>
            </div>
            <TeamCard team={TEAMS[userIdx]} />
          </div>

          {/* VS divider */}
          <div className="flex flex-col items-center gap-1 pt-10 shrink-0" style={{ minHeight: 200 }}>
            <div className="w-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-gray-600 text-[11px] font-bold tracking-widest py-1">VS</span>
            <div className="w-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Opponent column */}
          <div className="flex-1 flex flex-col gap-3">
            <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold text-center">
              Opponent
            </p>
            <div className="flex items-center gap-2">
              <ArrowBtn onClick={() => moveOpp(-1)}>‹</ArrowBtn>
              <span className="flex-1 text-[11px] text-gray-300 text-center font-semibold truncate">
                {TEAMS[oppIdx].name}
              </span>
              <ArrowBtn onClick={() => moveOpp(1)}>›</ArrowBtn>
            </div>
            <TeamCard team={TEAMS[oppIdx]} />
          </div>

        </div>
      </div>

      {/* Proceed button — pushed to bottom with generous space */}
      <div className="mt-10">
        <button
          onClick={handleProceed}
          className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.97]"
          style={{ background: "#f4f4f5", color: "#09090b" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f5"; }}
        >
          Proceed →
        </button>
      </div>
    </div>
  );
}
