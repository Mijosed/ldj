'use server';

import { prisma } from '@/lib/db';
import { reseedTournament } from '@/lib/prismaUtils';
import { Team, Player, Match } from '@/lib/types';

export async function updateTeamAction(teamId: string, updates: Partial<Team>) {
  await prisma.team.update({ where: { id: teamId }, data: updates });
}

export async function addPlayerAction(player: Player) {
  await prisma.player.create({ data: player });
}

export async function updatePlayerAction(playerId: string, updates: Partial<Player>) {
  await prisma.player.update({ where: { id: playerId }, data: updates });
}

export async function removePlayerAction(playerId: string) {
  await prisma.player.delete({ where: { id: playerId } });
}

export async function updateMatchAction(matchId: string, updates: Partial<Match>) {
  const data: Record<string, unknown> = {};
  if ('homeTeamId' in updates) data.homeTeamId = updates.homeTeamId;
  if ('awayTeamId' in updates) data.awayTeamId = updates.awayTeamId;
  if ('homeScore' in updates) data.homeScore = updates.homeScore;
  if ('awayScore' in updates) data.awayScore = updates.awayScore;
  if ('played' in updates) data.played = updates.played;
  if ('scorers' in updates) data.scorers = updates.scorers;
  if ('assisters' in updates) data.assisters = updates.assisters;
  if ('group' in updates) data.group = updates.group;
  if ('round' in updates) data.round = updates.round;
  if ('order' in updates) data.order = updates.order;
  if ('phase' in updates) data.phase = updates.phase;
  if ('manOfMatch' in updates) data.manOfMatch = updates.manOfMatch ?? null;
  if ('manOfMatchTeamId' in updates) data.manOfMatchTeamId = updates.manOfMatchTeamId ?? null;
  await prisma.match.update({ where: { id: matchId }, data });
}

export async function swapMatchOrderAction(matchId1: string, matchId2: string) {
  const [m1, m2] = await Promise.all([
    prisma.match.findUnique({ where: { id: matchId1 } }),
    prisma.match.findUnique({ where: { id: matchId2 } }),
  ]);
  if (!m1 || !m2) return;
  await prisma.$transaction([
    prisma.match.update({ where: { id: matchId1 }, data: { order: m2.order } }),
    prisma.match.update({ where: { id: matchId2 }, data: { order: m1.order } }),
  ]);
}

export async function resetTournamentAction() {
  await reseedTournament();
}
