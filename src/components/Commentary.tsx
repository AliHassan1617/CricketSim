import { BallEvent } from "../types/match";
import { BallOutcome } from "../types/enums";

interface CommentaryProps {
  events: BallEvent[];
}

function getOutcomeColor(outcome: BallOutcome): string {
  switch (outcome) {
    case BallOutcome.Dot: return "text-gray-400";
    case BallOutcome.Single:
    case BallOutcome.Double:
    case BallOutcome.Three: return "text-green-400";
    case BallOutcome.Four: return "text-blue-400";
    case BallOutcome.Six: return "text-purple-400";
    case BallOutcome.Wicket: return "text-red-400";
    case BallOutcome.Wide:
    case BallOutcome.NoBall: return "text-yellow-400";
    default: return "text-gray-300";
  }
}

export function Commentary({ events }: CommentaryProps) {
  const recentEvents = [...events].reverse().slice(0, 10);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Commentary
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {recentEvents.length === 0 && (
          <p className="text-gray-500 text-sm italic">No balls bowled yet...</p>
        )}
        {recentEvents.map((event, idx) => (
          <div
            key={`${event.overNumber}-${event.ballNumber}-${idx}`}
            className={`text-sm leading-relaxed ${idx === 0 ? "opacity-100" : "opacity-70"}`}
          >
            <span className="text-emerald-500 font-mono font-semibold mr-2">
              {event.overNumber}.{event.ballNumber}
            </span>
            <span className={getOutcomeColor(event.outcome)}>{event.commentary}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
