import { useState } from "react";
import { useGame } from "../state/gameContext";
import { PitchBadge } from "../components/PitchBadge";

type TossStep = "call" | "result" | "choose" | "ready";

export function TossScreen() {
  const { state, dispatch } = useGame();
  const [step, setStep] = useState<TossStep>("call");
  const [userCall, setUserCall] = useState<"heads" | "tails" | null>(null);
  const [flipResult, setFlipResult] = useState<"heads" | "tails" | null>(null);
  const [userWonToss, setUserWonToss] = useState(false);
  const [userBatsFirst, setUserBatsFirst] = useState(true);

  const userTeamName = state.userTeam?.name ?? "Your Team";
  const opponentTeamName = state.opponentTeam?.name ?? "Opponent";

  const handleCoinFlip = (call: "heads" | "tails") => {
    setUserCall(call);
    const result = Math.random() < 0.5 ? "heads" : "tails";
    setFlipResult(result);
    const won = call === result;
    setUserWonToss(won);

    if (!won) {
      // AI decides — randomly choose bat or bowl
      const aiBatsFirst = Math.random() < 0.5;
      setUserBatsFirst(!aiBatsFirst); // if AI bats first, user doesn't
    }

    setStep("result");
  };

  const handleChoice = (choice: "bat" | "bowl") => {
    setUserBatsFirst(choice === "bat");
    setStep("ready");
  };

  const handleConfirmToss = () => {
    dispatch({
      type: "COMPLETE_TOSS",
      payload: {
        winner: userWonToss ? "user" : "opponent",
        userBatsFirst,
      },
    });
    dispatch({ type: "START_INNINGS" });
  };

  // After AI decides, skip to ready
  const handleContinueAfterResult = () => {
    if (userWonToss) {
      setStep("choose");
    } else {
      setStep("ready");
    }
  };

  return (
    <div className="p-6 text-white flex items-center justify-center min-h-[80vh]">
      <div className="text-center space-y-6 max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-emerald-400">The Toss</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <span>Pitch:</span>
          <PitchBadge pitchType={state.pitchType} />
        </div>

        {/* Step 1: Call heads or tails */}
        {step === "call" && (
          <div className="space-y-4">
            <p className="text-lg text-gray-300">Call it in the air!</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleCoinFlip("heads")}
                className="px-8 py-4 bg-yellow-600 hover:bg-yellow-500 rounded-xl text-xl font-bold transition-colors"
              >
                Heads
              </button>
              <button
                onClick={() => handleCoinFlip("tails")}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-xl font-bold transition-colors"
              >
                Tails
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Show result */}
        {step === "result" && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-3">
              <p className="text-gray-400">
                You called: <span className="text-white font-semibold capitalize">{userCall}</span>
              </p>
              <p className="text-2xl font-bold">
                It's <span className="text-yellow-400 capitalize">{flipResult}</span>!
              </p>
              <p className={`text-xl font-bold ${userWonToss ? "text-emerald-400" : "text-red-400"}`}>
                {userWonToss
                  ? `${userTeamName} won the toss!`
                  : `${opponentTeamName} won the toss!`}
              </p>
            </div>
            <button
              onClick={handleContinueAfterResult}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-lg font-bold transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 3: User chooses (only if they won) */}
        {step === "choose" && (
          <div className="space-y-4">
            <p className="text-lg text-gray-300">
              You won the toss! What would you like to do?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleChoice("bat")}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-xl font-bold transition-colors"
              >
                Bat First
              </button>
              <button
                onClick={() => handleChoice("bowl")}
                className="px-8 py-4 bg-red-600 hover:bg-red-500 rounded-xl text-xl font-bold transition-colors"
              >
                Bowl First
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Ready to start */}
        {step === "ready" && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-3">
              <p className="text-gray-400">
                Toss won by:{" "}
                <span className="text-emerald-300 font-semibold">
                  {userWonToss ? userTeamName : opponentTeamName}
                </span>
              </p>
              <p className="text-lg">
                <span className="text-white font-semibold">{userTeamName}</span>{" "}
                will{" "}
                <span className="text-emerald-300 font-bold">
                  {userBatsFirst ? "bat" : "bowl"}
                </span>{" "}
                first
              </p>
              <p className="text-sm text-gray-500">
                {userBatsFirst
                  ? `${opponentTeamName} will bowl`
                  : `${opponentTeamName} will bat`}
              </p>
            </div>
            <button
              onClick={handleConfirmToss}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xl font-bold transition-colors"
            >
              Start Match
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
