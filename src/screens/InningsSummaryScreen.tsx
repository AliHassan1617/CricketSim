import { useGame } from "../state/gameContext";
import { MiniScorecard } from "../components/MiniScorecard";
import { PitchBadge } from "../components/PitchBadge";
import { getAllPlayers } from "../state/selectors";

export function InningsSummaryScreen() {
  const { state, dispatch } = useGame();
  const innings = state.firstInnings;
  const allPlayers = getAllPlayers(state);

  if (!innings) return null;

  const handleStartSecondInnings = () => {
    dispatch({ type: "START_SECOND_INNINGS" });
    dispatch({ type: "START_INNINGS" });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-emerald-400 mb-2">
          End of First Innings
        </h1>
        <p className="text-sm text-gray-500 mb-2">
          {innings.battingTeamName} vs {innings.bowlingTeamName}
        </p>
        <div className="text-4xl font-bold">
          {innings.battingTeamName}: {innings.totalRuns}/{innings.totalWickets}
        </div>
        <div className="text-gray-400 mt-1">
          ({innings.totalOvers}.{innings.ballsInCurrentOver} overs)
        </div>
        <div className="mt-2">
          <PitchBadge pitchType={state.pitchType} />
        </div>
      </div>

      <MiniScorecard
        batsmen={innings.batsmen}
        bowlers={innings.bowlers}
        players={allPlayers}
      />

      <div className="mt-4 text-center text-lg text-gray-300">
        <p>
          Target for 2nd innings:{" "}
          <span className="text-emerald-400 font-bold text-xl">
            {innings.totalRuns + 1}
          </span>{" "}
          runs
        </p>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handleStartSecondInnings}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xl font-bold transition-colors"
        >
          Start 2nd Innings
        </button>
      </div>
    </div>
  );
}
