import { useState } from "react";
import { useGame } from "../state/gameContext";
import { PitchBadge } from "../components/PitchBadge";

type TossStep = "call" | "flipping" | "result" | "choose" | "ready";

const PITCH_DESC: Record<string, string> = {
  flat: "Flat pitch · Expect high scores",
  "spin-friendly": "Spin-friendly · Turn on offer",
  "seam-friendly": "Seam-friendly · Pace bowlers rule",
};

// Simple coin face — shows the label text inside the gold circle
function CoinFace({
  label,
  spinning = false,
  size = 112,
}: {
  label: string;
  spinning?: boolean;
  size?: number;
}) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-black select-none"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #92400e, #fbbf24, #92400e)",
        boxShadow: "0 0 40px rgba(251,191,36,0.25), inset 0 2px 4px rgba(255,255,255,0.25)",
        animation: spinning ? "coinFlip 1.4s ease-in-out" : undefined,
        fontSize: size * 0.32,
        color: "#451a03",
        letterSpacing: "-0.02em",
      }}
    >
      {label}
    </div>
  );
}

export function TossScreen() {
  const { state, dispatch } = useGame();
  const [step, setStep] = useState<TossStep>("call");
  const [userCall, setUserCall] = useState<"heads" | "tails" | null>(null);
  const [flipResult, setFlipResult] = useState<"heads" | "tails" | null>(null);
  const [userWonToss, setUserWonToss] = useState(false);
  const [userBatsFirst, setUserBatsFirst] = useState(true);

  const userTeamName = state.userTeam?.name  ?? "Your Team";
  const userColor    = state.userTeam?.color ?? "#22c55e";
  const oppTeamName  = state.opponentTeam?.name ?? "Opponent";

  const handleCoinFlip = (call: "heads" | "tails") => {
    setUserCall(call);
    setStep("flipping");
    setTimeout(() => {
      const result = Math.random() < 0.5 ? "heads" : "tails";
      setFlipResult(result);
      const won = call === result;
      setUserWonToss(won);
      if (!won) setUserBatsFirst(Math.random() < 0.5);
      setStep("result");
    }, 1400);
  };

  const handleChoice = (choice: "bat" | "bowl") => {
    setUserBatsFirst(choice === "bat");
    setStep("ready");
  };

  const handleContinueAfterResult = () => {
    setStep(userWonToss ? "choose" : "ready");
  };

  const handleConfirmToss = () => {
    dispatch({
      type: "COMPLETE_TOSS",
      payload: { winner: userWonToss ? "user" : "opponent", userBatsFirst },
    });
    dispatch({ type: "START_INNINGS" });
  };

  return (
    <div className="relative min-h-screen text-white flex items-center justify-center px-4 overflow-hidden">
      <img
        src="/vicky-adams-gywHscPZwMM-unsplash.jpg"
        alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ zIndex: 0 }}
      />
      <div
        className="absolute inset-0"
        style={{ zIndex: 1, background: "linear-gradient(to bottom, rgba(5,10,5,0.80) 0%, rgba(5,10,5,0.95) 100%)" }}
      />
      <div className="relative w-full max-w-sm mx-auto" style={{ zIndex: 2 }}>

        {/* Header */}
        <div className="text-center mb-8" style={{ animation: "fadeInUp 0.4s ease" }}>
          <button
            onClick={() => dispatch({ type: "GO_TO_PRE_MATCH" })}
            className="text-xs text-gray-400 hover:text-white transition-colors mb-4 block mx-auto"
          >
            ‹ Back to Squads
          </button>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">
            {state.format} · {userTeamName} vs {oppTeamName}
          </p>
          <h1 className="text-4xl font-black text-white mb-3">The Toss</h1>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <PitchBadge pitchType={state.pitchType} />
            <span className="text-gray-500 text-xs">
              {PITCH_DESC[state.pitchType as string] ?? state.pitchType}
            </span>
          </div>
        </div>

        {/* ── Step: call ── */}
        {step === "call" && (
          <div className="space-y-6" style={{ animation: "fadeInUp 0.4s ease" }}>
            <div className="flex justify-center">
              <CoinFace label="?" size={112} />
            </div>
            <p className="text-center text-gray-500 text-sm">Call it in the air</p>
            <div className="flex gap-3">
              {(["heads", "tails"] as const).map(side => (
                <button
                  key={side}
                  onClick={() => handleCoinFlip(side)}
                  className="flex-1 py-4 rounded-xl font-bold text-base capitalize transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: side === "heads"
                      ? "linear-gradient(135deg, #92400e, #b45309)"
                      : "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
                    boxShadow: side === "heads"
                      ? "0 4px 20px rgba(180,83,9,0.25)"
                      : "0 4px 20px rgba(29,78,216,0.25)",
                  }}
                >
                  {side}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step: flipping ── */}
        {step === "flipping" && (
          <div className="flex flex-col items-center gap-6" style={{ animation: "fadeInUp 0.3s ease" }}>
            <CoinFace label="?" size={112} spinning />
            <p className="text-gray-600 text-sm tracking-widest uppercase">Tossing…</p>
          </div>
        )}

        {/* ── Step: result ── */}
        {step === "result" && (
          <div className="space-y-5" style={{ animation: "popIn 0.4s ease" }}>
            <div
              className="rounded-2xl p-6 text-center space-y-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1.5px solid ${userWonToss ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`,
              }}
            >
              <div className="flex justify-center">
                <CoinFace label={flipResult === "heads" ? "H" : "T"} size={80} />
              </div>
              <p className="text-gray-400 text-sm">
                You called <span className="text-white font-bold capitalize">{userCall}</span>
                {" — "}it's{" "}
                <span className="text-yellow-400 font-bold capitalize">{flipResult}!</span>
              </p>
              <p className={`text-2xl font-black ${userWonToss ? "text-emerald-400" : "text-red-400"}`}>
                {userWonToss ? `${userTeamName} win the toss!` : `${oppTeamName} win the toss!`}
              </p>
              {!userWonToss && (
                <p className="text-gray-500 text-sm">
                  {oppTeamName} chose to{" "}
                  <span className="text-white font-semibold">
                    {userBatsFirst ? "bowl" : "bat"}
                  </span>{" "}
                  first
                </p>
              )}
            </div>
            <button
              onClick={handleContinueAfterResult}
              className="w-full py-3.5 rounded-xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: userWonToss ? "#16a34a" : "#dc2626" }}
            >
              {userWonToss ? "Make Your Choice" : "Continue"}
            </button>
          </div>
        )}

        {/* ── Step: choose ── */}
        {step === "choose" && (
          <div className="space-y-6" style={{ animation: "fadeInUp 0.35s ease" }}>
            <div className="text-center">
              <p className="text-emerald-400 text-xl font-black mb-1">You won the toss!</p>
              <p className="text-gray-500 text-sm">What would you like to do?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleChoice("bat")}
                className="flex-1 py-5 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${userColor}88, ${userColor}bb)`,
                  border: `1.5px solid ${userColor}60`,
                  boxShadow: `0 4px 20px ${userColor}22`,
                }}
              >
                Bat First
              </button>
              <button
                onClick={() => handleChoice("bowl")}
                className="flex-1 py-5 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #1f2937, #374151)",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                }}
              >
                Bowl First
              </button>
            </div>
          </div>
        )}

        {/* ── Step: ready ── */}
        {step === "ready" && (
          <div className="space-y-5" style={{ animation: "popIn 0.4s ease" }}>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1.5px solid rgba(255,255,255,0.1)" }}
            >
              <div
                className="py-3 px-5 text-center"
                style={{ background: `linear-gradient(90deg, ${userColor}18, transparent)` }}
              >
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Match is set</p>
              </div>
              <div className="px-6 py-5 space-y-4" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Toss won by</span>
                  <span className="text-white font-semibold">
                    {userWonToss ? userTeamName : oppTeamName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">{userTeamName} will</span>
                  <span className="font-black text-emerald-400 text-lg tracking-wide">
                    {userBatsFirst ? "BAT FIRST" : "BOWL FIRST"}
                  </span>
                </div>
                <div
                  className="flex justify-between items-center text-sm text-gray-500 pt-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <span>{oppTeamName}</span>
                  <span>{userBatsFirst ? "bowling" : "batting"}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleConfirmToss}
              className="w-full py-4 rounded-xl text-base font-black tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                boxShadow: "0 6px 24px rgba(22,163,74,0.25)",
              }}
            >
              Start Match
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
