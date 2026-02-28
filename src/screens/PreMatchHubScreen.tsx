import { useGame } from "../state/gameContext";
import { SidebarTab } from "../types/enums";

export function PreMatchHubScreen() {
  const { state, dispatch } = useGame();

  const user = state.userTeam;
  const opponent = state.opponentTeam;

  if (!user || !opponent) return null;

  const maxBowlerOvers =
    state.format === "T5"  ? 1 :
    state.format === "T10" ? 2 : 4;

  const goToTactics = () => {
    dispatch({ type: "UNLOCK_TACTICS" });
    dispatch({ type: "SET_SIDEBAR_TAB", payload: { tab: SidebarTab.Tactics } });
  };

  // Opponent's key threats
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

  return (
    <div className="p-6 max-w-4xl mx-auto text-white space-y-6">

      {/* ── Fixture header ── */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <p className="text-xs text-gray-500 uppercase tracking-widest text-center mb-4">
          Upcoming Match
        </p>
        <div className="flex items-center justify-between gap-4">
          <div className="text-center flex-1">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-sm font-extrabold tracking-wide mx-auto mb-2"
                 style={{ backgroundColor: user.color }}>
              {user.shortName}
            </div>
            <p className="font-bold text-lg text-white">{user.name}</p>
          </div>
          <p className="text-2xl text-gray-600 font-light shrink-0">VS</p>
          <div className="text-center flex-1">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-sm font-extrabold tracking-wide mx-auto mb-2"
                 style={{ backgroundColor: opponent.color }}>
              {opponent.shortName}
            </div>
            <p className="font-bold text-lg text-white">{opponent.name}</p>
          </div>
        </div>
      </div>

      {/* ── Opponent intel ── */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
          Opponent Intel — {opponent.name}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-2">Key Bowlers</p>
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
        </div>
        <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-gray-800">
          {opponent.id === "pakistan"
            ? "Aggressive, power-hitting team. Expect early fireworks but vulnerability to spin."
            : "All-round balanced side. Consistent batting and reliable bowling attack."}
        </p>
      </div>

      {/* ── Notes ── */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-sm text-gray-500 space-y-1">
        <p>· Pitch type is revealed at the toss.</p>
        <p>· You'll pick your bowler before each over — anyone except the wicket-keeper can bowl (max {maxBowlerOvers} over{maxBowlerOvers > 1 ? "s" : ""} each in {state.format}).</p>
        <p>· The toss winner decides who bats first.</p>
      </div>

      {/* ── Main CTA ── */}
      <div className="text-center pb-4">
        <button
          onClick={goToTactics}
          className="px-12 py-4 rounded-xl text-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition-all active:scale-[0.98]"
        >
          Select Starting XI →
        </button>
        <p className="text-xs text-gray-600 mt-2">Choose your 11, set the batting order, then start the match</p>
      </div>

    </div>
  );
}
