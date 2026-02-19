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
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        team={team}
        isMatchPhase={isMatchPhase}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
