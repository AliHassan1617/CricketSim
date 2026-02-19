import { Player } from "../types/player";

interface BattingOrderListProps {
  players: Player[];
  order: string[];
  onReorder: (order: string[]) => void;
}

export function BattingOrderList({ players, order, onReorder }: BattingOrderListProps) {
  const moveUp = (index: number) => {
    if (index <= 0) return;
    const newOrder = [...order];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onReorder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index >= order.length - 1) return;
    const newOrder = [...order];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onReorder(newOrder);
  };

  return (
    <div className="space-y-1.5 max-w-lg mx-auto">
      {order.map((id, index) => {
        const player = players.find((p) => p.id === id);
        if (!player) return null;
        return (
          <div
            key={id}
            className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
          >
            <span className="text-emerald-400 font-bold text-sm w-6">
              #{index + 1}
            </span>
            <span className="flex-1 text-white text-sm font-medium">
              {player.name}
            </span>
            <span className="text-xs text-gray-500 capitalize mr-2">
              {player.role}
            </span>
            <button
              onClick={() => moveUp(index)}
              disabled={index === 0}
              className="w-7 h-7 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-white text-sm flex items-center justify-center"
            >
              ↑
            </button>
            <button
              onClick={() => moveDown(index)}
              disabled={index === order.length - 1}
              className="w-7 h-7 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-white text-sm flex items-center justify-center"
            >
              ↓
            </button>
          </div>
        );
      })}
    </div>
  );
}
