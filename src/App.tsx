import { useGame } from "./state/gameContext";
import { GamePhase, SidebarTab } from "./types/enums";
import { Layout } from "./components/Layout";
import { StartScreen } from "./screens/StartScreen";
import { ModeSelectScreen } from "./screens/ModeSelectScreen";
import { ExhibitionCarouselScreen } from "./screens/ExhibitionCarouselScreen";
import { MatchSetupScreen } from "./screens/MatchSetupScreen";
import { TeamPickScreen } from "./screens/TeamPickScreen";
import { SquadScreen } from "./screens/SquadScreen";
import { TacticsScreen } from "./screens/TacticsScreen";
import { PreMatchHubScreen } from "./screens/PreMatchHubScreen";
import { TossScreen } from "./screens/TossScreen";
import { MatchScreen } from "./screens/MatchScreen";
import { InningsSummaryScreen } from "./screens/InningsSummaryScreen";
import { FinalScorecardScreen } from "./screens/FinalScorecardScreen";
import { MultiplayerLobbyScreen } from "./screens/MultiplayerLobbyScreen";
import { GuestMatchScreen } from "./screens/GuestMatchScreen";
import { MultiplayerProvider } from "./multiplayer/MultiplayerContext";

function AppContent() {
  const { state, dispatch } = useGame();

  // Full-screen phases — no sidebar
  if (state.phase === GamePhase.Start)              return <StartScreen />;
  if (state.phase === GamePhase.ModeSelect)         return <ModeSelectScreen />;
  if (state.phase === GamePhase.ExhibitionCarousel) return <ExhibitionCarouselScreen />;
  if (state.phase === GamePhase.MatchSetup)         return <MatchSetupScreen />;
  if (state.phase === GamePhase.TeamPick)           return <TeamPickScreen />;
  if (state.phase === GamePhase.MultiplayerLobby)   return <MultiplayerLobbyScreen />;
  if (state.phase === GamePhase.MultiplayerGuest)   return <GuestMatchScreen />;

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
        content = <TacticsScreen />;
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
  return (
    <MultiplayerProvider>
      <AppContent />
    </MultiplayerProvider>
  );
}
