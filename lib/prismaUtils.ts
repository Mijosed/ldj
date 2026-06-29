import type { Team as DbTeam, Player as DbPlayer, Match as DbMatch } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { TournamentState, Team, Player, Match, Group, MatchGroup, MatchPhase, GoalEvent } from './types';
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
  const [teams, players, matches] = await Promise.all([
    prisma.team.findMany(),
    prisma.player.findMany(),
    prisma.match.findMany(),
  ]);
  return {
    teams: teams.map(toTeam),
    players: players.map(toPlayer),
    matches: matches.map(toMatch).sort((a, b) => a.order - b.order),
  };
}

export async function reseedTournament() {
  await prisma.player.deleteMany();
  await prisma.match.deleteMany();
  await Promise.all(
    initialState.teams.map(t =>
      prisma.team.upsert({
        where: { id: t.id },
        update: { name: t.name, logo: t.logo, group: t.group },
        create: t,
      })
    )
  );
  await prisma.match.createMany({ data: initialState.matches.map(matchCreateData) });
}
