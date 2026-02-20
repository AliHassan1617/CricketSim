import {
  BallOutcome,
  BattingIntent,
  BowlerLine,
  FieldType,
  PitchType,
} from "../types/enums";
import { BallEvent, BatsmanInnings, BowlerSpell, Innings } from "../types/match";
import { Player } from "../types/player";
import { randInt } from "../utils/random";
import { generateLine } from "./line";
import { computeBatScore, computeBowlScore } from "./scoring";
import { computePressure, applyPressureToBatScore } from "./pressure";
import { resolveOutcome, resolveDismissalType, applyRunningBetweenWickets } from "./outcome";

function checkWide(control: number): boolean {
  const wideChance = Math.max(1, 8 - control / 15);
  return Math.random() * 100 < wideChance;
}

function checkNoBall(): boolean {
  return Math.random() * 100 < 1.5;
}

function getSideFromLine(line: BowlerLine): string {
  switch (line) {
    case BowlerLine.OutsideOff: return "off side";
    case BowlerLine.OnStumps: return "straight";
    case BowlerLine.OnPads: return "leg side";
    case BowlerLine.Short: return "off the back foot";
    case BowlerLine.Full: return "down the ground";
  }
}

function getLineDescription(line: BowlerLine): string {
  switch (line) {
    case BowlerLine.OutsideOff: return "outside off";
    case BowlerLine.OnStumps: return "on the stumps";
    case BowlerLine.OnPads: return "on the pads";
    case BowlerLine.Short: return "short";
    case BowlerLine.Full: return "full";
  }
}

