import { BallOutcome, BattingIntent, FieldType } from "../types/enums";

type OutcomeWeights = Record<number, number>;

// Multipliers are kept mild so that Aggressive+Attacking stacking
// never pushes wicket probability beyond ~2× the base table value.
const INTENT_MULTIPLIERS: Record<BattingIntent, OutcomeWeights> = {
  [BattingIntent.Aggressive]: {
    [BallOutcome.Dot]:    0.75,
    [BallOutcome.Single]: 0.85,
    [BallOutcome.Double]: 1.0,
    [BallOutcome.Three]:  1.0,
    [BallOutcome.Four]:   1.25,
    [BallOutcome.Six]:    1.35,
    [BallOutcome.Wicket]: 1.08, // was 1.2 — toned down significantly
  },
  [BattingIntent.Balanced]: {
    [BallOutcome.Dot]:    1.0,
    [BallOutcome.Single]: 1.0,
    [BallOutcome.Double]: 1.0,
    [BallOutcome.Three]:  1.0,
    [BallOutcome.Four]:   1.0,
    [BallOutcome.Six]:    1.0,
    [BallOutcome.Wicket]: 1.0,
  },
  [BattingIntent.Defensive]: {
    [BallOutcome.Dot]:    1.25,
    [BallOutcome.Single]: 1.15,
    [BallOutcome.Double]: 1.0,
    [BallOutcome.Three]:  1.0,
    [BallOutcome.Four]:   0.75,
    [BallOutcome.Six]:    0.55,
    [BallOutcome.Wicket]: 0.70,
  },
};

const FIELD_MULTIPLIERS: Record<FieldType, OutcomeWeights> = {
  [FieldType.Attacking]: {
    [BallOutcome.Dot]:    0.92,
    [BallOutcome.Single]: 0.88,
    [BallOutcome.Double]: 0.92,
    [BallOutcome.Three]:  0.95,
    [BallOutcome.Four]:   1.18,
    [BallOutcome.Six]:    1.12,
    [BallOutcome.Wicket]: 1.12, // was 1.35 — big reduction
  },
  [FieldType.Balanced]: {
    [BallOutcome.Dot]:    1.0,
    [BallOutcome.Single]: 1.0,
    [BallOutcome.Double]: 1.0,
    [BallOutcome.Three]:  1.0,
    [BallOutcome.Four]:   1.0,
    [BallOutcome.Six]:    1.0,
    [BallOutcome.Wicket]: 1.0,
  },
  [FieldType.Defensive]: {
    [BallOutcome.Dot]:    1.12,
    [BallOutcome.Single]: 1.25,
    [BallOutcome.Double]: 1.1,
    [BallOutcome.Three]:  1.05,
    [BallOutcome.Four]:   0.82,
    [BallOutcome.Six]:    0.78,
    [BallOutcome.Wicket]: 0.75,
  },
};

const OUTCOME_KEYS: BallOutcome[] = [
  BallOutcome.Dot,
  BallOutcome.Single,
  BallOutcome.Double,
  BallOutcome.Three,
  BallOutcome.Four,
  BallOutcome.Six,
  BallOutcome.Wicket,
];

export function applyIntentAndFieldMultipliers(
  baseWeights: number[],
  intent: BattingIntent,
  fieldType: FieldType
): number[] {
  const intentMults = INTENT_MULTIPLIERS[intent];
  const fieldMults = FIELD_MULTIPLIERS[fieldType];

  return baseWeights.map((w, i) => {
    const key = OUTCOME_KEYS[i];
    return Math.max(0.5, w * intentMults[key] * fieldMults[key]);
  });
}
