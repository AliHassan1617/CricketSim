import { BowlerType } from "../types/enums";
import { Team } from "../types/player";

export const thunderbolts: Team = {
  id: "thunderbolts",
  name: "Thunderbolts",
  shortName: "THB",
  color: "emerald",
  players: [
    // --- BATSMEN ---
    {
      id: "t1", name: "Marcus Vane", shortName: "M Vane", role: "batsman",
      batting: { power: 82, temperament: 78, techniqueVsPace: 85, techniqueVsSpin: 72, acceleration: 70, offsideSkill: 88, legsideSkill: 74, runningBetweenWickets: 75 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 15, control: 20, variation: 10, deathBowling: 10, lineDiscipline: 18, pressureHandling: 20 },
    },
    {
      id: "t2", name: "Aiden Cross", shortName: "A Cross", role: "batsman",
      batting: { power: 68, temperament: 85, techniqueVsPace: 80, techniqueVsSpin: 78, acceleration: 65, offsideSkill: 76, legsideSkill: 80, runningBetweenWickets: 82 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 12, control: 15, variation: 8, deathBowling: 5, lineDiscipline: 14, pressureHandling: 15 },
    },
    {
      id: "t3", name: "Ravi Dhar", shortName: "R Dhar", role: "batsman",
      batting: { power: 90, temperament: 62, techniqueVsPace: 70, techniqueVsSpin: 75, acceleration: 88, offsideSkill: 72, legsideSkill: 85, runningBetweenWickets: 68 },
      bowling: { bowlerType: BowlerType.Pace, mainSkill: 18, control: 20, variation: 12, deathBowling: 8, lineDiscipline: 15, pressureHandling: 18 },
    },
    {
      id: "t4", name: "Leo Marsh", shortName: "L Marsh", role: "batsman",
      batting: { power: 75, temperament: 80, techniqueVsPace: 82, techniqueVsSpin: 68, acceleration: 72, offsideSkill: 82, legsideSkill: 70, runningBetweenWickets: 78 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 10, control: 12, variation: 8, deathBowling: 5, lineDiscipline: 10, pressureHandling: 12 },
    },
    {
      id: "t5", name: "Carlos Mena", shortName: "C Mena", role: "batsman",
      batting: { power: 70, temperament: 74, techniqueVsPace: 76, techniqueVsSpin: 82, acceleration: 68, offsideSkill: 70, legsideSkill: 78, runningBetweenWickets: 85 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 20, control: 22, variation: 15, deathBowling: 10, lineDiscipline: 18, pressureHandling: 15 },
    },
    // --- WICKET-KEEPERS ---
    {
      id: "t6", name: "Jake Finley", shortName: "J Finley", role: "wicket-keeper",
      batting: { power: 78, temperament: 72, techniqueVsPace: 74, techniqueVsSpin: 70, acceleration: 80, offsideSkill: 68, legsideSkill: 82, runningBetweenWickets: 80 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 10, control: 12, variation: 5, deathBowling: 5, lineDiscipline: 10, pressureHandling: 10 },
    },
    {
      id: "t7", name: "Omar Saeed", shortName: "O Saeed", role: "wicket-keeper",
      batting: { power: 65, temperament: 82, techniqueVsPace: 72, techniqueVsSpin: 76, acceleration: 60, offsideSkill: 74, legsideSkill: 68, runningBetweenWickets: 78 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 5, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
    },
    // --- ALL-ROUNDERS ---
    {
      id: "t8", name: "Kai Stryker", shortName: "K Stryker", role: "all-rounder",
      batting: { power: 80, temperament: 68, techniqueVsPace: 65, techniqueVsSpin: 60, acceleration: 75, offsideSkill: 62, legsideSkill: 78, runningBetweenWickets: 72 },
      bowling: { bowlerType: BowlerType.Pace, mainSkill: 72, control: 65, variation: 58, deathBowling: 62, lineDiscipline: 60, pressureHandling: 65 },
    },
    {
      id: "t9", name: "Nadeem Ali", shortName: "N Ali", role: "all-rounder",
      batting: { power: 62, temperament: 75, techniqueVsPace: 60, techniqueVsSpin: 68, acceleration: 58, offsideSkill: 58, legsideSkill: 72, runningBetweenWickets: 70 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 78, control: 80, variation: 72, deathBowling: 55, lineDiscipline: 82, pressureHandling: 70 },
    },
    {
      id: "t10", name: "Dylan Hart", shortName: "D Hart", role: "all-rounder",
      batting: { power: 72, temperament: 65, techniqueVsPace: 58, techniqueVsSpin: 62, acceleration: 68, offsideSkill: 55, legsideSkill: 65, runningBetweenWickets: 75 },
      bowling: { bowlerType: BowlerType.Pace, mainSkill: 68, control: 62, variation: 55, deathBowling: 70, lineDiscipline: 58, pressureHandling: 60 },
    },
    // --- BOWLERS --- (batting raised to realistic tail-ender level: tech 42-52)
    {
      id: "t11", name: "Brett Falcon", shortName: "B Falcon", role: "bowler",
      batting: { power: 48, temperament: 52, techniqueVsPace: 44, techniqueVsSpin: 42, acceleration: 38, offsideSkill: 40, legsideSkill: 45, runningBetweenWickets: 50 },
      bowling: { bowlerType: BowlerType.Pace, mainSkill: 90, control: 85, variation: 72, deathBowling: 82, lineDiscipline: 88, pressureHandling: 80 },
    },
    {
      id: "t12", name: "Sanjay Veer", shortName: "S Veer", role: "bowler",
      batting: { power: 42, temperament: 50, techniqueVsPace: 40, techniqueVsSpin: 46, acceleration: 35, offsideSkill: 38, legsideSkill: 42, runningBetweenWickets: 45 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 85, control: 82, variation: 80, deathBowling: 60, lineDiscipline: 84, pressureHandling: 75 },
    },
    {
      id: "t13", name: "Liam Quick", shortName: "L Quick", role: "bowler",
      batting: { power: 52, temperament: 45, techniqueVsPace: 48, techniqueVsSpin: 42, acceleration: 40, offsideSkill: 42, legsideSkill: 50, runningBetweenWickets: 48 },
      bowling: { bowlerType: BowlerType.Pace, mainSkill: 82, control: 74, variation: 68, deathBowling: 75, lineDiscipline: 72, pressureHandling: 70 },
    },
    {
      id: "t14", name: "Farid Zaman", shortName: "F Zaman", role: "bowler",
      batting: { power: 40, temperament: 55, techniqueVsPace: 38, techniqueVsSpin: 44, acceleration: 32, offsideSkill: 36, legsideSkill: 40, runningBetweenWickets: 42 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 80, control: 78, variation: 75, deathBowling: 55, lineDiscipline: 76, pressureHandling: 68 },
    },
    {
      id: "t15", name: "Rex Bolt", shortName: "R Bolt", role: "bowler",
      batting: { power: 55, temperament: 42, techniqueVsPace: 46, techniqueVsSpin: 38, acceleration: 42, offsideSkill: 44, legsideSkill: 52, runningBetweenWickets: 52 },
      bowling: { bowlerType: BowlerType.Pace, mainSkill: 78, control: 70, variation: 62, deathBowling: 72, lineDiscipline: 68, pressureHandling: 65 },
    },
  ],
};

export const stormRiders: Team = {
  id: "stormriders",
  name: "Storm Riders",
  shortName: "STR",
  color: "amber",
  players: [
    // --- BATSMEN ---
    {
      id: "s1", name: "Zane Blaze", shortName: "Z Blaze", role: "batsman",
      batting: { power: 92, temperament: 58, techniqueVsPace: 78, techniqueVsSpin: 68, acceleration: 90, offsideSkill: 75, legsideSkill: 88, runningBetweenWickets: 65 },
      bowling: { bowlerType: BowlerType.Pace, mainSkill: 15, control: 18, variation: 10, deathBowling: 8, lineDiscipline: 12, pressureHandling: 15 },
    },
    {
      id: "s2", name: "Arjun Kale", shortName: "A Kale", role: "batsman",
      batting: { power: 72, temperament: 80, techniqueVsPace: 82, techniqueVsSpin: 85, acceleration: 68, offsideSkill: 84, legsideSkill: 72, runningBetweenWickets: 80 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 18, control: 20, variation: 12, deathBowling: 8, lineDiscipline: 16, pressureHandling: 18 },
    },
    {
      id: "s3", name: "Tom Wilder", shortName: "T Wilder", role: "batsman",
      batting: { power: 85, temperament: 55, techniqueVsPace: 72, techniqueVsSpin: 65, acceleration: 85, offsideSkill: 68, legsideSkill: 82, runningBetweenWickets: 60 },
      bowling: { bowlerType: BowlerType.Pace, mainSkill: 20, control: 22, variation: 15, deathBowling: 12, lineDiscipline: 18, pressureHandling: 20 },
    },
    {
      id: "s4", name: "Ethan Wolfe", shortName: "E Wolfe", role: "batsman",
      batting: { power: 78, temperament: 72, techniqueVsPace: 75, techniqueVsSpin: 78, acceleration: 74, offsideSkill: 80, legsideSkill: 75, runningBetweenWickets: 78 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 14, control: 16, variation: 10, deathBowling: 6, lineDiscipline: 12, pressureHandling: 14 },
    },
    {
      id: "s5", name: "Idris Shaw", shortName: "I Shaw", role: "batsman",
      batting: { power: 70, temperament: 68, techniqueVsPace: 70, techniqueVsSpin: 72, acceleration: 78, offsideSkill: 72, legsideSkill: 70, runningBetweenWickets: 82 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 22, control: 25, variation: 18, deathBowling: 10, lineDiscipline: 20, pressureHandling: 18 },
    },
    // --- WICKET-KEEPERS ---
    {
      id: "s6", name: "Nick Flare", shortName: "N Flare", role: "wicket-keeper",
      batting: { power: 85, temperament: 60, techniqueVsPace: 68, techniqueVsSpin: 65, acceleration: 82, offsideSkill: 65, legsideSkill: 80, runningBetweenWickets: 72 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 10, control: 12, variation: 8, deathBowling: 5, lineDiscipline: 10, pressureHandling: 10 },
    },
    {
      id: "s7", name: "Hamza Raza", shortName: "H Raza", role: "wicket-keeper",
      batting: { power: 62, temperament: 78, techniqueVsPace: 72, techniqueVsSpin: 75, acceleration: 58, offsideSkill: 70, legsideSkill: 65, runningBetweenWickets: 76 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 5, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
    },
    // --- ALL-ROUNDERS ---
    {
      id: "s8", name: "Ash Tempest", shortName: "A Tempest", role: "all-rounder",
      batting: { power: 78, temperament: 65, techniqueVsPace: 62, techniqueVsSpin: 58, acceleration: 72, offsideSkill: 60, legsideSkill: 75, runningBetweenWickets: 70 },
      bowling: { bowlerType: BowlerType.Pace, mainSkill: 75, control: 68, variation: 65, deathBowling: 72, lineDiscipline: 62, pressureHandling: 68 },
    },
    {
      id: "s9", name: "Vikram Sen", shortName: "V Sen", role: "all-rounder",
      batting: { power: 65, temperament: 72, techniqueVsPace: 58, techniqueVsSpin: 70, acceleration: 62, offsideSkill: 55, legsideSkill: 68, runningBetweenWickets: 74 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 80, control: 76, variation: 78, deathBowling: 58, lineDiscipline: 78, pressureHandling: 72 },
    },
    {
      id: "s10", name: "Ryan Storm", shortName: "R Storm", role: "all-rounder",
      batting: { power: 75, temperament: 60, techniqueVsPace: 55, techniqueVsSpin: 52, acceleration: 70, offsideSkill: 52, legsideSkill: 68, runningBetweenWickets: 65 },
      bowling: { bowlerType: BowlerType.Pace, mainSkill: 70, control: 64, variation: 60, deathBowling: 68, lineDiscipline: 60, pressureHandling: 62 },
    },
    // --- BOWLERS --- (batting raised to realistic tail-ender level: tech 42-52)
    {
      id: "s11", name: "Jace Thunder", shortName: "J Thunder", role: "bowler",
      batting: { power: 50, temperament: 48, techniqueVsPace: 45, techniqueVsSpin: 40, acceleration: 38, offsideSkill: 42, legsideSkill: 48, runningBetweenWickets: 46 },
      bowling: { bowlerType: BowlerType.Pace, mainSkill: 88, control: 80, variation: 75, deathBowling: 85, lineDiscipline: 82, pressureHandling: 78 },
    },
    {
      id: "s12", name: "Aarav Mishra", shortName: "A Mishra", role: "bowler",
      batting: { power: 40, temperament: 50, techniqueVsPace: 38, techniqueVsSpin: 45, acceleration: 32, offsideSkill: 36, legsideSkill: 40, runningBetweenWickets: 40 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 84, control: 80, variation: 82, deathBowling: 58, lineDiscipline: 80, pressureHandling: 72 },
    },
    {
      id: "s13", name: "Cole Fury", shortName: "C Fury", role: "bowler",
      batting: { power: 54, temperament: 44, techniqueVsPace: 50, techniqueVsSpin: 42, acceleration: 42, offsideSkill: 45, legsideSkill: 52, runningBetweenWickets: 48 },
      bowling: { bowlerType: BowlerType.Pace, mainSkill: 82, control: 72, variation: 70, deathBowling: 78, lineDiscipline: 70, pressureHandling: 68 },
    },
    {
      id: "s14", name: "Tariq Noon", shortName: "T Noon", role: "bowler",
      batting: { power: 38, temperament: 52, techniqueVsPace: 36, techniqueVsSpin: 44, acceleration: 30, offsideSkill: 34, legsideSkill: 38, runningBetweenWickets: 42 },
      bowling: { bowlerType: BowlerType.Spin, mainSkill: 78, control: 82, variation: 72, deathBowling: 52, lineDiscipline: 78, pressureHandling: 65 },
    },
    {
      id: "s15", name: "Miles Gale", shortName: "M Gale", role: "bowler",
      batting: { power: 46, temperament: 40, techniqueVsPace: 42, techniqueVsSpin: 36, acceleration: 36, offsideSkill: 38, legsideSkill: 46, runningBetweenWickets: 44 },
      bowling: { bowlerType: BowlerType.Pace, mainSkill: 76, control: 68, variation: 65, deathBowling: 74, lineDiscipline: 66, pressureHandling: 62 },
    },
  ],
};

export const allTeams = [thunderbolts, stormRiders];
