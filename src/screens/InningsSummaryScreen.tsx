import { useEffect } from "react";
import { useGame } from "../state/gameContext";
import { getAllPlayers } from "../state/selectors";
import { MatchFormat } from "../types/enums";
import { formatOvers } from "../utils/format";

export function InningsSummaryScreen() {
  const { state, dispatch } = useGame();
  const allPlayers = getAllPlayers(state);

  // Which innings just completed?
  const completedNum = state.currentInnings; // 1, 2, or 3 (4 never shows InningsSummary)
  const innings = completedNum === 1 ? state.firstInnings
                : completedNum === 2 ? state.secondInnings
                : state.thirdInnings;

  // Detect Test from the innings matchOvers (most reliable — set at START_INNINGS from
  // the format at that time and stored immutably). Fall back to state.format if no innings yet.
  const anyMatchOvers = state.firstInnings?.matchOvers
                     ?? state.secondInnings?.matchOvers
                     ?? state.thirdInnings?.matchOvers
                     ?? 0;
  const isTest = anyMatchOvers >= 90 || state.format === MatchFormat.Test;

  // ── Innings win detection (Test only, after inn3) ───────────────────────────
  // If team B's single innings (inn2) exceeds team A's combined (inn1+inn3),
  // team B wins by "an innings and X runs" — no 4th innings needed.
  const teamATotal = (state.firstInnings?.totalRuns ?? 0) + (state.thirdInnings?.totalRuns ?? 0);
  const teamBFirst  = state.secondInnings?.totalRuns ?? 0;
  const inn4Target  = teamATotal - teamBFirst + 1;
  const isInningsWin = completedNum === 3 && isTest && inn4Target <= 0;
  const inningsWinMargin = isInningsWin ? Math.abs(inn4Target - 1) : 0; // = teamBFirst - teamATotal

  // ── Winner of innings win: team B (the one who batted in inn2) ───────────────
  const inn2BattingTeamName = state.secondInnings?.battingTeamName ?? "";

  // Auto-advance in simulate mode.
  // Test: stop simulating at each innings break so user can review the scorecard.
  useEffect(() => {
    if (!state.isSimulating) return;
    if (isTest) {
      dispatch({ type: "SET_SIMULATING", payload: { value: false } });
      return;
    }
    const t = setTimeout(() => {
      if (completedNum === 1) {
        dispatch({ type: "START_SECOND_INNINGS" });
      } else if (completedNum === 2) {
        dispatch({ type: "START_THIRD_INNINGS" });
      } else {
        dispatch({ type: "START_FOURTH_INNINGS" });
      }
      dispatch({ type: "START_INNINGS" });
    }, 0);
    return () => clearTimeout(t);
  }, [state.isSimulating]);

  if (!innings) return null;

  const totalBalls = innings.totalOvers * 6 + innings.ballsInCurrentOver;
  // Use the overs stored on the innings itself — always correct regardless of format.
  const matchOvers = innings.matchOvers;

  // Top scorer from completed innings
  const topBat = [...innings.batsmen].sort((a, b) => b.runs - a.runs)[0];
  const topBatPlayer = topBat ? allPlayers.find(p => p.id === topBat.playerId) : null;

  // Best bowler from completed innings
  const topBowl = [...innings.bowlers]
    .filter(b => b.wickets > 0)
    .sort((a, b) => b.wickets !== a.wickets ? b.wickets - a.wickets : a.runsConceded - b.runsConceded)[0];
  const topBowlPlayer = topBowl ? allPlayers.find(p => p.id === topBowl.playerId) : null;

  // ── Context-specific data ──────────────────────────────────────────────────

  let nextTeamName = "";
  let nextTeamColor = "#22c55e";
  let targetLabel = "";
  let targetValue = 0;
  let reqRate = "";
  let ctaLabel = "";
  let subheadLabel = "";
  // Controls the top strip header above the target number
  let targetStripHeader = "";

  if (completedNum === 1) {
    nextTeamName = state.userBatsFirst
      ? (state.opponentTeam?.name ?? "Opponent")
      : (state.userTeam?.name ?? "Your Team");
    nextTeamColor = state.userBatsFirst
      ? (state.opponentTeam?.color ?? "#22c55e")
      : (state.userTeam?.color ?? "#22c55e");

    if (isTest) {
      // Test inn1 break: show the first-innings total as what the second team must match.
      // No "winning target" yet — the match runs over 4 innings.
      targetValue = innings.totalRuns;
      targetLabel = "1st innings total";
      reqRate = ""; // no required rate for Test inn1 — match is far from over
      ctaLabel = "Start 2nd Innings";
      subheadLabel = `${innings.battingTeamName} 1st innings complete`;
      targetStripHeader = `${innings.battingTeamName} set`;
    } else {
      // Limited-overs: second team needs runs + 1 to win
      const target = innings.totalRuns + 1;
      targetValue = target;
      reqRate = (target / matchOvers).toFixed(2);
      targetLabel = "runs to win";
      ctaLabel = "Start 2nd Innings";
      subheadLabel = `${innings.battingTeamName} innings complete`;
      targetStripHeader = `${nextTeamName} need`;
    }

  } else if (completedNum === 2 && isTest) {
    // Test inn2 break: show lead/deficit
    const firstRuns = state.firstInnings?.totalRuns ?? 0;
    const secondRuns = innings.totalRuns;
    const lead = firstRuns - secondRuns; // positive = team A leads, negative = team B leads

    nextTeamName = state.userBatsFirst
      ? (state.userTeam?.name ?? "Your Team")
      : (state.opponentTeam?.name ?? "Opponent");
    nextTeamColor = state.userBatsFirst
      ? (state.userTeam?.color ?? "#22c55e")
      : (state.opponentTeam?.color ?? "#22c55e");
    targetValue = Math.abs(lead);
    targetLabel = lead > 0 ? "run lead" : lead < 0 ? "run deficit" : "runs all square";
    reqRate = "";
    ctaLabel = "Start 3rd Innings";
    subheadLabel = `${innings.battingTeamName} innings complete`;
    targetStripHeader = nextTeamName;

  } else if (completedNum === 3 && isTest) {
    nextTeamName = state.userBatsFirst
      ? (state.opponentTeam?.name ?? "Opponent")
      : (state.userTeam?.name ?? "Your Team");
    nextTeamColor = state.userBatsFirst
      ? (state.opponentTeam?.color ?? "#22c55e")
      : (state.userTeam?.color ?? "#22c55e");
    subheadLabel = `${innings.battingTeamName} innings complete`;

    if (isInningsWin) {
      // Innings victory — team B's single innings > team A's combined
      targetValue = inningsWinMargin;
      targetLabel = "innings and runs";
      ctaLabel = "View Final Scorecard";
      targetStripHeader = inn2BattingTeamName;
    } else {
      // Normal: team B chases a target in inn4
      targetValue = inn4Target;
      reqRate = (inn4Target / matchOvers).toFixed(2);
      targetLabel = "runs to win";
      ctaLabel = "Start 4th Innings";
      targetStripHeader = `${nextTeamName} need`;
    }
  }

  const handleStart = () => {
    if (isInningsWin) {
      // No 4th innings — innings win settled the match
      dispatch({ type: "END_MATCH" });
      return;
    }
    if (completedNum === 1) {
      dispatch({ type: "START_SECOND_INNINGS" });
    } else if (completedNum === 2) {
      dispatch({ type: "START_THIRD_INNINGS" });
    } else {
      dispatch({ type: "START_FOURTH_INNINGS" });
    }
    dispatch({ type: "START_INNINGS" });
  };

  // Innings win uses a gold accent color
  const cardColor = isInningsWin ? "#f59e0b" : nextTeamColor;

  return (
    <div
      className="min-h-screen text-white flex flex-col items-center justify-center px-4 py-8 gap-6"
      style={{ background: "linear-gradient(160deg, #050e18 0%, #0a0a0a 50%, #050e18 100%)" }}
    >
      {/* Innings break label */}
      <div className="text-center" style={{ animation: "fadeInUp 0.35s ease" }}>
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] mb-2">
          {isInningsWin ? "Innings Victory" : "Innings Break"}
        </p>
        <p className="text-gray-400 text-sm">{subheadLabel}</p>
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

      {/* Target / lead / innings-win card */}
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          border: `1.5px solid ${cardColor}50`,
          boxShadow: `0 0 40px ${cardColor}18`,
          animation: "popIn 0.55s ease",
        }}
      >
        {/* Top strip */}
        <div
          className="py-3 px-5 text-center"
          style={{ background: `linear-gradient(90deg, ${cardColor}30, ${cardColor}18, transparent)` }}
        >
          <p className="text-[10px] uppercase tracking-widest text-gray-400">
            {targetStripHeader}
          </p>
        </div>

        {/* Main content */}
        <div className="px-6 py-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="text-center">
            <span
              className="text-7xl font-black tabular-nums"
              style={{ color: cardColor }}
            >
              {targetValue}
            </span>
            <p className="text-gray-400 text-sm mt-1">{targetLabel}</p>
          </div>

          {/* Stats row — limited-overs inn1 break OR Test inn3 normal chase */}
          {(!isTest && completedNum === 1) && (
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
          )}

          {/* Test inn3 — normal chase stats (no over limit) */}
          {completedNum === 3 && isTest && !isInningsWin && (
            <div
              className="flex justify-around pt-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="text-center">
                <p className="text-[9px] text-gray-600 uppercase tracking-wider">Per Day</p>
                <p className="text-xl font-bold text-white">90 ov</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-gray-600 uppercase tracking-wider">Req Rate /day</p>
                <p
                  className="text-xl font-bold"
                  style={{ color: parseFloat(reqRate) > 10 ? "#f87171" : parseFloat(reqRate) > 8 ? "#fbbf24" : "#34d399" }}
                >
                  {reqRate}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-gray-600 uppercase tracking-wider">No Limit</p>
                <p className="text-xl font-bold text-white">∞</p>
              </div>
            </div>
          )}

          {/* Test inn2: side-by-side scores */}
          {completedNum === 2 && isTest && (
            <div
              className="flex justify-around pt-3 text-center"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div>
                <p className="text-[9px] text-gray-600 uppercase tracking-wider">{state.firstInnings?.battingTeamName}</p>
                <p className="text-lg font-bold text-white tabular-nums">
                  {state.firstInnings?.totalRuns}/{state.firstInnings?.totalWickets}
                </p>
              </div>
              <div className="text-gray-600 self-center text-sm">vs</div>
              <div>
                <p className="text-[9px] text-gray-600 uppercase tracking-wider">{innings.battingTeamName}</p>
                <p className="text-lg font-bold text-white tabular-nums">
                  {innings.totalRuns}/{innings.totalWickets}
                </p>
              </div>
            </div>
          )}

          {/* Innings win — show combined scores summary */}
          {isInningsWin && (
            <div
              className="flex justify-around pt-3 text-center"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div>
                <p className="text-[9px] text-gray-600 uppercase tracking-wider">{state.secondInnings?.battingTeamName}</p>
                <p className="text-lg font-bold tabular-nums" style={{ color: "#f59e0b" }}>
                  {state.secondInnings?.totalRuns}/{state.secondInnings?.totalWickets}
                </p>
              </div>
              <div className="text-gray-600 self-center text-xs">vs</div>
              <div>
                <p className="text-[9px] text-gray-600 uppercase tracking-wider">{state.firstInnings?.battingTeamName} (combined)</p>
                <p className="text-lg font-bold text-white tabular-nums">
                  {(state.firstInnings?.totalRuns ?? 0) + (state.thirdInnings?.totalRuns ?? 0)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleStart}
        className="w-full max-w-sm py-4 rounded-xl text-lg font-black tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: `linear-gradient(135deg, ${cardColor}cc, ${cardColor}99)`,
          boxShadow: `0 6px 24px ${cardColor}28`,
          animation: "fadeInUp 0.6s ease",
        }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
