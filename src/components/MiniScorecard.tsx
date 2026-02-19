import { BatsmanInnings, BowlerSpell } from "../types/match";
import { Player } from "../types/player";
import { formatStrikeRate, formatEconomy, formatOvers } from "../utils/format";

interface MiniScorecardProps {
  batsmen: BatsmanInnings[];
  bowlers: BowlerSpell[];
  players: Player[];
}

function getPlayerName(players: Player[], playerId: string): string {
  const player = players.find((p) => p.id === playerId);
  return player?.shortName ?? "Unknown";
}

export function MiniScorecard({ batsmen, bowlers, players }: MiniScorecardProps) {
  const activeBatsmen = batsmen.filter((b) => b.balls > 0 || (!b.isOut && b.balls === 0));

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 space-y-4">
      {/* Batting */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Batting
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-gray-700">
                <th className="text-left py-1.5 pr-2">Batter</th>
                <th className="text-left py-1.5 pr-2">How Out</th>
                <th className="text-right py-1.5 px-1">R</th>
                <th className="text-right py-1.5 px-1">B</th>
                <th className="text-right py-1.5 px-1">4s</th>
                <th className="text-right py-1.5 px-1">6s</th>
                <th className="text-right py-1.5 pl-1">SR</th>
              </tr>
            </thead>
            <tbody>
              {activeBatsmen.map((bat) => (
                <tr
                  key={bat.playerId}
                  className={`border-b border-gray-800 ${
                    bat.isOut ? "text-gray-500" : "text-gray-200"
                  }`}
                >
                  <td className="py-1.5 pr-2 font-medium whitespace-nowrap">
                    {getPlayerName(players, bat.playerId)}
                    {!bat.isOut && bat.balls > 0 && <span className="text-emerald-500 ml-1">*</span>}
                  </td>
                  <td className="py-1.5 pr-2 text-gray-400 text-xs">
                    {bat.isOut ? bat.dismissalType : "not out"}
                  </td>
                  <td className="text-right py-1.5 px-1 font-semibold">{bat.runs}</td>
                  <td className="text-right py-1.5 px-1">{bat.balls}</td>
                  <td className="text-right py-1.5 px-1">{bat.fours}</td>
                  <td className="text-right py-1.5 px-1">{bat.sixes}</td>
                  <td className="text-right py-1.5 pl-1 text-gray-400">
                    {formatStrikeRate(bat.runs, bat.balls)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bowling */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Bowling
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-gray-700">
                <th className="text-left py-1.5 pr-2">Bowler</th>
                <th className="text-right py-1.5 px-1">O</th>
                <th className="text-right py-1.5 px-1">R</th>
                <th className="text-right py-1.5 px-1">W</th>
                <th className="text-right py-1.5 pl-1">Econ</th>
              </tr>
            </thead>
            <tbody>
              {bowlers.map((bowl) => {
                const totalBalls = bowl.overs * 6 + bowl.ballsInCurrentOver;
                return (
                  <tr key={bowl.playerId} className="border-b border-gray-800 text-gray-200">
                    <td className="py-1.5 pr-2 font-medium whitespace-nowrap">
                      {getPlayerName(players, bowl.playerId)}
                    </td>
                    <td className="text-right py-1.5 px-1">{formatOvers(totalBalls)}</td>
                    <td className="text-right py-1.5 px-1">{bowl.runsConceded}</td>
                    <td className="text-right py-1.5 px-1 font-semibold text-emerald-400">
                      {bowl.wickets}
                    </td>
                    <td className="text-right py-1.5 pl-1 text-gray-400">
                      {formatEconomy(bowl.runsConceded, totalBalls)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
