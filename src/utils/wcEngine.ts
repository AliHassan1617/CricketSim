/**
 * World Cup engine:
 *   – AI vs AI match simulator (pure, no React state)
 *   – Group fixture generator with scheduled calendar days
 *   – Standings + NRR calculator
 */
import { simulateBall } from "../engine/index";
import {
  BattingIntent, BallOutcome, FieldType, PitchType,
} from "../types/enums";
import {
  Innings, BatsmanInnings, BowlerSpell,
} from "../types/match";
import { Player, Team } from "../types/player";
import {
  WCBatsmanPerf, WCBowlerPerf,
  WCFixture, WCFixtureResult, WCGroup, WCStanding,
} from "../types/worldCup";

const PITCH = PitchType.Flat;

// ─── Innings builder ──────────────────────────────────────────────────────────

function buildAIInnings(
  battingTeam: Team,
  bowlingTeam: Team,
  allPlayers: Player[],
  overs: number,
  target?: number,
): Innings {
  const maxBowlerOvers = Math.max(1, Math.round(overs / 5));

  const posOrder: Record<string, number> = {
    opener: 0, "top-order": 1, "middle-order": 2, "lower-order": 3, tailender: 4,
  };
  const battingOrder = [...battingTeam.players]
    .sort((a, b) => (b.batting.techniqueVsPace + b.batting.power) - (a.batting.techniqueVsPace + a.batting.power))
    .slice(0, 11)
    .sort((a, b) => {
      const posDiff =
        (posOrder[a.battingPosition ?? "middle-order"] ?? 2) -
        (posOrder[b.battingPosition ?? "middle-order"] ?? 2);
      if (posDiff !== 0) return posDiff;
      return (b.batting.techniqueVsPace + b.batting.power) - (a.batting.techniqueVsPace + a.batting.power);
    })
    .map(p => p.id);

  const bowlerPool = [...bowlingTeam.players]
    .filter(p => p.bowling.mainSkill > 20)
    .sort((a, b) => b.bowling.mainSkill - a.bowling.mainSkill)
    .slice(0, 6);

  const bowlerRotation: string[] = [];
  for (let ov = 0; ov < overs; ov++) {
    bowlerRotation.push(bowlerPool[ov % bowlerPool.length].id);
  }

  const batsmen: BatsmanInnings[] = battingOrder.map(() => ({
    playerId: "",
    runs: 0, balls: 0, fours: 0, sixes: 0, dots: 0,
    confidence: 50, isOut: false, isOnStrike: false,
    hasReached30: false, hasReached50: false,
  }));
  battingOrder.forEach((id, i) => { batsmen[i].playerId = id; });

  const uniqueBowlerIds = [...new Set(bowlerRotation)];
  const bowlers: BowlerSpell[] = uniqueBowlerIds.map(id => ({
    playerId: id, overs: 0, ballsInCurrentOver: 0,
    runsConceded: 0, wickets: 0, dots: 0, wides: 0, noBalls: 0,
    confidence: 50, maxOvers: maxBowlerOvers,
  }));

  void allPlayers;
  return {
    battingTeamId: battingTeam.id,
    bowlingTeamId: bowlingTeam.id,
    battingTeamName: battingTeam.name,
    bowlingTeamName: bowlingTeam.name,
    batsmen,
    bowlers,
    totalRuns: 0, totalWickets: 0, totalOvers: 0, ballsInCurrentOver: 0,
    currentOverEvents: [], allEvents: [],
    extras: { wides: 0, noBalls: 0 },
    target,
    currentBatsmanOnStrike: 0,
    currentBatsmanNonStrike: 1,
    currentBowlerIndex: 0,
    battingOrder, bowlerRotation,
    lastOverBowlerId: null,
    isComplete: false,
    nextBatsmanIndex: 2,
    isFreeHit: false,
    isUserBatting: false,
    matchOvers: overs,
  };
}

// ─── AI decision helpers ───────────────────────────────────────────────────────

function aiIntent(
  overs: number, runs: number, wickets: number, matchOvers: number, target?: number,
): BattingIntent {
  if (target !== undefined) {
    const ballsLeft = (matchOvers - overs) * 6;
    const reqRate = ballsLeft > 0 ? ((target - runs) / ballsLeft) * 6 : 99;
    if (reqRate > 12 || (overs >= matchOvers - 2)) return BattingIntent.Aggressive;
    if (reqRate < 5 && wickets < 4) return BattingIntent.Defensive;
    return BattingIntent.Balanced;
  }
  if (overs >= matchOvers - 3) return BattingIntent.Aggressive;
  if (wickets >= 5) return BattingIntent.Defensive;
  return BattingIntent.Balanced;
}

