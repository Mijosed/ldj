'use client';

import { useState } from 'react';
import { TournamentHook } from '@/lib/useTournament';
import TeamLogo from '@/components/TeamLogo';
import { Match, Group } from '@/lib/types';
import { getMatchLabel, getMatchTime } from '@/lib/utils';

type MainTab = 'poules' | 'finale';
type GroupFilter = 'all' | Group;

function TBDSlot() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-8 h-8 rounded-full bg-[#222] border border-[#333] flex items-center justify-center shrink-0">
        <span className="text-[8px] text-gray-600 font-bold">?</span>
      </div>
      <span className="text-sm font-medium text-gray-600">À qualifier</span>
    </div>
  );
}

function ManOfMatch({ name, teamName }: { name: string; teamName?: string }) {
  return (
    <div className="mt-2 pt-2 border-t border-[#1e1e1e] flex items-center gap-2">
      <span className="text-sm">🏅</span>
      <div className="min-w-0">
        <span className="text-xs font-semibold text-amber-400">{name}</span>
        {teamName && <span className="text-[10px] text-gray-600 ml-1">({teamName})</span>}
      </div>
    </div>
  );
}

function MatchCard({ match, teams }: { match: Match; teams: TournamentHook['state']['teams'] }) {
  const home = teams.find(t => t.id === match.homeTeamId);
  const away = teams.find(t => t.id === match.awayTeamId);
  const homeWon = match.played && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWon = match.played && (match.awayScore ?? 0) > (match.homeScore ?? 0);
  const momTeam = teams.find(t => t.id === match.manOfMatchTeamId);
  const time = getMatchTime(match);

  return (
    <div className="bg-[#161616] border border-[#222] rounded-xl p-3">
      {time && (
        <p className="text-[10px] font-bold text-gray-600 mb-2">
          🕐 {time} {match.played && <span className="text-green-600 font-normal">— Terminé</span>}
        </p>
      )}
      <div className="flex items-center gap-2">
        {/* Home */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {home ? <TeamLogo team={home} size={32} /> : <TBDSlot />}
          {home && <span className={`text-sm font-semibold truncate ${homeWon ? 'text-white' : 'text-gray-400'}`}>{home.name}</span>}
        </div>

        {/* Score */}
        <div className="flex items-center gap-1.5 shrink-0">
          {match.played ? (
            <>
              <span className={`text-xl font-bold w-6 text-center ${homeWon ? 'text-white' : 'text-gray-500'}`}>{match.homeScore}</span>
              <span className="text-gray-600 text-sm">-</span>
              <span className={`text-xl font-bold w-6 text-center ${awayWon ? 'text-white' : 'text-gray-500'}`}>{match.awayScore}</span>
            </>
          ) : (
            <span className="text-gray-600 text-sm font-medium px-2">vs</span>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
          {away ? (
            <>
              <span className={`text-sm font-semibold truncate text-right ${awayWon ? 'text-white' : 'text-gray-400'}`}>{away.name}</span>
              <TeamLogo team={away} size={32} />
            </>
          ) : (
            <div className="flex items-center gap-1.5 flex-row-reverse">
              <TBDSlot />
            </div>
          )}
        </div>
      </div>

      {/* Scorers / assisters */}
      {match.played && (match.scorers.length > 0 || match.assisters.length > 0) && (
        <div className="mt-2 pt-2 border-t border-[#1e1e1e] space-y-1">
          {match.scorers.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {match.scorers.map(s => (
                <span key={s.id} className="text-[11px] text-gray-500">⚽ {s.playerName}{s.count > 1 ? ` (${s.count})` : ''}</span>
              ))}
            </div>
          )}
          {match.assisters.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {match.assisters.map(a => (
                <span key={a.id} className="text-[11px] text-gray-500">🎯 {a.playerName}{a.count > 1 ? ` (${a.count})` : ''}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Man of the match */}
      {match.manOfMatch && <ManOfMatch name={match.manOfMatch} teamName={momTeam?.name} />}
    </div>
  );
}

function PoulesView({ state }: { state: TournamentHook['state'] }) {
  const { teams, matches } = state;
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');

  const groupMatches = [...matches]
    .filter(m => m.phase === 'group')
    .filter(m => groupFilter === 'all' || m.group === groupFilter)
    .sort((a, b) => a.order - b.order);

  // Group by round+group label
  const sections: { label: string; items: typeof groupMatches }[] = [];
  for (const match of groupMatches) {
    const label = `Journée ${match.round} — Groupe ${match.group}`;
    const existing = sections.find(s => s.label === label);
    if (existing) existing.items.push(match);
    else sections.push({ label, items: [match] });
  }

  return (
    <div className="space-y-5">
      {/* Group filter */}
      <div className="flex gap-2">
        {(['all', 'A', 'B'] as GroupFilter[]).map(f => (
          <button key={f} onClick={() => setGroupFilter(f)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold ${groupFilter === f ? 'bg-white text-black' : 'bg-[#1e1e1e] text-gray-400'}`}>
            {f === 'all' ? 'Tous' : `Groupe ${f}`}
          </button>
        ))}
      </div>

      {sections.map(section => (
        <section key={section.label}>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{section.label}</h2>
          <div className="space-y-2">
            {section.items.map(match => <MatchCard key={match.id} match={match} teams={teams} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function FinaleView({ state }: { state: TournamentHook['state'] }) {
  const { teams, matches } = state;
  const finalMatches = [...matches].filter(m => m.phase !== 'group').sort((a, b) => a.order - b.order);

  const semis = finalMatches.filter(m => m.phase === 'semifinal');
  const thirdPlace = finalMatches.find(m => m.phase === 'third_place');
  const grand = finalMatches.find(m => m.phase === 'final');

  const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex-1 h-px bg-[#222]" />
      <div className="text-center">
        <p className="text-xs font-bold text-white uppercase tracking-widest">{title}</p>
        {subtitle && <p className="text-[10px] text-gray-600">{subtitle}</p>}
      </div>
      <div className="flex-1 h-px bg-[#222]" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-3 text-center">
        <p className="text-xs text-gray-500">Phase finale — Jour 2</p>
        <p className="text-[11px] text-gray-700 mt-1">Top 2 de chaque groupe se qualifient</p>
      </div>

      {/* Demi-finales */}
      <section>
        <SectionHeader title="Demi-finales" subtitle="Jour 2 — Matin" />
        <div className="space-y-2">
          {semis.map((match, i) => (
            <div key={match.id}>
              <p className="text-[10px] font-semibold text-gray-600 mb-1.5 ml-1">Demi-finale {i + 1}</p>
              <MatchCard match={match} teams={teams} />
            </div>
          ))}
        </div>
      </section>

      {/* Petite finale */}
      {thirdPlace && (
        <section>
          <SectionHeader title="3ème Place" subtitle="Petite finale" />
          <MatchCard match={thirdPlace} teams={teams} />
        </section>
      )}

      {/* Grande finale */}
      {grand && (
        <section>
          <SectionHeader title="Grande Finale" subtitle="🏆 Match pour le titre" />
          <div className="border border-[#333] rounded-xl overflow-hidden">
            <div className="bg-gradient-to-b from-[#1e1e1e] to-[#161616] p-1">
              <MatchCard match={grand} teams={teams} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function MatchesView({ state }: TournamentHook) {
  const [mainTab, setMainTab] = useState<MainTab>('poules');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 bg-[#111] border-b border-[#1e1e1e]">
        <h1 className="text-xl font-bold mb-4">Matchs</h1>
        <div className="flex gap-2">
          <button onClick={() => setMainTab('poules')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mainTab === 'poules' ? 'bg-white text-black' : 'bg-[#1e1e1e] text-gray-400'}`}>
            Poules · Jour 1
          </button>
          <button onClick={() => setMainTab('finale')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mainTab === 'finale' ? 'bg-white text-black' : 'bg-[#1e1e1e] text-gray-400'}`}>
            Finale · Jour 2
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {mainTab === 'poules' ? <PoulesView state={state} /> : <FinaleView state={state} />}
      </div>
    </div>
  );
}
