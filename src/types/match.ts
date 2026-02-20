import {
  BallOutcome,
  BattingIntent,
  BowlerLine,
  DismissalType,
  FieldType,
  GamePhase,
  MatchFormat,
  PitchType,
  SidebarTab,
} from "./enums";
import { Team } from "./player";
import { Stadium } from "../data/stadiums";

export interface BallEvent {
  ballNumber: number;
  overNumber: number;
  batsmanId: string;
  bowlerId: string;
  line: BowlerLine;
  battingIntent: BattingIntent;
  fieldType: FieldType;
  batScore: number;
  bowlScore: number;
  outcome: BallOutcome;
  runsScored: number;
  dismissalType?: DismissalType;
  commentary: string;
  isExtra: boolean;
  isFreeHit: boolean;
}

export interface BatsmanInnings {
  playerId: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  dots: number;
  dismissalType?: DismissalType;
  dismissedByBowlerId?: string;
  confidence: number;
  isOut: boolean;
  isOnStrike: boolean;
  hasReached30: boolean;
  hasReached50: boolean;
}

export interface BowlerSpell {
  playerId: string;
  overs: number;
  ballsInCurrentOver: number;
  runsConceded: number;
  wickets: number;
  dots: number;
  wides: number;
  noBalls: number;
  confidence: number;
  maxOvers: number;
}

export interface Innings {
  battingTeamId: string;
  bowlingTeamId: string;
  battingTeamName: string;
  bowlingTeamName: string;
  batsmen: BatsmanInnings[];
  bowlers: BowlerSpell[];
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  ballsInCurrentOver: number;
  currentOverEvents: BallEvent[];
  allEvents: BallEvent[];
  extras: { wides: number; noBalls: number };
  target?: number;
  currentBatsmanOnStrike: number;
  currentBatsmanNonStrike: number;
  currentBowlerIndex: number;
  battingOrder: string[];
  bowlerRotation: string[];     // all eligible bowlers (non-keepers from the bowling XI)
  lastOverBowlerId: string | null; // can't bowl two overs in a row
  isComplete: boolean;
  nextBatsmanIndex: number;
  isFreeHit: boolean;
  isUserBatting: boolean;
  matchOvers: number;
}

export interface MatchState {
  phase: GamePhase;
  sidebarTab: SidebarTab;
  pitchType: PitchType;
  format: MatchFormat;

  // Teams
  userTeam: Team | null;
  opponentTeam: Team | null;

  // User's tactical setup
  selectedXI: string[];       // 11 player IDs from user's 15
  battingOrder: string[];     // ordered player IDs
  bowlerIds: string[];        // 5 bowler IDs

  // Toss
  tossWinner: "user" | "opponent";
  userBatsFirst: boolean;

  // Innings
  firstInnings: Innings | null;
  secondInnings: Innings | null;
  currentInnings: 1 | 2;
  needsBowlerChange: boolean;

  // Player profile modal
  selectedPlayerId: string | null;

  // Testing / simulation mode
  isSimulating: boolean;

  // Gate: user must click "Select Starting XI" on Match screen before Tactics is usable
  tacticsUnlocked: boolean;

  // On-the-fly batting selection
  pendingBatsmanSelection: "openers" | "next" | null;

  // Selected stadium
  stadium: Stadium | null;
}
