import React, { useState, useEffect, useRef } from 'react';
import { BiometricPlanResult, MicroPlanStep } from '../types';
import { generateAdaptiveWorkout } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Flame,
  Moon,
  HeartPulse,
  Clock,
  Dna,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Activity,
  Award,
} from 'lucide-react';

interface BiometricCoachProps {
  highContrast: boolean;
  onWorkoutCompleted?: () => void;
}

const PRESET_BIOMETRICS = [
  {
    name: 'Scenario C: Busy Schedule + High Stress',
    sleepScore: 58,
    hrvStress: 'High',
    windowMinutes: 12,
    dnaProfile: 'Slow Recovery / High Cortisol Reactivity',
    notes: 'Suboptimal sleep, elevated sympathetic nervous arousal, 12 minutes available between meetings.',
    result: {
      biometricStatus: 'Sleep Score: 58/100 (Suboptimal) | HRV Stress: High',
      availableWindow: '12 Minutes',
      rawPlanText: `1. 3 mins – Cat-Cow & World’s Greatest Stretch (Mobility)
2. 6 mins – Low-Impact Bodyweight Circuit (20s Squats, 20s Glute Bridges, 20s Rest x 3)
3. 3 mins – Parasympathetic Breathwork (4-7-8 Breathing)`,
      intensityScale: 'Active Recovery' as const,
      metabolicRecommendation: 'Sympathetic tone is dominating. High-intensity strain would exacerbate cortisol; gentle active mobility and vagal breathwork prioritize parasympathetic recovery.',
      steps: [
        {
          order: 1,
          phase: 'Mobility' as const,
          durationMins: 3,
          title: 'Cat-Cow & World’s Greatest Stretch',
          description: '3 mins – Decompresses thoracic spine, opens anterior hip flexors, and restores pelvic tilt.',
          exercises: [
            { name: 'Cat-Cow Flow', workSec: 60, restSec: 15, repsOrNotes: 'Coordinate with deep breath' },
            { name: 'World’s Greatest Stretch (Left)', workSec: 45, restSec: 15, repsOrNotes: 'T-spine rotation' },
            { name: 'World’s Greatest Stretch (Right)', workSec: 45, restSec: 0, repsOrNotes: 'T-spine rotation' },
          ],
        },
        {
          order: 2,
          phase: 'Circuit' as const,
          durationMins: 6,
          title: 'Low-Impact Bodyweight Circuit',
          description: '6 mins – (20s Squats, 20s Glute Bridges, 20s Rest x 3). Flushes blood into large muscle groups with zero joint impact.',
          exercises: [
            { name: 'Controlled Air Squats', workSec: 20, restSec: 0, repsOrNotes: 'Focus on knee tracking' },
            { name: 'Glute Bridges', workSec: 20, restSec: 20, repsOrNotes: 'Squeeze at top' },
            { name: 'Controlled Air Squats (R2)', workSec: 20, restSec: 0, repsOrNotes: 'Steady tempo' },
            { name: 'Glute Bridges (R2)', workSec: 20, restSec: 20, repsOrNotes: 'Drive through heels' },
            { name: 'Controlled Air Squats (R3)', workSec: 20, restSec: 0, repsOrNotes: 'Deep parallel' },
            { name: 'Glute Bridges (R3)', workSec: 20, restSec: 20, repsOrNotes: 'Posterior pelvic tilt' },
          ],
        },
        {
          order: 3,
          phase: 'Breathwork' as const,
          durationMins: 3,
          title: 'Parasympathetic Breathwork (4-7-8 Breathing)',
          description: '3 mins – Inhale 4s, hold 7s, exhale 8s. Direct vagus nerve stimulation to lower resting heart rate.',
          exercises: [
            { name: '4-7-8 Diaphragmatic Cycles', workSec: 180, restSec: 0, repsOrNotes: 'Inhale nose, exhale mouth' },
          ],
        },
      ],
    },
  },
  {
    name: 'Peak Recovery + High Capacity',
    sleepScore: 92,
    hrvStress: 'Low',
    windowMinutes: 15,
    dnaProfile: 'Fast Glycolytic / High Lactate Clearance',
    notes: 'Optimal REM/Deep sleep, robust HRV parasympathetic rebound. Ready for high metabolic stimulus.',
    result: {
      biometricStatus: 'Sleep Score: 92/100 (Optimal) | HRV Stress: Low',
      availableWindow: '15 Minutes',
      rawPlanText: `1. 3 mins – Dynamic Hip Openers & Inchworms (Mobility)
2. 10 mins – High-Intensity Tabata Density Block (Squat Jumps, Sprawls, Plank Taps)
3. 2 mins – Down-Regulation Cooldown Stretch`,
      intensityScale: 'High' as const,
      metabolicRecommendation: 'Central nervous system is primed for peak motor unit recruitment. High-density intervals maximize EPOC.',
      steps: [
        {
          order: 1,
          phase: 'Mobility' as const,
          durationMins: 3,
          title: 'Dynamic Hip Openers & Inchworms',
          description: 'Warm up core, hamstrings, and glenohumeral stability.',
        },
        {
          order: 2,
          phase: 'Circuit' as const,
          durationMins: 10,
          title: 'High-Intensity Tabata Density Block',
          description: '20s maximum power, 10s rest across 10 intervals.',
        },
        {
          order: 3,
          phase: 'Cooldown' as const,
          durationMins: 2,
          title: 'Down-Regulation Cooldown',
          description: 'Restore normal breathing and reset muscle tonus.',
        },
      ],
    },
  },
];

