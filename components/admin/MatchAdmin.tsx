'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TournamentHook } from '@/lib/useTournament';
import TeamLogo from '@/components/TeamLogo';
import { Match, GoalEvent, Group } from '@/lib/types';
import { uid, getMatchLabel } from '@/lib/utils';
import { reorderGroupMatchesAction } from '@/app/actions';

type EventType = 'scorer' | 'assister';

interface EventEditorProps {
  type: EventType;
  events: GoalEvent[];
  homeTeamId: string;
  awayTeamId: string;
  teams: TournamentHook['state']['teams'];
  players: TournamentHook['state']['players'];
  onChange: (events: GoalEvent[]) => void;
}

function EventEditor({ type, events, homeTeamId, awayTeamId, teams, players, onChange }: EventEditorProps) {
  const [newSelected, setNewSelected] = useState('');
  const [newCustom, setNewCustom] = useState('');
  const [newTeam, setNewTeam] = useState(homeTeamId || '');
  const [newCount, setNewCount] = useState('1');

  const homeTeam = teams.find(t => t.id === homeTeamId);
  const awayTeam = teams.find(t => t.id === awayTeamId);
  const teamPlayers = players.filter(p => p.teamId === newTeam).sort((a, b) => a.name.localeCompare(b.name));
  const isOther = newSelected === '__other__';
  const resolvedName = isOther ? newCustom : newSelected;

  const add = () => {
    if (!resolvedName.trim() || !newTeam) return;
    onChange([...events, { id: uid(), playerName: resolvedName.trim(), teamId: newTeam, count: parseInt(newCount) || 1 }]);
    setNewSelected('');
    setNewCustom('');
    setNewCount('1');
  };

  const handleTeamChange = (teamId: string) => {
    setNewTeam(teamId);
    setNewSelected('');
    setNewCustom('');
  };

  const remove = (id: string) => onChange(events.filter(e => e.id !== id));
  const icon = type === 'scorer' ? '⚽' : '🎯';
  const label = type === 'scorer' ? 'Buteurs' : 'Passeurs';

  return (
    <div>
      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
        {icon} {label}
      </label>
      <div className="space-y-1.5 mb-2">
        {events.map(ev => {
          const team = teams.find(t => t.id === ev.teamId);
          return (
            <div key={ev.id} className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-2.5 py-1.5">
              <span className="text-sm flex-1">{ev.playerName}</span>
              <span className="text-xs text-gray-500">{team?.name}</span>
              {ev.count > 1 && <span className="text-xs font-bold text-white">x{ev.count}</span>}
              <button onClick={() => remove(ev.id)} className="text-gray-600 active:text-red-400 p-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5">
        <select value={newTeam} onChange={e => handleTeamChange(e.target.value)} className="bg-[#1a1a1a] border border-[#333] rounded-lg px-2 py-2 text-xs text-white focus:outline-none w-24 shrink-0">
          {!homeTeam && !awayTeam && <option value="">Équipe</option>}
          {homeTeam && <option value={homeTeamId}>{homeTeam.name}</option>}
          {awayTeam && <option value={awayTeamId}>{awayTeam.name}</option>}
        </select>
        <div className="flex-1 flex flex-col gap-1">
          <select value={newSelected} onChange={e => setNewSelected(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none focus:border-[#555]">
            <option value="">Joueur...</option>
            {teamPlayers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            <option value="__other__">Autre (saisie libre)</option>
          </select>
          {isOther && (
            <input value={newCustom} onChange={e => setNewCustom(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
              className="w-full bg-[#1a1a1a] border border-[#444] rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none focus:border-[#555]"
              placeholder="Nom du joueur" autoFocus />
          )}
        </div>
        <input value={newCount} onChange={e => setNewCount(e.target.value)} type="number" min="1" max="10"
          className="w-10 bg-[#1a1a1a] border border-[#333] rounded-lg px-1 py-2 text-sm text-white text-center focus:outline-none" />
        <button onClick={add} className="px-3 py-2 bg-white text-black text-xs font-bold rounded-lg active:opacity-70 shrink-0">+</button>
      </div>
    </div>
  );
}

interface MatchCardProps {
  match: Match;
  teams: TournamentHook['state']['teams'];
  players: TournamentHook['state']['players'];
  updateMatch: TournamentHook['updateMatch'];
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function MatchCard({ match, teams, players, updateMatch, onMoveUp, onMoveDown, isFirst, isLast }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editHomeId, setEditHomeId] = useState(match.homeTeamId);
  const [editAwayId, setEditAwayId] = useState(match.awayTeamId);
  const [homeScore, setHomeScore] = useState(match.homeScore?.toString() ?? '');
  const [awayScore, setAwayScore] = useState(match.awayScore?.toString() ?? '');
  const [scorers, setScorers] = useState<GoalEvent[]>(match.scorers);
  const [assisters, setAssisters] = useState<GoalEvent[]>(match.assisters);
  const [momName, setMomName] = useState(match.manOfMatch ?? '');
  const [momTeam, setMomTeam] = useState(match.manOfMatchTeamId ?? '');
  const [momCustom, setMomCustom] = useState('');

  const isFinal = match.phase !== 'group';
  const home = teams.find(t => t.id === editHomeId);
  const away = teams.find(t => t.id === editAwayId);
  const momPlayers = players.filter(p => p.teamId === momTeam).sort((a, b) => a.name.localeCompare(b.name));
  const isMomOther = momName === '__other__';
  const resolvedMomName = isMomOther ? momCustom : momName;

  const save = () => {
    const hs = parseInt(homeScore);
    const as = parseInt(awayScore);
    const played = !isNaN(hs) && !isNaN(as) && editHomeId !== '' && editAwayId !== '';
    updateMatch(match.id, {
      homeTeamId: editHomeId,
      awayTeamId: editAwayId,
      homeScore: played ? hs : null,
      awayScore: played ? as : null,
      played,
      scorers,
      assisters,
      manOfMatch: resolvedMomName.trim() || undefined,
      manOfMatchTeamId: momTeam || undefined,
    });
    setExpanded(false);
  };

  const reset = () => {
    updateMatch(match.id, {
      homeScore: null, awayScore: null, played: false, scorers: [], assisters: [],
      manOfMatch: undefined, manOfMatchTeamId: undefined,
      ...(isFinal ? { homeTeamId: '', awayTeamId: '' } : {}),
    });
    setHomeScore(''); setAwayScore(''); setScorers([]); setAssisters([]);
    setMomName(''); setMomTeam(''); setMomCustom('');
    if (isFinal) { setEditHomeId(''); setEditAwayId(''); }
    setExpanded(false);
  };

  const label = getMatchLabel(match);

  return (
    <div className="bg-[#161616] border border-[#222] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-3">
        {/* Reorder buttons */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button onClick={onMoveUp} disabled={isFirst} className={`p-1 rounded ${isFirst ? 'text-[#2a2a2a]' : 'text-gray-500 active:text-white'}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
          </button>
          <button onClick={onMoveDown} disabled={isLast} className={`p-1 rounded ${isLast ? 'text-[#2a2a2a]' : 'text-gray-500 active:text-white'}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
        </div>

        {/* Teams & score */}
        <button onClick={() => setExpanded(!expanded)} className="flex-1 flex items-center gap-2 active:opacity-70 min-w-0">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {home ? <TeamLogo team={home} size={22} /> : <div className="w-[22px] h-[22px] rounded-full bg-[#222] border border-[#333] shrink-0" />}
            <span className="text-xs font-medium truncate">{home?.name ?? (isFinal ? 'À qualifier' : '?')}</span>
          </div>
          <div className="shrink-0 text-center min-w-[48px]">
            {match.played ? (
              <span className="text-sm font-bold">{match.homeScore} - {match.awayScore}</span>
            ) : (
              <span className="text-xs text-gray-600">vs</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
            <span className="text-xs font-medium truncate text-right">{away?.name ?? (isFinal ? 'À qualifier' : '?')}</span>
            {away ? <TeamLogo team={away} size={22} /> : <div className="w-[22px] h-[22px] rounded-full bg-[#222] border border-[#333] shrink-0" />}
          </div>
        </button>

        {/* Status */}
        <div className="shrink-0">
          {match.played ? (
            <span className="text-[9px] font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded">JOUÉ</span>
          ) : (
            <span className="text-[9px] font-bold text-gray-600 bg-[#1e1e1e] border border-[#2a2a2a] px-1.5 py-0.5 rounded">
              {label}
            </span>
          )}
        </div>
      </div>

      {match.manOfMatch && !expanded && (
        <div className="px-3 pb-2 -mt-1">
          <span className="text-[11px] text-amber-500">🏅 {match.manOfMatch}</span>
        </div>
      )}

      {expanded && (
        <div className="px-3 pb-3 pt-2 border-t border-[#1e1e1e] space-y-4">
          {/* Team selector for final phase */}
          {isFinal && (
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Équipes qualifiées</label>
              <div className="grid grid-cols-2 gap-2">
                <select value={editHomeId} onChange={e => setEditHomeId(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#333] rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-[#555]">
                  <option value="">À qualifier</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select value={editAwayId} onChange={e => setEditAwayId(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#333] rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-[#555]">
                  <option value="">À qualifier</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Score */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Score</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 flex-1">
                <span className="text-xs text-gray-400 truncate flex-1 text-right">{home?.name ?? '—'}</span>
                <input value={homeScore} onChange={e => setHomeScore(e.target.value)} type="number" min="0" max="20"
                  className="w-12 bg-[#1a1a1a] border border-[#333] rounded-lg p-2 text-lg font-bold text-center text-white focus:outline-none focus:border-white" />
              </div>
              <span className="text-gray-600 font-bold">-</span>
              <div className="flex items-center gap-1 flex-1">
                <input value={awayScore} onChange={e => setAwayScore(e.target.value)} type="number" min="0" max="20"
                  className="w-12 bg-[#1a1a1a] border border-[#333] rounded-lg p-2 text-lg font-bold text-center text-white focus:outline-none focus:border-white" />
                <span className="text-xs text-gray-400 truncate flex-1">{away?.name ?? '—'}</span>
              </div>
            </div>
          </div>

          {/* Scorers */}
          <EventEditor type="scorer" events={scorers} homeTeamId={editHomeId} awayTeamId={editAwayId} teams={teams} players={players} onChange={setScorers} />

          {/* Assisters */}
          <EventEditor type="assister" events={assisters} homeTeamId={editHomeId} awayTeamId={editAwayId} teams={teams} players={players} onChange={setAssisters} />

          {/* Man of the Match */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">🏅 Homme du Match</label>
            <div className="flex gap-2">
              <select value={momTeam} onChange={e => { setMomTeam(e.target.value); setMomName(''); setMomCustom(''); }}
                className="bg-[#1a1a1a] border border-[#333] rounded-lg px-2 py-2 text-xs text-white focus:outline-none w-24 shrink-0">
                <option value="">Équipe</option>
                {home && <option value={editHomeId}>{home.name}</option>}
                {away && <option value={editAwayId}>{away.name}</option>}
              </select>
              <div className="flex-1 flex flex-col gap-1">
                <select value={momName} onChange={e => setMomName(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none focus:border-[#555]">
                  <option value="">Joueur...</option>
                  {momPlayers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  <option value="__other__">Autre (saisie libre)</option>
                </select>
                {isMomOther && (
                  <input value={momCustom} onChange={e => setMomCustom(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#444] rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none focus:border-[#555]"
                    placeholder="Nom du joueur" autoFocus />
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={reset} className="flex-1 py-2.5 border border-[#333] text-gray-400 text-sm font-semibold rounded-xl active:opacity-60">Réinitialiser</button>
            <button onClick={save} className="flex-1 py-2.5 bg-white text-black text-sm font-bold rounded-xl active:opacity-70">Enregistrer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MatchAdmin({ state, updateMatch, swapMatchOrder }: TournamentHook) {
  const { teams, matches, players } = state;
  const [filter, setFilter] = useState<'all' | 'A' | 'B' | 'finale'>('all');
  const [showPlayed, setShowPlayed] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const sortedGroupMatches = [...matches]
    .filter(m => m.phase === 'group')
    .sort((a, b) => a.order - b.order);
  const firstGroupMatch = sortedGroupMatches[0];
  const currentStartGroup: Group = (firstGroupMatch?.group as Group) ?? 'A';
  const currentOpeningMatchId = firstGroupMatch?.id ?? '';

  const [pendingGroup, setPendingGroup] = useState<Group>(currentStartGroup);

  // Round-1 matches of the pending starting group (the 3 candidates for opener)
  const round1Candidates = matches
    .filter(m => m.phase === 'group' && m.round === 1 && m.group === pendingGroup)
    .sort((a, b) => a.order - b.order);

  const handleReorder = (startGroup: Group, openingMatchId: string) => {
    startTransition(async () => {
      await reorderGroupMatchesAction(startGroup, openingMatchId);
      router.refresh();
    });
  };

  const handleGroupChange = (g: Group) => {
    setPendingGroup(g);
  };

  const sorted = [...matches].sort((a, b) => a.order - b.order);

  const filtered = sorted.filter(m => {
    if (filter === 'finale') return m.phase !== 'group';
    if (filter === 'A') return m.phase === 'group' && m.group === 'A';
    if (filter === 'B') return m.phase === 'group' && m.group === 'B';
    if (!showPlayed && m.played) return false;
    return true;
  });

  const [openingOpen, setOpeningOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Opening match config */}
      <div className="bg-[#161616] border border-[#222] rounded-xl overflow-hidden">
        <button
          onClick={() => setOpeningOpen(o => !o)}
          className="w-full flex items-center justify-between px-3 py-3 active:opacity-70"
        >
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Match d'ouverture</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5"
            className={`transition-transform ${openingOpen ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {openingOpen && (
          <div className="px-3 pb-3 space-y-3 border-t border-[#222]">
            {/* Group selector */}
            <div className="pt-3">
              <p className="text-[10px] text-gray-600 mb-1.5">1. Poule qui commence</p>
              <div className="flex gap-2">
                {(['A', 'B'] as Group[]).map(g => (
                  <button key={g} onClick={() => handleGroupChange(g)} disabled={isPending}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${pendingGroup === g ? 'bg-white text-black' : 'bg-[#1e1e1e] text-gray-400'} disabled:opacity-40`}>
                    Poule {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Opening match selector */}
            <div>
              <p className="text-[10px] text-gray-600 mb-1.5">2. Premier match</p>
              <div className="space-y-1.5">
                {round1Candidates.map(m => {
                  const home = teams.find(t => t.id === m.homeTeamId);
                  const away = teams.find(t => t.id === m.awayTeamId);
                  const isActive = pendingGroup === currentStartGroup && m.id === currentOpeningMatchId;
                  return (
                    <button key={m.id} disabled={isPending}
                      onClick={() => handleReorder(pendingGroup, m.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 ${isActive ? 'bg-white text-black' : 'bg-[#1e1e1e] text-gray-300 active:opacity-70'}`}>
                      {home && <TeamLogo team={home} size={20} />}
                      <span className="truncate">{home?.name ?? '?'}</span>
                      <span className={`text-xs mx-1 ${isActive ? 'text-gray-500' : 'text-gray-600'}`}>vs</span>
                      <span className="truncate">{away?.name ?? '?'}</span>
                      {away && <TeamLogo team={away} size={20} />}
                      {isPending && <span className="ml-auto text-xs">...</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-gray-600">Les 30 matchs s'alternent ensuite A↔B automatiquement</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap">
        {(['all', 'A', 'B', 'finale'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`py-2 px-3 rounded-lg text-xs font-semibold ${filter === f ? 'bg-white text-black' : 'bg-[#1e1e1e] text-gray-400'}`}>
            {f === 'all' ? 'Tous' : f === 'finale' ? 'Finale' : `Grp ${f}`}
          </button>
        ))}
        {filter !== 'finale' && (
          <button onClick={() => setShowPlayed(!showPlayed)}
            className={`py-2 px-3 rounded-lg text-xs font-semibold ml-auto ${!showPlayed ? 'bg-white text-black' : 'bg-[#1e1e1e] text-gray-400'}`}>
            {showPlayed ? 'Cacher joués' : 'Voir tous'}
          </button>
        )}
      </div>

      <p className="text-[11px] text-gray-600">Flèches ↑↓ pour modifier l&apos;ordre · Tapez un match pour saisir le score</p>

      <div className="space-y-2">
        {filtered.map((match) => {
          const globalIdx = sorted.findIndex(m => m.id === match.id);
          const prevMatch = globalIdx > 0 ? sorted[globalIdx - 1] : null;
          const nextMatch = globalIdx < sorted.length - 1 ? sorted[globalIdx + 1] : null;
          return (
            <MatchCard key={match.id} match={match} teams={teams} players={players} updateMatch={updateMatch}
              isFirst={!prevMatch} isLast={!nextMatch}
              onMoveUp={() => prevMatch && swapMatchOrder(match.id, prevMatch.id)}
              onMoveDown={() => nextMatch && swapMatchOrder(match.id, nextMatch.id)} />
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-sm">Aucun match</div>
        )}
      </div>
    </div>
  );
}
