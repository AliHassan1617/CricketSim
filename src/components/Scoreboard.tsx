import { PitchBadge } from "./PitchBadge";

interface ScoreboardProps {
  runs: number;
  wickets: number;
  overs: string;
  runRate: string;
  target?: number;
  requiredRate?: string;
  pitchType: string;
  isSecondInnings: boolean;
}

export function Scoreboard({
  runs,
  wickets,
  overs,
  runRate,
  target,
  requiredRate,
  pitchType,
  isSecondInnings,
}: ScoreboardProps) {
  const runsNeeded = target !== undefined ? target - runs : undefined;

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold tabular-nums text-white">
            {runs}/{wickets}
          </span>
          <span className="text-sm text-gray-400">({overs} ov)</span>
        </div>
        <PitchBadge pitchType={pitchType} />
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <div>
          <span className="text-gray-500">CRR </span>
          <span className="font-semibold text-green-400">{runRate}</span>
        </div>

        {isSecondInnings && target !== undefined && (
          <>
            <div>
              <span className="text-gray-500">Target </span>
              <span className="font-semibold text-yellow-400">{target}</span>
            </div>
            {runsNeeded !== undefined && runsNeeded > 0 && (
              <div>
                <span className="text-gray-500">Need </span>
                <span className="font-semibold text-orange-400">{runsNeeded}</span>
              </div>
            )}
            {requiredRate && (
              <div>
                <span className="text-gray-500">RRR </span>
                <span className="font-semibold text-red-400">{requiredRate}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
