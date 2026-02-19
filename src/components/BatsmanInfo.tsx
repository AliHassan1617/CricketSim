import { formatStrikeRate } from "../utils/format";

interface BatsmanInfoProps {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  confidence: number;
  isOnStrike: boolean;
}

export function BatsmanInfo({
  name,
  runs,
  balls,
  fours,
  sixes,
  confidence,
  isOnStrike,
}: BatsmanInfoProps) {
  const sr = formatStrikeRate(runs, balls);

  return (
    <div
      className={`rounded-lg border p-2.5 transition-colors ${
        isOnStrike
          ? "border-green-600 bg-gray-800"
          : "border-gray-700 bg-gray-900"
      }`}
    >
      <div className="flex items-center gap-2">
        {isOnStrike && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-green-400" />
        )}
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-100">
          {name}
        </span>
        <span className="shrink-0 text-lg font-extrabold tabular-nums text-white">
          {runs}
          <span className="text-xs font-normal text-gray-400"> ({balls})</span>
        </span>
      </div>

      <div className="mt-1.5 flex gap-3 text-[11px]">
        <div>
          <span className="text-gray-500">SR </span>
          <span className="font-medium text-green-400">{sr}</span>
        </div>
        <div>
          <span className="text-gray-500">4s </span>
          <span className="font-medium text-yellow-400">{fours}</span>
        </div>
        <div>
          <span className="text-gray-500">6s </span>
          <span className="font-medium text-orange-400">{sixes}</span>
        </div>
        <div className="ml-auto">
          <span className="text-gray-500">Conf </span>
          <span
            className={`font-medium ${
              confidence >= 70
                ? "text-green-400"
                : confidence >= 40
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {confidence}
          </span>
        </div>
      </div>
    </div>
  );
}
