import React, { useState, useEffect } from 'react';
import { CoreMode, UserFitnessProfile } from './types';
import { Header } from './components/Header';
import { PoseSupervisor } from './components/PoseSupervisor';
import { NutritionAnalyst } from './components/NutritionAnalyst';
import { BiometricCoach } from './components/BiometricCoach';
import { AccessibilityAssistant } from './components/AccessibilityAssistant';
import { GamificationBar } from './components/GamificationBar';
import { voiceCoach } from './services/speech';

export default function App() {
  const [currentMode, setCurrentMode] = useState<CoreMode>('pose_supervisor');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [hapticFlashEnabled, setHapticFlashEnabled] = useState<boolean>(true);
  const [screenFlashActive, setScreenFlashActive] = useState<boolean>(false);

  const [profile, setProfile] = useState<UserFitnessProfile>({
    level: 7,
    xp: 380,
    nextLevelXp: 500,
    streakDays: 14,
    formPrecisionAvg: 94,
    totalRepsSupervised: 342,
    badges: [
      {
        id: 'acl_guardian',
        name: 'ACL Guardian',
        description: 'Zero knee valgus detected on 10 consecutive squat working sets',
        icon: 'ShieldCheck',
        unlocked: true,
      },
      {
        id: 'metabolic_sync',
        name: 'Metabolic Sync',
        description: 'Nutritional macros consumed inside optimal recovery window',
        icon: 'Flame',
        unlocked: true,
      },
      {
        id: 'vagal_restorer',
        name: 'Vagal Master',
        description: 'Completed 4-7-8 parasympathetic breathwork after high HRV stress',
        icon: 'Sparkles',
        unlocked: true,
      },
      {
        id: 'inclusive_hero',
        name: 'Universal Athlete',
        description: 'Trained with non-verbal sign and BCI accessible modes',
        icon: 'Accessibility',
        unlocked: true,
      },
    ],
  });

  const triggerScreenFlash = () => {
    if (hapticFlashEnabled) {
      setScreenFlashActive(true);
      setTimeout(() => setScreenFlashActive(false), 300);
    }
  };

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    voiceCoach.setEnabled(next);
  };

  const handleRepCompleted = () => {
    setProfile((prev) => {
      const newXp = prev.xp + 15;
      if (newXp >= prev.nextLevelXp) {
        return {
          ...prev,
          level: prev.level + 1,
          xp: newXp - prev.nextLevelXp,
          nextLevelXp: Math.round(prev.nextLevelXp * 1.3),
          totalRepsSupervised: prev.totalRepsSupervised + 1,
        };
      }
      return {
        ...prev,
        xp: newXp,
        totalRepsSupervised: prev.totalRepsSupervised + 1,
      };
    });
  };

  const handleWorkoutCompleted = () => {
    setProfile((prev) => ({
      ...prev,
      xp: prev.xp + 100,
      streakDays: prev.streakDays + 1,
    }));
  };

  return (
    <div
      id="trainify-root-app"
      className={`min-h-screen font-sans antialiased transition-colors ${
        highContrast ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
      } ${screenFlashActive ? 'ring-8 ring-purple-500 ring-inset' : ''}`}
    >
      {/* Header Navigation with Mode Switcher & Gamification counters */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        voiceEnabled={voiceEnabled}
        onToggleVoice={handleToggleVoice}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        hapticFlashEnabled={hapticFlashEnabled}
        onToggleHapticFlash={() => setHapticFlashEnabled(!hapticFlashEnabled)}
        profile={profile}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Gamification progress & ghost-runner pacing status */}
        <GamificationBar profile={profile} highContrast={highContrast} />

        {/* Dynamic Mode Views */}
        {currentMode === 'pose_supervisor' && (
          <PoseSupervisor
            voiceEnabled={voiceEnabled}
            highContrast={highContrast}
            hapticFlashEnabled={hapticFlashEnabled}
            onRepCompleted={handleRepCompleted}
          />
        )}

        {currentMode === 'nutrition_analyst' && (
          <NutritionAnalyst highContrast={highContrast} />
        )}

        {currentMode === 'biometric_coach' && (
          <BiometricCoach
            highContrast={highContrast}
            onWorkoutCompleted={handleWorkoutCompleted}
          />
        )}

        {currentMode === 'accessibility_assistant' && (
          <AccessibilityAssistant
            voiceEnabled={voiceEnabled}
            highContrast={highContrast}
            hapticFlashEnabled={hapticFlashEnabled}
            onTriggerFlash={triggerScreenFlash}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-6 text-center text-xs transition-colors ${
          highContrast
            ? 'border-yellow-400 bg-black text-yellow-300'
            : 'border-slate-200 bg-white text-slate-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-700">Smart Trainify AI Instructor</p>
          <p className="mt-1 text-slate-400">
            Safety First • Zero-Latency Kinematics • Metabolic Energy Synchronization • Universal Accessibility
          </p>
        </div>
      </footer>
    </div>
  );
}
