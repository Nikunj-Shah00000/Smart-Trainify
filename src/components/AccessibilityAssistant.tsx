import React, { useState } from 'react';
import { AccessibilityResult } from '../types';
import { interpretAccessibilityInput } from '../services/api';
import { voiceCoach } from '../services/speech';
import {
  Accessibility,
  Activity,
  Volume2,
  Eye,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Hand,
  MousePointerClick,
  Sliders,
} from 'lucide-react';

interface AccessibilityAssistantProps {
  voiceEnabled: boolean;
  highContrast: boolean;
  hapticFlashEnabled: boolean;
  onTriggerFlash: () => void;
}

const PRESET_ACCESSIBILITY_INPUTS = [
  {
    type: 'sign_language' as const,
    label: 'Sign Gesture: Anterior Deltoid Fatigue',
    rawInput: 'ASL Notation: TIRED-SHOULDER, PAIN-ANTERIOR, NEED-SEATED-MODIFICATION',
    profile: 'Wheelchair athlete / upper body resistance training',
    defaultResult: {
      detectedInput: 'Sign Gesture: TIRED-SHOULDER / PAIN-ANTERIOR / NEED-SEATED-MODIFICATION',
      interpretation: 'The athlete is feeling acute fatigue in the anterior deltoid and rotator cuff during the overhead press, signaling potential subacromial pinch.',
      actionableFeedback: 'Switch immediately to Seated Neutral-Grip Resistance Band Rows or 45-Degree Chest-Supported Incline Presses. Tucking the elbows protects the labrum.',
      safetyNote: 'Do not push through anterior shoulder pinching. Safety first to protect shoulder mobility.',
      visualCue: 'Elbows Tucked 45° • Neutral Thumbs-Up Grip • 3-Second Descent',
      signGloss: 'SEATED-ROW • ELBOW-TUCK • SLOW-PULSE',
    },
  },
  {
    type: 'bci_telemetry' as const,
    label: 'BCI Neural Telemetry: High Cognitive Fatigue + Intended Knee Extension',
    rawInput: 'BCI Stream: Motor Cortex C3-C4 ERD (Event-Related Desynchronization) detected at 12Hz (Leg extension intent). Prefrontal Theta/Beta ratio 4.2 (High cognitive fatigue).',
    profile: 'Para-athlete with neural interface link',
    defaultResult: {
      detectedInput: 'BCI EEG Telemetry: Motor Intention (Quadriceps Activation) + Theta Surge (High Mental Fatigue)',
      interpretation: 'Motor cortex indicates clear intention to fire lower extremities, but elevated theta/beta ratio indicates central nervous system fatigue.',
      actionableFeedback: 'Execute Seated Isometric Knee Extensions at 60% voluntary maximum. Hold 5 seconds per rep with deliberate deep nasal breathing.',
      safetyNote: 'Prevent autonomic hyperreflexia or muscle spasms by avoiding sudden jerky ballistic contractions.',
      visualCue: 'Steady Hold 5s • Smooth Muscle Engagement • Deep Rhythm',
      signGloss: 'STEADY-HOLD • 5-COUNT • BREATHE-DEEP',
    },
  },
  {
    type: 'single_switch' as const,
    label: 'Single-Switch Trigger: "Request Rest & Form Check"',
    rawInput: 'Single-Tap Trigger: Input ID #3 (Athlete tapped head switch for urgent rest & posture verification)',
    profile: 'Athlete utilizing single-switch accessibility interface',
    defaultResult: {
      detectedInput: 'Single-Switch Input Trigger: Immediate Rest & Posture Check',
      interpretation: 'Athlete triggered a pause command to verify pelvic alignment and request a 60-second recovery window.',
      actionableFeedback: 'Timer paused immediately. Realign your torso against the backrest and relax your shoulders away from your ears. Take 3 deep breaths.',
      safetyNote: 'Workout paused. No penalty to form score or streak.',
      visualCue: 'STOP • RESET POSTURE • BREATHE',
      signGloss: 'PAUSE • REST-NOW • RELAX-SHOULDERS',
    },
  },
];

