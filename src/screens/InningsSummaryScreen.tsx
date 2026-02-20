import { useEffect } from "react";
import { useGame } from "../state/gameContext";
import { getAllPlayers } from "../state/selectors";
import { MatchFormat } from "../types/enums";
import { formatOvers } from "../utils/format";

export function InningsSummaryScreen() {
  const { state, dispatch } = useGame();
  const innings = state.firstInnings;
  const allPlayers = getAllPlayers(state);

  // Auto-advance in simulate mode
  useEffect(() => {
    if (!state.isSimulating) return;
    const t = setTimeout(() => {
      dispatch({ type: "START_SECOND_INNINGS" });
      dispatch({ type: "START_INNINGS" });
    }, 0);
    return () => clearTimeout(t);
  }, [state.isSimulating]);

  if (!innings) return null;

  const target = innings.totalRuns + 1;
  const matchOvers = state.format === MatchFormat.T5 ? 5
                   : state.format === MatchFormat.T20 ? 20 : 10;
  const reqRate = (target / matchOvers).toFixed(2);
  const totalBalls = innings.totalOvers * 6 + innings.ballsInCurrentOver;

  // Top scorer from 1st innings
  const topBat = [...innings.batsmen].sort((a, b) => b.runs - a.runs)[0];
  const topBatPlayer = topBat ? allPlayers.find(p => p.id === topBat.playerId) : null;

  // Best bowler from 1st innings
  const topBowl = [...innings.bowlers]
    .filter(b => b.wickets > 0)
    .sort((a, b) => b.wickets !== a.wickets ? b.wickets - a.wickets : a.runsConceded - b.runsConceded)[0];
  const topBowlPlayer = topBowl ? allPlayers.find(p => p.id === topBowl.playerId) : null;

  const chasingTeamName = state.userBatsFirst
    ? (state.opponentTeam?.name ?? "Opponent")
    : (state.userTeam?.name ?? "Your Team");
  const chasingColor = state.userBatsFirst
    ? (state.opponentTeam?.color ?? "#22c55e")
    : (state.userTeam?.color ?? "#22c55e");

  const handleStart = () => {
    dispatch({ type: "START_SECOND_INNINGS" });
    dispatch({ type: "START_INNINGS" });
  };

  return (
    <div
      className="min-h-screen text-white flex flex-col items-center justify-center px-4 py-8 gap-6"
      style={{ background: "linear-gradient(160deg, #050e18 0%, #0a0a0a 50%, #050e18 100%)" }}
    >
      {/* Innings break label */}
      <div className="text-center" style={{ animation: "fadeInUp 0.35s ease" }}>
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] mb-2">Innings Break</p>
        <p className="text-gray-400 text-sm">{innings.battingTeamName} innings complete</p>
      </div>

      {/* Score card — big */}
      <div
        className="w-full max-w-sm rounded-2xl text-center py-6 px-5"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1.5px solid rgba(255,255,255,0.1)",
          animation: "popIn 0.45s ease",
        }}
      >
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{innings.battingTeamName}</p>
        <p className="text-6xl font-black tabular-nums text-white mb-1">
          {innings.totalRuns}<span className="text-gray-500 text-4xl">/{innings.totalWickets}</span>
        </p>
        <p className="text-gray-400 text-sm">
          ({formatOvers(totalBalls)} overs) ·{" "}
          RR {totalBalls > 0 ? ((innings.totalRuns / totalBalls) * 6).toFixed(2) : "0.00"}
        </p>

        {/* Highlights row */}
        {(topBatPlayer || topBowlPlayer) && (
          <div
            className="flex justify-around mt-4 pt-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            {topBatPlayer && topBat && (
              <div className="text-center">
                <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Top Scorer</p>
                <p className="text-sm font-bold text-blue-400">{topBatPlayer.shortName}</p>
                <p className="text-xs text-gray-400">{topBat.runs} ({topBat.balls})</p>
              </div>
            )}
            {topBowlPlayer && topBowl && (
              <div className="text-center">
                <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Best Bowling</p>
                <p className="text-sm font-bold text-red-400">{topBowlPlayer.shortName}</p>
                <p className="text-xs text-gray-400">
                  {topBowl.wickets}/{topBowl.runsConceded}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Target splash */}
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          border: `1.5px solid ${chasingColor}50`,
          boxShadow: `0 0 40px ${chasingColor}18`,
          animation: "popIn 0.55s ease",
        }}
      >
        {/* Top strip */}
        <div
          className="py-3 px-5 text-center"
          style={{ background: `linear-gradient(90deg, ${chasingColor}30, ${chasingColor}18, transparent)` }}
        >
          <p className="text-[10px] uppercase tracking-widest text-gray-400">
            {chasingTeamName} need
          </p>
        </div>

        {/* Main content */}
        <div className="px-6 py-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="text-center">
            <span
              className="text-7xl font-black tabular-nums"
              style={{ color: chasingColor }}
            >
              {target}
            </span>
            <p className="text-gray-400 text-sm mt-1">runs to win</p>
          </div>
          <div
            className="flex justify-around pt-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="text-center">
              <p className="text-[9px] text-gray-600 uppercase tracking-wider">Overs</p>
              <p className="text-xl font-bold text-white">{matchOvers}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-gray-600 uppercase tracking-wider">Required Rate</p>
              <p
                className="text-xl font-bold"
                style={{ color: parseFloat(reqRate) > 10 ? "#f87171" : parseFloat(reqRate) > 8 ? "#fbbf24" : "#34d399" }}
              >
                {reqRate}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-gray-600 uppercase tracking-wider">Balls</p>
              <p className="text-xl font-bold text-white">{matchOvers * 6}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleStart}
        className="w-full max-w-sm py-4 rounded-xl text-lg font-black tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: `linear-gradient(135deg, ${chasingColor}cc, ${chasingColor}99)`,
          boxShadow: `0 6px 24px ${chasingColor}28`,
          animation: "fadeInUp 0.6s ease",
        }}
      >
        Start 2nd Innings
      </button>
    </div>
  );
}
