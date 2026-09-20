import {
  PoseAnalysisResult,
  NutritionAnalysisResult,
  BiometricPlanResult,
  AccessibilityResult,
} from '../types';

export async function analyzePoseForm(payload: {
  exercise: string;
  frameBase64?: string;
  jointAngles?: Record<string, number | string>;
  repCount: number;
  targetReps: number;
  telemetryNotes?: string;
}): Promise<PoseAnalysisResult> {
  const res = await fetch('/api/trainify/pose-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Pose analysis failed: ${res.statusText}`);
  }
  return res.json();
}

export async function analyzeNutritionMeal(payload: {
  imageBase64?: string;
  mealNotes?: string;
  currentPhase?: string;
}): Promise<NutritionAnalysisResult> {
  const res = await fetch('/api/trainify/nutrition-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Nutrition analysis failed: ${res.statusText}`);
  }
  return res.json();
}

export async function generateAdaptiveWorkout(payload: {
  sleepScore: number;
  hrvStress: string;
  availableMinutes: number;
  dnaProfile: string;
  fatigueNotes?: string;
}): Promise<BiometricPlanResult> {
  const res = await fetch('/api/trainify/adaptive-micro-workout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Adaptive workout failed: ${res.statusText}`);
  }
  return res.json();
}

export async function interpretAccessibilityInput(payload: {
  inputType: 'sign_language' | 'bci_telemetry' | 'single_switch';
  inputData: string;
  athleteProfile?: string;
}): Promise<AccessibilityResult> {
  const res = await fetch('/api/trainify/accessibility-assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Accessibility assist failed: ${res.statusText}`);
  }
  return res.json();
}