export const AccessibilityAssistant: React.FC<AccessibilityAssistantProps> = ({
  voiceEnabled,
  highContrast,
  hapticFlashEnabled,
  onTriggerFlash,
}) => {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [activeInputType, setActiveInputType] = useState<'sign_language' | 'bci_telemetry' | 'single_switch'>('sign_language');
  const [customInputData, setCustomInputData] = useState<string>(PRESET_ACCESSIBILITY_INPUTS[0].rawInput);
  const [athleteProfile, setAthleteProfile] = useState<string>(PRESET_ACCESSIBILITY_INPUTS[0].profile);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<AccessibilityResult>(PRESET_ACCESSIBILITY_INPUTS[0].defaultResult);

  const handleInterpret = async () => {
    setIsProcessing(true);
    try {
      const data = await interpretAccessibilityInput({
        inputType: activeInputType,
        inputData: customInputData,
        athleteProfile,
      });
      setResult(data);
      if (voiceEnabled) {
        voiceCoach.speak(data.actionableFeedback, 'urgent');
      }
      onTriggerFlash();
    } catch (err) {
      console.error('Failed accessibility interpretation:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    const p = PRESET_ACCESSIBILITY_INPUTS[idx];
    setActiveInputType(p.type);
    setCustomInputData(p.rawInput);
    setAthleteProfile(p.profile);
    setResult(p.defaultResult);
    if (voiceEnabled) {
      voiceCoach.speak(p.defaultResult.actionableFeedback, 'normal');
    }
    onTriggerFlash();
  };

  return (
    <div id="accessibility-assistant-container" className="space-y-6">
      {/* Top Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
          highContrast
            ? 'bg-neutral-900 border-yellow-400 text-white'
            : 'bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 text-white border-blue-900 shadow-md'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Mode 4: Universal Accessibility Assistant
            </span>
            <span className="text-xs text-slate-400">Non-Verbal & Neuro-Adaptive</span>
          </div>
          <h2 className="text-lg font-bold">Inclusive Guidance for Specially-Abled Athletes</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Interprets sign language gloss, single-switch assistive taps, and BCI neural telemetry into instant, clear, safe coaching cues.
          </p>
        </div>

        <button
          id="interpret-accessibility-btn"
          onClick={handleInterpret}
          disabled={isProcessing}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-slate-950 flex items-center gap-2 cursor-pointer transition-all shadow"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          {isProcessing ? 'Interpreting...' : 'Translate with Gemini'}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Non-Verbal Input Channel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Input Channel Selector */}
          <div
            className={`p-4 rounded-xl border ${
              highContrast
                ? 'bg-neutral-900 border-yellow-400 text-white'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Input Modality Channel
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                onClick={() => setActiveInputType('sign_language')}
                className={`p-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  activeInputType === 'sign_language'
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Hand className="w-4 h-4 text-cyan-600" />
                <span>Sign Language</span>
              </button>

              <button
                onClick={() => setActiveInputType('bci_telemetry')}
                className={`p-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  activeInputType === 'bci_telemetry'
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Brain className="w-4 h-4 text-indigo-600" />
                <span>BCI Neural Link</span>
              </button>

              <button
                onClick={() => setActiveInputType('single_switch')}
                className={`p-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  activeInputType === 'single_switch'
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MousePointerClick className="w-4 h-4 text-emerald-600" />
                <span>Single Switch</span>
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Preset Athlete Inputs
              </span>
              {PRESET_ACCESSIBILITY_INPUTS.map((p, idx) => (
                <button
                  key={p.label}
                  onClick={() => handleSelectPreset(idx)}
                  className={`w-full p-2.5 rounded-lg text-left text-xs border transition-all cursor-pointer ${
                    selectedPresetIdx === idx
                      ? highContrast
                        ? 'bg-yellow-400 text-black font-bold'
                        : 'bg-cyan-50/80 border-cyan-400 text-cyan-950 font-semibold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-semibold">{p.label}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{p.profile}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Large Hit-Target Single-Switch Trigger Board for Assistive Access */}
          <div
            className={`p-4 rounded-xl border ${
              highContrast
                ? 'bg-neutral-900 border-yellow-400 text-white'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Large Hit-Target Assistive Triggers
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Accessible Switches</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setCustomInputData('Single-Tap: Athlete requests 10-second posture reset & form verification.');
                  handleInterpret();
                }}
                className="p-3 rounded-xl border-2 border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex flex-col items-center justify-center gap-1 min-h-[64px] cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Verify Form</span>
              </button>

              <button
                onClick={() => {
                  setCustomInputData('Single-Tap: Athlete requests immediate seated alternative exercise.');
                  handleInterpret();
                }}
                className="p-3 rounded-xl border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex flex-col items-center justify-center gap-1 min-h-[64px] cursor-pointer"
              >
                <Sliders className="w-5 h-5 text-amber-600" />
                <span>Seated Variant</span>
              </button>

              <button
                onClick={() => {
                  setCustomInputData('Single-Tap: Athlete signals shoulder or joint pain.');
                  handleInterpret();
                }}
                className="p-3 rounded-xl border-2 border-red-400 bg-red-50 hover:bg-red-100 text-red-900 font-bold text-xs flex flex-col items-center justify-center gap-1 min-h-[64px] cursor-pointer col-span-2"
              >
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Emergency Rest / Joint Relief</span>
              </button>
            </div>
          </div>

          {/* Raw Telemetry Data Box */}
          <div
            className={`p-4 rounded-xl border ${
              highContrast
                ? 'bg-neutral-900 border-yellow-400 text-white'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Raw Input Stream / Transcription
            </label>
            <textarea
              rows={3}
              value={customInputData}
              onChange={(e) => setCustomInputData(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Right Column: Accessible Feedback & Visual Cue Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Translated Feedback Card */}
          <div
            id="accessibility-output-card"
            className={`p-5 rounded-2xl border transition-all ${
              highContrast
                ? 'bg-black border-yellow-400 text-yellow-300'
                : 'bg-cyan-50/60 border-cyan-300 text-slate-900 shadow-sm'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-cyan-200/60">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-600 text-white">
                  <Accessibility className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Inclusive Instructor Interpretation
                  </h3>
                  <span className="text-xs font-semibold text-slate-800">
                    Direct, Fluff-Free Guidance
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => voiceCoach.speak(result.actionableFeedback, 'urgent')}
                  title="Read aloud via Speech Synthesis"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-3 text-sm">
              {/* Detected Input */}
              <div className="p-3 rounded-xl bg-white/90 border border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Detected Non-Verbal Intent
                </div>
                <div className="font-semibold text-slate-900 leading-snug">
                  {result.detectedInput}
                </div>
              </div>

              {/* Interpretation */}
              <div className="p-3 rounded-xl bg-white/90 border border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Empathetic Physiological Interpretation
                </div>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {result.interpretation}
                </p>
              </div>

              {/* Actionable Feedback */}
              <div className="p-3.5 rounded-xl bg-white border border-cyan-300 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-800">
                    Actionable Guidance & Adaptation
                  </span>
                  <span className="text-[10px] text-slate-400">Immediate Action</span>
                </div>
                <p className="text-slate-900 font-bold text-sm sm:text-base leading-relaxed">
                  {result.actionableFeedback}
                </p>
              </div>

              {/* Visual Cue Banner */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-900 to-blue-900 text-white">
                <div className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider mb-0.5">
                  High-Visibility Visual Cue
                </div>
                <div className="font-mono font-extrabold text-sm sm:text-base tracking-wide">
                  {result.visualCue}
                </div>
              </div>

              {/* Safety Note */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold">Safety First Directive: </span>
                  <span>{result.safetyNote}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Sign Language & Haptic Guidance Reference */}
          <div
            className={`p-4 rounded-xl border ${
              highContrast
                ? 'bg-neutral-900 border-yellow-400 text-white'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Accessibility Quick Reference Cards
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                  <Hand className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Sign Gloss</span>
                </div>
                <p className="text-xs font-mono text-slate-600">
                  {result.signGloss || 'PAUSE • REST • CHECK-ALIGN'}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                  <Eye className="w-3.5 h-3.5 text-purple-600" />
                  <span>Visual Pacer</span>
                </div>
                <p className="text-xs text-slate-600">
                  Cadence pulses with high-contrast borders for hearing-impaired.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Haptic Alert</span>
                </div>
                <p className="text-xs text-slate-600">
                  Screen perimeter flash fires when compensation is detected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
