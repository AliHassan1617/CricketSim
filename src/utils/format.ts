export function formatOvers(totalBalls: number): string {
  const overs = Math.floor(totalBalls / 6);
  const balls = totalBalls % 6;
  return balls === 0 ? `${overs}.0` : `${overs}.${balls}`;
}

export function formatStrikeRate(runs: number, balls: number): string {
  if (balls === 0) return "0.00";
  return ((runs / balls) * 100).toFixed(2);
}

export function formatEconomy(runs: number, totalBalls: number): string {
  if (totalBalls === 0) return "0.00";
  return ((runs / totalBalls) * 6).toFixed(2);
}

export function formatRunRate(runs: number, totalBalls: number): string {
  if (totalBalls === 0) return "0.00";
  return ((runs / totalBalls) * 6).toFixed(2);
}
