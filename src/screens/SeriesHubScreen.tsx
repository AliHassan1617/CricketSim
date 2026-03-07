import { useGame } from "../state/gameContext";
import { getTeam } from "../data/teamDb";
import { STADIUMS } from "../data/stadiums";

export function SeriesHubScreen() {
  const { state, dispatch } = useGame();
  const series = state.series;
  if (!series) return null;

  const allPlayed = series.results.length >= series.totalMatches;

  const seriesWinner = allPlayed
    ? series.userWins > series.oppWins ? "user"
    : series.oppWins > series.userWins ? "opponent"
    : "tie"
    : null;

  const leadTeam = series.userWins > series.oppWins ? series.userTeamName
                 : series.oppWins > series.userWins ? series.oppTeamName
                 : null;

  function playNext() {
    const userTeam = getTeam(series!.userTeamId);
    const oppTeam  = getTeam(series!.oppTeamId);
    if (!userTeam || !oppTeam) return;
    dispatch({ type: "PICK_TEAM", payload: { userTeam, opponentTeam: oppTeam } });
    dispatch({ type: "SET_FORMAT", payload: { format: series!.format } });
    dispatch({ type: "SET_STADIUM", payload: { stadium: STADIUMS[Math.floor(Math.random() * STADIUMS.length)] } });
    dispatch({ type: "UNLOCK_TACTICS" });
    dispatch({ type: "GO_TO_PRE_MATCH" });
  }

  const seriesLabel = `${series.totalMatches}-match ${series.format} Series`;
  const winColor = seriesWinner === "user" ? "#34d399" : seriesWinner === "opponent" ? "#f87171" : "#fbbf24";

  return (
    <div className="min-h-screen text-white flex flex-col px-5 py-6 gap-5"
         style={{ background: "linear-gradient(160deg,#05101a 0%,#0a0a0a 100%)" }}>

      {/* Header */}
      <div className="text-center">
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mb-1">{seriesLabel}</p>
        <h2 className="text-2xl font-black text-white">{series.userTeamName} vs {series.oppTeamName}</h2>
      </div>

      {/* Score banner */}
      <div className="rounded-2xl py-5 text-center"
           style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">{series.userTeamName}</p>
            <p className="text-5xl font-black" style={{ color: series.userWins > series.oppWins ? "#34d399" : "white" }}>
              {series.userWins}
            </p>
          </div>
          <div className="text-gray-600 text-lg font-bold">–</div>
          <div className="text-center">
            <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">{series.oppTeamName}</p>
            <p className="text-5xl font-black" style={{ color: series.oppWins > series.userWins ? "#f87171" : "white" }}>
              {series.oppWins}
            </p>
          </div>
        </div>
        {!allPlayed && (
          <p className="text-[10px] text-gray-600 mt-3">
            Match {series.currentMatch} of {series.totalMatches}
            {series.results.length > 0 ? (leadTeam ? ` · ${leadTeam} lead` : " · Level") : ""}
          </p>
        )}
        {allPlayed && (
          <p className="text-sm font-bold mt-3" style={{ color: winColor }}>
            {seriesWinner === "user"
              ? `${series.userTeamName} win the series!`
              : seriesWinner === "opponent"
              ? `${series.oppTeamName} win the series`
              : "Series tied!"}
          </p>
        )}
      </div>

      {/* Match list — completed + pending */}
      <div className="space-y-3">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Fixtures</p>

        {/* Completed matches */}
        {series.results.map((r, i) => {
          const wc = r.winner === "user" ? "#34d399" : r.winner === "opponent" ? "#f87171" : "#fbbf24";
          return (
            <div key={i} className="rounded-xl overflow-hidden"
                 style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${wc}30` }}>
              <div className="px-4 py-2 flex items-center justify-between"
                   style={{ background: `${wc}14`, borderBottom: `1px solid ${wc}20` }}>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Match {i + 1}</p>
                <p className="text-[10px] font-bold" style={{ color: wc }}>
                  {r.winner === "user" ? "✓ Won" : r.winner === "opponent" ? "✗ Lost" : "Tie"}
                </p>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-[9px] text-gray-500 mb-1">{series.userTeamName}</p>
                  <p className="text-base font-black tabular-nums"
                     style={{ color: r.winner === "user" ? "#34d399" : "rgba(255,255,255,0.8)" }}>
                    {r.userRuns}/{r.userWickets}
                  </p>
                  <p className="text-[9px] text-gray-600">({r.userOvers} ov)</p>
                </div>
                <div className="text-gray-600 text-xs font-bold">vs</div>
                <div className="text-center flex-1">
                  <p className="text-[9px] text-gray-500 mb-1">{series.oppTeamName}</p>
                  <p className="text-base font-black tabular-nums"
                     style={{ color: r.winner === "opponent" ? "#f87171" : "rgba(255,255,255,0.8)" }}>
                    {r.oppRuns}/{r.oppWickets}
                  </p>
                  <p className="text-[9px] text-gray-600">({r.oppOvers} ov)</p>
                </div>
              </div>
              <p className="text-center text-[10px] text-gray-500 pb-2 italic">{r.resultText}</p>
            </div>
          );
        })}

        {/* Pending matches */}
        {Array.from({ length: series.totalMatches - series.results.length }, (_, i) => {
          const matchNum = series.results.length + i + 1;
          const isNext = i === 0;
          return (
            <div key={`pending-${matchNum}`} className="rounded-xl overflow-hidden"
                 style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-4 py-2 flex items-center justify-between"
                   style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Match {matchNum}</p>
                <p className="text-[10px] font-bold" style={{ color: isNext ? "#f59e0b" : "rgba(255,255,255,0.2)" }}>
                  {isNext ? "Up Next" : "Pending"}
                </p>
              </div>
              <div className="px-4 py-3 flex items-center justify-center gap-2">
                <span className="text-[11px] text-gray-600">{series.userTeamName}</span>
                <span className="text-gray-700 text-xs font-bold">vs</span>
                <span className="text-[11px] text-gray-600">{series.oppTeamName}</span>
                <span className="text-[10px] text-gray-700 ml-1">· {series.format}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      {allPlayed ? (
        <button onClick={() => dispatch({ type: "GO_TO_MAIN_MENU" })}
          className="w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest active:scale-[0.97] transition-transform mt-auto"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}>
          ← Back to Home
        </button>
      ) : (
        <button onClick={playNext}
          className="w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest active:scale-[0.97] transition-transform mt-auto"
          style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#09090b" }}>
          Play Match {series.currentMatch} →
        </button>
      )}
    </div>
  );
}
