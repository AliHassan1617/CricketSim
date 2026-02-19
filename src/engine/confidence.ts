import { BallOutcome } from "../types/enums";
import { clamp } from "../utils/random";

export function updateBatsmanConfidence(
  currentConfidence: number,
  outcome: BallOutcome,
  totalRuns: number,
  hasReached30: boolean,
  hasReached50: boolean
): { confidence: number; newReached30: boolean; newReached50: boolean } {
  let delta = 0;
  switch (outcome) {
    case BallOutcome.Dot: delta = -1; break;
    case BallOutcome.Single: delta = 1; break;
    case BallOutcome.Double: delta = 2; break;
    case BallOutcome.Three: delta = 2; break;
    case BallOutcome.Four: delta = 4; break;
    case BallOutcome.Six: delta = 6; break;
    default: break;
  }

  let newReached30 = hasReached30;
  let newReached50 = hasReached50;

  if (totalRuns >= 30 && !hasReached30) {
    delta += 5;
    newReached30 = true;
  }
  if (totalRuns >= 50 && !hasReached50) {
    delta += 5;
    newReached50 = true;
  }

  return {
    confidence: clamp(currentConfidence + delta, 10, 99),
    newReached30,
    newReached50,
  };
}

export function updateBowlerConfidence(
  currentConfidence: number,
  outcome: BallOutcome
): number {
  let delta = 0;
  switch (outcome) {
    case BallOutcome.Dot: delta = 2; break;
    case BallOutcome.Single: delta = 0; break;
    case BallOutcome.Double: delta = -1; break;
    case BallOutcome.Three: delta = -2; break;
    case BallOutcome.Four: delta = -4; break;
    case BallOutcome.Six: delta = -6; break;
    case BallOutcome.Wicket: delta = 8; break;
    default: break;
  }
  return clamp(currentConfidence + delta, 10, 99);
}
