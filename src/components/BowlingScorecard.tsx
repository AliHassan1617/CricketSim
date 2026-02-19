import { BowlerSpell } from "../types/match";
import { Player } from "../types/player";
import { formatOvers, formatEconomy } from "../utils/format";

interface BowlingScorecardProps {
  bowlers: BowlerSpell[];
  players: Player[];
  currentBowlerId?: string;
}

export function BowlingScorecard({ bowlers, players, currentBowlerId }: BowlingScorecardProps) {
  return (
    <div className="text-xs">
      {/* Header */}
      <div className="flex gap-1 text-gray-500 uppercase tracking-wide mb-1 px-1">
        <span className="flex-1">Bowler</span>
        <span className="w-7 text-right">O</span>
        <span className="w-5 text-right">M</span>
        <span className="w-6 text-right">R</span>
        <span className="w-5 text-right">W</span>
        <span className="w-10 text-right">Econ</span>
      </div>

      <div className="space-y-0.5">
        {bowlers.map((b) => {
          const player = players.find((p) => p.id === b.playerId);
          const balls = b.overs * 6 + b.ballsInCurrentOver;
          const isCurrent = b.playerId === currentBowlerId;
          const maidens = 0; // simplified — would need to track per-over runs

          return (
            <div
              key={b.playerId}
              className={`flex items-center gap-1 px-1 py-0.5 rounded ${
                isCurrent ? "bg-emerald-950/60 border border-emerald-700/40" : ""
              }`}
            >
              <span className="w-2 text-center shrink-0">
                {isCurrent && <span className="text-emerald-400">▶</span>}
              </span>
              <span className={`flex-1 truncate font-medium ${isCurrent ? "text-emerald-300" : "text-gray-300"}`}>
                {player?.shortName ?? b.playerId}
              </span>
              <span className="w-7 text-right tabular-nums text-gray-300">
                {formatOvers(balls)}
              </span>
              <span className="w-5 text-right tabular-nums text-gray-500">{maidens}</span>
              <span className="w-6 text-right tabular-nums text-white font-medium">{b.runsConceded}</span>
              <span className={`w-5 text-right tabular-nums font-bold ${b.wickets > 0 ? "text-red-400" : "text-gray-400"}`}>
                {b.wickets}
              </span>
              <span className="w-10 text-right tabular-nums text-gray-400">
                {balls > 0 ? formatEconomy(b.runsConceded, balls) : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