export const BiometricCoach: React.FC<BiometricCoachProps> = ({
  highContrast,
  onWorkoutCompleted,
}) => {
  // Biometric Inputs
  const [sleepScore, setSleepScore] = useState<number>(58);
  const [hrvStress, setHrvStress] = useState<string>('High');
  const [availableMinutes, setAvailableMinutes] = useState<number>(12);
  const [dnaProfile, setDnaProfile] = useState<string>(
    'Slow Recovery / High Cortisol Reactivity'
  );
  const [fatigueNotes, setFatigueNotes] = useState<string>(
    'Busy schedule, tight timeline, high mental workload'
  );

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [planResult, setPlanResult] = useState<BiometricPlanResult>(
    PRESET_BIOMETRICS[0].result
  );

  // Guided Workout Player State
  const [isPlayingWorkout, setIsPlayingWorkout] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [stepSecondsLeft, setStepSecondsLeft] = useState<number>(180);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Handle Generate with AI
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const data = await generateAdaptiveWorkout({
        sleepScore,
        hrvStress,
        availableMinutes,
        dnaProfile,
        fatigueNotes,
      });
      setPlanResult(data);
    } catch (err) {
      console.error('Failed to generate adaptive micro-workout:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyPreset = (idx: number) => {
    const p = PRESET_BIOMETRICS[idx];
    setSleepScore(p.sleepScore);
    setHrvStress(p.hrvStress);
    setAvailableMinutes(p.windowMinutes);
    setDnaProfile(p.dnaProfile);
    setFatigueNotes(p.notes);
    setPlanResult(p.result);
  };

  // Refs to avoid setState inside setState updater
  const stepSecondsRef = useRef(stepSecondsLeft);
  stepSecondsRef.current = stepSecondsLeft;
  const activeStepRef = useRef(activeStepIndex);
  activeStepRef.current = activeStepIndex;
  const planResultRef = useRef(planResult);
  planResultRef.current = planResult;
  const onWorkoutCompletedRef = useRef(onWorkoutCompleted);
  onWorkoutCompletedRef.current = onWorkoutCompleted;

  // Timer loop
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      const curSec = stepSecondsRef.current;
      if (curSec > 1) {
        setStepSecondsLeft(curSec - 1);
        return;
      }

      // Step transition or completion
      const curStepIdx = activeStepRef.current;
      const totalSteps = planResultRef.current.steps.length;

      if (curStepIdx < totalSteps - 1) {
        const nextStepIdx = curStepIdx + 1;
        setActiveStepIndex(nextStepIdx);
        const nextSec = (planResultRef.current.steps[nextStepIdx]?.durationMins || 3) * 60;
        setStepSecondsLeft(nextSec);
      } else {
        // Routine completed!
        setStepSecondsLeft(0);
        setTimerRunning(false);
        setIsPlayingWorkout(false);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        if (onWorkoutCompletedRef.current) {
          onWorkoutCompletedRef.current();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const startGuidedWorkout = () => {
    setActiveStepIndex(0);
    const firstDurationSec = (planResult.steps[0]?.durationMins || 3) * 60;
    setStepSecondsLeft(firstDurationSec);
    setIsPlayingWorkout(true);
    setTimerRunning(true);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentStep = planResult.steps[activeStepIndex] || planResult.steps[0];

  return (
    <div id="biometric-coach-container" className="space-y-6">
      {/* Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
          highContrast
            ? 'bg-neutral-900 border-yellow-400 text-white'
            : 'bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white border-purple-900 shadow-md'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Mode 3: Adaptive Biometric & Micro-Workout Coach
            </span>
            <span className="text-xs text-slate-400">Sleep, HRV & DNA Telemetry</span>
          </div>
          <h2 className="text-lg font-bold">Targeted Micro-Workouts Scaled to Biometrics</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Automatically scales intensity up or down based on sleep efficiency, stress scores, and your exact available calendar window.
          </p>
        </div>

        <button
          id="generate-micro-plan-btn"
          onClick={handleGeneratePlan}
          disabled={isGenerating}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2 cursor-pointer transition-all shadow"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          {isGenerating ? 'Adapting Plan...' : 'Generate with Gemini'}
        </button>
      </div>

      {/* Guided Workout Interactive Player Modal/Banner if active */}
      {isPlayingWorkout && (
        <div
          id="guided-workout-active-player"
          className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950 text-white border-2 border-purple-500 shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                Step {activeStepIndex + 1} of {planResult.steps.length}: {currentStep.phase}
              </span>
              <span className="text-xs text-slate-400">{currentStep.durationMins} Mins Phase</span>
            </div>
            <button
              onClick={() => {
                setIsPlayingWorkout(false);
                setTimerRunning(false);
              }}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Exit Routine
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">{currentStep.title}</h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                {currentStep.description}
              </p>

              {currentStep.exercises && currentStep.exercises.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {currentStep.exercises.map((ex, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-medium text-purple-200 border border-purple-500/30"
                    >
                      {ex.name} ({ex.workSec}s work{ex.restSec > 0 ? ` / ${ex.restSec}s rest` : ''})
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Huge Timer display & Controls */}
            <div className="flex flex-col items-center justify-center min-w-[200px] p-4 rounded-xl bg-black/50 border border-slate-800">
              <div className="text-4xl font-mono font-extrabold text-purple-400 tracking-wider">
                {formatTimer(stepSecondsLeft)}
              </div>
              <div className="text-[10px] uppercase text-slate-400 font-semibold mt-1">
                Remaining in Phase
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => {
                    const dur = (currentStep.durationMins || 3) * 60;
                    setStepSecondsLeft(dur);
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Reset phase timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Inputs (5 cols) and Output Card (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Biometric Telemetry Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Preset Selector */}
          <div
            className={`p-4 rounded-xl border ${
              highContrast
                ? 'bg-neutral-900 border-yellow-400 text-white'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Preset Scenarios
            </h3>
            <div className="space-y-1.5">
              {PRESET_BIOMETRICS.map((p, idx) => (
                <button
                  key={p.name}
                  onClick={() => handleApplyPreset(idx)}
                  className={`w-full p-2.5 rounded-lg text-left text-xs border transition-all flex items-center justify-between cursor-pointer ${
                    sleepScore === p.sleepScore && availableMinutes === p.windowMinutes
                      ? highContrast
                        ? 'bg-yellow-400 text-black font-bold'
                        : 'bg-purple-50 border-purple-400 text-purple-950 font-semibold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="text-[11px] font-mono text-slate-500">{p.windowMinutes}m</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Sliders & Telemetry Inputs */}
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              highContrast
                ? 'bg-neutral-900 border-yellow-400 text-white'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Biometric & Schedule Parameters
            </h3>

            {/* Sleep Efficiency Score */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  Sleep Efficiency Score
                </span>
                <span
                  className={`font-mono font-bold ${
                    sleepScore < 65 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {sleepScore} / 100 {sleepScore < 65 ? '(Suboptimal)' : '(Restorative)'}
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={sleepScore}
                onChange={(e) => setSleepScore(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* HRV Stress Level */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                HRV / Autonomic Stress Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Low', 'Moderate', 'High'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setHrvStress(lvl)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      hrvStress === lvl
                        ? lvl === 'High'
                          ? 'bg-rose-50 border-rose-400 text-rose-800'
                          : lvl === 'Moderate'
                          ? 'bg-amber-50 border-amber-400 text-amber-800'
                          : 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Window Minutes */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Available Schedule Window
                </span>
                <span className="font-mono font-bold text-slate-800">{availableMinutes} Mins</span>
              </div>
              <input
                type="range"
                min="8"
                max="30"
                step="2"
                value={availableMinutes}
                onChange={(e) => setAvailableMinutes(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>8 min (Ultra-Micro)</span>
                <span>12-15 min (Optimal)</span>
                <span>30 min</span>
              </div>
            </div>

            {/* DNA & Metabolic Profile */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1">
                <Dna className="w-3.5 h-3.5 text-purple-600" />
                DNA / Metabolic Recovery Profile
              </label>
              <select
                value={dnaProfile}
                onChange={(e) => setDnaProfile(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Slow Recovery / High Cortisol Reactivity">
                  Slow Recovery / High Cortisol Reactivity
                </option>
                <option value="Fast Glycolytic / High Lactate Clearance">
                  Fast Glycolytic / High Lactate Clearance
                </option>
                <option value="Aerobic Oxidative / Fatigue Resistant">
                  Aerobic Oxidative / Fatigue Resistant
                </option>
                <option value="Hybrid Balanced Responder">
                  Hybrid Balanced Responder
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Scenario C Output Card & Plan Details (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* EXACT SCENARIO C OUTPUT CARD AS MANDATED IN USER PROMPT */}
          <div
            id="scenario-c-output-card"
            className={`p-5 rounded-2xl border transition-all ${
              highContrast
                ? 'bg-black border-yellow-400 text-yellow-300'
                : 'bg-purple-50/70 border-purple-300 text-slate-900 shadow-sm'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-200/60">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-600 text-white">
                  <Flame className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Adaptive Routine Verdict
                  </h3>
                  <span className="text-xs font-semibold text-slate-800">
                    Scenario C Output Format
                  </span>
                </div>
              </div>

              {/* Intensity Scale pill */}
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  planResult.intensityScale === 'Active Recovery'
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                Scale: {planResult.intensityScale}
              </span>
            </div>

            {/* EXACT FORMAT FIELDS */}
            <div className="space-y-3 text-sm">
              {/* Biometric Status */}
              <div className="p-3 rounded-xl bg-white/90 border border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Biometric Status
                </div>
                <div className="font-semibold text-slate-900 leading-snug">
                  {planResult.biometricStatus}
                </div>
              </div>

              {/* Available Window */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/90 border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Available Window
                </span>
                <span className="font-mono font-bold text-base text-purple-700">
                  {planResult.availableWindow}
                </span>
              </div>

              {/* Adjusted Micro-Plan */}
              <div className="p-3 rounded-xl bg-white/90 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
                    Adjusted Micro-Plan
                  </span>
                  <span className="text-[10px] text-slate-400">Targeted Progression</span>
                </div>

                {/* Numbered List as specified */}
                <div className="space-y-2 text-xs sm:text-sm font-medium text-slate-800">
                  {planResult.steps.map((st, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {st.order || i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">
                          {st.durationMins} mins – {st.title} ({st.phase})
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {st.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Underlying metabolic reasoning */}
              {planResult.metabolicRecommendation && (
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950">
                  <span className="font-bold">Physiological Adaptation: </span>
                  <span>{planResult.metabolicRecommendation}</span>
                </div>
              )}
            </div>

            {/* Launch Guided Routine Button */}
            <div className="mt-4 pt-3 border-t border-purple-200/60">
              <button
                id="launch-guided-routine-btn"
                onClick={startGuidedWorkout}
                className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Play className="w-4 h-4" />
                Start Interactive Guided {planResult.availableWindow} Micro-Workout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
