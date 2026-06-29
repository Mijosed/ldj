'use client';

import { TournamentHook } from '@/lib/useTournament';
import TeamLogo from '@/components/TeamLogo';
import { Group } from '@/lib/types';

export default function GroupManager({ state, updateTeam }: TournamentHook) {
  const { teams } = state;

  const groupA = teams.filter(t => t.group === 'A');
  const groupB = teams.filter(t => t.group === 'B');

  const toggle = (teamId: string, currentGroup: Group) => {
    updateTeam(teamId, { group: currentGroup === 'A' ? 'B' : 'A' });
  };

  const GroupColumn = ({ group, list }: { group: Group; list: typeof teams }) => (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
          <span className="text-[11px] font-bold text-black">{group}</span>
        </div>
        <span className="text-sm font-semibold text-white">Groupe {group}</span>
        <span className="text-xs text-gray-500">({list.length}/6)</span>
      </div>
      <div className="space-y-2">
        {list.map(team => (
          <div key={team.id} className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-3 flex items-center gap-2">
            <TeamLogo team={team} size={28} />
            <span className="text-xs font-medium flex-1 truncate">{team.name}</span>
            <button
              onClick={() => toggle(team.id, group)}
              className="text-[10px] font-bold text-gray-500 bg-[#111] border border-[#333] px-2 py-1 rounded-lg active:opacity-60"
            >
              → {group === 'A' ? 'B' : 'A'}
            </button>
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-center py-4 text-gray-600 text-xs border border-dashed border-[#333] rounded-xl">
            Vide
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Appuyez sur la flèche pour déplacer une équipe dans l&apos;autre groupe.
      </p>
      {groupA.length !== 6 || groupB.length !== 6 ? (
        <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-xl p-3">
          <p className="text-xs text-yellow-500">
            Chaque groupe doit avoir exactement 6 équipes. Actuellement : A={groupA.length}, B={groupB.length}
          </p>
        </div>
      ) : null}
      <div className="flex gap-3">
        <GroupColumn group="A" list={groupA} />
        <GroupColumn group="B" list={groupB} />
      </div>
    </div>
  );
}
