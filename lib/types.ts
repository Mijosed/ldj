export type Group = 'A' | 'B';
export type MatchGroup = Group | 'F';
export type MatchPhase = 'group' | 'semifinal' | 'third_place' | 'final';
export type Tab = 'home' | 'matches' | 'standings' | 'stats' | 'admin';

export interface Player {
  id: string;
  name: string;
  number: number;
  teamId: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  group: Group;
}

export interface GoalEvent {
  id: string;
  playerName: string;
  teamId: string;
  count: number;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  played: boolean;
  scorers: GoalEvent[];
  assisters: GoalEvent[];
  group: MatchGroup;
  round: number;
  order: number;
  phase: MatchPhase;
  manOfMatch?: string;
  manOfMatchTeamId?: string;
}

export interface TrophyPlayer {
  playerName: string;
  teamId: string;
}

export interface TournamentAwards {
  ballonDor: TrophyPlayer | null;
  meilleureGardien: TrophyPlayer | null;
  goldenBoy: TrophyPlayer | null;
  puskas: TrophyPlayer | null;
  toty: TrophyPlayer[];
}

export const emptyAwards: TournamentAwards = {
  ballonDor: null,
  meilleureGardien: null,
  goldenBoy: null,
  puskas: null,
  toty: [],
};

export interface TournamentState {
  teams: Team[];
  players: Player[];
  matches: Match[];
  awards: TournamentAwards;
}

export interface StandingsRow {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface PlayerStat {
  playerName: string;
  teamId: string;
  count: number;
}
