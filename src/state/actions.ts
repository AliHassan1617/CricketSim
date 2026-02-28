import { BallEvent } from "../types/match";
import { Team } from "../types/player";
import { BattingIntent, FieldType, MatchFormat, PitchType, SidebarTab } from "../types/enums";
import { Stadium } from "../data/stadiums";

export type GameAction =
  | { type: "START_GAME" }
  | { type: "PICK_TEAM"; payload: { userTeam: Team; opponentTeam: Team } }
  | { type: "SET_SIDEBAR_TAB"; payload: { tab: SidebarTab } }
  | { type: "OPEN_PLAYER_PROFILE"; payload: { playerId: string } }
  | { type: "CLOSE_PLAYER_PROFILE" }
  | { type: "SET_SELECTED_XI"; payload: { playerIds: string[] } }
  | { type: "SET_BATTING_ORDER"; payload: { order: string[] } }
  | { type: "SET_BOWLERS"; payload: { bowlerIds: string[] } }
  | { type: "SET_PITCH"; payload: { pitchType: PitchType } }
  | { type: "GO_TO_TOSS" }
  | { type: "COMPLETE_TOSS"; payload: { winner: "user" | "opponent"; userBatsFirst: boolean } }
  | { type: "START_INNINGS" }
  | { type: "BOWL_BALL"; payload: { intent: BattingIntent; field: FieldType } }
  | { type: "PROCESS_BALL_RESULT"; payload: { event: BallEvent } }
  | { type: "CHANGE_BOWLER"; payload: { bowlerId: string } }
  | { type: "END_OVER" }
  | { type: "END_INNINGS" }
  | { type: "START_SECOND_INNINGS" }
  | { type: "END_MATCH" }
  | { type: "SET_SIMULATING"; payload: { value: boolean } }
  | { type: "SET_FORMAT"; payload: { format: MatchFormat } }
  | { type: "UNLOCK_TACTICS" }
  | { type: "RESET_GAME" }
  | { type: "GO_TO_EXHIBITION" }
  | { type: "GO_TO_MAIN_MENU" }
  | { type: "GO_TO_PRE_MATCH" }
  | { type: "SET_STADIUM"; payload: { stadium: Stadium } }
  | { type: "SELECT_OPENERS"; payload: { strikerId: string; nonStrikerId: string } }
  | { type: "SELECT_NEXT_BATSMAN"; payload: { batsmanId: string } }
  | { type: "GO_TO_MULTIPLAYER" }
  | { type: "GO_TO_MULTIPLAYER_GUEST" }
  | { type: "GO_TO_START" };
