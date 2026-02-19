import { BowlerType } from "./enums";

export interface BattingStats {
  power: number;                // 0-100: Boundary probability, six chance
  temperament: number;          // 0-100: Resistance to pressure, patience
  techniqueVsPace: number;      // 0-100: Base scoring vs pace
  techniqueVsSpin: number;      // 0-100: Base scoring vs spin
  acceleration: number;         // 0-100: Ability to increase scoring rate mid-innings
  offsideSkill: number;         // 0-100: Scoring on off-side lines
  legsideSkill: number;         // 0-100: Scoring on leg-side lines
  runningBetweenWickets: number;// 0-100: Singles/doubles conversion, run-out avoidance
}

export interface BowlingStats {
  bowlerType: BowlerType;
  mainSkill: number;            // 0-100: Pace Skill or Spin Skill (core ability)
  control: number;              // 0-100: Accuracy, line consistency, fewer extras
  variation: number;            // 0-100: Unpredictability, harder to read
  deathBowling: number;         // 0-100: Effectiveness in final overs
  lineDiscipline: number;       // 0-100: Consistency of good lines
  pressureHandling: number;     // 0-100: Performance under pressure
}

export interface Player {
  id: string;
  name: string;
  shortName: string;
  role: "batsman" | "bowler" | "all-rounder" | "wicket-keeper";
  batting: BattingStats;
  bowling: BowlingStats;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  players: Player[];
}
