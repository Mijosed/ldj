'use client';

import { TournamentHook } from '@/lib/useTournament';
import TeamLogo from '@/components/TeamLogo';
import { computeStandings } from '@/lib/utils';
import { Group } from '@/lib/types';

function GroupTable({ group, state }: { group: Group; state: TournamentHook['state'] }) {
  const { teams, matches } = state;
  const rows = computeStandings(teams, matches, group);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
          <span className="text-[11px] font-bold text-black">{group}</span>
        </div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Groupe {group}</h2>
      </div>

      <div className="bg-[#161616] border border-[#222] rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-center px-3 py-2 border-b border-[#222] text-[10px] font-semibold text-gray-600 uppercase">
          <span className="w-6 text-center">#</span>
          <span className="flex-1 ml-2">Équipe</span>
          <span className="w-6 text-center">J</span>
          <span className="w-6 text-center">G</span>
          <span className="w-6 text-center">N</span>
          <span className="w-6 text-center">P</span>
          <span className="w-8 text-center">Diff</span>
          <span className="w-8 text-center font-bold text-white">Pts</span>
        </div>

        {rows.map((row, idx) => {
          const team = teams.find(t => t.id === row.teamId);
          if (!team) return null;
          const isTop2 = idx < 2;

          return (
            <div
              key={row.teamId}
              className={`flex items-center px-3 py-2.5 border-b border-[#1a1a1a] last:border-0 ${
                isTop2 ? 'bg-[#1a1f1a]' : ''
              }`}
            >
              <span className={`w-6 text-center text-sm font-bold ${isTop2 ? 'text-green-400' : 'text-gray-600'}`}>
                {idx + 1}
              </span>
              <div className="flex items-center gap-2 flex-1 ml-2 min-w-0">
                <TeamLogo team={team} size={24} />
                <span className="text-sm font-medium truncate">{team.name}</span>
              </div>
              <span className="w-6 text-center text-sm text-gray-400">{row.played}</span>
              <span className="w-6 text-center text-sm text-gray-400">{row.won}</span>
              <span className="w-6 text-center text-sm text-gray-400">{row.drawn}</span>
              <span className="w-6 text-center text-sm text-gray-400">{row.lost}</span>
              <span className={`w-8 text-center text-sm ${row.goalDiff > 0 ? 'text-green-400' : row.goalDiff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {row.goalDiff > 0 ? '+' : ''}{row.goalDiff}
              </span>
              <span className="w-8 text-center text-sm font-bold text-white">{row.points}</span>
            </div>
          );
        })}

        {rows.length === 0 && (
          <div className="px-3 py-6 text-center text-gray-600 text-sm">Aucun résultat</div>
        )}
      </div>

      <p className="text-[10px] text-gray-700 mt-1.5 ml-1">Les 2 premiers se qualifient</p>
    </section>
  );
}

export default function StandingsView({ state, ...rest }: TournamentHook) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-4 pt-6 pb-4 bg-[#111] border-b border-[#1e1e1e]">
        <h1 className="text-xl font-bold">Classement</h1>
      </div>
      <div className="px-4 py-5 space-y-6">
        <GroupTable group="A" state={state} />
        <GroupTable group="B" state={state} />
      </div>
    </div>
  );
}
