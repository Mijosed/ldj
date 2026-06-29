'use client';

import { useState } from 'react';
import { TournamentHook } from '@/lib/useTournament';
import GroupManager from '@/components/admin/GroupManager';
import TeamManager from '@/components/admin/TeamManager';
import MatchAdmin from '@/components/admin/MatchAdmin';

const ADMIN_PASSWORD = 'LDJ2026';

type AdminTab = 'teams' | 'groups' | 'matches';

export default function AdminView(props: TournamentHook) {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('matches');
  const [showReset, setShowReset] = useState(false);

  const login = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPasswordInput('');
    }
  };

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-[#0a0a0a]">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h1 className="text-xl font-bold">Zone Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Entrez le mot de passe pour continuer</p>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              value={passwordInput}
              onChange={e => { setPasswordInput(e.target.value); setError(false); }}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Mot de passe"
              autoFocus
              className={`w-full bg-[#161616] border rounded-xl px-4 py-3 text-white text-center text-lg tracking-wider focus:outline-none ${
                error ? 'border-red-500' : 'border-[#333] focus:border-[#555]'
              }`}
            />
            {error && <p className="text-red-400 text-xs text-center">Mot de passe incorrect</p>}
            <button
              onClick={login}
              className="w-full bg-white text-black font-bold py-3 rounded-xl text-sm active:opacity-70"
            >
              Accéder
            </button>
          </div>
        </div>
      </div>
    );
  }

  const TABS: { id: AdminTab; label: string }[] = [
    { id: 'matches', label: 'Matchs' },
    { id: 'teams', label: 'Équipes' },
    { id: 'groups', label: 'Poules' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 bg-[#111] border-b border-[#1e1e1e]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Administration</h1>
          <button
            onClick={() => setAuthenticated(false)}
            className="text-xs text-gray-500 active:text-white"
          >
            Déconnexion
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.id ? 'bg-white text-black' : 'bg-[#1e1e1e] text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {activeTab === 'matches' && <MatchAdmin {...props} />}
        {activeTab === 'teams' && <TeamManager {...props} />}
        {activeTab === 'groups' && <GroupManager {...props} />}

        {/* Danger zone */}
        <div className="mt-8 border-t border-[#222] pt-6">
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              className="w-full py-2.5 border border-red-900/40 text-red-800 text-xs font-semibold rounded-xl active:opacity-70"
            >
              Réinitialiser toutes les données
            </button>
          ) : (
            <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-4 space-y-3">
              <p className="text-sm text-red-400 font-semibold text-center">
                Confirmer la réinitialisation ?
              </p>
              <p className="text-xs text-red-700 text-center">
                Tous les scores, joueurs et modifications seront perdus.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReset(false)}
                  className="flex-1 py-2.5 border border-[#333] text-gray-400 text-sm font-semibold rounded-xl active:opacity-60"
                >
                  Annuler
                </button>
                <button
                  onClick={() => { props.resetData(); setShowReset(false); }}
                  className="flex-1 py-2.5 bg-red-700 text-white text-sm font-bold rounded-xl active:opacity-70"
                >
                  Confirmer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
