import { BallOutcome, BattingIntent, BowlerLine, BowlerType, DismissalType, FieldType } from "../types/enums";
import { weightedPick } from "../utils/random";
import { applyIntentAndFieldMultipliers } from "./field";

// Base probability table: [Dot, Single, Double, Three, Four, Six, Wicket]
// Negative net bands: bowl-dominant — high wicket rates, few scoring shots.
// Positive net bands: bat-dominant — more singles/doubles, MODEST boundaries.
// Four/Six are deliberately low here because Aggressive+Attacking multipliers
// in field.ts stack on top (Four×1.475, Six×1.512) — keeping base rates low
// prevents the combined boundary rate from reaching the 36-43% seen before.
// NOTE: A flat intent bonus is added in resolveOutcome — do NOT bake in
//       aggressive risk here, keep these weights intent-neutral.
const PROBABILITY_TABLE: { minNet: number; weights: number[] }[] = [
  { minNet: -Infinity, weights: [52, 14, 3, 0, 2, 0, 11] },  // ≤ -30  → wicket ~14%
  { minNet: -30,       weights: [42, 18, 5, 1, 4, 0,  9] },  // -30→-20 → wicket ~12%
  { minNet: -20,       weights: [32, 23, 8, 2, 7, 1,  7] },  // -20→-10 → wicket ~9%
  { minNet: -10,       weights: [24, 27, 11, 2, 9, 2,  5] }, // -10→0   → wicket ~6%
  { minNet: 0,         weights: [22, 30, 12, 2, 6, 2, 3] },  // 0→10    → wicket base 3, boundaries ~10%
  { minNet: 10,        weights: [18, 30, 13, 3, 7, 2, 2] },  // 10→20   → wicket base 2, boundaries ~12%
  { minNet: 20,        weights: [15, 29, 13, 3, 7, 2, 1] },  // 20→30   → wicket base 1, boundaries ~12%
  { minNet: 30,        weights: [13, 28, 14, 3, 8, 3, 1] },  // > 30    → wicket base 1, boundaries ~15%
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