function aiField(wickets: number, overs: number, matchOvers: number): FieldType {
  if (overs < 6) return FieldType.Attacking;
  if (wickets >= 7 || overs >= matchOvers - 3) return FieldType.Attacking;
  return FieldType.Balanced;
}

// ─── Next bowler selector ──────────────────────────────────────────────────────

function pickNextBowler(inn: Innings): number {
  const eligible = inn.bowlers
    .map((b, i) => ({ b, i }))
    .filter(({ b }) => b.overs < b.maxOvers && b.playerId !== inn.lastOverBowlerId);
  if (eligible.length === 0) {
    const any = inn.bowlers.findIndex(b => b.overs < b.maxOvers);
    return any >= 0 ? any : 0;
  }
  const next = inn.bowlerRotation[inn.totalOvers];
  const idx = eligible.findIndex(({ b }) => b.playerId === next);
  return eligible[idx >= 0 ? idx : 0].i;
}

// ─── Innings simulator ────────────────────────────────────────────────────────

interface InningsResult {
  runs: number;
  wickets: number;
  oversUsed: number;   // cricket notation decimal (e.g. 18.3)
  nrrOvers: number;    // WC_OVERS if all out, else fractional overs
  isAllOut: boolean;
  batting: WCBatsmanPerf[];
  bowling: WCBowlerPerf[];
}

function oversDecimal(overs: number, balls: number): number {
  return overs + balls / 10;
}

function simulateInnings(
  battingTeam: Team, bowlingTeam: Team, overs: number, target?: number,
): InningsResult {
  const allPlayers = [...battingTeam.players, ...bowlingTeam.players];
  let inn = buildAIInnings(battingTeam, bowlingTeam, allPlayers, overs, target);

  while (!inn.isComplete) {
    const batsmanRec    = inn.batsmen[inn.currentBatsmanOnStrike];
    const batsmanPlayer = battingTeam.players.find(p => p.id === batsmanRec.playerId);
    const bowlerRec     = inn.bowlers[inn.currentBowlerIndex];
    const bowlerPlayer  = bowlingTeam.players.find(p => p.id === bowlerRec.playerId);

    if (!batsmanPlayer || !bowlerPlayer) break;

    const intent = aiIntent(inn.totalOvers, inn.totalRuns, inn.totalWickets, overs, target);
    const field  = aiField(inn.totalWickets, inn.totalOvers, overs);

    const event = simulateBall(
      batsmanRec, bowlerRec, batsmanPlayer, bowlerPlayer,
      PITCH, intent, field, inn, target,
    );

    inn = { ...inn, allEvents: [...inn.allEvents, event] };

    const isExtra  = event.outcome === BallOutcome.Wide || event.outcome === BallOutcome.NoBall;
    const isNoBall = event.outcome === BallOutcome.NoBall;
    const isWicket = event.outcome === BallOutcome.Wicket;

    inn = { ...inn, totalRuns: inn.totalRuns + event.runsScored };
    if (event.outcome === BallOutcome.Wide) {
      inn = { ...inn, extras: { ...inn.extras, wides: inn.extras.wides + 1 } };
    } else if (isNoBall) {
      inn = { ...inn, extras: { ...inn.extras, noBalls: inn.extras.noBalls + 1 } };
    }

    inn = { ...inn, isFreeHit: isNoBall };

    if (!isExtra) {
      const batsmen = inn.batsmen.map((b, i) => {
        if (i !== inn.currentBatsmanOnStrike) return b;
        return {
          ...b,
          balls: b.balls + 1,
          runs: b.runs + (isWicket ? 0 : event.runsScored),
          fours: b.fours + (event.outcome === BallOutcome.Four ? 1 : 0),
          sixes: b.sixes + (event.outcome === BallOutcome.Six ? 1 : 0),
          dots: b.dots + (event.runsScored === 0 && !isWicket ? 1 : 0),
          isOut: isWicket,
        };
      });
      inn = { ...inn, batsmen };
    }

    const bowlers = inn.bowlers.map((b, i) => {
      if (i !== inn.currentBowlerIndex) return b;
      return {
        ...b,
        runsConceded: b.runsConceded + event.runsScored,
        wickets: b.wickets + (isWicket ? 1 : 0),
        dots: b.dots + (event.runsScored === 0 && !isWicket && !isExtra ? 1 : 0),
        wides: b.wides + (event.outcome === BallOutcome.Wide ? 1 : 0),
        noBalls: b.noBalls + (isNoBall ? 1 : 0),
      };
    });
    inn = { ...inn, bowlers };

    if (isWicket) {
      inn = { ...inn, totalWickets: inn.totalWickets + 1 };
      if (inn.totalWickets >= 10) {
        inn = { ...inn, isComplete: true };
      } else {
        inn = {
          ...inn,
          currentBatsmanOnStrike: inn.nextBatsmanIndex,
          nextBatsmanIndex: inn.nextBatsmanIndex + 1,
        };
      }
    }

    if (!isExtra && !isWicket && event.runsScored % 2 === 1) {
      inn = {
        ...inn,
        currentBatsmanOnStrike: inn.currentBatsmanNonStrike,
        currentBatsmanNonStrike: inn.currentBatsmanOnStrike,
      };
    }

    if (!isExtra) {
      inn = { ...inn, ballsInCurrentOver: inn.ballsInCurrentOver + 1 };
    }

    if (inn.ballsInCurrentOver >= 6) {
      const bowlers2 = inn.bowlers.map((b, i) =>
        i === inn.currentBowlerIndex
          ? { ...b, overs: b.overs + 1, ballsInCurrentOver: 0 }
          : b,
      );
      inn = {
        ...inn,
        totalOvers: inn.totalOvers + 1,
        ballsInCurrentOver: 0,
        bowlers: bowlers2,
        lastOverBowlerId: bowlerRec.playerId,
        currentOverEvents: [],
        currentBatsmanOnStrike: inn.currentBatsmanNonStrike,
        currentBatsmanNonStrike: inn.currentBatsmanOnStrike,
      };

      if (inn.totalOvers >= inn.matchOvers) {
        inn = { ...inn, isComplete: true };
      } else if (!inn.isComplete) {
        inn = { ...inn, currentBowlerIndex: pickNextBowler(inn) };
      }
    }

    if (inn.target !== undefined && inn.totalRuns >= inn.target) {
      inn = { ...inn, isComplete: true };
    }
  }

  const isAllOut  = inn.totalWickets >= 10;
  const oversUsed = oversDecimal(inn.totalOvers, inn.ballsInCurrentOver);
  const nrrOvers  = isAllOut ? overs : (inn.totalOvers + inn.ballsInCurrentOver / 6);

  // Extract individual performances
  const batting: WCBatsmanPerf[] = inn.batsmen
    .filter(b => b.balls > 0 || b.isOut)
    .map(b => ({
      playerId: b.playerId,
      name: battingTeam.players.find(p => p.id === b.playerId)?.shortName ?? b.playerId,
      teamId: battingTeam.id,
      runs: b.runs,
      balls: b.balls,
      notOut: !b.isOut,
    }));

  const bowling: WCBowlerPerf[] = inn.bowlers
    .filter(b => b.overs > 0 || b.ballsInCurrentOver > 0)
    .map(b => ({
      playerId: b.playerId,
      name: bowlingTeam.players.find(p => p.id === b.playerId)?.shortName ?? b.playerId,
      teamId: bowlingTeam.id,
      wickets: b.wickets,
      runs: b.runsConceded,
      oversFull: b.overs,
      ballsExtra: b.ballsInCurrentOver,
    }));

  return { runs: inn.totalRuns, wickets: inn.totalWickets, oversUsed, nrrOvers, isAllOut, batting, bowling };
}

