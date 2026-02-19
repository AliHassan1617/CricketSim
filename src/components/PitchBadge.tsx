interface PitchBadgeProps {
  pitchType: string;
}

export function PitchBadge({ pitchType }: PitchBadgeProps) {
  const normalized = pitchType.toLowerCase().replace(/[\s-]/g, "");

  let colorClasses: string;
  let label: string;

  switch (normalized) {
    case "flat":
      colorClasses = "bg-green-900/60 text-green-400 ring-green-700";
      label = "Flat";
      break;
    case "spinfriendly":
      colorClasses = "bg-purple-900/60 text-purple-400 ring-purple-700";
      label = "Spin Friendly";
      break;
    case "seamfriendly":
      colorClasses = "bg-orange-900/60 text-orange-400 ring-orange-700";
      label = "Seam Friendly";
      break;
    default:
      colorClasses = "bg-gray-800 text-gray-400 ring-gray-600";
      label = pitchType;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ${colorClasses}`}
    >
      {label}
    </span>
  );
}
