export type WCGroup = "A" | "B";
export type WCStageKey = "group" | "sf1" | "sf2" | "final";

// ── Per-fixture individual performance records ────────────────────────────────

export interface WCBatsmanPerf {
  playerId: string;
  name: string;
  teamId: string;
  runs: number;
  balls: number;
  notOut: boolean;
}

export interface WCBowlerPerf {
  playerId: string;
  name: string;
  teamId: string;
  wickets: number;
  runs: number;
  oversFull: number;    // completed overs (integer)
  ballsExtra: number;   // balls in the incomplete final over (0-5)
}

// ── Fixture result ─────────────────────────────────────────────────────────────

export interface WCFixtureResult {
  winnerTeamId: string;
  /** Team that batted first */
  bat1TeamId: string;
  bat1Runs: number;
  bat1Wickets: number;
  bat1OversUsed: number;   // cricket notation decimal (e.g. 18.3 = 18 overs 3 balls)
  bat1NrrOvers: number;    // NRR denominator: matchOvers if all-out, else fractional overs
  /** Team that batted second */
  bat2TeamId: string;
  bat2Runs: number;
  bat2Wickets: number;
  bat2OversUsed: number;
  bat2NrrOvers: number;
  /** Individual performances (both innings) */
  innings1Batting: WCBatsmanPerf[];
  innings1Bowling: WCBowlerPerf[];
  innings2Batting: WCBatsmanPerf[];
  innings2Bowling: WCBowlerPerf[];
}

// ── Fixture ────────────────────────────────────────────────────────────────────

export type WCFixtureStatus = "pending" | "completed";

export interface WCFixture {
  id: string;
  stage: WCStageKey;
  group?: WCGroup;            // only set for group-stage fixtures
  team1Id: string;
  team2Id: string;
  status: WCFixtureStatus;
  scheduledDay: number;       // tournament calendar day (1-based)
  result?: WCFixtureResult;
}

// ── Standings ─────────────────────────────────────────────────────────────────

export interface WCStanding {
  teamId: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  runsScored: number;
  oversFaced: number;
  runsConceded: number;
  oversBowled: number;
  nrr: number;
}

// ── Overall state ──────────────────────────────────────────────────────────────

export type WCPhase = "setup" | "group" | "knockout" | "complete";

export interface WorldCupState {
  wcPhase: WCPhase;
  userTeamId: string;
  format: string;          // MatchFormat value — stored as string to avoid circular import
  groupA: string[];          // 4 team IDs
  groupB: string[];          // 4 team IDs
  fixtures: WCFixture[];     // 12 group + 3 knockout stubs, all pre-generated
  activeFixtureId: string | null;
  currentDay: number;        // calendar day currently in progress
}
