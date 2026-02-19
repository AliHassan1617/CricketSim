import { BowlerLine } from "../types/enums";

export type BowlingLineChoice = "off" | "middle" | "leg";
export type BowlingLengthChoice = "full" | "good" | "short";

interface PitchSelectorProps {
  selectedLine: BowlingLineChoice;
  selectedLength: BowlingLengthChoice;
  onSelect: (line: BowlingLineChoice, length: BowlingLengthChoice) => void;
  disabled?: boolean;
}

export function mapToEngineLine(line: BowlingLineChoice, length: BowlingLengthChoice): BowlerLine {
  if (length === "short") return BowlerLine.Short;
  if (length === "full") return BowlerLine.Full;
  if (line === "off") return BowlerLine.OutsideOff;
  if (line === "leg") return BowlerLine.OnPads;
  return BowlerLine.OnStumps;
}

const LENGTHS: BowlingLengthChoice[] = ["full", "good", "short"];
const LINES: BowlingLineChoice[] = ["off", "middle", "leg"];

const LENGTH_LABEL: Record<BowlingLengthChoice, string> = {
  full: "Full",
  good: "Good",
  short: "Short",
};

const LINE_LABEL: Record<BowlingLineChoice, string> = {
  off: "Off",
  middle: "Mid",
  leg: "Leg",
};

export function PitchSelector({ selectedLine, selectedLength, onSelect, disabled }: PitchSelectorProps) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Bowling Target</p>

      {/* Pitch visual — top-down view */}
      <div
        className="rounded-lg overflow-hidden border border-gray-600 select-none"
        style={{ background: "linear-gradient(180deg, #166534 0%, #15803d 40%, #16a34a 100%)" }}
      >
        {/* Column headers (line) */}
        <div className="flex border-b border-green-700/50">
          <div className="w-12 shrink-0" />
          {LINES.map((l) => (
            <div key={l} className="flex-1 text-center text-xs text-green-300/80 py-1 font-medium">
              {LINE_LABEL[l]}
            </div>
          ))}
        </div>

        {/* Rows (length) */}
        {LENGTHS.map((len, lenIdx) => (
          <div
            key={len}
            className={`flex ${lenIdx < LENGTHS.length - 1 ? "border-b border-green-700/40" : ""}`}
          >
            {/* Row label */}
            <div className="w-12 shrink-0 flex items-center justify-center text-xs text-green-300/70 font-medium">
              {LENGTH_LABEL[len]}
            </div>

            {/* Cells */}
            {LINES.map((ln) => {
              const isSelected = selectedLine === ln && selectedLength === len;
              return (
                <button
                  key={`${ln}-${len}`}
                  onClick={() => !disabled && onSelect(ln, len)}
                  disabled={disabled}
                  className={`flex-1 py-1.5 flex items-center justify-center transition-all ${
                    disabled ? "cursor-not-allowed" : "cursor-pointer"
                  } ${
                    isSelected
                      ? "bg-white/25 ring-2 ring-inset ring-white/60"
                      : "hover:bg-white/10"
                  }`}
                >
                  {/* Ball indicator */}
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      isSelected
                        ? "bg-red-500 border-red-300 shadow shadow-red-500/60 scale-125"
                        : "bg-transparent border-white/30"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        ))}

        {/* Stumps row at bottom */}
        <div
          className="flex items-center justify-center gap-1 py-1.5"
          style={{ background: "rgba(0,0,0,0.25)", borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          {/* Pitch crease line */}
          <div className="flex items-center gap-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1.5 h-5 bg-amber-300 rounded-sm shadow" />
            ))}
          </div>
        </div>
      </div>

      {/* Selected zone label */}
      <p className="text-center text-xs mt-1.5 font-medium text-emerald-300">
        {LENGTH_LABEL[selectedLength]} • {LINE_LABEL[selectedLine]} side
      </p>
    </div>
  );
}
