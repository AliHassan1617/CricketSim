import { SidebarTab } from "../types/enums";
import { Team } from "../types/player";

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  team: Team | null;
  isMatchPhase: boolean;
}

const tabs = [
  { id: SidebarTab.Squad, label: "Squad", icon: "👥" },
  { id: SidebarTab.Tactics, label: "Tactics", icon: "📋" },
  { id: SidebarTab.Match, label: "Match", icon: "🏏" },
];

export function Sidebar({ activeTab, onTabChange, team, isMatchPhase }: SidebarProps) {
  return (
    <div className="w-56 bg-gray-900 border-r border-gray-700 flex flex-col min-h-screen">
      {/* Team header */}
      <div className="p-4 border-b border-gray-700">
        {team ? (
          <>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2"
              style={{ backgroundColor: team.color }}
            >
              {team.shortName.charAt(0)}
            </div>
            <h2 className="text-white font-bold text-sm">{team.name}</h2>
            <p className="text-gray-500 text-xs">{team.shortName}</p>
          </>
        ) : (
          <h2 className="text-gray-400 text-sm">No Team Selected</h2>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            disabled={isMatchPhase && tab.id !== SidebarTab.Match}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            } ${
              isMatchPhase && tab.id !== SidebarTab.Match
                ? "opacity-40 cursor-not-allowed"
                : ""
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-gray-600 text-xs text-center">CricketSim v2</p>
      </div>
    </div>
  );
}
