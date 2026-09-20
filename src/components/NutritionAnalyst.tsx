import React, { useState, useRef } from 'react';
import { NutritionAnalysisResult } from '../types';
import { analyzeNutritionMeal } from '../services/api';
import {
  Upload,
  Camera,
  Utensils,
  Droplets,
  Flame,
  Zap,
  CheckCircle2,
  Sparkles,
  Info,
  Clock,
  HeartPulse,
} from 'lucide-react';

interface NutritionAnalystProps {
  highContrast: boolean;
}

interface MealPreset {
  name: string;
  phase: string;
  imageHint: string;
  result: NutritionAnalysisResult;
}

const PRESET_MEALS: MealPreset[] = [
  {
    name: 'Scenario B: Post-Workout Lunch',
    phase: 'Post-Workout Recovery (30-60m window)',
    imageHint: 'Chicken breast, quinoa, broccoli, sliced avocado',
    result: {
      identifiedFood: 'Grilled chicken breast, quinoa bowl, steamed broccoli, and avocado slices',
      macroEstimateText: '42g Protein | 38g Carbs | 14g Fat | ~440 kcal',
      macros: {
        proteinGrams: 42,
        carbsGrams: 38,
        fatGrams: 14,
        calories: 440,
        hydrationMl: 500,
      },
      metabolicInsight: 'High-protein, clean carb ratio optimal for glycogen replenishment.',
      hydrationTip: 'Drink 500 ml water to restore electrolyte fluid balance.',
      energyForecast: [
        { hour: '+1h', level: 55, status: 'Active Gastric Breakdown' },
        { hour: '+2h', level: 92, status: 'Peak Amino Acid & Glycogen Uptake' },
        { hour: '+3h', level: 86, status: 'Sustained Cellular Repair' },
        { hour: '+4h', level: 74, status: 'Stable Glycemic Plateau' },
      ],
      recoveryAction: 'Engage in 15 minutes of elevated legs or diaphragmatic breathing to enhance splanchnic blood flow and digestion.',
    },
  },
  {
    name: 'Pre-Workout Glycogen Primer',
    phase: 'Pre-Workout Window (90 mins prior)',
    imageHint: 'Oatmeal, banana, whey isolate, cinnamon, almond butter',
    result: {
      identifiedFood: 'Rolled oats porridge with sliced banana, whey protein, and light almond butter',
      macroEstimateText: '28g Protein | 62g Carbs | 9g Fat | ~430 kcal',
      macros: {
        proteinGrams: 28,
        carbsGrams: 62,
        fatGrams: 9,
        calories: 430,
        hydrationMl: 400,
      },
      metabolicInsight: 'Complex polysaccharide foundation ensures sustained glucose release without reactive hypoglycemia.',
      hydrationTip: 'Consume 400 ml water with a pinch of Himalayan salt for cellular osmolarity.',
      energyForecast: [
        { hour: '+1h', level: 85, status: 'Rising Muscle Glycogen Availability' },
        { hour: '+2h', level: 98, status: 'Max Ergogenic Work Capacity' },
        { hour: '+3h', level: 68, status: 'Post-Training Depletion Transition' },
        { hour: '+4h', level: 50, status: 'Refueling Window Required' },
      ],
      recoveryAction: 'Begin warm-up 60 minutes after consumption to align peak blood glucose with workout working sets.',
    },
  },
  {
    name: 'Rest-Day Anti-Inflammatory Dinner',
    phase: 'Evening Recovery & Tissue Regeneration',
    imageHint: 'Wild salmon, roasted sweet potato wedges, asparagus, olive oil drizzle',
    result: {
      identifiedFood: 'Pan-seared wild salmon, roasted sweet potato, and grilled asparagus spears',
      macroEstimateText: '38g Protein | 32g Carbs | 19g Fat | ~460 kcal',
      macros: {
        proteinGrams: 38,
        carbsGrams: 32,
        fatGrams: 19,
        calories: 460,
        hydrationMl: 350,
      },
      metabolicInsight: 'Rich in EPA/DHA omega-3 fatty acids to suppress delayed-onset muscle soreness (DOMS) and systemic CRP.',
      hydrationTip: 'Drink 350 ml chamomile or tart cherry infusion for melatonin synergy.',
      energyForecast: [
        { hour: '+1h', level: 45, status: 'Slow Lipid Emulsification' },
        { hour: '+2h', level: 60, status: 'Nocturnal Anabolic Window' },
        { hour: '+3h', level: 50, status: 'Growth Hormone Secretion Phase' },
        { hour: '+4h', level: 40, status: 'Restorative REM Sleep State' },
      ],
      recoveryAction: 'Avoid blue light exposure after this meal to support natural overnight insulin sensitivity and somatotropin release.',
    },
  },
];

