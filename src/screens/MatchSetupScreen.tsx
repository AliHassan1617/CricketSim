import { useState } from "react";
import { useGame } from "../state/gameContext";
import { STADIUMS, Stadium } from "../data/stadiums";
import { BackButton } from "../components/BackButton";
import { MatchFormat } from "../types/enums";

const FORMATS: MatchFormat[] = [MatchFormat.T5, MatchFormat.T10, MatchFormat.T20, MatchFormat.ODI, MatchFormat.Test];
const FORMAT_LABEL: Record<MatchFormat, string> = {
  [MatchFormat.T5]: "T5", [MatchFormat.T10]: "T10", [MatchFormat.T20]: "T20",
  [MatchFormat.ODI]: "ODI", [MatchFormat.Test]: "Test",
};
const FORMAT_SUB: Record<MatchFormat, string> = {
  [MatchFormat.T5]: "5 overs", [MatchFormat.T10]: "10 overs", [MatchFormat.T20]: "20 overs",
  [MatchFormat.ODI]: "50 overs · 10 overs/bowler",
  [MatchFormat.Test]: "90 overs · 4 innings",
};

const TIMES = ["Day", "Day-Night", "Night"] as const;
type TimeOfMatch = typeof TIMES[number];

const PITCH_CONDITIONS: Record<string, { pace: number; spin: number; bounce: number; color: string }> = {
  "Flat": { pace: 2, spin: 2, bounce: 2, color: "#22c55e" },
  "Seam": { pace: 4, spin: 1, bounce: 4, color: "#ef4444" },
  "Spin": { pace: 2, spin: 5, bounce: 1, color: "#3b82f6" },
};

function PitchBars({ label }: { label: "Flat" | "Seam" | "Spin" }) {
  const c = PITCH_CONDITIONS[label];
  const bars: { name: string; val: number }[] = [
    { name: "Pace", val: c.pace },
    { name: "Spin", val: c.spin },
    { name: "Bounce", val: c.bounce },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
      {bars.map(({ name, val }) => (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", width: 42, flexShrink: 0 }}>{name}</span>
          <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3,
              width: `${(val / 5) * 100}%`,
              background: c.color,
              opacity: 0.85,
            }} />
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", width: 14, textAlign: "right" }}>{val}/5</span>
        </div>
      ))}
    </div>
  );
}

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

  const handleConfirm = () => {
    dispatch({ type: "SET_FORMAT",  payload: { format } });
    dispatch({ type: "SET_STADIUM", payload: { stadium } });
    dispatch({ type: "UNLOCK_TACTICS" });
    dispatch({ type: "GO_TO_PRE_MATCH" });
  };

  return (
    <div className="relative min-h-screen text-white flex flex-col items-center justify-center px-5 py-8 overflow-hidden">
      <img
        src="/chirayu-trivedi-iDTDvSDEVjw-unsplash.jpg"
        alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ zIndex: 0 }}
      />
      <div
        className="absolute inset-0"
        style={{ zIndex: 1, background: "linear-gradient(to bottom, rgba(5,5,10,0.78) 0%, rgba(5,5,10,0.92) 100%)" }}
      />
      <div className="relative w-full max-w-sm space-y-8" style={{ zIndex: 2 }}>
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <BackButton onClick={() => dispatch({ type: "GO_TO_EXHIBITION" })} />
          <div className="text-center">
            <p className="text-[11px] text-gray-500 uppercase tracking-[0.4em] mb-1">Exhibition</p>
            <h2 className="text-2xl font-black text-white">Match Setup</h2>
          </div>
        </div>

        {/* VS hero */}
        {state.userTeam && state.opponentTeam && (
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex-1 text-center">
              <div
                className="w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-black"
                style={{ background: state.userTeam.color + "33", border: `2px solid ${state.userTeam.color}66`, color: state.userTeam.color }}
              >
                {state.userTeam.shortName}
              </div>
              <p className="text-white font-bold text-sm leading-tight">{state.userTeam.name}</p>
              <p className="text-[10px] mt-0.5 font-semibold" style={{ color: state.userTeam.color }}>You</p>
            </div>
            <div className="text-gray-600 font-black text-lg shrink-0">VS</div>
            <div className="flex-1 text-center">
              <div
                className="w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-black"
                style={{ background: state.opponentTeam.color + "33", border: `2px solid ${state.opponentTeam.color}66`, color: state.opponentTeam.color }}
              >
                {state.opponentTeam.shortName}
              </div>
              <p className="text-white font-bold text-sm leading-tight">{state.opponentTeam.name}</p>
              <p className="text-[10px] mt-0.5 text-gray-500">CPU</p>
            </div>
          </div>
        )}

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
            <div className="flex items-center gap-2 pt-1">
              <span className="text-lg">{stadium.flag}</span>
              <p className="text-xs text-gray-400">{stadium.city}, {stadium.country}</p>
              <span
                className="ml-auto text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{
                  background: PITCH_CONDITIONS[stadium.pitchLabel].color + "22",
                  color: PITCH_CONDITIONS[stadium.pitchLabel].color,
                }}
              >
                {stadium.pitchLabel}
              </span>
            </div>
            {/* Pitch condition bars */}
            <PitchBars label={stadium.pitchLabel} />
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
            <p className="text-center text-[10px] text-gray-600">{FORMAT_SUB[format]}</p>
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
