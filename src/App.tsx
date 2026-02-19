import { useGame } from "./state/gameContext";
import { GamePhase, SidebarTab } from "./types/enums";
import { Layout } from "./components/Layout";
import { TeamPickScreen } from "./screens/TeamPickScreen";
import { SquadScreen } from "./screens/SquadScreen";
import { TacticsScreen } from "./screens/TacticsScreen";
import { PreMatchHubScreen } from "./screens/PreMatchHubScreen";
import { TossScreen } from "./screens/TossScreen";
import { MatchScreen } from "./screens/MatchScreen";
import { InningsSummaryScreen } from "./screens/InningsSummaryScreen";
import { FinalScorecardScreen } from "./screens/FinalScorecardScreen";

function AppContent() {
  const { state, dispatch } = useGame();

  // Team pick screen — no sidebar
  if (state.phase === GamePhase.TeamPick) {
    return <TeamPickScreen />;
  }

  const isMatchPhase =
    state.phase === GamePhase.Toss ||
    state.phase === GamePhase.FirstInnings ||
    state.phase === GamePhase.SecondInnings ||
    state.phase === GamePhase.InningsSummary ||
    state.phase === GamePhase.FinalScorecard;

  const handleTabChange = (tab: SidebarTab) => {
    dispatch({ type: "SET_SIDEBAR_TAB", payload: { tab } });
  };

  // Pre-match: sidebar-driven content
  if (state.phase === GamePhase.PreMatch) {
    let content;
    switch (state.sidebarTab) {
      case SidebarTab.Squad:
        content = <SquadScreen />;
        break;
      case SidebarTab.Tactics:
        content = <TacticsScreen />;
        break;
      case SidebarTab.Match:
        content = <PreMatchHubScreen />;
        break;
      default:
        content = <SquadScreen />;
    }

    return (
      <Layout
        activeTab={state.sidebarTab}
        onTabChange={handleTabChange}
        team={state.userTeam}
        isMatchPhase={false}
      >
        {content}
      </Layout>
    );
  }

  // Match phases — sidebar locked to Match tab
  let matchContent;
  switch (state.phase) {
    case GamePhase.Toss:
      matchContent = <TossScreen />;
      break;
    case GamePhase.FirstInnings:
    case GamePhase.SecondInnings:
      matchContent = <MatchScreen />;
      break;
    case GamePhase.InningsSummary:
      matchContent = <InningsSummaryScreen />;
      break;
    case GamePhase.FinalScorecard:
      matchContent = <FinalScorecardScreen />;
      break;
    default:
      matchContent = <MatchScreen />;
  }

  return (
    <Layout
      activeTab={SidebarTab.Match}
      onTabChange={handleTabChange}
      team={state.userTeam}
      isMatchPhase={true}
    >
      {matchContent}
    </Layout>
  );
}

export default function App() {
  return <AppContent />;
}
