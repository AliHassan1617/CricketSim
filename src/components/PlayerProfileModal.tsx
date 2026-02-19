import { Player } from "../types/player";

interface PlayerProfileModalProps {
  player: Player;
  onClose: () => void;
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-28 text-right shrink-0">{label}</span>
      <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-bold text-white w-8 text-right">{value}</span>
    </div>
  );
}

function getStatColor(value: number): string {
  if (value >= 80) return "bg-emerald-500";
  if (value >= 60) return "bg-green-500";
  if (value >= 40) return "bg-yellow-500";
  if (value >= 20) return "bg-orange-500";
  return "bg-red-500";
}

const roleColors: Record<string, string> = {
  batsman: "text-blue-400",
  bowler: "text-red-400",
  "all-rounder": "text-purple-400",
  "wicket-keeper": "text-yellow-400",
};

export function PlayerProfileModal({ player, onClose }: PlayerProfileModalProps) {
  const { batting, bowling } = player;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white">{player.name}</h2>
            <p className={`text-sm capitalize ${roleColors[player.role] || "text-gray-400"}`}>
              {player.role}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-xl leading-none p-1"
          >
            ✕
          </button>
        </div>

        {/* Batting Stats */}
        <div className="mb-5">
          <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
            Batting
          </h3>
          <div className="space-y-2">
            <StatBar label="Power" value={batting.power} color={getStatColor(batting.power)} />
            <StatBar label="Temperament" value={batting.temperament} color={getStatColor(batting.temperament)} />
            <StatBar label="Tech vs Pace" value={batting.techniqueVsPace} color={getStatColor(batting.techniqueVsPace)} />
            <StatBar label="Tech vs Spin" value={batting.techniqueVsSpin} color={getStatColor(batting.techniqueVsSpin)} />
            <StatBar label="Acceleration" value={batting.acceleration} color={getStatColor(batting.acceleration)} />
            <StatBar label="Offside Skill" value={batting.offsideSkill} color={getStatColor(batting.offsideSkill)} />
            <StatBar label="Legside Skill" value={batting.legsideSkill} color={getStatColor(batting.legsideSkill)} />
            <StatBar label="Running (BW)" value={batting.runningBetweenWickets} color={getStatColor(batting.runningBetweenWickets)} />
          </div>
        </div>

        {/* Bowling Stats */}
        <div>
          <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
            Bowling ({bowling.bowlerType})
          </h3>
          <div className="space-y-2">
            <StatBar label="Main Skill" value={bowling.mainSkill} color={getStatColor(bowling.mainSkill)} />
            <StatBar label="Control" value={bowling.control} color={getStatColor(bowling.control)} />
            <StatBar label="Variation" value={bowling.variation} color={getStatColor(bowling.variation)} />
            <StatBar label="Death Bowling" value={bowling.deathBowling} color={getStatColor(bowling.deathBowling)} />
            <StatBar label="Line Discipline" value={bowling.lineDiscipline} color={getStatColor(bowling.lineDiscipline)} />
            <StatBar label="Pressure" value={bowling.pressureHandling} color={getStatColor(bowling.pressureHandling)} />
          </div>
        </div>
      </div>
    </div>
  );
}
