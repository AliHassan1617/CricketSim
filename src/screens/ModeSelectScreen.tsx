import { useGame } from "../state/gameContext";

export function ModeSelectScreen() {
  const { dispatch } = useGame();

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#050a14",
      }}
    >
      {/* Hero background */}
      <img
        src="/mainmenu.jpg"
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          zIndex: 0,
        }}
      />

      {/* Gradient — darker overall so text/cards are readable when centered */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(to bottom, rgba(5,10,20,0.25) 0%, rgba(5,10,20,0.72) 38%, rgba(5,10,20,0.90) 65%, #050a14 90%)",
        }}
      />

      {/* Branding + cards — all centered together */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 18px",
          gap: 28,
          animation: "fadeInUp 0.45s ease both",
        }}
      >
      {/* Branding */}
      <div
        style={{
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            fontSize: 9,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          by Ali Hassan
        </p>
        <div style={{ lineHeight: 1, letterSpacing: "-1.5px" }}>
          <span
            style={{
              display: "block",
              fontSize: 52,
              fontWeight: 900,
              color: "white",
            }}
          >
            Cricket
          </span>
          <span
            style={{
              display: "block",
              fontSize: 52,
              fontWeight: 900,
              color: "#f59e0b",
            }}
          >
            Sim
          </span>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* ── Quick Match — hero card ─────────────────────────── */}
        <button
          onClick={() => dispatch({ type: "GO_TO_EXHIBITION" })}
          className="active:scale-[0.97] active:opacity-90 transition-transform duration-100"
          style={{
            width: "100%",
            padding: "20px 20px",
            borderRadius: 18,
            background: "rgba(245,158,11,0.10)",
            border: "1px solid rgba(245,158,11,0.30)",
            boxShadow: "0 0 28px rgba(245,158,11,0.07)",
            display: "flex",
            alignItems: "center",
            gap: 18,
            textAlign: "left",
            animation: "cardPop 0.5s 0.08s ease both",
          }}
        >
          <span style={{ fontSize: 36, lineHeight: 1 }}>🏏</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                color: "#fbbf24",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Quick Match
            </p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12.5 }}>
              Pick teams, set the format, and play
            </p>
          </div>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 22, lineHeight: 1 }}>›</span>
        </button>

        {/* ── Two-column grid ────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            animation: "cardPop 0.5s 0.18s ease both",
          }}
        >
          {/* World Cup */}
          <button
            onClick={() => dispatch({ type: "WC_INIT" })}
            className="active:scale-[0.97] active:opacity-90 transition-transform duration-100"
            style={{
              padding: "20px 16px",
              borderRadius: 18,
              background: "rgba(234,179,8,0.08)",
              border: "1px solid rgba(234,179,8,0.22)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 12,
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 30, lineHeight: 1 }}>🏆</span>
            <div>
              <p
                style={{
                  color: "#fcd34d",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                World Cup
              </p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
                8-team tournament
              </p>
            </div>
          </button>

          {/* Multiplayer */}
          <button
            onClick={() => dispatch({ type: "GO_TO_MULTIPLAYER" })}
            className="active:scale-[0.97] active:opacity-90 transition-transform duration-100"
            style={{
              padding: "20px 16px",
              borderRadius: 18,
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.25)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 12,
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 30, lineHeight: 1 }}>📡</span>
            <div>
              <p
                style={{
                  color: "#a5b4fc",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                Multiplayer
              </p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
                Play vs friends
              </p>
            </div>
          </button>
        </div>

        {/* Version */}
        <p
          style={{
            textAlign: "center",
            fontSize: 9.5,
            color: "rgba(255,255,255,0.18)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          v0.1 alpha
        </p>
      </div>
      </div>
    </div>
  );
}

