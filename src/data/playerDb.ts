import { BowlerType } from "../types/enums";
import { Player } from "../types/player";

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
};
