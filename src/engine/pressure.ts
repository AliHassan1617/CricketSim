import { BattingIntent } from "../types/enums";
import { PressureFactors } from "../types/engine";
import { clamp } from "../utils/random";

export function computePressure(
  target: number,
  currentRuns: number,
  totalBalls: number,
  wicketsLost: number,
  totalMatchBalls = 60
): PressureFactors {
  const remainingBalls = totalMatchBalls - totalBalls;
  const remainingOvers = remainingBalls / 6;
  const requiredRuns = target - currentRuns;
  const requiredRate = remainingBalls > 0 ? (requiredRuns / remainingBalls) * 6 : 99;

  // rrFactor capped at 50 (was 60) — a hopeless chase doesn't ZERO out batting
  let rrFactor: number;
  if (requiredRate < 6) rrFactor = 0;
  else if (requiredRate < 8) rrFactor = 10;
  else if (requiredRate < 10) rrFactor = 25;
  else if (requiredRate < 12) rrFactor = 40;
  else rrFactor = 50;

  // 4 per wicket, capped at 30 — prevents cascade that destroys BatScore for all tail-enders
  const wicketsLostFactor = Math.min(wicketsLost * 4, 30);

  let oversFactor: number;
  if (remainingOvers > 6) oversFactor = 0;
  else if (remainingOvers > 4) oversFactor = 10;
  else if (remainingOvers > 2) oversFactor = 20;
  else oversFactor = 30;

  const totalPressure = clamp(rrFactor + wicketsLostFactor + oversFactor, 0, 100);

  return {
    requiredRate,
    wicketsLostFactor,
    oversRemainingFactor: oversFactor,
    totalPressure,
  };
}

export function applyPressureToBatScore(
  batScore: number,
  pressure: PressureFactors,
  intent: BattingIntent
): number {
  // 0.10 multiplier (was 0.15) — pressure bites less, especially for new batsmen.
  // The Aggressive+pressure double-penalty is removed: aggressive intent risk
  // is now handled entirely by the flat wicket weight bonus in outcome.ts.
  void intent; // intent kept in signature for future use
  return batScore - pressure.totalPressure * 0.10;
}
