import { BallOutcome } from "./enums";

export interface PitchModifiers {
  paceModifier: number;
  spinModifier: number;
}

export interface OutcomeProbabilities {
  [BallOutcome.Dot]: number;
  [BallOutcome.Single]: number;
  [BallOutcome.Double]: number;
  [BallOutcome.Three]: number;
  [BallOutcome.Four]: number;
  [BallOutcome.Six]: number;
  [BallOutcome.Wicket]: number;
}

export interface PressureFactors {
  requiredRate: number;
  wicketsLostFactor: number;
  oversRemainingFactor: number;
  totalPressure: number;
}
