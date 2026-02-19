import { useGame } from "../state/gameContext";
import { thunderbolts, stormRiders } from "../data/teams";
import { Team } from "../types/player";

export function TeamPickScreen() {
  const { dispatch } = useGame();

  const handlePick = (team: Team) => {
    const opponent = team.id === thunderbolts.id ? stormRiders : thunderbolts;
    dispatch({ type: "PICK_TEAM", payload: { userTeam: team, opponentTeam: opponent } });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center space-y-8 max-w-2xl mx-auto px-4">
        <div>
          <h1 className="text-4xl font-extrabold text-emerald-400 mb-2">CricketSim</h1>
          <p className="text-gray-400">Choose your team</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[thunderbolts, stormRiders].map((team) => (
            <button
              key={team.id}
              onClick={() => handlePick(team)}
              className="group bg-gray-900 border-2 border-gray-700 hover:border-emerald-500 rounded-xl p-6 transition-all cursor-pointer hover:shadow-lg hover:shadow-emerald-900/20"
            >
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: team.color }}
              >
                {team.shortName.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                {team.name}
              </h2>
              <p className="text-gray-500 text-sm mt-1">{team.players.length} players</p>
              <div className="mt-3 flex justify-center gap-4 text-xs text-gray-400">
                <span>{team.players.filter((p) => p.role === "batsman").length} BAT</span>
                <span>{team.players.filter((p) => p.role === "bowler").length} BWL</span>
                <span>{team.players.filter((p) => p.role === "all-rounder").length} AR</span>
                <span>{team.players.filter((p) => p.role === "wicket-keeper").length} WK</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
