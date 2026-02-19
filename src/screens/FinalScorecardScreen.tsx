import { useState } from "react";
import { useGame } from "../state/gameContext";
import { Innings, BatsmanInnings, BowlerSpell } from "../types/match";
import { Player } from "../types/player";
import { DismissalType, BallOutcome } from "../types/enums";
import { getAllPlayers } from "../state/selectors";
import { formatOvers, formatEconomy } from "../utils/format";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getPlayerName(players: Player[], id: string): string {
  return players.find((p) => p.id === id)?.shortName ?? id;
}

function getDismissalText(bat: BatsmanInnings, players: Player[]): string {
  if (!bat.isOut) return "not out";
  const bowlerName = bat.dismissedByBowlerId
    ? getPlayerName(players, bat.dismissedByBowlerId)
    : "";
  switch (bat.dismissalType) {
    case DismissalType.Bowled:    return `b ${bowlerName}`;
    case DismissalType.Caught:    return bowlerName ? `c&b ${bowlerName}` : "caught";
    case DismissalType.LBW:       return `lbw b ${bowlerName}`;
    case DismissalType.RunOut:    return "run out";
    case DismissalType.Stumped:   return bowlerName ? `st b ${bowlerName}` : "stumped";
    default:                       return "out";
  }
}

function getMatchResult(first: Innings, second: Innings): { text: string; winner: string } {
  const target = second.target ?? first.totalRuns + 1;
  const secondTeamWon = second.totalRuns >= target;

  if (secondTeamWon) {
    const wkLeft = 10 - second.totalWickets;
    return {
      text: `won by ${wkLeft} wicket${wkLeft !== 1 ? "s" : ""}`,
      winner: second.battingTeamName,
    };
  }

  const diff = first.totalRuns - second.totalRuns;
  return {
    text: `won by ${diff} run${diff !== 1 ? "s" : ""}`,
    winner: first.battingTeamName,
  };
}

// ─── Innings Scorecard Component ─────────────────────────────────────────────

interface InningsScorecardProps {
  innings: Innings;
  players: Player[];
  inningsNum: 1 | 2;
}

