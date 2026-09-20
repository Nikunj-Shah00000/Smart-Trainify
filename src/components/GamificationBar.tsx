import React from 'react';
import { UserFitnessProfile } from '../types';
import { ShieldCheck, Zap, Sparkles, Award, Trophy } from 'lucide-react';

interface GamificationBarProps {
  profile: UserFitnessProfile;
  highContrast: boolean;
}

export const GamificationBar: React.FC<GamificationBarProps> = ({ profile, highContrast }) => {
  const xpPercentage = Math.min(100, Math.round((profile.xp / profile.nextLevelXp) * 100));

  return (
    <div
      id="gamification-bar"
      className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all ${
        highContrast
          ? 'bg-neutral-900 border-yellow-400 text-white'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* RPG Progress & Level */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
          Lv.{profile.level}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900">Kinetic Form Mastery</span>
            <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-amber-50 text-amber-800 border border-amber-200">
              {profile.xp} / {profile.nextLevelXp} XP
            </span>
          </div>
          <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${xpPercentage}%` }}
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Ghost-Runner Pacing & Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Ghost-Runner: +4% Ahead of Target Cadence</span>
        </div>

        {profile.badges.slice(0, 3).map((badge) => (
          <div
            key={badge.id}
            title={badge.description}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium cursor-help"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>{badge.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
