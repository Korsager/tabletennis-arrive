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
  visible_in_ranking?: boolean;
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
  signup_deadline?: string;
  description?: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  profile_id: string;
  joined_at: string;
  profile: {
    id: string;
    display_name: string;
    elo: number;
  };
}

export interface MatchApproval {
  id: string;
  match_id: string;
  profile_id: string;
  approved: boolean;
  approved_at: string;
}

// Tournaments: 2 upcoming, 1 active, 1 finished
export const tournaments: Tournament[] = [
  // Active tournament (current)
  {
    id: "t1",
    name: "Spring 2026 League",
    startDate: "2026-03-01",
    endDate: "2026-06-30",
    active: true,
    signup_deadline: "2026-05-01",
    description: `Structure
Groupstage
League format

Playoffs
Single elimination format

Format
Group Stage: Best of 3 games
Playoffs: Best of 5 games
Top 6 advance to playoffs (1-2 to semis, 3-6 to quarters)

Scoring
Win: 3 points
Draw: 1 point
Loss: 0 points
Forfeit: -1 point to forfeiting player

Tiebreakers
1. Points
2. Head-to-head
3. Game score difference (head-to-head)
4. Game score difference (overall)
5. Match score difference (head-to-head)
6. Match score difference (overall)
7. Match wins/draws/losses/forfeits (overall)`
  },
  // Upcoming tournament 1
  {
    id: "t2",
    name: "Summer 2026 Championship",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    active: false,
    signup_deadline: "2026-06-15"
  },
  // Upcoming tournament 2
  {
    id: "t3",
    name: "Fall 2026 League",
    startDate: "2026-10-01",
    endDate: "2026-12-31",
    active: false,
    signup_deadline: "2026-09-15"
  },
  // Finished tournament
  {
    id: "t4",
    name: "Winter 2025 League",
    startDate: "2025-01-01",
    endDate: "2025-03-31",
    active: false
  },
];

// Players for Spring 2026 League (active tournament)
export const spring2026Players: Player[] = [
  { id: "p1", name: "Alex Chen", played: 8, wins: 7, draws: 1, losses: 0, forfeits: 0, gamesWon: 24, gamesLost: 6, points: 22, elo: 1580, history: [{ tournament: "Winter 2025 League", placement: "1st Place" }], visible_in_ranking: true },
  { id: "p2", name: "Sarah Kim", played: 8, wins: 6, draws: 1, losses: 1, forfeits: 0, gamesWon: 21, gamesLost: 9, points: 19, elo: 1520, history: [{ tournament: "Winter 2025 League", placement: "2nd Place" }], visible_in_ranking: true },
  { id: "p3", name: "Marcus Johnson", played: 8, wins: 5, draws: 2, losses: 1, forfeits: 0, gamesWon: 19, gamesLost: 11, points: 17, elo: 1480, history: [{ tournament: "Winter 2025 League", placement: "3rd Place" }], visible_in_ranking: true },
  { id: "p4", name: "Emily Wang", played: 8, wins: 5, draws: 1, losses: 2, forfeits: 0, gamesWon: 18, gamesLost: 12, points: 16, elo: 1450, history: [], visible_in_ranking: true },
  { id: "p5", name: "Jake Rivera", played: 8, wins: 4, draws: 1, losses: 3, forfeits: 0, gamesWon: 16, gamesLost: 14, points: 13, elo: 1420, history: [], visible_in_ranking: false },
  { id: "p6", name: "Priya Patel", played: 8, wins: 4, draws: 0, losses: 4, forfeits: 0, gamesWon: 15, gamesLost: 15, points: 12, elo: 1390, history: [], visible_in_ranking: true },
  { id: "p7", name: "Tom Bradley", played: 8, wins: 3, draws: 1, losses: 4, forfeits: 0, gamesWon: 13, gamesLost: 17, points: 10, elo: 1360, history: [], visible_in_ranking: true },
  { id: "p8", name: "Nina Oswald", played: 8, wins: 2, draws: 2, losses: 4, forfeits: 0, gamesWon: 12, gamesLost: 18, points: 8, elo: 1330, history: [], visible_in_ranking: true },
  { id: "p9", name: "David Liu", played: 8, wins: 2, draws: 0, losses: 6, forfeits: 0, gamesWon: 10, gamesLost: 20, points: 6, elo: 1300, history: [], visible_in_ranking: false },
  { id: "p10", name: "Lisa Chen", played: 8, wins: 1, draws: 1, losses: 6, forfeits: 0, gamesWon: 8, gamesLost: 22, points: 4, elo: 1270, history: [], visible_in_ranking: true },
];

