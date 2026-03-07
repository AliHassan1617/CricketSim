import { useEffect, useState } from "react";

const LOADING_STEPS = [
  "Loading match engine...",
  "Preparing stadiums...",
  "Loading player data...",
  "Setting up teams...",
  "Calibrating pitch conditions...",
  "Ready.",
];

interface Props {
  onDone: () => void;
}

export function SplashScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [loadStep, setLoadStep] = useState(0);

  useEffect(() => {
    // Cycle through loading steps every ~450ms
    const stepInterval = setInterval(() => {
      setLoadStep(prev => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 450);

    // in: 600ms → hold: 2400ms → out: 500ms → done at 3300ms
    const t1 = setTimeout(() => setPhase("hold"), 600);
    const t2 = setTimeout(() => setPhase("out"),  2800);
    const t3 = setTimeout(() => onDone(),          3300);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearInterval(stepInterval);
    };
  }, [onDone]);

  const opacity  = phase === "out" ? 0 : 1;
  const scale    = phase === "in"  ? 0.88 : 1;
  const duration = phase === "in"  ? "0.6s" : phase === "out" ? "0.5s" : "0s";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#050a0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        opacity,
        transition: `opacity ${duration} ease`,
        pointerEvents: "none",
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 50% 52%, rgba(245,158,11,0.09) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Logo */}
      <div style={{
        transform: `scale(${scale})`,
        transition: `transform ${duration} cubic-bezier(0.34,1.2,0.64,1)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
      }}>
        <img
          src="/transparent image.png"
          alt="Myuki Jarret Studios"
          style={{
            width: 320,
            height: 320,
            objectFit: "contain",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <p style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.28)",
          }}>
            Myuki Jarret Studios
          </p>

          {/* Loading text */}
          <p style={{
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: "0.15em",
            color: "rgba(245,158,11,0.55)",
            minWidth: 200,
            textAlign: "center",
            transition: "opacity 0.2s ease",
          }}>
            {LOADING_STEPS[loadStep]}
          </p>
        </div>
      </div>
    </div>
  );
}
