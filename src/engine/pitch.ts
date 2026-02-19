import { PitchType } from "../types/enums";
import { PitchModifiers } from "../types/engine";
import { randInt } from "../utils/random";

export function generatePitchType(): PitchType {
  const roll = randInt(0, 99);
  if (roll < 40) return PitchType.Flat;
  if (roll < 65) return PitchType.SpinFriendly;
  return PitchType.SeamFriendly;
}

export function getPitchModifiers(pitchType: PitchType): PitchModifiers {
  switch (pitchType) {
    case PitchType.Flat:
      return { paceModifier: 0, spinModifier: 0 };
    case PitchType.SpinFriendly:
      return { paceModifier: -5, spinModifier: 12 };
    case PitchType.SeamFriendly:
      return { paceModifier: 12, spinModifier: -5 };
  }
}
