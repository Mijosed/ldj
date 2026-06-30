'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TournamentHook } from '@/lib/useTournament';
import TeamLogo from '@/components/TeamLogo';
import { Group } from '@/lib/types';
import { regenerateGroupMatchesAction } from '@/app/actions';

export default function GroupManager({ state, updateTeam }: TournamentHook) {
  const { teams } = state;
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const groupA = teams.filter(t => t.group === 'A');
  const groupB = teams.filter(t => t.group === 'B');
  const isValid = groupA.length === 6 && groupB.length === 6;

  const toggle = (teamId: string, currentGroup: Group) => {
    updateTeam(teamId, { group: currentGroup === 'A' ? 'B' : 'A' });
  };

  const handleRegenerate = () => {
    startTransition(async () => {
      await regenerateGroupMatchesAction('A');
      router.refresh();
      setShowConfirm(false);
    });
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

      {!isValid && (
        <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-xl p-3">
          <p className="text-xs text-yellow-500">
            Chaque groupe doit avoir exactement 6 équipes. Actuellement : A={groupA.length}, B={groupB.length}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <GroupColumn group="A" list={groupA} />
        <GroupColumn group="B" list={groupB} />
      </div>

      {/* Regenerate matches */}
      {isValid && (
        <div className="border-t border-[#222] pt-4">
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-2.5 bg-white text-black text-sm font-bold rounded-xl active:opacity-70"
            >
              Appliquer les poules &amp; régénérer les matchs
            </button>
          ) : (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-white text-center">Confirmer ?</p>
              <p className="text-xs text-gray-500 text-center">
                Les 30 matchs de poule seront recréés selon les groupes actuels. Les scores existants seront perdus.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowConfirm(false)} disabled={isPending}
                  className="flex-1 py-2.5 border border-[#333] text-gray-400 text-sm font-semibold rounded-xl active:opacity-60">
                  Annuler
                </button>
                <button onClick={handleRegenerate} disabled={isPending}
                  className="flex-1 py-2.5 bg-white text-black text-sm font-bold rounded-xl active:opacity-70 disabled:opacity-40">
                  {isPending ? '...' : 'Confirmer'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
