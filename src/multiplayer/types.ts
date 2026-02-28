import { BattingIntent, BowlerLine } from "../types/enums";

// ── Peer messages ─────────────────────────────────────────────────────────────

/** HOST → GUEST */
export type HostMsg =
  | { t: "MATCH_CONFIG"; guestTeamId: string; format: string; pitchType: string; stadiumName: string; guestXI: string[] }
  | { t: "TOSS"; hostBatsFirst: boolean }
  | { t: "HOST_BALL_READY" }                          // host has submitted; guest must now submit
  | { t: "BALL_RESULT"; snapshot: MatchSnapshot }
  | { t: "NEED_GUEST_BOWLER"; eligible: { id: string; name: string; overs: number; runs: number }[] }
  | { t: "NEED_GUEST_NEXT_BATSMAN"; remaining: { id: string; name: string }[] }
  | { t: "MATCH_OVER"; snapshot: MatchSnapshot };

/** GUEST → HOST */
export type GuestMsg =
  | { t: "GUEST_READY" }
  | { t: "GUEST_BALL_INPUT"; intent?: BattingIntent; line?: BowlerLine }
  | { t: "GUEST_BOWLER"; bowlerId: string }
  | { t: "GUEST_NEXT_BATSMAN"; batsmanId: string };

export type MPMsg = HostMsg | GuestMsg;

// ── Snapshot sent after every ball ───────────────────────────────────────────

export interface MatchSnapshot {
  inningsNum: 1 | 2;
  hostTeamName: string;
  guestTeamName: string;
  hostBatting: boolean;          // is host's team batting this innings?

  runs: number;
  wickets: number;
  totalBalls: number;
  overs: string;                 // formatted "3.4"
  target?: number;

  striker:    { name: string; runs: number; balls: number } | null;
  nonStriker: { name: string; runs: number; balls: number } | null;
  bowler:     { name: string; overs: string; runs: number; wickets: number } | null;

  recentCommentary: string[];

  // Guest-specific selections
  guestXI: string[];             // player IDs in guest's XI
  guestBattingOrder: string[];   // IDs who have batted so far
  needsGuestBowler: boolean;
  guestEligibleBowlers: { id: string; name: string; overs: number; runs: number }[];
  needsGuestNextBatsman: boolean;
  guestRemainingBatsmen: { id: string; name: string }[];

  isMatchOver: boolean;
  matchResult?: string;
}
