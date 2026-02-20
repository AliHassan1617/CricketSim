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
  if (isMatchPhase) return null;

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <div className="hidden md:flex w-56 bg-gray-900 border-r border-gray-700 flex-col min-h-screen shrink-0">
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

        <nav className="flex-1 p-2 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <p className="text-gray-600 text-xs text-center">CricketSim v2</p>
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 md:hidden z-50 flex bg-gray-900 border-t border-gray-700"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {team && (
          <div className="flex items-center px-3 border-r border-gray-700 shrink-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: team.color }}
            >
              {team.shortName.charAt(0)}
            </div>
          </div>
        )}
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              activeTab === tab.id ? "text-emerald-400" : "text-gray-500"
            }`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
