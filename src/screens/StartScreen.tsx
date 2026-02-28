import { useGame } from "../state/gameContext";

export function StartScreen() {
  const { dispatch } = useGame();

  return (
    <div className="relative min-h-screen text-white flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background image */}
      <img
        src="/mainmenu.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ zIndex: 0 }}
      />
      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background: "linear-gradient(to bottom, rgba(5,10,20,0.55) 0%, rgba(5,10,20,0.80) 50%, rgba(5,10,20,0.95) 100%)",
        }}
      />

      <div className="relative w-full max-w-xs text-center space-y-10" style={{ zIndex: 2 }}>

        {/* Branding */}
        <div>
          <p className="text-[11px] text-gray-300 uppercase tracking-[0.45em] mb-6">
            by Ali Hassan
          </p>
          <h1 className="text-7xl font-black tracking-tight text-white leading-none drop-shadow-lg">
            Cricket
          </h1>
          <h1
            className="text-7xl font-black tracking-tight leading-none drop-shadow-lg"
            style={{ color: "#e2e8f0" }}
          >
            Sim
          </h1>
        </div>

        {/* Play button */}
        <button
          onClick={() => dispatch({ type: "START_GAME" })}
          className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.97]"
          style={{ background: "#f4f4f5", color: "#09090b" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f5"; }}
        >
          Play
        </button>

        {/* Footer */}
        <p className="text-[10px] text-gray-500 tracking-wider">v0.1 alpha</p>
      </div>
    </div>
  );
}
