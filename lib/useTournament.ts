import { TournamentState, Team, Player, Match } from './types';

export interface TournamentHook {
  state: TournamentState;
  loaded: boolean;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  removePlayer: (playerId: string) => void;
  updateMatch: (matchId: string, updates: Partial<Match>) => void;
  swapMatchOrder: (matchId1: string, matchId2: string) => void;
  resetData: () => void;
}
