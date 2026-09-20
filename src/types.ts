export type CoreMode = 'pose_supervisor' | 'nutrition_analyst' | 'biometric_coach' | 'accessibility_assistant';

export type InjuryRiskLevel = 'Low' | 'Moderate' | 'High';

export interface PoseAnalysisResult {
  jointMechanicsAlert: string;
  repCount: string;
  correction: string;
  injuryRisk: string;
  riskLevel: InjuryRiskLevel;
  kineticFormScore: number;
  identifiedJointErrors: string[];
  safeJoints: string[];
}

export interface MacroEstimate {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  calories: number;
  hydrationMl: number;
}

export interface NutritionAnalysisResult {
  identifiedFood: string;
  macroEstimateText: string;
  macros: MacroEstimate;
  metabolicInsight: string;
  hydrationTip: string;
  energyForecast: {
    hour: string;
    level: number; // 0-100
    status: string;
  }[];
  recoveryAction: string;
}

export interface MicroPlanStep {
  order: number;
  phase: 'Mobility' | 'Circuit' | 'Breathwork' | 'Cooldown' | 'Strength';
  durationMins: number;
  title: string;
  description: string;
  exercises?: {
    name: string;
    workSec: number;
    restSec: number;
    repsOrNotes?: string;
  }[];
}

export interface BiometricPlanResult {
  biometricStatus: string;
  availableWindow: string;
  rawPlanText: string;
  steps: MicroPlanStep[];
  metabolicRecommendation: string;
  intensityScale: 'Low' | 'Moderate' | 'High' | 'Active Recovery';
}

export interface AccessibilityResult {
  detectedInput: string;
  interpretation: string;
  actionableFeedback: string;
  safetyNote: string;
  visualCue: string;
  signGloss?: string;
}

export interface UserFitnessProfile {
  level: number;
  xp: number;
  nextLevelXp: number;
  streakDays: number;
  formPrecisionAvg: number;
  totalRepsSupervised: number;
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
  }[];
}
