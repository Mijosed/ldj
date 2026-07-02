'use client';

import Image from 'next/image';
import { TournamentHook } from '@/lib/useTournament';
import TeamLogo from '@/components/TeamLogo';
import { getMatchLabel, getMatchTime } from '@/lib/utils';

export default function HomeView({ state }: TournamentHook) {
  const { teams, matches } = state;

  const playedMatches = matches.filter(m => m.played);
  const upcomingMatches = [...matches]
    .filter(m => !m.played)
    .sort((a, b) => a.order - b.order)
    .slice(0, 4);
  const recentMatches = [...playedMatches]
    .sort((a, b) => b.order - a.order)
    .slice(0, 4);

  const getTeam = (id: string) => teams.find(t => t.id === id);

  const groupPlayed = playedMatches.filter(m => m.phase === 'group').length;
  const finalPlayed = playedMatches.filter(m => m.phase !== 'group').length;
  const totalGroup = matches.filter(m => m.phase === 'group').length;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4 bg-[#111] border-b border-[#1e1e1e]">
        <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-[#333]">
          <Image src="/images/ldj.jpeg" alt="LDJ" fill className="object-cover" sizes="80px" />
        </div>
        <h1 className="text-2xl font-bold tracking-widest text-white">LDJ</h1>
        <p className="text-gray-500 text-sm mt-1">Tournoi de Football</p>

        {/* Day badges */}
        <div className="flex gap-2 mt-4">
          <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${groupPlayed === totalGroup ? 'bg-green-500' : groupPlayed > 0 ? 'bg-yellow-500 animate-pulse' : 'bg-[#444]'}`} />
            <span className="text-xs text-gray-400">Jour 1 — Poules</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${finalPlayed > 0 ? 'bg-yellow-500 animate-pulse' : 'bg-[#444]'}`} />
            <span className="text-xs text-gray-400">Jour 2 — Finale</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Équipes', value: teams.length },
            { label: 'Matchs joués', value: playedMatches.length },
            { label: 'Restants', value: matches.length - playedMatches.length },
          ].map(stat => (
            <div key={stat.label} className="bg-[#161616] border border-[#222] rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Prochains matchs */}
        {upcomingMatches.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Prochains matchs</h2>
            <div className="space-y-2">
              {upcomingMatches.map(match => {
                const home = getTeam(match.homeTeamId);
                const away = getTeam(match.awayTeamId);
                const label = getMatchLabel(match);
                const time = getMatchTime(match);
                return (
                  <div key={match.id} className="bg-[#161616] border border-[#222] rounded-xl p-3 flex items-center gap-3">
                    <div className="shrink-0 text-center">
                      <span className="text-[10px] font-bold text-gray-600 bg-[#1e1e1e] px-2 py-0.5 rounded block">{label}</span>
                      {time && <span className="text-[10px] font-bold text-gray-500 mt-0.5 block">🕐 {time}</span>}
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {home ? <><TeamLogo team={home} size={26} /><span className="text-sm font-medium truncate">{home.name}</span></> : <span className="text-sm text-gray-600">À qualifier</span>}
                      </div>
                      <span className="text-xs text-gray-500 font-bold shrink-0">vs</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        {away ? <><span className="text-sm font-medium truncate text-right">{away.name}</span><TeamLogo team={away} size={26} /></> : <span className="text-sm text-gray-600">À qualifier</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Derniers résultats */}
        {recentMatches.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Derniers résultats</h2>
            <div className="space-y-2">
              {recentMatches.map(match => {
                const home = getTeam(match.homeTeamId);
                const away = getTeam(match.awayTeamId);
                const label = getMatchLabel(match);
                const momTeam = getTeam(match.manOfMatchTeamId ?? '');
                return (
                  <div key={match.id} className="bg-[#161616] border border-[#222] rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-gray-600 bg-[#1e1e1e] px-2 py-0.5 rounded shrink-0">{label}</span>
                      <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {home && <><TeamLogo team={home} size={26} /><span className="text-sm font-medium truncate">{home.name}</span></>}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-lg font-bold ${(match.homeScore ?? 0) > (match.awayScore ?? 0) ? 'text-white' : 'text-gray-500'}`}>{match.homeScore}</span>
                          <span className="text-gray-600 text-sm">-</span>
                          <span className={`text-lg font-bold ${(match.awayScore ?? 0) > (match.homeScore ?? 0) ? 'text-white' : 'text-gray-500'}`}>{match.awayScore}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                          {away && <><span className="text-sm font-medium truncate text-right">{away.name}</span><TeamLogo team={away} size={26} /></>}
                        </div>
                      </div>
                    </div>
                    {match.scorers.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#1e1e1e] flex flex-wrap gap-x-2 gap-y-0.5">
                        {match.scorers.map(s => (
                          <span key={s.id} className="text-[10px] text-gray-500">⚽ {s.playerName}{s.count > 1 ? ` x${s.count}` : ''}</span>
                        ))}
                      </div>
                    )}
                    {match.manOfMatch && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-xs">🏅</span>
                        <span className="text-xs font-semibold text-amber-400">{match.manOfMatch}</span>
                        {momTeam && <span className="text-[10px] text-gray-600">({momTeam.name})</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {playedMatches.length === 0 && upcomingMatches.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p className="text-4xl mb-3">⚽</p>
            <p className="text-sm">Le tournoi n&apos;a pas encore commencé</p>
          </div>
        )}
      </div>
    </div>
  );
}
