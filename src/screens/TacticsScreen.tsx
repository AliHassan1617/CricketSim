import { useState, useRef } from "react";
import { useGame } from "../state/gameContext";
import { SidebarTab } from "../types/enums";
import { Player } from "../types/player";
import { PlayerProfileModal } from "../components/PlayerProfileModal";

// ── constants ────────────────────────────────────────────────────────────────

const ROLE: Record<string, { short: string; color: string }> = {
  batsman:         { short: "BAT", color: "#3b82f6" },
  bowler:          { short: "BWL", color: "#ef4444" },
  "all-rounder":   { short: "AR",  color: "#a855f7" },
  "wicket-keeper": { short: "WK",  color: "#f59e0b" },
};

const POS_TAG: Record<string, string> = {
  opener: "OP", "top-order": "TO", "middle-order": "MO",
  "lower-order": "LO", tailender: "TL",
};

const POS_ORDER: Record<string, number> = {
  opener: 0, "top-order": 1, "middle-order": 2, "lower-order": 3, tailender: 4,
};

const XI_ROW_H = 52; // px — fixed height used for drag index calculation

type BenchTab = "all" | "batsman" | "bowler" | "all-rounder" | "wicket-keeper";
const BENCH_TABS: { key: BenchTab; label: string }[] = [
  { key: "all",            label: "All"  },
  { key: "batsman",        label: "BAT"  },
  { key: "wicket-keeper",  label: "WK"   },
  { key: "all-rounder",    label: "AR"   },
  { key: "bowler",         label: "BWL"  },
];

// ── helpers ──────────────────────────────────────────────────────────────────

function batRating(p: Player) {
  return Math.round((p.batting.techniqueVsPace + p.batting.power) / 2);
}

/** Mirror of gameReducer's autoSelectTeam: 1 WK + 4 BAT + 3 AR + 3 BWL */
function autoPickXI(players: Player[]): string[] {
  const keepers    = players.filter((p) => p.role === "wicket-keeper");
  const batsmen    = players.filter((p) => p.role === "batsman");
  const allRounders = players.filter((p) => p.role === "all-rounder");
  const bowlers    = players.filter((p) => p.role === "bowler");

  const xi: Player[] = [];
  xi.push(...keepers.slice(0, 1));
  xi.push(...batsmen.slice(0, 4));
  xi.push(...allRounders.slice(0, 3));
  const remaining = 11 - xi.length;
  xi.push(...bowlers.slice(0, remaining));
  if (xi.length < 11) {
    const extra = players.filter((p) => !xi.includes(p));
    xi.push(...extra.slice(0, 11 - xi.length));
  }

  // Sort by batting position then batting quality
  return [...xi].sort((a, b) => {
    const pd =
      (POS_ORDER[a.battingPosition ?? "middle-order"] ?? 2) -
      (POS_ORDER[b.battingPosition ?? "middle-order"] ?? 2);
    return pd !== 0 ? pd : batRating(b) - batRating(a);
  }).map((p) => p.id);
}

// ── component ────────────────────────────────────────────────────────────────

