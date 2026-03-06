import { GameAction } from "./actions";
import { BallOutcome, GamePhase, MatchFormat, PitchType, SidebarTab } from "../types/enums";
import { BatsmanInnings, BowlerSpell, Innings, MatchState } from "../types/match";
import { Player, Team } from "../types/player";
import { updateBatsmanConfidence, updateBowlerConfidence } from "../engine/confidence";
import { getAllTeams, getTeam } from "../data/teamDb";
import { generateGroupFixtures, generateKnockoutStubs, computeStandings } from "../utils/wcEngine";
import { WCBatsmanPerf, WCBowlerPerf, WCFixture, WCFixtureResult, WCPhase, WorldCupState } from "../types/worldCup";

export const initialState: MatchState = {
  phase: GamePhase.Start,
  sidebarTab: SidebarTab.Squad,
  pitchType: PitchType.Flat,
  format: MatchFormat.T10,
  userTeam: null,
  opponentTeam: null,
  selectedXI: [],
  battingOrder: [],
  bowlerIds: [],
  tossWinner: "user",
  userBatsFirst: true,
  firstInnings: null,
  secondInnings: null,
  thirdInnings: null,
  fourthInnings: null,
  currentInnings: 1,
  needsBowlerChange: false,
  selectedPlayerId: null,
  isSimulating: false,
  tacticsUnlocked: false,
  pendingBatsmanSelection: null,
  stadium: null,
  worldCup: null,
};

/**
 * After any WC fixture completes, apply all automatic phase transitions:
 *   group → knockout (fill SF team IDs when all group games done)
 *   knockout → resolve Final team IDs (when both SFs done)
 *   → complete (when Final done)
 * Also advances currentDay to the next pending fixture's scheduled day.
 */
function applyWCTransitions(
  wc: WorldCupState,
  fixtures: WCFixture[],
): { fixtures: WCFixture[]; wcPhase: WCPhase; currentDay: number } {
  let resolved = [...fixtures];
  let wcPhase: WCPhase = wc.wcPhase;

  // Group → Knockout: fill in SF team IDs when all group games complete
  const allGroupDone = resolved.filter(f => f.stage === "group").every(f => f.status === "completed");
  if (allGroupDone && wcPhase === "group") {
    const standA = computeStandings(wc.groupA, resolved, "A");
    const standB = computeStandings(wc.groupB, resolved, "B");
    const a1 = standA[0]?.teamId ?? "";
    const a2 = standA[1]?.teamId ?? "";
    const b1 = standB[0]?.teamId ?? "";
    const b2 = standB[1]?.teamId ?? "";
    resolved = resolved.map(f => {
      if (f.id === "sf1") return { ...f, team1Id: a1, team2Id: b2 };
      if (f.id === "sf2") return { ...f, team1Id: b1, team2Id: a2 };
      return f;
    });
    wcPhase = "knockout";
  }

  // Fill in Final team IDs once both SFs are done
  const sf1r = resolved.find(f => f.id === "sf1" && f.status === "completed")?.result;
  const sf2r = resolved.find(f => f.id === "sf2" && f.status === "completed")?.result;
  if (sf1r && sf2r) {
    resolved = resolved.map(f =>
      f.id === "final" && !f.team1Id
        ? { ...f, team1Id: sf1r.winnerTeamId, team2Id: sf2r.winnerTeamId }
        : f,
    );
  }

  // Tournament complete when Final is done
  const finalDone = resolved.find(f => f.id === "final" && f.status === "completed");
  if (finalDone) wcPhase = "complete";

  // Advance currentDay to the next pending fixture's scheduled day
  const nextPending = [...resolved]
    .sort((a, b) => a.scheduledDay - b.scheduledDay)
    .find(f => f.status === "pending");
  const currentDay = nextPending?.scheduledDay ?? wc.currentDay;

  return { fixtures: resolved, wcPhase, currentDay };
}

/**
 * Auto-select XI and batting order for the computer team.
 */
