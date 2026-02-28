import { useGame } from "../state/gameContext";

export function ModeSelectScreen() {
  const { dispatch } = useGame();

  return (
    <div className="relative min-h-screen text-white flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background image */}
      <img
        src="/marcus-wallis-mUtQXjjLPbw-unsplash.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ zIndex: 0 }}
      />
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background: "linear-gradient(to bottom, rgba(5,14,24,0.6) 0%, rgba(5,14,24,0.85) 50%, rgba(5,14,24,0.97) 100%)",
        }}
      />
      <div className="relative w-full max-w-xs text-center space-y-10" style={{ zIndex: 2 }}>
        {/* Back button */}
        <button
          onClick={() => dispatch({ type: "GO_TO_START" })}
          className="absolute left-0 top-0 flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          ‹ Back
        </button>

        {/* Branding */}
        <div>
          <p className="text-[11px] text-gray-500 uppercase tracking-[0.45em] mb-3">
            Select Mode
          </p>
          <h1 className="text-5xl font-black tracking-tight text-white leading-none">
            Cricket Sim
          </h1>
        </div>

        {/* Mode buttons */}
        <div className="space-y-3">
          {/* Exhibition */}
          <button
            onClick={() => dispatch({ type: "GO_TO_EXHIBITION" })}
            className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.97]"
            style={{ background: "#f4f4f5", color: "#09090b" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f5"; }}
          >
            Exhibition
          </button>

          {/* Multiplayer */}
          <button
            onClick={() => dispatch({ type: "GO_TO_MULTIPLAYER" })}
            className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.97]"
            style={{
              background: "rgba(99,102,241,0.15)",
              color: "#a5b4fc",
              border: "1px solid rgba(99,102,241,0.35)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.25)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.15)";
            }}
          >
            Multiplayer
          </button>

          {/* World Cup — coming soon */}
          <div className="relative">
            <button
              disabled
              className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.2em] cursor-not-allowed"
              style={{
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.25)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              World Cup
            </button>
            <span
              className="absolute top-1/2 right-4 -translate-y-1/2 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(251,191,36,0.15)",
                color: "#fbbf24",
                border: "1px solid rgba(251,191,36,0.3)",
              }}
            >
              Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
