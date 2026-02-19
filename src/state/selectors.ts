import { Innings, BatsmanInnings, BowlerSpell, MatchState } from "../types/match";
import { Player } from "../types/player";

export function getActiveInnings(state: MatchState): Innings | null {
  return state.currentInnings === 1 ? state.firstInnings : state.secondInnings;
}

export function getCurrentBatsmanOnStrike(innings: Innings): BatsmanInnings | null {
  const id = innings.battingOrder[innings.currentBatsmanOnStrike];
  return innings.batsmen.find((b) => b.playerId === id) || null;
}

export function getCurrentBatsmanNonStrike(innings: Innings): BatsmanInnings | null {
  const id = innings.battingOrder[innings.currentBatsmanNonStrike];
  return innings.batsmen.find((b) => b.playerId === id) || null;
}

export function getCurrentBowler(innings: Innings): BowlerSpell | null {
  const id = innings.bowlerRotation[innings.currentBowlerIndex];
  return innings.bowlers.find((b) => b.playerId === id) || null;
}

export function getRunRate(innings: Innings): number {
  const totalBalls = innings.totalOvers * 6 + innings.ballsInCurrentOver;
  if (totalBalls === 0) return 0;
  return (innings.totalRuns / totalBalls) * 6;
}

export function getRequiredRate(innings: Innings): number | null {
  if (innings.target === undefined) return null;
  const totalBalls = innings.totalOvers * 6 + innings.ballsInCurrentOver;
  const remainingBalls = 60 - totalBalls;
  if (remainingBalls <= 0) return null;
  const required = innings.target - innings.totalRuns;
  return (required / remainingBalls) * 6;
}

export function getAvailableBowlers(innings: Innings): BowlerSpell[] {
  // Exclude: bowler who just bowled the last over + anyone who hit maxOvers
  const available = innings.bowlers.filter((b) => {
    if (b.overs >= b.maxOvers) return false;
    if (innings.lastOverBowlerId && b.playerId === innings.lastOverBowlerId) return false;
    return true;
  });

  // Deadlock fallback: only the last-over bowler has overs left — allow them
  if (available.length === 0) {
    return innings.bowlers.filter((b) => b.overs < b.maxOvers);
  }

  return available;
}

export function getPlayerById(state: MatchState, id: string): Player | undefined {
  const allPlayers = getAllPlayers(state);
  return allPlayers.find((p) => p.id === id);
}

export function getAllPlayers(state: MatchState): Player[] {
  const players: Player[] = [];
  if (state.userTeam) players.push(...state.userTeam.players);
  if (state.opponentTeam) players.push(...state.opponentTeam.players);
  return players;
}

export function getBattingTeamPlayers(state: MatchState): Player[] {
  const innings = getActiveInnings(state);
  if (!innings) return [];
  if (innings.isUserBatting && state.userTeam) return state.userTeam.players;
  if (!innings.isUserBatting && state.opponentTeam) return state.opponentTeam.players;
  return [];
}

export function getBowlingTeamPlayers(state: MatchState): Player[] {
  const innings = getActiveInnings(state);
  if (!innings) return [];
  if (innings.isUserBatting && state.opponentTeam) return state.opponentTeam.players;
  if (!innings.isUserBatting && state.userTeam) return state.userTeam.players;
  return [];
}

export function getTotalBalls(innings: Innings): number {
  return innings.totalOvers * 6 + innings.ballsInCurrentOver;
}