export function TacticsScreen() {
  const { state, dispatch } = useGame();
  const team = state.userTeam;

  const [xiIds, setXiIds] = useState<string[]>(
    state.selectedXI.slice(0, 11)
  );
  const [benchTab, setBenchTab] = useState<BenchTab>("all");

  // drag-to-reorder state
  const [dragIdx, setDragIdx] = useState(-1);
  const [dropIdx, setDropIdx] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  if (!team) return null;

  // ── locked screen ──────────────────────────────────────────────────────────
  if (!state.tacticsUnlocked) {
    return (
      <div
        style={{
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          gap: 12,
          textAlign: "center",
          color: "white",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 4 }}>🔒</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#d1d5db" }}>Tactics Locked</h2>
        <p style={{ color: "#6b7280", maxWidth: 260, fontSize: 14 }}>
          Go to the <span style={{ color: "#34d399", fontWeight: 600 }}>Match</span> tab to set up the match first.
        </p>
        <button
          onClick={() =>
            dispatch({ type: "SET_SIDEBAR_TAB", payload: { tab: SidebarTab.Match } })
          }
          style={{
            marginTop: 8,
            padding: "10px 22px",
            background: "#065f46",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            color: "white",
            border: "none",
          }}
        >
          Go to Match →
        </button>
      </div>
    );
  }

  // ── derived data ───────────────────────────────────────────────────────────
  const inXI = new Set(xiIds);

  const benchPlayers = team.players
    .filter((p) => !inXI.has(p.id))
    .filter((p) => benchTab === "all" || p.role === benchTab)
    .sort((a, b) => {
      const pd =
        (POS_ORDER[a.battingPosition ?? "middle-order"] ?? 2) -
        (POS_ORDER[b.battingPosition ?? "middle-order"] ?? 2);
      return pd !== 0
        ? pd
        : batRating(b) - batRating(a);
    });

  // ── actions ────────────────────────────────────────────────────────────────
  function addToXI(id: string) {
    if (xiIds.length >= 11) return;
    setXiIds((prev) => [...prev, id]);
  }

  function removeFromXI(idx: number) {
    setXiIds((prev) => prev.filter((_, i) => i !== idx));
  }

  function startMatch() {
    dispatch({ type: "SET_SELECTED_XI", payload: { playerIds: xiIds } });
    dispatch({ type: "SET_SIDEBAR_TAB", payload: { tab: SidebarTab.Match } });
    dispatch({ type: "GO_TO_TOSS" });
  }

  // ── drag handlers (attached to each ⠿ handle) ─────────────────────────────
  function onHandleDown(e: React.PointerEvent<HTMLDivElement>, idx: number) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragIdx(idx);
    setDropIdx(idx);
  }

  function onHandleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragIdx < 0 || !listRef.current) return;
    const rect = listRef.current.getBoundingClientRect();
    const relY = e.clientY - rect.top + listRef.current.scrollTop;
    const next = Math.max(0, Math.min(xiIds.length - 1, Math.floor(relY / XI_ROW_H)));
    setDropIdx(next);
  }

  function onHandleUp() {
    if (dragIdx >= 0 && dropIdx >= 0 && dragIdx !== dropIdx) {
      setXiIds((prev) => {
        const next = [...prev];
        const [item] = next.splice(dragIdx, 1);
        next.splice(dropIdx, 0, item);
        return next;
      });
    }
    setDragIdx(-1);
    setDropIdx(-1);
  }

  const selectedPlayer = state.selectedPlayerId
    ? team.players.find((p) => p.id === state.selectedPlayerId) ?? null
    : null;

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        color: "white",
        overflow: "hidden",
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>Pick Your XI</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", margin: "2px 0 0" }}>
            {xiIds.length}/11 selected
            {xiIds.length === 11 && (
              <span style={{ color: "#34d399", marginLeft: 6, fontWeight: 600 }}>✓ Ready</span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => setXiIds(autoPickXI(team.players))}
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              color: "#fbbf24",
              border: "1px solid rgba(251,191,36,0.3)",
              background: "rgba(251,191,36,0.08)",
              flexShrink: 0,
            }}
          >
            Auto Pick
          </button>
          <button
            onClick={startMatch}
            disabled={xiIds.length !== 11}
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              color: "white",
              border: "none",
              background: xiIds.length === 11 ? "#059669" : "rgba(255,255,255,0.07)",
              opacity: xiIds.length !== 11 ? 0.45 : 1,
              flexShrink: 0,
            }}
          >
            Start →
          </button>
        </div>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 32px" }}>

        {/* ══ STARTING XI ══════════════════════════════════════════════════ */}
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Starting XI
        </p>

        <div
          ref={listRef}
          style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 24 }}
        >
          {xiIds.map((id, idx) => {
            const p = team.players.find((pl) => pl.id === id);
            if (!p) return null;
            const role = ROLE[p.role] ?? { short: "?", color: "#888" };
            const posTag = POS_TAG[p.battingPosition ?? "middle-order"] ?? "MO";
            const isDragging = dragIdx === idx;
            const isDropTarget = dragIdx >= 0 && dropIdx === idx && dragIdx !== idx;

            return (
              <div
                key={id}
                style={{
                  height: XI_ROW_H,
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "0 10px 0 6px",
                  background: isDropTarget
                    ? "rgba(16,185,129,0.12)"
                    : isDragging
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${
                    isDropTarget
                      ? "rgba(16,185,129,0.5)"
                      : isDragging
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.07)"
                  }`,
                  borderRadius: 10,
                  opacity: isDragging ? 0.55 : 1,
                  transition: isDragging ? "none" : "background 0.12s, border 0.12s",
                }}
              >
                {/* Drag handle */}
                <div
                  onPointerDown={(e) => onHandleDown(e, idx)}
                  onPointerMove={onHandleMove}
                  onPointerUp={onHandleUp}
                  style={{
                    color: "rgba(255,255,255,0.22)",
                    cursor: "grab",
                    touchAction: "none",
                    userSelect: "none",
                    padding: "10px 5px",
                    fontSize: 16,
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  ⠿
                </div>

                {/* Position number */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.28)",
                    width: 14,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>

                {/* Role/pos badge */}
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: role.color,
                    background: `${role.color}1a`,
                    padding: "2px 5px",
                    borderRadius: 4,
                    flexShrink: 0,
                    letterSpacing: "0.04em",
                  }}
                >
                  {posTag}
                </span>

                {/* Name */}
                <span
                  onClick={() =>
                    dispatch({
                      type: "OPEN_PLAYER_PROFILE",
                      payload: { playerId: id },
                    })
                  }
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "white",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  {p.shortName}
                </span>

                {/* Stats */}
                <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                  <span style={{ fontSize: 11 }}>
                    <span style={{ color: "rgba(255,255,255,0.28)" }}>B </span>
                    <span style={{ color: "#93c5fd", fontWeight: 700 }}>{batRating(p)}</span>
                  </span>
                  <span style={{ fontSize: 11 }}>
                    <span style={{ color: "rgba(255,255,255,0.28)" }}>W </span>
                    <span style={{ color: "#fca5a5", fontWeight: 700 }}>{p.bowling.mainSkill}</span>
                  </span>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromXI(idx)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.28)",
                    color: "#ef4444",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 11 - xiIds.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                height: XI_ROW_H - 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                border: "1px dashed rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "rgba(255,255,255,0.18)",
                fontSize: 12,
              }}
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>+</span>
              <span>Slot {xiIds.length + i + 1}</span>
            </div>
          ))}
        </div>

        {/* ══ BENCH / SQUAD ═══════════════════════════════════════════════════ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Squad
          </p>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>
            {team.players.length - xiIds.length} available
          </span>
        </div>

        {/* Role filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 10,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          {BENCH_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setBenchTab(tab.key)}
              style={{
                padding: "5px 13px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
                border: `1px solid ${benchTab === tab.key ? "#10b981" : "rgba(255,255,255,0.1)"}`,
                background:
                  benchTab === tab.key ? "#10b981" : "rgba(255,255,255,0.05)",
                color:
                  benchTab === tab.key ? "white" : "rgba(255,255,255,0.42)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bench player rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {benchPlayers.map((p) => {
            const role = ROLE[p.role] ?? { short: "?", color: "#888" };
            const posTag = POS_TAG[p.battingPosition ?? "middle-order"] ?? "MO";
            const canAdd = xiIds.length < 11;

            return (
              <div
                key={p.id}
                style={{
                  height: 46,
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "0 10px",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.055)",
                  borderRadius: 10,
                }}
              >
                {/* Pos badge */}
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: role.color,
                    background: `${role.color}1a`,
                    padding: "2px 5px",
                    borderRadius: 4,
                    flexShrink: 0,
                    letterSpacing: "0.04em",
                  }}
                >
                  {posTag}
                </span>

                {/* Name */}
                <span
                  onClick={() =>
                    dispatch({
                      type: "OPEN_PLAYER_PROFILE",
                      payload: { playerId: p.id },
                    })
                  }
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.68)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  {p.shortName}
                </span>

                {/* Stats */}
                <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                  <span style={{ fontSize: 11 }}>
                    <span style={{ color: "rgba(255,255,255,0.25)" }}>B </span>
                    <span style={{ color: "#93c5fd", fontWeight: 700 }}>{batRating(p)}</span>
                  </span>
                  <span style={{ fontSize: 11 }}>
                    <span style={{ color: "rgba(255,255,255,0.25)" }}>W </span>
                    <span style={{ color: "#fca5a5", fontWeight: 700 }}>{p.bowling.mainSkill}</span>
                  </span>
                </div>

                {/* Add button */}
                <button
                  onClick={() => addToXI(p.id)}
                  disabled={!canAdd}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: canAdd
                      ? "rgba(16,185,129,0.14)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${canAdd ? "rgba(16,185,129,0.38)" : "rgba(255,255,255,0.08)"}`,
                    color: canAdd ? "#10b981" : "rgba(255,255,255,0.18)",
                    fontSize: 17,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    cursor: canAdd ? "pointer" : "default",
                  }}
                >
                  +
                </button>
              </div>
            );
          })}

          {benchPlayers.length === 0 && (
            <p
              style={{
                textAlign: "center",
                color: "rgba(255,255,255,0.2)",
                fontSize: 13,
                padding: "24px 0",
              }}
            >
              No players available
            </p>
          )}
        </div>
      </div>

      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={() => dispatch({ type: "CLOSE_PLAYER_PROFILE" })}
        />
      )}
    </div>
  );
}
