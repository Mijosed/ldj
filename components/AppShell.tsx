'use client';

import { useState } from 'react';
import { TournamentState, Team, Player, Match, Tab } from '@/lib/types';
import { initialState } from '@/lib/initialData';
import BottomNav from '@/components/BottomNav';
import HomeView from '@/components/views/HomeView';
import MatchesView from '@/components/views/MatchesView';
import StandingsView from '@/components/views/StandingsView';
import StatsView from '@/components/views/StatsView';
import AdminView from '@/components/views/AdminView';
import {
  updateTeamAction,
  addPlayerAction,
  updatePlayerAction,
  removePlayerAction,
  updateMatchAction,
  swapMatchOrderAction,
  resetTournamentAction,
} from '@/app/actions';

export default function AppShell({ initialState: serverState }: { initialState: TournamentState }) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [state, setState] = useState<TournamentState>(serverState);

  const updateTeam = (teamId: string, updates: Partial<Team>) => {
    setState(s => ({ ...s, teams: s.teams.map(t => t.id === teamId ? { ...t, ...updates } : t) }));
    updateTeamAction(teamId, updates);
  };

  const addPlayer = (player: Player) => {
    setState(s => ({ ...s, players: [...s.players, player] }));
    addPlayerAction(player);
  };

  const updatePlayer = (playerId: string, updates: Partial<Player>) => {
    setState(s => ({ ...s, players: s.players.map(p => p.id === playerId ? { ...p, ...updates } : p) }));
    updatePlayerAction(playerId, updates);
  };

  const removePlayer = (playerId: string) => {
    setState(s => ({ ...s, players: s.players.filter(p => p.id !== playerId) }));
    removePlayerAction(playerId);
  };

  const updateMatch = (matchId: string, updates: Partial<Match>) => {
    setState(s => ({ ...s, matches: s.matches.map(m => m.id === matchId ? { ...m, ...updates } : m) }));
    updateMatchAction(matchId, updates);
  };

  const swapMatchOrder = (matchId1: string, matchId2: string) => {
    setState(s => {
      const m1 = s.matches.find(m => m.id === matchId1);
      const m2 = s.matches.find(m => m.id === matchId2);
      if (!m1 || !m2) return s;
      return {
        ...s,
        matches: s.matches.map(m => {
          if (m.id === matchId1) return { ...m, order: m2.order };
          if (m.id === matchId2) return { ...m, order: m1.order };
          return m;
        }),
      };
    });
    swapMatchOrderAction(matchId1, matchId2);
  };

  const resetData = () => {
    setState(initialState);
    resetTournamentAction();
  };

  const tournament = { state, loaded: true, updateTeam, addPlayer, updatePlayer, removePlayer, updateMatch, swapMatchOrder, resetData };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="pb-16 min-h-screen">
        {activeTab === 'home' && <HomeView {...tournament} />}
        {activeTab === 'matches' && <MatchesView {...tournament} />}
        {activeTab === 'standings' && <StandingsView {...tournament} />}
        {activeTab === 'stats' && <StatsView {...tournament} />}
        {activeTab === 'admin' && <AdminView {...tournament} />}
      </div>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
