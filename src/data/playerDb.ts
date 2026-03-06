import { BowlerType } from "../types/enums";
import { BattingPosition, Player } from "../types/player";

/**
 * Central player database — all players from all teams in a flat record.
 * Key format: "{team_prefix}{number}" (e.g. "t1" = India player 1, "e1" = England player 1)
 * To add a new team: add new players here, then register the team in teamDb.ts.
 */
export const playerDb: Record<string, Player> = {

  // ─────────────────────────────────────────────────────────────────────────
  // INDIA  (t1 – t15)
  // ─────────────────────────────────────────────────────────────────────────
  t1: {
    id: "t1", name: "Suryakumar Yadav", shortName: "SK Yadav", role: "batsman",
    batting: { power: 92, temperament: 68, techniqueVsPace: 80, techniqueVsSpin: 78, acceleration: 95, offsideSkill: 82, legsideSkill: 90, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 10, control: 12, variation: 8, deathBowling: 8, lineDiscipline: 10, pressureHandling: 12 },
  },
  t2: {
    id: "t2", name: "Abhishek Sharma", shortName: "A Sharma", role: "batsman",
    batting: { power: 85, temperament: 62, techniqueVsPace: 74, techniqueVsSpin: 68, acceleration: 88, offsideSkill: 76, legsideSkill: 82, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 58, control: 55, variation: 50, deathBowling: 45, lineDiscipline: 52, pressureHandling: 55 },
  },
  t3: {
    id: "t3", name: "Tilak Varma", shortName: "T Varma", role: "batsman",
    batting: { power: 76, temperament: 84, techniqueVsPace: 80, techniqueVsSpin: 86, acceleration: 74, offsideSkill: 82, legsideSkill: 78, runningBetweenWickets: 80 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 12, control: 15, variation: 10, deathBowling: 8, lineDiscipline: 12, pressureHandling: 14 },
  },
  t4: {
    id: "t4", name: "Rinku Singh", shortName: "R Singh", role: "batsman",
    batting: { power: 84, temperament: 72, techniqueVsPace: 76, techniqueVsSpin: 74, acceleration: 88, offsideSkill: 74, legsideSkill: 86, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 10, control: 12, variation: 8, deathBowling: 6, lineDiscipline: 10, pressureHandling: 10 },
  },
  t5: {
    id: "t5", name: "Sanju Samson", shortName: "S Samson", role: "wicket-keeper",
    batting: { power: 82, temperament: 68, techniqueVsPace: 78, techniqueVsSpin: 75, acceleration: 82, offsideSkill: 80, legsideSkill: 80, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  t6: {
    id: "t6", name: "Ishan Kishan", shortName: "I Kishan", role: "wicket-keeper",
    batting: { power: 82, temperament: 62, techniqueVsPace: 72, techniqueVsSpin: 68, acceleration: 82, offsideSkill: 70, legsideSkill: 85, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  t7: {
    id: "t7", name: "Hardik Pandya", shortName: "H Pandya", role: "all-rounder",
    batting: { power: 86, temperament: 70, techniqueVsPace: 74, techniqueVsSpin: 66, acceleration: 85, offsideSkill: 72, legsideSkill: 80, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 76, control: 72, variation: 68, deathBowling: 80, lineDiscipline: 70, pressureHandling: 74 },
  },
  t8: {
    id: "t8", name: "Axar Patel", shortName: "A Patel", role: "all-rounder",
    batting: { power: 70, temperament: 76, techniqueVsPace: 64, techniqueVsSpin: 72, acceleration: 68, offsideSkill: 64, legsideSkill: 72, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 80, control: 83, variation: 72, deathBowling: 70, lineDiscipline: 85, pressureHandling: 80 },
  },
  t9: {
    id: "t9", name: "Shivam Dube", shortName: "S Dube", role: "all-rounder",
    batting: { power: 88, temperament: 64, techniqueVsPace: 68, techniqueVsSpin: 72, acceleration: 82, offsideSkill: 68, legsideSkill: 84, runningBetweenWickets: 66 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 60, control: 58, variation: 52, deathBowling: 62, lineDiscipline: 55, pressureHandling: 58 },
  },
  t10: {
    id: "t10", name: "Washington Sundar", shortName: "W Sundar", role: "all-rounder",
    batting: { power: 62, temperament: 78, techniqueVsPace: 60, techniqueVsSpin: 68, acceleration: 60, offsideSkill: 60, legsideSkill: 64, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 75, control: 80, variation: 68, deathBowling: 62, lineDiscipline: 82, pressureHandling: 74 },
  },
  t11: {
    id: "t11", name: "Jasprit Bumrah", shortName: "J Bumrah", role: "bowler",
    batting: { power: 42, temperament: 48, techniqueVsPace: 36, techniqueVsSpin: 34, acceleration: 35, offsideSkill: 38, legsideSkill: 42, runningBetweenWickets: 44 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 96, control: 94, variation: 88, deathBowling: 96, lineDiscipline: 96, pressureHandling: 95 },
  },
  t12: {
    id: "t12", name: "Arshdeep Singh", shortName: "Arsh Singh", role: "bowler",
    batting: { power: 40, temperament: 50, techniqueVsPace: 36, techniqueVsSpin: 34, acceleration: 34, offsideSkill: 35, legsideSkill: 38, runningBetweenWickets: 42 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 84, control: 86, variation: 74, deathBowling: 90, lineDiscipline: 88, pressureHandling: 84 },
  },
  t13: {
    id: "t13", name: "Mohammed Siraj", shortName: "M Siraj", role: "bowler",
    batting: { power: 38, temperament: 45, techniqueVsPace: 33, techniqueVsSpin: 30, acceleration: 32, offsideSkill: 34, legsideSkill: 36, runningBetweenWickets: 40 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 80, control: 78, variation: 72, deathBowling: 76, lineDiscipline: 80, pressureHandling: 76 },
  },
  t14: {
    id: "t14", name: "Kuldeep Yadav", shortName: "K Yadav", role: "bowler",
    batting: { power: 36, temperament: 44, techniqueVsPace: 33, techniqueVsSpin: 38, acceleration: 32, offsideSkill: 34, legsideSkill: 36, runningBetweenWickets: 40 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 88, control: 82, variation: 92, deathBowling: 72, lineDiscipline: 82, pressureHandling: 80 },
  },
  t15: {
    id: "t15", name: "Varun Chakravarthy", shortName: "V Chakra", role: "bowler",
    batting: { power: 34, temperament: 42, techniqueVsPace: 30, techniqueVsSpin: 36, acceleration: 30, offsideSkill: 32, legsideSkill: 34, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 86, control: 80, variation: 92, deathBowling: 66, lineDiscipline: 78, pressureHandling: 76 },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PAKISTAN  (s1 – s15)
  // ─────────────────────────────────────────────────────────────────────────
  s1: {
    id: "s1", name: "Babar Azam", shortName: "B Azam", role: "batsman",
    batting: { power: 72, temperament: 92, techniqueVsPace: 93, techniqueVsSpin: 90, acceleration: 68, offsideSkill: 95, legsideSkill: 76, runningBetweenWickets: 86 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 10, control: 12, variation: 8, deathBowling: 6, lineDiscipline: 10, pressureHandling: 12 },
  },
  s2: {
    id: "s2", name: "Fakhar Zaman", shortName: "F Zaman", role: "batsman",
    batting: { power: 86, temperament: 65, techniqueVsPace: 80, techniqueVsSpin: 72, acceleration: 84, offsideSkill: 74, legsideSkill: 88, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  s3: {
    id: "s3", name: "Saim Ayub", shortName: "S Ayub", role: "batsman",
    batting: { power: 82, temperament: 65, techniqueVsPace: 76, techniqueVsSpin: 70, acceleration: 86, offsideSkill: 74, legsideSkill: 82, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 72, control: 64, variation: 80, deathBowling: 58, lineDiscipline: 62, pressureHandling: 72 },
  },
  s4: {
    id: "s4", name: "Sahibzada Farhan", shortName: "S Farhan", role: "batsman",
    batting: { power: 70, temperament: 74, techniqueVsPace: 72, techniqueVsSpin: 70, acceleration: 68, offsideSkill: 70, legsideSkill: 74, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  s5: {
    id: "s5", name: "Usman Khan", shortName: "U Khan", role: "wicket-keeper",
    batting: { power: 74, temperament: 70, techniqueVsPace: 73, techniqueVsSpin: 70, acceleration: 72, offsideSkill: 74, legsideSkill: 72, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  s6: {
    id: "s6", name: "Khawaja Nafay", shortName: "KM Nafay", role: "wicket-keeper",
    batting: { power: 64, temperament: 70, techniqueVsPace: 67, techniqueVsSpin: 70, acceleration: 62, offsideSkill: 66, legsideSkill: 65, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  s7: {
    id: "s7", name: "Salman Agha", shortName: "S Agha", role: "all-rounder",
    batting: { power: 72, temperament: 74, techniqueVsPace: 68, techniqueVsSpin: 75, acceleration: 70, offsideSkill: 68, legsideSkill: 74, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 74, control: 76, variation: 70, deathBowling: 66, lineDiscipline: 76, pressureHandling: 70 },
  },
  s8: {
    id: "s8", name: "Mohammad Nawaz", shortName: "M Nawaz", role: "all-rounder",
    batting: { power: 68, temperament: 66, techniqueVsPace: 58, techniqueVsSpin: 65, acceleration: 66, offsideSkill: 58, legsideSkill: 68, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 76, control: 76, variation: 72, deathBowling: 66, lineDiscipline: 76, pressureHandling: 72 },
  },
  s9: {
    id: "s9", name: "Faheem Ashraf", shortName: "F Ashraf", role: "all-rounder",
    batting: { power: 72, temperament: 64, techniqueVsPace: 62, techniqueVsSpin: 58, acceleration: 70, offsideSkill: 60, legsideSkill: 74, runningBetweenWickets: 66 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 72, control: 68, variation: 60, deathBowling: 72, lineDiscipline: 65, pressureHandling: 66 },
  },
  s10: {
    id: "s10", name: "Shadab Khan", shortName: "S Khan", role: "all-rounder",
    batting: { power: 66, temperament: 70, techniqueVsPace: 60, techniqueVsSpin: 65, acceleration: 65, offsideSkill: 60, legsideSkill: 68, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 84, control: 78, variation: 86, deathBowling: 74, lineDiscipline: 80, pressureHandling: 80 },
  },
  s11: {
    id: "s11", name: "Mohammad Salman Mirza", shortName: "MS Mirza", role: "all-rounder",
    batting: { power: 68, temperament: 65, techniqueVsPace: 62, techniqueVsSpin: 60, acceleration: 66, offsideSkill: 60, legsideSkill: 70, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 70, control: 68, variation: 62, deathBowling: 68, lineDiscipline: 66, pressureHandling: 64 },
  },
  s12: {
    id: "s12", name: "Shaheen Shah Afridi", shortName: "Shaheen", role: "bowler",
    batting: { power: 42, temperament: 48, techniqueVsPace: 38, techniqueVsSpin: 35, acceleration: 36, offsideSkill: 38, legsideSkill: 42, runningBetweenWickets: 42 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 91, control: 86, variation: 82, deathBowling: 89, lineDiscipline: 87, pressureHandling: 86 },
  },
  s13: {
    id: "s13", name: "Naseem Shah", shortName: "Naseem", role: "bowler",
    batting: { power: 40, temperament: 45, techniqueVsPace: 36, techniqueVsSpin: 32, acceleration: 33, offsideSkill: 35, legsideSkill: 38, runningBetweenWickets: 40 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 85, control: 80, variation: 76, deathBowling: 82, lineDiscipline: 82, pressureHandling: 80 },
  },
  s14: {
    id: "s14", name: "Abrar Ahmed", shortName: "Abrar Ahmed", role: "bowler",
    batting: { power: 34, temperament: 44, techniqueVsPace: 32, techniqueVsSpin: 38, acceleration: 30, offsideSkill: 32, legsideSkill: 34, runningBetweenWickets: 38 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 81, control: 76, variation: 89, deathBowling: 63, lineDiscipline: 75, pressureHandling: 73 },
  },
  s15: {
    id: "s15", name: "Usman Tariq", shortName: "U Tariq", role: "bowler",
    batting: { power: 38, temperament: 42, techniqueVsPace: 35, techniqueVsSpin: 30, acceleration: 30, offsideSkill: 33, legsideSkill: 36, runningBetweenWickets: 38 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 88, control: 82, variation: 90, deathBowling: 76, lineDiscipline: 80, pressureHandling: 68 },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ENGLAND  (e1 – e15)
  // ─────────────────────────────────────────────────────────────────────────
  e1: {
    id: "e1", name: "Phil Salt", shortName: "P Salt", role: "wicket-keeper",
    batting: { power: 84, temperament: 62, techniqueVsPace: 78, techniqueVsSpin: 70, acceleration: 88, offsideSkill: 80, legsideSkill: 76, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  e2: {
    id: "e2", name: "Jos Buttler", shortName: "J Buttler", role: "wicket-keeper",
    batting: { power: 90, temperament: 72, techniqueVsPace: 82, techniqueVsSpin: 74, acceleration: 92, offsideSkill: 80, legsideSkill: 84, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  e3: {
    id: "e3", name: "Ben Duckett", shortName: "B Duckett", role: "batsman",
    batting: { power: 78, temperament: 74, techniqueVsPace: 78, techniqueVsSpin: 80, acceleration: 80, offsideSkill: 78, legsideSkill: 78, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  e4: {
    id: "e4", name: "Dawid Malan", shortName: "D Malan", role: "batsman",
    batting: { power: 68, temperament: 84, techniqueVsPace: 82, techniqueVsSpin: 78, acceleration: 66, offsideSkill: 80, legsideSkill: 72, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  e5: {
    id: "e5", name: "Harry Brook", shortName: "H Brook", role: "batsman",
    batting: { power: 84, temperament: 76, techniqueVsPace: 84, techniqueVsSpin: 80, acceleration: 82, offsideSkill: 82, legsideSkill: 78, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 12, control: 14, variation: 10, deathBowling: 8, lineDiscipline: 12, pressureHandling: 14 },
  },
  e6: {
    id: "e6", name: "Liam Livingstone", shortName: "L Livingstone", role: "all-rounder",
    batting: { power: 92, temperament: 64, techniqueVsPace: 74, techniqueVsSpin: 72, acceleration: 90, offsideSkill: 74, legsideSkill: 84, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 70, control: 62, variation: 74, deathBowling: 60, lineDiscipline: 60, pressureHandling: 64 },
  },
  e7: {
    id: "e7", name: "Moeen Ali", shortName: "M Ali", role: "all-rounder",
    batting: { power: 74, temperament: 74, techniqueVsPace: 68, techniqueVsSpin: 72, acceleration: 74, offsideSkill: 70, legsideSkill: 74, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 78, control: 80, variation: 74, deathBowling: 68, lineDiscipline: 82, pressureHandling: 76 },
  },
  e8: {
    id: "e8", name: "Sam Curran", shortName: "S Curran", role: "all-rounder",
    batting: { power: 72, temperament: 68, techniqueVsPace: 62, techniqueVsSpin: 60, acceleration: 68, offsideSkill: 62, legsideSkill: 72, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 80, control: 76, variation: 72, deathBowling: 86, lineDiscipline: 72, pressureHandling: 78 },
  },
  e9: {
    id: "e9", name: "Chris Jordan", shortName: "C Jordan", role: "all-rounder",
    batting: { power: 64, temperament: 62, techniqueVsPace: 56, techniqueVsSpin: 54, acceleration: 60, offsideSkill: 56, legsideSkill: 62, runningBetweenWickets: 64 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 74, control: 70, variation: 68, deathBowling: 80, lineDiscipline: 68, pressureHandling: 72 },
  },
  e10: {
    id: "e10", name: "Jofra Archer", shortName: "J Archer", role: "bowler",
    batting: { power: 48, temperament: 52, techniqueVsPace: 42, techniqueVsSpin: 38, acceleration: 40, offsideSkill: 42, legsideSkill: 46, runningBetweenWickets: 44 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 90, control: 84, variation: 82, deathBowling: 90, lineDiscipline: 84, pressureHandling: 86 },
  },
  e11: {
    id: "e11", name: "Mark Wood", shortName: "M Wood", role: "bowler",
    batting: { power: 44, temperament: 48, techniqueVsPace: 38, techniqueVsSpin: 34, acceleration: 36, offsideSkill: 38, legsideSkill: 42, runningBetweenWickets: 42 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 88, control: 78, variation: 76, deathBowling: 84, lineDiscipline: 76, pressureHandling: 80 },
  },
  e12: {
    id: "e12", name: "Adil Rashid", shortName: "A Rashid", role: "bowler",
    batting: { power: 42, temperament: 50, techniqueVsPace: 36, techniqueVsSpin: 42, acceleration: 36, offsideSkill: 38, legsideSkill: 42, runningBetweenWickets: 44 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 86, control: 82, variation: 88, deathBowling: 74, lineDiscipline: 82, pressureHandling: 84 },
  },
  e13: {
    id: "e13", name: "Reece Topley", shortName: "R Topley", role: "bowler",
    batting: { power: 36, temperament: 44, techniqueVsPace: 30, techniqueVsSpin: 28, acceleration: 30, offsideSkill: 30, legsideSkill: 34, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 76, control: 74, variation: 68, deathBowling: 72, lineDiscipline: 76, pressureHandling: 70 },
  },
  e14: {
    id: "e14", name: "Gus Atkinson", shortName: "G Atkinson", role: "bowler",
    batting: { power: 46, temperament: 50, techniqueVsPace: 40, techniqueVsSpin: 36, acceleration: 38, offsideSkill: 38, legsideSkill: 44, runningBetweenWickets: 44 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 78, control: 76, variation: 70, deathBowling: 74, lineDiscipline: 76, pressureHandling: 72 },
  },
  e15: {
    id: "e15", name: "Matt Parkinson", shortName: "M Parkinson", role: "bowler",
    batting: { power: 32, temperament: 42, techniqueVsPace: 28, techniqueVsSpin: 34, acceleration: 28, offsideSkill: 30, legsideSkill: 32, runningBetweenWickets: 34 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 74, control: 70, variation: 80, deathBowling: 62, lineDiscipline: 70, pressureHandling: 66 },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AUSTRALIA  (a1 – a15)
  // ─────────────────────────────────────────────────────────────────────────
  a1: {
    id: "a1", name: "Travis Head", shortName: "T Head", role: "batsman",
    batting: { power: 90, temperament: 72, techniqueVsPace: 84, techniqueVsSpin: 78, acceleration: 90, offsideSkill: 82, legsideSkill: 80, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 42, control: 40, variation: 38, deathBowling: 36, lineDiscipline: 38, pressureHandling: 40 },
  },
  a2: {
    id: "a2", name: "Jake Fraser-McGurk", shortName: "JFM", role: "batsman",
    batting: { power: 90, temperament: 58, techniqueVsPace: 76, techniqueVsSpin: 70, acceleration: 88, offsideSkill: 82, legsideSkill: 78, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 10, control: 12, variation: 8, deathBowling: 6, lineDiscipline: 10, pressureHandling: 12 },
  },
  a3: {
    id: "a3", name: "Glenn Maxwell", shortName: "G Maxwell", role: "all-rounder",
    batting: { power: 88, temperament: 68, techniqueVsPace: 80, techniqueVsSpin: 84, acceleration: 86, offsideSkill: 80, legsideSkill: 84, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 74, control: 68, variation: 80, deathBowling: 62, lineDiscipline: 66, pressureHandling: 72 },
  },
  a4: {
    id: "a4", name: "Josh Inglis", shortName: "J Inglis", role: "wicket-keeper",
    batting: { power: 78, temperament: 68, techniqueVsPace: 74, techniqueVsSpin: 70, acceleration: 78, offsideSkill: 74, legsideSkill: 76, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  a5: {
    id: "a5", name: "Matthew Wade", shortName: "M Wade", role: "wicket-keeper",
    batting: { power: 76, temperament: 70, techniqueVsPace: 72, techniqueVsSpin: 68, acceleration: 76, offsideSkill: 72, legsideSkill: 76, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  a6: {
    id: "a6", name: "Mitchell Marsh", shortName: "M Marsh", role: "all-rounder",
    batting: { power: 84, temperament: 70, techniqueVsPace: 76, techniqueVsSpin: 70, acceleration: 80, offsideSkill: 74, legsideSkill: 80, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 72, control: 68, variation: 62, deathBowling: 72, lineDiscipline: 64, pressureHandling: 68 },
  },
  a7: {
    id: "a7", name: "Marcus Stoinis", shortName: "M Stoinis", role: "all-rounder",
    batting: { power: 84, temperament: 68, techniqueVsPace: 74, techniqueVsSpin: 70, acceleration: 82, offsideSkill: 72, legsideSkill: 78, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 70, control: 66, variation: 58, deathBowling: 68, lineDiscipline: 62, pressureHandling: 64 },
  },
  a8: {
    id: "a8", name: "Cameron Green", shortName: "C Green", role: "all-rounder",
    batting: { power: 82, temperament: 72, techniqueVsPace: 76, techniqueVsSpin: 68, acceleration: 78, offsideSkill: 74, legsideSkill: 78, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 74, control: 68, variation: 60, deathBowling: 70, lineDiscipline: 64, pressureHandling: 68 },
  },
  a9: {
    id: "a9", name: "Tim David", shortName: "T David", role: "all-rounder",
    batting: { power: 90, temperament: 70, techniqueVsPace: 74, techniqueVsSpin: 76, acceleration: 88, offsideSkill: 72, legsideSkill: 82, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 12, control: 10, variation: 8, deathBowling: 8, lineDiscipline: 10, pressureHandling: 12 },
  },
  a10: {
    id: "a10", name: "Pat Cummins", shortName: "P Cummins", role: "bowler",
    batting: { power: 52, temperament: 58, techniqueVsPace: 46, techniqueVsSpin: 42, acceleration: 46, offsideSkill: 46, legsideSkill: 50, runningBetweenWickets: 50 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 90, control: 86, variation: 78, deathBowling: 88, lineDiscipline: 86, pressureHandling: 88 },
  },
  a11: {
    id: "a11", name: "Josh Hazlewood", shortName: "J Hazlewood", role: "bowler",
    batting: { power: 40, temperament: 50, techniqueVsPace: 36, techniqueVsSpin: 32, acceleration: 34, offsideSkill: 34, legsideSkill: 38, runningBetweenWickets: 40 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 86, control: 88, variation: 72, deathBowling: 80, lineDiscipline: 88, pressureHandling: 82 },
  },
  a12: {
    id: "a12", name: "Mitchell Starc", shortName: "M Starc", role: "bowler",
    batting: { power: 46, temperament: 52, techniqueVsPace: 42, techniqueVsSpin: 36, acceleration: 40, offsideSkill: 40, legsideSkill: 44, runningBetweenWickets: 44 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 88, control: 80, variation: 78, deathBowling: 88, lineDiscipline: 80, pressureHandling: 80 },
  },
  a13: {
    id: "a13", name: "Adam Zampa", shortName: "A Zampa", role: "bowler",
    batting: { power: 36, temperament: 46, techniqueVsPace: 32, techniqueVsSpin: 36, acceleration: 30, offsideSkill: 32, legsideSkill: 36, runningBetweenWickets: 38 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 86, control: 82, variation: 84, deathBowling: 72, lineDiscipline: 82, pressureHandling: 80 },
  },
  a14: {
    id: "a14", name: "Nathan Ellis", shortName: "N Ellis", role: "bowler",
    batting: { power: 40, temperament: 48, techniqueVsPace: 36, techniqueVsSpin: 32, acceleration: 34, offsideSkill: 34, legsideSkill: 38, runningBetweenWickets: 38 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 76, control: 74, variation: 68, deathBowling: 78, lineDiscipline: 72, pressureHandling: 72 },
  },
  a15: {
    id: "a15", name: "Spencer Johnson", shortName: "S Johnson", role: "bowler",
    batting: { power: 38, temperament: 44, techniqueVsPace: 32, techniqueVsSpin: 28, acceleration: 30, offsideSkill: 30, legsideSkill: 34, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 78, control: 70, variation: 68, deathBowling: 76, lineDiscipline: 70, pressureHandling: 68 },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SOUTH AFRICA  (sa1 – sa15)
  // ─────────────────────────────────────────────────────────────────────────
  sa1: {
    id: "sa1", name: "Quinton de Kock", shortName: "Q de Kock", role: "wicket-keeper",
    batting: { power: 84, temperament: 74, techniqueVsPace: 82, techniqueVsSpin: 76, acceleration: 80, offsideSkill: 80, legsideSkill: 82, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  sa2: {
    id: "sa2", name: "Heinrich Klaasen", shortName: "H Klaasen", role: "wicket-keeper",
    batting: { power: 88, temperament: 70, techniqueVsPace: 80, techniqueVsSpin: 74, acceleration: 84, offsideSkill: 78, legsideSkill: 82, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  sa3: {
    id: "sa3", name: "Reeza Hendricks", shortName: "R Hendricks", role: "batsman",
    batting: { power: 70, temperament: 78, techniqueVsPace: 78, techniqueVsSpin: 74, acceleration: 68, offsideSkill: 76, legsideSkill: 72, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  sa4: {
    id: "sa4", name: "Temba Bavuma", shortName: "T Bavuma", role: "batsman",
    batting: { power: 66, temperament: 82, techniqueVsPace: 80, techniqueVsSpin: 76, acceleration: 64, offsideSkill: 78, legsideSkill: 70, runningBetweenWickets: 80 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  sa5: {
    id: "sa5", name: "Ryan Rickelton", shortName: "R Rickelton", role: "batsman",
    batting: { power: 76, temperament: 72, techniqueVsPace: 74, techniqueVsSpin: 70, acceleration: 74, offsideSkill: 74, legsideSkill: 72, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  sa6: {
    id: "sa6", name: "Aiden Markram", shortName: "A Markram", role: "all-rounder",
    batting: { power: 76, temperament: 80, techniqueVsPace: 80, techniqueVsSpin: 84, acceleration: 74, offsideSkill: 78, legsideSkill: 74, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 68, control: 72, variation: 68, deathBowling: 60, lineDiscipline: 72, pressureHandling: 70 },
  },
  sa7: {
    id: "sa7", name: "Tristan Stubbs", shortName: "T Stubbs", role: "all-rounder",
    batting: { power: 82, temperament: 68, techniqueVsPace: 74, techniqueVsSpin: 70, acceleration: 78, offsideSkill: 74, legsideSkill: 78, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 14, control: 16, variation: 12, deathBowling: 10, lineDiscipline: 14, pressureHandling: 14 },
  },
  sa8: {
    id: "sa8", name: "David Miller", shortName: "D Miller", role: "all-rounder",
    batting: { power: 86, temperament: 72, techniqueVsPace: 76, techniqueVsSpin: 72, acceleration: 84, offsideSkill: 74, legsideSkill: 82, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 12, control: 14, variation: 10, deathBowling: 8, lineDiscipline: 12, pressureHandling: 12 },
  },
  sa9: {
    id: "sa9", name: "Marco Jansen", shortName: "M Jansen", role: "all-rounder",
    batting: { power: 74, temperament: 70, techniqueVsPace: 66, techniqueVsSpin: 62, acceleration: 70, offsideSkill: 64, legsideSkill: 74, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 78, control: 74, variation: 70, deathBowling: 76, lineDiscipline: 72, pressureHandling: 72 },
  },
  sa10: {
    id: "sa10", name: "Wiaan Mulder", shortName: "W Mulder", role: "all-rounder",
    batting: { power: 68, temperament: 68, techniqueVsPace: 62, techniqueVsSpin: 60, acceleration: 64, offsideSkill: 60, legsideSkill: 66, runningBetweenWickets: 66 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 72, control: 70, variation: 64, deathBowling: 68, lineDiscipline: 68, pressureHandling: 68 },
  },
  sa11: {
    id: "sa11", name: "Kagiso Rabada", shortName: "K Rabada", role: "bowler",
    batting: { power: 46, temperament: 52, techniqueVsPace: 42, techniqueVsSpin: 38, acceleration: 40, offsideSkill: 40, legsideSkill: 44, runningBetweenWickets: 44 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 92, control: 86, variation: 84, deathBowling: 90, lineDiscipline: 86, pressureHandling: 88 },
  },
  sa12: {
    id: "sa12", name: "Anrich Nortje", shortName: "A Nortje", role: "bowler",
    batting: { power: 42, temperament: 48, techniqueVsPace: 38, techniqueVsSpin: 34, acceleration: 36, offsideSkill: 36, legsideSkill: 40, runningBetweenWickets: 40 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 90, control: 80, variation: 78, deathBowling: 86, lineDiscipline: 80, pressureHandling: 82 },
  },
  sa13: {
    id: "sa13", name: "Tabraiz Shamsi", shortName: "T Shamsi", role: "bowler",
    batting: { power: 36, temperament: 44, techniqueVsPace: 30, techniqueVsSpin: 36, acceleration: 30, offsideSkill: 30, legsideSkill: 34, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 86, control: 78, variation: 90, deathBowling: 68, lineDiscipline: 78, pressureHandling: 76 },
  },
  sa14: {
    id: "sa14", name: "Keshav Maharaj", shortName: "K Maharaj", role: "bowler",
    batting: { power: 40, temperament: 48, techniqueVsPace: 36, techniqueVsSpin: 40, acceleration: 34, offsideSkill: 34, legsideSkill: 38, runningBetweenWickets: 40 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 82, control: 84, variation: 78, deathBowling: 70, lineDiscipline: 84, pressureHandling: 78 },
  },
  sa15: {
    id: "sa15", name: "Gerald Coetzee", shortName: "G Coetzee", role: "bowler",
    batting: { power: 40, temperament: 46, techniqueVsPace: 36, techniqueVsSpin: 32, acceleration: 34, offsideSkill: 34, legsideSkill: 38, runningBetweenWickets: 38 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 80, control: 76, variation: 70, deathBowling: 78, lineDiscipline: 74, pressureHandling: 72 },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NEW ZEALAND  (nz1 – nz15)
  // ─────────────────────────────────────────────────────────────────────────
  nz1: {
    id: "nz1", name: "Devon Conway", shortName: "D Conway", role: "wicket-keeper",
    batting: { power: 72, temperament: 84, techniqueVsPace: 82, techniqueVsSpin: 80, acceleration: 70, offsideSkill: 80, legsideSkill: 76, runningBetweenWickets: 80 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  nz2: {
    id: "nz2", name: "Finn Allen", shortName: "F Allen", role: "batsman",
    batting: { power: 88, temperament: 60, techniqueVsPace: 74, techniqueVsSpin: 70, acceleration: 90, offsideSkill: 80, legsideSkill: 76, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  nz3: {
    id: "nz3", name: "Kane Williamson", shortName: "K Williamson", role: "batsman",
    batting: { power: 70, temperament: 90, techniqueVsPace: 88, techniqueVsSpin: 86, acceleration: 66, offsideSkill: 84, legsideSkill: 74, runningBetweenWickets: 84 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 42, control: 48, variation: 42, deathBowling: 38, lineDiscipline: 48, pressureHandling: 50 },
  },
  nz4: {
    id: "nz4", name: "Tom Latham", shortName: "T Latham", role: "wicket-keeper",
    batting: { power: 66, temperament: 80, techniqueVsPace: 78, techniqueVsSpin: 76, acceleration: 62, offsideSkill: 76, legsideSkill: 70, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  nz5: {
    id: "nz5", name: "Daryl Mitchell", shortName: "D Mitchell", role: "batsman",
    batting: { power: 78, temperament: 76, techniqueVsPace: 78, techniqueVsSpin: 72, acceleration: 76, offsideSkill: 76, legsideSkill: 74, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 36, control: 38, variation: 30, deathBowling: 32, lineDiscipline: 36, pressureHandling: 38 },
  },
  nz6: {
    id: "nz6", name: "Glenn Phillips", shortName: "G Phillips", role: "all-rounder",
    batting: { power: 82, temperament: 72, techniqueVsPace: 76, techniqueVsSpin: 78, acceleration: 80, offsideSkill: 76, legsideSkill: 78, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 72, control: 66, variation: 74, deathBowling: 60, lineDiscipline: 64, pressureHandling: 68 },
  },
  nz7: {
    id: "nz7", name: "Rachin Ravindra", shortName: "R Ravindra", role: "all-rounder",
    batting: { power: 74, temperament: 78, techniqueVsPace: 76, techniqueVsSpin: 82, acceleration: 72, offsideSkill: 74, legsideSkill: 74, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 68, control: 72, variation: 68, deathBowling: 56, lineDiscipline: 72, pressureHandling: 68 },
  },
  nz8: {
    id: "nz8", name: "Michael Bracewell", shortName: "M Bracewell", role: "all-rounder",
    batting: { power: 70, temperament: 74, techniqueVsPace: 68, techniqueVsSpin: 76, acceleration: 70, offsideSkill: 68, legsideSkill: 72, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 72, control: 74, variation: 72, deathBowling: 62, lineDiscipline: 76, pressureHandling: 70 },
  },
  nz9: {
    id: "nz9", name: "Mitchell Santner", shortName: "M Santner", role: "all-rounder",
    batting: { power: 64, temperament: 76, techniqueVsPace: 62, techniqueVsSpin: 68, acceleration: 62, offsideSkill: 62, legsideSkill: 66, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 76, control: 80, variation: 70, deathBowling: 68, lineDiscipline: 82, pressureHandling: 76 },
  },
  nz10: {
    id: "nz10", name: "Trent Boult", shortName: "T Boult", role: "bowler",
    batting: { power: 44, temperament: 52, techniqueVsPace: 40, techniqueVsSpin: 36, acceleration: 38, offsideSkill: 38, legsideSkill: 42, runningBetweenWickets: 44 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 88, control: 86, variation: 82, deathBowling: 86, lineDiscipline: 86, pressureHandling: 84 },
  },
  nz11: {
    id: "nz11", name: "Tim Southee", shortName: "T Southee", role: "bowler",
    batting: { power: 46, temperament: 56, techniqueVsPace: 44, techniqueVsSpin: 40, acceleration: 40, offsideSkill: 40, legsideSkill: 44, runningBetweenWickets: 46 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 82, control: 84, variation: 76, deathBowling: 78, lineDiscipline: 84, pressureHandling: 80 },
  },
  nz12: {
    id: "nz12", name: "Matt Henry", shortName: "M Henry", role: "bowler",
    batting: { power: 40, temperament: 48, techniqueVsPace: 36, techniqueVsSpin: 32, acceleration: 34, offsideSkill: 34, legsideSkill: 38, runningBetweenWickets: 40 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 80, control: 78, variation: 72, deathBowling: 76, lineDiscipline: 78, pressureHandling: 74 },
  },
  nz13: {
    id: "nz13", name: "Ish Sodhi", shortName: "I Sodhi", role: "bowler",
    batting: { power: 38, temperament: 48, techniqueVsPace: 34, techniqueVsSpin: 38, acceleration: 32, offsideSkill: 34, legsideSkill: 36, runningBetweenWickets: 40 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 80, control: 74, variation: 84, deathBowling: 66, lineDiscipline: 74, pressureHandling: 72 },
  },
  nz14: {
    id: "nz14", name: "Lockie Ferguson", shortName: "L Ferguson", role: "bowler",
    batting: { power: 36, temperament: 44, techniqueVsPace: 32, techniqueVsSpin: 28, acceleration: 30, offsideSkill: 30, legsideSkill: 34, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 86, control: 76, variation: 74, deathBowling: 82, lineDiscipline: 76, pressureHandling: 76 },
  },
  nz15: {
    id: "nz15", name: "Adam Milne", shortName: "A Milne", role: "bowler",
    batting: { power: 36, temperament: 44, techniqueVsPace: 32, techniqueVsSpin: 28, acceleration: 28, offsideSkill: 30, legsideSkill: 34, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 80, control: 72, variation: 70, deathBowling: 76, lineDiscipline: 72, pressureHandling: 70 },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // WEST INDIES  (wi1 – wi15)
  // ─────────────────────────────────────────────────────────────────────────
  wi1: {
    id: "wi1", name: "Nicholas Pooran", shortName: "N Pooran", role: "wicket-keeper",
    batting: { power: 90, temperament: 70, techniqueVsPace: 78, techniqueVsSpin: 72, acceleration: 88, offsideSkill: 74, legsideSkill: 84, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  wi2: {
    id: "wi2", name: "Shai Hope", shortName: "S Hope", role: "wicket-keeper",
    batting: { power: 70, temperament: 80, techniqueVsPace: 78, techniqueVsSpin: 74, acceleration: 64, offsideSkill: 76, legsideSkill: 72, runningBetweenWickets: 80 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  wi3: {
    id: "wi3", name: "Brandon King", shortName: "B King", role: "batsman",
    batting: { power: 76, temperament: 72, techniqueVsPace: 74, techniqueVsSpin: 72, acceleration: 74, offsideSkill: 72, legsideSkill: 74, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  wi4: {
    id: "wi4", name: "Evin Lewis", shortName: "E Lewis", role: "batsman",
    batting: { power: 88, temperament: 64, techniqueVsPace: 76, techniqueVsSpin: 70, acceleration: 84, offsideSkill: 72, legsideSkill: 82, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  wi5: {
    id: "wi5", name: "Johnson Charles", shortName: "J Charles", role: "batsman",
    batting: { power: 80, temperament: 64, techniqueVsPace: 72, techniqueVsSpin: 68, acceleration: 78, offsideSkill: 72, legsideSkill: 74, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  wi6: {
    id: "wi6", name: "Andre Russell", shortName: "A Russell", role: "all-rounder",
    batting: { power: 96, temperament: 68, techniqueVsPace: 76, techniqueVsSpin: 70, acceleration: 90, offsideSkill: 74, legsideSkill: 84, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 80, control: 72, variation: 70, deathBowling: 82, lineDiscipline: 68, pressureHandling: 76 },
  },
  wi7: {
    id: "wi7", name: "Shimron Hetmyer", shortName: "S Hetmyer", role: "all-rounder",
    batting: { power: 86, temperament: 68, techniqueVsPace: 74, techniqueVsSpin: 70, acceleration: 84, offsideSkill: 72, legsideSkill: 82, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 12, control: 14, variation: 10, deathBowling: 8, lineDiscipline: 12, pressureHandling: 12 },
  },
  wi8: {
    id: "wi8", name: "Jason Holder", shortName: "J Holder", role: "all-rounder",
    batting: { power: 72, temperament: 74, techniqueVsPace: 68, techniqueVsSpin: 64, acceleration: 68, offsideSkill: 64, legsideSkill: 72, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 74, control: 74, variation: 68, deathBowling: 72, lineDiscipline: 74, pressureHandling: 74 },
  },
  wi9: {
    id: "wi9", name: "Kyle Mayers", shortName: "K Mayers", role: "all-rounder",
    batting: { power: 78, temperament: 68, techniqueVsPace: 72, techniqueVsSpin: 70, acceleration: 74, offsideSkill: 70, legsideSkill: 72, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 68, control: 64, variation: 60, deathBowling: 64, lineDiscipline: 62, pressureHandling: 62 },
  },
  wi10: {
    id: "wi10", name: "Romario Shepherd", shortName: "R Shepherd", role: "all-rounder",
    batting: { power: 76, temperament: 66, techniqueVsPace: 66, techniqueVsSpin: 62, acceleration: 72, offsideSkill: 62, legsideSkill: 72, runningBetweenWickets: 66 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 72, control: 68, variation: 64, deathBowling: 74, lineDiscipline: 66, pressureHandling: 66 },
  },
  wi11: {
    id: "wi11", name: "Alzarri Joseph", shortName: "A Joseph", role: "bowler",
    batting: { power: 44, temperament: 50, techniqueVsPace: 40, techniqueVsSpin: 36, acceleration: 38, offsideSkill: 38, legsideSkill: 42, runningBetweenWickets: 42 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 86, control: 80, variation: 76, deathBowling: 82, lineDiscipline: 80, pressureHandling: 78 },
  },
  wi12: {
    id: "wi12", name: "Akeal Hosein", shortName: "A Hosein", role: "bowler",
    batting: { power: 36, temperament: 50, techniqueVsPace: 32, techniqueVsSpin: 36, acceleration: 30, offsideSkill: 30, legsideSkill: 34, runningBetweenWickets: 40 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 78, control: 78, variation: 76, deathBowling: 68, lineDiscipline: 80, pressureHandling: 74 },
  },
  wi13: {
    id: "wi13", name: "Gudakesh Motie", shortName: "G Motie", role: "bowler",
    batting: { power: 34, temperament: 46, techniqueVsPace: 30, techniqueVsSpin: 34, acceleration: 28, offsideSkill: 28, legsideSkill: 32, runningBetweenWickets: 38 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 76, control: 76, variation: 72, deathBowling: 64, lineDiscipline: 78, pressureHandling: 70 },
  },
  wi14: {
    id: "wi14", name: "Obed McCoy", shortName: "O McCoy", role: "bowler",
    batting: { power: 36, temperament: 44, techniqueVsPace: 32, techniqueVsSpin: 28, acceleration: 30, offsideSkill: 28, legsideSkill: 32, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 74, control: 70, variation: 68, deathBowling: 72, lineDiscipline: 70, pressureHandling: 68 },
  },
  wi15: {
    id: "wi15", name: "Shamar Joseph", shortName: "Sh Joseph", role: "bowler",
    batting: { power: 38, temperament: 46, techniqueVsPace: 34, techniqueVsSpin: 30, acceleration: 32, offsideSkill: 30, legsideSkill: 36, runningBetweenWickets: 38 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 80, control: 72, variation: 68, deathBowling: 72, lineDiscipline: 72, pressureHandling: 72 },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SRI LANKA  (sl1 – sl15)
  // ─────────────────────────────────────────────────────────────────────────
  sl1: {
    id: "sl1", name: "Kusal Mendis", shortName: "K Mendis", role: "wicket-keeper",
    batting: { power: 80, temperament: 72, techniqueVsPace: 78, techniqueVsSpin: 76, acceleration: 78, offsideSkill: 76, legsideSkill: 78, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  sl2: {
    id: "sl2", name: "Kusal Perera", shortName: "Kusal Perera", role: "wicket-keeper",
    batting: { power: 82, temperament: 66, techniqueVsPace: 74, techniqueVsSpin: 70, acceleration: 80, offsideSkill: 74, legsideSkill: 78, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  sl3: {
    id: "sl3", name: "Pathum Nissanka", shortName: "P Nissanka", role: "batsman",
    batting: { power: 72, temperament: 78, techniqueVsPace: 78, techniqueVsSpin: 74, acceleration: 68, offsideSkill: 76, legsideSkill: 70, runningBetweenWickets: 80 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  sl4: {
    id: "sl4", name: "Avishka Fernando", shortName: "A Fernando", role: "batsman",
    batting: { power: 76, temperament: 66, techniqueVsPace: 72, techniqueVsSpin: 70, acceleration: 74, offsideSkill: 72, legsideSkill: 72, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  sl5: {
    id: "sl5", name: "Charith Asalanka", shortName: "C Asalanka", role: "batsman",
    batting: { power: 74, temperament: 74, techniqueVsPace: 72, techniqueVsSpin: 76, acceleration: 72, offsideSkill: 72, legsideSkill: 72, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 10, control: 12, variation: 8, deathBowling: 6, lineDiscipline: 10, pressureHandling: 12 },
  },
  sl6: {
    id: "sl6", name: "Wanindu Hasaranga", shortName: "W Hasaranga", role: "all-rounder",
    batting: { power: 74, temperament: 72, techniqueVsPace: 68, techniqueVsSpin: 76, acceleration: 70, offsideSkill: 68, legsideSkill: 72, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 88, control: 80, variation: 90, deathBowling: 72, lineDiscipline: 82, pressureHandling: 80 },
  },
  sl7: {
    id: "sl7", name: "Dasun Shanaka", shortName: "D Shanaka", role: "all-rounder",
    batting: { power: 78, temperament: 68, techniqueVsPace: 68, techniqueVsSpin: 70, acceleration: 74, offsideSkill: 66, legsideSkill: 74, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 64, control: 62, variation: 58, deathBowling: 66, lineDiscipline: 60, pressureHandling: 62 },
  },
  sl8: {
    id: "sl8", name: "Dhananjaya de Silva", shortName: "D de Silva", role: "all-rounder",
    batting: { power: 68, temperament: 76, techniqueVsPace: 70, techniqueVsSpin: 78, acceleration: 64, offsideSkill: 68, legsideSkill: 68, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 72, control: 74, variation: 70, deathBowling: 60, lineDiscipline: 74, pressureHandling: 70 },
  },
  sl9: {
    id: "sl9", name: "Janith Liyanage", shortName: "J Liyanage", role: "all-rounder",
    batting: { power: 72, temperament: 68, techniqueVsPace: 66, techniqueVsSpin: 68, acceleration: 68, offsideSkill: 64, legsideSkill: 70, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 56, control: 54, variation: 50, deathBowling: 54, lineDiscipline: 52, pressureHandling: 54 },
  },
  sl10: {
    id: "sl10", name: "Bhanuka Rajapaksa", shortName: "B Rajapaksa", role: "all-rounder",
    batting: { power: 80, temperament: 66, techniqueVsPace: 70, techniqueVsSpin: 72, acceleration: 78, offsideSkill: 70, legsideSkill: 76, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 14, control: 16, variation: 12, deathBowling: 10, lineDiscipline: 14, pressureHandling: 14 },
  },
  sl11: {
    id: "sl11", name: "Maheesh Theekshana", shortName: "M Theekshana", role: "bowler",
    batting: { power: 36, temperament: 46, techniqueVsPace: 32, techniqueVsSpin: 36, acceleration: 30, offsideSkill: 30, legsideSkill: 34, runningBetweenWickets: 38 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 86, control: 82, variation: 88, deathBowling: 68, lineDiscipline: 82, pressureHandling: 78 },
  },
  sl12: {
    id: "sl12", name: "Dushmantha Chameera", shortName: "D Chameera", role: "bowler",
    batting: { power: 40, temperament: 48, techniqueVsPace: 36, techniqueVsSpin: 32, acceleration: 34, offsideSkill: 34, legsideSkill: 38, runningBetweenWickets: 38 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 80, control: 76, variation: 70, deathBowling: 76, lineDiscipline: 74, pressureHandling: 72 },
  },
  sl13: {
    id: "sl13", name: "Matheesha Pathirana", shortName: "M Pathirana", role: "bowler",
    batting: { power: 38, temperament: 46, techniqueVsPace: 34, techniqueVsSpin: 30, acceleration: 32, offsideSkill: 32, legsideSkill: 36, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 82, control: 74, variation: 72, deathBowling: 82, lineDiscipline: 72, pressureHandling: 72 },
  },
  sl14: {
    id: "sl14", name: "Nuwan Thushara", shortName: "N Thushara", role: "bowler",
    batting: { power: 36, temperament: 44, techniqueVsPace: 32, techniqueVsSpin: 28, acceleration: 30, offsideSkill: 30, legsideSkill: 34, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 78, control: 72, variation: 68, deathBowling: 74, lineDiscipline: 70, pressureHandling: 68 },
  },
  sl15: {
    id: "sl15", name: "Pramod Madushan", shortName: "P Madushan", role: "bowler",
    batting: { power: 34, temperament: 42, techniqueVsPace: 30, techniqueVsSpin: 26, acceleration: 28, offsideSkill: 28, legsideSkill: 32, runningBetweenWickets: 34 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 76, control: 70, variation: 66, deathBowling: 72, lineDiscipline: 68, pressureHandling: 66 },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INDIA extended squad  (t16 – t30)  — Test & format-depth players
  // ─────────────────────────────────────────────────────────────────────────
  t16: {
    id: "t16", name: "Rohit Sharma", shortName: "R Sharma", role: "batsman",
    batting: { power: 88, temperament: 82, techniqueVsPace: 88, techniqueVsSpin: 82, acceleration: 84, offsideSkill: 86, legsideSkill: 84, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 18, control: 20, variation: 14, deathBowling: 12, lineDiscipline: 16, pressureHandling: 18 },
  },
  t17: {
    id: "t17", name: "Virat Kohli", shortName: "V Kohli", role: "batsman",
    batting: { power: 80, temperament: 94, techniqueVsPace: 94, techniqueVsSpin: 90, acceleration: 74, offsideSkill: 92, legsideSkill: 82, runningBetweenWickets: 88 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  t18: {
    id: "t18", name: "Shubman Gill", shortName: "S Gill", role: "batsman",
    batting: { power: 78, temperament: 80, techniqueVsPace: 84, techniqueVsSpin: 78, acceleration: 76, offsideSkill: 82, legsideSkill: 76, runningBetweenWickets: 80 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 10, control: 12, variation: 8, deathBowling: 6, lineDiscipline: 10, pressureHandling: 12 },
  },
  t19: {
    id: "t19", name: "KL Rahul", shortName: "KL Rahul", role: "wicket-keeper",
    batting: { power: 76, temperament: 78, techniqueVsPace: 82, techniqueVsSpin: 78, acceleration: 76, offsideSkill: 80, legsideSkill: 74, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  t20: {
    id: "t20", name: "Yashasvi Jaiswal", shortName: "Y Jaiswal", role: "batsman",
    batting: { power: 84, temperament: 78, techniqueVsPace: 82, techniqueVsSpin: 82, acceleration: 86, offsideSkill: 78, legsideSkill: 84, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  t21: {
    id: "t21", name: "Rishabh Pant", shortName: "R Pant", role: "wicket-keeper",
    batting: { power: 88, temperament: 68, techniqueVsPace: 80, techniqueVsSpin: 78, acceleration: 86, offsideSkill: 78, legsideSkill: 84, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  t22: {
    id: "t22", name: "Ravindra Jadeja", shortName: "R Jadeja", role: "all-rounder",
    batting: { power: 68, temperament: 78, techniqueVsPace: 66, techniqueVsSpin: 72, acceleration: 66, offsideSkill: 64, legsideSkill: 70, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 84, control: 84, variation: 74, deathBowling: 68, lineDiscipline: 88, pressureHandling: 82 },
  },
  t23: {
    id: "t23", name: "Ravichandran Ashwin", shortName: "R Ashwin", role: "all-rounder",
    batting: { power: 62, temperament: 74, techniqueVsPace: 62, techniqueVsSpin: 70, acceleration: 58, offsideSkill: 60, legsideSkill: 64, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 90, control: 86, variation: 88, deathBowling: 70, lineDiscipline: 88, pressureHandling: 86 },
  },
  t24: {
    id: "t24", name: "Cheteshwar Pujara", shortName: "C Pujara", role: "batsman",
    batting: { power: 62, temperament: 94, techniqueVsPace: 90, techniqueVsSpin: 88, acceleration: 52, offsideSkill: 84, legsideSkill: 72, runningBetweenWickets: 80 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  t25: {
    id: "t25", name: "Ajinkya Rahane", shortName: "A Rahane", role: "batsman",
    batting: { power: 66, temperament: 88, techniqueVsPace: 86, techniqueVsSpin: 84, acceleration: 60, offsideSkill: 82, legsideSkill: 74, runningBetweenWickets: 82 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 10, control: 12, variation: 8, deathBowling: 5, lineDiscipline: 10, pressureHandling: 12 },
  },
  t26: {
    id: "t26", name: "Mohammed Shami", shortName: "M Shami", role: "bowler",
    batting: { power: 44, temperament: 50, techniqueVsPace: 40, techniqueVsSpin: 36, acceleration: 38, offsideSkill: 38, legsideSkill: 42, runningBetweenWickets: 42 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 88, control: 82, variation: 78, deathBowling: 76, lineDiscipline: 84, pressureHandling: 80 },
  },
  t27: {
    id: "t27", name: "Prasidh Krishna", shortName: "P Krishna", role: "bowler",
    batting: { power: 40, temperament: 46, techniqueVsPace: 36, techniqueVsSpin: 32, acceleration: 34, offsideSkill: 34, legsideSkill: 38, runningBetweenWickets: 38 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 78, control: 76, variation: 70, deathBowling: 72, lineDiscipline: 76, pressureHandling: 72 },
  },
  t28: {
    id: "t28", name: "Akash Deep", shortName: "Akash Deep", role: "bowler",
    batting: { power: 38, temperament: 44, techniqueVsPace: 34, techniqueVsSpin: 30, acceleration: 32, offsideSkill: 32, legsideSkill: 36, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 76, control: 74, variation: 68, deathBowling: 70, lineDiscipline: 74, pressureHandling: 70 },
  },
  t29: {
    id: "t29", name: "Nitish Kumar Reddy", shortName: "NK Reddy", role: "all-rounder",
    batting: { power: 78, temperament: 68, techniqueVsPace: 70, techniqueVsSpin: 66, acceleration: 74, offsideSkill: 68, legsideSkill: 74, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 62, control: 60, variation: 54, deathBowling: 60, lineDiscipline: 58, pressureHandling: 58 },
  },
  t30: {
    id: "t30", name: "Dhruv Jurel", shortName: "D Jurel", role: "wicket-keeper",
    batting: { power: 66, temperament: 76, techniqueVsPace: 72, techniqueVsSpin: 70, acceleration: 64, offsideSkill: 68, legsideSkill: 66, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PAKISTAN extended squad  (s16 – s30)
  // ─────────────────────────────────────────────────────────────────────────
  s16: {
    id: "s16", name: "Mohammad Rizwan", shortName: "M Rizwan", role: "wicket-keeper",
    batting: { power: 78, temperament: 82, techniqueVsPace: 82, techniqueVsSpin: 78, acceleration: 74, offsideSkill: 78, legsideSkill: 76, runningBetweenWickets: 80 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  s17: {
    id: "s17", name: "Shan Masood", shortName: "S Masood", role: "batsman",
    batting: { power: 66, temperament: 82, techniqueVsPace: 82, techniqueVsSpin: 78, acceleration: 60, offsideSkill: 76, legsideSkill: 74, runningBetweenWickets: 80 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  s18: {
    id: "s18", name: "Abdullah Shafique", shortName: "A Shafique", role: "batsman",
    batting: { power: 64, temperament: 82, techniqueVsPace: 82, techniqueVsSpin: 78, acceleration: 58, offsideSkill: 78, legsideSkill: 72, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  s19: {
    id: "s19", name: "Saud Shakeel", shortName: "Saud Shakeel", role: "batsman",
    batting: { power: 62, temperament: 84, techniqueVsPace: 82, techniqueVsSpin: 84, acceleration: 58, offsideSkill: 76, legsideSkill: 78, runningBetweenWickets: 80 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  s20: {
    id: "s20", name: "Imam-ul-Haq", shortName: "Imam-ul-Haq", role: "batsman",
    batting: { power: 60, temperament: 82, techniqueVsPace: 80, techniqueVsSpin: 78, acceleration: 56, offsideSkill: 76, legsideSkill: 70, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  s21: {
    id: "s21", name: "Agha Salman", shortName: "Agha Salman", role: "all-rounder",
    batting: { power: 66, temperament: 70, techniqueVsPace: 66, techniqueVsSpin: 68, acceleration: 62, offsideSkill: 64, legsideSkill: 66, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 68, control: 66, variation: 60, deathBowling: 64, lineDiscipline: 64, pressureHandling: 62 },
  },
  s22: {
    id: "s22", name: "Haris Rauf", shortName: "H Rauf", role: "bowler",
    batting: { power: 38, temperament: 44, techniqueVsPace: 34, techniqueVsSpin: 30, acceleration: 32, offsideSkill: 30, legsideSkill: 34, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 82, control: 72, variation: 72, deathBowling: 80, lineDiscipline: 72, pressureHandling: 70 },
  },
  s23: {
    id: "s23", name: "Mohammad Abbas", shortName: "M Abbas", role: "bowler",
    batting: { power: 36, temperament: 42, techniqueVsPace: 34, techniqueVsSpin: 30, acceleration: 30, offsideSkill: 30, legsideSkill: 34, runningBetweenWickets: 34 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 78, control: 84, variation: 70, deathBowling: 60, lineDiscipline: 90, pressureHandling: 76 },
  },
  s24: {
    id: "s24", name: "Zaman Khan", shortName: "Zaman Khan", role: "bowler",
    batting: { power: 36, temperament: 42, techniqueVsPace: 32, techniqueVsSpin: 28, acceleration: 30, offsideSkill: 28, legsideSkill: 32, runningBetweenWickets: 34 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 76, control: 72, variation: 68, deathBowling: 72, lineDiscipline: 70, pressureHandling: 66 },
  },
  s25: {
    id: "s25", name: "Mohammad Wasim Jr", shortName: "MW Junior", role: "bowler",
    batting: { power: 40, temperament: 46, techniqueVsPace: 36, techniqueVsSpin: 32, acceleration: 34, offsideSkill: 32, legsideSkill: 36, runningBetweenWickets: 38 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 74, control: 70, variation: 66, deathBowling: 70, lineDiscipline: 68, pressureHandling: 64 },
  },
  s26: {
    id: "s26", name: "Iftikhar Ahmed", shortName: "Iftikhar", role: "all-rounder",
    batting: { power: 82, temperament: 66, techniqueVsPace: 70, techniqueVsSpin: 72, acceleration: 78, offsideSkill: 68, legsideSkill: 76, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 54, control: 52, variation: 48, deathBowling: 52, lineDiscipline: 50, pressureHandling: 50 },
  },
  s27: {
    id: "s27", name: "Azam Khan", shortName: "Azam Khan", role: "wicket-keeper",
    batting: { power: 90, temperament: 60, techniqueVsPace: 68, techniqueVsSpin: 64, acceleration: 86, offsideSkill: 66, legsideSkill: 80, runningBetweenWickets: 58 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  s28: {
    id: "s28", name: "Kamran Ghulam", shortName: "K Ghulam", role: "batsman",
    batting: { power: 68, temperament: 76, techniqueVsPace: 74, techniqueVsSpin: 70, acceleration: 64, offsideSkill: 72, legsideSkill: 68, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  s29: {
    id: "s29", name: "Aamer Jamal", shortName: "A Jamal", role: "all-rounder",
    batting: { power: 62, temperament: 62, techniqueVsPace: 58, techniqueVsSpin: 54, acceleration: 60, offsideSkill: 56, legsideSkill: 60, runningBetweenWickets: 60 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 72, control: 68, variation: 64, deathBowling: 70, lineDiscipline: 66, pressureHandling: 62 },
  },
  s30: {
    id: "s30", name: "Tayyab Tahir", shortName: "T Tahir", role: "batsman",
    batting: { power: 72, temperament: 72, techniqueVsPace: 68, techniqueVsSpin: 70, acceleration: 68, offsideSkill: 68, legsideSkill: 70, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 10, control: 12, variation: 8, deathBowling: 6, lineDiscipline: 10, pressureHandling: 12 },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ENGLAND extended squad  (e16 – e30)
  // ─────────────────────────────────────────────────────────────────────────
  e16: {
    id: "e16", name: "Zak Crawley", shortName: "Z Crawley", role: "batsman",
    batting: { power: 74, temperament: 76, techniqueVsPace: 82, techniqueVsSpin: 74, acceleration: 72, offsideSkill: 80, legsideSkill: 70, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  e17: {
    id: "e17", name: "Ollie Pope", shortName: "O Pope", role: "batsman",
    batting: { power: 72, temperament: 80, techniqueVsPace: 84, techniqueVsSpin: 78, acceleration: 68, offsideSkill: 82, legsideSkill: 72, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 10, control: 12, variation: 8, deathBowling: 5, lineDiscipline: 10, pressureHandling: 12 },
  },
  e18: {
    id: "e18", name: "Joe Root", shortName: "J Root", role: "batsman",
    batting: { power: 74, temperament: 92, techniqueVsPace: 92, techniqueVsSpin: 92, acceleration: 68, offsideSkill: 90, legsideSkill: 76, runningBetweenWickets: 86 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 60, control: 62, variation: 68, deathBowling: 48, lineDiscipline: 60, pressureHandling: 62 },
  },
  e19: {
    id: "e19", name: "Ben Stokes", shortName: "B Stokes", role: "all-rounder",
    batting: { power: 86, temperament: 88, techniqueVsPace: 86, techniqueVsSpin: 80, acceleration: 82, offsideSkill: 80, legsideSkill: 82, runningBetweenWickets: 80 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 82, control: 76, variation: 70, deathBowling: 80, lineDiscipline: 72, pressureHandling: 84 },
  },
  e20: {
    id: "e20", name: "Jonny Bairstow", shortName: "J Bairstow", role: "wicket-keeper",
    batting: { power: 84, temperament: 70, techniqueVsPace: 80, techniqueVsSpin: 72, acceleration: 82, offsideSkill: 76, legsideSkill: 78, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  e21: {
    id: "e21", name: "Ben Foakes", shortName: "B Foakes", role: "wicket-keeper",
    batting: { power: 64, temperament: 78, techniqueVsPace: 76, techniqueVsSpin: 74, acceleration: 60, offsideSkill: 74, legsideSkill: 68, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  e22: {
    id: "e22", name: "Ollie Robinson", shortName: "O Robinson", role: "bowler",
    batting: { power: 44, temperament: 52, techniqueVsPace: 42, techniqueVsSpin: 38, acceleration: 40, offsideSkill: 40, legsideSkill: 42, runningBetweenWickets: 44 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 82, control: 80, variation: 72, deathBowling: 70, lineDiscipline: 82, pressureHandling: 76 },
  },
  e23: {
    id: "e23", name: "Brydon Carse", shortName: "B Carse", role: "bowler",
    batting: { power: 48, temperament: 52, techniqueVsPace: 44, techniqueVsSpin: 40, acceleration: 42, offsideSkill: 42, legsideSkill: 46, runningBetweenWickets: 44 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 80, control: 76, variation: 72, deathBowling: 76, lineDiscipline: 74, pressureHandling: 72 },
  },
  e24: {
    id: "e24", name: "Shoaib Bashir", shortName: "S Bashir", role: "bowler",
    batting: { power: 36, temperament: 44, techniqueVsPace: 30, techniqueVsSpin: 34, acceleration: 30, offsideSkill: 30, legsideSkill: 32, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 78, control: 74, variation: 80, deathBowling: 64, lineDiscipline: 74, pressureHandling: 70 },
  },
  e25: {
    id: "e25", name: "Tom Hartley", shortName: "T Hartley", role: "bowler",
    batting: { power: 38, temperament: 46, techniqueVsPace: 32, techniqueVsSpin: 36, acceleration: 32, offsideSkill: 32, legsideSkill: 34, runningBetweenWickets: 38 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 76, control: 74, variation: 78, deathBowling: 62, lineDiscipline: 76, pressureHandling: 68 },
  },
  e26: {
    id: "e26", name: "Jamie Smith", shortName: "J Smith", role: "wicket-keeper",
    batting: { power: 76, temperament: 72, techniqueVsPace: 76, techniqueVsSpin: 70, acceleration: 74, offsideSkill: 74, legsideSkill: 72, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  e27: {
    id: "e27", name: "Jacob Bethell", shortName: "J Bethell", role: "all-rounder",
    batting: { power: 74, temperament: 70, techniqueVsPace: 72, techniqueVsSpin: 74, acceleration: 72, offsideSkill: 70, legsideSkill: 72, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 62, control: 60, variation: 64, deathBowling: 54, lineDiscipline: 62, pressureHandling: 60 },
  },
  e28: {
    id: "e28", name: "Will Jacks", shortName: "W Jacks", role: "all-rounder",
    batting: { power: 76, temperament: 68, techniqueVsPace: 72, techniqueVsSpin: 70, acceleration: 74, offsideSkill: 70, legsideSkill: 72, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 66, control: 62, variation: 68, deathBowling: 56, lineDiscipline: 62, pressureHandling: 62 },
  },
  e29: {
    id: "e29", name: "Matt Potts", shortName: "M Potts", role: "bowler",
    batting: { power: 42, temperament: 50, techniqueVsPace: 40, techniqueVsSpin: 36, acceleration: 38, offsideSkill: 38, legsideSkill: 40, runningBetweenWickets: 42 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 78, control: 76, variation: 68, deathBowling: 72, lineDiscipline: 76, pressureHandling: 72 },
  },
  e30: {
    id: "e30", name: "Dan Lawrence", shortName: "D Lawrence", role: "batsman",
    batting: { power: 70, temperament: 72, techniqueVsPace: 74, techniqueVsSpin: 72, acceleration: 66, offsideSkill: 72, legsideSkill: 68, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 40, control: 42, variation: 36, deathBowling: 32, lineDiscipline: 40, pressureHandling: 42 },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AUSTRALIA extended squad  (a16 – a30)
  // ─────────────────────────────────────────────────────────────────────────
  a16: {
    id: "a16", name: "Steven Smith", shortName: "S Smith", role: "batsman",
    batting: { power: 72, temperament: 92, techniqueVsPace: 90, techniqueVsSpin: 88, acceleration: 68, offsideSkill: 82, legsideSkill: 80, runningBetweenWickets: 82 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 54, control: 52, variation: 50, deathBowling: 42, lineDiscipline: 50, pressureHandling: 52 },
  },
  a17: {
    id: "a17", name: "Marnus Labuschagne", shortName: "M Labuschagne", role: "batsman",
    batting: { power: 72, temperament: 88, techniqueVsPace: 88, techniqueVsSpin: 84, acceleration: 66, offsideSkill: 82, legsideSkill: 76, runningBetweenWickets: 82 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 50, control: 52, variation: 48, deathBowling: 40, lineDiscipline: 50, pressureHandling: 50 },
  },
  a18: {
    id: "a18", name: "Usman Khawaja", shortName: "U Khawaja", role: "batsman",
    batting: { power: 68, temperament: 86, techniqueVsPace: 86, techniqueVsSpin: 82, acceleration: 62, offsideSkill: 82, legsideSkill: 72, runningBetweenWickets: 80 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  a19: {
    id: "a19", name: "Alex Carey", shortName: "A Carey", role: "wicket-keeper",
    batting: { power: 68, temperament: 72, techniqueVsPace: 72, techniqueVsSpin: 68, acceleration: 64, offsideSkill: 70, legsideSkill: 68, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  a20: {
    id: "a20", name: "Nathan Lyon", shortName: "N Lyon", role: "bowler",
    batting: { power: 42, temperament: 52, techniqueVsPace: 40, techniqueVsSpin: 44, acceleration: 36, offsideSkill: 38, legsideSkill: 40, runningBetweenWickets: 44 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 88, control: 84, variation: 82, deathBowling: 66, lineDiscipline: 86, pressureHandling: 82 },
  },
  a21: {
    id: "a21", name: "Scott Boland", shortName: "S Boland", role: "bowler",
    batting: { power: 38, temperament: 48, techniqueVsPace: 36, techniqueVsSpin: 32, acceleration: 32, offsideSkill: 32, legsideSkill: 36, runningBetweenWickets: 38 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 86, control: 84, variation: 72, deathBowling: 72, lineDiscipline: 86, pressureHandling: 78 },
  },
  a22: {
    id: "a22", name: "Matthew Renshaw", shortName: "M Renshaw", role: "batsman",
    batting: { power: 62, temperament: 80, techniqueVsPace: 80, techniqueVsSpin: 74, acceleration: 58, offsideSkill: 76, legsideSkill: 68, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  a23: {
    id: "a23", name: "Michael Neser", shortName: "M Neser", role: "all-rounder",
    batting: { power: 64, temperament: 68, techniqueVsPace: 64, techniqueVsSpin: 60, acceleration: 60, offsideSkill: 62, legsideSkill: 62, runningBetweenWickets: 66 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 74, control: 72, variation: 66, deathBowling: 68, lineDiscipline: 70, pressureHandling: 68 },
  },
  a24: {
    id: "a24", name: "Aaron Hardie", shortName: "A Hardie", role: "all-rounder",
    batting: { power: 70, temperament: 68, techniqueVsPace: 68, techniqueVsSpin: 64, acceleration: 66, offsideSkill: 66, legsideSkill: 66, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 68, control: 66, variation: 60, deathBowling: 66, lineDiscipline: 64, pressureHandling: 62 },
  },
  a25: {
    id: "a25", name: "Ben McDermott", shortName: "B McDermott", role: "batsman",
    batting: { power: 80, temperament: 64, techniqueVsPace: 72, techniqueVsSpin: 68, acceleration: 76, offsideSkill: 72, legsideSkill: 72, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  a26: {
    id: "a26", name: "Todd Murphy", shortName: "T Murphy", role: "bowler",
    batting: { power: 36, temperament: 46, techniqueVsPace: 32, techniqueVsSpin: 36, acceleration: 30, offsideSkill: 30, legsideSkill: 32, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 76, control: 74, variation: 76, deathBowling: 60, lineDiscipline: 74, pressureHandling: 70 },
  },
  a27: {
    id: "a27", name: "Sean Abbott", shortName: "S Abbott", role: "bowler",
    batting: { power: 42, temperament: 50, techniqueVsPace: 38, techniqueVsSpin: 34, acceleration: 36, offsideSkill: 36, legsideSkill: 40, runningBetweenWickets: 40 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 76, control: 72, variation: 66, deathBowling: 74, lineDiscipline: 70, pressureHandling: 68 },
  },
  a28: {
    id: "a28", name: "Cooper Connolly", shortName: "C Connolly", role: "all-rounder",
    batting: { power: 68, temperament: 68, techniqueVsPace: 68, techniqueVsSpin: 64, acceleration: 64, offsideSkill: 66, legsideSkill: 66, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 60, control: 58, variation: 62, deathBowling: 52, lineDiscipline: 58, pressureHandling: 58 },
  },
  a29: {
    id: "a29", name: "Xavier Bartlett", shortName: "X Bartlett", role: "bowler",
    batting: { power: 40, temperament: 46, techniqueVsPace: 36, techniqueVsSpin: 32, acceleration: 34, offsideSkill: 32, legsideSkill: 36, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 74, control: 70, variation: 66, deathBowling: 72, lineDiscipline: 68, pressureHandling: 66 },
  },
  a30: {
    id: "a30", name: "Beau Webster", shortName: "B Webster", role: "all-rounder",
    batting: { power: 72, temperament: 70, techniqueVsPace: 70, techniqueVsSpin: 68, acceleration: 68, offsideSkill: 68, legsideSkill: 68, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 64, control: 62, variation: 56, deathBowling: 62, lineDiscipline: 60, pressureHandling: 60 },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SOUTH AFRICA extended squad  (sa16 – sa30)
  // ─────────────────────────────────────────────────────────────────────────
  sa16: {
    id: "sa16", name: "Tony de Zorzi", shortName: "T de Zorzi", role: "batsman",
    batting: { power: 68, temperament: 78, techniqueVsPace: 78, techniqueVsSpin: 72, acceleration: 64, offsideSkill: 76, legsideSkill: 70, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  sa17: {
    id: "sa17", name: "Rassie van der Dussen", shortName: "R van der Dussen", role: "batsman",
    batting: { power: 68, temperament: 80, techniqueVsPace: 80, techniqueVsSpin: 76, acceleration: 64, offsideSkill: 76, legsideSkill: 70, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  sa18: {
    id: "sa18", name: "Sarel Erwee", shortName: "S Erwee", role: "batsman",
    batting: { power: 64, temperament: 80, techniqueVsPace: 78, techniqueVsSpin: 74, acceleration: 58, offsideSkill: 74, legsideSkill: 68, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  sa19: {
    id: "sa19", name: "Kyle Verreynne", shortName: "K Verreynne", role: "wicket-keeper",
    batting: { power: 70, temperament: 74, techniqueVsPace: 74, techniqueVsSpin: 70, acceleration: 66, offsideSkill: 70, legsideSkill: 68, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  sa20: {
    id: "sa20", name: "Dewald Brevis", shortName: "D Brevis", role: "batsman",
    batting: { power: 88, temperament: 66, techniqueVsPace: 74, techniqueVsSpin: 72, acceleration: 86, offsideSkill: 76, legsideSkill: 80, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 10, control: 12, variation: 8, deathBowling: 6, lineDiscipline: 10, pressureHandling: 12 },
  },
  sa21: {
    id: "sa21", name: "Dane Paterson", shortName: "D Paterson", role: "bowler",
    batting: { power: 38, temperament: 46, techniqueVsPace: 36, techniqueVsSpin: 32, acceleration: 32, offsideSkill: 32, legsideSkill: 36, runningBetweenWickets: 38 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 78, control: 76, variation: 68, deathBowling: 68, lineDiscipline: 78, pressureHandling: 72 },
  },
  sa22: {
    id: "sa22", name: "Lutho Sipamla", shortName: "L Sipamla", role: "bowler",
    batting: { power: 40, temperament: 46, techniqueVsPace: 36, techniqueVsSpin: 32, acceleration: 34, offsideSkill: 32, legsideSkill: 36, runningBetweenWickets: 38 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 76, control: 72, variation: 68, deathBowling: 72, lineDiscipline: 70, pressureHandling: 68 },
  },
  sa23: {
    id: "sa23", name: "Simon Harmer", shortName: "S Harmer", role: "bowler",
    batting: { power: 46, temperament: 54, techniqueVsPace: 44, techniqueVsSpin: 48, acceleration: 42, offsideSkill: 42, legsideSkill: 44, runningBetweenWickets: 46 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 80, control: 78, variation: 78, deathBowling: 66, lineDiscipline: 80, pressureHandling: 74 },
  },
  sa24: {
    id: "sa24", name: "George Linde", shortName: "G Linde", role: "all-rounder",
    batting: { power: 62, temperament: 68, techniqueVsPace: 62, techniqueVsSpin: 68, acceleration: 58, offsideSkill: 60, legsideSkill: 62, runningBetweenWickets: 66 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 70, control: 72, variation: 68, deathBowling: 58, lineDiscipline: 74, pressureHandling: 66 },
  },
  sa25: {
    id: "sa25", name: "Neil Brand", shortName: "N Brand", role: "batsman",
    batting: { power: 62, temperament: 80, techniqueVsPace: 78, techniqueVsSpin: 76, acceleration: 56, offsideSkill: 72, legsideSkill: 72, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 10, control: 12, variation: 8, deathBowling: 6, lineDiscipline: 10, pressureHandling: 12 },
  },
  sa26: {
    id: "sa26", name: "Matthew Breetzke", shortName: "M Breetzke", role: "batsman",
    batting: { power: 66, temperament: 72, techniqueVsPace: 72, techniqueVsSpin: 68, acceleration: 60, offsideSkill: 70, legsideSkill: 66, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  sa27: {
    id: "sa27", name: "Mpho Sekhukhune", shortName: "M Sekhukhune", role: "bowler",
    batting: { power: 36, temperament: 44, techniqueVsPace: 32, techniqueVsSpin: 28, acceleration: 30, offsideSkill: 28, legsideSkill: 32, runningBetweenWickets: 34 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 74, control: 70, variation: 68, deathBowling: 68, lineDiscipline: 70, pressureHandling: 66 },
  },
  sa28: {
    id: "sa28", name: "Nandre Burger", shortName: "N Burger", role: "bowler",
    batting: { power: 36, temperament: 44, techniqueVsPace: 32, techniqueVsSpin: 28, acceleration: 30, offsideSkill: 28, legsideSkill: 32, runningBetweenWickets: 34 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 76, control: 72, variation: 68, deathBowling: 70, lineDiscipline: 72, pressureHandling: 68 },
  },
  sa29: {
    id: "sa29", name: "Corbin Bosch", shortName: "C Bosch", role: "all-rounder",
    batting: { power: 68, temperament: 68, techniqueVsPace: 66, techniqueVsSpin: 62, acceleration: 64, offsideSkill: 62, legsideSkill: 64, runningBetweenWickets: 66 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 66, control: 64, variation: 58, deathBowling: 64, lineDiscipline: 62, pressureHandling: 60 },
  },
  sa30: {
    id: "sa30", name: "Patrick Kruger", shortName: "P Kruger", role: "bowler",
    batting: { power: 34, temperament: 44, techniqueVsPace: 30, techniqueVsSpin: 34, acceleration: 28, offsideSkill: 28, legsideSkill: 30, runningBetweenWickets: 34 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 72, control: 70, variation: 74, deathBowling: 58, lineDiscipline: 70, pressureHandling: 64 },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NEW ZEALAND extended squad  (nz16 – nz30)
  // ─────────────────────────────────────────────────────────────────────────
  nz16: {
    id: "nz16", name: "Henry Nicholls", shortName: "H Nicholls", role: "batsman",
    batting: { power: 64, temperament: 82, techniqueVsPace: 80, techniqueVsSpin: 78, acceleration: 58, offsideSkill: 78, legsideSkill: 70, runningBetweenWickets: 80 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  nz17: {
    id: "nz17", name: "Tom Blundell", shortName: "T Blundell", role: "wicket-keeper",
    batting: { power: 64, temperament: 76, techniqueVsPace: 76, techniqueVsSpin: 72, acceleration: 60, offsideSkill: 72, legsideSkill: 66, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  nz18: {
    id: "nz18", name: "Mark Chapman", shortName: "M Chapman", role: "batsman",
    batting: { power: 68, temperament: 72, techniqueVsPace: 72, techniqueVsSpin: 74, acceleration: 64, offsideSkill: 70, legsideSkill: 72, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 12, control: 14, variation: 10, deathBowling: 8, lineDiscipline: 12, pressureHandling: 14 },
  },
  nz19: {
    id: "nz19", name: "Will Young", shortName: "W Young", role: "batsman",
    batting: { power: 62, temperament: 80, techniqueVsPace: 78, techniqueVsSpin: 74, acceleration: 56, offsideSkill: 74, legsideSkill: 66, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  nz20: {
    id: "nz20", name: "Neil Wagner", shortName: "N Wagner", role: "bowler",
    batting: { power: 40, temperament: 50, techniqueVsPace: 38, techniqueVsSpin: 34, acceleration: 34, offsideSkill: 34, legsideSkill: 38, runningBetweenWickets: 40 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 80, control: 74, variation: 70, deathBowling: 72, lineDiscipline: 74, pressureHandling: 72 },
  },
  nz21: {
    id: "nz21", name: "Kyle Jamieson", shortName: "K Jamieson", role: "bowler",
    batting: { power: 48, temperament: 54, techniqueVsPace: 46, techniqueVsSpin: 42, acceleration: 42, offsideSkill: 44, legsideSkill: 46, runningBetweenWickets: 46 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 82, control: 78, variation: 72, deathBowling: 72, lineDiscipline: 78, pressureHandling: 74 },
  },
  nz22: {
    id: "nz22", name: "Ben Sears", shortName: "B Sears", role: "bowler",
    batting: { power: 36, temperament: 44, techniqueVsPace: 32, techniqueVsSpin: 28, acceleration: 30, offsideSkill: 30, legsideSkill: 34, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 78, control: 74, variation: 70, deathBowling: 74, lineDiscipline: 72, pressureHandling: 68 },
  },
  nz23: {
    id: "nz23", name: "Blair Tickner", shortName: "B Tickner", role: "bowler",
    batting: { power: 34, temperament: 42, techniqueVsPace: 30, techniqueVsSpin: 26, acceleration: 28, offsideSkill: 28, legsideSkill: 32, runningBetweenWickets: 34 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 76, control: 72, variation: 66, deathBowling: 70, lineDiscipline: 70, pressureHandling: 66 },
  },
  nz24: {
    id: "nz24", name: "Jacob Duffy", shortName: "J Duffy", role: "bowler",
    batting: { power: 36, temperament: 44, techniqueVsPace: 32, techniqueVsSpin: 28, acceleration: 30, offsideSkill: 28, legsideSkill: 30, runningBetweenWickets: 34 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 74, control: 72, variation: 66, deathBowling: 68, lineDiscipline: 72, pressureHandling: 66 },
  },
  nz25: {
    id: "nz25", name: "Dane Cleaver", shortName: "D Cleaver", role: "wicket-keeper",
    batting: { power: 72, temperament: 68, techniqueVsPace: 70, techniqueVsSpin: 66, acceleration: 68, offsideSkill: 68, legsideSkill: 68, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  nz26: {
    id: "nz26", name: "Cole McConchie", shortName: "C McConchie", role: "all-rounder",
    batting: { power: 64, temperament: 70, techniqueVsPace: 66, techniqueVsSpin: 68, acceleration: 60, offsideSkill: 64, legsideSkill: 62, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 62, control: 60, variation: 62, deathBowling: 52, lineDiscipline: 62, pressureHandling: 58 },
  },
  nz27: {
    id: "nz27", name: "Tom Bruce", shortName: "T Bruce", role: "batsman",
    batting: { power: 70, temperament: 70, techniqueVsPace: 68, techniqueVsSpin: 70, acceleration: 66, offsideSkill: 66, legsideSkill: 68, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  nz28: {
    id: "nz28", name: "Doug Bracewell", shortName: "D Bracewell", role: "all-rounder",
    batting: { power: 52, temperament: 56, techniqueVsPace: 50, techniqueVsSpin: 46, acceleration: 48, offsideSkill: 48, legsideSkill: 50, runningBetweenWickets: 52 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 72, control: 68, variation: 62, deathBowling: 66, lineDiscipline: 66, pressureHandling: 64 },
  },
  nz29: {
    id: "nz29", name: "Cam Fletcher", shortName: "C Fletcher", role: "wicket-keeper",
    batting: { power: 66, temperament: 68, techniqueVsPace: 68, techniqueVsSpin: 64, acceleration: 62, offsideSkill: 64, legsideSkill: 64, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  nz30: {
    id: "nz30", name: "Michael Rippon", shortName: "M Rippon", role: "all-rounder",
    batting: { power: 58, temperament: 64, techniqueVsPace: 56, techniqueVsSpin: 60, acceleration: 54, offsideSkill: 56, legsideSkill: 56, runningBetweenWickets: 62 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 68, control: 68, variation: 70, deathBowling: 58, lineDiscipline: 68, pressureHandling: 62 },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // WEST INDIES extended squad  (wi16 – wi30)
  // ─────────────────────────────────────────────────────────────────────────
  wi16: {
    id: "wi16", name: "Kraigg Brathwaite", shortName: "K Brathwaite", role: "batsman",
    batting: { power: 58, temperament: 86, techniqueVsPace: 82, techniqueVsSpin: 80, acceleration: 52, offsideSkill: 78, legsideSkill: 68, runningBetweenWickets: 80 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 40, control: 42, variation: 38, deathBowling: 32, lineDiscipline: 42, pressureHandling: 44 },
  },
  wi17: {
    id: "wi17", name: "Tagenarine Chanderpaul", shortName: "T Chanderpaul", role: "batsman",
    batting: { power: 60, temperament: 82, techniqueVsPace: 80, techniqueVsSpin: 78, acceleration: 56, offsideSkill: 74, legsideSkill: 68, runningBetweenWickets: 80 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  wi18: {
    id: "wi18", name: "Mikyle Louis", shortName: "M Louis", role: "batsman",
    batting: { power: 64, temperament: 72, techniqueVsPace: 72, techniqueVsSpin: 68, acceleration: 60, offsideSkill: 70, legsideSkill: 66, runningBetweenWickets: 72 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  wi19: {
    id: "wi19", name: "Roston Chase", shortName: "R Chase", role: "all-rounder",
    batting: { power: 60, temperament: 74, techniqueVsPace: 68, techniqueVsSpin: 72, acceleration: 56, offsideSkill: 64, legsideSkill: 62, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 72, control: 72, variation: 70, deathBowling: 56, lineDiscipline: 74, pressureHandling: 68 },
  },
  wi20: {
    id: "wi20", name: "Alick Athanaze", shortName: "A Athanaze", role: "batsman",
    batting: { power: 70, temperament: 70, techniqueVsPace: 70, techniqueVsSpin: 68, acceleration: 68, offsideSkill: 68, legsideSkill: 68, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  wi21: {
    id: "wi21", name: "Kemar Roach", shortName: "K Roach", role: "bowler",
    batting: { power: 40, temperament: 46, techniqueVsPace: 36, techniqueVsSpin: 32, acceleration: 34, offsideSkill: 32, legsideSkill: 36, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 80, control: 78, variation: 70, deathBowling: 70, lineDiscipline: 80, pressureHandling: 76 },
  },
  wi22: {
    id: "wi22", name: "Jayden Seales", shortName: "J Seales", role: "bowler",
    batting: { power: 38, temperament: 44, techniqueVsPace: 34, techniqueVsSpin: 30, acceleration: 32, offsideSkill: 30, legsideSkill: 34, runningBetweenWickets: 34 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 78, control: 74, variation: 70, deathBowling: 70, lineDiscipline: 74, pressureHandling: 70 },
  },
  wi23: {
    id: "wi23", name: "Anderson Phillip", shortName: "A Phillip", role: "bowler",
    batting: { power: 40, temperament: 46, techniqueVsPace: 36, techniqueVsSpin: 32, acceleration: 34, offsideSkill: 32, legsideSkill: 36, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 76, control: 72, variation: 68, deathBowling: 70, lineDiscipline: 70, pressureHandling: 66 },
  },
  wi24: {
    id: "wi24", name: "Jomel Warrican", shortName: "J Warrican", role: "bowler",
    batting: { power: 36, temperament: 46, techniqueVsPace: 32, techniqueVsSpin: 36, acceleration: 30, offsideSkill: 30, legsideSkill: 32, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 76, control: 74, variation: 72, deathBowling: 60, lineDiscipline: 76, pressureHandling: 68 },
  },
  wi25: {
    id: "wi25", name: "Yannic Cariah", shortName: "Y Cariah", role: "all-rounder",
    batting: { power: 58, temperament: 64, techniqueVsPace: 58, techniqueVsSpin: 62, acceleration: 54, offsideSkill: 56, legsideSkill: 56, runningBetweenWickets: 62 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 66, control: 62, variation: 68, deathBowling: 52, lineDiscipline: 62, pressureHandling: 60 },
  },
  wi26: {
    id: "wi26", name: "Rahkeem Cornwall", shortName: "R Cornwall", role: "all-rounder",
    batting: { power: 70, temperament: 62, techniqueVsPace: 60, techniqueVsSpin: 62, acceleration: 64, offsideSkill: 58, legsideSkill: 62, runningBetweenWickets: 60 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 70, control: 68, variation: 68, deathBowling: 58, lineDiscipline: 70, pressureHandling: 62 },
  },
  wi27: {
    id: "wi27", name: "Justin Greaves", shortName: "J Greaves", role: "all-rounder",
    batting: { power: 68, temperament: 68, techniqueVsPace: 66, techniqueVsSpin: 66, acceleration: 64, offsideSkill: 64, legsideSkill: 66, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 62, control: 60, variation: 56, deathBowling: 60, lineDiscipline: 58, pressureHandling: 58 },
  },
  wi28: {
    id: "wi28", name: "Matthew Forde", shortName: "M Forde", role: "bowler",
    batting: { power: 38, temperament: 44, techniqueVsPace: 34, techniqueVsSpin: 30, acceleration: 32, offsideSkill: 30, legsideSkill: 34, runningBetweenWickets: 34 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 74, control: 70, variation: 66, deathBowling: 68, lineDiscipline: 68, pressureHandling: 64 },
  },
  wi29: {
    id: "wi29", name: "Kavem Hodge", shortName: "K Hodge", role: "wicket-keeper",
    batting: { power: 68, temperament: 68, techniqueVsPace: 68, techniqueVsSpin: 64, acceleration: 64, offsideSkill: 66, legsideSkill: 64, runningBetweenWickets: 68 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  wi30: {
    id: "wi30", name: "Jeremy Solozano", shortName: "J Solozano", role: "batsman",
    batting: { power: 64, temperament: 68, techniqueVsPace: 66, techniqueVsSpin: 64, acceleration: 60, offsideSkill: 64, legsideSkill: 62, runningBetweenWickets: 66 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SRI LANKA extended squad  (sl16 – sl30)
  // ─────────────────────────────────────────────────────────────────────────
  sl16: {
    id: "sl16", name: "Dinesh Chandimal", shortName: "D Chandimal", role: "wicket-keeper",
    batting: { power: 66, temperament: 82, techniqueVsPace: 80, techniqueVsSpin: 80, acceleration: 60, offsideSkill: 76, legsideSkill: 72, runningBetweenWickets: 78 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  sl17: {
    id: "sl17", name: "Angelo Mathews", shortName: "A Mathews", role: "all-rounder",
    batting: { power: 66, temperament: 86, techniqueVsPace: 84, techniqueVsSpin: 82, acceleration: 58, offsideSkill: 78, legsideSkill: 72, runningBetweenWickets: 80 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 62, control: 60, variation: 54, deathBowling: 54, lineDiscipline: 60, pressureHandling: 62 },
  },
  sl18: {
    id: "sl18", name: "Dimuth Karunaratne", shortName: "D Karunaratne", role: "batsman",
    batting: { power: 60, temperament: 88, techniqueVsPace: 86, techniqueVsSpin: 84, acceleration: 54, offsideSkill: 80, legsideSkill: 68, runningBetweenWickets: 82 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 10, control: 12, variation: 8, deathBowling: 5, lineDiscipline: 10, pressureHandling: 12 },
  },
  sl19: {
    id: "sl19", name: "Oshada Fernando", shortName: "O Fernando", role: "batsman",
    batting: { power: 64, temperament: 78, techniqueVsPace: 78, techniqueVsSpin: 74, acceleration: 60, offsideSkill: 76, legsideSkill: 68, runningBetweenWickets: 76 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 8, control: 10, variation: 6, deathBowling: 5, lineDiscipline: 8, pressureHandling: 10 },
  },
  sl20: {
    id: "sl20", name: "Kamindu Mendis", shortName: "Kamindu Mendis", role: "all-rounder",
    batting: { power: 68, temperament: 78, techniqueVsPace: 76, techniqueVsSpin: 80, acceleration: 66, offsideSkill: 72, legsideSkill: 70, runningBetweenWickets: 74 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 72, control: 70, variation: 74, deathBowling: 58, lineDiscipline: 72, pressureHandling: 68 },
  },
  sl21: {
    id: "sl21", name: "Jeffrey Vandersay", shortName: "J Vandersay", role: "bowler",
    batting: { power: 38, temperament: 46, techniqueVsPace: 34, techniqueVsSpin: 38, acceleration: 32, offsideSkill: 32, legsideSkill: 34, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 80, control: 74, variation: 82, deathBowling: 64, lineDiscipline: 74, pressureHandling: 70 },
  },
  sl22: {
    id: "sl22", name: "Vishwa Fernando", shortName: "V Fernando", role: "bowler",
    batting: { power: 38, temperament: 44, techniqueVsPace: 34, techniqueVsSpin: 30, acceleration: 32, offsideSkill: 30, legsideSkill: 34, runningBetweenWickets: 34 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 76, control: 72, variation: 68, deathBowling: 68, lineDiscipline: 72, pressureHandling: 68 },
  },
  sl23: {
    id: "sl23", name: "Asitha Fernando", shortName: "Asitha Fernando", role: "bowler",
    batting: { power: 40, temperament: 46, techniqueVsPace: 36, techniqueVsSpin: 32, acceleration: 34, offsideSkill: 32, legsideSkill: 36, runningBetweenWickets: 36 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 80, control: 76, variation: 70, deathBowling: 70, lineDiscipline: 76, pressureHandling: 72 },
  },
  sl24: {
    id: "sl24", name: "Lahiru Kumara", shortName: "L Kumara", role: "bowler",
    batting: { power: 38, temperament: 44, techniqueVsPace: 34, techniqueVsSpin: 30, acceleration: 32, offsideSkill: 30, legsideSkill: 34, runningBetweenWickets: 34 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 78, control: 70, variation: 68, deathBowling: 72, lineDiscipline: 70, pressureHandling: 68 },
  },
  sl25: {
    id: "sl25", name: "Prabath Jayasuriya", shortName: "P Jayasuriya", role: "bowler",
    batting: { power: 36, temperament: 44, techniqueVsPace: 32, techniqueVsSpin: 36, acceleration: 30, offsideSkill: 30, legsideSkill: 32, runningBetweenWickets: 34 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 84, control: 80, variation: 80, deathBowling: 66, lineDiscipline: 82, pressureHandling: 76 },
  },
  sl26: {
    id: "sl26", name: "Ramesh Mendis", shortName: "Ramesh Mendis", role: "all-rounder",
    batting: { power: 60, temperament: 66, techniqueVsPace: 60, techniqueVsSpin: 66, acceleration: 56, offsideSkill: 58, legsideSkill: 58, runningBetweenWickets: 62 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 70, control: 70, variation: 72, deathBowling: 56, lineDiscipline: 72, pressureHandling: 64 },
  },
  sl27: {
    id: "sl27", name: "Niroshan Dickwella", shortName: "N Dickwella", role: "wicket-keeper",
    batting: { power: 74, temperament: 64, techniqueVsPace: 72, techniqueVsSpin: 68, acceleration: 72, offsideSkill: 72, legsideSkill: 72, runningBetweenWickets: 70 },
    bowling: { bowlerType: BowlerType.Spin, mainSkill: 5, control: 8, variation: 5, deathBowling: 5, lineDiscipline: 5, pressureHandling: 8 },
  },
  sl28: {
    id: "sl28", name: "Chamindu Wickramasinghe", shortName: "C Wickramasinghe", role: "bowler",
    batting: { power: 36, temperament: 42, techniqueVsPace: 32, techniqueVsSpin: 28, acceleration: 30, offsideSkill: 28, legsideSkill: 30, runningBetweenWickets: 32 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 74, control: 70, variation: 66, deathBowling: 66, lineDiscipline: 68, pressureHandling: 64 },
  },
  sl29: {
    id: "sl29", name: "Eshan Malinga", shortName: "E Malinga", role: "bowler",
    batting: { power: 36, temperament: 42, techniqueVsPace: 32, techniqueVsSpin: 28, acceleration: 30, offsideSkill: 28, legsideSkill: 30, runningBetweenWickets: 32 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 72, control: 68, variation: 64, deathBowling: 64, lineDiscipline: 66, pressureHandling: 62 },
  },
  sl30: {
    id: "sl30", name: "Milan Rathnayake", shortName: "M Rathnayake", role: "bowler",
    batting: { power: 36, temperament: 42, techniqueVsPace: 32, techniqueVsSpin: 28, acceleration: 28, offsideSkill: 28, legsideSkill: 30, runningBetweenWickets: 30 },
    bowling: { bowlerType: BowlerType.Pace, mainSkill: 70, control: 68, variation: 62, deathBowling: 62, lineDiscipline: 66, pressureHandling: 60 },
  },
};

/**
 * Batting position lookup for every player.
 * opener=opens innings, top-order=#3-4, middle-order=#5-7, lower-order=#8-9, tailender=#10-11
 */
export const BATTING_POSITIONS: Record<string, BattingPosition> = {
  // India
  t1:"top-order", t2:"opener",      t3:"middle-order", t4:"middle-order", t5:"top-order",
  t6:"opener",    t7:"middle-order", t8:"lower-order",  t9:"middle-order", t10:"lower-order",
  t11:"tailender",t12:"tailender",  t13:"tailender",   t14:"tailender",   t15:"tailender",
  t16:"opener",   t17:"top-order",  t18:"opener",      t19:"top-order",   t20:"opener",
  t21:"middle-order",t22:"lower-order",t23:"lower-order",t24:"top-order", t25:"top-order",
  t26:"tailender",t27:"tailender",  t28:"tailender",   t29:"lower-order", t30:"lower-order",
  // Pakistan
  s1:"top-order", s2:"opener",      s3:"opener",       s4:"opener",       s5:"middle-order",
  s6:"middle-order",s7:"middle-order",s8:"lower-order",s9:"lower-order",  s10:"lower-order",
  s11:"lower-order",s12:"tailender",s13:"tailender",   s14:"tailender",   s15:"tailender",
  s16:"opener",   s17:"opener",     s18:"opener",      s19:"top-order",   s20:"opener",
  s21:"middle-order",s22:"tailender",s23:"tailender",  s24:"tailender",   s25:"lower-order",
  s26:"middle-order",s27:"middle-order",s28:"top-order",s29:"lower-order",s30:"middle-order",
  // England
  e1:"opener",    e2:"top-order",   e3:"opener",       e4:"top-order",    e5:"top-order",
  e6:"middle-order",e7:"middle-order",e8:"lower-order",e9:"lower-order",  e10:"tailender",
  e11:"tailender",e12:"tailender",  e13:"tailender",   e14:"lower-order", e15:"tailender",
  e16:"opener",   e17:"top-order",  e18:"top-order",   e19:"middle-order",e20:"middle-order",
  e21:"lower-order",e22:"tailender",e23:"tailender",   e24:"tailender",   e25:"tailender",
  e26:"top-order",e27:"top-order",  e28:"middle-order",e29:"tailender",   e30:"top-order",
  // Australia
  a1:"opener",    a2:"opener",      a3:"middle-order", a4:"middle-order", a5:"middle-order",
  a6:"middle-order",a7:"middle-order",a8:"middle-order",a9:"middle-order",a10:"lower-order",
  a11:"tailender",a12:"tailender",  a13:"tailender",   a14:"tailender",   a15:"tailender",
  a16:"top-order",a17:"top-order",  a18:"opener",      a19:"lower-order", a20:"tailender",
  a21:"tailender",a22:"opener",     a23:"lower-order", a24:"lower-order", a25:"middle-order",
  a26:"tailender",a27:"lower-order",a28:"tailender",   a29:"top-order",   a30:"middle-order",
  // South Africa
  sa1:"opener",   sa2:"middle-order",sa3:"opener",     sa4:"top-order",   sa5:"top-order",
  sa6:"opener",   sa7:"middle-order",sa8:"middle-order",sa9:"lower-order",sa10:"lower-order",
  sa11:"tailender",sa12:"tailender",sa13:"tailender",  sa14:"tailender",  sa15:"tailender",
  sa16:"opener",  sa17:"top-order", sa18:"opener",     sa19:"lower-order",sa20:"top-order",
  sa21:"tailender",sa22:"tailender",sa23:"lower-order",sa24:"lower-order",sa25:"top-order",
  sa26:"opener",  sa27:"tailender", sa28:"tailender",  sa29:"lower-order",sa30:"tailender",
  // New Zealand
  nz1:"opener",   nz2:"opener",     nz3:"top-order",   nz4:"top-order",   nz5:"top-order",
  nz6:"middle-order",nz7:"opener",  nz8:"middle-order",nz9:"lower-order", nz10:"tailender",
  nz11:"tailender",nz12:"tailender",nz13:"tailender",  nz14:"tailender",  nz15:"tailender",
  nz16:"top-order",nz17:"middle-order",nz18:"middle-order",nz19:"top-order",nz20:"tailender",
  nz21:"lower-order",nz22:"tailender",nz23:"tailender",nz24:"tailender",  nz25:"lower-order",
  nz26:"lower-order",nz27:"middle-order",nz28:"lower-order",nz29:"lower-order",nz30:"lower-order",
  // West Indies
  wi1:"middle-order",wi2:"top-order",wi3:"opener",     wi4:"opener",      wi5:"opener",
  wi6:"middle-order",wi7:"middle-order",wi8:"lower-order",wi9:"top-order",wi10:"lower-order",
  wi11:"tailender",wi12:"tailender",wi13:"tailender",  wi14:"tailender",  wi15:"tailender",
  wi16:"opener",  wi17:"opener",    wi18:"opener",     wi19:"top-order",  wi20:"middle-order",
  wi21:"tailender",wi22:"tailender",wi23:"tailender",  wi24:"tailender",  wi25:"lower-order",
  wi26:"lower-order",wi27:"middle-order",wi28:"tailender",wi29:"top-order",wi30:"opener",
  // Sri Lanka
  sl1:"opener",   sl2:"opener",     sl3:"opener",      sl4:"opener",      sl5:"top-order",
  sl6:"middle-order",sl7:"middle-order",sl8:"top-order",sl9:"middle-order",sl10:"middle-order",
  sl11:"tailender",sl12:"tailender",sl13:"tailender",  sl14:"tailender",  sl15:"tailender",
  sl16:"top-order",sl17:"top-order",sl18:"opener",     sl19:"top-order",  sl20:"top-order",
  sl21:"tailender",sl22:"tailender",sl23:"tailender",  sl24:"tailender",  sl25:"tailender",
  sl26:"tailender",sl27:"opener",   sl28:"tailender",  sl29:"tailender",  sl30:"tailender",
};
