import { useState } from "react";
import { useGame } from "../state/gameContext";
import { Innings, BatsmanInnings } from "../types/match";
import { Player } from "../types/player";
import { DismissalType, BallOutcome, MatchFormat } from "../types/enums";
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

function getMatchResult(
  first: Innings, second: Innings,
  third?: Innings | null,
  fourth?: Innings | null,
): { text: string; winner: string } {

  // ── Innings win (Test only, no 4th innings) ─────────────────────────────────
  // Team B's single innings (inn2) exceeds team A's combined innings (inn1+inn3).
  if (third && !fourth) {
    const teamATotal = first.totalRuns + third.totalRuns;
    const teamBSingle = second.totalRuns;
    if (teamBSingle > teamATotal) {
      const margin = teamBSingle - teamATotal;
      return {
        text: `won by an innings and ${margin} run${margin !== 1 ? "s" : ""}`,
        winner: second.battingTeamName,
      };
    }
    // Shouldn't normally reach here (would mean team A won by innings, which
    // requires team A's inn1 alone to exceed team B's inn2+inn4 — can't happen
    // when fourth is null unless match was somehow ended differently).
    const margin = teamATotal - teamBSingle;
    return {
      text: `won by an innings and ${margin} run${margin !== 1 ? "s" : ""}`,
      winner: first.battingTeamName,
    };
  }

  // ── Normal result (limited-overs or Test with 4th innings) ──────────────────
  const lastBattingInnings = fourth ?? second;
  const target = lastBattingInnings.target ?? first.totalRuns + 1;
  const chaserWon = lastBattingInnings.totalRuns >= target;

  if (chaserWon) {
    const wkLeft = 10 - lastBattingInnings.totalWickets;
    return {
      text: `won by ${wkLeft} wicket${wkLeft !== 1 ? "s" : ""}`,
      winner: lastBattingInnings.battingTeamName,
    };
  }

  // Test 4th innings: defending team wins by runs margin
  if (fourth) {
    const margin = (target - 1) - fourth.totalRuns;
    return {
      text: `won by ${margin} run${margin !== 1 ? "s" : ""}`,
      winner: first.battingTeamName,
    };
  }

  // Limited-overs: first innings team wins by runs
  const diff = first.totalRuns - second.totalRuns;
  return {
    text: `won by ${diff} run${diff !== 1 ? "s" : ""}`,
    winner: first.battingTeamName,
  };
}

// ─── Innings Scorecard Component ─────────────────────────────────────────────

const INNINGS_ORDINAL: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" };

interface InningsScorecardProps {
  innings: Innings;
  players: Player[];
  inningsNum: 1 | 2 | 3 | 4;
}

