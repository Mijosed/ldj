import { Team, Match, StandingsRow, PlayerStat, Group } from './types';

export function computeStandings(teams: Team[], matches: Match[], group: Group): StandingsRow[] {
  const groupTeams = teams.filter(t => t.group === group);
  const groupMatches = matches.filter(m => {
    if (m.phase !== 'group') return false;
    const home = teams.find(t => t.id === m.homeTeamId);
    const away = teams.find(t => t.id === m.awayTeamId);
    return home?.group === group && away?.group === group && m.played;
  });

  const rows = new Map<string, StandingsRow>();
  for (const team of groupTeams) {
    rows.set(team.id, { teamId: team.id, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0 });
  }

  for (const match of groupMatches) {
    if (match.homeScore === null || match.awayScore === null) continue;
    const home = rows.get(match.homeTeamId);
    const away = rows.get(match.awayTeamId);
    if (!home || !away) continue;

    home.played++;
    away.played++;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.won++; home.points += 3; away.lost++;
    } else if (match.homeScore < match.awayScore) {
      away.won++; away.points += 3; home.lost++;
    } else {
      home.drawn++; away.drawn++; home.points++; away.points++;
    }

    home.goalDiff = home.goalsFor - home.goalsAgainst;
    away.goalDiff = away.goalsFor - away.goalsAgainst;
  }

  return Array.from(rows.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
  });
}

export function computeScorerStats(matches: Match[]): PlayerStat[] {
  const map = new Map<string, PlayerStat>();
  for (const match of matches) {
    if (!match.played) continue;
    for (const scorer of match.scorers) {
      const key = `${scorer.playerName}__${scorer.teamId}`;
      const ex = map.get(key);
      if (ex) ex.count += scorer.count;
      else map.set(key, { playerName: scorer.playerName, teamId: scorer.teamId, count: scorer.count });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function computeAssisterStats(matches: Match[]): PlayerStat[] {
  const map = new Map<string, PlayerStat>();
  for (const match of matches) {
    if (!match.played) continue;
    for (const assister of match.assisters) {
      const key = `${assister.playerName}__${assister.teamId}`;
      const ex = map.get(key);
      if (ex) ex.count += assister.count;
      else map.set(key, { playerName: assister.playerName, teamId: assister.teamId, count: assister.count });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function computeDefenseStats(teams: Team[], matches: Match[]): { teamId: string; goalsAgainst: number; played: number }[] {
  const map = new Map<string, { goalsAgainst: number; played: number }>();
  for (const team of teams) map.set(team.id, { goalsAgainst: 0, played: 0 });

  for (const match of matches) {
    if (!match.played || match.homeScore === null || match.awayScore === null) continue;
    const h = map.get(match.homeTeamId);
    const a = map.get(match.awayTeamId);
    if (h) { h.goalsAgainst += match.awayScore; h.played++; }
    if (a) { a.goalsAgainst += match.homeScore; a.played++; }
  }

  return Array.from(map.entries())
    .map(([teamId, s]) => ({ teamId, ...s }))
    .filter(s => s.played > 0)
    .sort((a, b) => a.goalsAgainst - b.goalsAgainst);
}

export function getMatchLabel(match: Match): string {
  if (match.phase === 'group') return `G${match.group} · J${match.round}`;
  const labels: Record<string, string> = {
    sf1: 'Demi-finale 1',
    sf2: 'Demi-finale 2',
    third_place: '3ème Place',
    grand_final: 'Grande Finale',
  };
  return labels[match.id] || match.phase;
}

export function getMatchTime(match: Match): string | null {
  if (match.phase !== 'group') return null;
  const total = 13 * 60 + 30 + (match.order - 1) * 15;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