function generateCommentary(
  batsmanName: string,
  bowlerName: string,
  line: BowlerLine,
  outcome: BallOutcome,
  dismissalType?: string
): string {
  const side = getSideFromLine(line);
  const lineDesc = getLineDescription(line);

  const templates: Record<number, string[]> = {
    [BallOutcome.Dot]: [
      `${bowlerName} bowls ${lineDesc}, ${batsmanName} defends solidly. Dot ball.`,
      `Good length ${lineDesc}, ${batsmanName} watches it through. No run.`,
      `Beaten! ${bowlerName} gets one past the edge of ${batsmanName}'s bat.`,
      `Tight delivery ${lineDesc}, ${batsmanName} plays and misses.`,
      `${batsmanName} gets forward and smothers it — no room to play a shot.`,
      `Excellent line from ${bowlerName}, ${batsmanName} can only block. Dot.`,
      `${batsmanName} pushes to ${side} but the fielder swoops in. Well fielded!`,
      `${bowlerName} beats ${batsmanName} through the air! Superb delivery.`,
    ],
    [BallOutcome.Single]: [
      `Pushed to ${side} for a single. ${batsmanName} rotates strike.`,
      `Nudged ${lineDesc}, quick single taken by ${batsmanName}.`,
      `Tapped to ${side}, one run. Smart cricket from ${batsmanName}.`,
      `Worked to ${side} and they steal a quick single. Good running.`,
      `Deflected off the pad to ${side} — one run. ${batsmanName} happy to rotate.`,
      `Into the gap on ${side}, they jog a comfortable single.`,
    ],
    [BallOutcome.Double]: [
      `Worked away to ${side}, they come back for two.`,
      `${batsmanName} finds the gap on the ${side}, easy two runs.`,
      `Good running between the wickets, two taken to ${side}.`,
      `Punched to ${side}, the outfield is quick — two runs.`,
      `Squeezed through to ${side}, excellent running. Two!`,
    ],
    [BallOutcome.Three]: [
      `Played into the deep on the ${side}, excellent running — three taken!`,
      `${batsmanName} finds the gap, misfield allows three runs.`,
      `Driven hard to ${side}, they run hard — THREE!`,
      `Into the deep, great communication between the batsmen. Three runs!`,
    ],
    [BallOutcome.Four]: [
      `FOUR! ${batsmanName} drives beautifully through ${side}!`,
      `Boundary! ${bowlerName} bowls ${lineDesc} and ${batsmanName} punishes it!`,
      `FOUR! Races to the fence through ${side}. Exquisite from ${batsmanName}!`,
      `FOUR! ${batsmanName} smashes it past the fielder on the ${side}!`,
      `FOUR! Cracking shot by ${batsmanName} — ${bowlerName} can only watch!`,
      `FOUR! Threaded through the gap, the ball rockets to the boundary!`,
      `FOUR! ${batsmanName} opens the face and steers it fine on the ${side}!`,
      `FOUR! Back-foot punch through ${side} — imperious from ${batsmanName}!`,
    ],
    [BallOutcome.Six]: [
      `SIX! ${batsmanName} launches ${bowlerName} into the stands!`,
      `Maximum! Incredible power from ${batsmanName} over the ${side}!`,
      `SIX! That's gone all the way! ${batsmanName} at his destructive best!`,
      `SIX! What a shot! ${batsmanName} clears the boundary with ease!`,
      `MAXIMUM! ${bowlerName} goes for six — ${batsmanName} is in full flow!`,
      `SIX! Right out of the middle, a monster hit from ${batsmanName}!`,
      `SIX! ${batsmanName} gets underneath it and deposits it into the crowd!`,
    ],
  };

  if (outcome === BallOutcome.Wicket && dismissalType) {
    const dismissalVariants: Record<string, string[]> = {
      bowled: [
        `BOWLED! ${bowlerName} cleans up ${batsmanName}! The stumps are shattered!`,
        `BOWLED OUT! ${bowlerName} finds the gap between bat and pad — timber!`,
        `BOWLED! What a delivery from ${bowlerName}! ${batsmanName} had no answer!`,
      ],
      caught: [
        `CAUGHT! ${batsmanName} edges ${bowlerName} and it's taken! OUT!`,
        `CAUGHT! ${batsmanName} mistimes it and the fielder pouches a good catch!`,
        `CAUGHT! ${batsmanName} goes aerial once too often — taken in the deep!`,
        `OUT! ${batsmanName} feathers one through to the keeper off ${bowlerName}!`,
      ],
      lbw: [
        `LBW! ${bowlerName} traps ${batsmanName} in front! The finger goes up!`,
        `LBW! Plumb in front! ${batsmanName} is struck on the pad — out!`,
        `LBW! ${bowlerName} nips one back sharply, ${batsmanName} misses — gone!`,
      ],
      "run-out": [
        `RUN OUT! Terrible mix-up and ${batsmanName} has to go!`,
        `RUN OUT! Direct hit — brilliant fielding ends ${batsmanName}'s innings!`,
        `RUN OUT! There was nothing in that — ${batsmanName} is short of the crease!`,
      ],
      stumped: [
        `STUMPED! ${batsmanName} ventures down the track and misses! Quick glove-work!`,
        `STUMPED! ${batsmanName} is miles out — brilliant work behind the stumps!`,
        `STUMPED! ${batsmanName} is foxed by the turn, the keeper does the rest!`,
      ],
    };
    const variants = dismissalVariants[dismissalType] ?? [`OUT! ${batsmanName} is dismissed by ${bowlerName}!`];
    return variants[randInt(0, variants.length - 1)];
  }

  if (outcome === BallOutcome.Wide) {
    const wideTemplates = [
      `Wide! ${bowlerName} strays down the ${side}. One extra added.`,
      `Wide ball from ${bowlerName}! Drifting too far to the ${side}.`,
      `No ball — that's a wide from ${bowlerName}. One extra.`,
    ];
    return wideTemplates[randInt(0, wideTemplates.length - 1)];
  }
  if (outcome === BallOutcome.NoBall) {
    const nbTemplates = [
      `No ball! ${bowlerName} has overstepped. Free hit coming up!`,
      `NO BALL! Front foot infringement — free hit for ${batsmanName}!`,
      `No ball called! ${bowlerName} crosses the crease line.`,
    ];
    return nbTemplates[randInt(0, nbTemplates.length - 1)];
  }

  const pool = templates[outcome] || [`${batsmanName} plays ${bowlerName} for ${outcome} run(s).`];
  return pool[randInt(0, pool.length - 1)];
}