function InningsScorecard({ innings, players, inningsNum }: InningsScorecardProps) {
  const battedPlayers = innings.batsmen.filter((b) => b.balls > 0);
  const totalBalls = innings.totalOvers * 6 + innings.ballsInCurrentOver;
  const runRate = totalBalls > 0 ? ((innings.totalRuns / totalBalls) * 6).toFixed(2) : "0.00";
  const extras = innings.extras.wides + innings.extras.noBalls;

  return (
    <div className="space-y-5">
      {/* Innings header */}
      <div className="flex items-baseline justify-between border-b border-gray-700 pb-2">
        <div>
          <span className="text-gray-400 text-xs uppercase tracking-wider mr-2">
            {INNINGS_ORDINAL[inningsNum]} Innings
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
              {innings.bowlers.filter(b => b.overs > 0 || b.ballsInCurrentOver > 0).map((bowl) => {
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

// ─── MVP / Man of the Match ───────────────────────────────────────────────────

function computeMVP(
  first: Innings,
  second: Innings,
  allPlayers: Player[],
  winner: string,
  third?: Innings | null,
  fourth?: Innings | null,
): { playerInfo: Player | undefined; statLine: string; isBat: boolean } {
  const allInn = [first, second, third, fourth].filter(Boolean) as Innings[];
  // Only consider innings where the winning team batted / bowled
  const winnerBattingInnings = allInn.filter(i => i.battingTeamName === winner);
  const winnerBowlingInnings = allInn.filter(i => i.bowlingTeamName === winner);

  // Best batter from winning team
  const allBatsmen = winnerBattingInnings.flatMap(i => i.batsmen);
  const topBat = [...allBatsmen].sort((a, b) => b.runs - a.runs)[0];
  const batScore = topBat
    ? topBat.runs + topBat.sixes * 4 + topBat.fours * 2 + (!topBat.isOut ? 15 : 0)
    : 0;

  // Best bowler from winning team (they bowl in opposition batting innings)
  const allBowlers = winnerBowlingInnings.flatMap(i => i.bowlers);
  const topBowl = [...allBowlers].sort((a, b) =>
    b.wickets !== a.wickets ? b.wickets - a.wickets : a.runsConceded - b.runsConceded
  )[0];
  const bowlBalls = topBowl ? topBowl.overs * 6 + topBowl.ballsInCurrentOver : 0;
  const bowlScore = topBowl
    ? topBowl.wickets * 25 - topBowl.runsConceded * 0.5 + (bowlBalls > 0 ? 10 : 0)
    : 0;

  if (batScore >= bowlScore || !topBowl || topBowl.wickets < 2) {
    const p = topBat ? allPlayers.find(pl => pl.id === topBat.playerId) : undefined;
    const sr = topBat && topBat.balls > 0
      ? Math.round((topBat.runs / topBat.balls) * 100)
      : 0;
    return {
      playerInfo: p,
      statLine: topBat
        ? `${topBat.runs}${!topBat.isOut ? "*" : ""} (${topBat.balls} balls) · SR ${sr}`
        : "—",
      isBat: true,
    };
  } else {
    const p = allPlayers.find(pl => pl.id === topBowl.playerId);
    const econ = bowlBalls > 0
      ? ((topBowl.runsConceded / bowlBalls) * 6).toFixed(1)
      : "—";
    return {
      playerInfo: p,
      statLine: `${topBowl.wickets}/${topBowl.runsConceded} · Econ ${econ}`,
      isBat: false,
    };
  }
}

// ─── Tactical Summary ────────────────────────────────────────────────────────

function buildTacticalSummary(first: Innings, second: Innings, third?: Innings | null, fourth?: Innings | null): string[] {
  const summaries: string[] = [];
  const extra = [third, fourth].filter(Boolean) as Innings[];
  const allEvents = [...first.allEvents, ...second.allEvents, ...extra.flatMap(i => i.allEvents)];

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
  const allBatsmen2 = [...first.batsmen, ...second.batsmen, ...extra.flatMap(i => i.batsmen)];
  const topScorer = allBatsmen2.reduce((a, b) => (b.runs > a.runs ? b : a), allBatsmen2[0]);
  if (topScorer && topScorer.runs >= 20) {
    summaries.push(`Player of the match candidate: top score of ${topScorer.runs} runs off ${topScorer.balls} balls.`);
  }

  // Top bowler
  const allBowlers = [...first.bowlers, ...second.bowlers, ...extra.flatMap(i => i.bowlers)];
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
  third?: Innings | null;
  fourth?: Innings | null;
}

function ResultHeader({ first, second, third, fourth }: ResultHeaderProps) {
  const { text, winner } = getMatchResult(first, second, third, fourth);
  const isTest = !!third;

  return (
    <div className="text-center py-6 px-4 border-b border-gray-800">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Match Result</p>
      <h1 className="text-2xl font-black text-white mb-1">
        <span className="text-emerald-400">{winner}</span>
      </h1>
      <p className="text-lg font-semibold text-yellow-400">{text}</p>

      {isTest ? (
        /* Test: two-column aggregate scores */
        <div className="flex justify-center gap-6 mt-4">
          {[{ team: first.battingTeamName, inn1: first, inn2: third },
            { team: second.battingTeamName, inn1: second, inn2: fourth ?? second }]
            .map(({ team, inn1, inn2 }, i) => (
              <div key={i} className="text-center">
                <p className="text-xs text-gray-500 mb-1">{team}</p>
                <p className="text-base font-bold text-white tabular-nums">
                  {inn1.totalRuns}/{inn1.totalWickets}
                  <span className="text-gray-500 text-xs"> & </span>
                  {inn2 !== second ? `${inn2.totalRuns}/${inn2.totalWickets}` : "—"}
                </p>
              </div>
            ))}
        </div>
      ) : (
        /* Limited-overs: side-by-side single innings */
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
      )}
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function FinalScorecardScreen() {
  const { state, dispatch } = useGame();
  const isTest = state.format === MatchFormat.Test;
  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4>(1);
  const [showMOTM, setShowMOTM] = useState(true);

  const first  = state.firstInnings;
  const second = state.secondInnings;
  const third  = state.thirdInnings;
  const fourth = state.fourthInnings;
  const allPlayers = getAllPlayers(state);

  if (!first || !second) return null;

  const allInnings: { num: 1 | 2 | 3 | 4; inn: Innings }[] = [
    { num: 1, inn: first },
    { num: 2, inn: second },
    ...(third  ? [{ num: 3 as const, inn: third  }] : []),
    ...(fourth ? [{ num: 4 as const, inn: fourth }] : []),
  ];

  const { text: resultText, winner } = getMatchResult(first, second, third, fourth);
  const tactics = buildTacticalSummary(first, second, third, fourth);
  const activeInnings = allInnings.find(i => i.num === activeTab)?.inn ?? first;
  const mvp = computeMVP(first, second, allPlayers, winner, third, fourth);

  // ── MOTM splash ──────────────────────────────────────────────────────────
  if (showMOTM) {
    return (
      <div
        style={{
          position: "fixed", inset: 0,
          background: "#050a05",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "32px 24px",
          textAlign: "center",
          gap: 0,
        }}
      >
        {/* Ambient glow */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: "radial-gradient(ellipse at 50% 45%, rgba(251,191,36,0.14) 0%, transparent 68%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 340 }}>
          {/* Match result chip */}
          <div style={{
            display: "inline-block",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "#fbbf24",
            background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)",
            borderRadius: 20, padding: "4px 14px", marginBottom: 28,
          }}>
            {winner} · {resultText}
          </div>

          {/* Trophy */}
          <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 20 }}>🏅</div>

          {/* Label */}
          <p style={{
            fontSize: 10, fontWeight: 800, letterSpacing: "0.35em",
            textTransform: "uppercase", color: "rgba(251,191,36,0.6)",
            marginBottom: 10,
          }}>
            Man of the Match
          </p>

          {/* Player name */}
          <h1 style={{
            fontSize: 36, fontWeight: 900, color: "white",
            lineHeight: 1.05, letterSpacing: "-0.5px", marginBottom: 8,
          }}>
            {mvp.playerInfo?.name ?? "—"}
          </h1>

          {/* Role badge */}
          <span style={{
            display: "inline-block",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase",
            background: mvp.isBat ? "rgba(59,130,246,0.18)" : "rgba(239,68,68,0.18)",
            color: mvp.isBat ? "#93c5fd" : "#fca5a5",
            border: `1px solid ${mvp.isBat ? "rgba(59,130,246,0.35)" : "rgba(239,68,68,0.35)"}`,
            borderRadius: 20, padding: "3px 12px", marginBottom: 16,
          }}>
            {mvp.isBat ? "Batting" : "Bowling"}
          </span>

          {/* Stat line */}
          <p style={{ fontSize: 22, fontWeight: 800, color: "#fcd34d", marginBottom: 36 }}>
            {mvp.statLine}
          </p>

          {/* CTA */}
          <button
            onClick={() => setShowMOTM(false)}
            style={{
              width: "100%", padding: "16px 0",
              background: "#fbbf24", color: "#09090b",
              borderRadius: 14, fontSize: 14, fontWeight: 800,
              letterSpacing: "0.05em", border: "none",
            }}
          >
            View Full Scorecard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white flex flex-col overflow-hidden" style={{ background: "#030a04" }}>
      <img
        src="/premium_photo-1679917489673-b952cee5857a.avif"
        alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-top"
        style={{ zIndex: 0, opacity: 0.18 }}
      />
      <div className="relative flex flex-col flex-1" style={{ zIndex: 1 }}>
        {/* Result header */}
        <ResultHeader first={first} second={second} third={third} fourth={fourth} />

        {/* Innings tabs */}
        <div className="flex border-b border-gray-800 bg-gray-900/50">
          {allInnings.map(({ num, inn }) => (
            <button
              key={num}
              onClick={() => setActiveTab(num)}
              className={`flex-1 py-3 px-2 text-xs font-medium transition-colors ${
                activeTab === num
                  ? "text-emerald-400 border-b-2 border-emerald-500 bg-gray-900"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {INNINGS_ORDINAL[num]}{!isTest && " Innings"}
              <span className="block text-[10px] font-normal text-gray-500 tabular-nums">
                {inn.battingTeamName.split(" ").pop()} {inn.totalRuns}/{inn.totalWickets}
              </span>
            </button>
          ))}
        </div>

        {/* Scorecard content — swipeable */}
        <div className="flex-1 overflow-y-auto"
          onPointerDown={(e) => { (e.currentTarget as HTMLDivElement).dataset.swipeX = String(e.clientX); }}
          onPointerUp={(e) => {
            const startX = Number((e.currentTarget as HTMLDivElement).dataset.swipeX ?? 0);
            const dx = e.clientX - startX;
            if (Math.abs(dx) < 40) return;
            const tabs = allInnings.map(i => i.num) as (1|2|3|4)[];
            const cur = tabs.indexOf(activeTab);
            if (dx < 0 && cur < tabs.length - 1) setActiveTab(tabs[cur + 1]);
            else if (dx > 0 && cur > 0) setActiveTab(tabs[cur - 1]);
          }}
        >
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

          {/* Action buttons */}
          <div className="max-w-2xl mx-auto px-4 pb-8 text-center space-y-3">
            {state.worldCup?.activeFixtureId ? (
              <button
                onClick={() => dispatch({ type: "WC_RECORD_USER_RESULT" })}
                className="w-full px-10 py-3 rounded-xl text-base font-bold transition-all active:scale-[0.97]"
                style={{ background: "#fbbf24", color: "#09090b" }}
              >
                🏆 Return to Tournament
              </button>
            ) : state.series ? (() => {
              const userTeamName = first.isUserBatting ? first.battingTeamName : first.bowlingTeamName;
              const userInn = first.isUserBatting ? first : second;
              const oppInn  = first.isUserBatting ? second : first;
              const seriesWinner: "user" | "opponent" | "tie" =
                winner === userTeamName ? "user"
                : resultText.toLowerCase().includes("tie") || resultText.toLowerCase().includes("draw") ? "tie"
                : "opponent";
              const seriesResult = {
                matchNum: state.series.currentMatch,
                userRuns: userInn.totalRuns,
                userWickets: userInn.totalWickets,
                oppRuns: oppInn.totalRuns,
                oppWickets: oppInn.totalWickets,
                userOvers: `${userInn.totalOvers}.${userInn.ballsInCurrentOver}`,
                oppOvers:  `${oppInn.totalOvers}.${oppInn.ballsInCurrentOver}`,
                winner: seriesWinner,
                resultText,
              };
              return (
                <button
                  onClick={() => dispatch({ type: "SERIES_RECORD_RESULT", payload: { result: seriesResult } })}
                  className="w-full px-10 py-3 rounded-xl text-base font-bold transition-all active:scale-[0.97]"
                  style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#09090b" }}
                >
                  Back to Series →
                </button>
              );
            })() : (
              <button
                onClick={() => dispatch({ type: "GO_TO_MAIN_MENU" })}
                className="px-10 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl text-base font-bold transition-colors shadow-lg shadow-emerald-900/40"
              >
                Play Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
