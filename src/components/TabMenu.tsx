import { Trophy, Swords, GitBranch, Hash, BookOpen } from "lucide-react";

const tabs = [
  { id: "league", label: "League Table", icon: Trophy },
  { id: "matches", label: "Matches", icon: Swords },
  { id: "playoffs", label: "Playoffs", icon: GitBranch },
  { id: "rankings", label: "Seeding", icon: Hash },
  { id: "rules", label: "Rules & Admin", icon: BookOpen },
] as const;

export type TabId = (typeof tabs)[number]["id"];

interface TabMenuProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TabMenu = ({ activeTab, onTabChange }: TabMenuProps) => {
  return (
    <div className="sticky top-[57px] z-40 border-b bg-card/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TabMenu;
