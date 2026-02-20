import { useGame } from "../state/gameContext";
import { PlayerProfileModal } from "../components/PlayerProfileModal";
import { Player } from "../types/player";

// ── Stat colour coding (0-100 scale, FM-inspired) ──────────────────────────
function statColor(v: number): string {
  if (v >= 80) return "text-emerald-400 font-bold";
  if (v >= 65) return "text-green-400";
  if (v >= 50) return "text-yellow-400";
  if (v >= 35) return "text-orange-400";
  return "text-gray-600";
}

function Stat({ value }: { value: number }) {
  return (
    <td className={`text-center text-xs tabular-nums py-2.5 px-1 ${statColor(value)}`}>
      {value}
    </td>
  );
}

// ── Role config ─────────────────────────────────────────────────────────────
const ROLE_GROUPS: { role: Player["role"]; label: string; abbr: string; badgeColor: string }[] = [
  { role: "batsman",       label: "Batsmen",         abbr: "BAT", badgeColor: "bg-blue-900/50 text-blue-300 border-blue-700/50" },
  { role: "wicket-keeper", label: "Wicket-Keepers",  abbr: "WK",  badgeColor: "bg-yellow-900/50 text-yellow-300 border-yellow-700/50" },
  { role: "all-rounder",   label: "All-Rounders",    abbr: "AR",  badgeColor: "bg-purple-900/50 text-purple-300 border-purple-700/50" },
  { role: "bowler",        label: "Bowlers",         abbr: "BWL", badgeColor: "bg-red-900/50 text-red-300 border-red-700/50" },
];

const ROLE_HEADING_COLOR: Record<string, string> = {
  batsman: "text-blue-400",
  "wicket-keeper": "text-yellow-400",
  "all-rounder": "text-purple-400",
  bowler: "text-red-400",
};

// ── Column header ────────────────────────────────────────────────────────────
function ColHeader({ label, title }: { label: string; title?: string }) {
  return (
    <th
      title={title}
      className="text-center text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-1 pb-2 cursor-help"
    >
      {label}
    </th>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export function SquadScreen() {
  const { state, dispatch } = useGame();
  const team = state.userTeam;
  if (!team) return null;

  const selectedPlayer = state.selectedPlayerId
    ? team.players.find((p) => p.id === state.selectedPlayerId) ?? null
    : null;

  const openProfile = (id: string) =>
    dispatch({ type: "OPEN_PLAYER_PROFILE", payload: { playerId: id } });

  const grouped = ROLE_GROUPS.map((g) => ({
    ...g,
    players: team.players.filter((p) => p.role === g.role),
  })).filter((g) => g.players.length > 0);

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-emerald-400">{team.name}</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {team.players.length} players — click a row to view full profile
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm min-w-[680px]">
          <thead className="bg-gray-900 border-b border-gray-800">
            <tr>
              {/* Identity columns */}
              <th className="text-left text-[10px] uppercase tracking-wider text-gray-500 font-semibold pl-4 pr-2 pb-2 pt-3 w-8">#</th>
              <th className="text-left text-[10px] uppercase tracking-wider text-gray-500 font-semibold pr-4 pb-2 pt-3">Name</th>
              <th className="text-center text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-3 pb-2 pt-3">Role</th>

              {/* Batting section */}
              <th colSpan={5} className="text-center text-[10px] uppercase tracking-wider text-blue-500/70 font-semibold px-1 pb-0 pt-3 border-l border-gray-800">
                Batting
              </th>

              {/* Bowling section */}
              <th colSpan={5} className="text-center text-[10px] uppercase tracking-wider text-red-500/70 font-semibold px-1 pb-0 pt-3 border-l border-gray-800">
                Bowling
              </th>
            </tr>
            <tr className="bg-gray-900">
              <th colSpan={3} />
              {/* Batting sub-headers */}
              <ColHeader label="TvP" title="Technique vs Pace" />
              <ColHeader label="TvS" title="Technique vs Spin" />
              <ColHeader label="PWR" title="Power" />
              <ColHeader label="TMP" title="Temperament" />
              <ColHeader label="ACC" title="Acceleration" />
              {/* Bowling sub-headers */}
              <ColHeader label="SKL" title="Main Skill (Pace/Spin)" />
              <ColHeader label="CTR" title="Control" />
              <ColHeader label="VAR" title="Variation" />
              <ColHeader label="DTH" title="Death Bowling" />
              <ColHeader label="PRS" title="Pressure Handling" />
            </tr>
          </thead>
          <tbody>
            {grouped.map(({ role, label, abbr, badgeColor, players }) => (
              <>
                {/* Role section heading row */}
                <tr key={`group-${role}`} className="bg-gray-950">
                  <td
                    colSpan={13}
                    className={`pl-4 py-1.5 text-[10px] font-bold uppercase tracking-widest ${ROLE_HEADING_COLOR[role]}`}
                  >
                    {label}
                  </td>
                </tr>

                {/* Player rows */}
                {players.map((player, idx) => (
                  <tr
                    key={player.id}
                    onClick={() => openProfile(player.id)}
                    className="border-t border-gray-800/60 hover:bg-emerald-950/20 hover:border-emerald-900/40 cursor-pointer transition-colors group"
                  >
                    {/* # */}
                    <td className="pl-4 pr-2 py-2.5 text-xs text-gray-600 tabular-nums">
                      {idx + 1}
                    </td>

                    {/* Name */}
                    <td className="pr-4 py-2.5">
                      <span className="font-medium text-white group-hover:text-emerald-300 transition-colors">
                        {player.shortName}
                      </span>
                      {player.bowling.bowlerType === "spin" && (
                        <span className="ml-2 text-[10px] text-purple-400/70 italic">spin</span>
                      )}
                    </td>

                    {/* Role badge */}
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeColor}`}>
                        {abbr}
                      </span>
                    </td>

                    {/* Batting stats */}
                    <Stat value={player.batting.techniqueVsPace} />
                    <Stat value={player.batting.techniqueVsSpin} />
                    <Stat value={player.batting.power} />
                    <Stat value={player.batting.temperament} />
                    <Stat value={player.batting.acceleration} />

                    {/* Bowling stats */}
                    <Stat value={player.bowling.mainSkill} />
                    <Stat value={player.bowling.control} />
                    <Stat value={player.bowling.variation} />
                    <Stat value={player.bowling.deathBowling} />
                    <Stat value={player.bowling.pressureHandling} />
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-[10px]">
        <span className="text-gray-600">Attribute key:</span>
        <span className="text-emerald-400 font-bold">80+ Elite</span>
        <span className="text-green-400">65+ Good</span>
        <span className="text-yellow-400">50+ Average</span>
        <span className="text-orange-400">35+ Below avg</span>
        <span className="text-gray-600">— Weak</span>
      </div>

      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={() => dispatch({ type: "CLOSE_PLAYER_PROFILE" })}
        />
      )}
    </div>
  );
}
