import { useGame } from "../state/gameContext";
import { SidebarTab } from "../types/enums";
import { generatePitchType } from "../engine/pitch";

function StatusRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={done ? "text-emerald-400" : "text-yellow-500"}>
        {done ? "✓" : "○"}
      </span>
      <span className={done ? "text-gray-300" : "text-gray-500"}>{label}</span>
    </div>
  );
}

export function PreMatchHubScreen() {
  const { state, dispatch } = useGame();

  const user = state.userTeam;
  const opponent = state.opponentTeam;

  if (!user || !opponent) return null;

  const xiDone = state.selectedXI.length === 11;
  const orderDone = state.battingOrder.length === 11;
  const ready = xiDone && orderDone;

  const startMatch = () => {
    if (!ready) return;
    const pitchType = generatePitchType();
    dispatch({ type: "SET_PITCH", payload: { pitchType } });
    dispatch({ type: "SET_SIDEBAR_TAB", payload: { tab: SidebarTab.Match } });
    dispatch({ type: "GO_TO_TOSS" });
  };

  const goToTactics = () => {
    dispatch({ type: "SET_SIDEBAR_TAB", payload: { tab: SidebarTab.Tactics } });
  };

  // Build a quick summary of the selected XI
  const xiPlayers = state.battingOrder.length === 11
    ? state.battingOrder.map((id) => user.players.find((p) => p.id === id))
    : state.selectedXI.map((id) => user.players.find((p) => p.id === id));

  // Opponent's best players by bowling and batting skill (for preview)
  const oppBowlers = [...opponent.players]
    .filter(p => p.role === "bowler" || p.role === "all-rounder")
    .sort((a, b) => b.bowling.mainSkill - a.bowling.mainSkill)
    .slice(0, 3);
  const oppBatsmen = [...opponent.players]
    .filter(p => p.role === "batsman" || p.role === "wicket-keeper")
    .sort((a, b) => {
      const aAvg = (a.batting.techniqueVsPace + a.batting.techniqueVsSpin) / 2;
      const bAvg = (b.batting.techniqueVsPace + b.batting.techniqueVsSpin) / 2;
      return bAvg - aAvg;
    })
    .slice(0, 3);

  const roleColor: Record<string, string> = {
    batsman: "text-blue-400",
    bowler: "text-red-400",
    "all-rounder": "text-purple-400",
    "wicket-keeper": "text-yellow-400",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-white space-y-6">

      {/* ── Fixture header ── */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <p className="text-xs text-gray-500 uppercase tracking-widest text-center mb-4">
          Upcoming Match · T10
        </p>
        <div className="flex items-center justify-between gap-4">
          {/* User team */}
          <div className="text-center flex-1">
            <div className="w-14 h-14 rounded-full bg-emerald-700 flex items-center justify-center text-2xl font-black mx-auto mb-2">
              {user.shortName.charAt(0)}
            </div>
            <p className="font-bold text-lg text-white">{user.name}</p>
            <p className="text-xs text-gray-500">{user.shortName}</p>
          </div>

          <div className="text-center shrink-0">
            <p className="text-2xl text-gray-600 font-light">VS</p>
          </div>

          {/* Opponent team */}
          <div className="text-center flex-1">
            <div className="w-14 h-14 rounded-full bg-amber-700 flex items-center justify-center text-2xl font-black mx-auto mb-2">
              {opponent.shortName.charAt(0)}
            </div>
            <p className="font-bold text-lg text-white">{opponent.name}</p>
            <p className="text-xs text-gray-500">{opponent.shortName}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Your team readiness ── */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">
            Your Setup
          </h2>
          <div className="space-y-2 mb-4">
            <StatusRow done={xiDone} label={xiDone ? "XI selected (11/11)" : `XI incomplete (${state.selectedXI.length}/11)`} />
            <StatusRow done={orderDone} label={orderDone ? "Batting order confirmed" : "Batting order not set"} />
          </div>

          {!ready && (
            <button
              onClick={goToTactics}
              className="w-full py-2 text-sm bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/40 text-yellow-400 rounded-lg font-medium transition-colors"
            >
              Go to Tactics →
            </button>
          )}

          {/* XI list */}
          {xiPlayers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800 space-y-1">
              {xiPlayers.map((p, i) => (
                p ? (
                  <div key={p.id} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-600 w-4 text-right">{i + 1}.</span>
                    <span className="text-gray-300 flex-1">{p.shortName}</span>
                    <span className={`${roleColor[p.role] ?? "text-gray-400"} capitalize`}>
                      {p.role === "wicket-keeper" ? "WK" : p.role === "all-rounder" ? "AR" : p.role.slice(0, 3)}
                    </span>
                  </div>
                ) : null
              ))}
            </div>
          )}
        </div>

        {/* ── Opponent intel ── */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
            Opponent Intel — {opponent.name}
          </h2>

          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Key Threats (Bowling)</p>
            {oppBowlers.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-xs mb-1">
                <span className="text-gray-300 flex-1">{p.shortName}</span>
                <span className="text-red-400 capitalize">{p.bowling.bowlerType}</span>
                <span className="text-red-300 font-bold w-8 text-right">{p.bowling.mainSkill}</span>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">Dangerous Batsmen</p>
            {oppBatsmen.map((p) => {
              const avg = Math.round((p.batting.techniqueVsPace + p.batting.techniqueVsSpin) / 2);
              return (
                <div key={p.id} className="flex items-center gap-2 text-xs mb-1">
                  <span className="text-gray-300 flex-1">{p.shortName}</span>
                  <span className="text-blue-400">BAT</span>
                  <span className="text-blue-300 font-bold w-8 text-right">{avg}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              <span className="text-gray-400 font-medium">{opponent.name}</span> are an{" "}
              {opponent.id === "stormriders"
                ? "aggressive, power-hitting team. Expect early fireworks but vulnerability to spin."
                : "all-round balanced side. Consistent batting and reliable bowling attack."}
            </p>
          </div>
        </div>
      </div>

      {/* ── Notes ── */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-sm text-gray-500 space-y-1">
        <p>· Pitch type is revealed at the toss.</p>
        <p>· You'll pick your bowler before each over — anyone except the wicket-keeper can bowl (max 2 overs each).</p>
        <p>· The toss winner decides who bats first.</p>
      </div>

      {/* ── Start button ── */}
      <div className="text-center pb-4">
        <button
          onClick={startMatch}
          disabled={!ready}
          className={`px-12 py-4 rounded-xl text-lg font-bold transition-all ${
            ready
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40"
              : "bg-gray-800 text-gray-600 cursor-not-allowed"
          }`}
        >
          {ready ? "Proceed to Toss →" : "Complete Setup in Tactics First"}
        </button>
      </div>
    </div>
  );
}
