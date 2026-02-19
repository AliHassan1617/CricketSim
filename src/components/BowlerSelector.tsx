import { Player } from "../types/player";

interface BowlerSelectorProps {
  players: Player[];
  selectedBowlerIds: string[];
  onToggle: (id: string) => void;
}

export function BowlerSelector({ players, selectedBowlerIds, onToggle }: BowlerSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
      {players.map((player) => {
        const isSelected = selectedBowlerIds.includes(player.id);
        const { bowling } = player;
        return (
          <button
            key={player.id}
            onClick={() => onToggle(player.id)}
            className={`text-left rounded-lg border p-3 transition-all cursor-pointer ${
              isSelected
                ? "border-emerald-500 bg-emerald-950/40"
                : "border-gray-700 bg-gray-900 hover:border-gray-500"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-white truncate">
                {player.shortName}
              </span>
              {isSelected && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs text-white font-bold">
                  ✓
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 capitalize mt-0.5">
              {bowling.bowlerType} | {player.role}
            </div>
            <div className="flex gap-3 mt-2 text-xs">
              <div>
                <span className="text-gray-500">SKL </span>
                <span className="text-red-300 font-medium">{bowling.mainSkill}</span>
              </div>
              <div>
                <span className="text-gray-500">CTL </span>
                <span className="text-blue-300 font-medium">{bowling.control}</span>
              </div>
              <div>
                <span className="text-gray-500">LND </span>
                <span className="text-purple-300 font-medium">{bowling.lineDiscipline}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
