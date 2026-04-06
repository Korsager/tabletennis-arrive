import { LogIn, LogOut, Shield } from "lucide-react";
import arriveLogo from "@/assets/arrive_logo.png";
import { tournaments } from "@/data/mockData";

interface NavbarProps {
  isAdmin: boolean;
  isLoggedIn: boolean;
  selectedTournament: string;
  onToggleAdmin: () => void;
  onToggleLogin: () => void;
  onSelectTournament: (id: string) => void;
}

const Navbar = ({ isAdmin, isLoggedIn, selectedTournament, onToggleAdmin, onToggleLogin, onSelectTournament }: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <img src={arriveLogo} alt="Arrive" className="h-8 w-auto" />
          <span className="text-lg font-extrabold text-primary">Table Tennis</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <select
            value={selectedTournament}
            onChange={(e) => onSelectTournament(e.target.value)}
            className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:px-3"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button
            onClick={onToggleAdmin}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              isAdmin
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Shield size={16} />
            <span className="hidden sm:inline">Admin</span>
          </button>
          <button
            onClick={onToggleLogin}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {isLoggedIn ? <LogOut size={16} /> : <LogIn size={16} />}
            <span className="hidden sm:inline">{isLoggedIn ? "Sign Out" : "Sign In"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
