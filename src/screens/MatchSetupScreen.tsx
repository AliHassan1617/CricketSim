import { useState } from "react";
import { useGame } from "../state/gameContext";
import { STADIUMS, Stadium } from "../data/stadiums";
import { MatchFormat } from "../types/enums";

const FORMATS: MatchFormat[] = [MatchFormat.T5, MatchFormat.T10, MatchFormat.T20];
const FORMAT_LABEL: Record<MatchFormat, string> = {
  [MatchFormat.T5]: "T5", [MatchFormat.T10]: "T10", [MatchFormat.T20]: "T20",
};

const TIMES = ["Day", "Day-Night", "Night"] as const;
type TimeOfMatch = typeof TIMES[number];

const PITCH_PILL: Record<string, { bg: string; text: string; dot: string }> = {
  "Flat":  { bg: "rgba(34,197,94,0.15)",  text: "#4ade80", dot: "#22c55e" },
  "Seam":  { bg: "rgba(239,68,68,0.15)",  text: "#fca5a5", dot: "#ef4444" },
  "Spin":  { bg: "rgba(59,130,246,0.15)", text: "#93c5fd", dot: "#3b82f6" },
};

function ArrowControl<T>({
  value, options, onChange, label,
}: {
  value: T; options: readonly T[]; onChange: (v: T) => void; label: (v: T) => string;
}) {
  const idx = options.indexOf(value);
  const prev = () => onChange(options[(idx - 1 + options.length) % options.length]);
  const next = () => onChange(options[(idx + 1) % options.length]);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={prev}
        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-gray-400 transition-colors"
        style={{ background: "rgba(255,255,255,0.06)" }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
      >
        ‹
      </button>
      <span className="flex-1 text-center text-white font-bold text-sm">{label(value)}</span>
      <button
        onClick={next}
        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-gray-400 transition-colors"
        style={{ background: "rgba(255,255,255,0.06)" }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
      >
        ›
      </button>
    </div>
  );
}

export function MatchSetupScreen() {
  const { state, dispatch } = useGame();

  const [stadiumIdx, setStadiumIdx] = useState(0);
  const [format, setFormat]         = useState<MatchFormat>(MatchFormat.T20);
  const [time, setTime]             = useState<TimeOfMatch>("Day");

  const stadium: Stadium = STADIUMS[stadiumIdx];
  const pill = PITCH_PILL[stadium.pitchLabel];

  const handleConfirm = () => {
    dispatch({ type: "SET_FORMAT",  payload: { format } });
    dispatch({ type: "SET_STADIUM", payload: { stadium } });
    dispatch({ type: "UNLOCK_TACTICS" });
    dispatch({ type: "GO_TO_PRE_MATCH" });
  };

  return (
    <div
      className="min-h-screen text-white flex flex-col items-center justify-center px-5 py-8"
      style={{ background: "linear-gradient(160deg, #050e18 0%, #0a0a0a 50%, #050e18 100%)" }}
    >
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center">
          <p className="text-[11px] text-gray-500 uppercase tracking-[0.4em] mb-1">Exhibition</p>
          <h2 className="text-2xl font-black text-white">Match Setup</h2>
          {state.userTeam && state.opponentTeam && (
            <p className="text-gray-500 text-xs mt-1">
              {state.userTeam.name} <span className="text-gray-700">vs</span> {state.opponentTeam.name}
            </p>
          )}
        </div>

        {/* Setup sections */}
        <div className="space-y-5">

          {/* Stadium */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Stadium</p>
            <ArrowControl
              value={stadiumIdx}
              options={STADIUMS.map((_, i) => i)}
              onChange={setStadiumIdx}
              label={() => stadium.name}
            />
            {/* Stadium detail */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{stadium.flag}</span>
                <div>
                  <p className="text-xs text-gray-400 leading-tight">{stadium.city}, {stadium.country}</p>
                </div>
              </div>
              {/* Pitch type pill */}
              <span
                className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1"
                style={{ background: pill.bg, color: pill.text }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: pill.dot }}
                />
                {stadium.pitchLabel}
              </span>
            </div>
          </div>

          {/* Format */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Format</p>
            <ArrowControl
              value={format}
              options={FORMATS}
              onChange={setFormat}
              label={(f) => FORMAT_LABEL[f]}
            />
          </div>

          {/* Time of Match — cosmetic */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Time of Match</p>
            <ArrowControl
              value={time}
              options={TIMES}
              onChange={setTime}
              label={(t) => t}
            />
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.97]"
          style={{ background: "#f4f4f5", color: "#09090b" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f5"; }}
        >
          Confirm & Pick Your Squad →
        </button>
      </div>
    </div>
  );
}
