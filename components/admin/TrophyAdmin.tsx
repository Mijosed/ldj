'use client';

import { useState } from 'react';
import { TournamentHook } from '@/lib/useTournament';
import { TournamentAwards, TrophyPlayer } from '@/lib/types';

const TOTY_SLOTS = [
  { key: 'gk', label: 'Gardien' },
  { key: 'f1', label: 'Joueur 1' },
  { key: 'f2', label: 'Joueur 2' },
  { key: 'f3', label: 'Joueur 3' },
  { key: 'f4', label: 'Joueur 4' },
  { key: 'f5', label: 'Joueur 5' },
  { key: 'f6', label: 'Joueur 6' },
  { key: 'f7', label: 'Joueur 7' },
];

interface AwardPickerProps {
  label: string;
  icon: string;
  value: TrophyPlayer | null;
  teams: TournamentHook['state']['teams'];
  players: TournamentHook['state']['players'];
  onChange: (v: TrophyPlayer | null) => void;
}

function AwardPicker({ label, icon, value, teams, players, onChange }: AwardPickerProps) {
  const [teamId, setTeamId] = useState(value?.teamId ?? '');
  const [selected, setSelected] = useState(value?.playerName ?? '');
  const [custom, setCustom] = useState('');

  const teamPlayers = players.filter(p => p.teamId === teamId).sort((a, b) => a.name.localeCompare(b.name));
  const isOther = selected === '__other__';
  const resolvedName = isOther ? custom : selected;

  const handleTeam = (id: string) => { setTeamId(id); setSelected(''); setCustom(''); };

  const save = () => {
    if (!resolvedName.trim() || !teamId) { onChange(null); return; }
    onChange({ playerName: resolvedName.trim(), teamId });
  };

  const clear = () => {
    setTeamId(''); setSelected(''); setCustom('');
    onChange(null);
  };

  return (
    <div className="bg-[#161616] border border-[#222] rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-white">{icon} {label}</p>
        {value && (
          <button onClick={clear} className="text-[10px] text-gray-600 active:text-red-400">Effacer</button>
        )}
      </div>

      {value ? (
        <div className="flex items-center gap-2 bg-[#1e1e1e] rounded-lg px-3 py-2">
          <span className="text-sm font-semibold text-white flex-1">{value.playerName}</span>
          <span className="text-xs text-gray-500">{teams.find(t => t.id === value.teamId)?.name}</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          <select value={teamId} onChange={e => handleTeam(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none">
            <option value="">Équipe...</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={selected} onChange={e => setSelected(e.target.value)} disabled={!teamId}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none disabled:opacity-40">
            <option value="">Joueur...</option>
            {teamPlayers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            <option value="__other__">Autre (saisie libre)</option>
          </select>
          {isOther && (
            <input value={custom} onChange={e => setCustom(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#444] rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none"
              placeholder="Nom du joueur" />
          )}
          <button onClick={save} disabled={!resolvedName.trim() || !teamId}
            className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg active:opacity-70 disabled:opacity-30">
            Valider
          </button>
        </div>
      )}
    </div>
  );
}

export default function TrophyAdmin({ state, updateAwards }: TournamentHook) {
  const { teams, players, awards } = state;

  const setAward = (key: keyof Omit<TournamentAwards, 'toty'>, value: TrophyPlayer | null) => {
    updateAwards({ ...awards, [key]: value });
  };

  const setTotySlot = (index: number, value: TrophyPlayer | null) => {
    const next = [...awards.toty];
    if (value) next[index] = value;
    else next.splice(index, 1);
    // Keep array compact but indexed by slot
    const filled = TOTY_SLOTS.map((_, i) => next[i] ?? null).filter(Boolean) as TrophyPlayer[];
    updateAwards({ ...awards, toty: filled });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Les récompenses auto (buteur, passeur) sont calculées depuis les matchs.</p>

      <AwardPicker label="Ballon d'or" icon="🏅" value={awards.ballonDor}
        teams={teams} players={players} onChange={v => setAward('ballonDor', v)} />
      <AwardPicker label="Meilleur Gardien" icon="🧤" value={awards.meilleureGardien}
        teams={teams} players={players} onChange={v => setAward('meilleureGardien', v)} />
      <AwardPicker label="Golden Boy" icon="⭐" value={awards.goldenBoy}
        teams={teams} players={players} onChange={v => setAward('goldenBoy', v)} />
      <AwardPicker label="Prix Puskás" icon="👟" value={awards.puskas}
        teams={teams} players={players} onChange={v => setAward('puskas', v)} />

      {/* TOTY */}
      <div className="border-t border-[#222] pt-4">
        <p className="text-xs font-bold text-white mb-3">🌟 TOTY — Équipe du Tournoi</p>
        <div className="space-y-2">
          {TOTY_SLOTS.map((slot, i) => (
            <AwardPicker key={slot.key} label={slot.label} icon={i === 0 ? '🧤' : '⚽'}
              value={awards.toty[i] ?? null}
              teams={teams} players={players}
              onChange={v => setTotySlot(i, v)} />
          ))}
        </div>
      </div>
    </div>
  );
}