function autoSelectTeam(team: Team): {
  xi: string[];
  battingOrder: string[];
} {
  const players = team.players;

  const batsmen = players.filter((p) => p.role === "batsman");
  const keepers = players.filter((p) => p.role === "wicket-keeper");
  const allRounders = players.filter((p) => p.role === "all-rounder");
  const bowlers = players.filter((p) => p.role === "bowler");

  const xi: Player[] = [];
  xi.push(...keepers.slice(0, 1));
  xi.push(...batsmen.slice(0, 4));
  xi.push(...allRounders.slice(0, 3));
  const remaining = 11 - xi.length;
  xi.push(...bowlers.slice(0, remaining));

  if (xi.length < 11) {
    const overflow = players.filter((p) => !xi.includes(p));
    xi.push(...overflow.slice(0, 11 - xi.length));
  }

  const xiIds = xi.map((p) => p.id);

  const posOrder: Record<string, number> = {
    opener: 0, "top-order": 1, "middle-order": 2, "lower-order": 3, tailender: 4,
  };
  const battingOrder = [...xiIds].sort((a, b) => {
    const pa = xi.find((p) => p.id === a)!;
    const pb = xi.find((p) => p.id === b)!;
    const posDiff =
      (posOrder[pa.battingPosition ?? "middle-order"] ?? 2) -
      (posOrder[pb.battingPosition ?? "middle-order"] ?? 2);
    if (posDiff !== 0) return posDiff;
    // Within same position group, better batting stats come first
    return (
      (pb.batting.techniqueVsPace + pb.batting.power) -
      (pa.batting.techniqueVsPace + pa.batting.power)
    );
  });

  return { xi: xiIds, battingOrder };
}

/**
 * Build the bowler rotation from a bowling XI — everyone except the keeper(s).
 * Sorted best-bowler-first so the AI opener is the strongest bowler.
 */
function buildBowlerRotation(xi: string[], allPlayers: Player[]): string[] {
  return xi
    .filter((id) => {
      const p = allPlayers.find((pl) => pl.id === id);
      return p?.role !== "wicket-keeper";
    })
    .sort((a, b) => {
      const pa = allPlayers.find((p) => p.id === a)!;
      const pb = allPlayers.find((p) => p.id === b)!;
      return (pb?.bowling.mainSkill ?? 0) - (pa?.bowling.mainSkill ?? 0);
    });
}

function createInnings(
  battingTeamId: string,
  bowlingTeamId: string,
  battingTeamName: string,
  bowlingTeamName: string,
  battingOrder: string[],
  bowlerRotation: string[],   // all eligible bowlers (non-keepers from bowling XI)
  allPlayers: Player[],
  isUserBatting: boolean,
  matchOvers: number,
  target?: number
): Innings {
  const batsmen: BatsmanInnings[] = battingOrder.map((id, index) => ({
    playerId: id,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    dots: 0,
    confidence: 50,
    isOut: false,
    isOnStrike: index === 0,
    hasReached30: false,
    hasReached50: false,
  }));

  const bowlers: BowlerSpell[] = bowlerRotation.map((id) => ({
    playerId: id,
    overs: 0,
    ballsInCurrentOver: 0,
    runsConceded: 0,
    wickets: 0,
    dots: 0,
    wides: 0,
    noBalls: 0,
    confidence: 50,
    // Test cricket: no bowler over limit — stamina is the only constraint.
    // Limited-overs: max overs = matchOvers / 5 (e.g. T20 = 4, T10 = 2, T5 = 1).
    maxOvers: matchOvers >= 90 ? matchOvers : Math.max(1, Math.round(matchOvers / 5)),
  }));

  // allPlayers is already passed in — avoid unused-var warning
  void allPlayers;

  return {
    battingTeamId,
    bowlingTeamId,
    battingTeamName,
    bowlingTeamName,
    batsmen,
    bowlers,
    totalRuns: 0,
    totalWickets: 0,
    totalOvers: 0,
    ballsInCurrentOver: 0,
    currentOverEvents: [],
    allEvents: [],
    extras: { wides: 0, noBalls: 0 },
    target,
    currentBatsmanOnStrike: 0,
    currentBatsmanNonStrike: 1,
    currentBowlerIndex: 0,
    battingOrder,
    bowlerRotation,
    lastOverBowlerId: null,
    isComplete: false,
    nextBatsmanIndex: 2,
    isFreeHit: false,
    isUserBatting,
    matchOvers,
  };
}

