'use server';

import { prisma } from '@/lib/db';
import { resetMatchScores } from '@/lib/prismaUtils';
import { Prisma } from '@prisma/client';
import { Team, Player, Match, Group } from '@/lib/types';
import { generateGroupMatches } from '@/lib/initialData';

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
  await resetMatchScores();
}

export async function regenerateGroupMatchesAction(startGroup: Group = 'A') {
  const teams = await prisma.team.findMany();
  const groupATeams = teams.filter(t => t.group === 'A').map(t => t.id);
  const groupBTeams = teams.filter(t => t.group === 'B').map(t => t.id);

  if (groupATeams.length !== 6 || groupBTeams.length !== 6) {
    throw new Error('Chaque poule doit avoir exactement 6 équipes');
  }

  const newMatches = generateGroupMatches(groupATeams, groupBTeams, startGroup);
  const emptyJson = [] as unknown as Prisma.InputJsonValue;

  await prisma.match.deleteMany({ where: { phase: 'group' } });
  await prisma.match.createMany({
    data: newMatches.map(m => ({
      id: m.id,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      homeScore: null,
      awayScore: null,
      played: false,
      scorers: emptyJson,
      assisters: emptyJson,
      group: m.group,
      round: m.round,
      order: m.order,
      phase: m.phase,
    })),
  });
}

export async function reorderGroupMatchesAction(startGroup: Group, openingMatchId?: string) {
  const matches = await prisma.match.findMany({ where: { phase: 'group' } });

  // Group by (round, group), sort within each bucket by current order
  const buckets = new Map<string, typeof matches>();
  for (const m of matches) {
    const key = `${m.round}_${m.group}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(m);
  }
  Array.from(buckets.values()).forEach(bucket => bucket.sort((a, b) => a.order - b.order));

  let order = 1;
  const updates: { id: string; order: number }[] = [];

  for (let round = 1; round <= 5; round++) {
    const aMatches = [...(buckets.get(`${round}_A`) ?? [])];
    const bMatches = [...(buckets.get(`${round}_B`) ?? [])];
    const first = startGroup === 'A' ? aMatches : bMatches;
    const second = startGroup === 'A' ? bMatches : aMatches;

    // Round 1: move chosen opening match to front of the starting group
    if (round === 1 && openingMatchId) {
      const idx = first.findIndex(m => m.id === openingMatchId);
      if (idx > 0) {
        const [opening] = first.splice(idx, 1);
        first.unshift(opening);
      }
    }

    for (let i = 0; i < 3; i++) {
      if (first[i]) updates.push({ id: first[i].id, order: order++ });
      if (second[i]) updates.push({ id: second[i].id, order: order++ });
    }
  }

  await prisma.$transaction(updates.map(u =>
    prisma.match.update({ where: { id: u.id }, data: { order: u.order } })
  ));
}
