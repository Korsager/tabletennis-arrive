import { X, Trophy } from "lucide-react";
import { Player } from "@/data/mockData";

interface PlayerHistoryModalProps {
  player: Player;
  onClose: () => void;
}

const placementColor = (p: string) => {
  if (p.startsWith("1st")) return "bg-yellow-100 text-yellow-800";
  if (p.startsWith("2nd")) return "bg-gray-100 text-gray-700";
  if (p.startsWith("3rd")) return "bg-amber-100 text-amber-800";
  return "bg-muted text-muted-foreground";
};

const PlayerHistoryModal = ({ player, onClose }: PlayerHistoryModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm rounded-2xl border bg-card/95 p-6 shadow-2xl backdrop-blur-md">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Trophy size={18} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold">{player.name}</h2>
            <p className="text-xs text-muted-foreground">Elo: <span className="font-bold text-foreground">{player.elo}</span></p>
          </div>
        </div>
        <div className="max-h-60 space-y-2 overflow-y-auto">
          {player.history.map((h, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
              <span className="text-sm font-medium">{h.tournament}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${placementColor(h.placement)}`}>
                {h.placement}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerHistoryModal;
