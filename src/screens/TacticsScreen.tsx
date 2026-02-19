import { useState } from "react";
import { useGame } from "../state/gameContext";
import { SidebarTab } from "../types/enums";
import { PlayerCard } from "../components/PlayerCard";
import { BattingOrderList } from "../components/BattingOrderList";
import { PlayerProfileModal } from "../components/PlayerProfileModal";
import { generatePitchType } from "../engine/pitch";

type Step = "select" | "order" | "ready";

export function TacticsScreen() {
  const { state, dispatch } = useGame();
  const team = state.userTeam;

  const [step, setStep] = useState<Step>(
    state.selectedXI.length === 11 && state.battingOrder.length === 11
      ? "ready"
      : state.selectedXI.length === 11
      ? "order"
      : "select"
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(state.selectedXI);
  const [battingOrder, setBattingOrder] = useState<string[]>(state.battingOrder);

  if (!team) return null;

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
    setBattingOrder(selectedIds);
    dispatch({ type: "SET_SELECTED_XI", payload: { playerIds: selectedIds } });
    setStep("order");
  };

  const confirmOrder = () => {
    dispatch({ type: "SET_BATTING_ORDER", payload: { order: battingOrder } });
    setStep("ready");
  };

  const startMatch = () => {
    const pitchType = generatePitchType();
    dispatch({ type: "SET_PITCH", payload: { pitchType } });
    dispatch({ type: "SET_SIDEBAR_TAB", payload: { tab: SidebarTab.Match } });
    dispatch({ type: "GO_TO_TOSS" });
  };

  const selectedPlayers = team.players.filter((p) => selectedIds.includes(p.id));

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <h1 className="text-2xl font-bold text-emerald-400 mb-6">Tactics</h1>

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
              Next: Batting Order
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

      {step === "order" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Set Batting Order</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setStep("select")}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={confirmOrder}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold transition-colors"
              >
                Confirm Order
              </button>
            </div>
          </div>
          <BattingOrderList
            players={selectedPlayers}
            order={battingOrder}
            onReorder={setBattingOrder}
          />
          <p className="text-xs text-gray-500 mt-3">
            Any player except the wicket-keeper can bowl — you'll pick your bowler before each over during the match.
          </p>
        </div>
      )}

      {step === "ready" && (
        <div className="text-center space-y-6 py-12">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Team Setup Complete</h2>
            <p className="text-gray-400">{selectedIds.length} players selected</p>
            <p className="text-xs text-gray-600 mt-1">
              You'll choose your bowler before each over during the match.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-md mx-auto text-left">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Batting Order
            </h3>
            <div className="space-y-1">
              {battingOrder.map((id, i) => {
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
