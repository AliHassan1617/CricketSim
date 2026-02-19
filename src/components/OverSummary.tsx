import { BallEvent } from "../types/match";
import { BallOutcome } from "../types/enums";

interface OverSummaryProps {
  events: BallEvent[];
}

function getBallStyle(outcome: BallOutcome): string {
  switch (outcome) {
    case BallOutcome.Dot: return "bg-gray-600 text-gray-200";
    case BallOutcome.Single:
    case BallOutcome.Double:
    case BallOutcome.Three: return "bg-green-600 text-white";
    case BallOutcome.Four: return "bg-blue-500 text-white";
    case BallOutcome.Six: return "bg-purple-500 text-white";
    case BallOutcome.Wicket: return "bg-red-600 text-white";
    case BallOutcome.Wide:
    case BallOutcome.NoBall: return "bg-yellow-500 text-gray-900";
    default: return "bg-gray-600 text-gray-200";
  }
}

function getBallLabel(event: BallEvent): string {
  switch (event.outcome) {
    case BallOutcome.Dot: return "0";
    case BallOutcome.Wicket: return "W";
    case BallOutcome.Wide: return "Wd";
    case BallOutcome.NoBall: return "Nb";
    default: return String(event.runsScored);
  }
}

export function OverSummary({ events }: OverSummaryProps) {
  const legalBalls = events.filter((e) => !e.isExtra).length;
  const remainingSlots = Math.max(0, 6 - legalBalls);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        This Over
      </h3>
      <div className="flex gap-2 flex-wrap">
        {events.length === 0 && (
          <p className="text-gray-500 text-sm italic">New over...</p>
        )}
        {events.map((event, idx) => (
          <div
            key={idx}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${getBallStyle(event.outcome)}`}
          >
            {getBallLabel(event)}
          </div>
        ))}
        {Array.from({ length: remainingSlots }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className="w-9 h-9 rounded-full border-2 border-gray-700 flex items-center justify-center"
          />
        ))}
      </div>
    </div>
  );
}
