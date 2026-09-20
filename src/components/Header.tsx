import React from 'react';
import { CoreMode, UserFitnessProfile } from '../types';
import {
  Activity,
  Salad,
  Flame,
  Accessibility,
  Volume2,
  VolumeX,
  Eye,
  Zap,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  currentMode: CoreMode;
  onSelectMode: (mode: CoreMode) => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  hapticFlashEnabled: boolean;
  onToggleHapticFlash: () => void;
  profile: UserFitnessProfile;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  voiceEnabled,
  onToggleVoice,
  highContrast,
  onToggleHighContrast,
  hapticFlashEnabled,
  onToggleHapticFlash,
  profile,
}) => {
  const modes: { id: CoreMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'pose_supervisor', label: '1. Movement Supervisor', icon: Activity },
    { id: 'nutrition_analyst', label: '2. Nutrition & Metabolism', icon: Salad },
    { id: 'biometric_coach', label: '3. Adaptive Micro-Coach', icon: Flame },
    { id: 'accessibility_assistant', label: '4. Universal Accessibility', icon: Accessibility },
  ];

  return (
    <header
      id="main-app-header"
      className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
        highContrast
          ? 'bg-black text-white border-yellow-400'
          : 'bg-white/95 text-slate-900 border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Brand & Persona */}
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${
                highContrast
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
              }`}
            >
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight">Smart Trainify</h1>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    highContrast
                      ? 'bg-yellow-400 text-black font-semibold'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  AI Instructor
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Zero-Latency
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Empathetic, hyper-personalized fitness & posture companion
              </p>
            </div>
          </div>

          {/* Gamified stats bar & accessibility toggles */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Gamified stats */}
            <div
              className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                highContrast
                  ? 'border-yellow-400 bg-neutral-900 text-yellow-300'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Lv.{profile.level}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{profile.streakDays}d Streak</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{profile.formPrecisionAvg}% Precision</span>
              </div>
            </div>

            {/* Quick accessibility & audio toggles */}
            <div className="flex items-center gap-1">
              <button
                id="voice-toggle-btn"
                onClick={onToggleVoice}
                title={voiceEnabled ? 'Audio Coach Active (Click to mute)' : 'Audio Coach Muted (Click to enable)'}
                className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1 ${
                  voiceEnabled
                    ? highContrast
                      ? 'bg-yellow-400 text-black border-yellow-400'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-transparent text-slate-400 border-slate-200 hover:text-slate-600'
                }`}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">Voice</span>
              </button>

              <button
                id="contrast-toggle-btn"
                onClick={onToggleHighContrast}
                title="Toggle High-Contrast Accessibility Mode"
                className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1 ${
                  highContrast
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : 'bg-transparent text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Contrast</span>
              </button>

              <button
                id="haptic-flash-toggle-btn"
                onClick={onToggleHapticFlash}
                title="Visual Haptic Flash for hearing-impaired athletes"
                className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1 ${
                  hapticFlashEnabled
                    ? highContrast
                      ? 'bg-yellow-400 text-black border-yellow-400'
                      : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                    : 'bg-transparent text-slate-400 border-slate-200 hover:text-slate-600'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Visual Flash</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <nav className="flex items-center gap-2 mt-3 overflow-x-auto pb-1" aria-label="Core Modes">
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = currentMode === m.id;
            return (
              <button
                key={m.id}
                id={`tab-btn-${m.id}`}
                onClick={() => onSelectMode(m.id)}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? highContrast
                      ? 'bg-yellow-400 text-black shadow-md'
                      : 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                    : highContrast
                    ? 'text-yellow-200 hover:bg-neutral-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {m.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
