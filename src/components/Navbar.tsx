import { LogIn, LogOut, Shield, Home, TrendingUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import arriveLogo from "@/assets/arrive_logo.png";
import { lovable } from "@/integrations/lovable/index";

interface Tournament {
  id: string;
  name: string;
}

interface NavbarProps {
  isAdmin: boolean;
  isLoggedIn: boolean;
  tournaments: Tournament[];
  selectedTournament: string;
  onSelectTournament: (id: string) => void;
  onSignOut: () => void;
  userName?: string;
}

const Navbar = ({ isAdmin, isLoggedIn, tournaments, selectedTournament, onSelectTournament, onSignOut, userName }: NavbarProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const handleSignIn = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      console.error("Sign in error:", result.error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={arriveLogo} alt="Arrive" className="h-8 w-auto" />
            <span className="text-lg font-extrabold text-primary">Table Tennis</span>
          </Link>
          {!isHomePage && (
            <Link to="/" className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
              <Home size={16} />
              <span className="hidden sm:inline">Home</span>
            </Link>
          )}
          <Link to="/rankings" className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
            <TrendingUp size={16} />
            <span className="hidden sm:inline">Rankings</span>
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {tournaments.length > 0 && (
            <select
              value={selectedTournament}
              onChange={(e) => onSelectTournament(e.target.value)}
              className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:px-3"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
          {isAdmin && (
            <span className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
              <Shield size={16} />
              <span className="hidden sm:inline">Admin</span>
            </span>
          )}
          {isLoggedIn ? (
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">{userName ?? "Sign Out"}</span>
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Sign In with Google</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
