export interface Player {
  id: string;
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  forfeits: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
  elo: number;
  history: { tournament: string; placement: string }[];
}

export interface Match {
  id: string;
  round: number;
  player1: string;
  player2: string;
  score1: number | null;
  score2: number | null;
  status: "Pending" | "Completed";
  forfeitBy?: string;
}

export interface PlayoffMatch {
  id: string;
  round: "QF" | "SF" | "Final";
  player1: string | null;
  player2: string | null;
  score1: number | null;
  score2: number | null;
  winner: string | null;
}

export interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export const tournaments: Tournament[] = [
  { id: "t1", name: "Spring 2025 League", startDate: "2025-03-01", endDate: "2025-06-30", active: true },
  { id: "t2", name: "Winter 2024 League", startDate: "2024-10-01", endDate: "2024-12-31", active: false },
];

export const players: Player[] = [
  { id: "p1", name: "Alex Chen", played: 10, wins: 8, draws: 1, losses: 1, forfeits: 0, gamesWon: 28, gamesLost: 10, points: 25, elo: 1542, history: [{ tournament: "Spring 2025 League", placement: "1st Place" }, { tournament: "Winter 2024 League", placement: "3rd Place" }] },
  { id: "p2", name: "Sarah Kim", played: 10, wins: 7, draws: 2, losses: 1, forfeits: 0, gamesWon: 25, gamesLost: 12, points: 23, elo: 1498, history: [{ tournament: "Spring 2025 League", placement: "2nd Place" }, { tournament: "Winter 2024 League", placement: "1st Place" }] },
  { id: "p3", name: "Marcus Johnson", played: 10, wins: 6, draws: 2, losses: 2, forfeits: 0, gamesWon: 22, gamesLost: 14, points: 20, elo: 1455, history: [{ tournament: "Spring 2025 League", placement: "3rd Place" }] },
  { id: "p4", name: "Emily Wang", played: 10, wins: 6, draws: 1, losses: 3, forfeits: 0, gamesWon: 21, gamesLost: 15, points: 19, elo: 1420, history: [{ tournament: "Spring 2025 League", placement: "4th Place" }, { tournament: "Winter 2024 League", placement: "2nd Place" }] },
  { id: "p5", name: "Jake Rivera", played: 10, wins: 5, draws: 1, losses: 4, forfeits: 1, gamesWon: 18, gamesLost: 17, points: 16, elo: 1388, history: [{ tournament: "Spring 2025 League", placement: "5th Place" }] },
  { id: "p6", name: "Priya Patel", played: 10, wins: 4, draws: 2, losses: 4, forfeits: 0, gamesWon: 17, gamesLost: 18, points: 14, elo: 1365, history: [{ tournament: "Spring 2025 League", placement: "6th Place" }, { tournament: "Winter 2024 League", placement: "5th Place" }] },
  { id: "p7", name: "Tom Bradley", played: 10, wins: 3, draws: 1, losses: 6, forfeits: 1, gamesWon: 14, gamesLost: 22, points: 10, elo: 1310, history: [{ tournament: "Spring 2025 League", placement: "7th Place" }] },
  { id: "p8", name: "Nina Oswald", played: 10, wins: 2, draws: 0, losses: 8, forfeits: 0, gamesWon: 10, gamesLost: 26, points: 6, elo: 1265, history: [{ tournament: "Spring 2025 League", placement: "8th Place" }, { tournament: "Winter 2024 League", placement: "4th Place" }] },
];

export const matches: Match[] = [
  { id: "m1", round: 1, player1: "Alex Chen", player2: "Nina Oswald", score1: 3, score2: 0, status: "Completed" },
  { id: "m2", round: 1, player1: "Sarah Kim", player2: "Tom Bradley", score1: 3, score2: 1, status: "Completed" },
  { id: "m3", round: 1, player1: "Marcus Johnson", player2: "Priya Patel", score1: 2, score2: 2, status: "Completed" },
  { id: "m4", round: 1, player1: "Emily Wang", player2: "Jake Rivera", score1: 3, score2: 1, status: "Completed" },
  { id: "m5", round: 2, player1: "Alex Chen", player2: "Sarah Kim", score1: null, score2: null, status: "Pending" },
  { id: "m6", round: 2, player1: "Marcus Johnson", player2: "Emily Wang", score1: null, score2: null, status: "Pending" },
  { id: "m7", round: 2, player1: "Jake Rivera", player2: "Tom Bradley", score1: null, score2: null, status: "Pending" },
  { id: "m8", round: 2, player1: "Priya Patel", player2: "Nina Oswald", score1: null, score2: null, status: "Pending" },
];

export const playoffBracket: PlayoffMatch[] = [
  { id: "qf1", round: "QF", player1: "Marcus Johnson", player2: "Priya Patel", score1: 3, score2: 1, winner: "Marcus Johnson" },
  { id: "qf2", round: "QF", player1: "Emily Wang", player2: "Jake Rivera", score1: 3, score2: 2, winner: "Emily Wang" },
  { id: "qf3", round: "QF", player1: null, player2: null, score1: null, score2: null, winner: null },
  { id: "qf4", round: "QF", player1: null, player2: null, score1: null, score2: null, winner: null },
  { id: "sf1", round: "SF", player1: "Alex Chen", player2: "Marcus Johnson", score1: null, score2: null, winner: null },
  { id: "sf2", round: "SF", player1: "Sarah Kim", player2: "Emily Wang", score1: null, score2: null, winner: null },
  { id: "f1", round: "Final", player1: null, player2: null, score1: null, score2: null, winner: null },
];

export const rules = `## Official Arrive Table Tennis League Rules

### Match Format
- All matches are best-of-5 games
- Each game is played to 11 points (win by 2)
- Players alternate serves every 2 points

### Scoring
- Win: 3 points
- Draw: 1 point
- Loss: 0 points
- Forfeit: -1 point to forfeiting player, 3 points to opponent

### Tiebreakers
1. Head-to-head record
2. Game difference (Games Won - Games Lost)
3. Points scored difference
4. Coin flip

### Playoffs
- Top 2 seeds receive a bye to semi-finals
- Seeds 3-6 play in quarter-finals
- All playoff matches are best-of-7

### Code of Conduct
- Be respectful and sportsmanlike at all times
- Report scores within 24 hours of match completion
- Two unreported forfeits result in disqualification
`;
