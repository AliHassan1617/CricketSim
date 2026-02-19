import { BallOutcome, BattingIntent, BowlerLine, BowlerType, DismissalType, FieldType } from "../types/enums";
import { weightedPick } from "../utils/random";
import { applyIntentAndFieldMultipliers } from "./field";

// Base probability table: [Dot, Single, Double, Three, Four, Six, Wicket]
// Negative net bands unchanged. Positive net bands have reduced 4s/6s so a
// dominant batsman still scores freely but not at 18+ RPO.
// NOTE: A flat intent bonus is added in resolveOutcome — do NOT bake in
//       aggressive risk here, keep these weights intent-neutral.
const PROBABILITY_TABLE: { minNet: number; weights: number[] }[] = [
  { minNet: -Infinity, weights: [52, 14, 3, 0, 2, 0, 11] },  // ≤ -30  → wicket ~14%
  { minNet: -30,       weights: [42, 18, 5, 1, 4, 0,  9] },  // -30→-20 → wicket ~12%
  { minNet: -20,       weights: [32, 23, 8, 2, 7, 1,  7] },  // -20→-10 → wicket ~9%
  { minNet: -10,       weights: [24, 27, 11, 2, 9, 2,  5] }, // -10→0   → wicket ~6%
  { minNet: 0,         weights: [20, 28, 12, 3, 11, 3, 3] }, // 0→10    → wicket ~3.7%, fewer boundaries
  { minNet: 10,        weights: [14, 26, 14, 4, 14, 5, 2] }, // 10→20   → wicket ~2.5%
  { minNet: 20,        weights: [10, 22, 14, 5, 17, 7, 1] }, // 20→30   → wicket ~1.3%
  { minNet: 30,        weights: [ 8, 22, 15, 6, 18, 8, 1] }, // > 30    → wicket ~1.3%
];

function interpolateWeights(net: number): number[] {
  // Find the two bands to interpolate between
  for (let i = PROBABILITY_TABLE.length - 1; i >= 0; i--) {
    if (net >= PROBABILITY_TABLE[i].minNet) {
      if (i === PROBABILITY_TABLE.length - 1) {
        return [...PROBABILITY_TABLE[i].weights];
      }
      const lower = PROBABILITY_TABLE[i];
      const upper = PROBABILITY_TABLE[i + 1];
      const range = upper.minNet - lower.minNet;
      const t = range === 0 ? 0 : (net - lower.minNet) / range;

      return lower.weights.map((lw, idx) => {
        return lw + (upper.weights[idx] - lw) * t;
      });
    }
  }
  return [...PROBABILITY_TABLE[0].weights];
}

const OUTCOMES: BallOutcome[] = [
  BallOutcome.Dot,
  BallOutcome.Single,
  BallOutcome.Double,
  BallOutcome.Three,
  BallOutcome.Four,
  BallOutcome.Six,
  BallOutcome.Wicket,
];

// Flat wicket weight bonus applied AFTER multipliers.
// This is the primary mechanism making aggressive batting genuinely risky —
// even when BatScore >> BowlScore (net > 30, base wicket = 1), Aggressive
// pushes wicket weight to ~9 so the chance stays around 10% per ball.
const FLAT_WICKET_BONUS: Record<BattingIntent, number> = {
  [BattingIntent.Aggressive]: 5,
  [BattingIntent.Balanced]:   1,
  [BattingIntent.Defensive]:  0,
};

export function resolveOutcome(
  net: number,
  intent: BattingIntent,
  fieldType: FieldType,
  isFreeHit: boolean
): BallOutcome {
  let weights = interpolateWeights(net);
  weights = applyIntentAndFieldMultipliers(weights, intent, fieldType);

  // Add flat wicket risk for intent (independent of net score)
  weights[6] = Math.max(0, weights[6]) + FLAT_WICKET_BONUS[intent];

  // On free hit, wicket becomes dot
  if (isFreeHit) {
    weights[6] = 0; // No wicket on free hit
    weights[0] += 5; // Slight increase in dots
  }

  return weightedPick(OUTCOMES, weights);
}

// Dismissal type tables: [Bowled, Caught, LBW, RunOut, Stumped]
const PACE_DISMISSAL: Record<BowlerLine, number[]> = {
  [BowlerLine.OutsideOff]: [10, 55, 5, 5, 0],
  [BowlerLine.OnStumps]: [30, 30, 25, 5, 0],
  [BowlerLine.OnPads]: [5, 20, 55, 5, 0],
  [BowlerLine.Short]: [5, 70, 0, 5, 0],
  [BowlerLine.Full]: [25, 30, 30, 5, 0],
};

const SPIN_DISMISSAL: Record<BowlerLine, number[]> = {
  [BowlerLine.OutsideOff]: [10, 45, 5, 5, 15],
  [BowlerLine.OnStumps]: [25, 25, 20, 5, 10],
  [BowlerLine.OnPads]: [5, 15, 50, 5, 10],
  [BowlerLine.Short]: [5, 60, 0, 5, 5],
  [BowlerLine.Full]: [20, 25, 25, 5, 15],
};

const DISMISSAL_TYPES: DismissalType[] = [
  DismissalType.Bowled,
  DismissalType.Caught,
  DismissalType.LBW,
  DismissalType.RunOut,
  DismissalType.Stumped,
];

export function resolveDismissalType(
  bowlerType: BowlerType,
  line: BowlerLine,
  runningBetweenWickets?: number
): DismissalType {
  const table = bowlerType === BowlerType.Pace ? PACE_DISMISSAL : SPIN_DISMISSAL;
  const weights = [...table[line]];

  // Low RBW increases run-out probability
  if (runningBetweenWickets !== undefined && runningBetweenWickets < 50) {
    const runOutBoost = ((50 - runningBetweenWickets) / 50) * 20;
    weights[3] += runOutBoost; // RunOut index
  }

  return weightedPick(DISMISSAL_TYPES, weights);
}

/**
 * Apply Running Between Wickets post-processing to outcome.
 * - Single → chance to convert to Double
 * - Double → chance to convert to Three
 */
export function applyRunningBetweenWickets(
  outcome: BallOutcome,
  rbw: number
): BallOutcome {
  if (outcome === BallOutcome.Single && Math.random() * 100 < rbw / 100 * 15) {
    return BallOutcome.Double;
  }
  if (outcome === BallOutcome.Double && Math.random() * 100 < rbw / 200 * 15) {
    return BallOutcome.Three;
  }
  return outcome;
}
