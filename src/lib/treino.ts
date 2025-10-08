export interface Exercise {
  name: string;
  reps: string;
  link?: string;
}

export interface Day {
  name: string;
  warmup?: string;
  warmupLink?: string;
  exercises: Exercise[];
  cooldown?: string;
  cooldownLinks?: { [key: string]: string };
}

export interface Variation {
  days: Day[];
}

export interface ExerciseProgress {
  name: string;
  weight?: string;
  completed: boolean;
  date: string;
}

export interface DayProgress {
  dayIndex: number;
  date: string;
  completed: boolean;
  exercises: ExerciseProgress[];
}

export const treino: Variation = {
  days: [
    {
      name: "A - UPPER 1 (PUSH DOMINANTE): Peito + Ombros + Tríceps",
      warmup: "Aquecimento: 8-10 min cardio leve + mobilidade de ombros",
      exercises: [
        { name: "Supino com halteres (pegada neutra)", reps: "3×8-10" },
        { name: "Desenvolvimento com halteres", reps: "3×8-10" },
        { name: "Flexões com variações", reps: "2×10-15" },
        { name: "Tríceps na polia (corda)", reps: "3×10-12" },
        { name: "Elevação lateral", reps: "2×12-15" },
        { name: "Prancha frontal", reps: "3×30-45s" },
      ],
    },
    {
      name: "B - LOWER 1 (QUAD DOMINANTE): Quadríceps + Glúteos + Power",
      warmup: "Aquecimento: 10 min bike/esteira + mobilidade de quadril",
      exercises: [
        { name: "Agachamento livre", reps: "3×8-10" },
        { name: "Leg press", reps: "3×10-12" },
        { name: "Squat jumps", reps: "3×8-10" },
        { name: "Lunges alternados", reps: "2×12 cada perna" },
        { name: "Panturrilha em pé", reps: "3×15" },
        { name: "Prancha lateral", reps: "2×30s cada lado" },
      ],
    },
    {
      name: "C - UPPER 2 (PULL DOMINANTE): Costas + Bíceps + Posterior",
      warmup: "Aquecimento: 8-10 min cardio leve + mobilidade escapular",
      exercises: [
        { name: "Pull-ups ou puxada frontal", reps: "3×8-10" },
        { name: "Remada curvada com barra", reps: "3×8-10" },
        { name: "Remada unilateral com halter", reps: "2×10-12 cada braço" },
        { name: "Face pulls (polia alta)", reps: "3×12-15" },
        { name: "Rosca direta", reps: "2×10-12" },
        { name: "Russian twists", reps: "2×20 cada lado" },
      ],
    },
    {
      name: "D - LOWER 2 (HIP DOMINANTE): Posteriores + Glúteos + Cadeia posterior",
      warmup: "Aquecimento: 10 min cardio leve + mobilidade de quadril",
      exercises: [
        { name: "Levantamento terra (Romanian)", reps: "3×8-10" },
        { name: "Hip thrust ou glute bridge", reps: "3×10-12" },
        { name: "Stiff leg deadlift", reps: "2×10-12" },
        { name: "Afundo reverso", reps: "2×12 cada perna" },
        { name: "Panturrilha sentado", reps: "2×15" },
        { name: "Superman", reps: "2×12" },
      ],
    },
    {
      name: "E - CORE INTENSO + SHOULDERS + RECOVERY: Core máximo + Prevenção + Mobilidade",
      warmup: "Aquecimento: 8 min mobilidade articular completa",
      exercises: [
        { name: "Mountain climbers", reps: "3×20" },
        { name: "Dead bug", reps: "3×10 cada lado" },
        { name: "Medicine ball slams", reps: "3×10" },
        { name: "Y-raises com halteres leves", reps: "2×12-15" },
        {
          name: "Rotação externa/interna com elástico",
          reps: "2×15 cada direção",
        },
        { name: "Pallof press ou anti-rotação", reps: "2×12 cada lado" },
      ],
      cooldown:
        "Cooldown: 15 min alongamento focado: ombros + quadril + coluna",
    },
  ],
};

export function getCurrentVariation(): Variation {
  return treino;
}

export function getTodayWorkout(): Day | null {
  const variation = getCurrentVariation();
  const dayIndex = getNextWorkoutDay();
  if (dayIndex >= variation.days.length) return null;
  return variation.days[dayIndex];
}

export function getCurrentDayIndex(): number {
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  return today === 0 ? 6 : today - 1; // Adjust to 0 = Monday, 6 = Sunday
}

export function getNextWorkoutDay(): number {
  const progress = getProgress();
  const today = new Date().toDateString();
  const currentDayIndex = getCurrentDayIndex();

  // Check if today was completed
  const todayProgress = progress.find((p) => p.date === today);
  if (todayProgress && todayProgress.completed) {
    // If today was completed, move to next day
    return (currentDayIndex + 1) % 5; // 5 days in ABCDE program
  }

  // If today wasn't completed, stay on current day
  return currentDayIndex;
}

export function getProgress(): DayProgress[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("workout-progress");
  return stored ? JSON.parse(stored) : [];
}

export function saveProgress(progress: DayProgress[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("workout-progress", JSON.stringify(progress));
}

export function updateExerciseProgress(
  dayIndex: number,
  exerciseName: string,
  weight?: string,
  completed?: boolean
): void {
  const progress = getProgress();
  const today = new Date().toDateString();

  let dayProgress = progress.find(
    (p) => p.date === today && p.dayIndex === dayIndex
  );
  if (!dayProgress) {
    dayProgress = {
      dayIndex,
      date: today,
      completed: false,
      exercises: [],
    };
    progress.push(dayProgress);
  }

  let exerciseProgress = dayProgress.exercises.find(
    (e) => e.name === exerciseName
  );
  if (!exerciseProgress) {
    exerciseProgress = {
      name: exerciseName,
      weight: "",
      completed: false,
      date: today,
    };
    dayProgress.exercises.push(exerciseProgress);
  }

  if (weight !== undefined) exerciseProgress.weight = weight;
  if (completed !== undefined) exerciseProgress.completed = completed;

  // Check if all exercises are completed
  dayProgress.completed = dayProgress.exercises.every((e) => e.completed);

  saveProgress(progress);
}

export function getExerciseProgress(
  dayIndex: number,
  exerciseName: string
): ExerciseProgress | null {
  const progress = getProgress();
  const today = new Date().toDateString();

  const dayProgress = progress.find(
    (p) => p.date === today && p.dayIndex === dayIndex
  );
  if (!dayProgress) return null;

  return dayProgress.exercises.find((e) => e.name === exerciseName) || null;
}

export function getDayProgress(dayIndex: number): DayProgress | null {
  const progress = getProgress();
  const today = new Date().toDateString();

  return (
    progress.find((p) => p.date === today && p.dayIndex === dayIndex) || null
  );
}
