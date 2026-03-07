import { useEffect, useState } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { useGame } from "./state/gameContext";
import { startMenuMusic, stopMenuMusic, resumeAudio } from "./utils/sounds";
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
import { SeriesSetupScreen } from "./screens/SeriesSetupScreen";
import { SeriesHubScreen } from "./screens/SeriesHubScreen";
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

  const handleTabChange = (tab: SidebarTab) => {
    dispatch({ type: "SET_SIDEBAR_TAB", payload: { tab } });
  };

  function renderScreen() {
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
    if (state.phase === GamePhase.SeriesSetup)        return <SeriesSetupScreen />;
    if (state.phase === GamePhase.SeriesHub)          return <SeriesHubScreen />;

    // Pre-match: sidebar-driven content
    if (state.phase === GamePhase.PreMatch) {
      let content;
      switch (state.sidebarTab) {
        case SidebarTab.Squad:    content = <SquadScreen />;       break;
        case SidebarTab.Tactics:  content = <TacticsScreen />;     break;
        case SidebarTab.Match:    content = <PreMatchHubScreen />; break;
        default:                  content = <TacticsScreen />;
      }
      return (
        <Layout activeTab={state.sidebarTab} onTabChange={handleTabChange}
                team={state.userTeam} isMatchPhase={false}>
          {content}
        </Layout>
      );
    }

    // Match phases
    let matchContent;
    switch (state.phase) {
      case GamePhase.Toss:          matchContent = <TossScreen />;          break;
      case GamePhase.FirstInnings:
      case GamePhase.SecondInnings:
      case GamePhase.ThirdInnings:
      case GamePhase.FourthInnings: matchContent = <MatchScreen />;         break;
      case GamePhase.InningsSummary: matchContent = <InningsSummaryScreen />; break;
      case GamePhase.FinalScorecard: matchContent = <FinalScorecardScreen />; break;
      default:                      matchContent = <MatchScreen />;
    }
    return (
      <Layout activeTab={SidebarTab.Match} onTabChange={handleTabChange}
              team={state.userTeam} isMatchPhase={true}>
        {matchContent}
      </Layout>
    );
  }

  // key=phase triggers unmount+remount, which replays the CSS enter animation
  return (
    <div key={state.phase} style={{ height: "100%", animation: "screenFadeIn 0.18s ease both" }}>
      {renderScreen()}
    </div>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  // Resume AudioContext on first interaction so home-screen music plays immediately
  useEffect(() => {
    const handler = () => { resumeAudio(); };
    document.addEventListener("click", handler, { once: true });
    document.addEventListener("touchstart", handler, { once: true });
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  return (
    <MultiplayerProvider>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <AppContent />
    </MultiplayerProvider>
  );
}