export const NutritionAnalyst: React.FC<NutritionAnalystProps> = ({ highContrast }) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mealNotes, setMealNotes] = useState<string>('Post-Workout Lunch');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [result, setResult] = useState<NutritionAnalysisResult>(PRESET_MEALS[0].result);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeMeal = async () => {
    setIsScanning(true);
    try {
      const data = await analyzeNutritionMeal({
        imageBase64: previewImage || undefined,
        mealNotes,
        currentPhase: 'Post-Workout Recovery',
      });
      setResult(data);
    } catch (err) {
      console.error('Failed nutrition scan:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    setResult(PRESET_MEALS[idx].result);
    setMealNotes(PRESET_MEALS[idx].name);
    setPreviewImage(null);
  };

  // Macro calculation percentages
  const totalMacroGrams =
    result.macros.proteinGrams + result.macros.carbsGrams + result.macros.fatGrams || 1;
  const proteinPct = Math.round((result.macros.proteinGrams / totalMacroGrams) * 100);
  const carbsPct = Math.round((result.macros.carbsGrams / totalMacroGrams) * 100);
  const fatPct = Math.round((result.macros.fatGrams / totalMacroGrams) * 100);

  return (
    <div id="nutrition-analyst-container" className="space-y-6">
      {/* Top Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
          highContrast
            ? 'bg-neutral-900 border-yellow-400 text-white'
            : 'bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white border-emerald-900 shadow-md'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Mode 2: Nutritional & Metabolic Analyst
            </span>
            <span className="text-xs text-slate-400">Computer Vision & Biomarker Forecast</span>
          </div>
          <h2 className="text-lg font-bold">Meal Macro Scanning & Energy Forecasting</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Estimates macronutrient distribution, predicts post-workout energy availability, and recommends precise hydration strategies.
          </p>
        </div>

        <button
          id="trigger-nutrition-scan-btn"
          onClick={handleAnalyzeMeal}
          disabled={isScanning}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 flex items-center gap-2 cursor-pointer transition-all shadow"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          {isScanning ? 'Analyzing Meal...' : 'Analyze Meal with Gemini'}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Preset Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* File Drag & Drop Box */}
          <div
            id="meal-upload-box"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              highContrast
                ? 'bg-neutral-900 border-yellow-400 text-white'
                : 'bg-slate-50 border-slate-300 hover:bg-emerald-50/50 hover:border-emerald-400 text-slate-700'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {previewImage ? (
              <div className="space-y-3 w-full">
                <div className="relative rounded-xl overflow-hidden aspect-video bg-black max-h-48 mx-auto">
                  <img
                    src={previewImage}
                    alt="Uploaded meal"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-[10px] text-white rounded font-mono">
                    Image Loaded
                  </span>
                </div>
                <p className="text-xs text-slate-500">Click or drag another image to replace</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Upload or Drop Meal / Beverage Photo
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Supports JPG, PNG or live camera snapshots
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Context Notes */}
          <div
            className={`p-4 rounded-xl border ${
              highContrast
                ? 'bg-neutral-900 border-yellow-400 text-white'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Workout Timing & Meal Context
            </label>
            <input
              type="text"
              value={mealNotes}
              onChange={(e) => setMealNotes(e.target.value)}
              placeholder="e.g. Post-Workout Lunch, High-intensity leg day"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Preset Meals Showcase */}
          <div
            className={`p-4 rounded-xl border ${
              highContrast
                ? 'bg-neutral-900 border-yellow-400 text-white'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Select Preset Meal Scenario
            </h3>
            <div className="space-y-2">
              {PRESET_MEALS.map((preset, idx) => (
                <button
                  key={preset.name}
                  onClick={() => handleSelectPreset(idx)}
                  className={`w-full p-3 rounded-lg text-left text-xs border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    selectedPresetIndex === idx
                      ? highContrast
                        ? 'bg-yellow-400 text-black font-bold'
                        : 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold">{preset.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{preset.imageHint}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 shrink-0">
                    {preset.result.macros.calories} kcal
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Scenario B Output Card & Metabolic Insights (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* EXACT SCENARIO B OUTPUT CARD AS MANDATED IN USER SPECIFICATION */}
          <div
            id="scenario-b-output-card"
            className={`p-5 rounded-2xl border transition-all ${
              highContrast
                ? 'bg-black border-yellow-400 text-yellow-300'
                : 'bg-emerald-50/60 border-emerald-300 text-slate-900 shadow-sm'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-200/60">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                  <Utensils className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Nutritional & Metabolic Verdict
                  </h3>
                  <span className="text-xs font-semibold text-slate-800">
                    Scenario B Output Format
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-emerald-700">
                  ~{result.macros.calories} kcal
                </span>
              </div>
            </div>

            {/* EXACT FORMAT FIELDS */}
            <div className="space-y-3 text-sm">
              {/* Identified Food */}
              <div className="p-3 rounded-xl bg-white/90 border border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Identified Food
                </div>
                <div className="font-semibold text-slate-900 leading-snug">
                  {result.identifiedFood}
                </div>
              </div>

              {/* Macro Estimate */}
              <div className="p-3 rounded-xl bg-white/90 border border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Macro Estimate
                </div>
                <div className="font-mono font-bold text-emerald-800 text-sm sm:text-base">
                  {result.macroEstimateText}
                </div>

                {/* Macro distribution bar */}
                <div className="mt-3">
                  <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100">
                    <div
                      style={{ width: `${proteinPct}%` }}
                      className="bg-blue-500 h-full"
                      title={`Protein: ${result.macros.proteinGrams}g (${proteinPct}%)`}
                    />
                    <div
                      style={{ width: `${carbsPct}%` }}
                      className="bg-amber-500 h-full"
                      title={`Carbs: ${result.macros.carbsGrams}g (${carbsPct}%)`}
                    />
                    <div
                      style={{ width: `${fatPct}%` }}
                      className="bg-rose-500 h-full"
                      title={`Fats: ${result.macros.fatGrams}g (${fatPct}%)`}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] mt-1.5 text-slate-600 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
                      Protein: {result.macros.proteinGrams}g ({proteinPct}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                      Carbs: {result.macros.carbsGrams}g ({carbsPct}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                      Fats: {result.macros.fatGrams}g ({fatPct}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Metabolic Insight */}
              <div className="p-3 rounded-xl bg-white/90 border border-slate-200">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Metabolic Insight</span>
                </div>
                <p className="font-medium text-slate-800 leading-relaxed">
                  {result.metabolicInsight}
                </p>
              </div>

              {/* Hydration Tip */}
              <div className="p-3 rounded-xl bg-cyan-50/80 border border-cyan-200 text-cyan-950">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-800 mb-0.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Hydration Tip</span>
                </div>
                <p className="font-semibold leading-relaxed">
                  {result.hydrationTip}
                </p>
              </div>
            </div>
          </div>

          {/* Energy Availability Forecast Timeline */}
          <div
            className={`p-4 rounded-xl border ${
              highContrast
                ? 'bg-neutral-900 border-yellow-400 text-white'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Metabolic Energy Availability Forecast (0–4 Hours)
                </h4>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">Glycogen Sync</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {result.energyForecast.map((fc, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/80 text-center"
                >
                  <div className="text-[10px] font-mono text-slate-400 font-bold">{fc.hour}</div>
                  <div className="text-base font-extrabold text-slate-800 my-0.5">
                    {fc.level}%
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                    {fc.status}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600">
              <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">Actionable Recovery Protocol: </span>
                <span>{result.recoveryAction}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