function InningsScorecard({ innings, players, inningsNum }: InningsScorecardProps) {
  const battedPlayers = innings.batsmen.filter((b) => b.balls > 0 || !b.isOut);
  const totalBalls = innings.totalOvers * 6 + innings.ballsInCurrentOver;
  const runRate = totalBalls > 0 ? ((innings.totalRuns / totalBalls) * 6).toFixed(2) : "0.00";
  const extras = innings.extras.wides + innings.extras.noBalls;

  return (
    <div className="space-y-5">
      {/* Innings header */}
      <div className="flex items-baseline justify-between border-b border-gray-700 pb-2">
        <div>
          <span className="text-gray-400 text-xs uppercase tracking-wider mr-2">
            {inningsNum === 1 ? "1st" : "2nd"} Innings
          </span>
          <span className="text-white font-bold text-lg">{innings.battingTeamName}</span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-white tabular-nums">
            {innings.totalRuns}/{innings.totalWickets}
          </span>
          <span className="text-gray-400 text-sm ml-2">
            ({innings.totalOvers}.{innings.ballsInCurrentOver} ov)
          </span>
          {innings.target && (
            <div className="text-xs text-yellow-400 mt-0.5">
              Target: {innings.target}
            </div>
          )}
        </div>
      </div>

      {/* Batting table */}
      <div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                <th className="text-left py-2 pr-3 font-medium">Batter</th>
                <th className="text-left py-2 pr-3 font-medium text-gray-600">How Out</th>
                <th className="text-right py-2 px-2 font-medium w-10">R</th>
                <th className="text-right py-2 px-2 font-medium w-10">B</th>
                <th className="text-right py-2 px-2 font-medium w-8">4s</th>
                <th className="text-right py-2 px-2 font-medium w-8">6s</th>
                <th className="text-right py-2 pl-2 font-medium w-14">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {battedPlayers.map((bat) => {
                const sr = bat.balls > 0
                  ? ((bat.runs / bat.balls) * 100).toFixed(1)
                  : "—";
                const isNotOut = !bat.isOut;
                const isMilestone50 = bat.runs >= 50;
                const isMilestone30 = bat.runs >= 30;

                return (
                  <tr key={bat.playerId} className={isNotOut ? "text-white" : "text-gray-400"}>
                    <td className="py-2 pr-3 font-medium whitespace-nowrap">
                      {getPlayerName(players, bat.playerId)}
                      {isNotOut && bat.balls > 0 && (
                        <span className="text-emerald-400 ml-1 text-xs">*</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-xs text-gray-500 whitespace-nowrap max-w-[140px] truncate">
                      {getDismissalText(bat, players)}
                    </td>
                    <td className={`text-right py-2 px-2 font-bold tabular-nums ${
                      isMilestone50 ? "text-yellow-400" : isMilestone30 ? "text-emerald-400" : ""
                    }`}>
                      {bat.runs}
                    </td>
                    <td className="text-right py-2 px-2 tabular-nums text-gray-400">{bat.balls}</td>
                    <td className="text-right py-2 px-2 tabular-nums text-green-500">{bat.fours}</td>
                    <td className="text-right py-2 px-2 tabular-nums text-yellow-500">{bat.sixes}</td>
                    <td className="text-right py-2 pl-2 tabular-nums text-gray-400">{sr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Extras + Total */}
        <div className="border-t border-gray-700 mt-2 pt-2 space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Extras</span>
            <span>
              {extras}{" "}
              <span className="text-gray-600 text-xs">
                (wd {innings.extras.wides}, nb {innings.extras.noBalls})
              </span>
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold text-white">
            <span>Total</span>
            <span>
              {innings.totalRuns}/{innings.totalWickets}{" "}
              <span className="text-gray-400 font-normal text-xs">
                ({innings.totalOvers}.{innings.ballsInCurrentOver} ov, RR: {runRate})
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Bowling table */}
      <div>
        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">
          Bowling — {innings.bowlingTeamName}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                <th className="text-left py-2 pr-3 font-medium">Bowler</th>
                <th className="text-right py-2 px-2 font-medium w-12">O</th>
                <th className="text-right py-2 px-2 font-medium w-8">R</th>
                <th className="text-right py-2 px-2 font-medium w-8">W</th>
                <th className="text-right py-2 pl-2 font-medium w-14">Econ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {innings.bowlers.map((bowl) => {
                const totalBowlerBalls = bowl.overs * 6 + bowl.ballsInCurrentOver;
                const isBestBowler = bowl.wickets === Math.max(...innings.bowlers.map(b => b.wickets)) && bowl.wickets > 0;
                return (
                  <tr key={bowl.playerId} className="text-gray-300">
                    <td className={`py-2 pr-3 font-medium whitespace-nowrap ${isBestBowler ? "text-red-400" : ""}`}>
                      {getPlayerName(players, bowl.playerId)}
                    </td>
                    <td className="text-right py-2 px-2 tabular-nums text-gray-400">
                      {formatOvers(totalBowlerBalls)}
                    </td>
                    <td className="text-right py-2 px-2 tabular-nums">{bowl.runsConceded}</td>
                    <td className={`text-right py-2 px-2 tabular-nums font-bold ${
                      bowl.wickets >= 3 ? "text-red-400" : bowl.wickets > 0 ? "text-orange-400" : "text-gray-500"
                    }`}>
                      {bowl.wickets}
                    </td>
                    <td className="text-right py-2 pl-2 tabular-nums text-gray-400">
                      {totalBowlerBalls > 0 ? formatEconomy(bowl.runsConceded, totalBowlerBalls) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tactical Summary ────────────────────────────────────────────────────────

function buildTacticalSummary(first: Innings, second: Innings): string[] {
  const summaries: string[] = [];
  const allEvents = [...first.allEvents, ...second.allEvents];

  const attackingBoundaries = allEvents.filter(
    (e) => e.fieldType === "attacking" && (e.outcome === BallOutcome.Four || e.outcome === BallOutcome.Six)
  ).length;
  const attackingWickets = allEvents.filter(
    (e) => e.fieldType === "attacking" && e.outcome === BallOutcome.Wicket
  ).length;
  if (attackingBoundaries > 2 || attackingWickets > 0) {
    summaries.push(
      `Attacking field settings took ${attackingWickets} wicket${attackingWickets !== 1 ? "s" : ""} but conceded ${attackingBoundaries} boundaries.`
    );
  }

  const defensiveDots = allEvents.filter(
    (e) => e.fieldType === "defensive" && e.outcome === BallOutcome.Dot
  ).length;
  if (defensiveDots > 5) {
    summaries.push(`Defensive fields created ${defensiveDots} dot balls, building pressure throughout.`);
  }

  const aggressiveSixes = allEvents.filter(
    (e) => e.battingIntent === "aggressive" && e.outcome === BallOutcome.Six
  ).length;
  const aggressiveWickets = allEvents.filter(
    (e) => e.battingIntent === "aggressive" && e.outcome === BallOutcome.Wicket
  ).length;
  if (aggressiveSixes > 0 || aggressiveWickets > 0) {
    summaries.push(
      `Aggressive batting produced ${aggressiveSixes} six${aggressiveSixes !== 1 ? "es" : ""} but cost ${aggressiveWickets} wicket${aggressiveWickets !== 1 ? "s" : ""}.`
    );
  }

  // Top scorer
  const allBatsmen = [...first.batsmen, ...second.batsmen];
  const topScorer = allBatsmen.reduce((a, b) => (b.runs > a.runs ? b : a), allBatsmen[0]);
  if (topScorer && topScorer.runs >= 20) {
    summaries.push(`Player of the match candidate: top score of ${topScorer.runs} runs off ${topScorer.balls} balls.`);
  }

  // Top bowler
  const allBowlers = [...first.bowlers, ...second.bowlers];
  const topBowler = allBowlers.reduce((a, b) => (b.wickets > a.wickets ? b : a), allBowlers[0]);
  if (topBowler && topBowler.wickets >= 2) {
    const balls = topBowler.overs * 6 + topBowler.ballsInCurrentOver;
    summaries.push(`Best bowling figures: ${topBowler.wickets}/${topBowler.runsConceded} in ${formatOvers(balls)} overs.`);
  }

  if (summaries.length === 0) {
    summaries.push("A balanced contest — both teams pushed hard throughout.");
  }

  return summaries;
}

// ─── Match Result Header ──────────────────────────────────────────────────────

interface ResultHeaderProps {
  first: Innings;
  second: Innings;
}

function ResultHeader({ first, second }: ResultHeaderProps) {
  const { text, winner } = getMatchResult(first, second);
  return (
    <div className="text-center py-6 px-4 border-b border-gray-800">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Match Result</p>
      <h1 className="text-2xl font-black text-white mb-1">
        <span className="text-emerald-400">{winner}</span>
      </h1>
      <p className="text-lg font-semibold text-yellow-400">{text}</p>

      {/* Mini score summary */}
      <div className="flex justify-center gap-8 mt-4">
        <div className="text-center">
          <p className="text-xs text-gray-500">{first.battingTeamName}</p>
          <p className="text-xl font-bold text-white tabular-nums">
            {first.totalRuns}/{first.totalWickets}
          </p>
          <p className="text-xs text-gray-500">
            ({first.totalOvers}.{first.ballsInCurrentOver} ov)
          </p>
        </div>
        <div className="text-gray-600 text-2xl font-light self-center">vs</div>
        <div className="text-center">
          <p className="text-xs text-gray-500">{second.battingTeamName}</p>
          <p className="text-xl font-bold text-white tabular-nums">
            {second.totalRuns}/{second.totalWickets}
          </p>
          <p className="text-xs text-gray-500">
            ({second.totalOvers}.{second.ballsInCurrentOver} ov)
          </p>
          {second.target && (
            <p className="text-xs text-yellow-500">Target: {second.target}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function FinalScorecardScreen() {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<1 | 2>(1);

  const first = state.firstInnings;
  const second = state.secondInnings;
  const allPlayers = getAllPlayers(state);

  if (!first || !second) return null;

  const tactics = buildTacticalSummary(first, second);
  const activeInnings = activeTab === 1 ? first : second;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Result header */}
      <ResultHeader first={first} second={second} />

      {/* Innings tabs */}
      <div className="flex border-b border-gray-800 bg-gray-900/50">
        {([1, 2] as const).map((n) => {
          const inn = n === 1 ? first : second;
          return (
            <button
              key={n}
              onClick={() => setActiveTab(n)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === n
                  ? "text-emerald-400 border-b-2 border-emerald-500 bg-gray-900"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {n === 1 ? "1st" : "2nd"} Innings
              <span className="ml-2 text-xs font-normal tabular-nums text-gray-500">
                {inn.battingTeamName} {inn.totalRuns}/{inn.totalWickets}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scorecard content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <InningsScorecard
            innings={activeInnings}
            players={allPlayers}
            inningsNum={activeTab}
          />
        </div>

        {/* Tactical Summary */}
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
              Match Analysis
            </h3>
            <ul className="space-y-2">
              {tactics.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-emerald-500 mt-0.5 shrink-0">›</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* New Game button */}
        <div className="max-w-2xl mx-auto px-4 pb-8 text-center">
          <button
            onClick={() => dispatch({ type: "RESET_GAME" })}
            className="px-10 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl text-base font-bold transition-colors shadow-lg shadow-emerald-900/40"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
