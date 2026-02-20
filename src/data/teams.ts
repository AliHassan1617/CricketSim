/**
 * Backward-compatibility shim.
 * All team data now lives in playerDb.ts (players) + teamDb.ts (team registry).
 * Import getAllTeams() / getTeam() / getRandomOpponent() from teamDb for new code.
 */
export { getAllTeams, getTeam, getRandomOpponent } from "./teamDb";

import { getTeam, getAllTeams } from "./teamDb";

// Named exports kept for any legacy imports
export const thunderbolts = getTeam("india")!;
export const stormRiders  = getTeam("pakistan")!;
export const allTeams     = getAllTeams();
