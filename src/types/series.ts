import { MatchFormat } from "./enums";

export interface SeriesMatchResult {
  matchNum: number;
  userRuns: number;
  userWickets: number;
  oppRuns: number;
  oppWickets: number;
  userOvers: string;
  oppOvers: string;
  winner: "user" | "opponent" | "tie";
  resultText: string; // e.g. "India won by 34 runs"
}

export interface SeriesState {
  totalMatches: 3 | 5;
  format: MatchFormat;
  userTeamId: string;
  oppTeamId: string;
  userTeamName: string;
  oppTeamName: string;
  results: SeriesMatchResult[];
  currentMatch: number; // 1-based
  userWins: number;
  oppWins: number;
}
