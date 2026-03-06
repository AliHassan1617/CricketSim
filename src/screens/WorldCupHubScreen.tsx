import { useState, useMemo } from "react";
import { useGame } from "../state/gameContext";
import { getAllTeams, getTeam } from "../data/teamDb";
import { computeStandings, simulateAIMatch, fixtureResultText } from "../utils/wcEngine";
import { WCFixture, WCStanding, WorldCupState } from "../types/worldCup";
import { Team } from "../types/player";

type WCTab = "schedule" | "groups" | "stats" | "squad";

function useTeamMap(): Map<string, Team> {
  return useMemo(() => new Map(getAllTeams().map(t => [t.id, t])), []);
}

const STAGE_LABEL: Record<string, string> = {
  sf1:   "Semi-Final 1",
  sf2:   "Semi-Final 2",
  final: "The Final",
};

const ROLE_COLOR: Record<string, string> = {
  "batsman":        "#60a5fa",
  "wicket-keeper":  "#34d399",
  "all-rounder":    "#fbbf24",
  "bowler":         "#f87171",
};

const ROLE_SHORT: Record<string, string> = {
  "batsman":       "BAT",
  "wicket-keeper": "WK",
  "all-rounder":   "AR",
  "bowler":        "BWL",
};

// ─── Top bar ──────────────────────────────────────────────────────────────────

const TABS: { id: WCTab; label: string; icon: string }[] = [
  { id: "schedule", label: "Schedule", icon: "🗓" },
  { id: "groups",   label: "Groups",   icon: "⚔" },
  { id: "stats",    label: "Stats",    icon: "📊" },
  { id: "squad",    label: "Squad",    icon: "👥" },
];

