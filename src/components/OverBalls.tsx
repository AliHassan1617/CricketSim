import { BallOutcome } from "../types/enums";
import { BallEvent } from "../types/match";

interface OverBallsProps {
  events: BallEvent[];
  overNumber: number;
}

function getBallDisplay(event: BallEvent): { label: string; color: string } {
  switch (event.outcome) {
    case BallOutcome.Wicket:
      return { label: "W", color: "bg-red-600 text-white border-red-400" };
    case BallOutcome.Dot:
      return { label: "·", color: "bg-gray-700 text-gray-400 border-gray-600" };
    case BallOutcome.Single:
      return { label: "1", color: "bg-blue-800 text-blue-200 border-blue-600" };
    case BallOutcome.Double:
      return { label: "2", color: "bg-blue-700 text-blue-100 border-blue-500" };
    case BallOutcome.Three:
      return { label: "3", color: "bg-indigo-700 text-indigo-100 border-indigo-500" };
    case BallOutcome.Four:
      return { label: "4", color: "bg-emerald-700 text-emerald-100 border-emerald-500" };
    case BallOutcome.Six:
      return { label: "6", color: "bg-yellow-600 text-yellow-100 border-yellow-400" };
    case BallOutcome.Wide:
      return { label: "Wd", color: "bg-orange-700 text-orange-100 border-orange-500" };
    case BallOutcome.NoBall:
      return { label: "Nb", color: "bg-orange-600 text-orange-100 border-orange-400" };
    default:
      return { label: "?", color: "bg-gray-700 text-gray-400 border-gray-600" };
  }
}

export function OverBalls({ events, overNumber }: OverBallsProps) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">
        Over {overNumber + 1}
      </p>
      <div className="flex gap-1.5 flex-wrap">
        {events.length === 0 && (
          <span className="text-xs text-gray-600 italic">No balls yet</span>
        )}
        {events.map((event, i) => {
          const { label, color } = getBallDisplay(event);
          return (
            <div
              key={i}
              className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold ${color}`}
              title={event.commentary}
            >
              {label}
            </div>
          );
        })}
        {/* Empty placeholders for remaining balls */}
        {Array.from({ length: Math.max(0, 6 - events.filter(e =>
          e.outcome !== BallOutcome.Wide && e.outcome !== BallOutcome.NoBall
        ).length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-7 h-7 rounded-full border border-dashed border-gray-700 flex items-center justify-center"
          />
        ))}
      </div>
    </div>
  );
}
