import { TournamentState, Team, Match, Group, MatchPhase } from './types';

const TEAMS: Team[] = [
  { id: '100_blaze', name: '100 Blaze', logo: '100_blaze.jpeg', group: 'A' },
  { id: 'all_stars', name: 'All Stars', logo: 'all_stars.png', group: 'A' },
  { id: 'aura_city', name: 'Aura City', logo: 'aura_city.jpeg', group: 'A' },
  { id: 'fc_city', name: 'FC City', logo: 'fc_city.jpeg', group: 'A' },
  { id: 'racing_club', name: 'Racing Club', logo: 'racing_club.jpeg', group: 'A' },
  { id: 'valar_morghulis', name: 'Valar Morghulis', logo: 'valar_morghulis.jpeg', group: 'A' },
  { id: '100_peine', name: '100 Peine', logo: '100_peine.jpeg', group: 'B' },
  { id: 'b5_city', name: 'B5 City', logo: 'b5_city.jpeg', group: 'B' },
  { id: 'fc_havana', name: 'FC Havana', logo: 'fc_havana.jpeg', group: 'B' },
  { id: 'squadra_azzura', name: 'Squadra Azzura', logo: 'squadra_azzura.jpeg', group: 'B' },
  { id: 'vlg', name: 'VLG', logo: 'vlg.jpeg', group: 'B' },
  { id: 'xpti', name: 'XPTI', logo: 'xpti.jpeg', group: 'B' },
];

const PAIRINGS: [number, number][][] = [
  [[0, 5], [1, 4], [2, 3]],
  [[0, 4], [5, 3], [1, 2]],
  [[0, 3], [4, 2], [5, 1]],
  [[0, 2], [3, 1], [4, 5]],
  [[0, 1], [2, 5], [3, 4]],
];

export function generateGroupMatches(
  groupATeams: string[],
  groupBTeams: string[],
  startGroup: Group = 'A',
): Match[] {
  const matches: Match[] = [];
  let matchId = 1;
  let order = 1;

  for (let round = 0; round < 5; round++) {
    const aMatches: Match[] = [];
    const bMatches: Match[] = [];

    for (const [homeIdx, awayIdx] of PAIRINGS[round]) {
      aMatches.push({
        id: `match_${matchId++}`, homeTeamId: groupATeams[homeIdx], awayTeamId: groupATeams[awayIdx],
        homeScore: null, awayScore: null, played: false, scorers: [], assisters: [],
        group: 'A', round: round + 1, order: 0, phase: 'group',
      });
      bMatches.push({
        id: `match_${matchId++}`, homeTeamId: groupBTeams[homeIdx], awayTeamId: groupBTeams[awayIdx],
        homeScore: null, awayScore: null, played: false, scorers: [], assisters: [],
        group: 'B', round: round + 1, order: 0, phase: 'group',
      });
    }

    const first = startGroup === 'A' ? aMatches : bMatches;
    const second = startGroup === 'A' ? bMatches : aMatches;
    for (let i = 0; i < 3; i++) {
      first[i].order = order++;
      second[i].order = order++;
    }

    matches.push(...aMatches, ...bMatches);
  }

  return matches;
}

const FINAL_MATCHES: Match[] = [
  { id: 'sf1', homeTeamId: '', awayTeamId: '', homeScore: null, awayScore: null, played: false, scorers: [], assisters: [], group: 'F', round: 0, order: 31, phase: 'semifinal' },
  { id: 'sf2', homeTeamId: '', awayTeamId: '', homeScore: null, awayScore: null, played: false, scorers: [], assisters: [], group: 'F', round: 0, order: 32, phase: 'semifinal' },
  { id: 'third_place', homeTeamId: '', awayTeamId: '', homeScore: null, awayScore: null, played: false, scorers: [], assisters: [], group: 'F', round: 0, order: 33, phase: 'third_place' },
  { id: 'grand_final', homeTeamId: '', awayTeamId: '', homeScore: null, awayScore: null, played: false, scorers: [], assisters: [], group: 'F', round: 0, order: 34, phase: 'final' },
];

const DEFAULT_GROUP_A = ['100_blaze', 'all_stars', 'aura_city', 'fc_city', 'racing_club', 'valar_morghulis'];
const DEFAULT_GROUP_B = ['100_peine', 'b5_city', 'fc_havana', 'squadra_azzura', 'vlg', 'xpti'];

export const initialState: TournamentState = {
  teams: TEAMS,
  players: [],
  matches: [...generateGroupMatches(DEFAULT_GROUP_A, DEFAULT_GROUP_B), ...FINAL_MATCHES],
};
