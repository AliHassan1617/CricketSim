import { useGame } from "../state/gameContext";
import { getAllTeams, getRandomOpponent } from "../data/teamDb";
import { Team } from "../types/player";

function topPlayers(team: Team) {
  const batters = [...team.players]
    .filter(p => p.role === "batsman" || p.role === "wicket-keeper")
    .sort((a, b) =>
      (b.batting.techniqueVsPace + b.batting.techniqueVsSpin) -
      (a.batting.techniqueVsPace + a.batting.techniqueVsSpin)
    )
    .slice(0, 2);
  const bowler = [...team.players]
    .filter(p => p.role === "bowler")
    .sort((a, b) => b.bowling.mainSkill - a.bowling.mainSkill)
    .slice(0, 1);
  return [...batters, ...bowler];
}

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

const ALL_TEAMS = getAllTeams();

export function TeamPickScreen() {
  const { dispatch } = useGame();

  const handlePick = (team: Team) => {
    const opponent = getRandomOpponent(team.id);
    dispatch({ type: "PICK_TEAM", payload: { userTeam: team, opponentTeam: opponent } });
  };

  return (
    <div
      className="min-h-screen text-white flex flex-col items-center px-4 py-10 gap-8"
      style={{ background: "#09090b" }}
    >
      {/* Header */}
      <div className="text-center">
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.4em] mb-3">
          Select your team
        </p>
        <h1 className="text-4xl font-black tracking-tight text-white">
          Choose Your Side
        </h1>
        <p className="text-xs text-gray-500 mt-2">
          Your opponent will be randomly drawn from the remaining nations
        </p>
      </div>

      {/* Team cards — 2 columns on mobile, 4 on wider screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
        {ALL_TEAMS.map(team => {
          const top3 = topPlayers(team);
          const { batAvg, bowlAvg, fieldAvg } = teamStats(team);
          return (
            <button
              key={team.id}
              onClick={() => handlePick(team)}
              className="text-left rounded-2xl overflow-hidden transition-all duration-150 cursor-pointer"
              style={{ border: "1.5px solid rgba(255,255,255,0.1)" }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = team.color;
                el.style.boxShadow = `0 0 24px ${team.color}33`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = "rgba(255,255,255,0.1)";
                el.style.boxShadow = "";
              }}
            >
              {/* Colored top strip — team badge + name */}
              <div
                className="px-4 py-3 flex items-center gap-2.5"
                style={{
                  background: `linear-gradient(90deg, ${team.color}44, ${team.color}20, transparent)`,
                  borderBottom: `1px solid ${team.color}30`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[9px] font-extrabold tracking-wide shrink-0"
                  style={{ backgroundColor: team.color }}
                >
                  {team.shortName}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-white leading-tight truncate">
                    {team.name}
                  </h2>
                  <div className="flex gap-1.5 mt-0.5 flex-wrap">
                    {(["batsman", "wicket-keeper", "all-rounder", "bowler"] as const).map(role => {
                      const count = team.players.filter(p => p.role === role).length;
                      const lbl = { batsman: "BAT", "wicket-keeper": "WK", "all-rounder": "AR", bowler: "BWL" }[role];
                      return count > 0 ? (
                        <span key={role} className="text-[8px] text-gray-500">
                          {count} {lbl}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div
                className="px-4 pt-3.5 pb-4 space-y-3"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                {/* Team strengths */}
                <div className="space-y-1.5">
                  <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-2">
                    Strengths
                  </p>
                  {[
                    { label: "Batting",  value: batAvg,   color: "#3b82f6" },
                    { label: "Bowling",  value: bowlAvg,  color: "#ef4444" },
                    { label: "Fielding", value: fieldAvg, color: "#a78bfa" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-[9px] text-gray-500 w-12 shrink-0">{label}</span>
                      <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
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

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

                {/* Key players */}
                <div className="space-y-1.5">
                  <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-2">
                    Key Players
                  </p>
                  {top3.map(p => {
                    const isBat = p.role === "batsman" || p.role === "wicket-keeper";
                    const statVal = isBat
                      ? Math.round((p.batting.techniqueVsPace + p.batting.techniqueVsSpin) / 2)
                      : p.bowling.mainSkill;
                    const barColor = isBat ? "#3b82f6" : "#ef4444";
                    const tag = isBat ? "BAT" : "BWL";
                    return (
                      <div key={p.id} className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-300 w-20 truncate shrink-0">
                          {p.shortName}
                        </span>
                        <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${statVal}%`, backgroundColor: barColor }}
                          />
                        </div>
                        <span
                          className="text-[9px] shrink-0 w-12 text-right tabular-nums font-semibold"
                          style={{ color: barColor }}
                        >
                          {tag} {statVal}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <div
                  className="w-full py-2 rounded-xl text-center text-xs font-bold text-white mt-1"
                  style={{ backgroundColor: `${team.color}cc` }}
                >
                  Play as {team.shortName}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
