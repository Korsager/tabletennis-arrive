import { X, Trophy } from "lucide-react";
import { ProfileRow } from "@/hooks/useData";

interface PlayerHistoryModalProps {
  player: ProfileRow;
  onClose: () => void;
}

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
            <h2 className="text-lg font-extrabold">{player.display_name}</h2>
            <p className="text-xs text-muted-foreground">Elo: <span className="font-bold text-foreground">{player.elo}</span></p>
          </div>
        </div>
        <div className="rounded-xl bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          Tournament history will appear here as tournaments are completed.
        </div>
      </div>
    </div>
  );
};

export default PlayerHistoryModal;
