import { BattingIntent, FieldType } from "../types/enums";

interface ControlPanelProps {
  battingIntent: BattingIntent;
  fieldType: FieldType;
  onIntentChange: (intent: BattingIntent) => void;
  onFieldChange: (field: FieldType) => void;
  onNextBall: () => void;
  disabled: boolean;
}

const intentOptions = [
  { value: BattingIntent.Defensive, label: "Defensive" },
  { value: BattingIntent.Balanced, label: "Balanced" },
  { value: BattingIntent.Aggressive, label: "Aggressive" },
];

const fieldOptions = [
  { value: FieldType.Attacking, label: "Attacking" },
  { value: FieldType.Balanced, label: "Balanced" },
  { value: FieldType.Defensive, label: "Defensive" },
];

export function ControlPanel({
  battingIntent,
  fieldType,
  onIntentChange,
  onFieldChange,
  onNextBall,
  disabled,
}: ControlPanelProps) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Batting Intent
        </h3>
        <div className="flex gap-2">
          {intentOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onIntentChange(opt.value)}
              disabled={disabled}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                battingIntent === opt.value
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Field Setting
        </h3>
        <div className="flex gap-2">
          {fieldOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFieldChange(opt.value)}
              disabled={disabled}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                fieldType === opt.value
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNextBall}
        disabled={disabled}
        className={`w-full py-3 rounded-lg text-lg font-bold uppercase tracking-wide transition-all ${
          disabled
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.98]"
        }`}
      >
        Next Ball
      </button>
    </div>
  );
}