// ─── Full match simulator ──────────────────────────────────────────────────────

export function simulateAIMatch(
  team1: Team, team2: Team, overs = 20,
): WCFixtureResult {
  const inn1 = simulateInnings(team1, team2, overs);
  const inn2 = simulateInnings(team2, team1, overs, inn1.runs + 1);

  const team2Won = inn2.runs >= inn1.runs + 1;
  return {
    winnerTeamId:    team2Won ? team2.id : team1.id,
    bat1TeamId:      team1.id,
    bat1Runs:        inn1.runs,
    bat1Wickets:     inn1.wickets,
    bat1OversUsed:   inn1.oversUsed,
    bat1NrrOvers:    inn1.nrrOvers,
    bat2TeamId:      team2.id,
    bat2Runs:        inn2.runs,
    bat2Wickets:     inn2.wickets,
    bat2OversUsed:   inn2.oversUsed,
    bat2NrrOvers:    inn2.nrrOvers,
    innings1Batting: inn1.batting,
    innings1Bowling: inn1.bowling,
    innings2Batting: inn2.batting,
    innings2Bowling: inn2.bowling,
  };
}

// ─── Fixture generators ────────────────────────────────────────────────────────

function roundRobinPairs(teams: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      pairs.push([teams[i], teams[j]]);
    }
  }
  return pairs;
}

/**
 * Generate 12 group-stage fixtures with scheduled days, interleaved A/B:
 *   Round 1: Day 1 (A), Day 2 (B) → Round 6: Day 16 (A), Day 17 (B)
 */
