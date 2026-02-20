import type { Innings } from "../types/match";

export interface PlayerCareerStats {
  playerId: string;
  // Batting
  inningsBatted: number;
  runsScored: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  fifties: number;
  hundreds: number;
  highScore: number;
  timesOut: number;
  // Bowling
  ballsBowled: number;
  runsConceded: number;
  wicketsTaken: number;
  dots: number;
}

const STORAGE_KEY = "cricketSim_careerStats";

export function loadCareerStats(): Record<string, PlayerCareerStats> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, PlayerCareerStats>) : {};
  } catch {
    return {};
  }
}

export function saveCareerStats(stats: Record<string, PlayerCareerStats>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // localStorage may be unavailable — silently ignore
  }
}

export function mergeInningsIntoCareer(
  career: Record<string, PlayerCareerStats>,
  innings: Innings,
): Record<string, PlayerCareerStats> {
  const out = { ...career };

  for (const bat of innings.batsmen) {
    if (bat.balls === 0 && !bat.isOut) continue;
    const e = out[bat.playerId] ?? emptyStats(bat.playerId);
    out[bat.playerId] = {
      ...e,
      inningsBatted: e.inningsBatted + 1,
      runsScored:    e.runsScored + bat.runs,
      ballsFaced:    e.ballsFaced + bat.balls,
      fours:         e.fours + bat.fours,
      sixes:         e.sixes + bat.sixes,
      fifties:       e.fifties + (bat.runs >= 50 && bat.runs < 100 ? 1 : 0),
      hundreds:      e.hundreds + (bat.runs >= 100 ? 1 : 0),
      highScore:     Math.max(e.highScore, bat.runs),
      timesOut:      e.timesOut + (bat.isOut ? 1 : 0),
    };
  }

  for (const bowl of innings.bowlers) {
    const balls = bowl.overs * 6 + bowl.ballsInCurrentOver;
    if (balls === 0) continue;
    const e = out[bowl.playerId] ?? emptyStats(bowl.playerId);
    out[bowl.playerId] = {
      ...e,
      ballsBowled:  e.ballsBowled + balls,
      runsConceded: e.runsConceded + bowl.runsConceded,
      wicketsTaken: e.wicketsTaken + bowl.wickets,
      dots:         e.dots + bowl.dots,
    };
  }

  return out;
}

function emptyStats(playerId: string): PlayerCareerStats {
  return {
    playerId,
    inningsBatted: 0,
    runsScored:    0,
    ballsFaced:    0,
    fours:         0,
    sixes:         0,
    fifties:       0,
    hundreds:      0,
    highScore:     0,
    timesOut:      0,
    ballsBowled:   0,
    runsConceded:  0,
    wicketsTaken:  0,
    dots:          0,
  };
}
