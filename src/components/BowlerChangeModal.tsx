import { BowlerSpell } from "../types/match";
import { Player } from "../types/player";
import { formatOvers } from "../utils/format";

interface BowlerChangeModalProps {
  availableBowlers: BowlerSpell[];
  players: Player[];
  onSelect: (bowlerId: string) => void;
}

function getPlayerInfo(players: Player[], playerId: string): Player | undefined {
  return players.find((p) => p.id === playerId);
}

function barColor(value: number): string {
  return value >= 80 ? "#10b981" : value >= 65 ? "#f59e0b" : "#3b82f6";
}

function confColor(value: number): string {
  return value >= 70 ? "#10b981" : value >= 45 ? "#f59e0b" : "#ef4444";
}

export function BowlerChangeModal({
  availableBowlers,
  players,
  onSelect,
}: BowlerChangeModalProps) {
  const sorted = [...availableBowlers].sort((a, b) => {
    const pa = getPlayerInfo(players, a.playerId);
    const pb = getPlayerInfo(players, b.playerId);
    return (pb?.bowling.mainSkill ?? 0) - (pa?.bowling.mainSkill ?? 0);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        className="relative rounded-2xl p-5 w-full max-w-md mx-4 shadow-2xl"
        style={{
          background: "rgba(8,12,22,0.98)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(16px)",
        }}
      >
        <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">New Over</p>
        <h2 className="text-lg font-black text-white mb-0.5">Select Bowler</h2>
        <p className="text-xs text-gray-600 mb-4">
          Max 2 overs each · Previous bowler cannot bowl consecutive overs
        </p>

        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {sorted.map((bowler) => {
            const player = getPlayerInfo(players, bowler.playerId);
            const totalBalls = bowler.overs * 6 + bowler.ballsInCurrentOver;
            const oversRemaining = bowler.maxOvers - bowler.overs;
            const hasBowled = totalBalls > 0;
            const skill = player?.bowling.mainSkill ?? 0;
            const control = player?.bowling.control ?? 0;
            const variation = player?.bowling.variation ?? 0;
            const bowlerType = player?.bowling.bowlerType ?? "pace";
            const isPace = bowlerType === "pace";

            return (
              <button
                key={bowler.playerId}
                onClick={() => onSelect(bowler.playerId)}
                className="w-full text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer group"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "rgba(16,185,129,0.09)";
                  el.style.borderColor = "rgba(16,185,129,0.4)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "rgba(255,255,255,0.04)";
                  el.style.borderColor = "rgba(255,255,255,0.09)";
                }}
              >
                {/* Top row: name + type chip + overs info */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-white font-bold text-sm truncate">
                      {player?.shortName ?? bowler.playerId}
                    </span>
                    <span
                      className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
                      style={{
                        background: isPace ? "rgba(239,68,68,0.2)" : "rgba(168,85,247,0.2)",
                        color: isPace ? "#f87171" : "#c084fc",
                      }}
                    >
                      {bowlerType}
                    </span>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p
                      className="text-xs font-bold tabular-nums"
                      style={{ color: oversRemaining === 2 ? "#34d399" : "#fbbf24" }}
                    >
                      {oversRemaining} ov left
                    </p>
                    {hasBowled && (
                      <p className="text-[9px] text-gray-500 tabular-nums">
                        {formatOvers(totalBalls)}-{bowler.runsConceded}-{bowler.wickets}
                      </p>
                    )}
                    {!hasBowled && (
                      <p className="text-[9px] text-gray-700 italic">fresh</p>
                    )}
                  </div>
                </div>

                {/* Skill bars */}
                <div className="space-y-1">
                  {[
                    { label: "Skill", value: skill },
                    { label: "Ctrl",  value: control },
                    { label: "Var",   value: variation },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-[9px] text-gray-600 w-6 shrink-0">{label}</span>
                      <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${value}%`, backgroundColor: barColor(value) }}
                        />
                      </div>
                      <span className="text-[9px] text-gray-500 w-5 text-right tabular-nums">{value}</span>
                    </div>
                  ))}

                  {/* Form / confidence */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-600 w-6 shrink-0">Form</span>
                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${bowler.confidence}%`,
                          backgroundColor: confColor(bowler.confidence),
                        }}
                      />
                    </div>
                    <span
                      className="text-[9px] w-5 text-right tabular-nums font-semibold"
                      style={{ color: confColor(bowler.confidence) }}
                    >
                      {Math.round(bowler.confidence)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