function TopBar({ currentDay, wcPhase, onBack }: { currentDay: number; wcPhase: string; onBack: () => void }) {
  const phaseLabel =
    wcPhase === "complete" ? "Complete" :
    wcPhase === "knockout" ? "Knockouts" : "Group Stage";

  return (
    <div
      className="shrink-0 flex items-center gap-3 px-4"
      style={{
        height: 54,
        background: "rgba(0,0,0,0.55)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <button
        onClick={onBack}
        style={{ color: "#6b7280", fontSize: 13, fontWeight: 600 }}
      >
        ‹
      </button>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.3em", color: "#fbbf24", textTransform: "uppercase" }}>ICG</p>
        <p style={{ fontSize: 13, fontWeight: 900, color: "white", lineHeight: 1.1 }}>World Cup</p>
      </div>
      <span
        style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase",
          background: "rgba(251,191,36,0.12)", color: "#fbbf24",
          border: "1px solid rgba(251,191,36,0.2)",
          borderRadius: 6, padding: "3px 8px",
        }}
      >
        {phaseLabel}
      </span>
      <span style={{ fontSize: 10, color: "#4b5563" }}>Day {currentDay}</span>
    </div>
  );
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────

function BottomNav({ activeTab, onTabChange }: { activeTab: WCTab; onTabChange: (t: WCTab) => void }) {
  return (
    <nav
      className="shrink-0 flex"
      style={{
        height: 60,
        background: "rgba(5,10,16,0.96)",
        borderTop: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {TABS.map(tab => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              background: active ? "rgba(251,191,36,0.07)" : "transparent",
              border: "none",
              borderTop: `2px solid ${active ? "#fbbf24" : "transparent"}`,
              transition: "background 0.15s, border-color 0.15s",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1, opacity: active ? 1 : 0.45 }}>{tab.icon}</span>
            <span style={{
              fontSize: 9, fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: active ? "#fbbf24" : "rgba(255,255,255,0.35)",
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── Schedule tab ─────────────────────────────────────────────────────────────

function teamNameColor(f: WCFixture, teamId: string, userTeamId: string): string {
  if (teamId === userTeamId) return "#fde68a";
  if (f.status === "completed") {
    return f.result?.winnerTeamId === teamId ? "#f9fafb" : "#4b5563";
  }
  return "#d1d5db";
}

function ScheduleTab({
  fixtures, currentFixtureId, userTeamId, teamMap, wcPhase, onPlay, onSim, onBackToMenu,
}: {
  fixtures: WCFixture[];
  currentFixtureId: string | undefined;
  userTeamId: string;
  teamMap: Map<string, Team>;
  wcPhase: string;
  onPlay: (id: string) => void;
  onSim:  (id: string) => void;
  onBackToMenu: () => void;
}) {
  const nameMap = useMemo(
    () => new Map(getAllTeams().map(t => [t.id, t.shortName])),
    [],
  );

  // Group fixtures by scheduled day
  const byDay = useMemo(() => {
    const m = new Map<number, WCFixture[]>();
    for (const f of fixtures) {
      const arr = m.get(f.scheduledDay) ?? [];
      arr.push(f);
      m.set(f.scheduledDay, arr);
    }
    return [...m.entries()].sort(([a], [b]) => a - b);
  }, [fixtures]);

  const champion = wcPhase === "complete"
    ? fixtures.find(f => f.id === "final" && f.status === "completed")?.result?.winnerTeamId
    : null;

  return (
    <div className="h-full overflow-y-auto px-4 py-5 space-y-4">

      {/* Champion banner */}
      {champion && (
        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: `linear-gradient(135deg, ${teamMap.get(champion)?.color ?? "#fbbf24"}22, ${teamMap.get(champion)?.color ?? "#fbbf24"}08)`,
            border: `1.5px solid ${teamMap.get(champion)?.color ?? "#fbbf24"}50`,
          }}
        >
          <p className="text-4xl mb-2">🏆</p>
          <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-1">ICC World Cup Champion</p>
          <h2 className="text-2xl font-black" style={{ color: teamMap.get(champion)?.color ?? "#fbbf24" }}>
            {teamMap.get(champion)?.name ?? champion}
          </h2>
          {champion === userTeamId && (
            <p className="text-xs text-yellow-400 mt-1.5 font-semibold">Congratulations! 🎉</p>
          )}
          <button
            onClick={onBackToMenu}
            className="mt-4 text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.08)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Back to Menu
          </button>
        </div>
      )}

      {/* Fixtures grouped by day */}
      {byDay.map(([day, dayFix]) => (
        <div key={day} className="space-y-2">
          {/* Day label */}
          <div className="flex items-center gap-2">
            <span
              className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.06)", color: "#4b5563" }}
            >
              Day {day}
            </span>
            <span className="text-[8px] uppercase tracking-widest font-semibold" style={{ color: "#374151" }}>
              {dayFix[0].stage === "group"
                ? `Group ${dayFix[0].group}`
                : STAGE_LABEL[dayFix[0].stage] ?? dayFix[0].stage}
            </span>
          </div>

          {/* Fixture card */}
          {dayFix.map(f => {
            const t1Name = teamMap.get(f.team1Id)?.shortName ?? (f.team1Id ? f.team1Id : "TBD");
            const t2Name = teamMap.get(f.team2Id)?.shortName ?? (f.team2Id ? f.team2Id : "TBD");
            const isCurrent    = f.id === currentFixtureId;
            const involvesUser = f.team1Id === userTeamId || f.team2Id === userTeamId;
            const isResolved   = !!f.team1Id && !!f.team2Id;
            const isDone       = f.status === "completed";
            const isPending    = f.status === "pending";

            return (
              <div
                key={f.id}
                className="rounded-xl px-3 py-2.5 transition-all"
                style={{
                  background: isDone
                    ? "rgba(255,255,255,0.02)"
                    : isCurrent && involvesUser
                      ? "rgba(251,191,36,0.07)"
                      : isCurrent
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(255,255,255,0.02)",
                  border: isCurrent && involvesUser
                    ? "1px solid rgba(251,191,36,0.3)"
                    : isCurrent
                      ? "1px solid rgba(255,255,255,0.12)"
                      : "1px solid rgba(255,255,255,0.05)",
                  opacity: isPending && !isCurrent ? 0.5 : 1,
                }}
              >
                <div className="flex items-center gap-2">
                  {/* Teams + result text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold leading-none">
                      <span style={{ color: teamNameColor(f, f.team1Id, userTeamId) }}>{t1Name}</span>
                      <span className="text-[9px]" style={{ color: "#374151" }}>vs</span>
                      <span style={{ color: teamNameColor(f, f.team2Id, userTeamId) }}>{t2Name}</span>
                    </div>
                    <p
                      className="text-[9px] mt-1 leading-none"
                      style={{ color: isDone ? "#34d399" : isCurrent ? "#6b7280" : "#374151" }}
                    >
                      {isDone && f.result
                        ? fixtureResultText(f.result, nameMap)
                        : isCurrent
                          ? (involvesUser ? "Your match — ready to play" : "Ready to simulate")
                          : "Upcoming"}
                    </p>
                  </div>

                  {/* Action area */}
                  {isDone && (
                    <span className="shrink-0 text-sm" style={{ color: "#34d399" }}>✓</span>
                  )}
                  {isPending && isCurrent && isResolved && (
                    involvesUser ? (
                      <button
                        onClick={() => onPlay(f.id)}
                        className="shrink-0 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg active:scale-95"
                        style={{ background: "#fbbf24", color: "#09090b" }}
                      >
                        Play
                      </button>
                    ) : (
                      <button
                        onClick={() => onSim(f.id)}
                        className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg active:scale-95"
                        style={{ background: "rgba(255,255,255,0.08)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.1)" }}
                      >
                        Sim
                      </button>
                    )
                  )}
                  {isPending && isCurrent && !isResolved && (
                    <span className="shrink-0 text-[9px] uppercase tracking-wider" style={{ color: "#374151" }}>TBD</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Groups tab ───────────────────────────────────────────────────────────────

function GroupsTab({ wc, teamMap }: { wc: WorldCupState; teamMap: Map<string, Team> }) {
  const isKnockout = wc.wcPhase === "knockout" || wc.wcPhase === "complete";
  const standA = computeStandings(wc.groupA, wc.fixtures, "A");
  const standB = computeStandings(wc.groupB, wc.fixtures, "B");

  function GroupTable({ title, standings }: { title: string; standings: WCStanding[] }) {
    return (
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest mb-2 px-1" style={{ color: "#6b7280" }}>
          {title}
        </p>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                <th className="text-left py-1.5 px-2 text-[8px] font-medium" style={{ color: "#4b5563" }}>Team</th>
                <th className="text-center py-1.5 w-6 text-[8px] font-medium" style={{ color: "#4b5563" }}>P</th>
                <th className="text-center py-1.5 w-6 text-[8px] font-medium" style={{ color: "#4b5563" }}>W</th>
                <th className="text-center py-1.5 w-6 text-[8px] font-medium" style={{ color: "#4b5563" }}>L</th>
                <th className="text-center py-1.5 w-8 text-[8px] font-medium" style={{ color: "#4b5563" }}>Pts</th>
                <th className="text-right py-1.5 px-2 w-14 text-[8px] font-medium" style={{ color: "#4b5563" }}>NRR</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => {
                const team     = teamMap.get(s.teamId);
                const isUser   = s.teamId === wc.userTeamId;
                const qualified = !isKnockout && i < 2;
                return (
                  <tr
                    key={s.teamId}
                    style={{
                      background: qualified
                        ? "rgba(16,185,129,0.07)"
                        : isUser ? "rgba(251,191,36,0.04)" : "transparent",
                      borderTop: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: team?.color ?? "#fff" }} />
                        <span className="text-xs font-semibold" style={{ color: isUser ? "#fde68a" : "#f9fafb" }}>
                          {team?.shortName ?? s.teamId}
                        </span>
                        {qualified && (
                          <span
                            className="text-[7px] font-bold px-1 py-0.5 rounded"
                            style={{ background: "rgba(16,185,129,0.2)", color: "#34d399" }}
                          >
                            Q
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-2 text-xs tabular-nums" style={{ color: "#9ca3af" }}>{s.played}</td>
                    <td className="text-center py-2 text-xs tabular-nums" style={{ color: "#d1d5db" }}>{s.won}</td>
                    <td className="text-center py-2 text-xs tabular-nums" style={{ color: "#6b7280" }}>{s.lost}</td>
                    <td className="text-center py-2 text-xs font-bold tabular-nums text-white">{s.points}</td>
                    <td className="text-right py-2 px-2 text-xs tabular-nums" style={{ color: s.nrr >= 0 ? "#6ee7b7" : "#fca5a5" }}>
                      {s.nrr >= 0 ? "+" : ""}{s.nrr.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-5 space-y-5">
      <GroupTable title="Group A" standings={standA} />
      <GroupTable title="Group B" standings={standB} />
      {!isKnockout && (
        <p className="text-[9px] text-center" style={{ color: "#374151" }}>
          Top 2 from each group advance to the semi-finals
        </p>
      )}
      {isKnockout && (
        <div className="rounded-xl p-4" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "#fbbf24" }}>
            Knockout Bracket
          </p>
          {wc.fixtures.filter(f => f.stage !== "group").map(f => {
            const t1 = teamMap.get(f.team1Id);
            const t2 = teamMap.get(f.team2Id);
            const stageLabel = STAGE_LABEL[f.stage] ?? f.stage;
            return (
              <div key={f.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span className="text-[9px]" style={{ color: "#6b7280" }}>{stageLabel}</span>
                <span className="text-xs font-semibold text-white">
                  {t1?.shortName ?? "TBD"} <span style={{ color: "#4b5563" }}>vs</span> {t2?.shortName ?? "TBD"}
                </span>
                {f.status === "completed" && f.result && (
                  <span className="text-[9px]" style={{ color: "#34d399" }}>
                    {teamMap.get(f.result.winnerTeamId)?.shortName ?? f.result.winnerTeamId} ✓
                  </span>
                )}
                {f.status === "pending" && (
                  <span className="text-[9px]" style={{ color: "#374151" }}>Pending</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Stats tab ────────────────────────────────────────────────────────────────

function StatsTab({ wc, teamMap }: { wc: WorldCupState; teamMap: Map<string, Team> }) {
  const completedFixtures = wc.fixtures.filter(f => f.status === "completed" && f.result);

  // Aggregate batting stats
  const batMap = new Map<string, { name: string; teamId: string; runs: number; balls: number; inns: number }>();
  for (const f of completedFixtures) {
    const r = f.result!;
    for (const p of [...(r.innings1Batting ?? []), ...(r.innings2Batting ?? [])]) {
      const ex = batMap.get(p.playerId) ?? { name: p.name, teamId: p.teamId, runs: 0, balls: 0, inns: 0 };
      batMap.set(p.playerId, {
        name: p.name, teamId: p.teamId,
        runs:  ex.runs  + p.runs,
        balls: ex.balls + p.balls,
        inns:  ex.inns  + 1,
      });
    }
  }
  const topBatsmen = [...batMap.values()].sort((a, b) => b.runs - a.runs).slice(0, 5);

  // Aggregate bowling stats
  const bowlMap = new Map<string, { name: string; teamId: string; wickets: number; runs: number; totalBalls: number }>();
  for (const f of completedFixtures) {
    const r = f.result!;
    for (const p of [...(r.innings1Bowling ?? []), ...(r.innings2Bowling ?? [])]) {
      const ex = bowlMap.get(p.playerId) ?? { name: p.name, teamId: p.teamId, wickets: 0, runs: 0, totalBalls: 0 };
      bowlMap.set(p.playerId, {
        name: p.name, teamId: p.teamId,
        wickets:    ex.wickets    + p.wickets,
        runs:       ex.runs       + p.runs,
        totalBalls: ex.totalBalls + (p.oversFull * 6 + p.ballsExtra),
      });
    }
  }
  const topBowlers = [...bowlMap.values()]
    .sort((a, b) => {
      if (b.wickets !== a.wickets) return b.wickets - a.wickets;
      const ecoA = a.totalBalls > 0 ? (a.runs / a.totalBalls) * 6 : 99;
      const ecoB = b.totalBalls > 0 ? (b.runs / b.totalBalls) * 6 : 99;
      return ecoA - ecoB;
    })
    .slice(0, 5);

  if (completedFixtures.length === 0) {
    return (
      <div className="h-full flex items-center justify-center px-6">
        <p className="text-sm text-center" style={{ color: "#4b5563" }}>
          Stats will appear once matches are played
        </p>
      </div>
    );
  }

  function StatTable({
    title, headers, rows,
  }: {
    title: string;
    headers: string[];
    rows: { cells: (string | number)[]; highlight?: boolean; teamId?: string }[];
  }) {
    return (
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest mb-2 px-1" style={{ color: "#6b7280" }}>
          {title}
        </p>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                {headers.map(h => (
                  <th
                    key={h}
                    className={`py-1.5 text-[8px] font-medium ${h === "#" || h === headers[0] ? "text-left px-2" : "text-right px-3"}`}
                    style={{ color: "#4b5563" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    background: row.highlight ? "rgba(251,191,36,0.05)" : "transparent",
                    borderTop: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {row.cells.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`py-2 ${ci === 0 ? "px-2" : "text-right px-3"} text-xs tabular-nums`}
                      style={{
                        color: ci === 0 && row.highlight ? "#fbbf24"
                          : ci === 0 ? "#4b5563"
                          : ci === 1 ? "#f9fafb"
                          : "#9ca3af",
                        fontWeight: ci === row.cells.length - 2 ? 700 : 400,
                      }}
                    >
                      {ci === 1 && row.teamId ? (
                        <span>
                          <span className="font-semibold text-white">{cell}</span>
                          <span className="block text-[8px] leading-none mt-0.5" style={{ color: teamMap.get(row.teamId)?.color ?? "#6b7280" }}>
                            {teamMap.get(row.teamId)?.shortName ?? row.teamId}
                          </span>
                        </span>
                      ) : String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-5 space-y-6">
      <StatTable
        title="Top Run Scorers"
        headers={["#", "Player", "Runs", "Inns"]}
        rows={topBatsmen.map((p, i) => ({
          cells: [i + 1, p.name, p.runs, p.inns],
          highlight: i === 0,
          teamId: p.teamId,
        }))}
      />
      <StatTable
        title="Top Wicket Takers"
        headers={["#", "Player", "Wkts", "Eco"]}
        rows={topBowlers.map((p, i) => ({
          cells: [
            i + 1,
            p.name,
            p.wickets,
            p.totalBalls > 0 ? ((p.runs / p.totalBalls) * 6).toFixed(2) : "—",
          ],
          highlight: i === 0,
          teamId: p.teamId,
        }))}
      />
    </div>
  );
}

// ─── Squad tab ────────────────────────────────────────────────────────────────

function SquadTab({ wc }: { wc: WorldCupState }) {
  const team = getTeam(wc.userTeamId);
  if (!team) return null;

  const roleOrder: Record<string, number> = { batsman: 0, "wicket-keeper": 1, "all-rounder": 2, bowler: 3 };
  const sorted = [...team.players].sort((a, b) => (roleOrder[a.role] ?? 4) - (roleOrder[b.role] ?? 4));

  return (
    <div className="h-full overflow-y-auto px-4 py-5">
      {/* Team header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-3 h-9 rounded-full" style={{ background: team.color }} />
        <div>
          <p className="text-[8px] uppercase tracking-widest" style={{ color: "#4b5563" }}>Your Squad</p>
          <p className="text-base font-black text-white leading-tight">{team.name}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {sorted.map(p => {
          const batQ  = Math.min(100, Math.round((p.batting.techniqueVsPace + p.batting.power) / 2));
          const bowlQ = Math.min(100, p.bowling.mainSkill);
          const roleCol = ROLE_COLOR[p.role] ?? "#6b7280";

          return (
            <div
              key={p.id}
              className="rounded-xl px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-xs font-semibold text-white leading-none">{p.shortName}</p>
                    <span
                      className="text-[7px] font-bold uppercase px-1.5 py-0.5 rounded"
                      style={{ background: `${roleCol}20`, color: roleCol }}
                    >
                      {ROLE_SHORT[p.role] ?? p.role}
                    </span>
                  </div>
                  {/* Stat bars */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[7px] w-4" style={{ color: "#4b5563" }}>BAT</span>
                      <div className="w-16 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-1 rounded-full" style={{ width: `${batQ}%`, background: "#60a5fa" }} />
                      </div>
                    </div>
                    {bowlQ > 20 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[7px] w-4" style={{ color: "#4b5563" }}>BWL</span>
                        <div className="w-16 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                          <div className="h-1 rounded-full" style={{ width: `${bowlQ}%`, background: "#f87171" }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function WorldCupHubScreen() {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<WCTab>("schedule");
  const teamMap = useTeamMap();

  const wc = state.worldCup!;

  // All fixtures sorted by scheduled day — the immutable play order
  const orderedFixtures = useMemo(
    () => [...wc.fixtures].sort((a, b) => a.scheduledDay - b.scheduledDay),
    [wc.fixtures],
  );

  // Current fixture = the first non-completed one (enforces sequential play)
  const currentFixture = orderedFixtures.find(f => f.status === "pending");

  function handlePlay(fixtureId: string) {
    dispatch({ type: "WC_PLAY_FIXTURE", payload: { fixtureId } });
  }

  const wcOvers = wc.format === "ODI" ? 50 : wc.format === "T10" ? 10 : 20;

  function handleSim(fixtureId: string) {
    const f = wc.fixtures.find(fx => fx.id === fixtureId);
    if (!f) return;
    const t1 = teamMap.get(f.team1Id);
    const t2 = teamMap.get(f.team2Id);
    if (!t1 || !t2) return;
    const result = simulateAIMatch(t1, t2, wcOvers);
    dispatch({ type: "WC_RECORD_SIM_RESULT", payload: { fixtureId, result } });
  }

  function renderContent() {
    switch (activeTab) {
      case "schedule":
        return (
          <ScheduleTab
            fixtures={orderedFixtures}
            currentFixtureId={currentFixture?.id}
            userTeamId={wc.userTeamId}
            teamMap={teamMap}
            wcPhase={wc.wcPhase}
            onPlay={handlePlay}
            onSim={handleSim}
            onBackToMenu={() => dispatch({ type: "GO_TO_MAIN_MENU" })}
          />
        );
      case "groups":
        return <GroupsTab wc={wc} teamMap={teamMap} />;
      case "stats":
        return <StatsTab wc={wc} teamMap={teamMap} />;
      case "squad":
        return <SquadTab wc={wc} />;
    }
  }

  return (
    <div
      className="relative text-white flex overflow-hidden"
      style={{ background: "#030a10", height: "100dvh" }}
    >
      {/* Background image */}
      <img
        src="/aksh-yadav-bY4cqxp7vos-unsplash.jpg"
        alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ zIndex: 0, opacity: 0.10 }}
      />
      <div
        className="absolute inset-0"
        style={{ zIndex: 1, background: "rgba(3,10,16,0.90)" }}
      />

      {/* Top bar + content + bottom nav */}
      <div className="relative flex flex-col w-full h-full" style={{ zIndex: 2 }}>
        <TopBar
          currentDay={wc.currentDay}
          wcPhase={wc.wcPhase}
          onBack={() => dispatch({ type: "GO_TO_MAIN_MENU" })}
        />
        <main className="flex-1 min-w-0 overflow-hidden">
          {renderContent()}
        </main>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
