import type { Team as DbTeam, Player as DbPlayer, Match as DbMatch } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { TournamentState, Team, Player, Match, Group, MatchGroup, MatchPhase, GoalEvent, TournamentAwards, emptyAwards } from './types';
import { prisma } from './db';
import { initialState } from './initialData';

function toTeam(t: DbTeam): Team {
  return { id: t.id, name: t.name, logo: t.logo, group: t.group as Group };
}

function toPlayer(p: DbPlayer): Player {
  return { id: p.id, name: p.name, number: p.number, teamId: p.teamId };
}

function toMatch(m: DbMatch): Match {
  return {
    id: m.id,
    homeTeamId: m.homeTeamId,
    awayTeamId: m.awayTeamId,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    played: m.played,
    scorers: m.scorers as unknown as GoalEvent[],
    assisters: m.assisters as unknown as GoalEvent[],
    group: m.group as MatchGroup,
    round: m.round,
    order: m.order,
    phase: m.phase as MatchPhase,
    manOfMatch: m.manOfMatch ?? undefined,
    manOfMatchTeamId: m.manOfMatchTeamId ?? undefined,
  };
}

function matchCreateData(m: Match) {
  return {
    id: m.id,
    homeTeamId: m.homeTeamId,
    awayTeamId: m.awayTeamId,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    played: m.played,
    scorers: m.scorers as unknown as Prisma.InputJsonValue,
    assisters: m.assisters as unknown as Prisma.InputJsonValue,
    group: m.group,
    round: m.round,
    order: m.order,
    phase: m.phase,
  };
}

export async function ensureSeeded() {
  const count = await prisma.team.count();
  if (count > 0) return;
  await prisma.team.createMany({ data: initialState.teams });
  await prisma.match.createMany({ data: initialState.matches.map(matchCreateData) });
}

export async function loadState(): Promise<TournamentState> {
  await ensureSeeded();
  const [teams, players, matches, config] = await Promise.all([
    prisma.team.findMany(),
    prisma.player.findMany(),
    prisma.match.findMany(),
    prisma.config.findUnique({ where: { id: 'singleton' } }),
  ]);
  return {
    teams: teams.map(toTeam),
    players: players.map(toPlayer),
    matches: matches.map(toMatch).sort((a, b) => a.order - b.order),
    awards: (config?.awards as unknown as TournamentAwards) ?? emptyAwards,
  };
}

export async function resetMatchScores() {
  const emptyJson = [] as unknown as Prisma.InputJsonValue;
  await prisma.$transaction([
    // Reset group matches: keep teams & order, wipe scores/events
    prisma.match.updateMany({
      where: { phase: 'group' },
      data: {
        homeScore: null, awayScore: null, played: false,
        scorers: emptyJson, assisters: emptyJson,
        manOfMatch: null, manOfMatchTeamId: null,
      },
    }),
    // Reset final matches: also clear the qualified teams (back to TBD)
    prisma.match.updateMany({
      where: { phase: { not: 'group' } },
      data: {
        homeTeamId: '', awayTeamId: '',
        homeScore: null, awayScore: null, played: false,
        scorers: emptyJson, assisters: emptyJson,
        manOfMatch: null, manOfMatchTeamId: null,
      },
    }),
  ]);
}