export function gameReducer(state: MatchState, action: GameAction): MatchState {
  switch (action.type) {
    case "PICK_TEAM": {
      return {
        ...state,
        userTeam: action.payload.userTeam,
        opponentTeam: action.payload.opponentTeam,
        phase: GamePhase.MatchSetup,
        sidebarTab: SidebarTab.Squad,
      };
    }

    case "SET_SIDEBAR_TAB": {
      return { ...state, sidebarTab: action.payload.tab };
    }

    case "OPEN_PLAYER_PROFILE": {
      return { ...state, selectedPlayerId: action.payload.playerId };
    }

    case "CLOSE_PLAYER_PROFILE": {
      return { ...state, selectedPlayerId: null };
    }

    case "SET_SELECTED_XI": {
      return { ...state, selectedXI: action.payload.playerIds };
    }

    case "SET_BATTING_ORDER": {
      return { ...state, battingOrder: action.payload.order };
    }

    case "SET_BOWLERS": {
      // Kept for backward-compat but no longer used (free bowling rotation)
      return { ...state, bowlerIds: action.payload.bowlerIds };
    }

    case "SET_PITCH": {
      return { ...state, pitchType: action.payload.pitchType };
    }

    case "GO_TO_TOSS": {
      return { ...state, phase: GamePhase.Toss };
    }

    case "COMPLETE_TOSS": {
      return {
        ...state,
        tossWinner: action.payload.winner,
        userBatsFirst: action.payload.userBatsFirst,
      };
    }

    case "START_INNINGS": {
      if (!state.userTeam || !state.opponentTeam) return state;

      const allPlayers = [...state.userTeam.players, ...state.opponentTeam.players];
      // Test: 450 = 5 days × 90 overs — no hard cap; innings end by wickets only.
      // The 450 value propagates into isTest detection (>= 90) and bowler maxOvers.
      const matchOvers = state.format === MatchFormat.T5   ? 5
                       : state.format === MatchFormat.T20  ? 20
                       : state.format === MatchFormat.ODI  ? 50
                       : state.format === MatchFormat.Test ? 450
                       : 10; // T10 default

      // Helper: build innings for "team A" (bats in innings 1 & 3)
      // userBatsFirst → user is team A; otherwise opponent is team A
      const buildInnings = (inningsNum: 1 | 2 | 3 | 4, target?: number) => {
        const teamABats = inningsNum === 1 || inningsNum === 3;
        let battingTeam: Team;
        let bowlingTeam: Team;
        let battingOrder: string[];
        let bowlerRotation: string[];
        let isUserBatting: boolean;

        if (state.userBatsFirst ? teamABats : !teamABats) {
          // User bats
          battingTeam = state.userTeam!;
          bowlingTeam = state.opponentTeam!;
          battingOrder = state.battingOrder;
          const oppSetup = autoSelectTeam(state.opponentTeam!);
          bowlerRotation = buildBowlerRotation(oppSetup.xi, allPlayers);
          isUserBatting = true;
        } else {
          // Opponent bats
          battingTeam = state.opponentTeam!;
          bowlingTeam = state.userTeam!;
          const oppSetup = autoSelectTeam(state.opponentTeam!);
          battingOrder = oppSetup.battingOrder;
          bowlerRotation = buildBowlerRotation(state.selectedXI, allPlayers);
          isUserBatting = false;
        }

        let innings = createInnings(
          battingTeam.id, bowlingTeam.id,
          battingTeam.name, bowlingTeam.name,
          isUserBatting ? [] : battingOrder,
          bowlerRotation, allPlayers,
          isUserBatting, matchOvers, target
        );

        if (isUserBatting) {
          innings = { ...innings, batsmen: [] };
        }

        const pendingBatsman: "openers" | "next" | null = isUserBatting ? "openers" : null;
        const needsBowlerChange = !isUserBatting;
        return { innings, pendingBatsman, needsBowlerChange };
      };

      if (state.currentInnings === 1) {
        const { innings, pendingBatsman, needsBowlerChange } = buildInnings(1);
        return {
          ...state,
          firstInnings: innings,
          phase: GamePhase.FirstInnings,
          needsBowlerChange,
          pendingBatsmanSelection: pendingBatsman,
        };

      } else if (state.currentInnings === 2) {
        // Test: innings 2 has NO target — both teams just bat until all out.
        // Only innings 4 has a target (combined total of team A's two innings).
        const target = state.format !== MatchFormat.Test
          ? (state.firstInnings?.totalRuns ?? 0) + 1
          : undefined;
        const { innings, pendingBatsman, needsBowlerChange } = buildInnings(2, target);
        return {
          ...state,
          secondInnings: innings,
          phase: GamePhase.SecondInnings,
          needsBowlerChange,
          pendingBatsmanSelection: pendingBatsman,
        };

      } else if (state.currentInnings === 3) {
        // 3rd innings (Test only) — team A bats again, no target
        const { innings, pendingBatsman, needsBowlerChange } = buildInnings(3);
        return {
          ...state,
          thirdInnings: innings,
          phase: GamePhase.ThirdInnings,
          needsBowlerChange,
          pendingBatsmanSelection: pendingBatsman,
        };

      } else {
        // 4th innings (Test only) — team B chases combined target
        const teamATotal = (state.firstInnings?.totalRuns ?? 0) + (state.thirdInnings?.totalRuns ?? 0);
        const teamBFirst  = state.secondInnings?.totalRuns ?? 0;
        const target = teamATotal - teamBFirst + 1;
        const { innings, pendingBatsman, needsBowlerChange } = buildInnings(4, target);
        return {
          ...state,
          fourthInnings: innings,
          phase: GamePhase.FourthInnings,
          needsBowlerChange,
          pendingBatsmanSelection: pendingBatsman,
        };
      }
    }

    case "PROCESS_BALL_RESULT": {
      const { event } = action.payload;
      const inningsKey = state.currentInnings === 1 ? "firstInnings"
                       : state.currentInnings === 2 ? "secondInnings"
                       : state.currentInnings === 3 ? "thirdInnings"
                       : "fourthInnings";
      const innings = state[inningsKey];
      if (!innings) return state;

      const newInnings = { ...innings };
      newInnings.allEvents = [...innings.allEvents, event];
      newInnings.currentOverEvents = [...innings.currentOverEvents, event];

      // Update total runs
      newInnings.totalRuns = innings.totalRuns + event.runsScored;

      // Handle extras
      if (event.outcome === BallOutcome.Wide) {
        newInnings.extras = { ...innings.extras, wides: innings.extras.wides + 1 };
        const bowlerIdx = innings.bowlers.findIndex((b) => b.playerId === event.bowlerId);
        if (bowlerIdx >= 0) {
          const bowlers = [...innings.bowlers];
          bowlers[bowlerIdx] = {
            ...bowlers[bowlerIdx],
            wides: bowlers[bowlerIdx].wides + 1,
            runsConceded: bowlers[bowlerIdx].runsConceded + event.runsScored,
          };
          newInnings.bowlers = bowlers;
        }
        newInnings.isFreeHit = false;
        return { ...state, [inningsKey]: newInnings };
      }

      if (event.outcome === BallOutcome.NoBall) {
        newInnings.extras = { ...innings.extras, noBalls: innings.extras.noBalls + 1 };
        const bowlerIdx = innings.bowlers.findIndex((b) => b.playerId === event.bowlerId);
        if (bowlerIdx >= 0) {
          const bowlers = [...innings.bowlers];
          bowlers[bowlerIdx] = {
            ...bowlers[bowlerIdx],
            noBalls: bowlers[bowlerIdx].noBalls + 1,
            runsConceded: bowlers[bowlerIdx].runsConceded + event.runsScored,
          };
          newInnings.bowlers = bowlers;
        }
        newInnings.isFreeHit = true;
        const batsmanIdx = innings.batsmen.findIndex((b) => b.playerId === event.batsmanId);
        if (batsmanIdx >= 0 && event.runsScored > 1) {
          const batsmen = [...innings.batsmen];
          const runsFromBat = event.runsScored - 1;
          batsmen[batsmanIdx] = {
            ...batsmen[batsmanIdx],
            runs: batsmen[batsmanIdx].runs + runsFromBat,
            ...(runsFromBat === 4 ? { fours: batsmen[batsmanIdx].fours + 1 } : {}),
            ...(runsFromBat === 6 ? { sixes: batsmen[batsmanIdx].sixes + 1 } : {}),
          };
          newInnings.batsmen = batsmen;
          if (runsFromBat % 2 === 1) {
            const temp = newInnings.currentBatsmanOnStrike;
            newInnings.currentBatsmanOnStrike = newInnings.currentBatsmanNonStrike;
            newInnings.currentBatsmanNonStrike = temp;
          }
        }
        return { ...state, [inningsKey]: newInnings };
      }

      // Legal delivery
      newInnings.ballsInCurrentOver = innings.ballsInCurrentOver + 1;
      newInnings.isFreeHit = false;

      // Update batsman
      const batsmanIdx = innings.batsmen.findIndex((b) => b.playerId === event.batsmanId);
      if (batsmanIdx >= 0) {
        const batsmen = [...innings.batsmen];
        const batter = { ...batsmen[batsmanIdx] };
        batter.balls += 1;

        if (event.outcome === BallOutcome.Wicket) {
          batter.isOut = true;
          batter.dismissalType = event.dismissalType;
          batter.dismissedByBowlerId = event.bowlerId;
          newInnings.totalWickets = innings.totalWickets + 1;
        } else {
          batter.runs += event.runsScored;
          if (event.outcome === BallOutcome.Dot) batter.dots += 1;
          if (event.outcome === BallOutcome.Four) batter.fours += 1;
          if (event.outcome === BallOutcome.Six) batter.sixes += 1;

          const confResult = updateBatsmanConfidence(
            batter.confidence,
            event.outcome,
            batter.runs,
            batter.hasReached30,
            batter.hasReached50
          );
          batter.confidence = confResult.confidence;
          batter.hasReached30 = confResult.newReached30;
          batter.hasReached50 = confResult.newReached50;
        }

        batsmen[batsmanIdx] = batter;
        newInnings.batsmen = batsmen;
      }

      // Update bowler
      const bowlerIdx = innings.bowlers.findIndex((b) => b.playerId === event.bowlerId);
      if (bowlerIdx >= 0) {
        const bowlers = [...innings.bowlers];
        const bowler = { ...bowlers[bowlerIdx] };
        bowler.runsConceded += event.runsScored;
        bowler.ballsInCurrentOver += 1;
        if (event.outcome === BallOutcome.Dot) bowler.dots += 1;
        if (event.outcome === BallOutcome.Wicket) bowler.wickets += 1;
        bowler.confidence = updateBowlerConfidence(bowler.confidence, event.outcome);
        bowlers[bowlerIdx] = bowler;
        newInnings.bowlers = bowlers;
      }

      // Rotate strike on odd runs
      if (event.outcome !== BallOutcome.Wicket && event.runsScored % 2 === 1) {
        const temp = newInnings.currentBatsmanOnStrike;
        newInnings.currentBatsmanOnStrike = newInnings.currentBatsmanNonStrike;
        newInnings.currentBatsmanNonStrike = temp;
      }

      // Handle wicket — next batsman comes in
      let pendingBatsman: "openers" | "next" | null = state.pendingBatsmanSelection;
      if (event.outcome === BallOutcome.Wicket) {
        if (innings.isUserBatting) {
          // User batting: dynamically prompt for next batsman
          const remaining = state.selectedXI.filter(
            id => !newInnings.battingOrder.includes(id)
          );
          if (newInnings.totalWickets < 10 && remaining.length > 0) {
            newInnings.currentBatsmanOnStrike = newInnings.nextBatsmanIndex;
            newInnings.nextBatsmanIndex += 1;
            pendingBatsman = "next";
          } else {
            newInnings.isComplete = true;
          }
        } else {
          if (newInnings.totalWickets >= 10 || newInnings.nextBatsmanIndex >= innings.battingOrder.length) {
            newInnings.isComplete = true;
          } else {
            newInnings.currentBatsmanOnStrike = newInnings.nextBatsmanIndex;
            newInnings.nextBatsmanIndex += 1;
          }
        }
      }

      // Check end of over
      let needsBowlerChange = false;
      if (newInnings.ballsInCurrentOver >= 6) {
        const bowlers = [...newInnings.bowlers];
        const bIdx = bowlers.findIndex((b) => b.playerId === event.bowlerId);
        if (bIdx >= 0) {
          bowlers[bIdx] = {
            ...bowlers[bIdx],
            overs: bowlers[bIdx].overs + 1,
            ballsInCurrentOver: 0,
          };
        }
        newInnings.bowlers = bowlers;
        newInnings.totalOvers = innings.totalOvers + 1;
        newInnings.ballsInCurrentOver = 0;
        newInnings.currentOverEvents = [];

        // Record who just bowled this over (can't bowl the next one)
        newInnings.lastOverBowlerId = event.bowlerId;

        // Rotate strike at end of over
        const temp = newInnings.currentBatsmanOnStrike;
        newInnings.currentBatsmanOnStrike = newInnings.currentBatsmanNonStrike;
        newInnings.currentBatsmanNonStrike = temp;

        if (newInnings.totalOvers >= newInnings.matchOvers) {
          newInnings.isComplete = true;
        } else if (!newInnings.isComplete) {
          needsBowlerChange = true;
        }
      }

      // Check if target reached (2nd innings)
      if (newInnings.target && newInnings.totalRuns >= newInnings.target) {
        newInnings.isComplete = true;
      }

      // Determine next phase
      let newPhase = state.phase;
      if (newInnings.isComplete) {
        if (state.currentInnings === 4) {
          newPhase = GamePhase.FinalScorecard;
        } else if (state.currentInnings === 2 && state.format !== MatchFormat.Test) {
          newPhase = GamePhase.FinalScorecard;
        } else {
          newPhase = GamePhase.InningsSummary;
        }
      }

      return {
        ...state,
        [inningsKey]: newInnings,
        phase: newPhase,
        needsBowlerChange: needsBowlerChange && !newInnings.isComplete,
        pendingBatsmanSelection: newInnings.isComplete ? null : pendingBatsman,
        isSimulating: newInnings.isComplete ? false : state.isSimulating,
      };
    }

    case "CHANGE_BOWLER": {
      const inningsKey = state.currentInnings === 1 ? "firstInnings"
                       : state.currentInnings === 2 ? "secondInnings"
                       : state.currentInnings === 3 ? "thirdInnings"
                       : "fourthInnings";
      const innings = state[inningsKey];
      if (!innings) return state;

      const bowlerIndex = innings.bowlerRotation.indexOf(action.payload.bowlerId);
      if (bowlerIndex < 0) return state;

      return {
        ...state,
        [inningsKey]: { ...innings, currentBowlerIndex: bowlerIndex },
        needsBowlerChange: false,
      };
    }

    case "START_SECOND_INNINGS": {
      return { ...state, currentInnings: 2 };
    }

    case "START_THIRD_INNINGS": {
      return { ...state, currentInnings: 3 };
    }

    case "START_FOURTH_INNINGS": {
      return { ...state, currentInnings: 4 };
    }

    case "DECLARE_INNINGS": {
      const inningsKey = state.currentInnings === 1 ? "firstInnings"
                       : state.currentInnings === 2 ? "secondInnings"
                       : state.currentInnings === 3 ? "thirdInnings"
                       : "fourthInnings";
      const innings = state[inningsKey];
      if (!innings) return state;
      const newInnings = { ...innings, isComplete: true };
      // Same phase logic as when innings completes normally
      const newPhase = (state.currentInnings === 4 || (state.currentInnings === 2 && state.format !== MatchFormat.Test))
        ? GamePhase.FinalScorecard
        : GamePhase.InningsSummary;
      return {
        ...state,
        [inningsKey]: newInnings,
        phase: newPhase,
        needsBowlerChange: false,
        pendingBatsmanSelection: null,
        isSimulating: false,
      };
    }

    case "SET_FORMAT": {
      return { ...state, format: action.payload.format };
    }

    case "SET_SIMULATING": {
      return { ...state, isSimulating: action.payload.value };
    }

    case "UNLOCK_TACTICS": {
      return { ...state, tacticsUnlocked: true };
    }

    case "END_MATCH": {
      return { ...state, phase: GamePhase.FinalScorecard };
    }

    case "START_GAME": {
      return { ...state, phase: GamePhase.ModeSelect };
    }

    case "GO_TO_EXHIBITION": {
      return { ...state, phase: GamePhase.ExhibitionCarousel };
    }

    case "GO_TO_PRE_MATCH": {
      return { ...state, phase: GamePhase.PreMatch, sidebarTab: SidebarTab.Tactics };
    }

    case "GO_TO_MAIN_MENU": {
      return { ...initialState, phase: GamePhase.ModeSelect };
    }

    case "GO_TO_START": {
      return { ...initialState, phase: GamePhase.Start };
    }

    case "GO_TO_MULTIPLAYER": {
      return { ...initialState, phase: GamePhase.MultiplayerLobby };
    }

    case "GO_TO_MULTIPLAYER_GUEST": {
      return { ...state, phase: GamePhase.MultiplayerGuest };
    }

    case "SET_STADIUM": {
      return { ...state, stadium: action.payload.stadium, pitchType: action.payload.stadium.pitchType };
    }

    case "SELECT_OPENERS": {
      const { strikerId, nonStrikerId } = action.payload;
      const inningsKey = state.currentInnings === 1 ? "firstInnings"
                       : state.currentInnings === 2 ? "secondInnings"
                       : state.currentInnings === 3 ? "thirdInnings"
                       : "fourthInnings";
      const innings = state[inningsKey];
      if (!innings) return state;

      const makeEntry = (id: string): BatsmanInnings => ({
        playerId: id, runs: 0, balls: 0, fours: 0, sixes: 0, dots: 0,
        confidence: 50, isOut: false, isOnStrike: false, hasReached30: false, hasReached50: false,
      });

      return {
        ...state,
        [inningsKey]: {
          ...innings,
          battingOrder: [strikerId, nonStrikerId],
          batsmen: [makeEntry(strikerId), makeEntry(nonStrikerId)],
          currentBatsmanOnStrike: 0,
          currentBatsmanNonStrike: 1,
          nextBatsmanIndex: 2,
        },
        pendingBatsmanSelection: null,
      };
    }

    case "SELECT_NEXT_BATSMAN": {
      const { batsmanId } = action.payload;
      const inningsKey = state.currentInnings === 1 ? "firstInnings"
                       : state.currentInnings === 2 ? "secondInnings"
                       : state.currentInnings === 3 ? "thirdInnings"
                       : "fourthInnings";
      const innings = state[inningsKey];
      if (!innings) return state;

      const makeEntry = (id: string): BatsmanInnings => ({
        playerId: id, runs: 0, balls: 0, fours: 0, sixes: 0, dots: 0,
        confidence: 50, isOut: false, isOnStrike: false, hasReached30: false, hasReached50: false,
      });

      const newBattingOrder = [...innings.battingOrder, batsmanId];
      const newBatsmen = [...innings.batsmen, makeEntry(batsmanId)];
      const newStrikeIdx = newBattingOrder.length - 1;

      return {
        ...state,
        [inningsKey]: {
          ...innings,
          battingOrder: newBattingOrder,
          batsmen: newBatsmen,
          currentBatsmanOnStrike: newStrikeIdx,
          nextBatsmanIndex: newStrikeIdx + 1,
        },
        pendingBatsmanSelection: null,
      };
    }

    case "RESET_GAME": {
      return { ...initialState };
    }

    // ── World Cup ────────────────────────────────────────────────────────────────

    case "WC_INIT": {
      return { ...initialState, phase: GamePhase.WCSetup, worldCup: null };
    }

    case "WC_SELECT_TEAM": {
      const { teamId, format } = action.payload;
      const allTeams = getAllTeams();
      const others = allTeams.filter(t => t.id !== teamId).map(t => t.id);
      for (let i = others.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [others[i], others[j]] = [others[j], others[i]];
      }
      const groupA = [teamId, ...others.slice(0, 3)];
      const groupB = others.slice(3, 7);
      const fixtures = [...generateGroupFixtures(groupA, groupB), ...generateKnockoutStubs()];
      return {
        ...initialState,
        phase: GamePhase.WCHub,
        worldCup: {
          wcPhase: "group",
          userTeamId: teamId,
          format,
          groupA, groupB,
          fixtures,
          activeFixtureId: null,
          currentDay: 1,
        },
      };
    }

    case "WC_PLAY_FIXTURE": {
      const wc = state.worldCup;
      if (!wc) return state;
      const fixture = wc.fixtures.find(f => f.id === action.payload.fixtureId);
      if (!fixture) return state;

      const userTeam = getTeam(wc.userTeamId);
      const oppId = fixture.team1Id === wc.userTeamId ? fixture.team2Id : fixture.team1Id;
      const oppTeam = getTeam(oppId);
      if (!userTeam || !oppTeam) return state;

      const wcFormat = (wc.format as MatchFormat) ?? MatchFormat.T20;
      return {
        ...initialState,
        phase: GamePhase.PreMatch,
        sidebarTab: SidebarTab.Squad,
        format: wcFormat,
        pitchType: PitchType.Flat,
        userTeam,
        opponentTeam: oppTeam,
        worldCup: { ...wc, activeFixtureId: fixture.id },
      };
    }

    case "WC_RECORD_USER_RESULT": {
      const wc = state.worldCup;
      if (!wc || !wc.activeFixtureId) return state;
      const inn1 = state.firstInnings;
      const inn2 = state.secondInnings;
      if (!inn1 || !inn2) return state;

      // Build player lookup from both teams
      const playerMap = new Map<string, { shortName: string; teamId: string }>();
      state.userTeam?.players.forEach(p => playerMap.set(p.id, { shortName: p.shortName, teamId: state.userTeam!.id }));
      state.opponentTeam?.players.forEach(p => playerMap.set(p.id, { shortName: p.shortName, teamId: state.opponentTeam!.id }));

      function extractBatting(innings: Innings): WCBatsmanPerf[] {
        return innings.batsmen
          .filter(b => b.balls > 0 || b.isOut)
          .map(b => ({
            playerId: b.playerId,
            name: playerMap.get(b.playerId)?.shortName ?? b.playerId,
            teamId: innings.battingTeamId,
            runs: b.runs,
            balls: b.balls,
            notOut: !b.isOut,
          }));
      }

      function extractBowling(innings: Innings): WCBowlerPerf[] {
        return innings.bowlers
          .filter(b => b.overs > 0 || b.ballsInCurrentOver > 0)
          .map(b => ({
            playerId: b.playerId,
            name: playerMap.get(b.playerId)?.shortName ?? b.playerId,
            teamId: innings.bowlingTeamId,
            wickets: b.wickets,
            runs: b.runsConceded,
            oversFull: b.overs,
            ballsExtra: b.ballsInCurrentOver,
          }));
      }

      const overs1   = inn1.totalOvers + inn1.ballsInCurrentOver / 6;
      const overs2   = inn2.totalOvers + inn2.ballsInCurrentOver / 6;
      const allOut1  = inn1.totalWickets >= 10;
      const allOut2  = inn2.totalWickets >= 10;
      const won2     = inn2.totalRuns >= (inn2.target ?? inn1.totalRuns + 1);

      const result: WCFixtureResult = {
        winnerTeamId:    won2 ? inn2.battingTeamId : inn1.battingTeamId,
        bat1TeamId:      inn1.battingTeamId,
        bat1Runs:        inn1.totalRuns,
        bat1Wickets:     inn1.totalWickets,
        bat1OversUsed:   inn1.totalOvers + inn1.ballsInCurrentOver / 10,
        bat1NrrOvers:    allOut1 ? 20 : overs1,
        bat2TeamId:      inn2.battingTeamId,
        bat2Runs:        inn2.totalRuns,
        bat2Wickets:     inn2.totalWickets,
        bat2OversUsed:   inn2.totalOvers + inn2.ballsInCurrentOver / 10,
        bat2NrrOvers:    (won2 && !allOut2) ? overs2 : 20,
        innings1Batting: extractBatting(inn1),
        innings1Bowling: extractBowling(inn1),
        innings2Batting: extractBatting(inn2),
        innings2Bowling: extractBowling(inn2),
      };

      const updatedFixtures = wc.fixtures.map(f =>
        f.id === wc.activeFixtureId ? { ...f, status: "completed" as const, result } : f,
      );
      const { fixtures: resolvedFixtures, wcPhase, currentDay } = applyWCTransitions(wc, updatedFixtures);

      return {
        ...initialState,
        phase: GamePhase.WCHub,
        worldCup: { ...wc, fixtures: resolvedFixtures, activeFixtureId: null, wcPhase, currentDay },
      };
    }

    case "WC_RECORD_SIM_RESULT": {
      const wc = state.worldCup;
      if (!wc) return state;
      const updatedFixtures = wc.fixtures.map(f =>
        f.id === action.payload.fixtureId
          ? { ...f, status: "completed" as const, result: action.payload.result }
          : f,
      );
      const { fixtures, wcPhase, currentDay } = applyWCTransitions(wc, updatedFixtures);
      return { ...state, worldCup: { ...wc, fixtures, wcPhase, currentDay } };
    }

    case "WC_ADVANCE_TO_KNOCKOUT": {
      // No-op — knockouts now auto-advance via applyWCTransitions
      return state;
    }

    default:
      return state;
  }
}
