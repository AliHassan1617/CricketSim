import { PitchType } from "../types/enums";

export interface Stadium {
  id: string;
  name: string;
  shortName: string;
  city: string;
  country: string;
  flag: string;        // flag emoji
  pitchType: PitchType;
  pitchLabel: "Flat" | "Seam" | "Spin";
}

export const STADIUMS: Stadium[] = [
  {
    id: "lords",
    name: "Lord's Cricket Ground",
    shortName: "Lord's",
    city: "London",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    pitchType: PitchType.SeamFriendly,
    pitchLabel: "Seam",
  },
  {
    id: "old-trafford",
    name: "Old Trafford",
    shortName: "Old Trafford",
    city: "Manchester",
    country: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    pitchType: PitchType.SeamFriendly,
    pitchLabel: "Seam",
  },
  {
    id: "mcg",
    name: "Melbourne Cricket Ground",
    shortName: "MCG",
    city: "Melbourne",
    country: "Australia",
    flag: "🇦🇺",
    pitchType: PitchType.SeamFriendly,
    pitchLabel: "Seam",
  },
  {
    id: "scg",
    name: "Sydney Cricket Ground",
    shortName: "SCG",
    city: "Sydney",
    country: "Australia",
    flag: "🇦🇺",
    pitchType: PitchType.Flat,
    pitchLabel: "Flat",
  },
  {
    id: "gaddafi",
    name: "Gaddafi Stadium",
    shortName: "Gaddafi",
    city: "Lahore",
    country: "Pakistan",
    flag: "🇵🇰",
    pitchType: PitchType.SpinFriendly,
    pitchLabel: "Spin",
  },
  {
    id: "eden-gardens",
    name: "Eden Gardens",
    shortName: "Eden Gardens",
    city: "Kolkata",
    country: "India",
    flag: "🇮🇳",
    pitchType: PitchType.SpinFriendly,
    pitchLabel: "Spin",
  },
  {
    id: "wankhede",
    name: "Wankhede Stadium",
    shortName: "Wankhede",
    city: "Mumbai",
    country: "India",
    flag: "🇮🇳",
    pitchType: PitchType.Flat,
    pitchLabel: "Flat",
  },
  {
    id: "supersport-park",
    name: "SuperSport Park",
    shortName: "SuperSport Park",
    city: "Centurion",
    country: "South Africa",
    flag: "🇿🇦",
    pitchType: PitchType.SeamFriendly,
    pitchLabel: "Seam",
  },
];
