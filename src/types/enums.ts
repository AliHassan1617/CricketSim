export enum MatchFormat {
  T5  = "T5",
  T10 = "T10",
  T20 = "T20",
}

export enum BowlerType {
  Pace = "pace",
  Spin = "spin",
}

export enum PitchType {
  Flat = "flat",
  SpinFriendly = "spin-friendly",
  SeamFriendly = "seam-friendly",
}

export enum BattingIntent {
  Defensive = "defensive",
  Balanced = "balanced",
  Aggressive = "aggressive",
}

export enum FieldType {
  Attacking = "attacking",
  Balanced = "balanced",
  Defensive = "defensive",
}

export enum BowlerLine {
  OutsideOff = "outside-off",
  OnStumps = "on-stumps",
  OnPads = "on-pads",
  Short = "short",
  Full = "full",
}

export enum BallOutcome {
  Dot = 0,
  Single = 1,
  Double = 2,
  Three = 3,
  Four = 4,
  Six = 6,
  Wicket = -1,
  Wide = -2,
  NoBall = -3,
}

export enum DismissalType {
  Bowled = "bowled",
  Caught = "caught",
  LBW = "lbw",
  RunOut = "run-out",
  Stumped = "stumped",
}

export enum GamePhase {
  Start = "start",
  TeamPick = "team-pick",
  PreMatch = "pre-match",
  Toss = "toss",
  FirstInnings = "first-innings",
  InningsSummary = "innings-summary",
  SecondInnings = "second-innings",
  FinalScorecard = "final-scorecard",
}

export enum SidebarTab {
  Squad = "squad",
  Tactics = "tactics",
  Match = "match",
}