// Players for Summer 2026 Championship (upcoming)
export const summer2026Players: Player[] = [
  { id: "p11", name: "Michael Torres", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1500, history: [] },
  { id: "p12", name: "Rachel Green", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1480, history: [] },
  { id: "p13", name: "Kevin Zhang", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1450, history: [] },
  { id: "p14", name: "Amanda Foster", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1420, history: [] },
  { id: "p15", name: "Brian Wilson", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1390, history: [] },
  { id: "p16", name: "Sophie Martin", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1360, history: [] },
  { id: "p17", name: "Chris Anderson", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1330, history: [] },
  { id: "p18", name: "Diana Rodriguez", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1300, history: [] },
  { id: "p19", name: "Eric Thompson", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1270, history: [] },
  { id: "p20", name: "Grace Lee", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1240, history: [] },
];

// Players for Fall 2026 League (upcoming)
export const fall2026Players: Player[] = [
  { id: "p21", name: "Henry Davis", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1490, history: [] },
  { id: "p22", name: "Isabella Garcia", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1460, history: [] },
  { id: "p23", name: "Jack Miller", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1430, history: [] },
  { id: "p24", name: "Katherine Brown", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1400, history: [] },
  { id: "p25", name: "Lucas Taylor", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1370, history: [] },
  { id: "p26", name: "Maria Sanchez", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1340, history: [] },
  { id: "p27", name: "Nathan White", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1310, history: [] },
  { id: "p28", name: "Olivia Jones", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1280, history: [] },
  { id: "p29", name: "Parker Wilson", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1250, history: [] },
  { id: "p30", name: "Quinn Davis", played: 0, wins: 0, draws: 0, losses: 0, forfeits: 0, gamesWon: 0, gamesLost: 0, points: 0, elo: 1220, history: [] },
];

// Players for Winter 2025 League (finished)
export const winter2025Players: Player[] = [
  { id: "p31", name: "Robert King", played: 9, wins: 8, draws: 1, losses: 0, forfeits: 0, gamesWon: 27, gamesLost: 6, points: 25, elo: 1550, history: [{ tournament: "Fall 2024 League", placement: "1st Place" }] },
  { id: "p32", name: "Samantha Moore", played: 9, wins: 7, draws: 1, losses: 1, forfeits: 0, gamesWon: 24, gamesLost: 9, points: 22, elo: 1510, history: [{ tournament: "Fall 2024 League", placement: "2nd Place" }] },
  { id: "p33", name: "Tyler Evans", played: 9, wins: 6, draws: 2, losses: 1, forfeits: 0, gamesWon: 22, gamesLost: 11, points: 20, elo: 1470, history: [{ tournament: "Fall 2024 League", placement: "3rd Place" }] },
  { id: "p34", name: "Victoria Clark", played: 9, wins: 6, draws: 0, losses: 3, forfeits: 0, gamesWon: 21, gamesLost: 12, points: 18, elo: 1440, history: [] },
  { id: "p35", name: "William Turner", played: 9, wins: 5, draws: 1, losses: 3, forfeits: 0, gamesWon: 19, gamesLost: 14, points: 16, elo: 1410, history: [] },
  { id: "p36", name: "Xena Young", played: 9, wins: 4, draws: 2, losses: 3, forfeits: 0, gamesWon: 17, gamesLost: 16, points: 14, elo: 1380, history: [] },
  { id: "p37", name: "Yusuf Ahmed", played: 9, wins: 4, draws: 0, losses: 5, forfeits: 0, gamesWon: 16, gamesLost: 17, points: 12, elo: 1350, history: [] },
  { id: "p38", name: "Zara Patel", played: 9, wins: 3, draws: 1, losses: 5, forfeits: 0, gamesWon: 14, gamesLost: 19, points: 10, elo: 1320, history: [] },
  { id: "p39", name: "Aaron Mitchell", played: 9, wins: 2, draws: 1, losses: 6, forfeits: 0, gamesWon: 12, gamesLost: 21, points: 7, elo: 1290, history: [] },
  { id: "p40", name: "Bella Nguyen", played: 9, wins: 1, draws: 0, losses: 8, forfeits: 0, gamesWon: 9, gamesLost: 24, points: 3, elo: 1260, history: [] },
];

// All players combined
export const players: Player[] = [
  ...spring2026Players,
  ...summer2026Players,
  ...fall2026Players,
  ...winter2025Players,
];

