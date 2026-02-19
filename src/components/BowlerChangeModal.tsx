import { BowlerSpell } from "../types/match";
import { Player } from "../types/player";
import { formatOvers, formatEconomy } from "../utils/format";

interface BowlerChangeModalProps {
  availableBowlers: BowlerSpell[];
  players: Player[];
  onSelect: (bowlerId: string) => void;
}

function getPlayerInfo(players: Player[], playerId: string): Player | undefined {
  return players.find((p) => p.id === playerId);
}

function skillLabel(value: number): string {
  if (value >= 80) return "Elite";
  if (value >= 65) return "Good";
  if (value >= 50) return "Decent";
  return "Avg";
}

function skillColor(value: number): string {
  if (value >= 80) return "text-emerald-400";
  if (value >= 65) return "text-yellow-400";
  if (value >= 50) return "text-blue-400";
  return "text-gray-400";
}

export function BowlerChangeModal({
  availableBowlers,
  players,
  onSelect,
}: BowlerChangeModalProps) {
  // Sort best bowlers first
  const sorted = [...availableBowlers].sort((a, b) => {
    const pa = getPlayerInfo(players, a.playerId);
    const pb = getPlayerInfo(players, b.playerId);
    return (pb?.bowling.mainSkill ?? 0) - (pa?.bowling.mainSkill ?? 0);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl p-5 w-full max-w-md mx-4 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-0.5">Select Bowler</h2>
        <p className="text-xs text-gray-500 mb-4">
          Any non-keeper can bowl. Max 2 overs each. The previous bowler can't bowl consecutive overs.
        </p>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {sorted.map((bowler) => {
            const player = getPlayerInfo(players, bowler.playerId);
            const totalBalls = bowler.overs * 6 + bowler.ballsInCurrentOver;
            const oversRemaining = bowler.maxOvers - bowler.overs;
            const hasBowled = totalBalls > 0;
            const skill = player?.bowling.mainSkill ?? 0;
            const bowlerType = player?.bowling.bowlerType ?? "pace";

            return (
              <button
                key={bowler.playerId}
                onClick={() => onSelect(bowler.playerId)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-emerald-900/30 border border-gray-700 hover:border-emerald-600 rounded-lg transition-colors cursor-pointer text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium truncate">
                      {player?.shortName ?? bowler.playerId}
                    </span>
                    <span className="text-xs text-gray-600 capitalize shrink-0">
                      {player?.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-500 capitalize">{bowlerType}</span>
                    <span className={`text-xs font-semibold ${skillColor(skill)}`}>
                      {skillLabel(skill)} · {skill}
                    </span>
                    {hasBowled && (
                      <span className="text-xs text-gray-500">
                        {formatOvers(totalBalls)}-{bowler.runsConceded}-{bowler.wickets}
                        {" · "}
                        {formatEconomy(bowler.runsConceded, totalBalls)}
                      </span>
                    )}
                    {!hasBowled && (
                      <span className="text-xs text-gray-700 italic">not yet bowled</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className={`text-xs font-semibold ${oversRemaining === 2 ? "text-emerald-400" : "text-yellow-400"}`}>
                    {oversRemaining} ov left
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
