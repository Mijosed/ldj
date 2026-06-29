'use client';

import { TournamentHook } from '@/lib/useTournament';
import TeamLogo from '@/components/TeamLogo';
import { computeScorerStats, computeAssisterStats, computeDefenseStats } from '@/lib/utils';

export default function StatsView({ state }: TournamentHook) {
  const { teams, matches } = state;

  const scorers = computeScorerStats(matches).slice(0, 10);
  const assisters = computeAssisterStats(matches).slice(0, 10);
  const defense = computeDefenseStats(teams, matches).slice(0, 6);

  const getTeam = (id: string) => teams.find(t => t.id === id);

  const StatRow = ({
    rank,
    name,
    teamId,
    count,
    icon,
    unit,
  }: {
    rank: number;
    name: string;
    teamId: string;
    count: number;
    icon: string;
    unit: string;
  }) => {
    const team = getTeam(teamId);
    return (
      <div className="flex items-center gap-3 py-2.5 border-b border-[#1e1e1e] last:border-0">
        <span className={`w-5 text-center text-sm font-bold ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-600' : 'text-gray-600'}`}>
          {rank}
        </span>
        {team && <TeamLogo team={team} size={28} />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{name}</p>
          {team && <p className="text-[11px] text-gray-500 truncate">{team.name}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-lg font-bold text-white">{count}</span>
          <span className="text-xs text-gray-500">{icon}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-4 pt-6 pb-4 bg-[#111] border-b border-[#1e1e1e]">
        <h1 className="text-xl font-bold">Statistiques</h1>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Buteurs */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Meilleurs Buteurs
          </h2>
          <div className="bg-[#161616] border border-[#222] rounded-xl px-3">
            {scorers.length > 0 ? (
              scorers.map((s, i) => (
                <StatRow
                  key={`${s.playerName}_${s.teamId}`}
                  rank={i + 1}
                  name={s.playerName}
                  teamId={s.teamId}
                  count={s.count}
                  icon="⚽"
                  unit="buts"
                />
              ))
            ) : (
              <div className="py-6 text-center text-gray-600 text-sm">Aucun buteur enregistré</div>
            )}
          </div>
        </section>

        {/* Passeurs */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Meilleurs Passeurs
          </h2>
          <div className="bg-[#161616] border border-[#222] rounded-xl px-3">
            {assisters.length > 0 ? (
              assisters.map((a, i) => (
                <StatRow
                  key={`${a.playerName}_${a.teamId}`}
                  rank={i + 1}
                  name={a.playerName}
                  teamId={a.teamId}
                  count={a.count}
                  icon="🎯"
                  unit="passes"
                />
              ))
            ) : (
              <div className="py-6 text-center text-gray-600 text-sm">Aucune passe enregistrée</div>
            )}
          </div>
        </section>

        {/* Défense */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Meilleure Défense
          </h2>
          <div className="bg-[#161616] border border-[#222] rounded-xl px-3">
            {defense.length > 0 ? (
              defense.map((d, i) => {
                const team = getTeam(d.teamId);
                if (!team) return null;
                return (
                  <div key={d.teamId} className="flex items-center gap-3 py-2.5 border-b border-[#1e1e1e] last:border-0">
                    <span className={`w-5 text-center text-sm font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                      {i + 1}
                    </span>
                    <TeamLogo team={team} size={28} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{team.name}</p>
                      <p className="text-[11px] text-gray-500">Groupe {team.group} · {d.played} matchs</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-lg font-bold text-white">{d.goalsAgainst}</span>
                      <span className="text-xs text-gray-500">encaissés</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-gray-600 text-sm">Aucun résultat</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