export function generateGroupFixtures(
  groupA: string[], groupB: string[],
): WCFixture[] {
  const pairsA = roundRobinPairs(groupA);
  const pairsB = roundRobinPairs(groupB);
  const fixtures: WCFixture[] = [];
  let id = 1;

  for (let round = 0; round < 6; round++) {
    const baseDay = round * 3 + 1;
    const [a1, a2] = pairsA[round];
    const [b1, b2] = pairsB[round];
    fixtures.push({
      id: `g${id++}`, stage: "group", group: "A",
      team1Id: a1, team2Id: a2, status: "pending", scheduledDay: baseDay,
    });
    fixtures.push({
      id: `g${id++}`, stage: "group", group: "B",
      team1Id: b1, team2Id: b2, status: "pending", scheduledDay: baseDay + 1,
    });
  }
  return fixtures;
}

/**
 * Knockout fixture stubs — team IDs filled in automatically after group stage.
 * SF1: Day 22, SF2: Day 24, Final: Day 28
 */
export function generateKnockoutStubs(): WCFixture[] {
  return [
    { id: "sf1",   stage: "sf1",   team1Id: "", team2Id: "", status: "pending", scheduledDay: 22 },
    { id: "sf2",   stage: "sf2",   team1Id: "", team2Id: "", status: "pending", scheduledDay: 24 },
    { id: "final", stage: "final", team1Id: "", team2Id: "", status: "pending", scheduledDay: 28 },
  ];
}

/** @deprecated kept for backward-compat only */
export function generateKnockoutFixtures(
  a1: string, a2: string, b1: string, b2: string,
): WCFixture[] {
  return [
    { id: "sf1",   stage: "sf1",   team1Id: a1, team2Id: b2, status: "pending", scheduledDay: 22 },
    { id: "sf2",   stage: "sf2",   team1Id: b1, team2Id: a2, status: "pending", scheduledDay: 24 },
    { id: "final", stage: "final", team1Id: "",  team2Id: "",  status: "pending", scheduledDay: 28 },
  ];
}

// ─── Standings calculator ──────────────────────────────────────────────────────

export function computeStandings(
  teamIds: string[], fixtures: WCFixture[], group?: WCGroup,
): WCStanding[] {
  const map = new Map<string, WCStanding>();
  teamIds.forEach(id => map.set(id, {
    teamId: id, played: 0, won: 0, lost: 0, points: 0,
    runsScored: 0, oversFaced: 0, runsConceded: 0, oversBowled: 0, nrr: 0,
  }));

  const relevant = fixtures.filter(f =>
    f.status === "completed" && f.result &&
    (group === undefined || f.group === group),
  );

  for (const f of relevant) {
    const r  = f.result!;
    const s1 = map.get(r.bat1TeamId);
    const s2 = map.get(r.bat2TeamId);
    if (!s1 || !s2) continue;

    s1.played++; s2.played++;
    s1.runsScored   += r.bat1Runs;
    s1.oversFaced   += r.bat1NrrOvers;
    s1.runsConceded += r.bat2Runs;
    s1.oversBowled  += r.bat2NrrOvers;

    s2.runsScored   += r.bat2Runs;
    s2.oversFaced   += r.bat2NrrOvers;
    s2.runsConceded += r.bat1Runs;
    s2.oversBowled  += r.bat1NrrOvers;

    if (r.winnerTeamId === r.bat1TeamId) {
      s1.won++; s1.points += 2; s2.lost++;
    } else {
      s2.won++; s2.points += 2; s1.lost++;
    }
  }

  const standings = [...map.values()].map(s => ({
    ...s,
    nrr: s.oversFaced > 0 && s.oversBowled > 0
      ? parseFloat(((s.runsScored / s.oversFaced) - (s.runsConceded / s.oversBowled)).toFixed(3))
      : 0,
  }));

  standings.sort((a, b) =>
    b.points !== a.points ? b.points - a.points : b.nrr - a.nrr,
  );
  return standings;
}

/** Result text e.g. "India won by 23 runs" */
export function fixtureResultText(r: WCFixtureResult, teams: Map<string, string>): string {
  const winner = teams.get(r.winnerTeamId) ?? r.winnerTeamId;
  if (r.winnerTeamId === r.bat2TeamId) {
    const wkts = 10 - r.bat2Wickets;
    return `${winner} won by ${wkts} wkt${wkts !== 1 ? "s" : ""}`;
  }
  const margin = r.bat1Runs - r.bat2Runs;
  return `${winner} won by ${margin} run${margin !== 1 ? "s" : ""}`;
}
