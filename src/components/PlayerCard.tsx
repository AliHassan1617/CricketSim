import { Player } from "../types/player";

interface PlayerCardProps {
  player: Player;
  isSelected: boolean;
  onToggle: () => void;
  onClickName?: () => void;
}

const roleColors: Record<string, string> = {
  batsman: "text-blue-400",
  bowler: "text-red-400",
  "all-rounder": "text-purple-400",
  "wicket-keeper": "text-yellow-400",
};

export function PlayerCard({ player, isSelected, onToggle, onClickName }: PlayerCardProps) {
  const batAvg = Math.round(
    (player.batting.techniqueVsPace + player.batting.techniqueVsSpin) / 2
  );
  const bowlSkill = player.bowling.mainSkill;

  return (
    <button
      onClick={onToggle}
      className={`w-full text-left rounded-lg border p-3 transition-all cursor-pointer ${
        isSelected
          ? "border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-900/20"
          : "border-gray-700 bg-gray-900 hover:border-gray-500"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-semibold text-sm text-white truncate hover:text-emerald-300 transition-colors"
          onClick={(e) => {
            if (onClickName) {
              e.stopPropagation();
              onClickName();
            }
          }}
        >
          {player.shortName}
        </span>
        {isSelected && (
          <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs text-white font-bold">
            ✓
          </span>
        )}
      </div>
      <div className={`text-xs capitalize mt-0.5 ${roleColors[player.role] || "text-gray-400"}`}>
        {player.role}
      </div>
      <div className="flex gap-3 mt-2 text-xs">
        <div>
          <span className="text-gray-500">BAT </span>
          <span className="text-blue-300 font-medium">{batAvg}</span>
        </div>
        <div>
          <span className="text-gray-500">BWL </span>
          <span className="text-red-300 font-medium">{bowlSkill}</span>
        </div>
        <div>
          <span className="text-gray-500">PWR </span>
          <span className="text-orange-300 font-medium">{player.batting.power}</span>
        </div>
      </div>
    </button>
  );
}
