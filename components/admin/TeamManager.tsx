'use client';

import { useState } from 'react';
import { TournamentHook } from '@/lib/useTournament';
import TeamLogo from '@/components/TeamLogo';
import { uid } from '@/lib/utils';

export default function TeamManager({ state, updateTeam, addPlayer, removePlayer }: TournamentHook) {
  const { teams, players } = state;
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<{ [key: string]: string }>({});
  const [newPlayer, setNewPlayer] = useState<{ name: string; number: string }>({ name: '', number: '' });

  const handleNameChange = (teamId: string, value: string) => {
    setEditingName(prev => ({ ...prev, [teamId]: value }));
  };

  const saveName = (teamId: string) => {
    const name = editingName[teamId]?.trim();
    if (name) {
      updateTeam(teamId, { name });
      setEditingName(prev => { const n = { ...prev }; delete n[teamId]; return n; });
    }
  };

  const handleAddPlayer = (teamId: string) => {
    if (!newPlayer.name.trim()) return;
    addPlayer({
      id: uid(),
      name: newPlayer.name.trim(),
      number: parseInt(newPlayer.number) || 0,
      teamId,
    });
    setNewPlayer({ name: '', number: '' });
  };

  const sortedTeams = [...teams].sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));

  return (
    <div className="space-y-2">
      {sortedTeams.map(team => {
        const teamPlayers = players.filter(p => p.teamId === team.id).sort((a, b) => a.number - b.number);
        const isExpanded = expandedTeam === team.id;
        const currentName = editingName[team.id] ?? team.name;

        return (
          <div key={team.id} className="bg-[#161616] border border-[#222] rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
              className="w-full flex items-center gap-3 p-3 active:opacity-70"
            >
              <TeamLogo team={team} size={36} />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold truncate">{team.name}</p>
                <p className="text-[11px] text-gray-500">Groupe {team.group} · {teamPlayers.length} joueur{teamPlayers.length !== 1 ? 's' : ''}</p>
              </div>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"
                className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isExpanded && (
              <div className="px-3 pb-3 border-t border-[#1e1e1e] pt-3 space-y-4">
                {/* Edit team name */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                    Nom de l&apos;équipe
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={currentName}
                      onChange={e => handleNameChange(team.id, e.target.value)}
                      onBlur={() => saveName(team.id)}
                      onKeyDown={e => e.key === 'Enter' && saveName(team.id)}
                      className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#555]"
                      placeholder="Nom de l'équipe"
                    />
                    <button
                      onClick={() => saveName(team.id)}
                      className="px-3 py-2 bg-white text-black text-xs font-bold rounded-lg active:opacity-70"
                    >
                      OK
                    </button>
                  </div>
                </div>

                {/* Players list */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Joueurs ({teamPlayers.length})
                  </label>
                  <div className="space-y-1.5 mb-3">
                    {teamPlayers.map(player => (
                      <div key={player.id} className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-600 w-6 text-center font-mono">#{player.number}</span>
                        <span className="text-sm flex-1">{player.name}</span>
                        <button
                          onClick={() => removePlayer(player.id)}
                          className="text-gray-600 active:text-red-400 p-1"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {teamPlayers.length === 0 && (
                      <p className="text-xs text-gray-600 text-center py-2">Aucun joueur</p>
                    )}
                  </div>

                  {/* Add player */}
                  <div className="flex gap-2">
                    <input
                      value={newPlayer.number}
                      onChange={e => setNewPlayer(p => ({ ...p, number: e.target.value }))}
                      className="w-14 bg-[#1a1a1a] border border-[#333] rounded-lg px-2 py-2 text-sm text-white text-center focus:outline-none focus:border-[#555]"
                      placeholder="#"
                      type="number"
                      min="0"
                      max="99"
                    />
                    <input
                      value={newPlayer.name}
                      onChange={e => setNewPlayer(p => ({ ...p, name: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAddPlayer(team.id)}
                      className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#555]"
                      placeholder="Nom du joueur"
                    />
                    <button
                      onClick={() => handleAddPlayer(team.id)}
                      className="px-3 py-2 bg-white text-black text-xs font-bold rounded-lg active:opacity-70"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
