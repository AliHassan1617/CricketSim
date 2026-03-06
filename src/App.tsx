import { useEffect } from "react";
import { useGame } from "./state/gameContext";
import { startMenuMusic, stopMenuMusic } from "./utils/sounds";
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
import { WorldCupSetupScreen } from "./screens/WorldCupSetupScreen";
import { WorldCupHubScreen } from "./screens/WorldCupHubScreen";
import { MultiplayerProvider } from "./multiplayer/MultiplayerContext";

// Phases where active gameplay is happening — menu music should be silent
const GAMEPLAY_PHASES = new Set([
  GamePhase.FirstInnings,
  GamePhase.SecondInnings,
  GamePhase.ThirdInnings,
  GamePhase.FourthInnings,
  GamePhase.MultiplayerGuest,
]);

function AppContent() {
  const { state, dispatch } = useGame();

  // Start menu music on non-gameplay phases; stop it during active innings
  useEffect(() => {
    if (GAMEPLAY_PHASES.has(state.phase)) {
      stopMenuMusic();
    } else {
      startMenuMusic(); // no-op if already running
    }
  }, [state.phase]);

  // Clean up on unmount
  useEffect(() => () => stopMenuMusic(), []);

  // Full-screen phases — no sidebar
  if (state.phase === GamePhase.Start ||
      state.phase === GamePhase.ModeSelect)         return <ModeSelectScreen />;
  if (state.phase === GamePhase.ExhibitionCarousel) return <ExhibitionCarouselScreen />;
  if (state.phase === GamePhase.MatchSetup)         return <MatchSetupScreen />;
  if (state.phase === GamePhase.TeamPick)           return <TeamPickScreen />;
  if (state.phase === GamePhase.MultiplayerLobby)   return <MultiplayerLobbyScreen />;
  if (state.phase === GamePhase.MultiplayerGuest)   return <GuestMatchScreen />;
  if (state.phase === GamePhase.WCSetup)            return <WorldCupSetupScreen />;
  if (state.phase === GamePhase.WCHub)              return <WorldCupHubScreen />;

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
    case GamePhase.ThirdInnings:
    case GamePhase.FourthInnings:
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