// Tournament participants
export const tournamentParticipants: TournamentParticipant[] = [
  // Spring 2026 League participants
  ...spring2026Players.map((player, index) => ({
    id: `tp1_${player.id}`,
    tournament_id: "t1",
    profile_id: player.id,
    joined_at: `2026-02-${String(index + 1).padStart(2, '0')}T10:00:00Z`,
    profile: {
      id: player.id,
      display_name: player.name,
      elo: player.elo,
    },
  })),
  // Summer 2026 Championship participants
  ...summer2026Players.map((player, index) => ({
    id: `tp2_${player.id}`,
    tournament_id: "t2",
    profile_id: player.id,
    joined_at: `2026-06-${String(index + 1).padStart(2, '0')}T10:00:00Z`,
    profile: {
      id: player.id,
      display_name: player.name,
      elo: player.elo,
    },
  })),
  // Fall 2026 League participants
  ...fall2026Players.map((player, index) => ({
    id: `tp3_${player.id}`,
    tournament_id: "t3",
    profile_id: player.id,
    joined_at: `2026-09-${String(index + 1).padStart(2, '0')}T10:00:00Z`,
    profile: {
      id: player.id,
      display_name: player.name,
      elo: player.elo,
    },
  })),
  // Winter 2025 League participants
  ...winter2025Players.map((player, index) => ({
    id: `tp4_${player.id}`,
    tournament_id: "t4",
    profile_id: player.id,
    joined_at: `2024-12-${String(index + 1).padStart(2, '0')}T10:00:00Z`,
    profile: {
      id: player.id,
      display_name: player.name,
      elo: player.elo,
    },
  })),
];

// Matches for Spring 2026 League (active tournament with various statuses)
export const matches: Match[] = [
  // Round 1 - All completed
  { id: "m1", round: 1, player1: "p1", player2: "p10", score1: 3, score2: 0, status: "Completed" },
  { id: "m2", round: 1, player1: "p2", player2: "p9", score1: 3, score2: 1, status: "Completed" },
  { id: "m3", round: 1, player1: "p3", player2: "p8", score1: 2, score2: 2, status: "Completed" },
  { id: "m4", round: 1, player1: "p4", player2: "p7", score1: 3, score2: 1, status: "Completed" },
  { id: "m5", round: 1, player1: "p5", player2: "p6", score1: 3, score2: 2, status: "Completed" },

  // Round 2 - Some completed, some pending
  { id: "m6", round: 2, player1: "p1", player2: "p2", score1: 3, score2: 1, status: "Completed" },
  { id: "m7", round: 2, player1: "p3", player2: "p4", score1: null, score2: null, status: "Pending" },
  { id: "m8", round: 2, player1: "p5", player2: "p7", score1: 3, score2: 0, status: "Completed" },
  { id: "m9", round: 2, player1: "p6", player2: "p8", score1: null, score2: null, status: "Pending" },
  { id: "m10", round: 2, player1: "p9", player2: "p10", score1: 2, score2: 3, status: "Completed" },

  // Round 3 - Mix of completed and pending
  { id: "m11", round: 3, player1: "p1", player2: "p3", score1: null, score2: null, status: "Pending" },
  { id: "m12", round: 3, player1: "p2", player2: "p5", score1: 3, score2: 2, status: "Completed" },
  { id: "m13", round: 3, player1: "p4", player2: "p6", score1: 3, score2: 1, status: "Completed" },
  { id: "m14", round: 3, player1: "p7", player2: "p9", score1: null, score2: null, status: "Pending" },
  { id: "m15", round: 3, player1: "p8", player2: "p10", score1: 2, score2: 3, status: "Completed" },

  // Round 4 - Mostly pending
  { id: "m16", round: 4, player1: "p1", player2: "p4", score1: null, score2: null, status: "Pending" },
  { id: "m17", round: 4, player1: "p2", player2: "p6", score1: null, score2: null, status: "Pending" },
  { id: "m18", round: 4, player1: "p3", player2: "p7", score1: null, score2: null, status: "Pending" },
  { id: "m19", round: 4, player1: "p5", player2: "p8", score1: null, score2: null, status: "Pending" },
  { id: "m20", round: 4, player1: "p9", player2: "p10", score1: null, score2: null, status: "Pending" },
];

