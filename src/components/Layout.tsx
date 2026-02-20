import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { SidebarTab } from "../types/enums";
import { Team } from "../types/player";

interface LayoutProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  team: Team | null;
  isMatchPhase: boolean;
  children: ReactNode;
}

export function Layout({ activeTab, onTabChange, team, isMatchPhase, children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        team={team}
        isMatchPhase={isMatchPhase}
      />
      {/* safe-pb-tab: tab-bar height + device safe-area on mobile, 0 on desktop */}
      <main className="flex-1 min-h-0 overflow-y-auto safe-pb-tab">
        {children}
      </main>
    </div>
  );
}
