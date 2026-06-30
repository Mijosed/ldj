'use client';

import { TournamentHook } from '@/lib/useTournament';
import TeamLogo from '@/components/TeamLogo';
import { TrophyPlayer } from '@/lib/types';
import { computeScorerStats, computeAssisterStats } from '@/lib/utils';

const TOTY_LABELS = ['Gardien', 'Joueur 1', 'Joueur 2', 'Joueur 3', 'Joueur 4', 'Joueur 5', 'Joueur 6', 'Joueur 7'];

function AwardCard({ icon, title, player, teamName, teamId, teams, stat }: {
  icon: string;
  title: string;
  player?: TrophyPlayer | null;
  teamName?: string;
  teamId?: string;
  teams: TournamentHook['state']['teams'];
  stat?: string;
}) {
  const team = teamId ? teams.find(t => t.id === teamId) : undefined;
  return (
    <div className="bg-[#161616] border border-[#222] rounded-xl p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center shrink-0 text-xl">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        {player || teamId ? (
          <div className="flex items-center gap-2 mt-0.5">
            {team && <TeamLogo team={team} size={20} />}
            <p className="text-sm font-bold text-white truncate">{player?.playerName ?? teamName}</p>
            {team && <p className="text-[11px] text-gray-500 shrink-0">{team.name}</p>}
            {stat && <p className="text-[11px] text-gray-400 shrink-0 ml-auto">{stat}</p>}
          </div>
        ) : (
          <p className="text-xs text-gray-600 mt-0.5">À définir</p>
        )}
      </div>
    </div>
  );
}

export default function TropheesView({ state }: TournamentHook) {
  const { teams, matches, awards } = state;

  const topScorer = computeScorerStats(matches)[0];
  const topAssister = computeAssisterStats(matches)[0];

  const filledToty = awards.toty.filter(Boolean);

  return (
    <div className="space-y-6">
        {/* Individual awards */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Récompenses individuelles</h2>
          <div className="space-y-2">
            <AwardCard icon="🏅" title="Ballon d'or" player={awards.ballonDor} teamId={awards.ballonDor?.teamId} teams={teams} />
            <AwardCard icon="⚽" title="Meilleur Buteur"
              player={topScorer ? { playerName: topScorer.playerName, teamId: topScorer.teamId } : null}
              teamId={topScorer?.teamId} teams={teams}
              stat={topScorer ? `${topScorer.count} but${topScorer.count > 1 ? 's' : ''}` : undefined} />
            <AwardCard icon="🎯" title="Meilleur Passeur"
              player={topAssister ? { playerName: topAssister.playerName, teamId: topAssister.teamId } : null}
              teamId={topAssister?.teamId} teams={teams}
              stat={topAssister ? `${topAssister.count} passe${topAssister.count > 1 ? 's' : ''}` : undefined} />
            <AwardCard icon="🧤" title="Meilleur Gardien" player={awards.meilleureGardien} teamId={awards.meilleureGardien?.teamId} teams={teams} />
            <AwardCard icon="⭐" title="Golden Boy" player={awards.goldenBoy} teamId={awards.goldenBoy?.teamId} teams={teams} />
            <AwardCard icon="👟" title="Prix Puskás" player={awards.puskas} teamId={awards.puskas?.teamId} teams={teams} />
          </div>
        </section>

        {/* TOTY */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            🌟 TOTY — Équipe du Tournoi
          </h2>
          {filledToty.length === 0 ? (
            <div className="bg-[#161616] border border-[#222] rounded-xl p-6 text-center text-gray-600 text-sm">
              À définir
            </div>
          ) : (
            <div className="bg-[#161616] border border-[#222] rounded-xl overflow-hidden">
              {awards.toty.map((player, i) => {
                if (!player) return null;
                const team = teams.find(t => t.id === player.teamId);
                return (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 border-b border-[#1e1e1e] last:border-0">
                    <span className="text-[10px] font-bold text-gray-600 w-16 shrink-0">{TOTY_LABELS[i]}</span>
                    {team && <TeamLogo team={team} size={24} />}
                    <span className="text-sm font-semibold text-white flex-1 truncate">{player.playerName}</span>
                    {team && <span className="text-[11px] text-gray-500 shrink-0">{team.name}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </section>
    </div>
  );
}
