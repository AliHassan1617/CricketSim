import { BatsmanInnings } from "../types/match";
import { Player } from "../types/player";
import { DismissalType } from "../types/enums";

interface BattingScorecardProps {
  batsmen: BatsmanInnings[];
  players: Player[];
  strikerIndex: number;
  nonStrikerIndex: number;
  extras: { wides: number; noBalls: number };
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  ballsInCurrentOver: number;
}

function getDismissalShort(type?: DismissalType): string {
  if (!type) return "not out";
  switch (type) {
    case DismissalType.Bowled: return "b";
    case DismissalType.Caught: return "c&b";
    case DismissalType.LBW: return "lbw";
    case DismissalType.RunOut: return "run out";
    case DismissalType.Stumped: return "st";
    default: return "out";
  }
}

export function BattingScorecard({
  batsmen,
  players,
  strikerIndex,
  nonStrikerIndex,
  extras,
  totalRuns,
  totalWickets,
  totalOvers,
  ballsInCurrentOver,
}: BattingScorecardProps) {
  // Only show batsmen who have batted or are in
  const activeBatsmen = batsmen.filter((b) => b.balls > 0 || !b.isOut);

  return (
    <div className="text-xs">
      {/* Header */}
      <div className="flex gap-1 text-gray-500 uppercase tracking-wide mb-1 px-1">
        <span className="flex-1">Batsman</span>
        <span className="w-6 text-right">R</span>
        <span className="w-6 text-right">B</span>
        <span className="w-5 text-right">4s</span>
        <span className="w-5 text-right">6s</span>
        <span className="w-8 text-right">SR%</span>
      </div>

      {/* Batsmen rows */}
      <div className="space-y-0.5">
        {activeBatsmen.map((b) => {
          const player = players.find((p) => p.id === b.playerId);
          const isStriker = batsmen.indexOf(b) === strikerIndex;
          const isNonStriker = batsmen.indexOf(b) === nonStrikerIndex;
          const sr = b.balls > 0 ? Math.round((b.runs / b.balls) * 100) : 0;

          return (
            <div
              key={b.playerId}
              className={`flex items-center gap-1 px-1 py-0.5 rounded ${
                isStriker
                  ? "bg-emerald-950/60 border border-emerald-700/40"
                  : isNonStriker
                  ? "bg-blue-950/40 border border-blue-700/30"
                  : b.isOut
                  ? "opacity-40"
                  : ""
              }`}
            >
              {/* Strike indicator */}
              <span className="w-3 text-center">
                {isStriker ? (
                  <span className="text-emerald-400 font-bold">*</span>
                ) : isNonStriker ? (
                  <span className="text-blue-400">·</span>
                ) : null}
              </span>

              {/* Name */}
              <span
                className={`flex-1 truncate font-medium ${
                  b.isOut ? "text-gray-500 line-through decoration-gray-600" : "text-white"
                }`}
              >
                {player?.shortName ?? b.playerId}
              </span>

              {/* Dismissal info for out batsmen */}
              {b.isOut && (
                <span className="text-gray-600 text-xs italic w-10 text-right truncate">
                  {getDismissalShort(b.dismissalType)}
                </span>
              )}

              {/* Stats */}
              <span className={`w-6 text-right font-bold tabular-nums ${
                b.runs >= 50 ? "text-yellow-400" : b.runs >= 30 ? "text-emerald-400" : "text-white"
              }`}>
                {b.runs}
              </span>
              <span className="w-6 text-right text-gray-400 tabular-nums">{b.balls}</span>
              <span className="w-5 text-right text-green-500 tabular-nums">{b.fours}</span>
              <span className="w-5 text-right text-yellow-500 tabular-nums">{b.sixes}</span>
              <span className="w-8 text-right text-gray-400 tabular-nums">
                {b.balls > 0 ? Math.round((b.runs / b.balls) * 100) : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 mt-2 pt-1.5 px-1 space-y-0.5">
        <div className="flex justify-between text-gray-500">
          <span>Extras</span>
          <span>{extras.wides + extras.noBalls} (wd {extras.wides}, nb {extras.noBalls})</span>
        </div>
        <div className="flex justify-between text-white font-bold">
          <span>Total</span>
          <span>
            {totalRuns}/{totalWickets}{" "}
            <span className="text-gray-400 font-normal">
              ({totalOvers}.{ballsInCurrentOver} ov)
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