// Matches for Winter 2025 League (finished tournament - all completed)
export const winter2025Matches: Match[] = [
  { id: "wm1", round: 1, player1: "p31", player2: "p40", score1: 3, score2: 0, status: "Completed" },
  { id: "wm2", round: 1, player1: "p32", player2: "p39", score1: 3, score2: 1, status: "Completed" },
  { id: "wm3", round: 1, player1: "p33", player2: "p38", score1: 3, score2: 2, status: "Completed" },
  { id: "wm4", round: 1, player1: "p34", player2: "p37", score1: 2, score2: 3, status: "Completed" },
  { id: "wm5", round: 1, player1: "p35", player2: "p36", score1: 3, score2: 1, status: "Completed" },
  { id: "wm6", round: 2, player1: "p31", player2: "p32", score1: 3, score2: 2, status: "Completed" },
  { id: "wm7", round: 2, player1: "p33", player2: "p35", score1: 3, score2: 1, status: "Completed" },
  { id: "wm8", round: 2, player1: "p36", player2: "p37", score1: 2, score2: 3, status: "Completed" },
  { id: "wm9", round: 2, player1: "p38", player2: "p39", score1: 3, score2: 0, status: "Completed" },
  { id: "wm10", round: 2, player1: "p34", player2: "p40", score1: 3, score2: 1, status: "Completed" },
];

// Playoff matches for Spring 2026 League (active tournament)
export const playoffBracket: PlayoffMatch[] = [
  // Quarterfinals: Seeds 3-6
  { id: "qf1", round: "QF", player1: "p3", player2: "p8", score1: 3, score2: 1, winner: "p3" },
  { id: "qf2", round: "QF", player1: "p4", player2: "p7", score1: 3, score2: 2, winner: "p4" },
  // Semifinals: Seeds 1-2 with QF winners
  { id: "sf1", round: "SF", player1: "p1", player2: "p3", score1: null, score2: null, winner: null },
  { id: "sf2", round: "SF", player1: "p2", player2: "p4", score1: null, score2: null, winner: null },
  // Final
  { id: "f1", round: "Final", player1: null, player2: null, score1: null, score2: null, winner: null },
];

// Playoff matches for Winter 2025 League (finished tournament)
export const winter2025Playoffs: PlayoffMatch[] = [
  // Quarterfinals: Seeds 3-6
  { id: "wqf1", round: "QF", player1: "p33", player2: "p38", score1: 3, score2: 1, winner: "p33" },
  { id: "wqf2", round: "QF", player1: "p34", player2: "p37", score1: 3, score2: 2, winner: "p34" },
  // Semifinals: Seeds 1-2 with QF winners
  { id: "wsf1", round: "SF", player1: "p31", player2: "p33", score1: 3, score2: 1, winner: "p31" },
  { id: "wsf2", round: "SF", player1: "p32", player2: "p34", score1: 3, score2: 2, winner: "p32" },
  // Final
  { id: "wf1", round: "Final", player1: "p31", player2: "p32", score1: 3, score2: 1, winner: "p31" },
];

// Challenge matches
export const challengeMatches = [
  {
    id: "cm1",
    challenger_id: "p1",
    challenged_id: "p2",
    scheduled_at: "2026-04-15T18:00:00Z",
    status: "accepted",
    score1: null,
    score2: null,
    winner_id: null,
    match_format: "BO3",
    challenger: { id: "p1", display_name: "Alex Chen", elo: 1580 },
    challenged: { id: "p2", display_name: "Sarah Kim", elo: 1520 },
    winner: null,
  },
  {
    id: "cm2",
    challenger_id: "p3",
    challenged_id: "p4",
    scheduled_at: "2026-04-16T19:00:00Z",
    status: "pending",
    score1: null,
    score2: null,
    winner_id: null,
    match_format: "BO5",
    challenger: { id: "p3", display_name: "Marcus Johnson", elo: 1480 },
    challenged: { id: "p4", display_name: "Emily Wang", elo: 1450 },
    winner: null,
  },
];

// Match approvals - some approved, some disputed, some missing
export const matchApprovals: MatchApproval[] = [
  // Approved matches
  { id: "ma1", match_id: "m1", profile_id: "p1", approved: true, approved_at: "2026-03-15T14:00:00Z" },
  { id: "ma2", match_id: "m1", profile_id: "p10", approved: true, approved_at: "2026-03-15T15:00:00Z" },
  { id: "ma3", match_id: "m2", profile_id: "p2", approved: true, approved_at: "2026-03-16T10:00:00Z" },
  { id: "ma4", match_id: "m2", profile_id: "p9", approved: true, approved_at: "2026-03-16T11:00:00Z" },

  // Disputed matches (approved = false)
  { id: "ma5", match_id: "m3", profile_id: "p3", approved: false, approved_at: "2026-03-17T12:00:00Z" },
  { id: "ma6", match_id: "m3", profile_id: "p8", approved: false, approved_at: "2026-03-17T13:00:00Z" },

  // Completed matches without approvals (need admin approval)
  // m4, m5, m6, m8, m10, m12, m13, m15 have no approvals yet
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
