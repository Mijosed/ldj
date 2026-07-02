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

// Migrates old 4-match final structure to new 8-match structure (adds QF round)
async function syncFinalMatches() {
  const qf1 = await prisma.match.findUnique({ where: { id: 'qf1' } });
  if (qf1) return; // already migrated

  await prisma.$transaction([
    // Add 4 quarterfinal matches
    prisma.match.createMany({
      data: [
        { id: 'qf1', homeTeamId: '', awayTeamId: '', homeScore: null, awayScore: null, played: false, scorers: [] as unknown as Prisma.InputJsonValue, assisters: [] as unknown as Prisma.InputJsonValue, group: 'F', round: 0, order: 31, phase: 'quarterfinal' },
        { id: 'qf2', homeTeamId: '', awayTeamId: '', homeScore: null, awayScore: null, played: false, scorers: [] as unknown as Prisma.InputJsonValue, assisters: [] as unknown as Prisma.InputJsonValue, group: 'F', round: 0, order: 32, phase: 'quarterfinal' },
        { id: 'qf3', homeTeamId: '', awayTeamId: '', homeScore: null, awayScore: null, played: false, scorers: [] as unknown as Prisma.InputJsonValue, assisters: [] as unknown as Prisma.InputJsonValue, group: 'F', round: 0, order: 33, phase: 'quarterfinal' },
        { id: 'qf4', homeTeamId: '', awayTeamId: '', homeScore: null, awayScore: null, played: false, scorers: [] as unknown as Prisma.InputJsonValue, assisters: [] as unknown as Prisma.InputJsonValue, group: 'F', round: 0, order: 34, phase: 'quarterfinal' },
      ],
    }),
    // Update semis and beyond to new orders
    prisma.match.update({ where: { id: 'sf1' }, data: { order: 35 } }),
    prisma.match.update({ where: { id: 'sf2' }, data: { order: 36 } }),
    prisma.match.update({ where: { id: 'third_place' }, data: { order: 37 } }),
    prisma.match.update({ where: { id: 'grand_final' }, data: { order: 38 } }),
  ]);
}

export async function loadState(): Promise<TournamentState> {
  await ensureSeeded();
  await syncFinalMatches();
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
