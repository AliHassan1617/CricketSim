import { useState } from "react";
import { useGame } from "../state/gameContext";
import { SidebarTab } from "../types/enums";

import { PlayerCard } from "../components/PlayerCard";
import { PlayerProfileModal } from "../components/PlayerProfileModal";

type Step = "select" | "ready";

export function TacticsScreen() {
  const { state, dispatch } = useGame();
  const team = state.userTeam;

  const [step, setStep] = useState<Step>(
    state.selectedXI.length === 11 ? "ready" : "select"
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(state.selectedXI);

  if (!team) return null;

  // Must have gone through MatchSetup first (which dispatches UNLOCK_TACTICS)
  if (!state.tacticsUnlocked) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-white flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <div className="text-5xl mb-2">🔒</div>
        <h2 className="text-xl font-bold text-gray-300">Tactics Locked</h2>
        <p className="text-gray-500 max-w-sm">
          Go to the <span className="text-emerald-400 font-semibold">Match</span> tab to set up the match first.
        </p>
        <button
          onClick={() => dispatch({ type: "SET_SIDEBAR_TAB", payload: { tab: SidebarTab.Match } })}
          className="mt-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-sm font-bold transition-colors"
        >
          Go to Match →
        </button>
      </div>
    );
  }

  const selectedPlayer = state.selectedPlayerId
    ? team.players.find((p) => p.id === state.selectedPlayerId) ?? null
    : null;

  const togglePlayer = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 11) return prev;
      return [...prev, id];
    });
  };

  const confirmSelection = () => {
    dispatch({ type: "SET_SELECTED_XI", payload: { playerIds: selectedIds } });
    setStep("ready");
  };

  const startMatch = () => {
    dispatch({ type: "SET_SIDEBAR_TAB", payload: { tab: SidebarTab.Match } });
    dispatch({ type: "GO_TO_TOSS" });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <h1 className="text-2xl font-bold text-emerald-400 mb-6">Pick Your XI</h1>

      {step === "select" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Select Your XI ({selectedIds.length}/11)
            </h2>
            <button
              onClick={confirmSelection}
              disabled={selectedIds.length !== 11}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-semibold transition-colors"
            >
              Confirm XI
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {team.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isSelected={selectedIds.includes(player.id)}
                onToggle={() => togglePlayer(player.id)}
                onClickName={() =>
                  dispatch({ type: "OPEN_PLAYER_PROFILE", payload: { playerId: player.id } })
                }
              />
            ))}
          </div>
        </div>
      )}

      {step === "ready" && (
        <div className="text-center space-y-6 py-12">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Squad Ready</h2>
            <p className="text-gray-400">{selectedIds.length} players selected</p>
            <p className="text-xs text-gray-600 mt-1">
              You'll choose your openers after the toss and pick the next batsman on each wicket.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-md mx-auto text-left">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Selected XI
            </h3>
            <div className="space-y-1">
              {selectedIds.map((id, i) => {
                const player = team.players.find((p) => p.id === id);
                return (
                  <div key={id} className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-400 font-bold w-5">#{i + 1}</span>
                    <span className="text-white">{player?.shortName}</span>
                    <span className="text-gray-500 text-xs capitalize">({player?.role})</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setStep("select")}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Edit Team
            </button>
            <button
              onClick={startMatch}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-lg font-bold transition-colors"
            >
              Start Match
            </button>
          </div>
        </div>
      )}

      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={() => dispatch({ type: "CLOSE_PLAYER_PROFILE" })}
        />
      )}
    </div>
  );
}
