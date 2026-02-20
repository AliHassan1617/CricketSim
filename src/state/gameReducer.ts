import { GameAction } from "./actions";
import { BallOutcome, GamePhase, MatchFormat, PitchType, SidebarTab } from "../types/enums";
import { BatsmanInnings, BowlerSpell, Innings, MatchState } from "../types/match";
import { Player, Team } from "../types/player";
import { updateBatsmanConfidence, updateBowlerConfidence } from "../engine/confidence";

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
  currentInnings: 1,
  needsBowlerChange: false,
  selectedPlayerId: null,
  isSimulating: false,
  tacticsUnlocked: false,
  pendingBatsmanSelection: null,
  stadium: null,
};

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

  const battingOrder = [...xiIds].sort((a, b) => {
    const pa = xi.find((p) => p.id === a)!;
    const pb = xi.find((p) => p.id === b)!;
    const roleOrder: Record<string, number> = {
      "wicket-keeper": 0,
      batsman: 1,
      "all-rounder": 2,
      bowler: 3,
    };
    return (roleOrder[pa.role] ?? 4) - (roleOrder[pb.role] ?? 4);
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
    maxOvers: Math.max(1, Math.round(matchOvers / 5)),
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
      const matchOvers = state.format === MatchFormat.T5 ? 5
                       : state.format === MatchFormat.T20 ? 20
                       : 10;

      if (state.currentInnings === 1) {
        let battingTeam: Team;
        let bowlingTeam: Team;
        let battingOrder: string[];
        let bowlerRotation: string[];
        let isUserBatting: boolean;

        if (state.userBatsFirst) {
          // User bats — opponent bowls
          battingTeam = state.userTeam;
          bowlingTeam = state.opponentTeam;
          battingOrder = state.battingOrder;
          const oppSetup = autoSelectTeam(state.opponentTeam);
          bowlerRotation = buildBowlerRotation(oppSetup.xi, allPlayers);
          isUserBatting = true;
        } else {
          // Opponent bats — user bowls
          battingTeam = state.opponentTeam;
          bowlingTeam = state.userTeam;
          const oppSetup = autoSelectTeam(state.opponentTeam);
          battingOrder = oppSetup.battingOrder;
          bowlerRotation = buildBowlerRotation(state.selectedXI, allPlayers);
          isUserBatting = false;
        }

        let innings = createInnings(
          battingTeam.id, bowlingTeam.id,
          battingTeam.name, bowlingTeam.name,
          isUserBatting ? [] : battingOrder,
          bowlerRotation, allPlayers,
          isUserBatting, matchOvers
        );

        // User batting: start with empty batsmen array — openers chosen live
        let pendingBatsman: "openers" | "next" | null = null;
        if (isUserBatting) {
          innings = { ...innings, batsmen: [] };
          pendingBatsman = "openers";
        }

        // If user is bowling, they must pick the opening bowler
        const needsBowlerChange = !isUserBatting;

        return {
          ...state,
          firstInnings: innings,
          phase: GamePhase.FirstInnings,
          needsBowlerChange,
          pendingBatsmanSelection: pendingBatsman,
        };

      } else {
        // Second innings — roles swap
        const target = (state.firstInnings?.totalRuns ?? 0) + 1;
        let battingTeam: Team;
        let bowlingTeam: Team;
        let battingOrder: string[];
        let bowlerRotation: string[];
        let isUserBatting: boolean;

        if (state.userBatsFirst) {
          // User batted first, now opponent bats — user bowls
          battingTeam = state.opponentTeam;
          bowlingTeam = state.userTeam;
          const oppSetup = autoSelectTeam(state.opponentTeam);
          battingOrder = oppSetup.battingOrder;
          bowlerRotation = buildBowlerRotation(state.selectedXI, allPlayers);
          isUserBatting = false;
        } else {
          // Opponent batted first, now user bats — opponent bowls
          battingTeam = state.userTeam;
          bowlingTeam = state.opponentTeam;
          battingOrder = state.battingOrder;
          const oppSetup = autoSelectTeam(state.opponentTeam);
          bowlerRotation = buildBowlerRotation(oppSetup.xi, allPlayers);
          isUserBatting = true;
        }

        let innings = createInnings(
          battingTeam.id, bowlingTeam.id,
          battingTeam.name, bowlingTeam.name,
          isUserBatting ? [] : battingOrder,
          bowlerRotation, allPlayers,
          isUserBatting, matchOvers, target
        );

        // User batting: start with empty batsmen array — openers chosen live
        let pendingBatsman: "openers" | "next" | null = null;
        if (isUserBatting) {
          innings = { ...innings, batsmen: [] };
          pendingBatsman = "openers";
        }

        // If user is bowling, they must pick the opening bowler
        const needsBowlerChange = !isUserBatting;

        return {
          ...state,
          secondInnings: innings,
          phase: GamePhase.SecondInnings,
          needsBowlerChange,
          pendingBatsmanSelection: pendingBatsman,
        };
      }
    }

    case "PROCESS_BALL_RESULT": {
      const { event } = action.payload;
      const inningsKey = state.currentInnings === 1 ? "firstInnings" : "secondInnings";
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
        newPhase = state.currentInnings === 1
          ? GamePhase.InningsSummary
          : GamePhase.FinalScorecard;
      }

      return {
        ...state,
        [inningsKey]: newInnings,
        phase: newPhase,
        needsBowlerChange: needsBowlerChange && !newInnings.isComplete,
        pendingBatsmanSelection: newInnings.isComplete ? null : pendingBatsman,
      };
    }

    case "CHANGE_BOWLER": {
      const inningsKey = state.currentInnings === 1 ? "firstInnings" : "secondInnings";
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

    case "SET_STADIUM": {
      return { ...state, stadium: action.payload.stadium, pitchType: action.payload.stadium.pitchType };
    }

    case "SELECT_OPENERS": {
      const { strikerId, nonStrikerId } = action.payload;
      const inningsKey = state.currentInnings === 1 ? "firstInnings" : "secondInnings";
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
      const inningsKey = state.currentInnings === 1 ? "firstInnings" : "secondInnings";
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

    default:
      return state;
  }
}
