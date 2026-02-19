export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function normalizeWeights(weights: number[]): number[] {
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total === 0) return weights.map(() => 100 / weights.length);
  return weights.map((w) => (w / total) * 100);
}
