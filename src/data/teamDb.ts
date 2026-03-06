import { Team } from "../types/player";
import { playerDb, BATTING_POSITIONS } from "./playerDb";

interface TeamDef {
  id: string;
  name: string;
  shortName: string;
  color: string;
  playerIds: string[];
}

/**
 * Team registry — add a new team by adding an entry here and its players in playerDb.ts.
 * Player IDs must match keys in playerDb.
 */
const TEAM_REGISTRY: TeamDef[] = [
  {
    id: "india",
    name: "India",
    shortName: "IND",
    color: "#1d4ed8",
    playerIds: ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10","t11","t12","t13","t14","t15","t16","t17","t18","t19","t20","t21","t22","t23","t24","t25","t26","t27","t28","t29","t30"],
  },
  {
    id: "pakistan",
    name: "Pakistan",
    shortName: "PAK",
    color: "#15803d",
    playerIds: ["s1","s2","s3","s4","s5","s6","s7","s8","s9","s10","s11","s12","s13","s14","s15","s16","s17","s18","s19","s20","s21","s22","s23","s24","s25","s26","s27","s28","s29","s30"],
  },
  {
    id: "england",
    name: "England",
    shortName: "ENG",
    color: "#dc143c",
    playerIds: ["e1","e2","e3","e4","e5","e6","e7","e8","e9","e10","e11","e12","e13","e14","e15","e16","e17","e18","e19","e20","e21","e22","e23","e24","e25","e26","e27","e28","e29","e30"],
  },
  {
    id: "australia",
    name: "Australia",
    shortName: "AUS",
    color: "#f59e0b",
    playerIds: ["a1","a2","a3","a4","a5","a6","a7","a8","a9","a10","a11","a12","a13","a14","a15","a16","a17","a18","a19","a20","a21","a22","a23","a24","a25","a26","a27","a28","a29","a30"],
  },
  {
    id: "southafrica",
    name: "South Africa",
    shortName: "SA",
    color: "#16a34a",
    playerIds: ["sa1","sa2","sa3","sa4","sa5","sa6","sa7","sa8","sa9","sa10","sa11","sa12","sa13","sa14","sa15","sa16","sa17","sa18","sa19","sa20","sa21","sa22","sa23","sa24","sa25","sa26","sa27","sa28","sa29","sa30"],
  },
  {
    id: "newzealand",
    name: "New Zealand",
    shortName: "NZ",
    color: "#111827",
    playerIds: ["nz1","nz2","nz3","nz4","nz5","nz6","nz7","nz8","nz9","nz10","nz11","nz12","nz13","nz14","nz15","nz16","nz17","nz18","nz19","nz20","nz21","nz22","nz23","nz24","nz25","nz26","nz27","nz28","nz29","nz30"],
  },
  {
    id: "westindies",
    name: "West Indies",
    shortName: "WI",
    color: "#7c3aed",
    playerIds: ["wi1","wi2","wi3","wi4","wi5","wi6","wi7","wi8","wi9","wi10","wi11","wi12","wi13","wi14","wi15","wi16","wi17","wi18","wi19","wi20","wi21","wi22","wi23","wi24","wi25","wi26","wi27","wi28","wi29","wi30"],
  },
  {
    id: "srilanka",
    name: "Sri Lanka",
    shortName: "SL",
    color: "#0ea5e9",
    playerIds: ["sl1","sl2","sl3","sl4","sl5","sl6","sl7","sl8","sl9","sl10","sl11","sl12","sl13","sl14","sl15","sl16","sl17","sl18","sl19","sl20","sl21","sl22","sl23","sl24","sl25","sl26","sl27","sl28","sl29","sl30"],
  },
];

function buildTeam(def: TeamDef): Team {
  return {
    id: def.id,
    name: def.name,
    shortName: def.shortName,
    color: def.color,
    players: def.playerIds
      .map(pid => {
        const p = playerDb[pid];
        if (!p) return undefined;
        return { ...p, battingPosition: BATTING_POSITIONS[pid] ?? p.battingPosition };
      })
      .filter(Boolean) as Team["players"],
  };
}

/** Returns the Team object for a given team ID, or undefined if not found. */
export function getTeam(id: string): Team | undefined {
  const def = TEAM_REGISTRY.find(t => t.id === id);
  return def ? buildTeam(def) : undefined;
}

/** Returns all registered teams as full Team objects. */
export function getAllTeams(): Team[] {
  return TEAM_REGISTRY.map(buildTeam);
}

/** Returns a random opponent team different from the given team ID. */
export function getRandomOpponent(excludeTeamId: string): Team {
  const others = TEAM_REGISTRY.filter(t => t.id !== excludeTeamId);
  const def = others[Math.floor(Math.random() * others.length)];
  return buildTeam(def);
}
