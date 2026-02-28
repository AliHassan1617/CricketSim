import { BattingIntent, BowlerLine } from "../types/enums";

// ── Lobby messages (bidirectional, used during team / squad selection) ─────────
export type LobbyMsg =
  | { t: "LOBBY_TEAM_UPDATE"; teamId: string }   // live browse update (other player sees it)
  | { t: "LOBBY_TEAM_LOCK";   teamId: string }   // player has confirmed their team
  | { t: "LOBBY_XI_LOCK";     xi: string[] }     // player has confirmed their XI
  | { t: "LOBBY_READY" };                        // host → guest: match is starting now

// ── Host → Guest (in-match) ────────────────────────────────────────────────────
export type HostMsg =
  | { t: "MATCH_CONFIG"; guestTeamId: string; format: string; pitchType: string; stadiumName: string; guestXI: string[] }
  | { t: "TOSS"; hostBatsFirst: boolean }
  | { t: "HOST_BALL_READY" }                     // host has submitted; guest must submit within 6s
  | { t: "BALL_RESULT"; snapshot: MatchSnapshot }
  | { t: "NEED_GUEST_BOWLER"; eligible: { id: string; name: string; overs: number; runs: number }[] }
  | { t: "NEED_GUEST_NEXT_BATSMAN"; remaining: { id: string; name: string }[] }
  | { t: "MATCH_OVER"; snapshot: MatchSnapshot };

// ── Guest → Host (in-match) ────────────────────────────────────────────────────
export type GuestMsg =
  | { t: "GUEST_READY" }
  | { t: "GUEST_BALL_INPUT"; intent?: BattingIntent; line?: BowlerLine }
  | { t: "GUEST_BOWLER";       bowlerId: string }
  | { t: "GUEST_NEXT_BATSMAN"; batsmanId: string };

export type MPMsg = HostMsg | GuestMsg | LobbyMsg;

// ── Snapshot sent after every ball ────────────────────────────────────────────

export interface OverSummaryData {
  over: number;
  runs: number;
  wickets: number;
  bowlerName: string;
  balls: { outcome: string; runs: number; commentary: string }[];
}

export interface MatchSnapshot {
  inningsNum: 1 | 2;
  hostTeamName: string;
  guestTeamName: string;
  hostBatting: boolean;       // is host's team batting this innings?

  runs: number;
  wickets: number;
  totalBalls: number;
  totalOvers: number;         // integer overs completed (for detecting over changes)
  overs: string;              // formatted "3.4"
  target?: number;

  striker:    { name: string; runs: number; balls: number } | null;
  nonStriker: { name: string; runs: number; balls: number } | null;
  bowler:     { name: string; overs: string; runs: number; wickets: number } | null;

  recentCommentary: string[];
  currentOverBalls: { outcome: string; runs: number; commentary?: string }[];  // current in-progress over

  // Last ball info for celebrations
  lastOutcome: string | null;     // "W", "6", "4", ".", "1", "2", "3"
  lastBatsmanName: string | null; // for WICKET celebration
  lastBowlerName:  string | null; // for SIX celebration label

  // Populated when an over just completed (null otherwise)
  overJustCompleted: OverSummaryData | null;

  // Guest-specific selections
  guestXI: string[];
  guestBattingOrder: string[];
  needsGuestBowler: boolean;
  guestEligibleBowlers: { id: string; name: string; overs: number; runs: number }[];
  needsGuestNextBatsman: boolean;
  guestRemainingBatsmen: { id: string; name: string }[];

  // Full scorecard data for guest's rich display
  allBatsmen: {
    name: string; runs: number; balls: number; fours: number; sixes: number;
    isOut: boolean; dismissalType?: string;
    isOnStrike: boolean; isNonStrike: boolean;
    confidence: number; role: string;
  }[];
  allBowlers: {
    name: string; balls: number; runs: number; wickets: number;
    isCurrent: boolean; confidence: number;
  }[];
  fieldType: string;            // "attacking" | "balanced" | "defensive"
  extras: number;
  matchOvers: number;
  currentOverNumber: number;
  partnership: { runs: number; balls: number } | null;
  bowlerType: string;
  bowlerMaxOvers: number;
  bowlerConfidence: number;

  isMatchOver: boolean;
  matchResult?: string;
}