export function simulateBall(
  batsman: BatsmanInnings,
  bowler: BowlerSpell,
  batsmanStats: Player,
  bowlerStats: Player,
  pitchType: PitchType,
  battingIntent: BattingIntent,
  fieldType: FieldType,
  innings: Innings,
  target?: number,
  chosenLine?: BowlerLine // user-picked line overrides random generation
): BallEvent {
  const overNumber = innings.totalOvers;
  const ballNumber = innings.ballsInCurrentOver + 1;
  const totalBalls = innings.totalOvers * 6 + innings.ballsInCurrentOver;
  const totalOversInMatch = innings.matchOvers;
  const isDeathOvers = overNumber >= totalOversInMatch - 2; // last 2 overs

  // 1. Compute pressure index (always, used in scoring)
  let pressureIndex = 0;
  if (target !== undefined) {
    const pressure = computePressure(target, innings.totalRuns, totalBalls, innings.totalWickets, innings.matchOvers * 6);
    pressureIndex = pressure.totalPressure;
  }

  // 2. Check for wide
  if (checkWide(bowlerStats.bowling.control)) {
    return {
      ballNumber,
      overNumber,
      batsmanId: batsman.playerId,
      bowlerId: bowler.playerId,
      line: BowlerLine.OutsideOff,
      battingIntent,
      fieldType,
      batScore: 0,
      bowlScore: 0,
      outcome: BallOutcome.Wide,
      runsScored: 1,
      commentary: generateCommentary(batsmanStats.shortName, bowlerStats.shortName, BowlerLine.OutsideOff, BallOutcome.Wide),
      isExtra: true,
      isFreeHit: false,
    };
  }

  // 3. Check for no ball
  const isNoBall = checkNoBall();

  // 4. Generate line — user override takes priority, otherwise auto-generate
  const line = chosenLine ?? generateLine(bowlerStats.bowling.lineDiscipline, fieldType);

  // 5. Compute scores with new params
  let batScore = computeBatScore(
    batsmanStats.batting,
    bowlerStats.bowling.bowlerType,
    line,
    battingIntent,
    batsman.confidence,
    batsman.balls,
    pressureIndex
  );

  const bowlScore = computeBowlScore(
    bowlerStats.bowling,
    line,
    pitchType,
    bowler.confidence,
    pressureIndex,
    isDeathOvers
  );

  // 6. Apply pressure modifier to batScore if chasing
  if (target !== undefined) {
    const pressure = computePressure(target, innings.totalRuns, totalBalls, innings.totalWickets, innings.matchOvers * 6);
    batScore = applyPressureToBatScore(batScore, pressure, battingIntent);
  }

  // 7. Compute net and resolve outcome
  const net = batScore - bowlScore;
  let outcome = resolveOutcome(net, battingIntent, fieldType, innings.isFreeHit || isNoBall);

  // If no ball, the outcome still counts for runs but no wicket
  if (isNoBall && outcome === BallOutcome.Wicket) {
    outcome = BallOutcome.Dot;
  }

  // New batsman grace — first 4 balls have heavily suppressed dismissal risk.
  // Prevents unrealistic first-ball chain dismissals of tail-enders; golden
  // ducks can still happen but at much lower rates than unprotected probability.
  //   Ball 1 (balls=0): only 28% of wickets stand  → ~7% golden duck rate
  //   Ball 2 (balls=1): 55% of wickets stand
  //   Ball 3 (balls=2): 76% of wickets stand
  //   Ball 4 (balls=3): 90% of wickets stand
  if (outcome === BallOutcome.Wicket && !isNoBall) {
    const b = batsman.balls;
    if (b < 4) {
      const keepProb = b === 0 ? 0.28 : b === 1 ? 0.55 : b === 2 ? 0.76 : 0.90;
      if (Math.random() > keepProb) outcome = BallOutcome.Dot;
    }
  }

  // 8. Apply Running Between Wickets post-processing
  if (outcome !== BallOutcome.Wicket && outcome !== BallOutcome.Dot) {
    outcome = applyRunningBetweenWickets(outcome, batsmanStats.batting.runningBetweenWickets);
  }

  // 9. Determine dismissal type if wicket
  let dismissalType = undefined;
  if (outcome === BallOutcome.Wicket) {
    dismissalType = resolveDismissalType(
      bowlerStats.bowling.bowlerType,
      line,
      batsmanStats.batting.runningBetweenWickets
    );
  }

  // 10. Calculate runs
  let runsScored: number;
  if (outcome === BallOutcome.Wicket) {
    runsScored = 0;
  } else if (outcome === BallOutcome.Dot) {
    runsScored = 0;
  } else {
    runsScored = outcome as number;
  }

  if (isNoBall) {
    runsScored += 1;
  }

  const commentary = isNoBall
    ? generateCommentary(batsmanStats.shortName, bowlerStats.shortName, line, BallOutcome.NoBall) +
      (runsScored > 1 ? ` ${runsScored - 1} run(s) scored off it.` : "")
    : generateCommentary(batsmanStats.shortName, bowlerStats.shortName, line, outcome, dismissalType);

  return {
    ballNumber,
    overNumber,
    batsmanId: batsman.playerId,
    bowlerId: bowler.playerId,
    line,
    battingIntent,
    fieldType,
    batScore,
    bowlScore,
    outcome: isNoBall ? BallOutcome.NoBall : outcome,
    runsScored,
    dismissalType,
    commentary,
    isExtra: isNoBall,
    isFreeHit: isNoBall,
  };
}
