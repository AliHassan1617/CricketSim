interface BowlerInfoProps {
  name: string;
  overs: string;
  runsConceded: number;
  wickets: number;
  economy: string;
  confidence: number;
}

export function BowlerInfo({
  name,
  overs,
  runsConceded,
  wickets,
  economy,
  confidence,
}: BowlerInfoProps) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 p-2.5">
      <div className="flex items-center justify-between">
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-100">
          {name}
        </span>
        <span className="shrink-0 tabular-nums text-sm font-bold text-white">
          {wickets}-{runsConceded}
          <span className="text-xs font-normal text-gray-400"> ({overs})</span>
        </span>
      </div>

      <div className="mt-1.5 flex gap-3 text-[11px]">
        <div>
          <span className="text-gray-500">Econ </span>
          <span
            className={`font-medium ${
              parseFloat(economy) <= 6.0
                ? "text-green-400"
                : parseFloat(economy) <= 8.0
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {economy}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Wkts </span>
          <span className="font-medium text-blue-400">{wickets}</span>
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
