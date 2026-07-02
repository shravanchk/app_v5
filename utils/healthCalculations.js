// Shared math for the health & fitness calculators.
// All functions are pure; heights in cm, weights in kg unless noted.

export const LB_PER_KG = 2.2046226218;
export const CM_PER_IN = 2.54;

export const kgFromLb = (lb) => lb / LB_PER_KG;
export const lbFromKg = (kg) => kg * LB_PER_KG;
export const cmFromFtIn = (ft, inch) => ((Number(ft) || 0) * 12 + (Number(inch) || 0)) * CM_PER_IN;
export const cmFromIn = (inch) => (Number(inch) || 0) * CM_PER_IN;

// ---------------------------------------------------------------- BMI
export const calculateBMI = (weightKg, heightCm) => {
  const m = heightCm / 100;
  if (!weightKg || !m) return null;
  return weightKg / (m * m);
};

// WHO adult categories.
export const BMI_BANDS = [
  { label: 'Underweight', min: 0, max: 18.5, tone: 'sky' },
  { label: 'Normal weight', min: 18.5, max: 25, tone: 'emerald' },
  { label: 'Overweight', min: 25, max: 30, tone: 'amber' },
  { label: 'Obesity', min: 30, max: 45, tone: 'rose' }
];

export const bmiCategory = (bmi) =>
  BMI_BANDS.find((b) => bmi < b.max) || BMI_BANDS[BMI_BANDS.length - 1];

// Healthy-weight range (BMI 18.5–24.9) for a given height, in kg.
export const healthyWeightRangeKg = (heightCm) => {
  const m = heightCm / 100;
  return { min: 18.5 * m * m, max: 24.9 * m * m };
};

// ---------------------------------------------------------------- BMR / TDEE
// Mifflin-St Jeor (1990) — the ADA-preferred estimate for resting energy.
export const bmrMifflin = ({ sex, weightKg, heightCm, age }) =>
  10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);

// Revised Harris-Benedict (Roza & Shizgal, 1984) — shown for comparison.
export const bmrHarrisBenedict = ({ sex, weightKg, heightCm, age }) =>
  sex === 'male'
    ? 13.397 * weightKg + 4.799 * heightCm - 5.677 * age + 88.362
    : 9.247 * weightKg + 3.098 * heightCm - 4.330 * age + 447.593;

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)', factor: 1.2 },
  { value: 'light', label: 'Lightly active (1-3 days/week)', factor: 1.375 },
  { value: 'moderate', label: 'Moderately active (3-5 days/week)', factor: 1.55 },
  { value: 'active', label: 'Very active (6-7 days/week)', factor: 1.725 },
  { value: 'extra', label: 'Extra active (physical job + training)', factor: 1.9 }
];

export const tdeeFromBmr = (bmr, activityValue) => {
  const level = ACTIVITY_LEVELS.find((l) => l.value === activityValue) || ACTIVITY_LEVELS[0];
  return bmr * level.factor;
};

// ~7700 kcal per kg of body weight → ±500 kcal/day ≈ 0.45 kg (1 lb) per week.
export const CALORIE_GOALS = [
  { id: 'lose1', label: 'Lose 1 lb / 0.45 kg per week', delta: -500, tone: 'sky' },
  { id: 'lose05', label: 'Lose 0.5 lb / 0.25 kg per week', delta: -250, tone: 'teal' },
  { id: 'maintain', label: 'Maintain weight', delta: 0, tone: 'emerald' },
  { id: 'gain05', label: 'Gain 0.5 lb / 0.25 kg per week', delta: 250, tone: 'amber' },
  { id: 'gain1', label: 'Gain 1 lb / 0.45 kg per week', delta: 500, tone: 'rose' }
];

// ---------------------------------------------------------------- Body fat (US Navy)
// Hodgdon & Beckett (1984) circumference method. Inputs in cm.
export const bodyFatNavy = ({ sex, heightCm, neckCm, waistCm, hipCm }) => {
  if (!heightCm || !neckCm || !waistCm) return null;
  if (sex === 'male') {
    if (waistCm - neckCm <= 0) return null;
    return 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
  }
  if (!hipCm || waistCm + hipCm - neckCm <= 0) return null;
  return 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
};

// ACE body-fat categories (percent).
export const BODY_FAT_BANDS = {
  male: [
    { label: 'Essential fat', min: 2, max: 6, tone: 'sky' },
    { label: 'Athletes', min: 6, max: 14, tone: 'emerald' },
    { label: 'Fitness', min: 14, max: 18, tone: 'teal' },
    { label: 'Average', min: 18, max: 25, tone: 'amber' },
    { label: 'Obese', min: 25, max: 45, tone: 'rose' }
  ],
  female: [
    { label: 'Essential fat', min: 10, max: 14, tone: 'sky' },
    { label: 'Athletes', min: 14, max: 21, tone: 'emerald' },
    { label: 'Fitness', min: 21, max: 25, tone: 'teal' },
    { label: 'Average', min: 25, max: 32, tone: 'amber' },
    { label: 'Obese', min: 32, max: 50, tone: 'rose' }
  ]
};

export const bodyFatCategory = (percent, sex) => {
  const bands = BODY_FAT_BANDS[sex] || BODY_FAT_BANDS.male;
  return bands.find((b) => percent < b.max) || bands[bands.length - 1];
};

// ---------------------------------------------------------------- Cycle / pregnancy dates
const DAY_MS = 24 * 60 * 60 * 1000;
export const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);

// Predict the next `count` cycles from the last period start.
// Ovulation ≈ 14 days before the NEXT period; fertile window ≈ ovulation −5 … +1.
export const predictCycles = ({ lastPeriodStart, cycleLength, periodLength, count = 3 }) => {
  const cycles = [];
  for (let i = 1; i <= count; i += 1) {
    const start = addDays(lastPeriodStart, cycleLength * i);
    const ovulation = addDays(start, -14);
    cycles.push({
      periodStart: start,
      periodEnd: addDays(start, periodLength - 1),
      ovulation,
      fertileStart: addDays(ovulation, -5),
      fertileEnd: addDays(ovulation, 1)
    });
  }
  return cycles;
};

// Naegele's rule with cycle-length adjustment: LMP + 280 days + (cycle − 28).
export const dueDateFromLMP = (lmp, cycleLength = 28) => addDays(lmp, 280 + (cycleLength - 28));
// Conception ≈ 266 days before the due date.
export const dueDateFromConception = (conception) => addDays(conception, 266);

export const gestationalAge = (lmp, onDate = new Date()) => {
  const days = Math.floor((onDate.getTime() - lmp.getTime()) / DAY_MS);
  return { weeks: Math.floor(days / 7), days: days % 7, totalDays: days };
};
