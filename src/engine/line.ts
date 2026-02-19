import { BowlerLine, FieldType } from "../types/enums";
import { randInt, weightedPick, clamp } from "../utils/random";

const LINES = [
  BowlerLine.OutsideOff,
  BowlerLine.OnStumps,
  BowlerLine.OnPads,
  BowlerLine.Short,
  BowlerLine.Full,
];

function getBaseWeights(lineDiscipline: number): number[] {
  if (lineDiscipline >= 70) {
    return [30, 35, 10, 10, 15]; // OutsideOff, OnStumps, OnPads, Short, Full
  } else if (lineDiscipline >= 45) {
    return [22, 25, 18, 18, 17];
  } else {
    return [18, 18, 22, 22, 20];
  }
}

function applyFieldBias(weights: number[], fieldType: FieldType): number[] {
  const adjusted = [...weights];
  switch (fieldType) {
    case FieldType.Attacking:
      adjusted[1] += 5; // OnStumps
      adjusted[4] += 3; // Full
      adjusted[2] -= 4; // OnPads
      adjusted[3] -= 4; // Short
      break;
    case FieldType.Defensive:
      adjusted[0] += 5; // OutsideOff
      adjusted[3] += 3; // Short
      adjusted[1] -= 4; // OnStumps
      adjusted[4] -= 4; // Full
      break;
    case FieldType.Balanced:
      break;
  }
  return adjusted;
}

export function generateLine(
  lineDiscipline: number,
  fieldType: FieldType
): BowlerLine {
  let weights = getBaseWeights(lineDiscipline);
  weights = applyFieldBias(weights, fieldType);

  // Add small variance
  weights = weights.map((w) => clamp(w + randInt(-3, 3), 2, 100));

  return weightedPick(LINES, weights);
}
