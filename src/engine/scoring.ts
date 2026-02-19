import { BattingIntent, BowlerLine, BowlerType, PitchType } from "../types/enums";
import { BattingStats, BowlingStats } from "../types/player";
import { randInt, clamp } from "../utils/random";
import { getPitchModifiers } from "./pitch";

const AGGRESSION_MULTIPLIER = {
  [BattingIntent.Defensive]: 0.3,
  [BattingIntent.Balanced]: 0.6,
  [BattingIntent.Aggressive]: 1.0,
};

/**
 * Side skill contribution — much smaller now, acts as a modifier not the main component.
 * Returns 0-15 range for typical stats.
 */
function getSideSkill(batting: BattingStats, line: BowlerLine): number {
  switch (line) {
    case BowlerLine.OutsideOff:
      return batting.offsideSkill * 0.12;
    case BowlerLine.OnStumps:
      return (batting.offsideSkill + batting.legsideSkill) * 0.06;
    case BowlerLine.OnPads:
      return batting.legsideSkill * 0.12;
    case BowlerLine.Short:
      return ((batting.techniqueVsPace + batting.techniqueVsSpin) / 2) * 0.07 + batting.power * 0.05;
    case BowlerLine.Full:
      return ((batting.techniqueVsPace + batting.techniqueVsSpin) / 2) * 0.08 + batting.legsideSkill * 0.04;
  }
}

/**
 * BatScore formula — target range: ~30-55 for average-to-good batsmen.
 * This should be roughly comparable to BowlScore so that net is usually -15 to +15.
 */
export function computeBatScore(
  batting: BattingStats,
  bowlerType: BowlerType,
  line: BowlerLine,
  intent: BattingIntent,
  confidence: number,
  ballsFaced: number,
  pressureIndex: number
): number {
  const baseTechnique =
    bowlerType === BowlerType.Pace ? batting.techniqueVsPace : batting.techniqueVsSpin;

  const sideSkill = getSideSkill(batting, line);
  const aggressionMult = AGGRESSION_MULTIPLIER[intent];
  const powerComponent = batting.power * aggressionMult * 0.08;

  // Temperament: high temperament resists pressure
  const temperamentBonus = batting.temperament * (1 - pressureIndex / 100) * 0.06;

  // Acceleration: gets better as innings progresses (up to 30 balls)
  const accFactor = clamp(ballsFaced / 30, 0, 1);
  const accelerationBonus = batting.acceleration * accFactor * 0.05;

  const confidenceBonus = (confidence - 50) * 0.15;
  const randomVariance = randInt(-8, 8);

  // Raised from 0.25 → 0.30 so tail-enders (tech ~30) reach net ~-20
  // instead of net ~-30, giving them a fighting chance to score some runs.
  return (
    baseTechnique * 0.30 +
    sideSkill +
    powerComponent +
    temperamentBonus +
    accelerationBonus +
    confidenceBonus +
    randomVariance
  );
}

/**
 * Control bonus by line — returns 0-12 range.
 */
function getControlBonus(bowling: BowlingStats, line: BowlerLine): number {
  switch (line) {
    case BowlerLine.OnStumps: return bowling.control * 0.15;
    case BowlerLine.OutsideOff: return bowling.control * 0.12;
    case BowlerLine.Full: return bowling.control * 0.10;
    case BowlerLine.Short: return bowling.control * 0.08;
    case BowlerLine.OnPads: return bowling.control * 0.05;
  }
}

/**
 * BowlScore formula — target range: ~30-55 for average-to-good bowlers.
 * Should be roughly comparable to BatScore.
 */
export function computeBowlScore(
  bowling: BowlingStats,
  line: BowlerLine,
  pitchType: PitchType,
  confidence: number,
  pressureIndex: number,
  isDeathOvers: boolean
): number {
  const pitchMods = getPitchModifiers(pitchType);
  const pitchModifier =
    bowling.bowlerType === BowlerType.Pace
      ? pitchMods.paceModifier
      : pitchMods.spinModifier;

  const coreSkill = bowling.mainSkill * 0.25;
  const controlBonus = getControlBonus(bowling, line);
  const variationBonus = bowling.variation * 0.08;
  const deathBowlingBonus = isDeathOvers ? bowling.deathBowling * 0.10 : 0;
  const pressureHandlingBonus = bowling.pressureHandling * (pressureIndex / 100) * 0.08;
  const confidenceBonus = (confidence - 50) * 0.15;
  const randomVariance = randInt(-8, 8);

  return (
    coreSkill +
    controlBonus +
    variationBonus +
    deathBowlingBonus +
    pressureHandlingBonus +
    pitchModifier +
    confidenceBonus +
    randomVariance
  );
}
